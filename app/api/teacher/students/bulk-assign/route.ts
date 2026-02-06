import { getSession } from '@/lib/actions/session';
import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, exerciseId, studentIds, dueDate } = await request.json();

    if (type === 'assign-to-multiple') {
      // Vincular um exercício a múltiplos alunos
      if (!exerciseId || !studentIds || !Array.isArray(studentIds)) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
      }

      // Verificar se o exercício pertence ao professor
      const exercise = await prisma.exercise.findFirst({
        where: {
          id: exerciseId,
          teacherId: session.id,
          isPublished: true
        }
      });

      if (!exercise) {
        return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
      }

      // Verificar se todos os alunos pertencem ao professor
      const students = await prisma.user.findMany({
        where: {
          id: { in: studentIds },
          role: 'student',
          teacherId: session.id
        }
      });

      if (students.length !== studentIds.length) {
        return NextResponse.json({ error: 'Some students not found' }, { status: 404 });
      }

      // Criar vinculações em lote
      const assignments = await Promise.all(
        studentIds.map(async (studentId: string) => {
          try {
            return await prisma.studentExerciseAccess.create({
              data: {
                studentId,
                exerciseId,
                assignedBy: session.id,
                dueDate: dueDate ? new Date(dueDate) : null
              }
            });
          } catch (error) {
            // Ignorar se já existe (unique constraint)
            return null;
          }
        })
      );

      const successCount = assignments.filter(a => a !== null).length;

      return NextResponse.json({
        success: true,
        assigned: successCount,
        total: studentIds.length
      });
    }

    return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });

  } catch (error) {
    console.error('Error in bulk assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
