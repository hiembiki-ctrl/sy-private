-- 저장 일정의 도시 목록 하드코딩 제약을 cities 외래 키로 바꾼다.
-- 시드 뒤에 실행해야 기존 행이 통과한다. 이제 도시를 추가해도 이 테이블을 고칠 필요가 없다.
alter table public.saved_itineraries
  drop constraint if exists saved_itineraries_city_id_check;

alter table public.saved_itineraries
  drop constraint if exists saved_itineraries_city_id_fkey;

alter table public.saved_itineraries
  add constraint saved_itineraries_city_id_fkey
  foreign key (city_id) references public.cities (id) on delete cascade;
