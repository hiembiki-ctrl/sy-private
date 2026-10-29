import type { SupabaseClient } from "@supabase/supabase-js";

import type { Days, DayPlan, ItineraryItem } from "@/lib/cities";

export type SavedItinerary = {
  id: number;
  cityId: string;
  days: Days;
  createdAt: string;
  /** 사용자가 고친 일차별 장소. 없으면 도시 기본 일정 그대로다. */
  plan?: DayPlan[];
};

type Row = { id: number; city_id: string; days: number; created_at: string; plan?: unknown };

const TABLE = "saved_itineraries";
// Postgres의 unique_violation: 이미 저장한 조합이다.
const DUPLICATE = "23505";

function isItem(value: unknown): value is ItineraryItem {
  const item = value as ItineraryItem | null;
  return (
    !!item &&
    typeof item.name === "string" &&
    typeof item.summary === "string" &&
    (item.kind === "명소" || item.kind === "액티비티")
  );
}

// 저장소의 값은 믿지 않고 모양이 맞을 때만 쓴다. 맞지 않으면 기본 일정으로 보여 준다.
function parsePlan(raw: unknown, days: number): DayPlan[] | undefined {
  if (!Array.isArray(raw) || raw.length !== days) return undefined;
  const plans: DayPlan[] = [];
  for (const [index, day] of raw.entries()) {
    if (!day || !Array.isArray(day.items) || !day.items.every(isItem)) return undefined;
    plans.push({
      day: index + 1,
      ...(typeof day.destination === "string" ? { destination: day.destination } : {}),
      items: day.items,
    });
  }
  return plans;
}

// 최근에 저장한 것이 위에 오도록 id 내림차순으로 읽는다.
export async function listSavedItineraries(client: SupabaseClient): Promise<SavedItinerary[]> {
  const { data, error } = await client
    .from(TABLE)
    .select("id, city_id, days, created_at, plan")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map((row) => {
    const plan = parsePlan(row.plan, row.days);
    return {
      id: row.id,
      cityId: row.city_id,
      days: row.days as Days,
      createdAt: row.created_at,
      ...(plan ? { plan } : {}),
    };
  });
}

export async function saveItinerary(
  client: SupabaseClient,
  cityId: string,
  days: Days,
  plan?: DayPlan[],
): Promise<void> {
  const { error } = await client
    .from(TABLE)
    .insert({ city_id: cityId, days, ...(plan ? { plan } : {}) });
  if (error && error.code !== DUPLICATE) throw error;
}

export async function updateSavedPlan(
  client: SupabaseClient,
  id: number,
  plan: DayPlan[],
): Promise<void> {
  const { error } = await client.from(TABLE).update({ plan }).eq("id", id);
  if (error) throw error;
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
