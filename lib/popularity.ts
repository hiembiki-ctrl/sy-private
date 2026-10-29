import type { City } from "@/lib/cities";

// 영어판 위키백과의 도시 문서 제목. 여행 관심도를 재는 대리 지표로 쓴다.
const WIKI_TITLES: Record<string, string> = {
  tokyo: "Tokyo",
  paris: "Paris",
  "new-york": "New_York_City",
  bangkok: "Bangkok",
  lisbon: "Lisbon",
  istanbul: "Istanbul",
  marrakech: "Marrakesh",
  cusco: "Cusco",
  hanoi: "Hanoi",
  "cape-town": "Cape_Town",
};

const POPULAR_COUNT = 3;
const WINDOW_DAYS = 7;
const TIMEOUT_MS = 3000;

export type RankedCities = { cities: City[]; popularIds: string[] };

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

async function fetchWeeklyViews(title: string): Promise<number | null> {
  // 당일 값은 아직 집계되지 않으므로 어제까지 최근 7일을 합산한다.
  const end = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - (WINDOW_DAYS - 1) * 24 * 60 * 60 * 1000);
  const url =
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/" +
    `${encodeURIComponent(title)}/daily/${toYmd(start)}/${toYmd(end)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "one-click-travel-planner (study project)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { items?: { views: number }[] };
    return (body.items ?? []).reduce((sum, item) => sum + item.views, 0);
  } catch {
    return null;
  }
}

/** 조회수 많은 순으로 정렬하고 상위 도시를 인기로 표시한다. 조회수를 못 구한 도시는 원래 순서로 뒤에 둔다. */
export function rankByViews(cities: City[], views: Record<string, number | null>): RankedCities {
  const known = cities.filter((c) => views[c.id] != null);
  if (known.length === 0) return { cities, popularIds: [] };
  const ranked = [...known].sort((a, b) => (views[b.id] ?? 0) - (views[a.id] ?? 0));
  const rest = cities.filter((c) => views[c.id] == null);
  return {
    cities: [...ranked, ...rest],
    popularIds: ranked.slice(0, POPULAR_COUNT).map((c) => c.id),
  };
}

/** 접속 시점 기준 최근 관심도 순으로 도시를 정렬한다. 조회에 실패하면 원래 순서를 그대로 쓴다. */
export async function rankByPopularity(cities: City[]): Promise<RankedCities> {
  const entries = await Promise.all(
    cities.map(async (c) => {
      const title = WIKI_TITLES[c.id];
      return [c.id, title ? await fetchWeeklyViews(title) : null] as const;
    }),
  );
  return rankByViews(cities, Object.fromEntries(entries));
}
