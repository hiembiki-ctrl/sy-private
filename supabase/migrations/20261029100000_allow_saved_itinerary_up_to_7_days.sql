-- 저장 가능한 일수를 1~3일에서 1~7일로 넓힌다.
-- 제약만 바꾸므로 이미 저장된 행과 RLS 정책, 권한은 그대로다.
alter table public.saved_itineraries
  drop constraint if exists saved_itineraries_days_check;

alter table public.saved_itineraries
  add constraint saved_itineraries_days_check check (days between 1 and 7);
