import { useState } from "react";

import {
  generateQuestions,
  aiEvaluate,
  generateFollowupQuestion,
  generateInterviewReport,
  saveInterview,
} from "../services/api";

const MAX_QUESTIONS = 5;

export default function useInterview() {

  const [role, setRole] =
    useState("Software Engineer");

  const [level, setLevel] =
    useState("Intermediate");

  const [questions, setQuestions] =
    useState<string[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState<string[]>([]);

  const [evaluations, setEvaluations] =
    useState<any[]>([]);

  const [currentEvaluation, setCurrentEvaluation] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [report, setReport] =
    useState<any>(null);

  async function startInterview() {

    setLoading(true);

    try {

      const response =
        await generateQuestions(
          role,
          level
        );

      setQuestions(
        response.questions
      );

      setStarted(true);

    } finally {

      setLoading(false);

    }

  }

  async function processSpeech(
    speechResult: any
  ) {

    if (!speechResult) return;

    const answer =
      speechResult.transcript;

    const updatedAnswers = [
      ...answers,
      answer,
    ];

    setAnswers(
      updatedAnswers
    );

    const evaluation =
      await aiEvaluate(

        questions[currentQuestion],

        answer,

        speechResult.speech_metrics

      );

    const updatedEvaluations = [
      ...evaluations,
      evaluation,
    ];

    setEvaluations(
      updatedEvaluations
    );

    setCurrentEvaluation(
      evaluation
    );

    if (updatedAnswers.length < MAX_QUESTIONS) {

      const followup =
        await generateFollowupQuestion(

          questions[currentQuestion],

          answer,

          role,

          level

        );

      if (followup?.question) {

        const updatedQuestions = [

          ...questions,

          followup.question,

        ];

        setQuestions(
          updatedQuestions
        );

      }

      setCurrentQuestion(
        updatedAnswers.length
      );

      return;

    }

    const finalReport =
      await generateInterviewReport({

        role,

        level,

        questions,

        answers: updatedAnswers,

        evaluations: updatedEvaluations,

      });

    await saveInterview({

      role,

      level,

      questions,

      answers: updatedAnswers,

      evaluations: updatedEvaluations,

      final_report: finalReport,

      overall_score:
        finalReport.overall_score,

      technical_score:
        finalReport.technical,

      communication_score:
        finalReport.communication,

      confidence_score:
        finalReport.confidence,

      hiring_probability:
        finalReport.overall_score,

    } as any);

    setReport(
      finalReport
    );

    setFinished(true);

  }

  return {

    role,
    setRole,

    level,
    setLevel,

    started,

    finished,

    loading,

    questions,

    currentQuestion,

    currentEvaluation,

    report,

    startInterview,

    processSpeech,

  };

}