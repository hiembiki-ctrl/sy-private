// 지도 스타일(타일 포함) 주소는 여기서만 정한다. 다른 제공처로 옮길 때 이 값만 바꾼다.
export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/liberty";

// 처음에는 도시가 4개 이상 보이는 방향(유럽·아프리카·서아시아)을 향한다.
export const INITIAL_CENTER: [number, number] = [15, 30];
export const INITIAL_ZOOM = 1.6;

const TROPIC_LAT = 23.44;

type LatitudeLines = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { name: string };
    geometry: { type: "LineString"; coordinates: [number, number][] };
  }[];
};

// 적도와 남북회귀선: 위도를 가늠하게 하는 기준선
export function latitudeLines(): LatitudeLines {
  const lines = [
    { name: "적도", lat: 0 },
    { name: "북회귀선", lat: TROPIC_LAT },
    { name: "남회귀선", lat: -TROPIC_LAT },
  ];
  return {
    type: "FeatureCollection",
    features: lines.map(({ name, lat }) => ({
      type: "Feature",
      properties: { name },
      geometry: {
        type: "LineString",
        coordinates: Array.from({ length: 73 }, (_, i): [number, number] => [-180 + i * 5, lat]),
      },
    })),
  };
}

// 지명 표현식에 한국어 이름을 먼저 쓰고, 없으면 원래 표현식으로 돌아간다.
export function koreanTextField(original: unknown): unknown {
  if (!Array.isArray(original)) return original;
  return ["coalesce", ["get", "name:ko"], original];
}

// 도시를 선택했을 때 지도가 확대하는 정도(도시 일대가 보이는 수준)
export const CITY_FLY_ZOOM = 7;

// 지도 위 도시 점과 이름표에 쓰는 데이터
export function cityFeatures(cities: { id: string; name: string; lat: number; lng: number }[]) {
  return {
    type: "FeatureCollection" as const,
    features: cities.map((city) => ({
      type: "Feature" as const,
      properties: { id: city.id, name: city.name },
      geometry: { type: "Point" as const, coordinates: [city.lng, city.lat] },
    })),
  };
}

// 선택한 도시 점만 따로 보이게 하는 필터. 선택이 없으면 아무 점도 맞지 않는다.
export function selectedCityFilter(selectedId: string | null) {
  return ["==", ["get", "id"], selectedId ?? ""] as ["==", ["get", "id"], string];
}
