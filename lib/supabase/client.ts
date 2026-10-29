import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_ 변수는 Next.js가 빌드 시점에 값을 넣어 주므로 process.env로 직접 읽는다.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경 변수가 없습니다. .env.local을 확인하세요.");
  }
  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경 변수가 없습니다. .env.local을 확인하세요."
    );
  }

  return createBrowserClient(url, publishableKey);
}
