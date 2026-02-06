import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MultipleChoiceEditorProps {
  content: any;
  setContent: (content: any) => void;
}

export function MultipleChoiceEditor({ content, setContent }: MultipleChoiceEditorProps) {
  const [options, setOptions] = useState(content.options || [
    { id: crypto.randomUUID(), text: "", correct: false },
    { id: crypto.randomUUID(), text: "", correct: false }
  ]);

  useEffect(() => {
    setContent({
      options,
      allowMultiple: false,
      explanation: "",
    });
  }, [options]);

  const addOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: "", correct: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt: any) => opt.id !== id));
    }
  };

  const updateOption = (id: string, field: string, value: any) => {
    const newOptions = options.map((opt: any) => {
      if (opt.id === id) {
        if (field === "correct" && value) {
          return { ...opt, [field]: value };
        }
        return { ...opt, [field]: value };
      }
      if (field === "correct" && value) {
        return { ...opt, correct: false };
      }
      return opt;
    });
    setOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      {options.map((option: any, index: number) => (
        <div key={option.id} className="flex gap-2 items-center">
          <Input
            value={option.text}
            onChange={(e) => updateOption(option.id, "text", e.target.value)}
            placeholder={`Opção ${index + 1}`}
          />
          <RadioGroup
            value={option.correct ? option.id : ""}
            onValueChange={(value) => updateOption(value, "correct", true)}
          >
            <RadioGroupItem value={option.id} />
          </RadioGroup>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeOption(option.id)}
            disabled={options.length <= 2}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addOption} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Opção
      </Button>
    </div>
  );
}
