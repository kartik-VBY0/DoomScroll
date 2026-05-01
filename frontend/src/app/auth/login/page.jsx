"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import { setAuthState } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchMe, login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    const email = searchParams.get("email");
    const username = searchParams.get("username");
    const id = searchParams.get("id");

    setAuthState({
      token,
      user: {
        id: id || null,
        email: email || null,
        username: username || null,
      },
    });

    if (fetchMe) {
      fetchMe().catch(() => null);
    }

    router.replace("/");
  }, [fetchMe, router, searchParams]);

  const handleGoogleSignIn = () => {
    const oauthUrl =
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google`;
    if (!oauthUrl) {
      setError("Google sign-in is not configured yet. Set NEXT_PUBLIC_GOOGLE_AUTH_URL to enable it.");
      return;
    }

    window.location.href = oauthUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      router.push("/");
    } catch (err) {
      setError(err.message || "Unable to sign in");
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          display: "grid",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: 12,
          border: "1px solid #2b385f",
          background: "#0d1428",
        }}
      >
        <h1>Sign In</h1>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            padding: "0.65rem",
            borderRadius: 999,
            border: "1px solid #344671",
            background: "#111b34",
            color: "#eef4ff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
        <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>or sign in with email</p>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          style={{ padding: "0.65rem", borderRadius: 8, border: "1px solid #344671", background: "#111b34", color: "#eef4ff" }}
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          style={{ padding: "0.65rem", borderRadius: 8, border: "1px solid #344671", background: "#111b34", color: "#eef4ff" }}
        />
        {error ? <p style={{ color: "#ff8ca4" }}>{error}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "0.65rem", border: 0, borderRadius: 999, fontWeight: 700, cursor: "pointer" }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
        <p style={{ fontSize: "0.92rem" }}>
          New here? <Link href="/auth/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
