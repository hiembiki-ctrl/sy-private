"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { XIcon } from "lucide-react";

import { requestLogin } from "@/components/auth/auth-control";
import { useSavedItineraries } from "@/components/saved/use-saved-itineraries";
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
  type Days,
} from "@/lib/cities";
import { findSaved } from "@/lib/saved-itineraries";
import { useSessionEmail } from "@/lib/supabase/use-session-email";

// WebGL 지구본은 브라우저에서만 그릴 수 있다.
const CityGlobe = dynamic(() => import("@/components/city-globe"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function CityExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState<Days>(1);
  const email = useSessionEmail();
  const { saved, error, save, remove } = useSavedItineraries(email);

  const city = selectedId ? getCity(selectedId) : undefined;
  const itinerary = city ? getItinerary(city.id, days) : [];
  const savedItem = city ? findSaved(saved, city.id, days) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-label="지구본" className="flex flex-col gap-3">
        <div className="h-[22rem] overflow-hidden rounded-xl bg-zinc-950 sm:h-[30rem] lg:h-[36rem]">
          <CityGlobe cities={CITIES} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div role="group" aria-label="도시 목록" className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={c.id === selectedId ? "default" : "outline"}
              aria-pressed={c.id === selectedId}
              onClick={() => setSelectedId(c.id)}
            >
              {c.name}
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
                      const label = `${getCity(item.cityId)?.name ?? item.cityId} ${item.days}일`;
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
                    <Button
                      type="button"
                      size="sm"
                      variant={savedItem ? "secondary" : "default"}
                      onClick={() => (savedItem ? remove(savedItem.id) : save(city.id, days))}
                    >
                      {savedItem ? "저장됨" : "저장"}
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="outline" onClick={requestLogin}>
                      로그인하고 저장
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {itinerary.map((plan) => (
              <Card key={plan.day}>
                <CardHeader>
                  <CardTitle>
                    {plan.destination
                      ? `${plan.day}일차 · 근교: ${plan.destination}`
                      : `${plan.day}일차`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="flex flex-col gap-4">
                    {plan.items.map((item, order) => (
                      <li key={item.name} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{order + 1}.</span>
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={item.kind === "명소" ? "secondary" : "outline"}>
                            {item.kind}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
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
