import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";
import { CITIES } from "@/lib/cities";

// WebGL은 jsdom에서 그릴 수 없으므로, 도시 점 클릭만 흉내 내는 지구본으로 바꿔 끼운다.
// 순위 조회는 외부 네트워크를 쓰므로 테스트에서는 원래 순서 그대로 돌려준다.
vi.mock("@/lib/popularity", () => ({
  rankByPopularity: async (cities: unknown[]) => ({ cities, popularIds: [] }),
}));

// 날씨 조회는 외부 네트워크를 쓰므로 테스트에서는 가짜 값을 돌려준다.
vi.mock("@/lib/weather", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/weather")>()),
  fetchCurrentWeather: async () => ({ temperature: 18, description: "맑음" }),
}));

vi.mock("@/components/city-globe", () => ({
  default: ({
    cities,
    selectedId,
    onSelect,
  }: {
    cities: { id: string; name: string }[];
    selectedId: string | null;
    onSelect: (id: string) => void;
  }) => (
    <div data-testid="globe" data-selected={selectedId ?? ""}>
      {cities.map((city) => (
        <button
          key={city.id}
          type="button"
          data-testid={`point-${city.id}`}
          onClick={() => onSelect(city.id)}
        />
      ))}
    </div>
  ),
}));

test("도시를 고르기 전에는 안내가 있는 빈 상태가 보인다", async () => {
  render(await Home());

  expect(await screen.findByText("가고 싶은 도시를 눌러 보세요")).toBeInTheDocument();
  expect(screen.queryByText(/1일차/)).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "여행 일수" })).not.toBeInTheDocument();
});

test("도시 점을 누르면 그 도시의 1일 일정과 위도·기후·계절이 보인다", async () => {
  const user = userEvent.setup();
  render(await Home());

  await user.click(await screen.findByTestId("point-paris"));

  expect(screen.getByRole("heading", { name: "파리" })).toBeInTheDocument();
  expect(screen.getByText(/북위 49°.*온대 해양성.*봄·초가을이 좋음/)).toBeInTheDocument();
  expect(screen.getAllByText(/^[0-9]일차/)).toHaveLength(1);
  expect(screen.getByText("에펠탑")).toBeInTheDocument();
  expect(screen.getByText("추천 3~4일")).toBeInTheDocument();
  expect(screen.getByTestId("globe")).toHaveAttribute("data-selected", "paris");
});

test("도시를 고르면 현재 기온과 날씨가 보이고, 도시를 고르기 전에는 보이지 않는다", async () => {
  const user = userEvent.setup();
  render(await Home());

  expect(screen.queryByText(/18°C/)).not.toBeInTheDocument();
  await user.click(await screen.findByTestId("point-paris"));

  expect(await screen.findByText(/18°C · 맑음/)).toBeInTheDocument();
});

test("각 장소에는 도시 이름을 붙인 웹 검색을 새 탭으로 여는 아이콘 링크가 있다", async () => {
  const user = userEvent.setup();
  render(await Home());

  await user.click(await screen.findByTestId("point-paris"));
  const link = screen.getByRole("link", { name: "에펠탑 웹에서 더 알아보기" });

  expect(link).toHaveAttribute("href", "https://www.google.com/search?q=%ED%8C%8C%EB%A6%AC%20%EC%97%90%ED%8E%A0%ED%83%91");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
});

test("일수를 바꾸면 하루 단위 구역 수가 바뀌고, 도시를 바꿔도 일수가 유지된다", async () => {
  const user = userEvent.setup();
  render(await Home());

  await user.click(await screen.findByTestId("point-paris"));
  const select = screen.getByRole("combobox", { name: "여행 일수" });
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  expect(within(select).getAllByRole("option").map((o) => o.textContent)).toEqual([
    "1일", "2일", "3일", "4일", "5일", "6일", "7일",
  ]);

  await user.selectOptions(select, "3");
  expect(screen.getAllByText(/^[0-9]일차/)).toHaveLength(3);
  expect(screen.queryByText(/근교/)).not.toBeInTheDocument();

  await user.selectOptions(select, "2");
  expect(screen.getAllByText(/^[0-9]일차/)).toHaveLength(2);

  await user.selectOptions(select, "5");
  await user.click(screen.getByTestId("point-tokyo"));
  expect(screen.getByRole("heading", { name: "도쿄" })).toBeInTheDocument();
  expect(screen.getAllByText(/^[0-9]일차/)).toHaveLength(5);
  expect(screen.getByText("4일차 · 근교: 가마쿠라")).toBeInTheDocument();
  expect(screen.getByText("5일차 · 근교: 닛코")).toBeInTheDocument();
});

test("일차 항목에는 1부터 시작하는 방문 순서 번호가 붙는다", async () => {
  const user = userEvent.setup();
  render(await Home());

  await user.click(await screen.findByTestId("point-paris"));
  const items = screen.getAllByRole("listitem").filter((li) => li.textContent?.includes("에펠탑"));
  expect(items[0].textContent).toMatch(/^1.에펠탑/);
});

test("7일을 고르면 4~7일차가 모두 근교 일차이고 로그인 없이도 보인다", async () => {
  const user = userEvent.setup();
  render(await Home());

  await user.click(await screen.findByTestId("point-paris"));
  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "7");

  expect(screen.getByText("4일차 · 근교: 베르사유")).toBeInTheDocument();
  expect(screen.getAllByText(/일차 · 근교: /)).toHaveLength(4);
});

test("보조 도시 목록에서 10개 도시를 모두 고를 수 있다", async () => {
  const user = userEvent.setup();
  render(await Home());

  const list = await screen.findByRole("group", { name: "도시 목록" });
  const buttons = within(list).getAllByRole("button");
  expect(buttons.map((b) => b.textContent)).toEqual(CITIES.map((c) => c.name));

  await user.click(within(list).getByRole("button", { name: "케이프타운" }));
  expect(screen.getByRole("heading", { name: "케이프타운" })).toBeInTheDocument();
  expect(screen.getByText(/남위 34°/)).toBeInTheDocument();
});
