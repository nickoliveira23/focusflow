import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { EVENTS_STORAGE_KEY, SYNC_QUEUE_STORAGE_KEY } from "@/app/constants";
import type { AnalyticsEvent, FocusSessionRecord, SyncQueueItem, TimerSettings } from "@/app/types";

interface UseSyncQueueInput {
  authUserId: string | undefined;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

interface UseSyncQueueResult {
  syncQueue: SyncQueueItem[];
  analyticsEvents: AnalyticsEvent[];
  lastSyncAtIso: string | null;
  queueHydrated: boolean;
  setSyncQueue: Dispatch<SetStateAction<SyncQueueItem[]>>;
  trackEvent: (name: string, details?: Record<string, string | number | boolean>) => void;
  enqueueSettingsSync: (settings: TimerSettings) => void;
  enqueueSessionSync: (session: FocusSessionRecord) => void;
}

export function useSyncQueue({ authUserId, apiFetch }: UseSyncQueueInput): UseSyncQueueResult {
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [lastSyncAtIso, setLastSyncAtIso] = useState<string | null>(null);
  const [queueHydrated, setQueueHydrated] = useState(false);

  const trackEvent = (
    name: string,
    details?: Record<string, string | number | boolean>
  ) => {
    setAnalyticsEvents((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name,
        atIso: new Date().toISOString(),
        details
      }
    ]);
  };

  const enqueueSettingsSync = (settings: TimerSettings) => {
    setSyncQueue((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        type: "settings",
        payload: settings
      }
    ]);
  };

  const enqueueSessionSync = (session: FocusSessionRecord) => {
    setSyncQueue((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        type: "session",
        payload: session
      }
    ]);
  };

  useEffect(() => {
    if (authUserId) {
      setQueueHydrated(false);
      return;
    }
    setQueueHydrated(false);
    try {
      const rawQueue = window.localStorage.getItem(SYNC_QUEUE_STORAGE_KEY);
      setSyncQueue(rawQueue ? (JSON.parse(rawQueue) as SyncQueueItem[]) : []);

      const rawEvents = window.localStorage.getItem(EVENTS_STORAGE_KEY);
      setAnalyticsEvents(rawEvents ? (JSON.parse(rawEvents) as AnalyticsEvent[]) : []);
    } catch {
      setSyncQueue([]);
      setAnalyticsEvents([]);
    } finally {
      setQueueHydrated(true);
    }
  }, [authUserId]);

  useEffect(() => {
    if (authUserId || !queueHydrated) {
      return;
    }
    window.localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(syncQueue));
  }, [syncQueue, authUserId, queueHydrated]);

  useEffect(() => {
    if (authUserId || !queueHydrated) {
      return;
    }
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(analyticsEvents));
  }, [analyticsEvents, authUserId, queueHydrated]);

  useEffect(() => {
    if (syncQueue.length === 0) {
      return;
    }

    let cancelled = false;
    const runSync = async () => {
      if (!navigator.onLine || cancelled) {
        return;
      }

      let queue = [...syncQueue];

      const latestSettingsItem = [...queue]
        .reverse()
        .find((item) => item.type === "settings");
      if (latestSettingsItem?.type === "settings") {
        try {
          await apiFetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(latestSettingsItem.payload)
          });
          queue = queue.filter((item) => item.type !== "settings");
          trackEvent("settings_synced");
        } catch {
          return;
        }
      }

      const sessionItems = queue.filter((item): item is Extract<SyncQueueItem, { type: "session" }> => item.type === "session");
      if (sessionItems.length > 0) {
        try {
          await apiFetch("/api/focus-sessions/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessions: sessionItems.map((item) => item.payload) })
          });
          queue = queue.filter((item) => item.type !== "session");
          trackEvent("sessions_synced", { count: sessionItems.length });
        } catch {
          return;
        }
      }

      setSyncQueue(queue);
      setLastSyncAtIso(new Date().toISOString());
    };

    void runSync();
    const interval = window.setInterval(runSync, 15000);
    const onOnline = () => {
      void runSync();
    };
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
    };
  }, [syncQueue, apiFetch]);

  return {
    syncQueue,
    analyticsEvents,
    lastSyncAtIso,
    queueHydrated,
    setSyncQueue,
    trackEvent,
    enqueueSettingsSync,
    enqueueSessionSync
  };
}

