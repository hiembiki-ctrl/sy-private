import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

import { AuthControl } from "@/components/auth/auth-control";

type Session = { user: { email: string } } | null;
type AuthListener = (event: string, session: Session) => void;

const auth = {
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};
let listener: AuthListener | undefined;
let clientError: Error | undefined;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => {
    if (clientError) throw clientError;
    return { auth };
  },
}));

const session = (email: string): Session => ({ user: { email } });

beforeEach(() => {
  clientError = undefined;
  listener = undefined;
  auth.getSession.mockReset().mockResolvedValue({ data: { session: null } });
  auth.onAuthStateChange.mockReset().mockImplementation((cb: AuthListener) => {
    listener = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  auth.signInWithPassword.mockReset().mockResolvedValue({ data: {}, error: null });
  auth.signUp.mockReset().mockResolvedValue({ data: { session: null }, error: null });
  auth.signOut.mockReset().mockResolvedValue({ error: null });
});

async function openAndFill(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "로그인" }));
  await user.type(await screen.findByLabelText("이메일"), "hi@example.com");
  await user.type(screen.getByLabelText("비밀번호"), "secret12");
}

test("로그아웃 상태에서는 로그인 버튼만 보이고 로그아웃은 보이지 않는다", async () => {
  render(<AuthControl />);

  expect(await screen.findByRole("button", { name: "로그인" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "로그아웃" })).not.toBeInTheDocument();
});

test("저장된 세션이 있으면 계정 이메일과 로그아웃이 바로 보인다", async () => {
  auth.getSession.mockResolvedValue({ data: { session: session("me@example.com") } });

  render(<AuthControl />);

  expect(await screen.findByText("me@example.com")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "로그인" })).not.toBeInTheDocument();
});

test("이메일과 비밀번호로 로그인하면 입력이 닫히고 계정 이메일이 보인다", async () => {
  const user = userEvent.setup();
  render(<AuthControl />);
  await openAndFill(user);

  await user.click(screen.getByRole("button", { name: "로그인하기" }));

  expect(auth.signInWithPassword).toHaveBeenCalledWith({
    email: "hi@example.com",
    password: "secret12",
  });
  listener?.("SIGNED_IN", session("hi@example.com"));
  expect(await screen.findByText("hi@example.com")).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument());
});

test("이메일이나 비밀번호가 틀리면 한국어 메시지를 보여주고 로그아웃 상태를 유지한다", async () => {
  auth.signInWithPassword.mockResolvedValue({
    data: {},
    error: { code: "invalid_credentials", message: "Invalid login credentials" },
  });
  const user = userEvent.setup();
  render(<AuthControl />);
  await openAndFill(user);

  await user.click(screen.getByRole("button", { name: "로그인하기" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("이메일이나 비밀번호가 맞지 않아요");
  expect(screen.queryByRole("button", { name: "로그아웃" })).not.toBeInTheDocument();
});

test("가입으로 바꿔 제출하면 가입을 요청한다", async () => {
  auth.signUp.mockResolvedValue({ data: { session: session("hi@example.com") }, error: null });
  const user = userEvent.setup();
  render(<AuthControl />);
  await user.click(screen.getByRole("button", { name: "로그인" }));
  await user.click(await screen.findByRole("button", { name: "처음이세요? 가입하기" }));
  await user.type(screen.getByLabelText("이메일"), "hi@example.com");
  await user.type(screen.getByLabelText("비밀번호"), "secret12");

  await user.click(screen.getByRole("button", { name: "가입하기" }));

  expect(auth.signUp).toHaveBeenCalledWith({ email: "hi@example.com", password: "secret12" });
  expect(auth.signInWithPassword).not.toHaveBeenCalled();
});

test("가입 직후 세션이 없으면 확인 메일 안내를 보여준다", async () => {
  const user = userEvent.setup();
  render(<AuthControl />);
  await user.click(screen.getByRole("button", { name: "로그인" }));
  await user.click(await screen.findByRole("button", { name: "처음이세요? 가입하기" }));
  await user.type(screen.getByLabelText("이메일"), "hi@example.com");
  await user.type(screen.getByLabelText("비밀번호"), "secret12");

  await user.click(screen.getByRole("button", { name: "가입하기" }));

  expect(await screen.findByText(/확인 메일을 보냈어요/)).toBeInTheDocument();
});

test("이미 가입된 이메일로 가입하면 이유를 알려준다", async () => {
  auth.signUp.mockResolvedValue({
    data: {},
    error: { code: "user_already_exists", message: "User already registered" },
  });
  const user = userEvent.setup();
  render(<AuthControl />);
  await user.click(screen.getByRole("button", { name: "로그인" }));
  await user.click(await screen.findByRole("button", { name: "처음이세요? 가입하기" }));
  await user.type(screen.getByLabelText("이메일"), "hi@example.com");
  await user.type(screen.getByLabelText("비밀번호"), "secret12");

  await user.click(screen.getByRole("button", { name: "가입하기" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("이미 가입된 이메일이에요");
});

test("로그아웃하면 계정 표시가 사라지고 로그인 버튼이 다시 보인다", async () => {
  auth.getSession.mockResolvedValue({ data: { session: session("me@example.com") } });
  const user = userEvent.setup();
  render(<AuthControl />);

  await user.click(await screen.findByRole("button", { name: "로그아웃" }));

  expect(auth.signOut).toHaveBeenCalled();
  listener?.("SIGNED_OUT", null);
  expect(await screen.findByRole("button", { name: "로그인" })).toBeInTheDocument();
  expect(screen.queryByText("me@example.com")).not.toBeInTheDocument();
});

test("Supabase 설정이 없어도 로그인 버튼이 보이고, 시도하면 실패 메시지를 보여준다", async () => {
  clientError = new Error("NEXT_PUBLIC_SUPABASE_URL 환경 변수가 없습니다.");
  const user = userEvent.setup();
  render(<AuthControl />);
  await openAndFill(user);

  await user.click(screen.getByRole("button", { name: "로그인하기" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("로그인 서비스에 연결할 수 없어요");
});

test("네트워크 오류로 요청이 던져져도 실패 메시지를 보여준다", async () => {
  auth.signInWithPassword.mockRejectedValue(new TypeError("Failed to fetch"));
  const user = userEvent.setup();
  render(<AuthControl />);
  await openAndFill(user);

  await user.click(screen.getByRole("button", { name: "로그인하기" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("로그인 서비스에 연결할 수 없어요");
});
