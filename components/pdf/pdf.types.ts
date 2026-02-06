export interface SubmissionPDFProps {
  submission: {
    student: {
      fullName: string;
      email: string;
    };
    exercise: {
      title: string;
      exercises: Array<{
        prompt: string;
        type: string;
        content: any;
      }>;
    };
    score: number;
    totalQuestions: number;
    attempt: number;
    corrections: Array<{
      question: string;
      userAnswer: string;
      correctAnswer?: string;
      isCorrect: boolean;
      explanation?: string;
    }>;
    createdAt: string;
  };
}