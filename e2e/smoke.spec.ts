import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 지구본과 도시 목록이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("원클릭 여행플래너");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "원클릭 여행플래너"
  );
  await expect(page.locator("canvas")).toBeVisible();
  await expect(
    page.getByRole("group", { name: "도시 목록" }).getByRole("button")
  ).toHaveCount(10);
});

test("도시를 고르면 일정이 나오고 일수를 바꿔도 도시를 바꿔도 일수가 유지된다", async ({
  page,
}) => {
  await page.goto("/");

  const list = page.getByRole("group", { name: "도시 목록" });
  await list.getByRole("button", { name: "파리" }).click();
  await expect(page.getByRole("heading", { name: "파리" })).toBeVisible();
  await expect(page.getByText("1일차")).toBeVisible();

  await page.getByRole("tab", { name: "3일" }).click();
  await expect(page.getByText("3일차")).toBeVisible();

  await list.getByRole("button", { name: "케이프타운" }).click();
  await expect(page.getByRole("heading", { name: "케이프타운" })).toBeVisible();
  await expect(page.getByText("3일차")).toBeVisible();
});
