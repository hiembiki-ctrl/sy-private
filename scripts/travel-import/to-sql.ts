// cities.json(도시 메타)과 curated/part-*.json(직접 작성한 일정)으로 시드 마이그레이션 SQL을 만든다.
//   bun scripts/travel-import/to-sql.ts <출력 파일>
// 하루 코스가 3일 미만이거나 근교가 4곳 미만인 도시는 화면이 깨지므로 빼고 알려 준다.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Item = { name: string; summary: string; kind: "명소" | "액티비티" };
type Curated = {
  id: string;
  days: Item[][];
  nearby: { destination: string; items: Item[] }[];
};
type CityMeta = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  climate: string;
  bestSeason: string;
  recommendedDays: { min: number; max: number };
};

const FIRST_SORT_ORDER = 11; // 기존 도시 10곳 다음부터 이어 붙인다.

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const dir = import.meta.dir;
const metas: CityMeta[] = JSON.parse(readFileSync(join(dir, "cities.json"), "utf8"));
const curated = new Map<string, Curated>();
for (const file of readdirSync(join(dir, "curated")).filter((f) => f.endsWith(".json"))) {
  for (const city of JSON.parse(readFileSync(join(dir, "curated", file), "utf8")) as Curated[]) {
    curated.set(city.id, city);
  }
}
const outFile = process.argv[2];
if (!outFile) throw new Error("출력 파일 경로를 넘겨 주세요.");

const cityRows: string[] = [];
const placeRows: string[] = [];
const ids: string[] = [];
const skipped: string[] = [];

for (const meta of metas) {
  const data = curated.get(meta.id);
  const days = data?.days.filter((d) => d.length > 0) ?? [];
  const nearby = data?.nearby.filter((n) => n.items.length > 0) ?? [];
  if (days.length < 3 || nearby.length < 4) {
    skipped.push(`${meta.id} (도시 ${days.length}일, 근교 ${nearby.length}곳)`);
    continue;
  }
  ids.push(meta.id);
  cityRows.push(
    `  (${q(meta.id)}, ${q(meta.name)}, ${q(meta.country)}, ${meta.lat}, ${meta.lng}, ${q(meta.climate)}, ${q(meta.bestSeason)}, ${meta.recommendedDays.min}, ${meta.recommendedDays.max}, ${FIRST_SORT_ORDER + ids.length - 1})`,
  );
  const add = (section: "city" | "nearby", day: number, destination: string | null, items: Item[]) => {
    items.forEach((p, i) => {
      placeRows.push(
        `  (${q(meta.id)}, '${section}', ${day}, ${destination ? q(destination) : "null"}, ${i + 1}, ${q(p.name)}, ${q(p.summary)}, ${q(p.kind)})`,
      );
    });
  };
  days.slice(0, 3).forEach((items, d) => add("city", d + 1, null, items));
  nearby.slice(0, 4).forEach((n, d) => add("nearby", d + 1, n.destination, n.items));
}

const sql = `-- 도시 ${ids.length}곳의 일정. 직접 작성한 콘텐츠이며 scripts/travel-import로 만들었다.
-- 다시 실행해도 같은 결과가 되도록 도시는 upsert하고 이 도시들의 장소는 지우고 다시 넣는다.

insert into public.cities (id, name, country, lat, lng, climate, best_season, recommended_min_days, recommended_max_days, sort_order) values
${cityRows.join(",\n")}
on conflict (id) do update set name = excluded.name, country = excluded.country, lat = excluded.lat, lng = excluded.lng, climate = excluded.climate, best_season = excluded.best_season, recommended_min_days = excluded.recommended_min_days, recommended_max_days = excluded.recommended_max_days, sort_order = excluded.sort_order;

delete from public.city_places where city_id in (${ids.map(q).join(", ")});

insert into public.city_places (city_id, section, day_index, destination, position, name, summary, kind) values
${placeRows.join(",\n")};
`;

writeFileSync(outFile, sql);
console.log(`도시 ${ids.length}곳, 장소 ${placeRows.length}건`);
if (skipped.length > 0) console.log("제외된 도시:", skipped.join(", "));
