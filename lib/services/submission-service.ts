import prisma from "../db/prisma";
import logger from "../logger";

export interface ISubmission {
  exerciseId: string;
  studentId: string;
  answers: any;
  corrections: any[];
  score: number;
  totalQuestions: number;
  attempt?: number;
}

export class SubmissionService {
  static async createSubmission(data: ISubmission) {
    logger.info("Creating submission");

    const result = await prisma.submission.create({
      data
    });

    logger.info("Submission created", result.id);

    return result.id;
  }

  static async getSubmissionById(id: string) {
    logger.info("Getting submission by ID");

    return await prisma.submission.findUnique({
      where: { id }
    });
  }

  static async getStudentSubmissions(userId: string) {
    logger.info("Getting student submissions");

    const submissions = await prisma.submission.findMany({
      where: { studentId: userId }
    });

    return submissions;
  }

  static async getStudentSubmissionsByExercise(exerciseId: string, studentId: string) {
    logger.info("Getting student submissions by exercise");

    return await prisma.submission.findMany({
      where: {
        exerciseId,
        studentId
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getSubmissionByExercise(exerciseId: string, userId: string) {
    logger.info("Getting submission by exercise");

    const result = await prisma.submission.findFirst({
      where: {
        exerciseId,
        studentId: userId
      },
      orderBy: { createdAt: 'desc' }
    });

    return result ?? null;
  }

  static async getExerciseSubmissions(exerciseId: string) {
    logger.info("Getting exercise submissions");

    const submissions = await prisma.submission.findMany({
      where: { exerciseId },
      orderBy: { createdAt: 'desc' }
    });

    return submissions;
  }

  static async getTotalSubmissions(teacherId: string) {
    logger.info("Getting total submissions for teacher");

    const count = await prisma.submission.count({
      where: { 
        exercise: {
          teacherId: teacherId
        }
      }
    });

    return count;
  }

  static async countSubmissionsByExercise(exerciseId: string) {
    logger.info("Counting submissions by exercise");

    const count = await prisma.submission.count({
      where: { exerciseId }
    });

    return count;
  }
}