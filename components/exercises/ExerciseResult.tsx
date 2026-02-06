import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ExerciseResultProps {
  result: {
    isCorrect?: boolean;
    pending?: boolean;
    explanation: string;
    correctAnswer?: string;
    hits?: string[];
    totalKeywords?: number;
    results?: Record<string, boolean>;
  };
  userAnswer: any;
}

export function ExerciseResult({ result, userAnswer }: ExerciseResultProps) {
  const getIcon = () => {
    if (result.pending) return <Clock className="h-5 w-5 text-yellow-500" />;
    return result.isCorrect ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getTitle = () => {
    if (result.pending) return "Aguardando correção";
    return result.isCorrect ? "Resposta correta!" : "Resposta incorreta";
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeof userAnswer === "string" && (
          <div>
            <p className="font-medium">Sua resposta:</p>
            <p className="text-muted-foreground">{userAnswer}</p>
          </div>
        )}

        {result.correctAnswer && !result.isCorrect && (
          <div>
            <p className="font-medium">Resposta correta:</p>
            <p className="text-green-600">{result.correctAnswer}</p>
          </div>
        )}

        {result.hits && (
          <div>
            <p className="font-medium">Palavras-chave encontradas:</p>
            <div className="flex gap-2 flex-wrap">
              {result.hits.map((hit, index) => (
                <Badge key={index} variant="secondary">{hit}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.hits.length} de {result.totalKeywords} palavras-chave encontradas
            </p>
          </div>
        )}

        <div>
          <p className="font-medium">Explicação:</p>
          <p className="text-muted-foreground">{result.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
