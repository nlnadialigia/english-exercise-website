import { getSession } from "@/lib/actions/session";
import { UserService } from "@/lib/services/user-service";
import { ExerciseService } from "@/lib/services/exercise-service";
import { SubmissionService } from "@/lib/services/submission-service";
import prisma from "@/lib/db/prisma";
import logger from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar alunos vinculados ao professor
    const students = await UserService.getStudentsByTeacher(session.id);

    // Para cada aluno, contar exercícios em aberto e realizados
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        // Exercícios atribuídos ao aluno
        const assignedExercises = await prisma.studentExerciseAccess.findMany({
          where: {
            studentId: student.id,
            isActive: true
          },
          include: {
            exercise: true
          }
        });

        // Exercícios já realizados pelo aluno
        const completedSubmissions = await SubmissionService.getStudentSubmissions(student.id);
        const completedExerciseIds = [...new Set(completedSubmissions.map(s => s.exerciseId))];

        const openExercises = assignedExercises.filter(assignment => 
          !completedExerciseIds.includes(assignment.exercise.id)
        );

        return {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          level: student.level,
          isGeneral: student.isGeneral,
          openExercises: openExercises.length,
          completedExercises: completedExerciseIds.length,
        };
      })
    );

    return NextResponse.json(studentsWithStats);
  } catch (error) {
    logger.error("Error fetching teacher students:", "DATABASE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, email, level, isGeneral } = body;

    if (!fullName || !email || !level) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
    }

    const studentData = {
      fullName,
      email,
      level,
      isGeneral: isGeneral ?? true,
      role: "student" as const,
      teacherId: session.id,
      password: "" // Sem senha para alunos
    };

    const student = await UserService.createUser(studentData);

    return NextResponse.json({ success: true, student });
  } catch (error) {
    logger.error("Error creating student:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
