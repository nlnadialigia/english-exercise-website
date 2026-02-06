import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translations } from "@/lib/translations";
import { CheckCircle2, XCircle } from "lucide-react";

interface DetailedCorrectionProps {
  corrections: any[];
  exercises?: any[];
  size?: 'default' | 'compact';
}

export function DetailedCorrection({ corrections, exercises = [], size = 'default' }: DetailedCorrectionProps) {
  const isCompact = size === 'compact';

  return (
    <div className="space-y-6">
      {corrections.map((correction: any, index: number) => (
        <Card key={index} className={`border-l-4 ${correction.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className={isCompact ? "text-base" : "text-lg"}>{translations.question} {index + 1}</CardTitle>
              {correction.isCorrect ? (
                <CheckCircle2 className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'} text-green-500`} />
              ) : (
                <XCircle className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'} text-red-500`} />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p
              className={`${isCompact ? 'text-sm' : 'text-lg'} font-medium`}
              dangerouslySetInnerHTML={{
                __html: correction.question.replace(/\{\{([^}]+)\}\}/g, (match: any, answer: string) =>
                  `<span class="inline-block px-2 py-1 bg-green-100 border border-green-300 rounded text-green-800 font-semibold">${answer.trim()}</span>`
                )
              }}
            />

            <div className="space-y-2">
              {(() => {
                const originalQuestion = exercises[index];

                // Tratamento especial para exercícios de lacuna
                if (originalQuestion?.type === "fill_blank") {
                  const userAnswers = typeof correction.userAnswer === 'string'
                    ? JSON.parse(correction.userAnswer || '{}')
                    : correction.userAnswer;

                  return (
                    <div className="space-y-2">
                      {Object.entries(userAnswers).map(([key, userValue]: [string, any]) => {
                        const correctAnswers = typeof correction.correctAnswer === 'string'
                          ? JSON.parse(correction.correctAnswer || '{}')
                          : correction.correctAnswer;
                        const correctOptions = correctAnswers[key] || [];
                        const caseSensitive = originalQuestion.content.caseSensitive || false;

                        const isBlankCorrect = correctOptions.some((acceptedAnswer: string) =>
                          caseSensitive
                            ? acceptedAnswer === (userValue?.trim() || '')
                            : acceptedAnswer.toLowerCase() === (userValue?.trim()?.toLowerCase() || '')
                        );

                        return (
                          <div key={key} className={`p-3 rounded border ${isBlankCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${isBlankCorrect ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'}`}>
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              </div>
                              <span className={`font-medium ${isBlankCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                {userValue || "Not answered"}
                              </span>
                              <Badge variant={isBlankCorrect ? "default" : "destructive"} className="ml-auto text-white">
                                {isBlankCorrect ? translations.correct : translations.incorrect}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                if (originalQuestion?.type === "multiple_choice") {
                  return originalQuestion.content.options.map((option: any, optIndex: number) => {
                    const isUserAnswer = option.id === correction.userAnswer;
                    const isCorrect = option.correct;

                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded border ${isCorrect ? 'bg-green-50 border-green-200' :
                          isUserAnswer ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${isCorrect ? 'bg-green-600 border-green-600' :
                            isUserAnswer ? 'bg-red-600 border-red-600' :
                              'border-gray-300'
                            }`}>
                            {(isCorrect || isUserAnswer) && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                          </div>
                          <span className={
                            isCorrect ? 'font-medium text-green-800' :
                              isUserAnswer ? 'font-medium text-red-800' :
                                ''
                          }>
                            {option.text}
                          </span>
                          {isCorrect && <Badge variant="default" className="ml-auto">{translations.correct}</Badge>}
                          {isUserAnswer && !isCorrect && <Badge variant="destructive" className="ml-auto text-white">{translations.yourAnswer}</Badge>}
                        </div>
                      </div>
                    );
                  });
                }

                // Para outros tipos de questão, mostrar apenas a resposta do usuário
                return (
                  <div className={`p-3 rounded border ${correction.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${correction.isCorrect ? 'bg-green-600 border-green-600' : 'bg-red-600 border-red-600'}`}>
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      </div>
                      <span className={correction.isCorrect ? 'font-medium text-green-800' : 'font-medium text-red-800'}>
                        {correction.userAnswer || "Not answered"}
                      </span>
                      <Badge variant={correction.isCorrect ? "default" : "destructive"} className="ml-auto text-white">
                        {correction.isCorrect ? translations.correct : translations.incorrect}
                      </Badge>
                    </div>
                  </div>
                );
              })()}
            </div>

            {correction.explanation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>{translations.explanation}:</strong> {correction.explanation}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
