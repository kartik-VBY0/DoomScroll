"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { apiRequest } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import styles from "./page.module.css";

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.userId;
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const isOwner = useMemo(
    () => Boolean(authUser?.id && userId && String(authUser.id) === String(userId)),
    [authUser, userId]
  );

  const handleDelete = useCallback(
    async (videoId) => {
      if (!videoId || isDeleting) return;
      const confirmed = window.confirm("Delete this reel? This cannot be undone.");
      if (!confirmed) return;

      setIsDeleting(true);
      setError("");
      try {
        await apiRequest(`/api/videos/${videoId}`, { method: "DELETE" });
        setVideos((prev) => prev.filter((video) => video.id !== videoId));
      } catch (err) {
        setError(err?.message || "Unable to delete reel.");
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting]
  );

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
                {isOwner ? (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(video.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                ) : null}
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
