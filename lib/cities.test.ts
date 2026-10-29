import { describe, expect, test } from "vitest";

import { CITIES, formatLatitude, getCity, getItinerary } from "@/lib/cities";

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
  test("모든 도시는 1·2·3일 일정이 비어 있지 않고 하루에 항목이 3개 안팎이다", () => {
    for (const city of CITIES) {
      for (const days of [1, 2, 3] as const) {
        const itinerary = getItinerary(city.id, days);
        expect(itinerary, `${city.name} ${days}일`).toHaveLength(days);
        for (const day of itinerary) {
          expect(day.length, city.name).toBeGreaterThanOrEqual(2);
          expect(day.length, city.name).toBeLessThanOrEqual(4);
          for (const item of day) {
            expect(item.name).not.toBe("");
            expect(item.summary).not.toBe("");
            expect(["명소", "액티비티"]).toContain(item.kind);
          }
        }
      }
    }
  });

  test("일수를 늘려도 앞선 날의 일정은 그대로 유지된다", () => {
    const one = getItinerary("paris", 1);
    const three = getItinerary("paris", 3);
    expect(three[0]).toEqual(one[0]);
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
