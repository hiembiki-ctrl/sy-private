import { createClient } from "@supabase/supabase-js";

import {
  CITIES,
  type City,
  type ItineraryItem,
  type ItineraryKind,
  type NearbyTrip,
} from "@/lib/cities";

type CityRow = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  climate: string;
  best_season: string;
  recommended_min_days: number;
  recommended_max_days: number;
};

type PlaceRow = {
  city_id: string;
  section: "city" | "nearby";
  day_index: number;
  destination: string | null;
  position: number;
  name: string;
  summary: string;
  kind: ItineraryKind;
  source_url?: string | null;
  lat?: number | null;
  lng?: number | null;
};

const PAGE_SIZE = 1000;
const CITY_DAYS = 3;
const NEARBY_TRIPS = 4;

/** DB 행을 화면에서 쓰는 City로 조립한다. 일정이 모자란 도시는 화면이 깨지므로 뺀다. */
export function buildCities(cityRows: CityRow[], placeRows: PlaceRow[]): City[] {
  const cities: City[] = [];
  for (const row of cityRows) {
    const places = placeRows
      .filter((p) => p.city_id === row.id)
      .sort((a, b) => a.day_index - b.day_index || a.position - b.position);
    const toItem = (p: PlaceRow): ItineraryItem => ({
      name: p.name,
      summary: p.summary,
      kind: p.kind,
      ...(p.source_url ? { sourceUrl: p.source_url } : {}),
      ...(typeof p.lat === "number" && typeof p.lng === "number" ? { lat: p.lat, lng: p.lng } : {}),
    });

    const days = Array.from({ length: CITY_DAYS }, (_, i) =>
      places.filter((p) => p.section === "city" && p.day_index === i + 1).map(toItem),
    );
    const nearby: NearbyTrip[] = Array.from({ length: NEARBY_TRIPS }, (_, i) => {
      const items = places.filter((p) => p.section === "nearby" && p.day_index === i + 1);
      return { destination: items[0]?.destination ?? "", items: items.map(toItem) };
    });
    if (days.some((d) => d.length === 0) || nearby.some((t) => t.items.length === 0)) continue;

    cities.push({
      id: row.id,
      name: row.name,
      country: row.country,
      lat: row.lat,
      lng: row.lng,
      climate: row.climate,
      bestSeason: row.best_season,
      days: days as City["days"],
      nearby,
      recommendedDays: { min: row.recommended_min_days, max: row.recommended_max_days },
    });
  }
  return cities;
}

/**
 * 여행지 DB에서 도시 목록을 읽는다. 연결 설정이 없거나 읽기에 실패하거나 비어 있으면
 * 앱에 담긴 정적 데이터로 대신한다. 도시 열람은 DB 연결 여부에 의존하지 않는다.
 */
export async function loadCities(): Promise<City[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return CITIES;

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    // PostgREST는 한 번에 1000행까지만 주므로 장소는 나눠서 읽는다.
    const readPlaces = async (): Promise<PlaceRow[] | null> => {
      const rows: PlaceRow[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await client
          .from("city_places")
          .select("*")
          .order("id")
          .range(from, from + PAGE_SIZE - 1);
        if (error) return null;
        rows.push(...(data as PlaceRow[]));
        if (data.length < PAGE_SIZE) return rows;
      }
    };
    const [cityRes, places] = await Promise.all([
      client.from("cities").select("*").order("sort_order"),
      readPlaces(),
    ]);
    if (cityRes.error || !places) return CITIES;
    const cities = buildCities(cityRes.data as CityRow[], places);
    return cities.length > 0 ? cities : CITIES;
  } catch {
    return CITIES;
  }
}
