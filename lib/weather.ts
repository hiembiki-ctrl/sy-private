export type CurrentWeather = {
  temperature: number;
  description: string;
};

// WMO 날씨 코드를 한국어 한 마디로 옮긴다. https://open-meteo.com/en/docs
export function describeWeatherCode(code: number): string {
  if (code === 0) return "맑음";
  if (code <= 2) return "대체로 맑음";
  if (code === 3) return "흐림";
  if (code === 45 || code === 48) return "안개";
  if (code >= 51 && code <= 57) return "이슬비";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "비";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "눈";
  if (code >= 95) return "뇌우";
  return "날씨 정보 없음";
}

/** Open-Meteo에서 좌표의 현재 기온과 날씨를 읽는다. 실패하면 null이라 화면에서 그냥 숨긴다. */
export async function fetchCurrentWeather(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<CurrentWeather | null> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const { temperature_2m: temperature, weather_code: code } = body.current ?? {};
    if (typeof temperature !== "number" || typeof code !== "number") return null;
    return { temperature: Math.round(temperature), description: describeWeatherCode(code) };
  } catch {
    return null;
  }
}
