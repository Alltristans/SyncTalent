import { auth } from "@/auth";
import { analyzeCV } from "@/lib/azure";
import { buildLearningRecommendations } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("cv");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing uploaded file." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF and Word documents (.pdf, .docx) are supported." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size must be under 10 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await analyzeCV(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "CV analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const extractedSkills = Array.from(
    new Set(result.skills.map((s) => s.trim()).filter(Boolean))
  );

  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!candidateProfile) {
    return NextResponse.json({ error: "Candidate profile not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.candidateProfile.update({
      where: { id: candidateProfile.id },
      data: {
        resumeText: result.text,
        skillAssessmentScore: result.score
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
          level: 3
        }
      });
    }
  });

  const learningRecommendations = buildLearningRecommendations(extractedSkills.slice(0, 5));

  return NextResponse.json({
    score: result.score,
    matchedSkills: extractedSkills,
    missingSkills: [],
    recommendations: learningRecommendations
  });
}
