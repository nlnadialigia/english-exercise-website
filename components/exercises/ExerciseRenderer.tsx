import { ExerciseItem, ImportWordContent } from "@/lib/types";
import { FillBlank } from "./FillBlank";
import { MultipleChoice } from "./MultipleChoice";

interface ExerciseRendererProps {
  exercise: ExerciseItem;
  onAnswer: (answer: string | Record<string, string>) => void;
}

export function ExerciseRenderer({ exercise, onAnswer }: ExerciseRendererProps) {
  if (exercise.type === "import_word") {
    const content = exercise.content as ImportWordContent;
    return (
      <div className="space-y-6">
        {content.parsedExercises.map((subExercise, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Exercício {index + 1}</h3>
            <ExerciseRenderer
              exercise={subExercise}
              onAnswer={(answer) => onAnswer({ exerciseIndex: index, answer } as Record<string, string>)}
            />
          </div>
        ))}
      </div>
    );
  }

  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoice exercise={exercise} onAnswer={onAnswer} />;
    case "fill_blank":
      return <FillBlank exercise={exercise} onAnswer={onAnswer} />;
    default:
      return null;
  }
}
