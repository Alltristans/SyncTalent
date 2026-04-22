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
  "Problem Solving",
  "Python",
  "Machine Learning",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "REST API",
  "GraphQL",
  "Next.js",
  "Project Management",
  "Warehouse Management",
  "Fleet Management",
  "Route Optimization",
  "SAP",
  "Excel",
  "Power BI",
  "Tableau"
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

  const jobsData = [
    {
      id: "seed-logistics-data-analyst",
      title: "Logistics Data Analyst",
      description: "Analyze logistics performance and build AI-assisted insights using Azure services.",
      threshold: 75,
      required: ["TypeScript", "Data Analysis", "Logistics Operations"],
      preferred: ["Azure AI", "SQL", "Communication"]
    },
    {
      id: "seed-frontend-engineer",
      title: "Frontend Engineer",
      description: "Build modern web interfaces for our logistics management platform.",
      threshold: 60,
      required: ["React", "TypeScript"],
      preferred: ["Next.js", "GraphQL", "Node.js"]
    },
    {
      id: "seed-fullstack-developer",
      title: "Fullstack Developer",
      description: "Develop end-to-end features for our supply chain SaaS product.",
      threshold: 65,
      required: ["Node.js", "React", "SQL"],
      preferred: ["TypeScript", "Docker", "REST API"]
    },
    {
      id: "seed-supply-chain-engineer",
      title: "Supply Chain Engineer",
      description: "Optimize and automate supply chain workflows using data-driven approaches.",
      threshold: 70,
      required: ["Supply Chain", "Logistics Operations", "Data Analysis"],
      preferred: ["SAP", "Excel", "SQL"]
    },
    {
      id: "seed-ml-engineer",
      title: "ML Engineer – Logistics",
      description: "Build predictive models for demand forecasting and route optimization.",
      threshold: 80,
      required: ["Python", "Machine Learning", "Data Analysis"],
      preferred: ["Azure AI", "SQL", "Docker"]
    },
    {
      id: "seed-devops-engineer",
      title: "DevOps Engineer",
      description: "Manage CI/CD pipelines and cloud infrastructure for our platform.",
      threshold: 70,
      required: ["Docker", "Kubernetes"],
      preferred: ["TypeScript", "Node.js", "PostgreSQL"]
    },
    {
      id: "seed-fleet-ops-manager",
      title: "Fleet Operations Manager",
      description: "Oversee fleet performance, route planning, and driver coordination.",
      threshold: 60,
      required: ["Fleet Management", "Logistics Operations", "Communication"],
      preferred: ["Route Optimization", "Excel", "Problem Solving"]
    },
    {
      id: "seed-bi-analyst",
      title: "Business Intelligence Analyst",
      description: "Create dashboards and reports to drive logistics decision-making.",
      threshold: 65,
      required: ["Power BI", "SQL", "Data Analysis"],
      preferred: ["Tableau", "Excel", "Communication"]
    },
    {
      id: "seed-warehouse-coordinator",
      title: "Warehouse Coordinator",
      description: "Coordinate inbound/outbound warehouse operations and inventory management.",
      threshold: 55,
      required: ["Warehouse Management", "Communication"],
      preferred: ["Excel", "Problem Solving", "Supply Chain"]
    },
    {
      id: "seed-backend-engineer",
      title: "Backend Engineer",
      description: "Design and maintain APIs powering our logistics platform.",
      threshold: 65,
      required: ["Node.js", "PostgreSQL", "REST API"],
      preferred: ["TypeScript", "Docker", "GraphQL"]
    }
  ];

  for (const jobData of jobsData) {
    const job = await prisma.job.upsert({
      where: { id: jobData.id },
      update: {
        title: jobData.title,
        description: jobData.description,
        threshold: jobData.threshold,
        employerId: employer.id
      },
      create: {
        id: jobData.id,
        title: jobData.title,
        description: jobData.description,
        threshold: jobData.threshold,
        employerId: employer.id
      }
    });

    for (const skillName of jobData.required) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill) continue;
      await prisma.jobSkill.upsert({
        where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
        update: { required: true, weight: 3 },
        create: { jobId: job.id, skillId: skill.id, required: true, weight: 3 }
      });
    }

    for (const skillName of jobData.preferred) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill) continue;
      await prisma.jobSkill.upsert({
        where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
        update: { required: false, weight: 1 },
        create: { jobId: job.id, skillId: skill.id, required: false, weight: 1 }
      });
    }
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
