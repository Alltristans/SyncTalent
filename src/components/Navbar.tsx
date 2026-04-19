"use client";

import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BriefcaseBusiness className="w-8 h-8 text-accent-blue" />
          <span className="text-xl font-bold tracking-tight">SyncTalent <span className="text-accent-blue">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-accent-blue transition-colors">Features</Link>
          <Link href="/candidate" className="hover:text-accent-blue transition-colors">Candidate</Link>
          <Link href="/employer" className="hover:text-accent-blue transition-colors">Employer</Link>
          <Link href="/login" className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors">Login</Link>
        </div>
      </div>
    </nav>
  );
}
