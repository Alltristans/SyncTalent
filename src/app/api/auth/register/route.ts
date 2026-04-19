import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["CANDIDATE", "EMPLOYER"]),
    companyName: z.string().trim().optional()
  })
  .superRefine((value, ctx) => {
    if (value.role === "EMPLOYER" && !value.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Company name is required for employer account."
      });
    }
  });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
        candidateProfile:
          parsed.data.role === "CANDIDATE"
            ? {
                create: {
                  summary: "New candidate profile"
                }
              }
            : undefined,
        employerProfile:
          parsed.data.role === "EMPLOYER"
            ? {
                create: {
                  companyName: parsed.data.companyName as string,
                  isVerified: false
                }
              }
            : undefined
      }
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to register account." },
      { status: 500 }
    );
  }
}