"use client";

import { BackButton } from "@/components/back-button";
import { DashboardNav } from "@/components/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/translations";
import { CheckCircle } from "lucide-react";
import { ExerciseItem, MultipleChoiceContent, FillBlankContent, ImportWordContent } from "@/lib/types";

interface ExerciseWithExercises {
  exercises: ExerciseItem[];
  title: string;
  description?: string;
  difficulty: string;
  tags: string[];
}

interface Props {
  exercise: ExerciseWithExercises;
}

export default function ExercisePreviewClient({ exercise }: Props) {
  const renderPreview = () => {
    if (exercise.exercises && Array.isArray(exercise.exercises)) {
      return (
        <div className="space-y-6">
          {exercise.exercises.map((subExercise, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-base">{translations.exercise} {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subExercise.type === "multiple_choice" && <MultipleChoicePreview exercise={subExercise} />}
                  {subExercise.type === "fill_blank" && <FillBlankPreview exercise={subExercise} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return <div>Exercise type not supported</div>;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav role="teacher" />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{exercise.title}</h1>
            <p className="text-muted-foreground">{translations.exercisePreview}</p>
          </div>
          <BackButton href="/dashboard/teacher" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {translations.exerciseInformation}
                <Badge variant={exercise.isPublished ? "default" : "secondary"}>
                  {exercise.isPublished ? translations.published : translations.draft}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>{translations.description}:</strong> <span dangerouslySetInnerHTML={{ __html: exercise.description || translations.noDescription }} /></div>
              <div><strong>{translations.type}:</strong> {exercise.exercises ? `${translations.exerciseBookWith} ${exercise.exercises.length} ${translations.exercises}` : getTypeLabel(exercise.type)}</div>
              <div><strong>{translations.difficulty}:</strong> {getDifficultyLabel(exercise.difficulty)}</div>
              <div><strong>{translations.level}:</strong> {exercise.level}</div>
              <div><strong>{translations.audience}:</strong> {exercise.isGeneral ? translations.private : translations.belaLira}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {translations.previewWithCorrectAnswers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderPreview()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MultipleChoicePreview({ exercise }: { exercise: ExerciseItem; }) {
  const content = exercise.content as MultipleChoiceContent;
  const correctOption = content.options.find(opt => opt.correct);

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{exercise.prompt}</p>
      <div className="space-y-2">
        {content.options.map((option, index) => (
          <div
            key={option.id}
            className={`p-3 rounded border ${option.correct ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${option.correct ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                {option.correct && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
              </div>
              <span className={option.correct ? 'font-medium text-green-800' : ''}>{option.text}</span>
              {option.correct && <Badge variant="default" className="ml-auto">{translations.correct}</Badge>}
            </div>
          </div>
        ))}
      </div>
      {content.explanation && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <strong>{translations.explanation}:</strong> {content.explanation}
        </div>
      )}
    </div>
  );
}

function FillBlankPreview({ exercise }: { exercise: ExerciseItem; }) {
  const content = exercise.content as FillBlankContent;
  const parts = content.text.split(/{{(.*?)}}/g);

  return (
    <div className="space-y-4">
      {exercise.prompt && exercise.prompt !== content.text && (
        <p className="text-lg font-medium">{exercise.prompt}</p>
      )}
      <div className="text-lg leading-relaxed p-4 bg-gray-50 rounded">
        {parts.map((part: string, index: number) => {
          if (content.blanks[part]) {
            const answers = content.blanks[part];
            return (
              <span key={index} className="inline-block mx-1 px-2 py-1 bg-green-100 border border-green-300 rounded text-green-800 font-medium">
                {answers[0]} {answers.length > 1 && `(+${answers.length - 1})`}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
}

function getTypeLabel(type: string) {
  if (!type) return translations.exerciseBook;
  switch (type) {
    case "multiple_choice": return translations.multipleChoiceLabel;
    case "fill_blank": return translations.fillInTheBlanksLabel;
    case "import_word": return translations.importedFromWordLabel;
    default: return type;
  }
}

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case "easy": return translations.easyLabel;
    case "medium": return translations.mediumLabel;
    case "hard": return translations.hardLabel;
    default: return difficulty;
  }
}
