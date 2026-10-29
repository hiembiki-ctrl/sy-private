import { AuthControl } from "@/components/auth/auth-control";
import { CityExplorer } from "@/components/city-explorer";
import { loadCities } from "@/lib/catalog";
import { rankByPopularity } from "@/lib/popularity";

// 여행지 DB의 변경이 몇 분 안에 화면에 반영되게 한다.
export const revalidate = 300;

export default async function Home() {
  const { cities, popularIds } = await rankByPopularity(await loadCities());

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            원클릭 여행플래너
          </h1>
          <p className="text-muted-foreground">
            막연히 떠나고 싶다면, 지구본에서 도시를 눌러 보세요.
          </p>
        </div>
        <AuthControl />
      </header>
      <CityExplorer cities={cities} popularIds={popularIds} />
    </main>
  );
}
