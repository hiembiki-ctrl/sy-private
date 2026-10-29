-- 여행지 카탈로그: 도시와 그 도시의 명소·액티비티.
-- 누구나 읽을 수 있고(anon 포함), 쓰기는 대시보드나 service role 등 RLS를 우회하는 경로로만 한다.

create table if not exists public.cities (
  id text primary key,
  name text not null,
  country text not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  climate text not null,
  best_season text not null,
  recommended_min_days smallint not null check (recommended_min_days between 1 and 7),
  recommended_max_days smallint not null check (recommended_max_days between 1 and 7),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (recommended_min_days <= recommended_max_days)
);

-- 도시 안 하루 코스(section = 'city', day_index 1~3)와
-- 근교 당일치기(section = 'nearby', day_index 1~4, destination 필수)를 한 테이블에 담는다.
create table if not exists public.city_places (
  id bigint generated always as identity primary key,
  city_id text not null references public.cities (id) on delete cascade,
  section text not null check (section in ('city', 'nearby')),
  day_index smallint not null check (day_index between 1 and 4),
  destination text,
  position smallint not null check (position >= 1),
  name text not null,
  summary text not null,
  kind text not null check (kind in ('명소', '액티비티')),
  created_at timestamptz not null default now(),
  check ((section = 'nearby') = (destination is not null)),
  -- 도시 id가 맨 앞이라 city_id 외래 키 조회와 도시별 목록 조회의 인덱스도 겸한다.
  unique (city_id, section, day_index, position)
);

alter table public.cities enable row level security;
alter table public.city_places enable row level security;

revoke all on public.cities, public.city_places from anon, authenticated;
grant select on public.cities, public.city_places to anon, authenticated;

drop policy if exists "cities_select_all" on public.cities;
create policy "cities_select_all"
  on public.cities
  for select
  to anon, authenticated
  using (true);

drop policy if exists "city_places_select_all" on public.city_places;
create policy "city_places_select_all"
  on public.city_places
  for select
  to anon, authenticated
  using (true);

