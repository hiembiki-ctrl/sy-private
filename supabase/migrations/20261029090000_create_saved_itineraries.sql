-- 저장 일정: 로그인한 사용자가 저장한 도시와 일수 한 쌍.
-- 소유자만 읽고 쓰고 지울 수 있고, 로그인하지 않은 요청(anon)은 접근할 수 없다.

create table if not exists public.saved_itineraries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 지원 도시 10곳과 1~3일만 저장한다. 도시를 추가하면 이 목록도 함께 고친다.
  city_id text not null check (
    city_id in (
      'tokyo', 'paris', 'new-york', 'bangkok', 'lisbon',
      'istanbul', 'marrakech', 'cusco', 'hanoi', 'cape-town'
    )
  ),
  days smallint not null check (days between 1 and 3),
  created_at timestamptz not null default now(),
  -- 같은 사용자의 같은 도시·일수 조합은 한 번만 저장한다.
  -- user_id가 맨 앞이라 user_id 외래 키 조회와 사용자별 목록 조회의 인덱스도 겸한다.
  unique (user_id, city_id, days)
);

alter table public.saved_itineraries enable row level security;

-- 새 테이블은 Data API에 자동으로 열리지 않으므로 필요한 권한만 로그인한 사용자에게 준다.
-- 저장 일정은 수정하지 않으므로 update 권한은 주지 않는다.
revoke all on public.saved_itineraries from anon, authenticated;
grant select, insert, delete on public.saved_itineraries to authenticated;

drop policy if exists "saved_itineraries_select_own" on public.saved_itineraries;
create policy "saved_itineraries_select_own"
  on public.saved_itineraries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "saved_itineraries_insert_own" on public.saved_itineraries;
create policy "saved_itineraries_insert_own"
  on public.saved_itineraries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "saved_itineraries_delete_own" on public.saved_itineraries;
create policy "saved_itineraries_delete_own"
  on public.saved_itineraries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
