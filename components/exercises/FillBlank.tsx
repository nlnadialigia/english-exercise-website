import { Input } from "@/components/ui/input";
import { Exercise } from "@/lib/exercise-schema";
import { useState } from "react";

interface FillBlankProps {
  exercise: Exercise;
  onAnswer: (answer: Record<string, string>) => void;
}

export function FillBlank({ exercise, onAnswer }: FillBlankProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (exercise.type !== "fill_blank") return null;

  const parts = exercise.content.text.split(/{{(.*?)}}/g);
  const blankKeys = Object.keys(exercise.content.blanks);

  const handleInputChange = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    // Enviar respostas automaticamente
    onAnswer(newAnswers);
  };

  return (
    <div className="space-y-4">
      {exercise.prompt && exercise.prompt !== exercise.content.text && (
        <p className="text-lg font-medium">{exercise.prompt}</p>
      )}

      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          // Se a parte é uma chave de lacuna, renderizar input
          if (blankKeys.includes(part)) {
            return (
              <Input
                key={index}
                className="inline-block mx-1 w-32 text-center text-lg font-semibold text-blue-600 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus:border-blue-500"
                value={answers[part] || ""}
                onChange={(e) => handleInputChange(part, e.target.value)}
                placeholder="___"
              />
            );
          }
          // Caso contrário, renderizar o texto normal
          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
}
