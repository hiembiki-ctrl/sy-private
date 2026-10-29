-- 장소의 좌표와 출처 문서 링크.
-- 좌표는 지도 동선에 쓰고, 출처 링크는 외부 글에서 가져온 장소에만 채운다. 직접 작성한 장소는 비워 둔다.
alter table public.city_places
  add column if not exists lat double precision check (lat between -90 and 90),
  add column if not exists lng double precision check (lng between -180 and 180),
  add column if not exists source_url text;
