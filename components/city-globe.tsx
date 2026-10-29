"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  type GeoJSONSource,
  type IControl,
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { City } from "@/lib/cities";
import {
  CITY_FLY_ZOOM,
  cityFeatures,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  koreanTextField,
  latitudeLines,
  MAP_STYLE_URL,
  selectedCityFilter,
} from "@/lib/map-config";
import type { RoutePoint } from "@/lib/route";

// 번들러가 워커 경로를 깨뜨리므로 워커 파일을 정적 자산으로 두고 주소를 직접 알려 준다.
setWorkerUrl(
  new URL("../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
);

type CityGlobeProps = {
  cities: City[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** 지도에 번호 핀과 직선 동선으로 보여 줄 하루의 방문 장소. */
  route?: RoutePoint[];
};

const ROUTE_COLOR = "#2563eb";

const RESET_LABEL = "지구본 처음 화면으로";
const GLOBE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin:auto;display:block"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

// 확대·축소 버튼 아래에 붙는 버튼. 누르면 처음 지구본 화면으로 돌아간다.
class ResetViewControl implements IControl {
  private container?: HTMLDivElement;

  constructor(private readonly onReset: () => void) {}

  onAdd(): HTMLElement {
    const container = document.createElement("div");
    container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "maplibregl-ctrl-icon";
    button.title = RESET_LABEL;
    button.setAttribute("aria-label", RESET_LABEL);
    button.innerHTML = GLOBE_ICON;
    button.addEventListener("click", this.onReset);
    container.append(button);
    this.container = container;
    return container;
  }

  onRemove(): void {
    this.container?.remove();
    this.container = undefined;
  }
}

function routeData(points: RoutePoint[]) {
  return {
    line: {
      type: "FeatureCollection" as const,
      features:
        points.length < 2
          ? []
          : [
              {
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "LineString" as const,
                  coordinates: points.map((p) => [p.lng, p.lat]),
                },
              },
            ],
    },
    points: {
      type: "FeatureCollection" as const,
      features: points.map((p) => ({
        type: "Feature" as const,
        properties: { number: String(p.number), name: p.name },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      })),
    },
  };
}

// 동선 소스를 새 장소로 바꾸고, 장소가 있으면 모두 화면에 담기게 지도를 맞춘다.
function applyRoute(map: MapLibreMap, points: RoutePoint[]) {
  const data = routeData(points);
  (map.getSource("route-line") as GeoJSONSource | undefined)?.setData(data.line);
  (map.getSource("route-points") as GeoJSONSource | undefined)?.setData(data.points);
  if (points.length === 0) return;
  const bounds = new LngLatBounds();
  for (const p of points) bounds.extend([p.lng, p.lat]);
  map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 900 });
}

