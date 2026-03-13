import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthMeResponse } from "@/app/types";

interface UseAuthUserResult {
  authUser: AuthMeResponse["user"] | null;
  setAuthUser: (user: AuthMeResponse["user"] | null) => void;
  authChecked: boolean;
  authError: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000];

export function useAuthUser(
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>
): UseAuthUserResult {
  const [authUser, setAuthUser] = useState<AuthMeResponse["user"] | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<number | undefined>(undefined);

  const fetchAuthMe = useCallback(async () => {
    try {
      const response = await apiFetch("/api/auth/me");
      if (!response.ok) {
        // Server responded but user is not authenticated — not a network error.
        setAuthError(false);
        setAuthChecked(true);
        return;
      }
      const payload = (await response.json()) as AuthMeResponse;
      setAuthUser(payload.authenticated ? payload.user ?? null : null);
      setAuthError(false);
      setAuthChecked(true);
      retryCountRef.current = 0;
    } catch {
      // Network error (backend down / cold start). Retry before giving up.
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCountRef.current] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1];
        retryCountRef.current += 1;
        setAuthError(true);
        retryTimerRef.current = window.setTimeout(() => {
          void fetchAuthMe();
        }, delay);
        return;
      }
      // Exhausted retries — mark as checked but keep authUser as null.
      setAuthError(true);
      setAuthChecked(true);
    }
  }, [apiFetch]);

  useEffect(() => {
    void fetchAuthMe();
    return () => {
      if (retryTimerRef.current !== undefined) {
        window.clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  return { authUser, setAuthUser, authChecked, authError };
}
