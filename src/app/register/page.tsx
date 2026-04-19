"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Role = "CANDIDATE" | "EMPLOYER";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        companyName: role === "EMPLOYER" ? companyName : undefined
      })
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      if (typeof data.error === "string") {
        setError(data.error);
      } else {
        setError("Registration failed. Please check your form.");
      }
      return;
    }

    window.location.href = "/login?registered=1";
  };

  return (
    <main className="min-h-screen bg-mesh px-6 pt-28">
      <div className="max-w-lg mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-white/60 mb-6 text-sm">Register as candidate or employer.</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-accent-blue"
              required
            />
          </div>

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
              minLength={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-accent-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-accent-blue"
            >
              <option value="CANDIDATE">Candidate</option>
              <option value="EMPLOYER">Employer</option>
            </select>
          </div>

          {role === "EMPLOYER" ? (
            <div>
              <label className="block text-sm mb-1">Company Name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-accent-blue"
                required
              />
            </div>
          ) : null}

          {error ? <p className="text-red-300 text-sm">{error}</p> : null}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-3 rounded-lg bg-accent-blue text-white font-semibold disabled:opacity-50"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-5 text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-blue hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </main>
  );
}
