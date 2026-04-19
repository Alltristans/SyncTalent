"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type AnalyzeResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: { title: string; link: string }[];
};

type Recommendation = {
  jobId: string;
  title: string;
  companyName: string;
  threshold: number;
  score: number;
  hardLocked: boolean;
  summary: string;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
  learningRecommendations: { title: string; link: string }[];
};

export default function CandidateDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setError("");

    const response = await fetch("/api/candidate/recommendations", { method: "GET" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to fetch recommendations.");
      setIsLoadingRecommendations(false);
      return;
    }

    setRecommendations(data.recommendations ?? []);
    setIsLoadingRecommendations(false);
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("cv", file);

    const response = await fetch("/api/candidate/cv-analyze", {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to analyze CV.");
      setIsUploading(false);
      return;
    }

    setResult(data);
    setIsUploading(false);
    await loadRecommendations();
  };

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    setFeedback("");

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId })
    });
    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.error ?? "Application failed.");
      setApplyingJobId(null);
      return;
    }

    setFeedback("Application submitted successfully.");
    setApplyingJobId(null);
  };

  return (
    <main className="min-h-screen bg-mesh pt-32 px-6">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Candidate Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="md:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent-blue" /> Upload CV
              </h2>
              <div 
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-accent-blue/50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                }}
                onClick={() => document.getElementById("cv-upload")?.click()}
              >
                <input 
                  id="cv-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                />
                <FileText className="w-10 h-10 mx-auto mb-4 text-white/20" />
                <p className="text-sm text-white/40">
                  {file ? file.name : "Drag and drop or click to upload PDF"}
                </p>
              </div>
              <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full mt-6 py-3 bg-accent-blue text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze with AI"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="md:col-span-2 space-y-6">
            {error ? (
              <div className="glass-card p-4 border border-red-500/40 text-red-300 text-sm">
                {error} <Link href="/login" className="underline">Sign in</Link> and retry if needed.
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              {!result && !isUploading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center text-white/30"
                >
                  Upload your CV to see your match profile.
                </motion.div>
              )}

              {isUploading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-accent-blue" />
                  <p className="text-lg font-medium">Syncing with Azure AI...</p>
                  <p className="text-sm text-white/40">Analyzing skills and matching with Logistics JDs</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Matching Profile</h3>
                      <div className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-bold">
                        {result.score}% Match
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white/40 mb-2">Verified Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {result.matchedSkills.map((s: string) => (
                            <span key={s} className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/40 mb-2">Skill Gaps Detected</p>
                        <div className="flex flex-wrap gap-2">
                          {result.missingSkills.map((s: string) => (
                            <span key={s} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs flex items-center gap-1 text-red-300">
                              <AlertCircle className="w-3 h-3" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 border-accent-purple/30 bg-accent-purple/5">
                    <h3 className="text-lg font-bold mb-4">Recommended Learning Paths</h3>
                    <div className="space-y-3">
                      {result.recommendations.map((r) => (
                        <a key={r.title} href={r.link} target="_blank" className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                          <p className="font-medium">{r.title}</p>
                          <p className="text-xs text-accent-blue mt-1 flex items-center gap-1">View on Microsoft Learn <ArrowRight className="w-3 h-3" /></p>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Job Recommendations</h3>
                <button
                  onClick={loadRecommendations}
                  className="text-xs px-3 py-1 rounded border border-white/20 hover:bg-white/10"
                >
                  Refresh
                </button>
              </div>

              {isLoadingRecommendations ? (
                <div className="text-sm text-white/50">Loading recommendations...</div>
              ) : recommendations.length === 0 ? (
                <div className="text-sm text-white/50">No recommendations yet. Upload CV first.</div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((job) => (
                    <div key={job.jobId} className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-semibold">{job.title}</p>
                          <p className="text-sm text-white/50">{job.companyName}</p>
                          <p className="text-xs text-white/40 mt-1">{job.summary}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{job.score}% Match</p>
                          <p className="text-xs text-white/40">Threshold {job.threshold}%</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.missingRequired.map((skill) => (
                          <span key={skill} className="px-2 py-1 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-300">
                            Missing: {skill}
                          </span>
                        ))}
                      </div>

                      <button
                        disabled={job.hardLocked || applyingJobId === job.jobId}
                        onClick={() => handleApply(job.jobId)}
                        className="mt-4 px-4 py-2 rounded-lg bg-accent-blue text-white text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {job.hardLocked ? <Lock className="w-4 h-4" /> : null}
                        {applyingJobId === job.jobId ? "Applying..." : job.hardLocked ? "Hard-Locked" : "Apply"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {feedback ? <p className="text-sm text-green-300">{feedback}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
