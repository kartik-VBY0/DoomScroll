"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { apiRequest } from "@/lib/api";
import styles from "./page.module.css";

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.userId;
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const payload = await apiRequest(`/api/users/${userId}`);
        if (!isMounted) return;
        setUser(payload?.user || null);
        setVideos(Array.isArray(payload?.videos) ? payload.videos : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Unable to load profile.");
        setUser(null);
        setVideos([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const headline = useMemo(() => {
    if (isLoading) return "Loading profile...";
    if (error) return error;
    if (!user) return "Profile not found";
    return `@${user.username}`;
  }, [error, isLoading, user]);

  return (
    <main className={styles.page}>
      <section className={styles.headerCard}>
        <p className={styles.eyebrow}>Profile</p>
        <h1 className={styles.username}>{headline}</h1>
        {user ? (
          <p className={styles.meta}>{videos.length} reels uploaded</p>
        ) : null}
      </section>

      <section className={styles.gridSection}>
        {isLoading ? (
          <div className={styles.stateCard}>Loading reels...</div>
        ) : null}
        {!isLoading && error ? <div className={styles.stateCard}>{error}</div> : null}
        {!isLoading && !error && videos.length === 0 ? (
          <div className={styles.stateCard}>No reels yet</div>
        ) : null}

        {!isLoading && !error && videos.length > 0 ? (
          <div className={styles.reelGrid}>
            {videos.map((video) => (
              <article key={video.id} className={styles.reelTile}>
                <video
                  className={styles.reelVideo}
                  src={video.video_url}
                  preload="metadata"
                  muted
                  playsInline
                  controls
                />
                <div className={styles.reelCaption}>
                  <p>{video.caption || "Untitled reel"}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
