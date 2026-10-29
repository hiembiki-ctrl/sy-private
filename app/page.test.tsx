import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";
import { CITIES } from "@/lib/cities";

// WebGL은 jsdom에서 그릴 수 없으므로, 도시 점 클릭만 흉내 내는 지구본으로 바꿔 끼운다.
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
  render(<Home />);

  expect(await screen.findByText("가고 싶은 도시를 눌러 보세요")).toBeInTheDocument();
  expect(screen.queryByText(/1일차/)).not.toBeInTheDocument();
});

test("도시 점을 누르면 그 도시의 1일 일정과 위도·기후·계절이 보인다", async () => {
  const user = userEvent.setup();
  render(<Home />);

  await user.click(await screen.findByTestId("point-paris"));

  expect(screen.getByRole("heading", { name: "파리" })).toBeInTheDocument();
  expect(screen.getByText(/북위 49°.*온대 해양성.*봄·초가을이 좋음/)).toBeInTheDocument();
  expect(screen.getAllByText(/일차$/)).toHaveLength(1);
  expect(screen.getByText("에펠탑")).toBeInTheDocument();
  expect(screen.getByTestId("globe")).toHaveAttribute("data-selected", "paris");
});

test("일수를 바꾸면 하루 단위 구역 수가 바뀌고, 도시를 바꿔도 일수가 유지된다", async () => {
  const user = userEvent.setup();
  render(<Home />);

  await user.click(await screen.findByTestId("point-paris"));
  await user.click(screen.getByRole("tab", { name: "3일" }));
  expect(screen.getAllByText(/일차$/)).toHaveLength(3);

  await user.click(screen.getByRole("tab", { name: "2일" }));
  expect(screen.getAllByText(/일차$/)).toHaveLength(2);

  await user.click(screen.getByRole("tab", { name: "3일" }));
  await user.click(screen.getByTestId("point-tokyo"));
  expect(screen.getByRole("heading", { name: "도쿄" })).toBeInTheDocument();
  expect(screen.getAllByText(/일차$/)).toHaveLength(3);
});

test("보조 도시 목록에서 10개 도시를 모두 고를 수 있다", async () => {
  const user = userEvent.setup();
  render(<Home />);

  const list = await screen.findByRole("group", { name: "도시 목록" });
  const buttons = within(list).getAllByRole("button");
  expect(buttons.map((b) => b.textContent)).toEqual(CITIES.map((c) => c.name));

  await user.click(within(list).getByRole("button", { name: "케이프타운" }));
  expect(screen.getByRole("heading", { name: "케이프타운" })).toBeInTheDocument();
  expect(screen.getByText(/남위 34°/)).toBeInTheDocument();
});
