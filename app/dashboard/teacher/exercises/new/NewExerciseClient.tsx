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
import { createExercise } from "@/lib/actions/exercises";
import { ExerciseBookSchema, ExerciseItem } from "@/lib/exercise-schema";
import { translations } from "@/lib/translations";
import logger from "@/lib/logger";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  teacherId: string;
}

export default function NewExerciseClient({ teacherId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [level, setLevel] = useState("");
  const [isGeneral, setIsGeneral] = useState(true);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = translations.requiredField;
    if (!level.trim()) newErrors.level = translations.requiredField;
    if (exercises.length === 0) newErrors.exercises = translations.addAtLeastOneExercise;

    // Validar cada exercício
    const hasEmptyExercises = exercises.some(ex => !ex.prompt.trim());
    if (hasEmptyExercises) newErrors.exercises = translations.allExercisesMustHavePrompt;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const exerciseBookData = {
        title,
        description,
        exercises,
        difficulty,
        tags: [],
        role: "student",
        level,
        isGeneral,
      };

      ExerciseBookSchema.parse(exerciseBookData);

      setLoading(true);

      const result = await createExercise(exerciseBookData);

      if (!result.success) {
        toast({
          title: translations.errorSaving,
          description: result.error || translations.internalServerError,
          variant: "destructive",
        });
      } else {
        toast({
          title: translations.success,
          description: translations.exerciseBookSavedAsDraft,
          className: "bg-green-50 border-green-200 text-green-800"
        });
        router.push("/dashboard/teacher");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: translations.validationError,
        description: translations.multipleChoiceNeedsTwoOptions,
        className: "bg-red-50 border-red-200 text-red-800"
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
          <h1 className="text-3xl font-bold">{translations.createExerciseBook}</h1>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? translations.saving : translations.saveDraft}
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
                    placeholder="Ex: Present Perfect Exercises"
                  />
                  {errors.title && <p className="text-sm text-red-500">{translations.requiredField}</p>}
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
                  {errors.level && <p className="text-sm text-red-500">{translations.requiredField}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{translations.description}</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe the content of the exercise book..."
                />
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
