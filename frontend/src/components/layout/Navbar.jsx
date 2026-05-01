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
        <button type="button" className={styles.btnSoft}>
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
