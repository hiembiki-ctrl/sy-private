import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { CityExplorer } from "@/components/city-explorer";
import { CITIES, type City, type ItineraryItem } from "@/lib/cities";
import type { RoutePoint } from "@/lib/route";

// 지도는 jsdom에서 그릴 수 없으므로, 받은 동선만 화면에 적어 두는 가짜 지구본으로 바꿔 끼운다.
vi.mock("@/components/city-globe", () => ({
  default: ({
    cities,
    onSelect,
    route = [],
  }: {
    cities: { id: string }[];
    onSelect: (id: string) => void;
    route?: RoutePoint[];
  }) => (
    <div>
      {cities.map((c) => (
        <button key={c.id} type="button" data-testid={`point-${c.id}`} onClick={() => onSelect(c.id)} />
      ))}
      <output data-testid="route">{route.map((p) => `${p.number}:${p.name}`).join(",")}</output>
    </div>
  ),
}));

vi.mock("@/lib/supabase/use-session-email", () => ({ useSessionEmail: () => null }));
vi.mock("@/lib/weather", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/weather")>()),
  fetchCurrentWeather: async () => null,
}));

const at = (name: string, lat: number, lng: number): ItineraryItem => ({
  name,
  summary: "설명",
  kind: "명소",
  lat,
  lng,
});
const bare = (name: string): ItineraryItem => ({ name, summary: "설명", kind: "명소" });

const paris = CITIES.find((c) => c.id === "paris")!;
// 1일차: 에펠탑 → 좌표 없는 장소 → 루브르(약 3.2km), 2일차: 두 곳(약 3.0km 이상), 근교는 좌표 없음.
const withCoords: City = {
  ...paris,
  days: [
    [at("에펠탑", 48.8584, 2.2945), bare("좌표 없는 곳"), at("루브르", 48.8606, 2.3376)],
    [at("몽마르트르", 48.8867, 2.3431), at("오르세", 48.86, 2.3266)],
    [bare("가"), bare("나")],
  ],
};

test("좌표가 있는 일차는 지도에 번호 핀 동선을 보내고 km와 mile로 거리를 보여 준다", async () => {
  const user = userEvent.setup();
  render(<CityExplorer cities={[withCoords]} />);
  await user.click(await screen.findByTestId("point-paris"));

  expect(screen.getByTestId("route")).toHaveTextContent("1:에펠탑,3:루브르");
  expect(screen.getByText(/이동 약 3\.\d km \(2\.\d mi\)/)).toBeInTheDocument();
  expect(screen.getByText(/총 이동 약/)).toBeInTheDocument();
});

test("일차를 바꿔 지도에서 보면 그 일차의 동선이 지도로 가고, 총 이동 거리는 보이는 일차의 합이다", async () => {
  const user = userEvent.setup();
  render(<CityExplorer cities={[withCoords]} />);
  await user.click(await screen.findByTestId("point-paris"));
  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "2");

  const total = screen.getByText(/총 이동 약/).parentElement!.textContent!;
  const km = Number(/([\d.]+) km/.exec(total)![1]);
  const dayKm = [...document.querySelectorAll("span")]
    .map((el) => /이동 약 ([\d.]+) km/.exec(el.textContent ?? "")?.[1])
    .filter(Boolean)
    .map(Number);
  expect(dayKm).toHaveLength(2);
  expect(km).toBeCloseTo(dayKm[0] + dayKm[1], 0);

  const day2 = screen.getByText("2일차").closest("[data-slot=card]") as HTMLElement;
  await user.click(within(day2).getByRole("button", { name: "지도에서 보기" }));

  expect(screen.getByTestId("route")).toHaveTextContent("1:몽마르트르,2:오르세");
  expect(within(day2).getByRole("button", { name: "지도에서 보기" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("좌표가 없는 일차에는 지도 버튼과 거리가 보이지 않고 일정은 그대로 보인다", async () => {
  const user = userEvent.setup();
  render(<CityExplorer cities={[{ ...withCoords, days: [[bare("가"), bare("나")], withCoords.days[1], withCoords.days[2]] }]} />);
  await user.click(await screen.findByTestId("point-paris"));

  expect(screen.queryByRole("button", { name: "지도에서 보기" })).not.toBeInTheDocument();
  expect(screen.queryByText(/이동 약/)).not.toBeInTheDocument();
  expect(screen.queryByText(/총 이동 약/)).not.toBeInTheDocument();
  expect(screen.getByTestId("route")).toBeEmptyDOMElement();
  expect(screen.getByText("가")).toBeInTheDocument();
});

test("도시를 바꾸면 지도에 보내는 일차는 1일차로 돌아간다", async () => {
  const user = userEvent.setup();
  const tokyo: City = { ...withCoords, id: "tokyo", name: "도쿄" };
  render(<CityExplorer cities={[withCoords, tokyo]} />);
  await user.click(await screen.findByTestId("point-paris"));
  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "2");
  const day2 = screen.getByText("2일차").closest("[data-slot=card]") as HTMLElement;
  await user.click(within(day2).getByRole("button", { name: "지도에서 보기" }));
  expect(screen.getByTestId("route")).toHaveTextContent("1:몽마르트르");

  await user.click(await screen.findByTestId("point-tokyo"));

  expect(screen.getByTestId("route")).toHaveTextContent("1:에펠탑,3:루브르");
});
