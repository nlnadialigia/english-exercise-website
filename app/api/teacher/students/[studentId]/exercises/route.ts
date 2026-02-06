import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/actions/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = await params;

    // Verificar se o aluno pertence ao professor
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: 'student',
        teacherId: session.id
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Buscar exercícios vinculados ao aluno
    const assignedExercises = await prisma.studentExerciseAccess.findMany({
      where: {
        studentId,
        isActive: true
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            level: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    // Buscar exercícios disponíveis (não vinculados)
    const availableExercises = await prisma.exercise.findMany({
      where: {
        teacherId: session.id,
        isPublished: true,
        NOT: {
          studentAccess: {
            some: {
              studentId,
              isActive: true
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        level: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      assigned: assignedExercises,
      available: availableExercises
    });

  } catch (error) {
    console.error('Error fetching student exercises:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = await params;
    const { exerciseId, dueDate } = await request.json();

    // Verificar se o aluno pertence ao professor
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: 'student',
        teacherId: session.id
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
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

    // Criar vinculação
    const assignment = await prisma.studentExerciseAccess.create({
      data: {
        studentId,
        exerciseId,
        assignedBy: session.id,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            level: true
          }
        }
      }
    });

    return NextResponse.json(assignment);

  } catch (error) {
    console.error('Error assigning exercise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = await params;
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json({ error: 'Exercise ID required' }, { status: 400 });
    }

    // Verificar se a vinculação existe e pertence ao professor
    const assignment = await prisma.studentExerciseAccess.findFirst({
      where: {
        studentId,
        exerciseId,
        assignedBy: session.id,
        isActive: true
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Desativar vinculação (soft delete)
    await prisma.studentExerciseAccess.update({
      where: {
        id: assignment.id
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error removing exercise assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
