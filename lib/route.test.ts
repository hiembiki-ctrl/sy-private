import { describe, expect, test } from "vitest";

import type { DayPlan } from "@/lib/cities";
import {
  orderForShortestRoute,
  buildDayRoute,
  formatDistance,
  haversineKm,
  kmToMiles,
  totalDistanceKm,
} from "@/lib/route";

const item = (name: string, lat?: number, lng?: number) => ({
  name,
  summary: "설명",
  kind: "명소" as const,
  lat,
  lng,
});

const EIFFEL = { lat: 48.8584, lng: 2.2945 };
const LOUVRE = { lat: 48.8606, lng: 2.3376 };
const VERSAILLES = { lat: 48.8049, lng: 2.1204 };

describe("거리 계산", () => {
  test("두 지점 사이의 직선 거리를 km로 구한다", () => {
    expect(haversineKm(EIFFEL, LOUVRE)).toBeCloseTo(3.2, 1);
    expect(haversineKm(EIFFEL, EIFFEL)).toBe(0);
  });

  test("km를 mile로 바꾼다", () => {
    expect(kmToMiles(1.609344)).toBeCloseTo(1, 5);
  });

  test("km와 mile을 함께 소수 첫째 자리까지 적는다", () => {
    expect(formatDistance(10)).toBe("10.0 km (6.2 mi)");
    expect(formatDistance(1234.56)).toBe("1,234.6 km (767.1 mi)");
  });
});

describe("일차별 동선", () => {
  test("좌표가 있는 장소만 목록의 순서 번호를 유지한 채 이어 거리를 합한다", () => {
    const plan: DayPlan = {
      day: 1,
      items: [
        item("에펠탑", EIFFEL.lat, EIFFEL.lng),
        item("좌표 없음"),
        item("루브르", LOUVRE.lat, LOUVRE.lng),
      ],
    };
    const route = buildDayRoute(plan);

    expect(route.points.map((p) => [p.number, p.name])).toEqual([
      [1, "에펠탑"],
      [3, "루브르"],
    ]);
    expect(route.distanceKm).toBeCloseTo(haversineKm(EIFFEL, LOUVRE), 5);
  });

  test("이어 줄 점이 2개 미만이면 거리는 0이다", () => {
    expect(buildDayRoute({ day: 1, items: [item("에펠탑", EIFFEL.lat, EIFFEL.lng)] }).distanceKm).toBe(0);
    expect(buildDayRoute({ day: 1, items: [item("a"), item("b")] }).points).toEqual([]);
  });

  test("여러 일차의 거리를 합하고 일차 사이 이동은 넣지 않는다", () => {
    const day1: DayPlan = {
      day: 1,
      items: [item("에펠탑", EIFFEL.lat, EIFFEL.lng), item("루브르", LOUVRE.lat, LOUVRE.lng)],
    };
    const day2: DayPlan = {
      day: 2,
      destination: "베르사유",
      items: [item("궁전", VERSAILLES.lat, VERSAILLES.lng)],
    };
    expect(totalDistanceKm([day1, day2])).toBeCloseTo(haversineKm(EIFFEL, LOUVRE), 5);
  });
});

describe("최단 방문 순서", () => {
  const at = (name: string, p: { lat: number; lng: number }) => ({ name, ...p });
  const length = (items: { lat: number; lng: number }[]) =>
    items.slice(1).reduce((sum, p, i) => sum + haversineKm(items[i], p), 0);

  test("되돌아가는 순서를 이동 거리가 가장 짧은 순서로 바꾼다", () => {
    // 에펠탑 → 베르사유 → 루브르는 서쪽 끝까지 갔다 돌아오므로 에펠탑 → 루브르 → 베르사유 계열보다 길다.
    const zigzag = [at("에펠탑", EIFFEL), at("베르사유", VERSAILLES), at("루브르", LOUVRE)];
    const ordered = orderForShortestRoute(zigzag);

    expect(length(ordered)).toBeLessThan(length(zigzag));
    expect(ordered.map((p) => p.name)).toEqual(["베르사유", "에펠탑", "루브르"]);
  });

  test("이미 가장 짧은 순서이거나 길이가 같으면 원래 순서를 유지한다", () => {
    const ordered = [at("베르사유", VERSAILLES), at("에펠탑", EIFFEL), at("루브르", LOUVRE)];
    expect(orderForShortestRoute(ordered)).toBe(ordered);
  });

  test("가능한 모든 순서 중 가장 짧은 길이를 찾는다", () => {
    const pts = [
      at("a", { lat: 0, lng: 0 }),
      at("d", { lat: 0, lng: 0.03 }),
      at("b", { lat: 0, lng: 0.01 }),
      at("c", { lat: 0, lng: 0.02 }),
    ];
    expect(orderForShortestRoute(pts).map((p) => p.name)).toEqual(["a", "b", "c", "d"]);
  });

  test("2개 이하이거나 좌표가 없는 장소가 있으면 순서를 바꾸지 않는다", () => {
    const two = [at("에펠탑", EIFFEL), at("루브르", LOUVRE)];
    expect(orderForShortestRoute(two)).toBe(two);
    const missing: { name: string; lat?: number; lng?: number }[] = [
      at("에펠탑", EIFFEL),
      { name: "좌표 없음" },
      at("루브르", LOUVRE),
    ];
    expect(orderForShortestRoute(missing)).toBe(missing);
  });
});
