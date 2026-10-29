import { describe, expect, test } from "vitest";

import {
  CITIES,
  DAY_OPTIONS,
  formatLatitude,
  formatRecommendedDays,
  getCity,
  getItinerary,
} from "@/lib/cities";

describe("지원 도시", () => {
  test("지원 도시 10곳이 정해진 순서와 이름으로 있다", () => {
    expect(CITIES.map((city) => city.name)).toEqual([
      "도쿄",
      "파리",
      "뉴욕",
      "방콕",
      "리스본",
      "이스탄불",
      "마라케시",
      "쿠스코",
      "하노이",
      "케이프타운",
    ]);
  });

  test("모든 도시에 위도·기후·여행하기 좋은 계절이 있다", () => {
    for (const city of CITIES) {
      expect(city.climate, city.name).not.toBe("");
      expect(city.bestSeason, city.name).not.toBe("");
      expect(Math.abs(city.lat), city.name).toBeGreaterThan(0);
    }
  });
});

describe("도시 일정", () => {
  test("일수는 1일부터 7일까지 하루 단위로 고를 수 있다", () => {
    expect(DAY_OPTIONS).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("모든 도시는 1~7일 어느 일수에서도 모든 일차가 비어 있지 않다", () => {
    for (const city of CITIES) {
      for (const days of DAY_OPTIONS) {
        const itinerary = getItinerary(city.id, days);
        expect(itinerary, `${city.name} ${days}일`).toHaveLength(days);
        itinerary.forEach((plan, index) => {
          expect(plan.day).toBe(index + 1);
          expect(plan.items.length, city.name).toBeGreaterThanOrEqual(2);
          expect(plan.items.length, city.name).toBeLessThanOrEqual(3);
          for (const item of plan.items) {
            expect(item.name).not.toBe("");
            expect(item.summary).not.toBe("");
            expect(["명소", "액티비티"]).toContain(item.kind);
          }
        });
      }
    }
  });

  test("근교는 4일차부터이고, 도시마다 서로 다른 목적지 4곳이다", () => {
    for (const city of CITIES) {
      const plans = getItinerary(city.id, 7);
      expect(plans.slice(0, 3).every((p) => p.destination === undefined), city.name).toBe(true);
      const destinations = plans.slice(3).map((p) => p.destination);
      expect(destinations, city.name).toHaveLength(4);
      expect(new Set(destinations).size, city.name).toBe(4);
      expect(destinations.every(Boolean), city.name).toBe(true);
      expect(plans.slice(3).every((p) => p.items.length <= 3), city.name).toBe(true);
    }
  });

  test("모든 도시에 추천 일수가 있고 '추천 N~M일'로 표기한다", () => {
    for (const city of CITIES) {
      const { min, max } = city.recommendedDays;
      expect(min, city.name).toBeGreaterThanOrEqual(1);
      expect(max, city.name).toBeLessThanOrEqual(7);
      expect(min, city.name).toBeLessThan(max);
    }
    expect(formatRecommendedDays({ min: 3, max: 4 })).toBe("추천 3~4일");
  });

  test("일수를 늘려도 앞선 날의 일정은 그대로 유지된다", () => {
    const one = getItinerary("paris", 1);
    const three = getItinerary("paris", 3);
    expect(three[0]).toEqual(one[0]);
    expect(getItinerary("paris", 5).slice(0, 3)).toEqual(three);
  });

  test("알 수 없는 도시는 undefined를 돌려준다", () => {
    expect(getCity("atlantis")).toBeUndefined();
  });
});

describe("위도 표기", () => {
  test("북반구는 북위, 남반구는 남위로 반올림해 표기한다", () => {
    expect(formatLatitude(35.68)).toBe("북위 36°");
    expect(formatLatitude(-33.92)).toBe("남위 34°");
  });
});
