import { z } from "zod";

export const ExerciseTypeEnum = z.enum([
  "multiple_choice",
  "fill_blank",
  "import_word",
]);

export const MultipleChoiceSchema = z.object({
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      correct: z.boolean(),
    })
  ).min(2),
  allowMultiple: z.boolean(),
  explanation: z.string(),
});

export const FillBlankSchema = z.object({
  text: z.string(),
  blanks: z.record(
    z.string(),
    z.array(z.string()).min(1)
  ),
  caseSensitive: z.boolean(),
});

export const ImportWordSchema = z.object({
  rawText: z.string(),
  parsedExercises: z.array(z.object({
    type: ExerciseTypeEnum,
    prompt: z.string(),
    content: z.any(),
  })),
});

export const ExerciseItemSchema = z.object({
  id: z.string().optional(),
  type: ExerciseTypeEnum,
  prompt: z.string().min(5),
  content: z.union([
    MultipleChoiceSchema,
    FillBlankSchema,
  ]),
}).refine((data) => {
  // Validação customizada para compatibilidade tipo/conteúdo
  if (data.type === "multiple_choice") {
    return "options" in data.content && Array.isArray(data.content.options);
  }
  if (data.type === "fill_blank") {
    return "text" in data.content && "blanks" in data.content;
  }
  return true;
}, {
  message: "The exercise type and content do not match.",
  path: ["content"]
});

export const ExerciseBookSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  exercises: z.array(ExerciseItemSchema).min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string()),
  role: z.string(),
  level: z.string(),
  isGeneral: z.boolean(),
});

// Manter compatibilidade
export const ExerciseSchema = ExerciseBookSchema;

export type ExerciseItem = z.infer<typeof ExerciseItemSchema>;
export type ExerciseBook = z.infer<typeof ExerciseBookSchema>;
export type Exercise = ExerciseBook;
export type ExerciseType = z.infer<typeof ExerciseTypeEnum>;
