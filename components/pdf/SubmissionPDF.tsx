import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './pdf.styles';
import { SubmissionPDFProps } from './pdf.types';
import { parseQuestion } from './pdf.utils';

export default function SubmissionPDF({ submission }: SubmissionPDFProps) {
  const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
  const passed = percentage >= 70;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Desempenho</Text>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{submission.student.fullName}</Text>
          <Text style={styles.exerciseTitle}>{submission.exercise.title}</Text>
          <Text style={styles.attempt}>Tentativa #{submission.attempt}</Text>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{submission.score}/{submission.totalQuestions}</Text>
            <Text style={styles.scoreLabel}>Acertos</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreValue, passed ? styles.passed : styles.failed]}>
              {percentage}%
            </Text>
            <Text style={styles.scoreLabel}>Nota</Text>
          </View>
        </View>

        <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#eff6ff', borderRadius: 5 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5, color: '#1e40af' }}>
            Como funciona a pontuação:
          </Text>
          <Text style={{ fontSize: 10, color: '#1e40af', marginBottom: 2 }}>
            • Múltipla escolha e Verdadeiro/Falso: Cada questão vale 1 ponto
          </Text>
          <Text style={{ fontSize: 10, color: '#1e40af', marginBottom: 2 }}>
            • Exercícios de lacuna: Cada lacuna vale 1 ponto (pontuação parcial possível)
          </Text>
          <Text style={{ fontSize: 10, color: '#1e40af', fontWeight: 'bold' }}>
            Exemplo: 2 questões de múltipla escolha + 1 questão com 3 lacunas = 5 pontos totais
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Correção Detalhada</Text>

        {submission.corrections.map((correction, index) => {
          const originalQuestion = submission.exercise.exercises[index];

          return (
            <View key={index} style={styles.questionBlock}>
              <Text style={styles.questionTitle}>Questão {index + 1}</Text>
              <Text style={styles.question}>
                {parseQuestion(correction.question).map((part, index) =>
                  part.isAnswer ? (
                    <Text key={index} style={styles.answer}>
                      {part.text}
                    </Text>
                  ) : (
                    <Text key={index}>{part.text}</Text>
                  )
                )}
              </Text>

              {originalQuestion?.type === "fill_blank" && (() => {
                const userAnswers = typeof correction.userAnswer === 'string'
                  ? JSON.parse(correction.userAnswer || '{}')
                  : correction.userAnswer as Record<string, string>;

                const correctAnswers = typeof correction.correctAnswer === 'string'
                  ? JSON.parse(correction.correctAnswer || '{}')
                  : correction.correctAnswer as Record<string, string[]>;

                return Object.entries(userAnswers).map(([key, userValue]) => {
                  const correctOptions = correctAnswers[key] || [];
                  const caseSensitive = (originalQuestion.content as { caseSensitive?: boolean; }).caseSensitive || false;

                  const isBlankCorrect = correctOptions.some((acceptedAnswer: string) =>
                    caseSensitive
                      ? acceptedAnswer === (userValue?.trim() || '')
                      : acceptedAnswer.toLowerCase() === (userValue?.trim()?.toLowerCase() || '')
                  );

                  return (
                    <View key={key} style={{ marginBottom: 5 }}>
                      <Text style={isBlankCorrect ? styles.correctAnswer : styles.wrongAnswer}>
                        {userValue || "Não respondido"} {isBlankCorrect ? '(Correta)' : '(Incorreta)'}
                      </Text>
                    </View>
                  );
                });
              })()}

              {originalQuestion?.type === "multiple_choice" &&
                (originalQuestion.content as { options: Array<{ id: string; text: string; correct: boolean; }>; }).options.map((option, optIndex) => {
                  const isUserAnswer = option.id === correction.userAnswer;
                  const isCorrect = option.correct;

                  return (
                    <View key={optIndex} style={{ marginBottom: 3 }}>
                      <Text style={
                        isCorrect ? styles.correctAnswer :
                          isUserAnswer ? styles.wrongAnswer :
                            styles.neutralAnswer
                      }>
                        {isCorrect ? '✓ ' : isUserAnswer ? '✗ ' : '○ '}
                        {option.text}
                        {isCorrect ? ' (Correta)' : isUserAnswer && !isCorrect ? ' (Sua resposta)' : ''}
                      </Text>
                    </View>
                  );
                })
              }

              {/* Outros tipos de exercício */}
              {originalQuestion?.type !== "fill_blank" && originalQuestion?.type !== "multiple_choice" && (
                <View style={{ marginBottom: 5 }}>
                  <Text style={correction.isCorrect ? styles.correctAnswer : styles.wrongAnswer}>
                    {correction.userAnswer || "Não respondido"} {correction.isCorrect ? '(Correta)' : '(Incorreta)'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        <Text style={styles.footer}>
          Realizado em: {new Date(submission.createdAt).toLocaleString('pt-BR')} |
          Gerado automaticamente pelo English Exercise Platform
        </Text>
      </Page>
    </Document>
  );
}
