import { useEffect, useState } from "react";

import { fetchCurrentWeather, type CurrentWeather } from "@/lib/weather";

type Loaded = { cityId: string; weather: CurrentWeather | null };

// 선택한 도시의 현재 날씨를 읽는다. 도시가 바뀌면 이전 도시의 결과는 보이지 않는다.
export function useCurrentWeather(city: { id: string; lat: number; lng: number } | undefined) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const cityId = city?.id;
  const lat = city?.lat;
  const lng = city?.lng;

  useEffect(() => {
    if (cityId === undefined || lat === undefined || lng === undefined) return;
    const controller = new AbortController();
    fetchCurrentWeather(lat, lng, controller.signal).then((weather) => {
      if (!controller.signal.aborted) setLoaded({ cityId, weather });
    });
    return () => controller.abort();
  }, [cityId, lat, lng]);

  const ready = cityId !== undefined && loaded?.cityId === cityId;
  return { weather: ready ? loaded.weather : null, loading: cityId !== undefined && !ready };
}
