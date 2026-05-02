"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";

function shuffleReels(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function useReels() {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReels = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/api/videos");
      const list = Array.isArray(payload?.videos) ? payload.videos : [];
      setReels(shuffleReels(list));
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
