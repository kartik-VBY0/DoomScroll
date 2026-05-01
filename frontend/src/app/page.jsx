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
  const touchStartYRef = useRef(null);

  const currentReel = useMemo(() => reels[currentIndex], [reels, currentIndex]);
  const reelsCount = reels.length;

  useEffect(() => {
    if (!reelsCount) return;
    if (currentIndex >= reelsCount) {
      setCurrentIndex(0);
    }
  }, [currentIndex, reelsCount]);

  useEffect(() => {
    setIsPlaying(true);
  }, [currentIndex]);

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

    if (typeof window !== "undefined") {
      window.currentReelForDownload = {
        id: currentReel.id,
        url: currentReel.video_url,
        caption: currentReel.caption || "reel",
        username: currentReel.username || currentReel.user_id || "creator",
      };
    }

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

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.currentReelForDownload = null;
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    if (!reelsCount) return;
    setCurrentIndex((prev) => (prev + 1) % reelsCount);
  }, [reelsCount]);

  const handlePrev = useCallback(() => {
    if (!reelsCount) return;
    setCurrentIndex((prev) => (prev - 1 + reelsCount) % reelsCount);
  }, [reelsCount]);

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches?.[0];
    touchStartYRef.current = touch ? touch.clientY : null;
  }, []);

  const handleTouchEnd = useCallback(
    (event) => {
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      if (startY === null) return;

      const touch = event.changedTouches?.[0];
      if (!touch) return;
      const deltaY = touch.clientY - startY;
      const threshold = 60;

      if (deltaY <= -threshold) {
        handleNext();
      } else if (deltaY >= threshold) {
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const active = document.activeElement;
      const isTypingTarget =
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
      if (isTypingTarget) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

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

              <div className={styles.videoFrame} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {currentReel ? (
                  <video
                    ref={videoRef}
                    className={styles.videoElement}
                    src={currentReel.video_url}
                    playsInline
                    preload="auto"
                    loop
                    onClick={handleTogglePlay}
                  />
                ) : null}

                <div className={styles.captionBlock}>
                  <p>@{currentReel?.username || currentReel?.user_id || "creator"}</p>
                  <h2>{currentReel?.caption || "Untitled reel"}</h2>
                </div>
              </div>
            </article>

            <aside className={styles.rightRail}>
              <div className={styles.actionStack}>
                <button
                  type="button"
                  className={`${styles.actionPill} ${isLiked ? styles.actionPillActive : ""}`}
                  onClick={handleToggleLike}
                  aria-label="Like reel"
                >
                  <span
                    className={`${styles.actionIcon} ${isLiked ? styles.actionIconActive : ""}`}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path
                        d="M12 20.25c-.3 0-.59-.11-.81-.31l-7.2-6.63A5.4 5.4 0 0 1 12 4.5a5.4 5.4 0 0 1 8.01 8.81l-7.2 6.63c-.22.2-.51.31-.81.31Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <strong className={styles.actionCount}>{likeCount}</strong>
                </button>
                <button
                  type="button"
                  className={`${styles.actionPill} ${showComments ? styles.actionPillActive : ""}`}
                  onClick={handleToggleComments}
                  aria-label="Show comments"
                >
                  <span className={styles.actionIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path
                        d="M5 18.5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 5 4.5h14A2.5 2.5 0 0 1 21.5 7v7A2.5 2.5 0 0 1 19 16.5H9.5L6.2 19.6a.9.9 0 0 1-1.2-.02.9.9 0 0 1-.25-.62v-.46Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <strong className={styles.actionCount}>{comments.length}</strong>
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
