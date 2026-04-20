import { auth } from "@/auth";
import { computeMatch } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await ctx.params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      jobSkills: { include: { skill: true } }
    }
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (job.employerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const candidates = await prisma.candidateProfile.findMany({
    include: {
      user: true,
      skills: { include: { skill: true } }
    }
  });

  const requiredSkills = job.jobSkills
    .filter((entry) => entry.required)
    .map((entry) => entry.skill.name);
  const preferredSkills = job.jobSkills
    .filter((entry) => !entry.required)
    .map((entry) => entry.skill.name);

  const rankedCandidates = candidates
    .map((candidate) => {
      const candidateSkills = candidate.skills.map((entry) => ({
        name: entry.skill.name,
        level: entry.level
      }));

      const match = computeMatch({
        candidateSkills,
        requiredSkills,
        preferredSkills,
        threshold: job.threshold,
        assessmentScore: candidate.skillAssessmentScore
      });

      return {
        candidateId: candidate.userId,
        candidateName: candidate.user.name,
        score: match.score,
        hardLocked: match.hardLocked,
        summary: match.summary,
        matchedRequired: match.matchedRequired,
        missingRequired: match.missingRequired
      };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ candidates: rankedCandidates });
}
