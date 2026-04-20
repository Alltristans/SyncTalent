import { auth } from "@/auth";
import { buildLearningRecommendations, computeMatch } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: {
        include: { skill: true }
      }
    }
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate profile not found." }, { status: 404 });
  }

  const candidateSkills = candidate.skills.map((entry) => ({
    name: entry.skill.name,
    level: entry.level
  }));

  const jobs = await prisma.job.findMany({
    include: {
      employer: {
        include: { employerProfile: true }
      },
      jobSkills: {
        include: { skill: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const recommendations = jobs
    .map((job) => {
      const requiredSkills = job.jobSkills
        .filter((item) => item.required)
        .map((item) => item.skill.name);
      const preferredSkills = job.jobSkills
        .filter((item) => !item.required)
        .map((item) => item.skill.name);

      const match = computeMatch({
        candidateSkills,
        requiredSkills,
        preferredSkills,
        threshold: job.threshold,
        assessmentScore: candidate.skillAssessmentScore
      });

      return {
        jobId: job.id,
        title: job.title,
        companyName: job.employer.employerProfile?.companyName ?? job.employer.name,
        threshold: job.threshold,
        score: match.score,
        hardLocked: match.hardLocked,
        summary: match.summary,
        matchedRequired: match.matchedRequired,
        missingRequired: match.missingRequired,
        matchedPreferred: match.matchedPreferred,
        missingPreferred: match.missingPreferred,
        learningRecommendations: buildLearningRecommendations(
          match.missingRequired.concat(match.missingPreferred)
        )
      };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({
    candidateSkills: candidateSkills.map((s) => s.name),
    assessmentScore: candidate.skillAssessmentScore,
    recommendations
  });
}
