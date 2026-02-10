import { Submission, Exercise, User } from "@prisma/client";

export type SubmissionAnswer = string | string[] | Record<string, string>;

export interface BlankResult {
  blank: string;
  userAnswer: string;
  correctAnswers: string[];
  isCorrect: boolean;
}

export interface CorrectionResult {
  question: string;
  questionIndex: number;
  userAnswer: SubmissionAnswer;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  blankResults?: BlankResult[];
}

export interface SubmissionWithRelations extends Submission {
  exercise: Exercise & {
    teacher: User;
  };
  student: User;
}

export interface SubmissionDetails {
  id: string;
  exerciseId: string;
  studentId: string;
  answers: Record<string, SubmissionAnswer>;
  corrections: CorrectionResult[];
  score: number;
  totalQuestions: number;
  attempt: number;
  createdAt: Date;
  exercise: {
    title: string;
    exercises: unknown;
  };
  student: {
    fullName: string;
    email: string;
  };
}

export interface CreateSubmissionInput {
  exerciseId: string;
  studentId: string;
  answers: Record<string, SubmissionAnswer>;
}
