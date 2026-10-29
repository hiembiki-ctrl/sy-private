import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

import Home from "@/app/page";

type Row = { id: number; city_id: string; days: number; created_at: string };

const db = { rows: [] as Row[], nextId: 1, fail: false };
const session = { current: null as { user: { email: string } } | null };
const listeners: ((event: string, s: typeof session.current) => void)[] = [];

function emit(next: typeof session.current) {
  session.current = next;
  listeners.forEach((l) => l(next ? "SIGNED_IN" : "SIGNED_OUT", next));
}

const client = {
  auth: {
    getSession: async () => ({ data: { session: session.current } }),
    onAuthStateChange: (cb: (event: string, s: typeof session.current) => void) => {
      listeners.push(cb);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(async () => emit(null)),
  },
  from: () => ({
    select: () => ({
      order: async () =>
        db.fail
          ? { data: null, error: { message: "network" } }
          : { data: [...db.rows].sort((a, b) => b.id - a.id), error: null },
    }),
    insert: async (v: { city_id: string; days: number }) => {
      if (db.fail) return { error: { message: "network" } };
      if (db.rows.some((r) => r.city_id === v.city_id && r.days === v.days)) {
        return { error: { code: "23505", message: "duplicate" } };
      }
      db.rows.push({ id: db.nextId++, ...v, created_at: "2026-10-29T00:00:00Z" });
      return { error: null };
    },
    delete: () => ({
      eq: async (_c: string, id: number) => {
        if (db.fail) return { error: { message: "network" } };
        db.rows = db.rows.filter((r) => r.id !== id);
        return { error: null };
      },
    }),
  }),
};

vi.mock("@/lib/supabase/client", () => ({ createClient: () => client }));

vi.mock("@/components/city-globe", () => ({
  default: ({
    cities,
    onSelect,
  }: {
    cities: { id: string }[];
    onSelect: (id: string) => void;
  }) => (
    <div>
      {cities.map((c) => (
        <button key={c.id} type="button" data-testid={`point-${c.id}`} onClick={() => onSelect(c.id)} />
      ))}
    </div>
  ),
}));

beforeEach(() => {
  db.rows = [];
  db.nextId = 1;
  db.fail = false;
  session.current = null;
  listeners.length = 0;
});

test("로그아웃 상태에서는 '로그인하고 저장'이 보이고 저장 목록은 보이지 않는다", async () => {
  const user = userEvent.setup();
  render(<Home />);

  await user.click(await screen.findByTestId("point-paris"));

  expect(screen.getByRole("button", { name: "로그인하고 저장" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "내 저장 일정" })).not.toBeInTheDocument();
});

test("'로그인하고 저장'을 누르면 로그인 입력이 열린다", async () => {
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));

  await user.click(screen.getByRole("button", { name: "로그인하고 저장" }));

  expect(await screen.findByLabelText("이메일")).toBeInTheDocument();
});

test("로그인하면 저장할 수 있고 저장하면 '저장됨'과 목록 항목이 생긴다", async () => {
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));
  await user.click(await screen.findByRole("button", { name: "저장" }));

  expect(await screen.findByRole("button", { name: "저장됨" })).toBeInTheDocument();
  const list = screen.getByRole("region", { name: "내 저장 일정" });
  expect(within(list).getByRole("button", { name: "파리 1일" })).toBeInTheDocument();
  expect(db.rows).toHaveLength(1);
});

test("같은 도시의 다른 일수는 따로 저장되고 같은 조합은 중복되지 않는다", async () => {
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));
  await user.click(await screen.findByRole("button", { name: "저장" }));
  await screen.findByRole("button", { name: "저장됨" });

  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "3");
  expect(await screen.findByRole("button", { name: "저장" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "저장" }));
  await screen.findByRole("button", { name: "저장됨" });

  const list = screen.getByRole("region", { name: "내 저장 일정" });
  expect(within(list).getAllByRole("button", { name: /^파리 \d일$/ })).toHaveLength(2);
  expect(db.rows).toHaveLength(2);
});