export default function CityGlobe({ cities, selectedId, onSelect, route = [] }: CityGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const styleReadyRef = useRef(false);
  const [failed, setFailed] = useState(false);

  // 지도는 한 번만 만들기 때문에, 이후 바뀌는 값은 ref로 최신 상태를 읽는다.
  const citiesRef = useRef(cities);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const routeRef = useRef(route);
  useEffect(() => {
    routeRef.current = route;
    citiesRef.current = cities;
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelect;
  });

  // 지도는 화면이 열려 있는 동안 한 번만 만든다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 1,
      maxZoom: 16,
      // 출처 표기는 접지 않고 항상 보이게 한다.
      attributionControl: { compact: false },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new ResetViewControl(() => map.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM })),
      "top-right",
    );

    map.on("style.load", () => {
      styleReadyRef.current = true;
      map.setProjection({ type: "globe" });

      map.addSource("latitude-lines", { type: "geojson", data: latitudeLines() });
      map.addLayer({
        id: "latitude-lines",
        type: "line",
        source: "latitude-lines",
        paint: {
          "line-color": "#b45309",
          "line-width": 1.2,
          "line-dasharray": [2, 2],
          // 지구본 단계에서만 옅게 보이고 확대하면 사라진다.
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.6, 4, 0.5, 7, 0],
        },
      });

      for (const layer of map.getStyle().layers) {
        if (layer.type !== "symbol") continue;
        const original = layer.layout?.["text-field"];
        if (original === undefined) continue;
        map.setLayoutProperty(layer.id, "text-field", koreanTextField(original) as never);
      }

      // 도시 점과 이름은 지도 레이어라서 지구본 뒷면에서는 지구에 가려져 보이지 않고 눌리지 않는다.
      map.addSource("cities", { type: "geojson", data: cityFeatures(citiesRef.current) });
      map.addLayer({
        id: "city-points",
        type: "circle",
        source: "cities",
        paint: {
          "circle-radius": 3.5,
          "circle-color": "#f97316",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      });
      map.addLayer({
        id: "city-selected",
        type: "circle",
        source: "cities",
        filter: selectedCityFilter(selectedIdRef.current),
        paint: {
          "circle-radius": 6,
          "circle-color": "#dc2626",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "city-labels",
        type: "symbol",
        source: "cities",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 11,
          "text-offset": [0, 0.9],
          "text-anchor": "top",
          // 도시가 많아 겹치는 이름은 숨긴다. 확대하면 모두 보인다.
          "text-allow-overlap": false,
          "text-optional": true,
        },
        paint: {
          "text-color": "#111827",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });

      // 일정의 하루 동선: 방문 순서대로 이은 선 위에 번호 핀을 얹는다.
      const initial = routeData(routeRef.current);
      map.addSource("route-line", { type: "geojson", data: initial.line });
      map.addSource("route-points", { type: "geojson", data: initial.points });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route-line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ROUTE_COLOR, "line-width": 3, "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "route-points",
        type: "circle",
        source: "route-points",
        paint: {
          "circle-radius": 10,
          "circle-color": ROUTE_COLOR,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "route-numbers",
        type: "symbol",
        source: "route-points",
        layout: {
          "text-field": ["get", "number"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#ffffff" },
      });
      if (routeRef.current.length > 0) applyRoute(map, routeRef.current);

      for (const layerId of ["city-points", "city-selected", "city-labels"]) {
        map.on("click", layerId, (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id !== "string") return;
          onSelectRef.current(id);
          // 이미 선택된 도시는 선택이 바뀌지 않아 이동 효과가 돌지 않으므로, 여기서 다시 돌아온다.
          if (id === selectedIdRef.current) {
            const city = citiesRef.current.find((c) => c.id === id);
            if (city) map.flyTo({ center: [city.lng, city.lat], zoom: CITY_FLY_ZOOM });
          }
        });
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
      }
    });

    // 스타일을 불러오기 전의 오류만 지도를 못 쓰는 상태로 본다. 이후의 타일 오류는 잠깐의 빈칸이다.
    map.on("error", () => {
      if (!styleReadyRef.current) setFailed(true);
    });

    return () => {
      styleReadyRef.current = false;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // 선택이 바뀌면 그 도시를 표시하고, 지도가 그 도시로 이동하며 확대한다.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (styleReadyRef.current) map.setFilter("city-selected", selectedCityFilter(selectedId));
    const city = cities.find((c) => c.id === selectedId);
    if (city) map.flyTo({ center: [city.lng, city.lat], zoom: CITY_FLY_ZOOM });
  }, [cities, selectedId]);

  // 보여 줄 동선이 바뀌면 지도에 반영한다. 같은 장소 구성이면 다시 맞추지 않는다.
  const routeKey = route.map((p) => `${p.number}:${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReadyRef.current) return;
    applyRoute(map, routeRef.current);
  }, [routeKey]);

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" data-testid="globe-canvas" />
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-sm">
            <AlertTitle>지도를 불러오지 못했어요</AlertTitle>
            <AlertDescription>
              아래 도시 목록에서 도시를 골라 일정을 볼 수 있어요.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
