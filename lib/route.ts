import type { DayPlan } from "@/lib/cities";

const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.609344;

export type RoutePoint = { number: number; name: string; lat: number; lng: number };

export type DayRoute = {
  points: RoutePoint[];
  /** 방문 순서대로 이은 직선 거리의 합(km). 이어 줄 점이 2개 미만이면 0이다. */
  distanceKm: number;
};

/** 두 좌표 사이의 큰 원 거리(km). */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** 하루 일정에서 좌표가 있는 장소만 방문 순서 번호와 함께 이어 거리를 잰다. 번호는 목록의 순서 번호와 같다. */
export function buildDayRoute(plan: DayPlan): DayRoute {
  const points: RoutePoint[] = [];
  plan.items.forEach((item, index) => {
    if (typeof item.lat !== "number" || typeof item.lng !== "number") return;
    points.push({ number: index + 1, name: item.name, lat: item.lat, lng: item.lng });
  });
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) distanceKm += haversineKm(points[i - 1], points[i]);
  return { points, distanceKm };
}

/** 여러 일차의 이동 거리를 합한다. 일차 사이의 이동은 넣지 않는다. */
export function totalDistanceKm(plans: DayPlan[]): number {
  return plans.reduce((sum, plan) => sum + buildDayRoute(plan).distanceKm, 0);
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

function oneDecimal(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** "12.3 km (7.6 mi)" 형태로 두 단위를 함께 적는다. */
export function formatDistance(km: number): string {
  return `${oneDecimal(km)} km (${oneDecimal(kmToMiles(km))} mi)`;
}

/** 전수 비교는 항목이 이 개수까지만 한다(8개면 4만 가지 정도). 그보다 많으면 원래 순서를 쓴다. */
const MAX_REORDER_ITEMS = 8;
/** 이 거리(km)보다 차이가 작으면 같은 길이로 보고 원래 순서에 가까운 쪽을 고른다. */
const TIE_KM = 0.001;

type Located = { lat?: number; lng?: number };

function pathLength(order: { lat: number; lng: number }[]): number {
  let sum = 0;
  for (let i = 1; i < order.length; i++) sum += haversineKm(order[i - 1], order[i]);
  return sum;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

/**
 * 하루 안의 장소를 이동 거리 합이 가장 짧은 방문 순서로 정렬한다. 출발점은 정해 두지 않는다.
 * 길이가 같으면 원래 순서와 자리가 많이 겹치는 쪽을 고른다. 좌표가 없는 장소가 있거나
 * 항목이 너무 많거나 2개 이하면 원래 순서를 그대로 둔다.
 */
export function orderForShortestRoute<T extends Located>(items: T[]): T[] {
  if (items.length < 3 || items.length > MAX_REORDER_ITEMS) return items;
  if (items.some((item) => typeof item.lat !== "number" || typeof item.lng !== "number")) return items;

  let best = items;
  let bestLength = pathLength(items as (T & { lat: number; lng: number })[]);
  let bestSame = items.length;
  for (const candidate of permutations(items)) {
    const length = pathLength(candidate as (T & { lat: number; lng: number })[]);
    const same = candidate.filter((item, i) => item === items[i]).length;
    if (length < bestLength - TIE_KM || (Math.abs(length - bestLength) <= TIE_KM && same > bestSame)) {
      best = candidate;
      bestLength = length;
      bestSame = same;
    }
  }
  return best;
}
