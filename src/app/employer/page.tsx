"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Plus, Users, Building, ShieldCheck, ListChecks, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type JobItem = {
  id: string;
  title: string;
  description: string;
  threshold: number;
  companyName: string;
  requiredSkills: string[];
  preferredSkills: string[];
  applicationsCount: number;
};

type RankedCandidate = {
  candidateId: string;
  candidateName: string;
  score: number;
  hardLocked: boolean;
  summary: string;
  missingRequired: string[];
};

export default function EmployerDashboard() {
  const [isPosting, setIsPosting] = useState(false);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [error, setError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);

  const [title, setTitle] = useState("Supply Chain Manager");
  const [description, setDescription] = useState("Lead supply chain optimization with data-driven planning.");
  const [threshold, setThreshold] = useState(80);
  const [requiredSkillsText, setRequiredSkillsText] = useState("Supply Chain, Data Analysis");
  const [preferredSkillsText, setPreferredSkillsText] = useState("Azure AI, Communication");

  const loadJobs = async () => {
    setError("");
    const response = await fetch("/api/jobs");
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to load jobs.");
      return;
    }

    setJobs(data.jobs ?? []);
  };

  const loadRankedCandidates = async (jobId: string) => {
    setSelectedJobId(jobId);
    setError("");
    const response = await fetch(`/api/jobs/${jobId}/candidates`);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to load candidates.");
      setRankedCandidates([]);
      return;
    }

    setRankedCandidates(data.candidates ?? []);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onCreateJob = async (event: FormEvent) => {
    event.preventDefault();

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        threshold,
        requiredSkills: requiredSkillsText.split(",").map((item) => item.trim()).filter(Boolean),
        preferredSkills: preferredSkillsText.split(",").map((item) => item.trim()).filter(Boolean)
      })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Failed to create job.");
      return;
    }

    setIsPosting(false);
    await loadJobs();
    await loadRankedCandidates(data.job.id);
  };

  return (
    <main className="min-h-screen bg-mesh pt-32 px-6">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Employer Portal</h1>
          <button 
            onClick={() => setIsPosting(true)}
            className="px-6 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" /> Post New Position
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-accent-blue" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">LogiTech Solutions</h2>
                  <p className="text-sm text-white/40 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-400" /> SafePlace Verified
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Open Positions</span>
                  <span className="font-medium">{jobs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Total Applicants</span>
                  <span className="font-medium">{jobs.reduce((sum, item) => sum + item.applicationsCount, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Matching Rate</span>
                  <span className="font-medium text-green-400">Hard-lock enabled</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-accent-blue/30 bg-accent-blue/5">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Precision Stats
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Your high threshold for matching has saved your HR team approximately 45 hours of manual screening last month.
              </p>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="lg:col-span-2 space-y-6">
            {error ? <div className="glass-card p-4 border border-red-500/40 text-red-300 text-sm">{error}</div> : null}

            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-blue" /> Currently Hiring
            </h2>
            
            <div className="grid gap-4">
              {jobs.map((job) => (
                <JobRow
                  key={job.id}
                  title={job.title}
                  matchingCandidates={job.applicationsCount}
                  totalApplicants={job.applicationsCount}
                  status={`Threshold ${job.threshold}%`}
                  onManage={() => loadRankedCandidates(job.id)}
                />
              ))}
            </div>

            {selectedJobId ? (
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4">Ranked Candidates</h3>
                {rankedCandidates.length === 0 ? (
                  <p className="text-sm text-white/50">No candidates available for this job.</p>
                ) : (
                  <div className="space-y-3">
                    {rankedCandidates.map((candidate) => (
                      <div key={candidate.candidateId} className="p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{candidate.candidateName}</p>
                          <p className="text-sm">{candidate.score}%</p>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{candidate.summary}</p>
                        {candidate.missingRequired.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {candidate.missingRequired.map((skill) => (
                              <span key={skill} className="text-xs px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300">
                                Missing: {skill}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mock Posting Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-2xl w-full p-8 relative"
          >
            <button onClick={() => setIsPosting(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Create New Opportunity</h2>
            <form className="space-y-4" onSubmit={onCreateJob}>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-accent-blue outline-none" placeholder="e.g. Senior Logistics Coordinator" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Matching Threshold</label>
                  <input value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} type="number" min={1} max={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-accent-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Required Skills (comma separated)</label>
                  <input value={requiredSkillsText} onChange={(e) => setRequiredSkillsText(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-accent-blue outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Skills (comma separated)</label>
                <input value={preferredSkillsText} onChange={(e) => setPreferredSkillsText(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-accent-blue outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Narrative Description (For AI Analysis)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-accent-blue outline-none" placeholder="Describe the role in detail. Our AI will extract the necessary skills from this text." />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-accent-blue text-white rounded-lg font-bold mt-4"
              >
                Publish Posting
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}

function JobRow({ title, matchingCandidates, totalApplicants, status, onManage }: { title: string, matchingCandidates: number, totalApplicants: number, status: string, onManage: () => void }) {
  return (
    <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white/5 transition-colors">
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-white/40">{status} • Posted 2 days ago</p>
      </div>
      <div className="flex gap-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent-blue">{matchingCandidates}</p>
          <p className="text-xs text-white/40 uppercase tracking-wider">Matched</p>
        </div>
        <div className="text-center border-l border-white/10 pl-8">
          <p className="text-2xl font-bold">{totalApplicants}</p>
          <p className="text-xs text-white/40 uppercase tracking-wider">Total</p>
        </div>
      </div>
      <button onClick={onManage} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
        Manage
      </button>
    </div>
  );
}
