"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  hasUsedTrial: boolean;
  hasClaimedTrial: boolean;
  claimedTrialAt: string | null;
  trialOrderId: string | null;
  trialUsedAt: string | null;
};

type SessionState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
};

export function useSession() {
  const [state, setState] = useState<SessionState>({
    isLoaded: false,
    isSignedIn: false,
    user: null,
  });
  const router = useRouter();

  const fetchUser = useCallback(() => {
    return fetch("/api/auth/me")
      .then(async (res) => {
        if (res.ok) {
          const user = await res.json();
          setState({ isLoaded: true, isSignedIn: true, user });
        } else {
          setState({ isLoaded: true, isSignedIn: false, user: null });
        }
      })
      .catch(() => {
        setState({ isLoaded: true, isSignedIn: false, user: null });
      });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = async (opts?: { redirectUrl?: string }) => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {
      // proceed with redirect even if request fails
    }
    setState({ isLoaded: true, isSignedIn: false, user: null });
    router.push(opts?.redirectUrl || "/login");
  };

  return { ...state, signOut, refresh: fetchUser };
}
