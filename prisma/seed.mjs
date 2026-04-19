import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const seedSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Azure AI",
  "Logistics Operations",
  "Data Analysis",
  "Supply Chain",
  "SQL",
  "Communication",
  "Problem Solving"
];

async function main() {
  for (const name of seedSkills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const candidatePasswordHash = await bcrypt.hash("Password123!", 10);
  const employerPasswordHash = await bcrypt.hash("Password123!", 10);

  const candidate = await prisma.user.upsert({
    where: { email: "candidate@jobmatch.ai" },
    update: {
      name: "Demo Candidate",
      role: Role.CANDIDATE,
      passwordHash: candidatePasswordHash
    },
    create: {
      email: "candidate@jobmatch.ai",
      name: "Demo Candidate",
      role: Role.CANDIDATE,
      passwordHash: candidatePasswordHash,
      candidateProfile: {
        create: {
          summary: "Candidate for logistics-tech jobs",
          skillAssessmentScore: 78
        }
      }
    },
    include: { candidateProfile: true }
  });

  const employer = await prisma.user.upsert({
    where: { email: "employer@jobmatch.ai" },
    update: {
      name: "Demo Employer",
      role: Role.EMPLOYER,
      passwordHash: employerPasswordHash
    },
    create: {
      email: "employer@jobmatch.ai",
      name: "Demo Employer",
      role: Role.EMPLOYER,
      passwordHash: employerPasswordHash,
      employerProfile: {
        create: {
          companyName: "LogiTech Solutions",
          isVerified: true
        }
      }
    }
  });

  if (!candidate.candidateProfile) {
    throw new Error("Candidate profile is missing after seed upsert.");
  }

  const candidateSkills = [
    "React",
    "TypeScript",
    "Node.js",
    "Logistics Operations",
    "Problem Solving"
  ];

  for (const skillName of candidateSkills) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) continue;

    await prisma.candidateSkill.upsert({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: candidate.candidateProfile.id,
          skillId: skill.id
        }
      },
      update: { level: 2 },
      create: {
        candidateProfileId: candidate.candidateProfile.id,
        skillId: skill.id,
        level: 2
      }
    });
  }

  const job = await prisma.job.upsert({
    where: { id: "seed-logistics-data-analyst" },
    update: {
      title: "Logistics Data Analyst",
      description: "Analyze logistics performance and build AI-assisted insights.",
      threshold: 75,
      employerId: employer.id
    },
    create: {
      id: "seed-logistics-data-analyst",
      title: "Logistics Data Analyst",
      description: "Analyze logistics performance and build AI-assisted insights.",
      threshold: 75,
      employerId: employer.id
    }
  });

  const requiredSkills = ["TypeScript", "Data Analysis", "Logistics Operations"];
  const preferredSkills = ["Azure AI", "SQL", "Communication"];

  for (const skillName of requiredSkills) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) continue;

    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
      update: { required: true, weight: 3 },
      create: { jobId: job.id, skillId: skill.id, required: true, weight: 3 }
    });
  }

  for (const skillName of preferredSkills) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) continue;

    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
      update: { required: false, weight: 1 },
      create: { jobId: job.id, skillId: skill.id, required: false, weight: 1 }
    });
  }

  console.log("Seed completed.");
  console.log("Candidate login: candidate@jobmatch.ai / Password123!");
  console.log("Employer login: employer@jobmatch.ai / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
