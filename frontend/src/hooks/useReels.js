"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";

export default function useReels() {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReels = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/api/videos");
      setReels(Array.isArray(payload?.videos) ? payload.videos : []);
    } catch (err) {
      setReels([]);
      setError(err?.message || "Unable to load reels.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  return useMemo(
    () => ({ reels, isLoading, error, refresh: fetchReels }),
    [reels, isLoading, error, fetchReels]
  );
}
