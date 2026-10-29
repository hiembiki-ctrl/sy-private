import { describe, expect, test } from "vitest";

import { CITIES } from "@/lib/cities";
import { rankByViews } from "@/lib/popularity";

describe("인기 도시 정렬", () => {
  test("조회수가 많은 순으로 정렬하고 상위 3곳을 인기로 표시한다", () => {
    const views = Object.fromEntries(CITIES.map((c, i) => [c.id, i * 10]));
    const { cities, popularIds } = rankByViews(CITIES, views);

    expect(cities.map((c) => c.id)).toEqual([...CITIES].reverse().map((c) => c.id));
    expect(popularIds).toEqual(cities.slice(0, 3).map((c) => c.id));
  });

  test("조회수를 못 구한 도시는 원래 순서로 뒤에 둔다", () => {
    const { cities, popularIds } = rankByViews(CITIES, { paris: 5, bangkok: 9 });

    expect(cities.slice(0, 2).map((c) => c.id)).toEqual(["bangkok", "paris"]);
    expect(cities.slice(2).map((c) => c.id)).toEqual(
      CITIES.filter((c) => c.id !== "paris" && c.id !== "bangkok").map((c) => c.id),
    );
    expect(popularIds).toEqual(["bangkok", "paris"]);
  });

  test("조회수를 하나도 못 구하면 원래 순서와 배지 없음으로 돌아간다", () => {
    const { cities, popularIds } = rankByViews(CITIES, {});

    expect(cities).toEqual(CITIES);
    expect(popularIds).toEqual([]);
  });
});
