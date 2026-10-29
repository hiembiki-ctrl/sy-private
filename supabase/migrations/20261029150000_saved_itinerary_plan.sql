-- 저장 일정에 사용자가 고친 방문 장소 목록을 담는다.
-- plan이 비어 있으면 도시 기본 일정 그대로이고, 있으면 일차별 장소 목록(1~7일차)이다.
alter table public.saved_itineraries
  add column if not exists plan jsonb
  check (plan is null or (jsonb_typeof(plan) = 'array' and jsonb_array_length(plan) between 1 and 7));

-- 수정은 plan 열만 허용한다. 소유자만 고칠 수 있다.
grant update (plan) on public.saved_itineraries to authenticated;

drop policy if exists "saved_itineraries_update_own" on public.saved_itineraries;
create policy "saved_itineraries_update_own"
  on public.saved_itineraries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
