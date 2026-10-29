import { afterEach, describe, expect, test, vi } from "vitest";

import { describeWeatherCode, fetchCurrentWeather } from "@/lib/weather";

afterEach(() => vi.unstubAllGlobals());

describe("날씨 코드 해석", () => {
  test("주요 코드를 한국어로 옮기고 모르는 코드는 안내 문구를 쓴다", () => {
    expect(describeWeatherCode(0)).toBe("맑음");
    expect(describeWeatherCode(3)).toBe("흐림");
    expect(describeWeatherCode(63)).toBe("비");
    expect(describeWeatherCode(73)).toBe("눈");
    expect(describeWeatherCode(95)).toBe("뇌우");
    expect(describeWeatherCode(30)).toBe("날씨 정보 없음");
  });
});

describe("현재 날씨 조회", () => {
  test("좌표로 현재 기온과 날씨를 읽어 반올림해 돌려준다", async () => {
    const fetchMock = vi.fn((...args: [string]) => {
      void args;
      return Promise.resolve(Response.json({ current: { temperature_2m: 17.6, weather_code: 2 } }));
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCurrentWeather(48.86, 2.35)).resolves.toEqual({
      temperature: 18,
      description: "대체로 맑음",
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain("latitude=48.86&longitude=2.35");
  });

  test("응답 오류, 형식 불일치, 네트워크 실패는 모두 null이다", async () => {
    vi.stubGlobal("fetch", async () => new Response("x", { status: 500 }));
    await expect(fetchCurrentWeather(1, 1)).resolves.toBeNull();

    vi.stubGlobal("fetch", async () => Response.json({ current: {} }));
    await expect(fetchCurrentWeather(1, 1)).resolves.toBeNull();

    vi.stubGlobal("fetch", async () => {
      throw new Error("offline");
    });
    await expect(fetchCurrentWeather(1, 1)).resolves.toBeNull();
  });
});
