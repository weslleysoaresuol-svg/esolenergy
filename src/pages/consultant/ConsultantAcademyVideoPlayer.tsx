import * as React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Sun,
  ListVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface LessonChapter {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
}

const MOCK_CHAPTERS: LessonChapter[] = [
  { id: "chap-1", title: "1. Introdução à Lei 14.300 & Fio B", duration: "12:45", isCompleted: true },
  { id: "chap-2", title: "2. Inversores Solares vs Microinversores", duration: "18:20", isCompleted: true },
  { id: "chap-3", title: "3. Dimensionamento por Consumo Médio kWh", duration: "15:10", isCompleted: false },
  { id: "chap-4", title: "4. Simulador de Viabilidade & Payback", duration: "22:00", isCompleted: false },
];

export function ConsultantAcademyVideoPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState<"1.0x" | "1.25x" | "1.5x" | "2.0x">("1.0x");
  const [currentProgress, setCurrentProgress] = React.useState(42); // 42%
  const [activeChapterId, setActiveChapterId] = React.useState("chap-3");
  const [chapters, setChapters] = React.useState<LessonChapter[]>(MOCK_CHAPTERS);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const handleCycleSpeed = () => {
    const speeds: Array<"1.0x" | "1.25x" | "1.5x" | "2.0x"> = ["1.0x", "1.25x", "1.5x", "2.0x"];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleMarkChapterCompleted = (id: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: true } : c))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-4 relative z-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 gap-1.5 p-0 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Catálogo</span>
          </Button>

          <Badge variant="sun" className="text-[10px]">
            EAD VIDEO STREAM
          </Badge>
        </div>

        {/* Video Player Frame Mockup */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="relative aspect-video bg-slate-950 flex flex-col justify-between p-4 group">
            {/* Solar Video Placeholder Graphic */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40">
              <Sun className="h-20 w-20 text-amber-500/20 animate-spin-slow" />
            </div>

            {/* Top Video Overlay Bar */}
            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">HD 1080p</span>
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-lg glow-amber cursor-pointer"
              >
                {playbackSpeed}
              </button>
            </div>

            {/* Center Big Play Button Overlay */}
            <div className="relative z-10 flex items-center justify-center">
              <button
                type="button"
                onClick={togglePlay}
                className="h-14 w-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl glow-amber hover:scale-105 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
            </div>

            {/* Bottom Video Controls Overlay Bar */}
            <div className="relative z-10 space-y-2">
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                <div
                  style={{ width: `${currentProgress}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full glow-amber"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={togglePlay} className="hover:text-amber-400 cursor-pointer">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={toggleMute} className="hover:text-amber-400 cursor-pointer">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <span className="font-mono text-[10px] text-slate-400">06:22 / 15:10</span>
                </div>

                <Maximize2 className="h-3.5 w-3.5 cursor-pointer hover:text-amber-400" />
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-white">Aula 3: Dimensionamento por Consumo Médio kWh</h2>
              <p className="text-xs text-slate-400">Aprenda a aplicar a irradiação solar NASA e tabela CRESESB</p>
            </div>

            <Button
              variant="sun"
              size="sm"
              onClick={() => handleMarkChapterCompleted(activeChapterId)}
              className="w-full h-10 text-xs font-bold text-slate-950 gap-2 rounded-xl shadow-lg glow-amber cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Marcar Aula como Assistida</span>
            </Button>
          </CardContent>
        </Card>

        {/* Lesson Chapters List */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-slate-300 flex items-center gap-2">
            <ListVideo className="h-4 w-4 text-amber-400" />
            <span>Capítulos do Módulo</span>
          </h3>

          <div className="space-y-2">
            {chapters.map((chap) => (
              <div
                key={chap.id}
                onClick={() => setActiveChapterId(chap.id)}
                className={cn(
                  "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs",
                  activeChapterId === chap.id
                    ? "bg-slate-900 border-amber-400/50 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {chap.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Play className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                  <span className="font-semibold text-xs truncate max-w-[200px]">{chap.title}</span>
                </div>

                <span className="font-mono text-[10px] text-slate-400">{chap.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
