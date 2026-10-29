# 01 — 일수를 골라 코스와 근교 보기

## Outcome

도시를 고른 사용자가 일정 카드의 "여행 일수" 드롭다운에서 1~7일을 고르면, 그 수만큼 일차별 코스가 방문 순서 번호와 함께 보인다. 4일차부터는 "N일차 · 근교: 목적지" 당일치기 코스(2~3개 항목)가 이어지고, 도시 정보 줄에 추천 일수가 작게 보인다. 지금의 1·2·3일 탭은 없어진다. 도시 10곳의 4~7일차 근교 코스와 추천 일수 데이터도 이 작업에서 함께 만든다. 저장 동작은 건드리지 않는다.

## Blockers

None.

## Acceptance criteria

- [x] 도시를 선택하면 "여행 일수" 드롭다운이 보이고 1일~7일 7개 선택지가 있으며, 1·2·3일 탭은 보이지 않는다. (스펙 1)
- [x] 처음 도시를 고르면 1일이고 1일차 한 구역만 보인다. N일을 고르면 N개 구역이 순서대로 보이고, 줄이면 해당 구역이 사라진다. (2)
- [x] 일수를 5일로 바꾼 뒤 다른 도시를 고르면 새 도시도 5일 일정이 보인다. (3)
- [x] 10개 도시 모두에서 1~7일 어느 일수를 골라도 모든 일차가 비어 있지 않다. (4)
- [x] 각 일차 항목에 1부터 시작하는 방문 순서 번호, 이름, 한 줄 설명, 종류가 보인다. (5)
- [x] 1~3일에는 근교 표시가 없고, 4일 이상이면 4일차부터 제목에 "근교: 목적지 이름"이 보이며 그 일차는 도시 밖 근교 코스(2~3개 항목)다. 7일이면 4~7일차가 근교 일차다. (6)
- [x] 지원 도시 10곳 모두 도시 정보에 "추천 N~M일"이 작게 보인다. (7)
- [x] 로그인하지 않아도 일수 선택, 코스, 근교, 추천 일수가 모두 보인다. (10)
- [x] 좁은 화면(약 390px)에서 드롭다운과 일차 구역이 가려지지 않고 가로 스크롤이 없다. (11)
- [x] 드롭다운은 키보드로 열고 방향키로 고르고 확정할 수 있으며 "여행 일수"라는 이름이 붙어 있다. (12)

## Constraints

- 콘텐츠는 계속 앱에 담긴 정적 데이터에서 읽는다. [itinerary-content-source](../../../decisions/itinerary-content-source.md)를 바꾸지 않는다. 도시마다 서로 다른 근교 목적지 4곳을 쓰고, 당일로 다녀올 수 있는 곳만 고른다.
- 일반 UI(드롭다운, 추천 일수 표시, 일차 구역)는 [ui-composition](../../../decisions/ui-composition.md)을 따른다.
- 용어는 [GLOSSARY.md](../../../../GLOSSARY.md)의 일정, 일수, 코스, 근교 일정, 추천 일수를 따른다.
- 일차 제목은 "N일차", 근교는 "N일차 · 근교: 목적지"이고 드롭다운 선택지는 "1일"처럼 일수만 적는다.
- 이 작업은 저장 동작과 저장소 제약(1~3일)을 바꾸지 않는다. 4~7일 저장은 02가 맡는다.
- 지구본 지도, 도시 점 선택과 이동, 로그인 방식은 바꾸지 않는다.

## Verification

- 단위 테스트: 도시 10곳 × 1~7일에서 모든 일차가 비어 있지 않음, 근교는 4일차부터만 나타남, 근교 일차는 2~3개 항목, 모든 도시에 추천 일수가 있음.
- 컴포넌트 테스트: 드롭다운 선택지 7개, 일수 증감에 따른 구역 수, 도시를 바꿔도 일수 유지, 로그아웃 상태에서도 보임.
- `bun run typecheck`, `bun run lint`, `bunx vitest run`이 통과한다.
- `next-dev-loop`로 실제 브라우저에서 390px 화면과 키보드 조작을 확인한다.

## Review checkpoint

None.

## Status

<!-- Current values: `pending`, `in-progress`, `completed`, `blocked`, or
`superseded`.
`completed` is valid only while all acceptance criteria and focused
verification pass. Use `superseded` only after an approved replacement of a
task with recorded completion history. Preserve its Execution evidence and name
the replacement and reason under Revision; it is then terminal for that approved
breakdown and outside the current delivery map. -->
completed

## Execution

<!-- Append concise evidence and preserve earlier entries when status changes.
Execution Blocker is the current impediment for an active task, not a declared
task dependency. In a superseded task, preserved entries are historical. -->
- Verification: 단위 테스트 62개, typecheck, lint 통과(도시 10곳 × 1~7일 비어 있지 않음, 근교는 4일차부터이고 목적지 4곳이 서로 다름, 추천 일수, 드롭다운 선택지 7개, 일수 증감과 도시 변경 시 유지, 방문 순서 번호). 실제 브라우저에서 파리 7일 4~7일차 근교 제목, 도쿄로 바꿔도 7일 유지, 추천 일수 표시, 탭 없음, 390px에서 가로 스크롤 없음을 확인했다. 드롭다운은 shadcn native-select라 키보드 열기와 방향키 선택은 브라우저 기본 동작이다.
- Revision: 1~3일차에 섞여 있던 근교성 항목(베르사유, 신트라, 호카 곶, 아틀라스·아가파이, 성스러운 계곡·마라스, 하롱베이, 스텔렌보쉬, 담넌 사두악)을 도시 안 코스로 교체했다. 스펙의 "1~3일차는 도시 안 코스"와 근교 목적지 중복을 막기 위한 것이다.
- Blocker: —
