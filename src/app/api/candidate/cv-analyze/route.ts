import { auth } from "@/auth";
import { analyzeCV } from "@/lib/azure";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type AnalyzeResponse = {
  score?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  recommendations?: { title: string; link: string }[];
  skills?: string[];
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("cv");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing uploaded file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = (await analyzeCV(buffer)) as AnalyzeResponse;

  const extractedSkills = Array.from(
    new Set([...(result.matchedSkills ?? []), ...(result.skills ?? [])].map((item) => item.trim()).filter(Boolean))
  );

  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!candidateProfile) {
    return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.candidateProfile.update({
      where: { id: candidateProfile.id },
      data: {
        resumeText: result.skills?.join(", ") ?? null,
        skillAssessmentScore: result.score ?? candidateProfile.skillAssessmentScore
      }
    });

    await tx.candidateSkill.deleteMany({
      where: { candidateProfileId: candidateProfile.id }
    });

    for (const skillName of extractedSkills) {
      const skill = await tx.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName }
      });

      await tx.candidateSkill.create({
        data: {
          candidateProfileId: candidateProfile.id,
          skillId: skill.id,
          level: 2
        }
      });
    }
  });

  return NextResponse.json({
    score: result.score ?? 0,
    matchedSkills: result.matchedSkills ?? extractedSkills,
    missingSkills: result.missingSkills ?? [],
    recommendations: result.recommendations ?? []
  });
}
