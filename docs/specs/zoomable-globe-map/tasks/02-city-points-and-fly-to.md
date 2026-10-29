# 02 — 도시 점과 이동 선택

## Outcome

지도 위에 지원 도시 10곳의 도시 점과 이름표가 있다. 도시 점이나 이름표를 누르면 지도가 그 도시로 부드럽게 이동하며 도시 일대가 보이게 확대되고 그 도시의 일정이 열린다. 도시 목록에서 도시를 골라도 같은 동작을 한다. 도시 점은 지구본 앞면에서만 보이고 눌린다. 마무리로 10개 도시를 차례로 선택하며 확대·축소해도 탭 메모리가 약 300MB 안팎이라는 것을 측정해 확인한다.

## Blockers

01 — 도시 점은 01에서 만든 지도 위에 올라가므로 지도가 먼저 있어야 한다.

## Acceptance criteria

- [x] 첫 화면에서 앞면에 있는 도시 점과 이름이 4개 이상 보인다. (스펙 기준 1)
- [x] 지구본을 돌리면 10개 도시 점이 모두 한 번씩 앞면에 나타나고, 뒷면 도시 점은 보이지 않으며 눌러도 선택되지 않는다. (2)
- [x] 확대한 상태에서도 도시 점과 이름이 알아볼 수 있고, 지도 위에서 가장 눈에 띄는 요소다. (제품 제약)
- [x] 도시 점이나 이름표를 누르면 지도가 그 도시로 이동하며 도시 일대가 보이게 확대되고, 해당 도시의 일정이 열린다. 선택한 도시 점은 다른 도시와 눈으로 구별된다. (4)
- [x] 도시 목록에서 뒷면에 있던 도시를 골라도 지도가 그 도시로 이동하고 일정이 열린다. (5)
- [x] 드래그나 핀치를 끝낸 직후에는 도시 선택이 일어나지 않는다. (6)
- [x] 확대한 상태에서 다른 도시를 선택하면 지도가 새 도시로 이동한다. (7)
- [x] 좁은 화면(약 390px)에서도 도시 점 선택이 가능하고 가로 스크롤이 없다. (10의 선택 부분)
- [x] 10개 도시를 차례로 선택해 확대·축소해 본 뒤에도 탭 메모리가 약 300MB 안팎을 넘지 않는다. 측정 방법과 측정값을 Execution에 기록한다. (11)
- [x] 일수 변경, 도시 선택으로 지도가 다시 만들어지거나 깜박이지 않는다. (8)

## Constraints

- 도시 용어는 [GLOSSARY.md](../../../../GLOSSARY.md)의 도시 점, 일정, 일수를 따른다.
- 지도 방식과 앞면에서만 보이는 규칙은 [map-surface](../../../decisions/map-surface.md)가 정한다.
- 도시 점과 이름표 주변의 일반 UI는 [ui-composition](../../../decisions/ui-composition.md)을 따른다.
- 지구본 뒷면에서 마커가 자동으로 숨는지는 문서로 확인하지 못했다. 구현에서 먼저 확인하고, 숨지 않으면 앞면 판정을 직접 한다. 기존 `lib/globe-view` 판정 코드는 이 결과에 따라 유지하거나 정리한다.
- 확대 상태에서 메모리가 한도를 넘으면 한도나 스타일, 최대 확대 수준을 사용자와 다시 정한다.
- 로그인과 저장은 범위 밖이다.

## Verification

- 앞면 판정과 도시 선택 규칙을 단위 테스트로 확인한다. 기존 지구본 관련 테스트는 새 지도 기준으로 바꾼다.
- `bun run typecheck`, `bun run lint`, `bunx vitest run`이 모두 통과한다.
- 실제 브라우저에서 도시 점 클릭 선택과 이동, 목록 선택(뒷면 도시 포함), 드래그 직후 선택 방지, 뒷면 도시 숨김, 확대 상태의 도시 점, 390px 화면을 확인한다.
- 탭 메모리를 측정하고 값을 기록한다.

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
- Verification: 단위 테스트(city-globe 13개, map-config, cities 포함 23개)와 린트(내 파일)가 통과했다. 전체 typecheck와 lint는 다른 세션이 진행 중인 저장 일정 파일(lib/saved-itineraries, components/saved)의 오류로 실패해 이 작업과 무관하다. 브라우저에서 확인: 첫 화면(474px, 390px)에 도시 점과 이름이 4개 이상 보임, 최대 축소해 돌리면 유럽 도시가 사라지고 아시아 도시(도쿄·방콕·하노이)가 나타나 뒷면 도시는 보이지 않음, 도시 점 클릭으로 파리·도쿄 선택과 이동 확대(줌 7)와 일정 열림, 도시 점 위에서 시작한 드래그는 도시를 선택하지 않고 지구본만 돌림, 목록에서 뒷면 도시(쿠스코)를 골라도 이동·선택, 3일 선택 후 도시를 바꿔도 3일 유지, 한 번의 방문에서 canvas 1개 유지, 390px에서 점 탭으로 파리 선택·가로 스크롤 없음. 선택된 도시를 다시 누르면 돌아오지 않는 문제를 코드 리뷰(low)에서 발견해 재현하고 고쳤고 실제 브라우저에서 다시 확인했다. 메모리: 도시 10곳을 2번 순회하며 확대·축소한 뒤에도 JS 힙 사용량이 53→55MB로 거의 늘지 않았다(개발 모드, performance.memory).
- Blocker: —
- Revision: 탭 전체 메모리 300MB 기준은 내장 브라우저에서 탭 단위 프로세스 메모리를 읽을 수 없어 JS 힙(10개 도시를 2번 순회한 뒤 53→55MB)을 측정값으로 쓰기로 사용자가 인정했다. 제품 계약은 바뀌지 않는다. 이후 Chrome 작업 관리자 값을 확인하면 이 항목에 추가한다.
