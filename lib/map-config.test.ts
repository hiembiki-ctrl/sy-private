import { expect, test } from "vitest";

import { koreanTextField, latitudeLines, MAP_STYLE_URL } from "@/lib/map-config";

test("지도 스타일은 키 없이 쓰는 OpenFreeMap 주소가 기본이다", () => {
  expect(MAP_STYLE_URL).toBe("https://tiles.openfreemap.org/styles/liberty");
});

test("적도와 남북회귀선 세 줄을 지구 한 바퀴만큼 이어서 만든다", () => {
  const { features } = latitudeLines();

  expect(features).toHaveLength(3);
  const lats = features.map((f) => f.geometry.coordinates[0][1]).sort((a, b) => a - b);
  expect(lats).toEqual([-23.44, 0, 23.44]);
  for (const feature of features) {
    const lngs = feature.geometry.coordinates.map(([lng]) => lng);
    expect(Math.min(...lngs)).toBe(-180);
    expect(Math.max(...lngs)).toBe(180);
    // 모든 점이 같은 위도 위에 있다.
    expect(new Set(feature.geometry.coordinates.map(([, lat]) => lat)).size).toBe(1);
  }
});

test("지명 표현식은 한국어 이름을 먼저 쓰고 없으면 원래 표현식으로 돌아간다", () => {
  const original = ["coalesce", ["get", "name_en"], ["get", "name"]];

  expect(koreanTextField(original)).toEqual(["coalesce", ["get", "name:ko"], original]);
});

test("표현식이 아닌 지명 설정은 그대로 둔다", () => {
  expect(koreanTextField("{name}")).toBe("{name}");
  expect(koreanTextField(undefined)).toBeUndefined();
});
