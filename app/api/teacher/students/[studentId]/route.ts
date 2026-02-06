import { getSession } from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import logger from "@/lib/logger";
import { UserService } from "@/lib/services/user-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "student",
        teacherId: session.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        level: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    logger.error("Error fetching student:", "DATABASE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, level, isGeneral } = body;

    // Verificar se o aluno pertence ao professor
    const student = await UserService.getUserById(studentId);
    if (!student || student.teacherId !== session.id) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const updatedStudent = await UserService.updateUser(studentId, {
      fullName,
      level,
      isGeneral
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    logger.error("Error updating student:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o aluno pertence ao professor
    const student = await UserService.getUserById(studentId);
    if (!student || student.teacherId !== session.id) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    await UserService.deleteUser(studentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting student:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
