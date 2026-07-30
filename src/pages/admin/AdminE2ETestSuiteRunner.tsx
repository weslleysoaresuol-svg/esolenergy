import * as React from "react";
import { motion } from "framer-motion";
import {
  Play,
  CheckCircle2,
  Clock,
  Code,
  Layers,
  Sparkles,
  Sun,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Zap,
  BarChart2,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AdminE2ETestSuiteRunner() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const [activeCategory, setActiveCategory] = React.useState("all");

  const handleRunSuite = () => {
    setIsRunning(true);
    setProgress(15);
    setTimeout(() => setProgress(50), 700);
    setTimeout(() => setProgress(85), 1400);
    setTimeout(() => {
      setProgress(100);
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Play className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">E2E TEST RUNNER</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Dashboard Executável de Testes</h1>
          <p className="text-xs text-slate-400">Validação Automatizada de Fluxos Críticos de Ponta a Ponta</p>
        </div>

        {/* Test Suite Metrics Cards */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Total Casos</span>
              <strong className="text-xl font-black text-white font-mono block">14 TCs</strong>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Taxa Aprovação</span>
              <strong className="text-xl font-black text-emerald-400 font-mono block">100%</strong>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Duração</span>
              <strong className="text-xl font-black text-cyan-400 font-mono block">1.8s</strong>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl">
            <CardContent className="p-3 space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Cobertura</span>
              <strong className="text-xl font-black text-amber-400 font-mono block">94.2%</strong>
            </CardContent>
          </Card>
        </div>

        {/* Runner Control Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-amber-400" />
                <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider">
                  Engine Playwright & Cypress
                </h2>
              </div>
              <Badge variant="emerald" className="text-[9px] gap-1">
                <CheckCircle2 className="h-3 w-3" /> SUÍTE PRONTA
              </Badge>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-mono">
              {[
                { id: "all", label: "Todos (14)" },
                { id: "onboarding", label: "Onboarding" },
                { id: "auth", label: "Auth MFA" },
                { id: "epc", label: "Venda EPC" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "py-1.5 rounded-xl font-bold transition-all text-center truncate cursor-pointer",
                    activeCategory === cat.id
                      ? "bg-amber-400 text-slate-950 font-extrabold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Runner Action Button & Progress */}
            <div className="space-y-3">
              {isRunning && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Executando asserções E2E...</span>
                    <span className="text-amber-400 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              <Button
                variant="sun"
                disabled={isRunning}
                onClick={handleRunSuite}
                className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executando Suíte E2E em Tempo Real...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Disparar Suíte Completa de Testes E2E</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
