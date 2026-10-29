"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useSessionEmail } from "@/lib/supabase/use-session-email";

const OPEN_LOGIN_EVENT = "open-login-dialog";

// 같은 화면의 다른 부분(예: "로그인하고 저장")에서 로그인 입력을 열어 달라고 요청한다.
export function requestLogin() {
  window.dispatchEvent(new Event(OPEN_LOGIN_EVENT));
}

type Mode = "signin" | "signup";
type Message = { tone: "error" | "info"; text: string };

const UNREACHABLE = "로그인 서비스에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.";

const ERROR_TEXT: Record<string, string> = {
  invalid_credentials: "이메일이나 비밀번호가 맞지 않아요.",
  user_already_exists: "이미 가입된 이메일이에요. 로그인해 주세요.",
  weak_password: "비밀번호는 6자 이상으로 정해 주세요.",
  validation_failed: "이메일 형식을 확인해 주세요.",
  email_address_invalid: "이메일 형식을 확인해 주세요.",
  over_request_rate_limit: "요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요.",
  over_email_send_rate_limit: "요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요.",
};

function errorText(error: { code?: string }): string {
  return (error.code && ERROR_TEXT[error.code]) || "처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
}

export function AuthControl() {
  const email = useSessionEmail();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const show = () => {
      setMode("signin");
      setMessage(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_LOGIN_EVENT, show);
    return () => window.removeEventListener(OPEN_LOGIN_EVENT, show);
  }, []);

  function openDialog() {
    setMode("signin");
    setMessage(null);
    setOpen(true);
  }

  function switchMode() {
    setMode((current) => (current === "signin" ? "signup" : "signin"));
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credentials = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    setPending(true);
    setMessage(null);
    try {
      const { auth } = createClient();
      if (mode === "signin") {
        const { error } = await auth.signInWithPassword(credentials);
        if (error) setMessage({ tone: "error", text: errorText(error) });
        else setOpen(false);
      } else {
        const { data, error } = await auth.signUp(credentials);
        if (error) {
          setMessage({ tone: "error", text: errorText(error) });
        } else if (data.session) {
          setOpen(false);
        } else {
          setMessage({
            tone: "info",
            text: "확인 메일을 보냈어요. 메일의 링크를 눌러 가입을 마쳐 주세요.",
          });
        }
      }
    } catch {
      setMessage({ tone: "error", text: UNREACHABLE });
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } catch {
      // 연결 실패 시에도 화면은 그대로 두고 다시 시도할 수 있게 한다.
    }
  }

  const title = mode === "signin" ? "로그인" : "가입";

  return (
    <div className="flex items-center gap-2">
      {email ? (
        <>
          <span className="max-w-[9rem] truncate text-sm text-muted-foreground sm:max-w-[16rem]">
            {email}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={signOut}>
            로그아웃
          </Button>
        </>
      ) : (
        <Button type="button" size="sm" onClick={openDialog}>
          로그인
        </Button>
      )}

      <Dialog open={open && !email} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === "signin"
                ? "이메일과 비밀번호로 로그인하고 마음에 드는 일정을 저장하세요."
                : "이메일과 비밀번호로 가입하고 마음에 드는 일정을 저장하세요."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-email">이메일</Label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="auth-password">비밀번호</Label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>
            {message && (
              <Alert variant={message.tone === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={pending}>
              {mode === "signin" ? "로그인하기" : "가입하기"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={switchMode}>
              {mode === "signin" ? "처음이세요? 가입하기" : "이미 계정이 있어요? 로그인"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
