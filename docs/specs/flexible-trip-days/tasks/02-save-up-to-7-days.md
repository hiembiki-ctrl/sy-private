# 02 — 4~7일 일정 저장

## Outcome

로그인한 사용자가 4~7일 일정도 저장하고, "내 저장 일정"에서 "도시명 N일"로 보며, 항목을 누르면 그 일수로 일정이 열린다. 저장소의 일수 제약을 1~3일에서 1~7일로 넓히는 마이그레이션을 이 작업에서 적용한다. 이미 저장된 1~3일 일정은 그대로 남는다.

## Blockers

01 — 4~7일을 고를 수 있어야 4~7일 저장을 화면에서 만들고 확인할 수 있다.

## Acceptance criteria

- [x] 로그인한 사용자가 4~7일을 고른 상태에서 저장할 수 있고, "내 저장 일정"에 "도시명 N일"로 나타나며 항목을 누르면 그 일수로 일정이 열린다. (스펙 8)
- [x] 1~7일 밖의 일수와 지원하지 않는 도시는 저장되지 않는다. (9)
- [x] 이전에 저장한 1~3일 일정은 변하지 않고 계속 열린다. (9)
- [x] 저장소에 연결할 수 없거나 마이그레이션이 적용되지 않아 4~7일 저장이 실패해도 실패 메시지가 보이고 열람은 영향을 받지 않는다.

## Constraints

- 소유자 전용 접근은 지금처럼 DB 수준에서 유지한다. 일수 범위만 바뀐다. ([account-and-storage](../../../decisions/account-and-storage.md))
- Supabase 작업을 시작할 때 `supabase` 스킬을 읽고 공식 문서 색인과 changelog를 그 시점에 확인한다.
- 이미 저장된 데이터는 지우거나 바꾸지 않는다.
- 로그인 없이 열람하는 기능은 그대로 유지한다.

## Verification

- 단위 테스트: 저장 규칙이 1~7일을 허용하고 0일, 8일, 지원하지 않는 도시를 거부한다.
- 마이그레이션 적용 뒤 DB에서 직접 확인한다: 4~7일 저장 성공, 8일과 지원하지 않는 도시는 23514로 거부, 서로 다른 두 계정 간 접근 분리와 기존 1~3일 행 보존.
- `bun run typecheck`, `bun run lint`, `bunx vitest run`이 통과한다.
- `next-dev-loop`로 실제 브라우저에서 7일 저장, 목록 표시, 새로고침 유지, 열기를 확인한다.

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
- Verification: 마이그레이션 파일(20261029100000)로 제약을 1~7일로 넓혔고, 원격 DB 적용은 사용자가 직접 했다. 별도 세션이 DB에서 4·5·7일 저장 성공과 8일·0일 23514 거부를 확인했다. 실제 브라우저에서 파리 5일 저장, 목록 "파리 5일" 표시, 새로고침 유지, 목록에서 열면 5일로 열림, 삭제를 확인하고 확인용 항목은 지웠다(기존 1일 항목 보존). 단위 테스트 64개, typecheck, lint 통과(4~7일 저장·열기, 저장 실패 시 메시지와 열람 유지).
- Blocker: —
- Revision: —
