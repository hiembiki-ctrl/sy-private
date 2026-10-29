import type { SupabaseClient } from "@supabase/supabase-js";

import type { Days } from "@/lib/cities";

export type SavedItinerary = {
  id: number;
  cityId: string;
  days: Days;
  createdAt: string;
};

type Row = { id: number; city_id: string; days: number; created_at: string };

const TABLE = "saved_itineraries";
// Postgres의 unique_violation: 이미 저장한 조합이다.
const DUPLICATE = "23505";

// 최근에 저장한 것이 위에 오도록 id 내림차순으로 읽는다.
export async function listSavedItineraries(client: SupabaseClient): Promise<SavedItinerary[]> {
  const { data, error } = await client
    .from(TABLE)
    .select("id, city_id, days, created_at")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map((row) => ({
    id: row.id,
    cityId: row.city_id,
    days: row.days as Days,
    createdAt: row.created_at,
  }));
}

export async function saveItinerary(
  client: SupabaseClient,
  cityId: string,
  days: Days,
): Promise<void> {
  const { error } = await client.from(TABLE).insert({ city_id: cityId, days });
  if (error && error.code !== DUPLICATE) throw error;
}

export async function removeSavedItinerary(client: SupabaseClient, id: number): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export function findSaved(
  list: SavedItinerary[],
  cityId: string,
  days: Days,
): SavedItinerary | undefined {
  return list.find((item) => item.cityId === cityId && item.days === days);
}
