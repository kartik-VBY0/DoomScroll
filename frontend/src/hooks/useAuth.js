"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";
import { clearAuthState, getAuthState, loadAuthState, setAuthState } from "@/store/authStore";

export default function useAuth() {
  const [auth, setAuth] = useState(() => getAuthState());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuth(loadAuthState());
  }, []);

  useEffect(() => {
    const handleAuthChange = () => setAuth(loadAuthState());
    window.addEventListener("authStateChanged", handleAuthChange);
    return () => window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(setAuthState(result));
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ email, username, password }) => {
    setIsLoading(true);
    try {
      const result = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      setAuth(setAuthState(result));
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    if (!getAuthState().token) return null;

    const result = await apiRequest("/api/auth/me");
    const current = getAuthState();
    setAuth(
      setAuthState({
        user: result.user,
        token: current.token,
      })
    );
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setAuth(clearAuthState());
  }, []);

  return useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: Boolean(auth.token),
      isLoading,
      login,
      signup,
      fetchMe,
      logout,
    }),
    [auth, fetchMe, isLoading, login, logout, signup]
  );
}
