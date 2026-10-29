import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

// 로그인한 사용자의 이메일을 돌려준다. 로그아웃 상태나 Supabase 설정이 없으면 null이다.
export function useSessionEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let client: ReturnType<typeof createClient>;
    try {
      client = createClient();
    } catch {
      return;
    }
    client.auth
      .getSession()
      .then(({ data }) => setEmail(data.session?.user.email ?? null))
      .catch(() => {});
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return email;
}
