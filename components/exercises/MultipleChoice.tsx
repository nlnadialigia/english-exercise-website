import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExerciseItem, MultipleChoiceContent } from "@/lib/types";
import { useState } from "react";

interface MultipleChoiceProps {
  exercise: ExerciseItem;
  onAnswer: (answer: string) => void;
}

export function MultipleChoice({ exercise, onAnswer }: MultipleChoiceProps) {
  const [selectedValue, setSelectedValue] = useState<string>("");

  if (exercise.type !== "multiple_choice") return null;

  const content = exercise.content as MultipleChoiceContent;

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onAnswer(value);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{exercise.prompt}</p>

      <RadioGroup value={selectedValue} onValueChange={handleValueChange}>
        {content.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id}>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
