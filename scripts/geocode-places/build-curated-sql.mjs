// 직접 작성한 도시 40곳의 대표 좌표(manual-coords-part-*.json)를 검증해 마이그레이션 SQL로 쓴다.
//   bun scripts/geocode-places/build-curated-sql.mjs
// 빠진 키, 도시·목적지 반경을 벗어난 좌표, 서로 다른 장소가 같은 좌표로 겹친 경우는 SQL에서 빼고 알려 준다.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TRAVEL = join(HERE, "../travel-import");
const OUT_SQL = join(HERE, "../../supabase/migrations/20261029140000_add_curated_place_coordinates.sql");

// 도시 안 코스는 도시 중심에서, 근교는 목적지에서 이 거리 안이어야 한다(도시 밖 명소가 있어 도시 안은 넉넉히 둔다).
const CITY_RADIUS_KM = 80;
const NEARBY_RADIUS_KM = 60;
const DESTINATION_RADIUS_KM = 300;

function km(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const metas = JSON.parse(readFileSync(join(TRAVEL, "cities.json"), "utf8"));
const center = Object.fromEntries(metas.map((m) => [m.id, { lat: m.lat, lng: m.lng }]));

const curated = [];
for (const file of readdirSync(join(TRAVEL, "curated")).filter((f) => f.endsWith(".json"))) {
  curated.push(...JSON.parse(readFileSync(join(TRAVEL, "curated", file), "utf8")));
}

const manual = {};
for (const file of readdirSync(HERE).filter((f) => /^manual-coords-part-\d+\.json$/.test(f))) {
  Object.assign(manual, JSON.parse(readFileSync(join(HERE, file), "utf8")));
}

const problems = { missing: [], badFormat: [], outOfRadius: [], crowded: [] };
const rows = [];

function point(key) {
  const pair = manual[key];
  if (pair === undefined) return null;
  if (!Array.isArray(pair) || pair.length !== 2 || pair.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    problems.badFormat.push(key);
    return null;
  }
  const [lat, lng] = pair;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    problems.badFormat.push(key);
    return null;
  }
  return { lat, lng };
}

for (const city of curated) {
  const c = center[city.id];
  if (!c) continue;

  city.days.forEach((items, d) =>
    items.forEach((item, p) => {
      const key = `${city.id}/city/${d + 1}/${p + 1}`;
      const pt = point(key);
      if (!pt) return void (manual[key] === undefined && problems.missing.push(`${key} ${item.name}`));
      if (km(c, pt) > CITY_RADIUS_KM) return void problems.outOfRadius.push(`${key} ${item.name} ${Math.round(km(c, pt))}km`);
      rows.push({ id: city.id, section: "city", day: d + 1, pos: p + 1, name: item.name, ...pt });
    }),
  );

  city.nearby.forEach((trip, t) => {
    const destKey = `${city.id}/destination/${trip.destination}`;
    const dest = point(destKey);
    if (!dest) return void (manual[destKey] === undefined && problems.missing.push(destKey));
    if (km(c, dest) > DESTINATION_RADIUS_KM) {
      problems.outOfRadius.push(`${destKey} ${Math.round(km(c, dest))}km`);
      return;
    }
    trip.items.forEach((item, p) => {
      const key = `${city.id}/nearby/${t + 1}/${p + 1}`;
      const pt = point(key);
      if (!pt) return void (manual[key] === undefined && problems.missing.push(`${key} ${item.name}`));
      if (km(dest, pt) > NEARBY_RADIUS_KM) return void problems.outOfRadius.push(`${key} ${item.name} ${Math.round(km(dest, pt))}km`);
      rows.push({ id: city.id, section: "nearby", day: t + 1, pos: p + 1, name: item.name, ...pt });
    });
  });
}

// 서로 다른 장소가 같은 좌표(약 10m 안)로 겹치면 잘못 적은 것으로 보고 뺀다.
const spot = (r) => `${r.id}/${r.lat.toFixed(4)},${r.lng.toFixed(4)}`;
const crowd = {};
for (const r of rows) crowd[spot(r)] = (crowd[spot(r)] ?? 0) + 1;
const kept = rows.filter((r) => {
  if (crowd[spot(r)] > 1) {
    problems.crowded.push(`${r.id}/${r.section}/${r.day}/${r.pos} ${r.name}`);
    return false;
  }
  return true;
});

const q = (n) => Number(n).toFixed(6);
const values = kept.map((r) => `  ('${r.id}', '${r.section}', ${r.day}, ${r.pos}, ${q(r.lat)}, ${q(r.lng)})`).join(",\n");
writeFileSync(
  OUT_SQL,
  `-- 직접 작성한 도시 40곳 일정 장소의 대표 좌표. 지도 동선의 번호 핀과 이동 거리에 쓴다.
-- 유명 명소는 그 위치, 활동·구역 항목은 대표 지점이라 수십~수백 m의 오차가 있을 수 있다.
-- 좌표 원본은 scripts/geocode-places/manual-coords-part-*.json이고, build-curated-sql.mjs가 반경을 검증해 만들었다.
update public.city_places as p
set lat = v.lat, lng = v.lng
from (values
${values}
) as v (city_id, section, day_index, position, lat, lng)
where p.city_id = v.city_id
  and p.section = v.section
  and p.day_index = v.day_index
  and p.position = v.position;
`,
);

const total = curated.reduce(
  (n, c) => n + c.days.reduce((s, d) => s + d.length, 0) + c.nearby.reduce((s, t) => s + t.items.length, 0),
  0,
);
console.log(`좌표 ${kept.length} / 장소 ${total}`);
for (const [name, list] of Object.entries(problems)) {
  if (list.length) console.log(`${name} ${list.length}:`, list.slice(0, 30));
}
