"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AdminMetricsPayload } from "@/lib/admin-metrics";

const POLL_INTERVAL_MS = 30000;

interface AdminAnalyticsState {
  data: AdminMetricsPayload | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const AdminAnalyticsContext = createContext<AdminAnalyticsState | null>(null);

export function AdminAnalyticsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminMetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const requestSeq = useRef(0);

  const fetchMetrics = useCallback(async (opts?: { background?: boolean }) => {
    const seq = ++requestSeq.current;
    if (opts?.background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load metrics");
      if (seq === requestSeq.current) {
        setData(json as AdminMetricsPayload);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (seq === requestSeq.current) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const refresh = useCallback(() => fetchMetrics({ background: true }), [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(() => fetchMetrics({ background: true }), POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchMetrics({ background: true });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchMetrics]);

  return (
    <AdminAnalyticsContext.Provider
      value={{ data, loading, refreshing, error, lastUpdated, refresh }}
    >
      {children}
    </AdminAnalyticsContext.Provider>
  );
}

export function useAdminAnalytics(): AdminAnalyticsState {
  const ctx = useContext(AdminAnalyticsContext);
  if (!ctx) {
    throw new Error("useAdminAnalytics must be used within AdminAnalyticsProvider");
  }
  return ctx;
}
