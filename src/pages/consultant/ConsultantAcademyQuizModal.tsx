import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "De acordo com a Lei 14.300 (Marco Legal da GD), como funciona a cobrança do Fio B?",
    options: [
      "Isenção 100% vitalícia em todas as concessionárias",
      "Pagamento progressivo do componente tarifário Fio B na energia injetada",
      "Cobrança imediata de taxa fixa de R$ 500 por mês",
    ],
    correctOptionIndex: 1,
  },
  {
    id: 2,
    question: "O que estabelece a regra da Trava VME no plano de carreira MMN da Esol Energy?",
    options: [
      "Permite acumular 100% dos pontos vindo de apenas um consultor direto",
      "Limita em 40% o volume máximo contabilizado advindo de uma única perna",
      "Proíbe o cadastro de novos consultores na rede",
    ],
    correctOptionIndex: 1,
  },
  {
    id: 3,
    question: "Qual a principal vantagem técnica de utilizar Microinversores em telhados com sombreamento parcial?",
    options: [
      "Aumentam o consumo de energia da rede elétrica",
      "Otimizam a produção por módulo de forma independente",
      "Exigem substituição do padrão de entrada da concessionária",
    ],
    correctOptionIndex: 1,
  },
];

export function ConsultantAcademyQuizModal() {
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const currentQ = QUIZ_QUESTIONS[currentQuestionIdx];

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIdx] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    return Math.round((correct / QUIZ_QUESTIONS.length) * 100);
  };

  const score = calculateScore();
  const isPassed = score >= 70;

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <GraduationCap className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">ESOL ACADEMY QUIZ</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Avaliação de Conhecimento</h1>
          <p className="text-xs text-slate-400">Nota mínima para aprovação: 70%</p>
        </div>

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Questão {currentQuestionIdx + 1} de {QUIZ_QUESTIONS.length}</span>
              <strong className="text-amber-400">{Math.round(((currentQuestionIdx + 1) / QUIZ_QUESTIONS.length) * 100)}%</strong>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                initial={{ width: "33%" }}
                animate={{ width: `${((currentQuestionIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full glow-amber"
              />
            </div>
          </div>
        )}

        {/* Main Card Quiz Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key={`q-${currentQuestionIdx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Badge variant="sun" className="text-[10px]">
                      PERGUNTA {currentQ.id}
                    </Badge>
                    <h2 className="font-bold text-sm text-white leading-snug">{currentQ.question}</h2>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-1">
                    {currentQ.options.map((optionText, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={cn(
                            "p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between font-medium",
                            isSelected
                              ? "bg-amber-400/10 border-amber-400 text-amber-300 glow-amber"
                              : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                          )}
                        >
                          <span className="pr-2 leading-relaxed">{optionText}</span>
                          <div
                            className={cn(
                              "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold font-mono",
                              isSelected ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-700 text-slate-500"
                            )}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    disabled={selectedAnswers[currentQuestionIdx] === undefined}
                    onClick={handleNextQuestion}
                    className="w-full h-11 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer pt-2"
                  >
                    <span>{currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? "Próxima Questão" : "Finalizar Simulado"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                /* Quiz Submitted Results Screen */
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-2"
                >
                  <div
                    className={cn(
                      "h-16 w-16 mx-auto rounded-full flex items-center justify-center",
                      isPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}
                  >
                    {isPassed ? <Sparkles className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                  </div>

                  <div className="space-y-1">
                    <Badge variant={isPassed ? "emerald" : "destructive"} className="text-[10px]">
                      {isPassed ? "APROVADO NO SIMULADO" : "REPROVADO — TENTE NOVAMENTE"}
                    </Badge>
                    <h2 className="font-extrabold text-2xl text-white font-mono">{score}% de Aproveitamento</h2>
                    <p className="text-xs text-slate-400">
                      {isPassed ? "Parabéns! Você alcançou a nota de corte." : "Você precisa de no mínimo 70% para liberar o certificado."}
                    </p>
                  </div>

                  {isPassed ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <Award className="h-4 w-4" /> +150 EcoPoints Liberados!
                      </span>
                      <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber cursor-pointer">
                        Solicitar Certificado Digital (Plano 26B2c)
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleResetQuiz}
                      className="w-full h-11 text-xs border-slate-800 rounded-xl gap-2 cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Refazer Simulado</span>
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
