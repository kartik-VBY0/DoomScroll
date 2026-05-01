"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useReels from "@/hooks/useReels";
import { apiRequest } from "@/lib/api";
import styles from "./page.module.css";

export default function HomePage() {
  const { reels, isLoading, error } = useReels();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showComments, setShowComments] = useState(false);

  const currentReel = useMemo(() => reels[currentIndex], [reels, currentIndex]);
  const reelsCount = reels.length;

  useEffect(() => {
    if (!reelsCount) return;
    if (currentIndex >= reelsCount) {
      setCurrentIndex(0);
    }
  }, [currentIndex, reelsCount]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (!currentReel?.id) return;
    setLikeCount(currentReel.like_count || 0);
    setIsLiked(false);
    setComments([]);
    setCommentError("");
    setShowComments(false);

    const loadComments = async () => {
      try {
        const payload = await apiRequest(`/api/comments/${currentReel.id}`);
        setComments(Array.isArray(payload?.comments) ? payload.comments : []);
      } catch (err) {
        setCommentError(err?.message || "Unable to load comments.");
      }
    };

    const loadLikeStatus = async () => {
      try {
        const payload = await apiRequest(`/api/likes/${currentReel.id}`);
        setIsLiked(Boolean(payload?.liked));
        if (typeof payload?.count === "number") {
          setLikeCount(payload.count);
        }
      } catch (err) {
        // unauthenticated users can still view counts from video list
      }
    };

    loadComments();
    loadLikeStatus();
  }, [currentReel]);

  const handleNext = useCallback(() => {
    if (!reelsCount) return;
    setCurrentIndex((prev) => (prev + 1) % reelsCount);
  }, [reelsCount]);

  const handlePrev = useCallback(() => {
    if (!reelsCount) return;
    setCurrentIndex((prev) => (prev - 1 + reelsCount) % reelsCount);
  }, [reelsCount]);

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleToggleLike = useCallback(async () => {
    if (!currentReel?.id) return;
    try {
      const payload = await apiRequest("/api/likes/toggle", {
        method: "POST",
        body: JSON.stringify({ videoId: currentReel.id }),
      });
      setIsLiked(Boolean(payload?.liked));
      if (typeof payload?.count === "number") {
        setLikeCount(payload.count);
      }
    } catch (err) {
      setCommentError(err?.message || "Unable to like this reel.");
    }
  }, [currentReel]);

  const handleToggleComments = useCallback(() => {
    setShowComments((prev) => !prev);
  }, []);

  const handleAddComment = useCallback(
    async (event) => {
      event.preventDefault();
      if (!currentReel?.id || !commentText.trim()) return;
      setIsCommenting(true);
      setCommentError("");

      try {
        const payload = await apiRequest("/api/comments", {
          method: "POST",
          body: JSON.stringify({ videoId: currentReel.id, body: commentText.trim() }),
        });
        if (payload?.comment) {
          setComments((prev) => [payload.comment, ...prev]);
        }
        setCommentText("");
      } catch (err) {
        setCommentError(err?.message || "Unable to add comment.");
      } finally {
        setIsCommenting(false);
      }
    },
    [commentText, currentReel]
  );

  const renderState = useMemo(() => {
    if (isLoading) return "Loading reels...";
    if (error) return error;
    if (!reelsCount) return "No reels yet";
    return "";
  }, [error, isLoading, reelsCount]);

  return (
    <main className={styles.page}>
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />

      <section className={styles.viewerSection}>
        {renderState ? (
          <div className={styles.stateCard}>{renderState}</div>
        ) : (
          <div className={styles.reelShell}>
            <article className={styles.reelCard}>
              <header className={styles.reelHeader}>
                <span className={styles.liveDot} />
                <p>Reel {currentIndex + 1}</p>
              </header>

              <div className={styles.videoFrame}>
                {currentReel ? (
                  <video
                    ref={videoRef}
                    className={styles.videoElement}
                    src={currentReel.video_url}
                    playsInline
                    preload="auto"
                    onEnded={handleNext}
                  />
                ) : null}

                <button type="button" className={styles.playToggle} onClick={handleTogglePlay}>
                  {isPlaying ? "Pause" : "Play"}
                </button>

                <div className={styles.captionBlock}>
                  <h2>{currentReel?.caption || "Untitled reel"}</h2>
                  <p>@{currentReel?.user_id || "creator"}</p>
                </div>
              </div>
            </article>

            <aside className={styles.rightRail}>
              <div className={styles.actionStack}>
                <button
                  type="button"
                  className={`${styles.actionPill} ${isLiked ? styles.actionPillActive : ""}`}
                  onClick={handleToggleLike}
                >
                  <span>Like</span>
                  <strong>{likeCount}</strong>
                </button>
                <button
                  type="button"
                  className={`${styles.actionPill} ${showComments ? styles.actionPillActive : ""}`}
                  onClick={handleToggleComments}
                >
                  <span>Comments</span>
                  <strong>{comments.length}</strong>
                </button>
              </div>

              <div className={styles.reelNav}>
                <button type="button" className={styles.navButton} onClick={handlePrev} aria-label="Previous reel">
                  &#8593;
                </button>
                <button type="button" className={styles.navButton} onClick={handleNext} aria-label="Next reel">
                  &#8595;
                </button>
              </div>
            </aside>

            {showComments ? (
              <aside className={styles.commentDrawer}>
                <header className={styles.commentHeader}>
                  <h3>Comments</h3>
                  <button type="button" className={styles.closeButton} onClick={handleToggleComments}>
                    Close
                  </button>
                </header>
                <form className={styles.commentForm} onSubmit={handleAddComment}>
                  <input
                    type="text"
                    className={styles.commentInput}
                    placeholder="Add a comment"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                  />
                  <button type="submit" className={styles.commentButton} disabled={isCommenting}>
                    {isCommenting ? "Posting..." : "Post"}
                  </button>
                </form>
                {commentError ? <div className={styles.commentError}>{commentError}</div> : null}
                <div className={styles.commentList}>
                  {comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <p className={styles.commentAuthor}>@{comment.username || comment.user_id}</p>
                      <p className={styles.commentBody}>{comment.body}</p>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
