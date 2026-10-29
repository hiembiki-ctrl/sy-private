import { expect, test } from "vitest";

import {
  findSaved,
  listSavedItineraries,
  removeSavedItinerary,
  saveItinerary,
  type SavedItinerary,
} from "@/lib/saved-itineraries";

type Row = { id: number; city_id: string; days: number; created_at: string };
type DbError = { code?: string; message: string } | null;

// 저장소 호출 모양(select/order, insert, delete/eq)만 흉내 내는 가짜 Supabase 클라이언트
function fakeClient(options: { rows?: Row[]; error?: DbError } = {}) {
  const rows = options.rows ?? [];
  const calls: unknown[] = [];
  const error = options.error ?? null;
  const client = {
    from(table: string) {
      calls.push(["from", table]);
      return {
        select(columns: string) {
          calls.push(["select", columns]);
          return {
            order(column: string, opts: { ascending: boolean }) {
              calls.push(["order", column, opts]);
              return Promise.resolve({ data: error ? null : rows, error });
            },
          };
        },
        insert(values: unknown) {
          calls.push(["insert", values]);
          return Promise.resolve({ error });
        },
        delete() {
          return {
            eq(column: string, value: unknown) {
              calls.push(["delete", column, value]);
              return Promise.resolve({ error });
            },
          };
        },
      };
    },
  };
  return { client: client as never, calls };
}

test("저장 일정을 최근에 저장한 것부터 도시 id와 일수로 바꿔 돌려준다", async () => {
  const { client, calls } = fakeClient({
    rows: [
      { id: 7, city_id: "paris", days: 3, created_at: "2026-10-29T01:00:00Z" },
      { id: 2, city_id: "tokyo", days: 1, created_at: "2026-10-28T01:00:00Z" },
    ],
  });

  const list = await listSavedItineraries(client);

  expect(list).toEqual([
    { id: 7, cityId: "paris", days: 3, createdAt: "2026-10-29T01:00:00Z" },
    { id: 2, cityId: "tokyo", days: 1, createdAt: "2026-10-28T01:00:00Z" },
  ]);
  expect(calls).toContainEqual(["from", "saved_itineraries"]);
  expect(calls).toContainEqual(["order", "id", { ascending: false }]);
});

test("저장할 때 도시 id와 일수만 보낸다", async () => {
  const { client, calls } = fakeClient();

  await saveItinerary(client, "paris", 3);

  expect(calls).toContainEqual(["insert", { city_id: "paris", days: 3 }]);
});

test("이미 저장한 조합(중복 키 오류)은 실패로 보지 않는다", async () => {
  const { client } = fakeClient({ error: { code: "23505", message: "duplicate key" } });

  await expect(saveItinerary(client, "paris", 3)).resolves.toBeUndefined();
});

test("그 밖의 저장 오류는 그대로 던진다", async () => {
  const { client } = fakeClient({ error: { code: "42501", message: "permission denied" } });

  await expect(saveItinerary(client, "paris", 3)).rejects.toMatchObject({ code: "42501" });
});

test("목록을 불러오지 못하면 오류를 던진다", async () => {
  const { client } = fakeClient({ error: { message: "network" } });

  await expect(listSavedItineraries(client)).rejects.toMatchObject({ message: "network" });
});

test("id로 저장 일정을 삭제한다", async () => {
  const { client, calls } = fakeClient();

  await removeSavedItinerary(client, 7);

  expect(calls).toContainEqual(["delete", "id", 7]);
});

test("도시와 일수가 같은 저장 일정을 찾는다", () => {
  const list: SavedItinerary[] = [
    { id: 7, cityId: "paris", days: 3, createdAt: "" },
    { id: 2, cityId: "paris", days: 1, createdAt: "" },
  ];

  expect(findSaved(list, "paris", 1)?.id).toBe(2);
  expect(findSaved(list, "paris", 2)).toBeUndefined();
  expect(findSaved(list, "tokyo", 3)).toBeUndefined();
});
