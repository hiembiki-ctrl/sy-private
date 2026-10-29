import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import CityGlobe from "@/components/city-globe";
import { CITIES } from "@/lib/cities";

type Handler = (event?: unknown) => void;

// MapLibre는 jsdom에서 그릴 수 없으므로, 이벤트와 호출만 기록하는 가짜 지도로 바꿔 끼운다.
const { FakeMap, maps } = vi.hoisted(() => {
  class FakeMap {
    options: Record<string, unknown>;
    handlers = new Map<string, Handler[]>();
    controls: unknown[] = [];
    sources: Record<string, unknown> = {};
    layers: { id: string; [key: string]: unknown }[] = [];
    filters: Record<string, unknown> = {};
    flights: { center: [number, number]; zoom: number }[] = [];
    canvas = { style: {} as Record<string, string> };
    layout: Record<string, unknown> = {};
    projection: unknown;
    removed = false;
    styleLayers = [
      { id: "label_city", type: "symbol", layout: { "text-field": ["get", "name"] } },
      { id: "road", type: "line", layout: {} },
    ];

    constructor(options: Record<string, unknown>) {
      this.options = options;
      maps.push(this);
    }
    // on(이벤트, 핸들러) 또는 on(이벤트, 레이어, 핸들러) 두 형태를 받는다.
    on(event: string, layerOrHandler: string | Handler, handler?: Handler) {
      const isLayer = typeof layerOrHandler === "string";
      const key = isLayer ? `${event}:${layerOrHandler}` : event;
      const fn = (isLayer ? handler : layerOrHandler) as Handler;
      this.handlers.set(key, [...(this.handlers.get(key) ?? []), fn]);
    }
    emit(event: string, payload?: unknown, layer?: string) {
      this.handlers.get(layer ? `${event}:${layer}` : event)?.forEach((h) => h(payload));
    }
    setFilter(layerId: string, filter: unknown) {
      this.filters[layerId] = filter;
    }
    flyTo(options: { center: [number, number]; zoom: number }) {
      this.flights.push(options);
    }
    getCanvas() {
      return this.canvas;
    }
    addControl(control: unknown) {
      this.controls.push(control);
    }
    setProjection(projection: unknown) {
      this.projection = projection;
    }
    getStyle() {
      return { layers: this.styleLayers };
    }
    setLayoutProperty(id: string, name: string, value: unknown) {
      this.layout[`${id}.${name}`] = value;
    }
    addSource(id: string, source: unknown) {
      this.sources[id] = source;
    }
    addLayer(layer: { id: string; [key: string]: unknown }) {
      this.layers.push(layer);
    }
    remove() {
      this.removed = true;
    }
  }
  const maps: InstanceType<typeof FakeMap>[] = [];
  return { FakeMap, maps };
});

vi.mock("maplibre-gl", () => ({
  Map: FakeMap,
  setWorkerUrl: vi.fn(),
  NavigationControl: class {
    kind = "navigation";
  },
}));

const noop = () => {};

beforeEach(() => {
  maps.length = 0;
});

test("지도를 한 번만 만들고 선택이나 도시 목록이 바뀌어도 다시 만들지 않는다", () => {
  const { rerender } = render(
    <CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />
  );
  rerender(<CityGlobe cities={[...CITIES]} selectedId="paris" onSelect={noop} />);
  rerender(<CityGlobe cities={[...CITIES]} selectedId="tokyo" onSelect={noop} />);

  expect(maps).toHaveLength(1);
});

test("확대·축소 버튼을 달고, 출처 표기는 접지 않고 항상 펼쳐 둔다", () => {
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);

  const [map] = maps;
  expect(map.controls).toHaveLength(1);
  expect(map.options.attributionControl).toEqual({ compact: false });
  // 너무 멀리 축소해 지구가 점처럼 작아지지 않게 한다.
  expect(map.options.minZoom).toBe(1);
  expect(map.options.style).toBe("https://tiles.openfreemap.org/styles/liberty");
});

test("스타일이 로드되면 지구본으로 바꾸고 위도선을 얹고 지명을 한국어 우선으로 바꾼다", () => {
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);
  const [map] = maps;

  act(() => map.emit("style.load"));

  expect(map.projection).toEqual({ type: "globe" });
  expect(Object.keys(map.sources)).toContain("latitude-lines");
  expect(map.layers.map((l) => l.id)).toContain("latitude-lines");
  expect(map.layout["label_city.text-field"]).toEqual([
    "coalesce",
    ["get", "name:ko"],
    ["get", "name"],
  ]);
  expect(map.layout["road.text-field"]).toBeUndefined();
});

