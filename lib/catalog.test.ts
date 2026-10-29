import { expect, test } from "vitest";

import { buildCities } from "@/lib/catalog";

const city = {
  id: "paris",
  name: "파리",
  country: "프랑스",
  lat: 48.86,
  lng: 2.35,
  climate: "온대 해양성",
  best_season: "봄",
  recommended_min_days: 3,
  recommended_max_days: 4,
};

function places(cityId: string, skipNearbyDay?: number) {
  const rows = [];
  for (let d = 1; d <= 3; d++) {
    for (const p of [2, 1]) {
      rows.push({ city_id: cityId, section: "city" as const, day_index: d, destination: null, position: p, name: `c${d}-${p}`, summary: "s", kind: "명소" as const });
    }
  }
  for (let d = 1; d <= 4; d++) {
    if (d === skipNearbyDay) continue;
    rows.push({ city_id: cityId, section: "nearby" as const, day_index: d, destination: `근교${d}`, position: 1, name: `n${d}`, summary: "s", kind: "액티비티" as const });
  }
  return rows;
}

test("DB 행을 하루별·순서별로 묶어 City로 만든다", () => {
  const [paris] = buildCities([city], places("paris"));

  expect(paris.bestSeason).toBe("봄");
  expect(paris.recommendedDays).toEqual({ min: 3, max: 4 });
  expect(paris.days[0].map((i) => i.name)).toEqual(["c1-1", "c1-2"]);
  expect(paris.nearby.map((t) => t.destination)).toEqual(["근교1", "근교2", "근교3", "근교4"]);
});

test("일정이 모자란 도시는 목록에서 뺀다", () => {
  expect(buildCities([city], places("paris", 4))).toEqual([]);
});
