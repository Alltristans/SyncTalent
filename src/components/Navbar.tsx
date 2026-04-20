"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BriefcaseBusiness, LogOut, Loader2 } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const role = session?.user?.role;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BriefcaseBusiness className="w-8 h-8 text-accent-blue" />
          <span className="text-xl font-bold tracking-tight">
            SyncTalent <span className="text-accent-blue">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-accent-blue transition-colors">
            Features
          </Link>

          {isLoggedIn && role === "CANDIDATE" && (
            <Link href="/candidate" className="hover:text-accent-blue transition-colors">
              Candidate
            </Link>
          )}

          {isLoggedIn && role === "EMPLOYER" && (
            <Link href="/employer" className="hover:text-accent-blue transition-colors">
              Employer
            </Link>
          )}

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white/40" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-xs">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
