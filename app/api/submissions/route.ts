import { getSession } from "@/lib/actions/session";
import logger from "@/lib/logger";
import { ExerciseService } from "@/lib/services/exercise-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { NextResponse } from "next/server";

function correctAnswer(question: any, userAnswer: string): { isCorrect: boolean; correctAnswer: string; explanation?: string; } {
  switch (question.type) {
    case "multiple_choice":
      const correctOption = question.content.options.find((opt: any) => opt.correct);
      // Comparar por ID da opção, não pelo texto
      const isCorrect = userAnswer === correctOption?.id;

      logger.info("Checking multiple choice answer", "CORRECTION", {
        userAnswer,
        correctOptionId: correctOption?.id,
        correctOptionText: correctOption?.text,
        isCorrect,
        allOptions: question.content.options
      });

      return {
        isCorrect,
        correctAnswer: correctOption?.text || "",
        explanation: question.content.explanation
      };

    case "fill_blank":
      // Para exercícios de lacuna, userAnswer é um objeto com as respostas de cada lacuna
      const blanks = question.content.blanks;
      const userAnswers = typeof userAnswer === 'string' ? JSON.parse(userAnswer || '{}') : userAnswer;
      const caseSensitive = question.content.caseSensitive || false;
      
      let correctCount = 0;
      let totalBlanks = 0;
      const blankResults: any[] = [];
      
      // Verificar cada lacuna
      for (const [blankKey, possibleAnswers] of Object.entries(blanks)) {
        totalBlanks++;
        const userBlankAnswer = userAnswers[blankKey]?.trim() || '';
        
        const isBlankCorrect = (possibleAnswers as string[]).some(acceptedAnswer => 
          caseSensitive 
            ? acceptedAnswer === userBlankAnswer
            : acceptedAnswer.toLowerCase() === userBlankAnswer.toLowerCase()
        );
        
        if (isBlankCorrect) correctCount++;
        
        blankResults.push({
          blank: blankKey,
          userAnswer: userAnswers[blankKey] || '',
          correctAnswers: possibleAnswers,
          isCorrect: isBlankCorrect
        });
      }
      
      // Questão está correta apenas se todas as lacunas estão corretas
      const allBlanksCorrect = correctCount === totalBlanks;
      
      return {
        isCorrect: allBlanksCorrect,
        correctAnswer: JSON.stringify(blanks),
        explanation: question.content.explanation,
        blankResults,
        score: `${correctCount}/${totalBlanks}`
      };

    case "true_false":
      return {
        isCorrect: userAnswer === question.content.correctAnswer,
        correctAnswer: question.content.correctAnswer || "",
        explanation: question.content.explanation
      };

    default:
      return { isCorrect: false, correctAnswer: "" };
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId, answers } = await request.json();

    // Buscar o exercício
    const exercise = await ExerciseService.getExerciseById(exerciseId);

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verificar próximo número de tentativa
    const existingSubmissions = await SubmissionService.getStudentSubmissionsByExercise(exerciseId, session.id);
    const nextAttempt = existingSubmissions.length + 1;

    // Corrigir exercício
    const corrections = exercise.exercises.map((question: any, index: number) => {
      const questionId = `q_${index}`;
      const userAnswer = answers[questionId] || "";
      const correction = correctAnswer(question, userAnswer);

      return {
        questionIndex: index,
        question: question.prompt,
        userAnswer,
        isCorrect: correction.isCorrect,
        correctAnswer: correction.correctAnswer,
        explanation: correction.explanation,
        blankResults: correction.blankResults,
        score: correction.score
      };
    });

    // Calcular pontuação total considerando lacunas individuais
    let totalScore = 0;
    let totalQuestions = 0;

    corrections.forEach(correction => {
      if (correction.blankResults) {
        // Para exercícios de lacuna, contar cada lacuna como uma questão
        correction.blankResults.forEach((blankResult: any) => {
          if (blankResult.isCorrect) totalScore++;
          totalQuestions++;
        });
      } else {
        // Para outros tipos, contar a questão inteira
        if (correction.isCorrect) totalScore++;
        totalQuestions++;
      }
    });

    // Salvar submissão
    const submissionId = await SubmissionService.createSubmission({
      exerciseId,
      studentId: session.id,
      answers,
      corrections,
      score: totalScore,
      totalQuestions,
      attempt: nextAttempt,
    });

    return NextResponse.json({
      submissionId,
      score: totalScore,
      totalQuestions,
      attempt: nextAttempt,
      corrections
    });
  } catch (error) {
    logger.error("Error creating submission:", "DATABASE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
