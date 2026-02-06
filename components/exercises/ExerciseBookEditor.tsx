"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ExerciseItem, ExerciseType } from "@/lib/exercise-schema";
import { Loader2Icon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FillBlankEditor } from "./editors/FillBlankEditor";
import { ImportWordEditor } from "./editors/ImportWordEditor";
import { MultipleChoiceEditor } from "./editors/MultipleChoiceEditor";

interface ExerciseBookEditorProps {
  exercises: ExerciseItem[];
  setExercises: (exercises: ExerciseItem[]) => void;
}

export function ExerciseBookEditor({ exercises, setExercises }: ExerciseBookEditorProps) {
  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [showImportMode, setShowImportMode] = useState(exercises.length === 0);
  const [isAddingMore, setIsAddingMore] = useState(false);
  const { toast } = useToast();

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);

    // Ajustar seleção após remoção
    if (newExercises.length === 0) {
      setSelectedExercise(0);
      setShowImportMode(true);
    } else {
      setSelectedExercise(Math.min(selectedExercise, newExercises.length - 1));
    }
  };

  const removeAllExercises = () => {
    setExercises([]);
    setSelectedExercise(0);
    setShowImportMode(true);
    setIsAddingMore(false);
    toast({
      title: "Exercícios excluídos",
      description: "Todos os exercícios foram removidos com sucesso.",
      className: "bg-orange-50 border-orange-200 text-orange-800"
    });
  };

  const updateExercise = (index: number, field: keyof ExerciseItem, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleImportWord = (parsedExercises: any[]) => {
    const newExercises = parsedExercises.map(ex => ({
      id: crypto.randomUUID(),
      type: ex.type,
      prompt: ex.prompt,
      content: ex.content,
    }));

    if (isAddingMore) {
      // Adicionar aos exercícios existentes
      setExercises([...exercises, ...newExercises]);
      setSelectedExercise(exercises.length); // Selecionar o primeiro novo exercício
      setIsAddingMore(false);
    } else {
      // Substituir todos os exercícios
      setExercises(newExercises);
      setSelectedExercise(0);
    }

    setShowImportMode(false);
  };

  const handleEditMode = () => {
    setShowImportMode(true);
    setIsAddingMore(false);
  };

  const handleAddMore = () => {
    setShowImportMode(true);
    setIsAddingMore(true);
  };

  const renderEditor = (exercise: ExerciseItem, index: number, key: string) => {
    switch (exercise.type) {
      case "multiple_choice":
        return <MultipleChoiceEditor
          key={key}
          content={exercise.content}
          setContent={(content) => updateExercise(index, 'content', content)}
        />;
      case "fill_blank":
        return <FillBlankEditor
          key={key}
          content={exercise.content}
          setContent={(content) => updateExercise(index, 'content', content)}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Book Exercises ({exercises.length})</h3>
        {!showImportMode && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAddMore}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add more
            </Button>
            <Button
              variant="outline"
              onClick={handleEditMode}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Loader2Icon className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button
              variant="outline"
              onClick={removeAllExercises}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove all
            </Button>
          </div>
        )}
      </div>

      {showImportMode ? (
        <Card>
          {/* <CardHeader>
            <CardTitle>
              {isAddingMore ? "Adicionar Mais Exercícios" : ""}
            </CardTitle>
          </CardHeader> */}
          <CardContent>
            <ImportWordEditor
              content={{}}
              setContent={(content) => {
                if (content.parsedExercises?.length) {
                  handleImportWord(content.parsedExercises);
                }
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de exercícios */}
          <div className="space-y-2 max-h-120 overflow-y-auto">
            {exercises.map((exercise, index) => (
              <Card
                key={exercise.id}
                className={`cursor-pointer transition-colors ${selectedExercise === index ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => setSelectedExercise(index)}
              >
                <CardContent className="p-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs mb-1">
                        {getTypeLabel(exercise.type)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExercise(index);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {exercise.prompt || `Exercício ${index + 1}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Editor do exercício selecionado */}
          <div className="lg:col-span-3">
            {exercises[selectedExercise] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Exercício {selectedExercise + 1}
                    <Badge>{getTypeLabel(exercises[selectedExercise].type)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enunciado *</Label>
                    <Textarea
                      value={exercises[selectedExercise].prompt}
                      onChange={(e) => updateExercise(selectedExercise, 'prompt', e.target.value)}
                      placeholder="Digite o enunciado do exercício..."
                      rows={3}
                    />
                  </div>

                  {renderEditor(exercises[selectedExercise], selectedExercise, exercises[selectedExercise].id as string)}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultContent(type: ExerciseType) {
  switch (type) {
    case "multiple_choice":
      return {
        options: [
          { id: crypto.randomUUID(), text: "", correct: false },
          { id: crypto.randomUUID(), text: "", correct: false }
        ],
        allowMultiple: false,
        explanation: "",
      };
    case "fill_blank":
      return {
        text: "",
        blanks: {},
        caseSensitive: false,
      };
    default:
      return {};
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "multiple_choice": return "Múltipla Escolha";
    case "fill_blank": return "Completar Lacunas";
    default: return type;
  }
}
