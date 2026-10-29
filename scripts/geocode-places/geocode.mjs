// 일정에 쓰는 장소의 좌표를 Wikidata와 OpenStreetMap(Nominatim)에서 찾아 coords.json과
// 마이그레이션 SQL로 쓴다. 지도 동선의 번호 핀에 쓰는 값이다.
//   bun scripts/geocode-places/geocode.mjs
// 도시(또는 근교 목적지) 근처에서 찾은 결과만 받아들이고, 못 찾은 장소는 좌표 없이 둔다.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CITIES } from "../../lib/cities.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(HERE, "coords.json");
const OUT_SQL = join(HERE, "../../supabase/migrations/20261029130000_add_place_coordinates.sql");
const UA = "sy-private-geocode/0.1 (sangyoon90.kim@lge.com)";

// 도시 안 장소는 도시 중심에서, 근교 장소는 목적지에서 이 거리 안에 있어야 받아들인다.
const CITY_RADIUS_KM = 40;
const DESTINATION_RADIUS_KM = 200;
const NEARBY_RADIUS_KM = 60;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function km(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    return res.json();
  }
  return null;
}

async function wikidataCandidates(query) {
  const search = await getJson(
    "https://www.wikidata.org/w/api.php?" +
      new URLSearchParams({
        action: "wbsearchentities",
        search: query,
        language: "ko",
        uselang: "ko",
        type: "item",
        limit: "6",
        format: "json",
      }),
  );
  const ids = (search?.search ?? []).map((s) => s.id);
  if (ids.length === 0) return [];
  await sleep(200);
  const entities = await getJson(
    "https://www.wikidata.org/w/api.php?" +
      new URLSearchParams({
        action: "wbgetentities",
        ids: ids.join("|"),
        props: "claims|labels",
        languages: "ko|en",
        format: "json",
      }),
  );
  const found = [];
  for (const id of ids) {
    const entity = entities?.entities?.[id];
    const coord = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    if (!coord) continue;
    found.push({
      lat: coord.latitude,
      lng: coord.longitude,
      label: entity.labels?.ko?.value ?? entity.labels?.en?.value ?? id,
      source: `wikidata:${id}`,
    });
  }
  return found;
}

let lastNominatim = 0;
async function nominatimCandidates(query) {
  const wait = 1100 - (Date.now() - lastNominatim);
  if (wait > 0) await sleep(wait);
  lastNominatim = Date.now();
  const rows = await getJson(
    "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ q: query, format: "jsonv2", limit: "4", "accept-language": "ko" }),
  );
  return (rows ?? []).map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lon),
    label: r.display_name,
    source: `osm:${r.osm_type}/${r.osm_id}`,
  }));
}

/** anchor에서 radius 안에 있는 후보 중 가장 가까운 것. */
function pickNear(candidates, anchor, radius) {
  const near = candidates
    .map((c) => ({ ...c, away: km(anchor, c) }))
    .filter((c) => c.away <= radius)
    .sort((a, b) => a.away - b.away);
  return near[0] ?? null;
}

// "센소지와 아사쿠사", "스미다강 크루즈"처럼 복합 표현은 정확한 이름 검색에 걸리지 않으므로,
// 가운데점과 "와/과"로 쪼개고 꼬리말(크루즈, 투어, 산책 …)을 뗀 검색어를 차례로 시도한다.
const TAIL = /s*(당일 여행|당일 투어|투어|크루즈|산책|탐방|걷기|타기|맛보기|체험|구경|드라이브|전망|일몰|시음|식사|교실|트레킹|관찰|보트)$/;
function queryVariants(name) {
  const plain = name.replace(/(.*?)/g, " ").trim();
  const parts = plain.split(/ ?[·,] ?|(?<=S)[와과] (?=S)/).map((x) => x.trim()).filter(Boolean);
  const alias = [...name.matchAll(/((.*?))/g)].map((m) => m[1].trim());
  const variants = [plain, ...alias, ...parts, ...parts.map((x) => x.replace(TAIL, "").trim())];
  return [...new Set(variants)].filter((v) => v.length >= 2).slice(0, 4);
}

async function locate(name, hint, anchor, radius) {
  const variants = queryVariants(name);
  for (const v of variants) {
    const wd = pickNear(await wikidataCandidates(v), anchor, radius);
    if (wd) return wd;
  }
  for (const v of variants.slice(0, 2)) {
    // 이름이 일치하는 결과만 받는다. 힌트(도시 이름)만 맞는 엉뚱한 장소나 도시 전체를 막기 위해서다.
    const named = (await nominatimCandidates(`${v}, ${hint}`)).filter((c) => c.label.includes(v));
    const osm = pickNear(named, anchor, radius);
    if (osm) return osm;
  }
  return null;
}

/** OSM에서 얻은 결과는 장소 이름(또는 검색어)이 결과 이름에 들어 있을 때만 믿는다. Wikidata는 이름 검색이라 그대로 믿는다. */
function trusted(found, name) {
  if (!found) return null;
  if (!found.source.startsWith("osm:")) return found;
  return queryVariants(name).some((v) => found.label.includes(v)) ? found : null;
}

