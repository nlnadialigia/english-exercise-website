import { ExerciseDifficulty, UserRole } from "@/generated";
import prisma from "../db/prisma";
import logger from "../logger";

export interface IExercise {
  teacherId: string;
  title: string;
  description: string;
  exercises: any[];
  difficulty: ExerciseDifficulty;
  tags: string[];
  role: UserRole;
  level: string;
  isGeneral: boolean;
}

export interface ISubmitExercise {
  exerciseId: string;
  studentId: string;
  answers: any;
  corrections: any[];
  score: number;
  totalQuestions: number;
}

export class ExerciseService {
  static async createExercise(exercise: IExercise) {
    logger.database('Creating exercise');

    try {
      const result = await prisma.exercise.create({
        data: {
          teacherId: exercise.teacherId,
          title: exercise.title,
          description: exercise.description,
          exercises: exercise.exercises,
          difficulty: exercise.difficulty,
          tags: exercise.tags,
          role: exercise.role,
          level: exercise.level,
          isGeneral: exercise.isGeneral,
          isPublished: false,
        }
      });

      logger.database(`Exercise created with id ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Database error:', 'DATABASE', error);
      throw error;
    }
  }

  static async getTeacherExercises(teacherId: string) {
    logger.database(`Getting exercises for teacher ${teacherId}`);

    try {
      const result = await prisma.exercise.findMany({
        where: { teacherId }
      });

      logger.database(`Exercises for teacher ${teacherId} found: ${result.length}`);

      return result;
    } catch (error) {
      logger.error('Error fetching teacher exercises:', 'DATABASE', error);
      throw error;
    }
  }

  static async getPublishedExercises() {
    logger.database(`Getting published exercises`);

    const result = await prisma.exercise.findMany({
      where: { isPublished: true }
    });

    logger.database(`Published exercises found`);

    return result;
  }

  static async getAvailableExercisesForStudent(studentLevel: string, studentRole: UserRole, isGeneral: boolean) {
    logger.database(`Getting available exercises for student - level: ${studentLevel}, role: ${studentRole}, isGeneral: ${isGeneral}`);

    const result = await prisma.exercise.findMany({
      where: {
        isPublished: true,
        level: studentLevel,
        role: studentRole,
        isGeneral: isGeneral
      }
    });

    logger.database(`Available exercises for student found: ${result.length}`);

    return result;
  }

  static async getExerciseById(exerciseId: string) {
    logger.database(`Getting exercise ${exerciseId}`);

    const result = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    logger.database(`Exercise ${exerciseId} found`);

    return result ?? null;
  }

  static async getExerciseSubmissions(exerciseId: string) {
    logger.database(`Getting submissions for exercise ${exerciseId}`);

    return await prisma.submission.findMany({
      where: { exerciseId },
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getSubmissionsByStudent(studentId: string) {
    logger.database(`Getting submissions for student ${studentId}`);

    return await prisma.submission.findMany({
      where: { studentId },
      include: { exercise: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async submitExercise(submission: ISubmitExercise) {
    logger.database(`Submitting exercise ${submission.exerciseId} for student ${submission.studentId}`);

    const result = await prisma.submission.create({
      data: submission
    });

    logger.database(`Exercise ${submission.exerciseId} submitted for student ${submission.studentId}`);

    return result.id;
  }

  static async publishExercise(exerciseId: string) {
    logger.database(`Toggling publish status for exercise ${exerciseId}`);

    // Buscar o status atual
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { isPublished: true }
    });

    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // Toggle do status
    return await prisma.exercise.update({
      where: { id: exerciseId },
      data: { isPublished: !exercise.isPublished }
    });
  }

  static async updateExercise(exerciseId: string, data: Partial<IExercise>) {
    logger.database(`Updating exercise ${exerciseId}`);

    return await prisma.exercise.update({
      where: { id: exerciseId },
      data
    });
  }

  static async deleteExercise(exerciseId: string) {
    logger.database(`Deleting exercise ${exerciseId}`);
    
    // Verificar se existem submissões
    const submissionsCount = await prisma.submission.count({
      where: { exerciseId }
    });

    if (submissionsCount > 0) {
      throw new Error(`Não é possível excluir o exercício. Existem ${submissionsCount} submissões associadas.`);
    }

    return await prisma.exercise.delete({
      where: { id: exerciseId }
    });
  }
}