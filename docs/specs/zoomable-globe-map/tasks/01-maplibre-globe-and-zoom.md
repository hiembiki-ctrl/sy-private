# 01 — MapLibre 지구본과 확대

## Outcome

지금의 고정 텍스처 지구본(react-globe.gl)이 MapLibre GL JS 지도로 바뀐다. 멀리서는 돌릴 수 있는 지구본이고, 확대하면 같은 지도에서 도로와 지명이 선명한 상세 지도가 나타난다. 적도와 남북회귀선이 지구본 단계에서 보이고, 지도 제공처의 출처 표기가 항상 보인다. 도시 선택은 이 작업에서도 도시 목록으로 지금처럼 동작한다. 교체 뒤에는 쓰지 않는 기존 지구본 라이브러리와 지구 텍스처 이미지를 앱에서 없앤다. 도시 점과 이름표는 02에서 다룬다.

## Blockers

None.

## Acceptance criteria

- [x] 첫 화면에서 지구본과 적도·남북회귀선이 보인다. (스펙 기준 1의 지도 부분)
- [x] 드래그로 지구본이 돌아가고, 휠·트랙패드·핀치·더블 클릭·확대·축소 버튼 중 어느 방법으로든 확대·축소할 수 있다. (3)
- [x] 확대하는 동안 지도가 단계적으로 선명해져 도시 수준에서 도로와 지명을 읽을 수 있고, 가장 가까운 시점에서도 이미지가 뭉개지거나 깨진 격자로 보이지 않는다. 최대로 축소하면 지구 전체가 한눈에 보인다. (3, 7의 축소 부분)
- [x] 지명이 가능하면 한국어로 보이고, 지도 제공처의 출처 표기(OpenFreeMap, OpenMapTiles, OpenStreetMap)가 항상 보이며 가려지지 않는다. (12)
- [x] 일수 변경이나 도시 목록 선택으로 지도가 다시 만들어지거나 깜박이지 않고, 한 번의 방문에서 지도 초기화는 한 번이다. (8)
- [x] 지도 제공처에 연결할 수 없으면 지도 영역에 실패 안내가 보이고, 도시 목록으로 도시를 골라 일정을 보는 흐름은 정상 동작한다. (9)
- [x] 지도에 필요한 API 키, 계정, 액세스 토큰이 없고 비밀값이 코드나 저장소에 없다. (12)
- [x] 좁은 화면(약 390px)에서도 드래그·핀치·확대·축소 버튼이 동작하고 가로 스크롤이 없으며, 지도 밖을 만지면 페이지가 스크롤된다. (10의 지도 부분)
- [x] react-globe.gl과 고정 지구 텍스처 이미지가 앱에서 더 이상 쓰이지 않고 제거되어 있다.
- [x] 도시 선택, 일수 선택, 일정 열람 쪽 동작은 이전과 같다.

## Constraints

- 지도 방식, 타일·스타일 제공처, 출처 표기, 지도 초기화 횟수는 [map-surface](../../../decisions/map-surface.md)가 정한다.
- 일반 UI(확대·축소 버튼, 실패 안내)는 [ui-composition](../../../decisions/ui-composition.md)을 따른다.
- 타일과 스타일 주소는 한곳에서 정한다.
- 구현 전에 임시 폴더에서 `maplibre-gl`이 이 프로젝트의 Next.js 16과 React 19에서 동작하는지 먼저 확인한다. 안 되면 연동 방식을 사용자와 다시 정한다.
- 로그인과 저장은 범위 밖이다.

## Verification

- 지도 정상 상태와 실패 상태에서 화면이 올바른 것을 단위 테스트로 확인한다. 지도 라이브러리는 가짜로 대체한다.
- `bun run typecheck`, `bun run lint`, `bunx vitest run`이 모두 통과한다.
- 실제 브라우저에서 지구본, 회전, 확대와 선명도, 한국어 지명, 출처 표기, 지도 요청을 막았을 때의 실패 안내와 도시 목록 열람, 390px 화면을 확인한다.

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
- Verification: 단위 테스트 26개, typecheck, lint 통과. 브라우저(약 474px 폭)에서 확인: 지구본과 적도·회귀선(점선), 한국어 지명(영국·스페인·튀르키예 등), 출처 표기(OpenFreeMap © OpenMapTiles Data from OpenStreetMap) 항상 펼침, 확대 버튼으로 약 11단계 확대 시 벡터 지도가 뭉개지지 않고 선명, 도시 목록·일수 변경 중 canvas가 그대로(지도 1회 초기화), 스타일 주소를 막은 서버에서 실패 안내가 보이고 목록으로 일정 열람 정상. 390px 화면(가로 스크롤 없음, 지도 358×352, 확대·축소 버튼과 출처 표기 보임)에서 마우스 드래그로 지구본이 돌아가고, 휠로 확대되며 페이지는 스크롤되지 않고, 지도 밖을 스크롤하면 페이지가 움직였다. 확대·축소를 8번 눌러도 minZoom 1에서 멈추고 지구 전체가 한눈에 보인다(처음에는 minZoom이 없어 지구가 점처럼 작아져 minZoom: 1을 추가해 고쳤다). 터치 핀치는 마우스 에뮬레이션 환경이라 직접 확인하지 못했다. 이후 전체 단위 테스트 통과(다른 세션의 로그인 작업 포함 39개). 이 시점에 typecheck가 components/auth/auth-control 누락으로 실패했는데, 다른 세션이 진행 중인 로그인 작업 파일이며 이 작업의 변경이 아니다.
- Blocker: —
- Blocker: —
- Revision: 구현 중 Next.js(Turbopack)가 MapLibre 워커 경로를 깨뜨려 벡터 타일이 안 그려지는 것을 발견했고, 워커 파일을 정적 자산 주소로 지정(setWorkerUrl)해 해결했다. 제품 계약은 바뀌지 않는다.
