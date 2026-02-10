import { CorrectionResult, ExerciseItem } from "@/lib/types";

export interface SubmissionPDFProps {
  submission: {
    student: {
      fullName: string;
      email: string;
    };
    exercise: {
      title: string;
      exercises: ExerciseItem[];
    };
    score: number;
    totalQuestions: number;
    attempt: number;
    corrections: CorrectionResult[];
    createdAt: string;
  };
}