import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface ImportWordEditorProps {
  content: any;
  setContent: (content: any) => void;
}

export function ImportWordEditor({ content, setContent }: ImportWordEditorProps) {
  const [rawText, setRawText] = useState(content.rawText || "");
  const [exerciseType, setExerciseType] = useState<"multiple_choice" | "fill_blank">("multiple_choice");
  const [parsedExercises, setParsedExercises] = useState<any[]>(content.parsedExercises || []);

  useEffect(() => {
    setContent({
      rawText,
      parsedExercises,
    });
  }, [rawText, parsedExercises, setContent]);

  const parseMultipleChoice = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const exercises = [];
    let currentExercise: any = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detectar pergunta numerada (1., 2., 3., etc.) ou linha que termina com ?
      if (trimmed.match(/^\d+\./) || (trimmed.endsWith('?') && !trimmed.match(/^[a-d]\)/i))) {
        if (currentExercise) exercises.push(currentExercise);

        // Remover numeração se existir
        const questionText = trimmed.replace(/^\d+\.\s*/, '');

        currentExercise = {
          type: "multiple_choice",
          prompt: questionText,
          content: {
            options: [],
            allowMultiple: false,
            explanation: ""
          }
        };
      }
      // Detectar opções (a), b), c), d))
      else if (trimmed.match(/^[a-d]\)/i) && currentExercise) {
        const optionText = trimmed.substring(2).trim();
        const isCorrect = optionText.includes('*') || optionText.includes('(correta)');
        const cleanText = optionText.replace(/\*|\(correta\)/gi, '').trim();

        currentExercise.content.options.push({
          id: crypto.randomUUID(),
          text: cleanText,
          correct: isCorrect
        });
      }
    }

    if (currentExercise) exercises.push(currentExercise);
    return exercises;
  };

  const parseFillBlank = (text: string) => {
    const exercises = text.split(/\d+\.|\n\n/).filter(ex => ex.trim());
    return exercises.map(exercise => {
      let cleanText = exercise.trim();

      // Procurar por respostas no formato "Respostas: palavra1-palavra2, palavra3"
      const answerMatch = cleanText.match(/(?:respostas?|answers?|r):\s*(.+)/i);
      let answers: string[] = [];

      if (answerMatch) {
        answers = answerMatch[1].split(',').map(a => a.trim()).filter(a => a);
        // Remover a linha de respostas do texto
        cleanText = cleanText.replace(/(?:respostas?|answers?|r):\s*.+/i, '').trim();
      }

      // Converter ___ para {{palavra}} usando a resposta como nome da lacuna
      let blankIndex = 0;
      const blanks: Record<string, string[]> = {};

      const processedText = cleanText.replace(/_+/g, () => {
        let blankKey;

        if (answers[blankIndex]) {
          // Usar a resposta como nome da lacuna, substituindo espaços por traços
          blankKey = answers[blankIndex]
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || `palavra${blankIndex + 1}`;
        } else {
          blankKey = `word${blankIndex + 1}`;
        }

        // Se há respostas fornecidas, usar a resposta correspondente
        if (answers[blankIndex]) {
          blanks[blankKey] = [answers[blankIndex]];
        } else {
          blanks[blankKey] = [""];
        }

        blankIndex++;
        return `{{${blankKey}}}`;
      });

      return {
        type: "fill_blank",
        prompt: processedText,
        content: {
          text: processedText,
          blanks,
          caseSensitive: false,
        }
      };
    });
  };

  const handleParse = () => {
    if (!rawText.trim()) return;

    let parsed = [];
    switch (exerciseType) {
      case "multiple_choice":
        parsed = parseMultipleChoice(rawText);
        break;
      case "fill_blank":
        parsed = parseFillBlank(rawText);
        break;
    }

    setParsedExercises(parsed);
  };

  const removeExercise = (index: number) => {
    setParsedExercises(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2 items-center pb-2">
          <Label>Exercise Type: </Label>
          <Select value={exerciseType} onValueChange={(value: any) => setExerciseType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="fill_blank">Fill in the Blanks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Raw Text</Label>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={getPlaceholderText(exerciseType)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <Button onClick={handleParse} className="gap-2">
          <Upload className="h-4 w-4" />
          Process Text
        </Button>
      </div>

      {parsedExercises.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Exercise Process</h3>
            <Badge variant="secondary">{parsedExercises.length} exercises(s)</Badge>
          </div>

          {parsedExercises.map((exercise, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Exercise {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(index)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{exercise.prompt}</p>
                  {exercise.type === "multiple_choice" && (
                    <div className="space-y-1">
                      {exercise.content.options.map((option: any, optIndex: number) => (
                        <div key={optIndex} className={`text-sm ${option.correct ? 'text-green-600 font-medium' : ''}`}>
                          {String.fromCharCode(97 + optIndex)}) {option.text} {option.correct && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  {exercise.type === "fill_blank" && (
                    <div className="text-sm text-gray-600">
                      {exercise.content.text}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getPlaceholderText(type: string) {
  switch (type) {
    case "multiple_choice":
      return `Exemplo de formato:
        1. What is the capital of Brazil?
        a) São Paulo
        b) Rio de Janeiro  
        c) Brasília *
        d) Salvador

        2. Which verb is correct?
        a) I am go
        b) I go *
        c) I going
        d) I goes

        * = resposta correta ou use (correta)`;
    case "fill_blank":
      return `Exemplo de formato:
        1. She _____ studying English for _____.
        Respostas: has-been, two-years

        2. I _____ to the store yesterday and _____ some milk.
        R: went, bought

        3. They _____ been living here _____ 2010.
        Answers: have, since

        Use ___ para indicar as lacunas e "Respostas:", "R:" ou "Answers:" para listar as respostas.
        Para palavras compostas, use traço (-) em vez de espaço.`;

    default:
      return "";
  }
}
