# 01 — 이메일 로그인

## Outcome

화면 오른쪽 상단의 "로그인" 버튼으로 이메일과 비밀번호로 가입하고 로그인할 수 있다. 로그인하면 같은 자리에 계정 이메일과 로그아웃이 보이고, 새로고침해도 로그인 상태가 유지된다. 로그인하지 않아도 지구본, 도시 선택, 일수 변경, 일정 열람은 지금과 똑같이 쓸 수 있다.

## Blockers

None. (구현과 검증에는 Supabase 프로젝트 연결과 이메일 확인 설정이 필요하며, 이는 선행 작업이 아니라 실행 조건이다.)

## Acceptance criteria

- [x] 로그아웃 상태에서 오른쪽 상단에 "로그인" 버튼이 보이고, 로그인을 요구하는 화면이나 가림막이 없다. 기존 열람 기능은 그대로다. (스펙 1)
- [x] "로그인"을 누르면 이메일과 비밀번호 입력이 열리고, 같은 화면에서 가입으로 바꿀 수 있다. (3)
- [x] 가입하거나 로그인하면 입력이 닫히고 계정 이메일과 로그아웃이 보인다. (3)
- [x] 새로고침해도 로그인 상태가 유지된다. (4)
- [x] 로그아웃하면 계정 표시가 사라지고 로그인 버튼이 다시 보인다. (4)
- [x] 이메일이나 비밀번호가 틀리거나 가입이 거절되면 이유를 알리는 한국어 메시지가 보이고 로그아웃 상태가 유지된다. (11의 로그인 부분)
- [x] Supabase 연결 설정이 없거나 연결할 수 없어도 페이지와 열람은 정상이고, 로그인을 시도하면 실패 메시지가 보인다. (11)
- [x] 좁은 화면(약 390px)에서도 로그인 영역이 가려지지 않고 가로 스크롤이 없다. (12의 로그인 부분)

## Constraints

- 계정과 로그인은 [account-and-storage](../../../decisions/account-and-storage.md)를 따른다. 클라이언트에는 공개 키만 쓴다.
- 일반 UI는 [ui-composition](../../../decisions/ui-composition.md)을 따른다.
- 이 작업에서는 데이터 테이블이나 프로필 정보를 만들지 않는다.
- 비밀번호 재설정과 Google 같은 외부 계정 로그인은 범위 밖이다.

## Verification

- 로그아웃, 로그인 성공, 입력 오류, 가입, 가입 확인 메일 필요, 로그아웃, 초기 세션 복원, 연결 설정 없음을 단위 테스트로 확인한다. Supabase 클라이언트는 가짜로 대체한다.
- `bun run typecheck`, `bun run lint`, `bunx vitest run`이 통과한다.
- 실제 브라우저에서 테스트 계정으로 가입, 로그아웃, 로그인, 새로고침 유지, 잘못된 비밀번호 메시지, 390px 화면을 확인한다.

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
- Verification: 단위 테스트 10개(auth-control) 통과, 전체 page 테스트 통과, typecheck·lint 통과. 실제 브라우저(개발 서버, 실제 Supabase)에서 로그인 버튼 노출, 입력 열림과 가입 전환 버튼, 잘못된 계정 입력 시 "이메일이나 비밀번호가 맞지 않아요." 메시지(로그아웃 유지), 390px에서 버튼과 입력창이 화면 안에 들어오고 가로 스크롤 없음을 확인했다. 이후 Supabase "Confirm email"을 끈 것을 확인(mailer_autoconfirm=true)하고, 실제 브라우저에서 테스트 계정으로 가입(가입 즉시 로그인, 입력 닫힘, 오른쪽 상단에 이메일과 로그아웃), 새로고침 후 로그인 유지, 로그아웃(로그인 버튼 복귀, 새로고침 후에도 유지), 재로그인을 모두 확인했다. 전체 단위 테스트 45개, typecheck, lint 통과. 코드 리뷰는 프로젝트 예산에 따라 02까지 끝난 뒤 한 번만 한다.
- Blocker: —
- Revision: —