test("저장 목록 항목을 누르면 그 도시가 선택되고 저장한 일수로 일정이 열린다", async () => {
  db.rows = [{ id: 1, city_id: "tokyo", days: 3, created_at: "2026-10-29T00:00:00Z" }];
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);

  await user.click(await screen.findByRole("button", { name: "도쿄 3일" }));

  expect(screen.getByRole("heading", { name: "도쿄" })).toBeInTheDocument();
  expect(screen.getAllByText(/^[0-9]일차/)).toHaveLength(3);
  expect(screen.getByRole("button", { name: "저장됨" })).toBeInTheDocument();
});

test("'저장됨'을 다시 누르거나 삭제 버튼을 누르면 항목이 사라진다", async () => {
  db.rows = [
    { id: 1, city_id: "tokyo", days: 1, created_at: "2026-10-29T00:00:00Z" },
    { id: 2, city_id: "paris", days: 1, created_at: "2026-10-29T00:00:00Z" },
  ];
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByRole("button", { name: "도쿄 1일" }));

  await user.click(screen.getByRole("button", { name: "저장됨" }));
  await waitFor(() => expect(db.rows.map((r) => r.city_id)).toEqual(["paris"]));

  await user.click(await screen.findByRole("button", { name: "파리 1일 삭제" }));
  await waitFor(() => expect(db.rows).toHaveLength(0));
  expect(screen.queryByRole("button", { name: "파리 1일" })).not.toBeInTheDocument();
});

test("로그아웃하면 저장 목록이 사라지고 '로그인하고 저장'으로 돌아간다", async () => {
  db.rows = [{ id: 1, city_id: "tokyo", days: 1, created_at: "2026-10-29T00:00:00Z" }];
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));
  await screen.findByRole("region", { name: "내 저장 일정" });

  await user.click(screen.getByRole("button", { name: "로그아웃" }));

  await waitFor(() =>
    expect(screen.queryByRole("region", { name: "내 저장 일정" })).not.toBeInTheDocument()
  );
  expect(screen.getByRole("button", { name: "로그인하고 저장" })).toBeInTheDocument();
});

test("저장소 호출이 실패하면 실패 메시지를 보여주고 일정 열람은 계속 된다", async () => {
  db.fail = true;
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));

  await user.click(await screen.findByRole("button", { name: "저장" }));

  expect(await screen.findByText(/저장소에 연결하지 못했어요/)).toBeInTheDocument();
  expect(screen.getByText("에펠탑")).toBeInTheDocument();
});

test("4~7일도 저장되고 목록에 '도시명 N일'로 보이며 누르면 그 일수로 열린다", async () => {
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));
  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "7");
  await user.click(await screen.findByRole("button", { name: "저장" }));

  const list = await screen.findByRole("region", { name: "내 저장 일정" });
  expect(await within(list).findByRole("button", { name: "파리 7일" })).toBeInTheDocument();
  expect(db.rows).toEqual([expect.objectContaining({ city_id: "paris", days: 7 })]);

  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "1");
  await user.click(within(list).getByRole("button", { name: "파리 7일" }));
  expect(screen.getByRole("combobox", { name: "여행 일수" })).toHaveValue("7");
  expect(screen.getByText("7일차 · 근교: 샹티이")).toBeInTheDocument();
});

test("저장소가 일수를 거부해도 실패 메시지만 보이고 일정 열람은 그대로다", async () => {
  session.current = { user: { email: "me@example.com" } };
  const user = userEvent.setup();
  render(<Home />);
  await user.click(await screen.findByTestId("point-paris"));
  await user.selectOptions(screen.getByRole("combobox", { name: "여행 일수" }), "5");
  db.fail = true;
  await user.click(await screen.findByRole("button", { name: "저장" }));

  expect(await screen.findByText(/저장소에 연결하지 못했어요/)).toBeInTheDocument();
  expect(screen.getByText("5일차 · 근교: 지베르니")).toBeInTheDocument();
});
