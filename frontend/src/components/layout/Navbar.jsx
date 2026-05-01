"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const profileHref = user?.id ? `/profile/${user.id}` : "/profile";
  const profileInitial = user?.username?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push("/auth/login");
  };

  const handleDownloadReel = async () => {
    const reel = typeof window !== "undefined" ? window.currentReelForDownload : null;
    if (!reel?.url) {
      window.alert("No reel is available to download yet.");
      return;
    }

    try {
      const response = await fetch(reel.url);
      if (!response.ok) {
        throw new Error("Unable to download reel.");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeCaption = String(reel.caption || "reel")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      anchor.href = objectUrl;
      anchor.download = `${safeCaption || "reel"}-${reel.id}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.alert(error.message || "Unable to download reel.");
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoWrap} aria-label="Go to home">
        <div className={styles.logoMark}>
          <span className={styles.logoSwirl} />
        </div>
        <span className={styles.logoText}>doomscroll</span>
      </Link>

      <div className={styles.navActions}>
        {!isAuthenticated ? (
          <Link href="/auth/login" className={styles.btnGhost}>
            Sign In
          </Link>
        ) : null}
        <button type="button" className={styles.btnSoft} onClick={handleDownloadReel}>
          Download Reel
        </button>
        <Link href="/upload" className={styles.btnPrimary}>
          Upload Reel
        </Link>
        {isAuthenticated ? (
          <div className={styles.profileMenu} ref={menuRef}>
            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
            >
              <span className={styles.avatarCircle}>{profileInitial}</span>
            </button>
            {isMenuOpen ? (
              <div className={styles.dropdown} role="menu">
                <Link href={profileHref} className={styles.dropdownItem} role="menuitem">
                  View profile
                </Link>
                <button type="button" className={styles.dropdownItem} role="menuitem" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
