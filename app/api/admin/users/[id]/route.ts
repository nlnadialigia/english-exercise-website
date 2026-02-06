import { getSession } from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id: userId } = await params;
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Buscar o usuário a ser deletado
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Não permitir deletar admin
    if (userToDelete.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 400 });
    }

    // Não permitir deletar a si mesmo
    if (userToDelete.id === user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Se for professor, verificar se tem exercícios ou alunos
    if (userToDelete.role === "teacher") {
      const exerciseCount = await prisma.exercise.count({
        where: { teacherId: userId },
      });

      const studentCount = await prisma.user.count({
        where: { teacherId: userId },
      });

      if (exerciseCount > 0 || studentCount > 0) {
        return NextResponse.json({
          error: "Cannot delete teacher with existing exercises or students"
        }, { status: 400 });
      }
    }

    // Se for aluno, verificar se tem submissões
    if (userToDelete.role === "student") {
      const submissionCount = await prisma.submission.count({
        where: { studentId: userId },
      });

      if (submissionCount > 0) {
        return NextResponse.json({
          error: "Cannot delete student with existing submissions"
        }, { status: 400 });
      }

      // Remover relacionamentos professor-aluno
      await prisma.user.deleteMany({
        where: { teacherId: userId },
      });
    }

    // Deletar o usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
