import { afterEach, expect, test, vi } from "vitest";

import { createClient } from "@/lib/supabase/client";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("프로젝트 주소와 공개 키가 있으면 Supabase 클라이언트를 만든다", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

  const client = createClient();

  expect(typeof client.from).toBe("function");
  expect(typeof client.auth.getSession).toBe("function");
});

test("프로젝트 주소가 없으면 어떤 값이 빠졌는지 알려 주며 실패한다", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

  expect(() => createClient()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
});

test("공개 키가 없으면 어떤 값이 빠졌는지 알려 주며 실패한다", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

  expect(() => createClient()).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
});
