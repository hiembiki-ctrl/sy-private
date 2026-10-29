"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { GlobeIcon, MinusIcon, PlusIcon, XIcon } from "lucide-react";

import { requestLogin } from "@/components/auth/auth-control";
import { AddPlaceDialog } from "@/components/itinerary/add-place-dialog";
import { useSavedItineraries } from "@/components/saved/use-saved-itineraries";
import { useCurrentWeather } from "@/components/weather/use-current-weather";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  CITIES,
  DAY_OPTIONS,
  formatLatitude,
  formatRecommendedDays,
  getCity,
  getItinerary,
  type City,
  type DayPlan,
  type Days,
  type ItineraryItem,
} from "@/lib/cities";
import { buildDayRoute, formatDistance } from "@/lib/route";
import { findSaved } from "@/lib/saved-itineraries";
import { useSessionEmail } from "@/lib/supabase/use-session-email";

// WebGL 지구본은 브라우저에서만 그릴 수 있다.
const CityGlobe = dynamic(() => import("@/components/city-globe"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

// 장소를 더 알아보고 싶은 사용자를 위해 도시 이름을 붙인 웹 검색 주소를 만든다.
function webSearchUrl(placeName: string, cityName: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${cityName} ${placeName}`)}`;
}

export function CityExplorer({
  cities = CITIES,
  popularIds = [],
}: {
  cities?: City[];
  /** 요즘 많이 찾는 도시. 도시 버튼에 배지로 보인다. */
  popularIds?: string[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState<Days>(1);
  const email = useSessionEmail();
  const { saved, error, save, updatePlan, remove } = useSavedItineraries(email);
  // 화면에서만 고친 일정. 저장하기 전에는 이 화면에만 적용된다.
  const [draft, setDraft] = useState<{ key: string; plans: DayPlan[] } | null>(null);
  const [addingDay, setAddingDay] = useState<number | null>(null);

  const city = selectedId ? getCity(selectedId, cities) : undefined;
  const savedItem = city ? findSaved(saved, city.id, days) : undefined;
  const planKey = `${selectedId}:${days}`;
  // 저장한 일정에 고친 장소 목록이 있으면 그것을, 없으면 도시 기본 일정을 보여 준다.
  const basePlans = city ? (savedItem?.plan ?? getItinerary(city.id, days, cities)) : [];
  const edited = draft?.key === planKey;
  const itinerary = edited ? draft.plans : basePlans;
  const { weather, loading: weatherLoading } = useCurrentWeather(city);
  // 지도에 그릴 일차. 도시를 바꾸면 1일차로 돌아가고, 일수를 줄여 사라진 일차는 마지막 일차로 맞춘다.
  const [mapFocus, setMapFocus] = useState<{ cityId: string; day: number } | null>(null);
  const dayRoutes = itinerary.map(buildDayRoute);
  const mapDay =
    mapFocus && mapFocus.cityId === selectedId ? Math.min(mapFocus.day, days) : 1;
  const mapRoute = dayRoutes[mapDay - 1]?.points ?? [];
  const totalKm = dayRoutes.reduce((sum, route) => sum + route.distanceKm, 0);

  function editPlans(change: (plans: DayPlan[]) => DayPlan[]) {
    setDraft({ key: planKey, plans: change(itinerary) });
  }
  function removeItem(dayIndex: number, name: string) {
    editPlans((plans) =>
      plans.map((plan, i) =>
        i === dayIndex ? { ...plan, items: plan.items.filter((item) => item.name !== name) } : plan,
      ),
    );
  }
  function addItem(dayIndex: number, item: ItineraryItem) {
    editPlans((plans) =>
      plans.map((plan, i) => (i === dayIndex ? { ...plan, items: [...plan.items, item] } : plan)),
    );
  }
  const planNames = itinerary.flatMap((plan) => plan.items.map((item) => item.name));
  // 이 도시에 있지만 지금 일정에는 없는 장소.
  const candidates = city
    ? [...city.days.flat(), ...city.nearby.flatMap((trip) => trip.items)].filter(
        (item) => !planNames.includes(item.name),
      )
    : [];

  // 저장에 성공하면 화면에서만 고친 내용을 비운다. 저장한 일정이 그 자리를 대신한다.
  async function saveCurrent() {
    if (!city) return;
    const ok = savedItem
      ? await updatePlan(savedItem.id, itinerary)
      : await save(city.id, days, edited ? itinerary : undefined);
    if (ok) setDraft(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-label="지구본" className="flex flex-col gap-3">
        <div className="h-[22rem] overflow-hidden rounded-xl bg-zinc-950 sm:h-[30rem] lg:h-[36rem]">
          <CityGlobe
            cities={cities}
            selectedId={selectedId}
            onSelect={setSelectedId}
            route={mapRoute}
          />
        </div>
        <div
          role="group"
          aria-label="도시 목록"
          className="flex max-h-40 flex-wrap gap-2 overflow-y-auto"
        >
          {cities.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={c.id === selectedId ? "default" : "outline"}
              aria-pressed={c.id === selectedId}
              onClick={() => setSelectedId(c.id)}
            >
              {c.name}
              {popularIds.includes(c.id) && (
                <Badge variant={c.id === selectedId ? "secondary" : "outline"}>인기</Badge>
              )}
            </Button>
          ))}
        </div>
      </section>

      <section aria-label="일정" className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {email && (
          <section aria-label="내 저장 일정">
            <Card>
              <CardHeader>
                <CardTitle>내 저장 일정</CardTitle>
              </CardHeader>
              <CardContent>
                {saved.length === 0 ? (
                  <p className="text-sm text-muted-foreground">아직 저장한 일정이 없어요.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {saved.map((item) => {
                      const label = `${getCity(item.cityId, cities)?.name ?? item.cityId} ${item.days}일`;
                      return (
                        <li key={item.id} className="flex items-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-r-none"
                            onClick={() => {
                              setSelectedId(item.cityId);
                              setDays(item.days);
                              setDraft(null);
                            }}
                          >
                            {label}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-l-none border-l-0"
                            aria-label={`${label} 삭제`}
                            onClick={() => remove(item.id)}
                          >
                            <XIcon />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        )}
        {city ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 className="font-heading text-2xl font-semibold">{city.name}</h2>
                </CardTitle>
                <CardDescription>
                  {city.country} · {formatLatitude(city.lat)} · {city.climate}, {city.bestSeason}
                </CardDescription>
                <p className="text-xs text-muted-foreground">
                  {formatRecommendedDays(city.recommendedDays)}
                </p>
                {weatherLoading ? (
                  <Skeleton className="h-4 w-32" aria-label="현재 날씨 불러오는 중" />
                ) : (
                  weather && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">지금 </span>
                      {weather.temperature}°C · {weather.description}
                    </p>
                  )
                )}
                {totalKm > 0 && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">총 이동 약 </span>
                    {formatDistance(totalKm)}
                    <span className="text-xs text-muted-foreground">
                      {" "}· 장소 사이 직선 거리 합계, 하루 안 방문 순서는 이동이 가장 짧게 정리
                    </span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <NativeSelect
                  aria-label="여행 일수"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value) as Days)}
                >
                  {DAY_OPTIONS.map((d) => (
                    <NativeSelectOption key={d} value={d}>
                      {d}일
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <div className="mt-3">
                  {email ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {savedItem && !edited ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => remove(savedItem.id)}
                        >
                          저장됨
                        </Button>
                      ) : (
                        <Button type="button" size="sm" onClick={saveCurrent}>
                          {savedItem ? "변경 저장" : "저장"}
                        </Button>
                      )}
                      {edited && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            고친 내용은 저장해야 남아요.
                          </span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(null)}>
                            되돌리기
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <Button type="button" size="sm" variant="outline" onClick={requestLogin}>
                      로그인하고 저장
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {itinerary.map((plan, planIndex) => {
              const route = dayRoutes[planIndex];
              return (
              <Card key={plan.day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>
                      {plan.destination
                        ? `${plan.day}일차 · 근교: ${plan.destination}`
                        : `${plan.day}일차`}
                    </span>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      aria-label={`${plan.day}일차에 장소 추가`}
                      title="장소 추가"
                      onClick={() => setAddingDay(plan.day)}
                    >
                      <PlusIcon />
                    </Button>
                  </CardTitle>
                  {route.points.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {route.distanceKm > 0 && <span>이동 약 {formatDistance(route.distanceKm)}</span>}
                      <Button
                        type="button"
                        size="sm"
                        variant={plan.day === mapDay ? "default" : "outline"}
                        aria-pressed={plan.day === mapDay}
                        onClick={() =>
                          selectedId && setMapFocus({ cityId: selectedId, day: plan.day })
                        }
                      >
                        지도에서 보기
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {plan.items.length === 0 && (
                    <p className="text-sm text-muted-foreground">이 일차에는 장소가 없어요.</p>
                  )}
                  <ol className="flex flex-col gap-4">
                    {plan.items.map((item, order) => (
                      <li key={item.name} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{order + 1}.</span>
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={item.kind === "명소" ? "secondary" : "outline"}>
                            {item.kind}
                          </Badge>
                          <a
                            href={webSearchUrl(item.name, city.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${item.name} 웹에서 더 알아보기`}
                            title="웹에서 더 알아보기"
                            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                          >
                            <GlobeIcon className="size-4" aria-hidden="true" />
                          </a>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`${item.name} 일정에서 빼기`}
                            title="일정에서 빼기"
                            onClick={() => removeItem(planIndex, item.name)}
                          >
                            <MinusIcon />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground underline underline-offset-2"
                          >
                            출처 보기
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              );
            })}
            <AddPlaceDialog
              day={addingDay}
              candidates={candidates}
              existingNames={planNames}
              onAdd={(item) => addingDay !== null && addItem(addingDay - 1, item)}
              onClose={() => setAddingDay(null)}
            />
          </>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>가고 싶은 도시를 눌러 보세요</EmptyTitle>
              <EmptyDescription>
                지구본을 돌려 도시를 누르면 바로 1~7일 일정이 나와요.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  );
}
