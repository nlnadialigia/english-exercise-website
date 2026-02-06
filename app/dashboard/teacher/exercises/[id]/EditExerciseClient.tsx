"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { ExerciseBookEditor } from "@/components/exercises/ExerciseBookEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { ExerciseItem } from "@/lib/exercise-schema";
import { translations } from "@/lib/translations";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  exercise: any;
  teacherId: string;
}

export default function EditExerciseClient({ exercise }: Props) {
  const [title, setTitle] = useState(exercise.title || "");
  const [description, setDescription] = useState(exercise.description || "");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(exercise.difficulty || "easy");
  const [level, setLevel] = useState(exercise.level || "");
  const [isGeneral, setIsGeneral] = useState(exercise.isGeneral ?? true);
  const [exercises, setExercises] = useState<ExerciseItem[]>(exercise.exercises || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);

    try {
      // Verificar se há submissões antes de permitir edição
      const submissionsResponse = await fetch(`/api/exercises/${exercise.id}/submissions`);
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        if (submissionsData.count > 0) {
          toast({
            title: "Edição não permitida",
            description: "Este caderno já foi respondido por alunos e não pode mais ser editado.",
            className: "bg-red-50 border-red-200 text-red-800"
          });
          setLoading(false);
          return;
        }
      }

      const newErrors: Record<string, string> = {};

      if (!title.trim()) newErrors.title = translations.requiredField;
      if (!level.trim()) newErrors.level = translations.requiredField;
      if (exercises.length === 0) newErrors.exercises = translations.addAtLeastOneExercise;

      // Validar cada exercício
      const hasEmptyExercises = exercises.some(ex => !ex.prompt.trim());
      if (hasEmptyExercises) newErrors.exercises = translations.allExercisesMustHavePrompt;

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          exercises,
          difficulty,
          level,
          isGeneral,
          isPublished: false, // Volta a ser rascunho quando editado
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar exercício");
      }

      toast({
        title: "Sucesso",
        description: "Caderno atualizado e voltou para rascunho. Publique novamente quando necessário.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      router.push("/dashboard/teacher");
      router.refresh();
    } catch (error: any) {
      let errorMessage = "Erro interno do servidor";

      // Verificar se é ZodError (pode vir como string JSON)
      if (error.name === "ZodError" || (typeof error.message === "string" && error.message.includes("ZodError"))) {
        let zodErrors = [];

        try {
          // Se o erro vier como string JSON, fazer parse
          if (typeof error.message === "string" && error.message.startsWith("{")) {
            const parsed = JSON.parse(error.message);
            zodErrors = parsed.errors || [];
          } else {
            zodErrors = error.errors || [];
          }
        } catch {
          zodErrors = [];
        }

        // Verificar se é erro de opções insuficientes
        const optionsError = zodErrors.find((err: any) =>
          err.path?.includes("options") && err.code === "too_small"
        );

        if (optionsError) {
          errorMessage = "Exercícios de múltipla escolha precisam ter pelo menos 2 opções. Verifique se não há exercícios de lacuna marcados como múltipla escolha.";
        } else if (zodErrors.length > 0) {
          errorMessage = zodErrors[0]?.message || "Dados inválidos";
        } else {
          errorMessage = "Dados inválidos";
        }
      } else {
        errorMessage = error.message || "Erro interno do servidor";
      }

      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav role="teacher" />
      <main className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{translations.editExerciseBook}</h1>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? translations.updating : translations.updateExercise}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translations.generalInformation}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{translations.bookTitle} *</Label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                    }}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{translations.level} *</Label>
                  <Input
                    value={level}
                    onChange={(e) => {
                      setLevel(e.target.value);
                      if (errors.level) setErrors(prev => ({ ...prev, level: "" }));
                    }}
                    placeholder="A1, A2, B1..."
                    className={errors.level ? "border-red-500" : ""}
                  />
                  {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{translations.description}</Label>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{translations.difficulty}</Label>
                  <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">{translations.easy}</SelectItem>
                      <SelectItem value="medium">{translations.medium}</SelectItem>
                      <SelectItem value="hard">{translations.hard}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{translations.targetAudience}</Label>
                  <Select value={isGeneral ? "general" : "specific"} onValueChange={(value) => setIsGeneral(value === "general")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{translations.private}</SelectItem>
                      <SelectItem value="specific">{translations.belaLira}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{translations.exercises}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseBookEditor exercises={exercises} setExercises={setExercises} />
              {errors.exercises && <p className="text-sm text-red-500 mt-2">{errors.exercises}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
