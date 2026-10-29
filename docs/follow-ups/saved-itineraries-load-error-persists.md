# 저장 목록 불러오기 실패 안내가 다음 로그인 뒤에도 남을 수 있다

**Symptom**: 저장소에 연결할 수 없을 때 보인 "저장소에 연결하지 못했어요" 안내가, 이후 로그아웃하고 다른 사용자로 로그인해 목록이 정상으로 불러와져도 계속 보일 수 있다.

**Observed evidence**: 코드 리뷰(low)가 `components/saved/use-saved-itineraries.ts`에서 지적했다. 불러오기 성공 경로와 사용자 변경 시에는 `error`를 지우지 않고, 저장·삭제(`run`) 시작 때만 지운다. 실제 화면에서 재현하지는 않았다.

**Suspected cause**: 불러오기 effect가 성공했을 때나 `email`이 바뀔 때 `setError(null)`을 하지 않는 것으로 의심된다.

**What was tried**: 수용 기준을 깨지 않고 주 경로에서 재현되지 않아 고치지 않았다.

**Proposed next step**: 불러오기 성공 시 error를 지우거나 error를 사용자 이메일과 함께 저장해 사용자가 바뀌면 보이지 않게 하고, 실패 후 재로그인 시나리오를 테스트로 추가한다.
