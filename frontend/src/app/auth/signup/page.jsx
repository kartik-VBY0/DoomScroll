"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signup({ email, username, password });
      router.push("/");
    } catch (err) {
      setError(err.message || "Unable to create account");
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
        <h1>Create Account</h1>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          required
          style={{ padding: "0.65rem", borderRadius: 8, border: "1px solid #344671", background: "#111b34", color: "#eef4ff" }}
        />
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
          {isLoading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </main>
  );
}
