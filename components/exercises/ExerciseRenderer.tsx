import { Exercise, ExerciseItem } from "@/lib/exercise-schema";
import { FillBlank } from "./FillBlank";
import { MultipleChoice } from "./MultipleChoice";

interface ExerciseRendererProps {
  exercise: ExerciseItem | Exercise;
  onAnswer: (answer: any) => void;
}

export function ExerciseRenderer({ exercise, onAnswer }: ExerciseRendererProps) {
  // Se for import_word, renderizar os exercícios processados
  if (exercise.type === "import_word" && 'content' in exercise && exercise.content.parsedExercises) {
    return (
      <div className="space-y-6">
        {exercise.content.parsedExercises.map((subExercise: any, index: number) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Exercício {index + 1}</h3>
            <ExerciseRenderer
              exercise={subExercise}
              onAnswer={(answer) => onAnswer({ exerciseIndex: index, answer })}
            />
          </div>
        ))}
      </div>
    );
  }

  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoice exercise={exercise as ExerciseItem} onAnswer={onAnswer} />;
    case "fill_blank":
      return <FillBlank exercise={exercise as ExerciseItem} onAnswer={onAnswer} />;
    default:
      return null;
  }
}