test("스타일을 불러오기 전에 오류가 나면 실패 안내를 보여준다", () => {
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);
  const [map] = maps;

  act(() => map.emit("error", { error: new Error("network") }));

  expect(screen.getByRole("alert")).toHaveTextContent("지도를 불러오지 못했어요");
});

test("스타일을 불러온 뒤의 타일 오류는 지도를 가리지 않는다", () => {
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);
  const [map] = maps;

  act(() => map.emit("style.load"));
  act(() => map.emit("error", { error: new Error("tile") }));

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("화면에서 사라지면 지도를 정리한다", () => {
  const { unmount } = render(
    <CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />
  );

  unmount();

  expect(maps[0].removed).toBe(true);
});

const styleLoaded = (map: InstanceType<typeof FakeMap>) => act(() => map.emit("style.load"));

test("스타일이 로드되면 지원 도시 10곳의 도시 점과 이름 레이어를 올린다", () => {
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);
  const [map] = maps;

  styleLoaded(map);

  const source = map.sources.cities as {
    data: {
      features: {
        properties: { id: string; name: string };
        geometry: { coordinates: number[] };
      }[];
    };
  };
  expect(source.data.features).toHaveLength(10);
  const paris = source.data.features.find((f) => f.properties.id === "paris")!;
  expect(paris.properties.name).toBe("파리");
  expect(paris.geometry.coordinates).toEqual([2.35, 48.86]);
  expect(map.layers.map((l) => l.id)).toEqual(
    expect.arrayContaining(["city-points", "city-selected", "city-labels"]),
  );
});

test("도시 점을 누르면 그 도시를 선택한다", () => {
  const onSelect = vi.fn();
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={onSelect} />);
  const [map] = maps;
  styleLoaded(map);

  act(() => map.emit("click", { features: [{ properties: { id: "tokyo" } }] }, "city-points"));

  expect(onSelect).toHaveBeenCalledWith("tokyo");
});

test("이름표를 눌러도 그 도시를 선택한다", () => {
  const onSelect = vi.fn();
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={onSelect} />);
  const [map] = maps;
  styleLoaded(map);

  act(() => map.emit("click", { features: [{ properties: { id: "lisbon" } }] }, "city-labels"));

  expect(onSelect).toHaveBeenCalledWith("lisbon");
});

test("선택이 바뀌면 지도가 그 도시로 이동하며 확대하고, 선택 전에는 움직이지 않는다", () => {
  const { rerender } = render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);
  const [map] = maps;
  styleLoaded(map);
  expect(map.flights).toHaveLength(0);

  rerender(<CityGlobe cities={CITIES} selectedId="paris" onSelect={noop} />);
  rerender(<CityGlobe cities={CITIES} selectedId="cape-town" onSelect={noop} />);

  expect(map.flights.map((f) => f.center)).toEqual([
    [2.35, 48.86],
    [18.42, -33.92],
  ]);
  expect(map.flights.every((f) => f.zoom >= 5)).toBe(true);
  expect(maps).toHaveLength(1);
});

test("선택한 도시 점만 따로 표시하는 필터를 선택에 맞춰 갱신한다", () => {
  const { rerender } = render(<CityGlobe cities={CITIES} selectedId="paris" onSelect={noop} />);
  const [map] = maps;
  styleLoaded(map);
  // 처음부터 선택돼 있으면 레이어를 올릴 때 이미 필터가 들어간다.
  const layer = map.layers.find((l) => l.id === "city-selected");
  expect(layer?.filter).toEqual(["==", ["get", "id"], "paris"]);

  rerender(<CityGlobe cities={CITIES} selectedId="tokyo" onSelect={noop} />);

  expect(map.filters["city-selected"]).toEqual(["==", ["get", "id"], "tokyo"]);
});

test("도시 점 위에서는 포인터 커서를 보여준다", () => {
  render(<CityGlobe cities={CITIES} selectedId={null} onSelect={noop} />);
  const [map] = maps;
  styleLoaded(map);

  act(() => map.emit("mouseenter", undefined, "city-points"));
  expect(map.canvas.style.cursor).toBe("pointer");
  act(() => map.emit("mouseleave", undefined, "city-points"));
  expect(map.canvas.style.cursor).toBe("");
});

test("이미 선택된 도시 점을 다시 누르면 지도가 그 도시로 다시 돌아온다", () => {
  const onSelect = vi.fn();
  render(<CityGlobe cities={CITIES} selectedId="paris" onSelect={onSelect} />);
  const [map] = maps;
  styleLoaded(map);
  const before = map.flights.length;

  act(() => map.emit("click", { features: [{ properties: { id: "paris" } }] }, "city-points"));

  expect(map.flights.length).toBe(before + 1);
  expect(map.flights.at(-1)?.center).toEqual([2.35, 48.86]);
});
