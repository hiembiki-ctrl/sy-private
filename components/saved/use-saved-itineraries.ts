import { useCallback, useEffect, useState } from "react";

import type { Days } from "@/lib/cities";
import {
  listSavedItineraries,
  removeSavedItinerary,
  saveItinerary,
  type SavedItinerary,
} from "@/lib/saved-itineraries";
import { createClient } from "@/lib/supabase/client";

const UNREACHABLE = "저장소에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.";

type Loaded = { email: string; list: SavedItinerary[] };

// 로그인한 사용자의 저장 일정을 불러오고 저장·삭제를 처리한다.
// 로그아웃하거나 사용자가 바뀌면 이전 사용자의 목록은 보이지 않는다.
export function useSavedItineraries(email: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (owner: string) => {
    const list = await listSavedItineraries(createClient());
    setLoaded({ email: owner, list });
  }, []);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => listSavedItineraries(createClient()))
      .then((list) => {
        if (!cancelled) setLoaded({ email, list });
      })
      .catch(() => {
        if (!cancelled) setError(UNREACHABLE);
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      if (!email) return;
      setError(null);
      try {
        await action();
        await refresh(email);
      } catch {
        setError(UNREACHABLE);
      }
    },
    [email, refresh],
  );

  const save = useCallback(
    (cityId: string, days: Days) => run(() => saveItinerary(createClient(), cityId, days)),
    [run],
  );
  const remove = useCallback(
    (id: number) => run(() => removeSavedItinerary(createClient(), id)),
    [run],
  );

  const saved = email && loaded?.email === email ? loaded.list : [];
  return { saved, error: email ? error : null, save, remove };
}
