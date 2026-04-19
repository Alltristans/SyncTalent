import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  threshold: z.number().min(1).max(100),
  requiredSkills: z.array(z.string().min(1)).min(1),
  preferredSkills: z.array(z.string().min(1)).default([])
});

export async function GET() {
  const jobs = await prisma.job.findMany({
    include: {
      employer: {
        include: {
          employerProfile: true
        }
      },
      jobSkills: {
        include: {
          skill: true
        }
      },
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const payload = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    threshold: job.threshold,
    companyName: job.employer.employerProfile?.companyName ?? job.employer.name,
    requiredSkills: job.jobSkills.filter((item) => item.required).map((item) => item.skill.name),
    preferredSkills: job.jobSkills.filter((item) => !item.required).map((item) => item.skill.name),
    applicationsCount: job._count.applications,
    createdAt: job.createdAt
  }));

  return NextResponse.json({ jobs: payload });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createJobSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const skillNames = [...new Set([...parsed.data.requiredSkills, ...parsed.data.preferredSkills].map((item) => item.trim()).filter(Boolean))];

  const ensuredSkills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  const skillMap = new Map(ensuredSkills.map((skill) => [skill.name, skill.id]));

  const requiredCreates = parsed.data.requiredSkills
    .map((name) => skillMap.get(name.trim()))
    .filter((id): id is string => Boolean(id))
    .map((id) => ({
      required: true,
      weight: 3,
      skill: {
        connect: { id }
      }
    }));

  const preferredCreates = parsed.data.preferredSkills
    .map((name) => skillMap.get(name.trim()))
    .filter((id): id is string => Boolean(id))
    .map((id) => ({
      required: false,
      weight: 1,
      skill: {
        connect: { id }
      }
    }));

  const job = await prisma.job.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      threshold: parsed.data.threshold,
      employerId: session.user.id,
      jobSkills: {
        create: [...requiredCreates, ...preferredCreates]
      }
    },
    include: {
      jobSkills: {
        include: {
          skill: true
        }
      }
    }
  });

  return NextResponse.json({
    job: {
      id: job.id,
      title: job.title,
      description: job.description,
      threshold: job.threshold,
      requiredSkills: job.jobSkills.filter((item) => item.required).map((item) => item.skill.name),
      preferredSkills: job.jobSkills.filter((item) => !item.required).map((item) => item.skill.name)
    }
  });
}
