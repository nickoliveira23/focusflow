import { useEffect, useState } from "react";
import type { AuthMeResponse } from "@/app/types";

interface UseAuthUserResult {
  authUser: AuthMeResponse["user"] | null;
  setAuthUser: (user: AuthMeResponse["user"] | null) => void;
  authChecked: boolean;
}

export function useAuthUser(
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>
): UseAuthUserResult {
  const [authUser, setAuthUser] = useState<AuthMeResponse["user"] | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchAuthMe = async () => {
      try {
        const response = await apiFetch("/api/auth/me");
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as AuthMeResponse;
        setAuthUser(payload.authenticated ? payload.user ?? null : null);
      } catch {
        setAuthUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    void fetchAuthMe();
  }, []);

  return { authUser, setAuthUser, authChecked };
}
