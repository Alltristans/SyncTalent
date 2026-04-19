import { auth } from "@/auth";
import { computeMatch } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const applySchema = z.object({
  jobId: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = applySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [candidate, job] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        skills: { include: { skill: true } }
      }
    }),
    prisma.job.findUnique({
      where: { id: parsed.data.jobId },
      include: {
        jobSkills: { include: { skill: true } }
      }
    })
  ]);

  if (!candidate || !job) {
    return NextResponse.json({ error: "Candidate profile or job not found" }, { status: 404 });
  }

  const requiredSkills = job.jobSkills.filter((item) => item.required).map((item) => item.skill.name);
  const preferredSkills = job.jobSkills.filter((item) => !item.required).map((item) => item.skill.name);

  const match = computeMatch({
    candidateSkills: candidate.skills.map((entry) => entry.skill.name),
    requiredSkills,
    preferredSkills,
    threshold: job.threshold,
    assessmentScore: candidate.skillAssessmentScore
  });

  if (match.hardLocked) {
    return NextResponse.json(
      {
        error: "Application blocked by hard-lock matching",
        score: match.score,
        missingRequired: match.missingRequired,
        summary: match.summary
      },
      { status: 400 }
    );
  }

  const application = await prisma.application.upsert({
    where: {
      candidateId_jobId: {
        candidateId: session.user.id,
        jobId: job.id
      }
    },
    update: {
      matchScore: match.score,
      hardLocked: false,
      matchSummary: match.summary,
      status: "APPLIED"
    },
    create: {
      candidateId: session.user.id,
      jobId: job.id,
      matchScore: match.score,
      hardLocked: false,
      matchSummary: match.summary,
      status: "APPLIED"
    }
  });

  return NextResponse.json({ application });
}