// 자동으로 못 찾은 장소는 직접 적은 대표 좌표로 채운다. 도시·목적지 반경 검증은 그대로 거친다.
const MANUAL_JSON = join(HERE, "manual-coords.json");
const manual = existsSync(MANUAL_JSON) ? JSON.parse(readFileSync(MANUAL_JSON, "utf8")) : {};
const rejectedManual = [];

function withManual(found, city, place) {
  if (found) return found;
  const pair = manual[`${city.id}/${place.section}/${place.day}/${place.pos}`];
  if (!pair) return null;
  const point = { lat: pair[0], lng: pair[1], label: place.name, source: "manual" };
  // 직접 적은 좌표는 오타를 거르는 용도라 도시 안 코스는 반경을 넓게 본다(희망봉처럼 도시 밖 명소도 있다).
  const radius = place.section === "city" ? Math.max(place.radius, 80) : place.radius;
  const ok = pickNear([point], place.anchor, radius);
  if (!ok) rejectedManual.push(`${city.id}/${place.section}/${place.day}/${place.pos} ${place.name}`);
  return ok;
}

const cache = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : {};
const results = [];
const RETRY = process.env.RETRY === "1";

for (const city of CITIES) {
  const center = { lat: city.lat, lng: city.lng };
  const places = [];
  city.days.forEach((items, d) =>
    items.forEach((item, p) =>
      places.push({ section: "city", day: d + 1, pos: p + 1, name: item.name, anchor: center, radius: CITY_RADIUS_KM, hint: city.name }),
    ),
  );
  for (const [t, trip] of city.nearby.entries()) {
    const key = `${city.id}/destination/${trip.destination}`;
    // 목적지 좌표는 직접 적은 값을 우선한다. 자동 검색은 목적지를 도시 전체로 잘못 잡는 일이 있다.
    const manualDest = manual[key];
    if (manualDest) cache[key] = { lat: manualDest[0], lng: manualDest[1], label: trip.destination, source: "manual" };
    else if (cache[key] === undefined || (RETRY && cache[key] === null)) {
      cache[key] = await locate(trip.destination, city.name, center, DESTINATION_RADIUS_KM);
      writeFileSync(OUT_JSON, JSON.stringify(cache, null, 1));
    }
    const dest = manualDest ? cache[key] : trusted(cache[key], trip.destination);
    // 목적지를 못 찾으면 도시 중심에서 넓게 찾는다.
    const anchor = dest ? { lat: dest.lat, lng: dest.lng } : center;
    const radius = dest ? NEARBY_RADIUS_KM : DESTINATION_RADIUS_KM;
    trip.items.forEach((item, p) =>
      places.push({ section: "nearby", day: t + 1, pos: p + 1, name: item.name, anchor, radius, hint: trip.destination }),
    );
  }

  for (const place of places) {
    const key = `${city.id}/${place.section}/${place.day}/${place.pos}/${place.name}`;
    if (cache[key] === undefined || (RETRY && cache[key] === null)) {
      cache[key] = await locate(place.name, place.hint, place.anchor, place.radius);
      writeFileSync(OUT_JSON, JSON.stringify(cache, null, 1));
      process.stdout.write(`${cache[key] ? "O" : "-"}`);
    }
    results.push({ cityId: city.id, ...place, found: withManual(trusted(cache[key], place.name), city, place) });
  }
  process.stdout.write(`\n${city.name}\n`);
}

// 서로 다른 장소가 같은 좌표(약 10m 안)로 모이면 잘못 맞춘 것으로 보고 모두 뺀다.
const spot = (r) => `${r.cityId}/${r.found.lat.toFixed(4)},${r.found.lng.toFixed(4)}`;
const crowd = {};
for (const r of results) if (r.found) crowd[spot(r)] = (crowd[spot(r)] ?? 0) + 1;
for (const r of results) if (r.found && crowd[spot(r)] > 1) r.found = null;

const matched = results.filter((r) => r.found);
if (rejectedManual.length) console.log("반경 밖이라 뺀 직접 좌표:", rejectedManual);
console.log(`찾은 장소 ${matched.length} / ${results.length}`);

const q = (n) => Number(n).toFixed(6);
const values = matched
  .map((r) => `  ('${r.cityId}', '${r.section}', ${r.day}, ${r.pos}, ${q(r.found.lat)}, ${q(r.found.lng)})`)
  .join(",\n");
writeFileSync(
  OUT_SQL,
  `-- 일정 장소의 좌표. 지도 동선의 번호 핀과 이동 거리에 쓴다.
-- Wikidata와 OpenStreetMap에서 도시(근교는 목적지) 근처 결과를 받아 채우고, 못 찾은 장소는 직접 적은
-- 대표 좌표로 채웠다. 대표 좌표는 활동·구역 항목의 대략적인 위치라 수십~수백 m의 오차가 있을 수 있다.
-- 출처는 scripts/geocode-places/coords.json과 manual-coords.json에 남겼다.
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
console.log(`SQL 작성: ${OUT_SQL}`);
