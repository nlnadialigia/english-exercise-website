import { getSession } from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await request.json();

    // Verificar se o aluno pertence ao professor
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "student",
        teacherId: session.id
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Gerar token único
    const token = randomBytes(32).toString("hex");

    // Criar ou atualizar token (sem expiração)
    await prisma.studentToken.upsert({
      where: { studentId },
      update: { token },
      create: { studentId, token }
    });

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/student/access/${token}`;

    return NextResponse.json({ magicLink });
  } catch (error) {
    console.error("Error generating magic link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
