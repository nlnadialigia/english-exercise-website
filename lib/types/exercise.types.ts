import { Exercise, User, Submission } from "@prisma/client";

// Exercise Types
export type ExerciseType = "multiple_choice" | "fill_blank" | "import_word";

export interface MultipleChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface MultipleChoiceContent {
  options: MultipleChoiceOption[];
  allowMultiple: boolean;
  explanation: string;
}

export interface FillBlankContent {
  text: string;
  blanks: Record<string, string[]>;
  caseSensitive: boolean;
  explanation?: string;
}

export interface ImportWordContent {
  rawText: string;
  parsedExercises: ExerciseItem[];
}

export interface ExerciseItem {
  id?: string;
  type: ExerciseType;
  prompt: string;
  content: MultipleChoiceContent | FillBlankContent;
}

export interface ExerciseWithRelations extends Exercise {
  teacher: User;
  submissions?: Submission[];
  _count?: {
    submissions: number;
  };
}

export interface ExerciseFormData {
  title: string;
  description?: string;
  exercises: ExerciseItem[];
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  role: string;
  level: string;
  isGeneral: boolean;
}

export interface CreateExerciseInput extends ExerciseFormData {
  teacherId: string;
}
