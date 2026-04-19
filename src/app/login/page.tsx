"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("candidate@jobmatch.ai");
  const [password, setPassword] = useState("Password123!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid credentials.");
      return;
    }

    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-mesh px-6 pt-28">
      <div className="max-w-lg mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-2">Login</h1>
        <p className="text-white/60 mb-6 text-sm">
          Demo candidate: candidate@jobmatch.ai / Password123!<br />
          Demo employer: employer@jobmatch.ai / Password123!
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-accent-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-accent-blue"
              required
            />
          </div>

          {error ? <p className="text-red-300 text-sm">{error}</p> : null}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-3 rounded-lg bg-accent-blue text-white font-semibold disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link href="/" className="block mt-5 text-sm text-accent-blue hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
