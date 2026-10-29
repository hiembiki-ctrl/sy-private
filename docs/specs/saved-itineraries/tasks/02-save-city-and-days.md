# 02 — 도시와 일수 저장

## Outcome

로그인한 사용자가 현재 도시와 일수를 저장하고, "내 저장 일정" 목록에서 다시 열거나 삭제한다. 로그아웃 상태에서는 저장 자리에 "로그인하고 저장"이 보인다. 저장은 사용자별로 보관되고 소유자만 읽고 쓸 수 있다.

## Blockers

01 — 저장은 로그인된 사용자가 있어야 가능하다.

## Acceptance criteria

- [x] 로그아웃 상태에서 도시를 선택하면 일정 영역에 "로그인하고 저장"이 보이고 "내 저장 일정"은 보이지 않는다. (스펙 2)
- [x] 로그인한 상태에서 "저장"을 누르면 "저장됨"으로 바뀌고 목록에 "도시명 N일"이 추가된다. (5)
- [x] 같은 도시의 다른 일수는 별개 항목으로 저장되고, 같은 조합은 중복 저장되지 않는다. (6)
- [x] 새로고침이나 재로그인 후에도 저장 일정이 남아 있다. (7)
- [x] 목록 항목을 누르면 그 도시가 선택되고 저장된 일수로 일정이 열린다. (8)
- [x] 저장 해제나 삭제 후 새로고침해도 항목이 돌아오지 않는다. (9)
- [x] 서로 다른 두 계정이 서로의 저장 일정을 읽거나 지울 수 없고, 로그인하지 않은 상태로는 읽고 쓸 수 없다. (10)
- [x] 저장소에는 도시, 일수, 저장 시각만 저장되고, 지원하지 않는 도시나 1~7일 밖의 일수는 저장되지 않는다. (13)
- [x] 저장소에 연결할 수 없으면 실패 메시지가 보이고 열람은 정상이다. (11)
- [x] 좁은 화면(약 390px)에서도 저장 동작과 목록이 가려지지 않는다. (12)

## Constraints

- 저장 대상과 용어는 [GLOSSARY.md](../../../../GLOSSARY.md)의 저장 일정을 따른다.
- 소유자 전용 접근은 화면이 아니라 DB 수준에서 막는다. ([account-and-storage](../../../decisions/account-and-storage.md))
- 이 프로젝트의 Supabase는 새 테이블을 Data API에 자동으로 열지 않으므로 권한과 행 단위 보안을 명시적으로 설정한다.
- 일반 UI는 [ui-composition](../../../decisions/ui-composition.md)을 따른다.

## Verification

- 저장 규칙(중복, 허용 범위, 목록 순서)을 단위 테스트로 확인한다.
- `bun run typecheck`, `bun run lint`, `bunx vitest run`이 통과한다.
- 실제 브라우저에서 저장, 새로고침 유지, 열기, 삭제를 확인한다.
- 소유자 전용 접근은 서로 다른 두 계정으로 확인한다.

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
- Verification: 마이그레이션 SQL 적용 확인(Data API가 테이블을 인식). 서로 다른 두 계정과 anon으로 DB 수준을 직접 확인했다: anon 읽기·쓰기는 42501로 거부, 같은 조합 중복은 23505, 지원하지 않는 도시와 4일은 23514로 거부, 다른 계정은 목록이 비어 있고 남의 행을 지울 수 없으며(0건 삭제) 남의 user_id로 넣으면 42501로 거부, 본인 목록은 영향이 없다. 실제 브라우저에서 로그아웃 상태의 "로그인하고 저장"과 로그인 입력 열림, 로그인 뒤 저장(저장됨, 목록 추가), 같은 도시 다른 일수 별도 저장, 새로고침 유지, 목록 항목으로 도시와 저장 일수 열기, 저장 해제와 삭제 뒤 새로고침 유지, 로그아웃 시 목록 사라짐, 390px에서 가로 스크롤 없음을 확인했다. 전체 단위 테스트 57개, typecheck, lint 통과. 확인용 저장 데이터는 모두 지웠다. 코드 리뷰(code-review low) 1회: 지적 2건은 재현되지 않아 docs/follow-ups에 기록했다.
- Blocker: —
- Revision: —
