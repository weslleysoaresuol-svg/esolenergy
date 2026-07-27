import * as React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  Award,
  Clock,
  ChevronRight,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface AcademyCourse {
  id: string;
  title: string;
  category: "Engenharia" | "Vendas" | "MMN";
  duration: string;
  ecoPointsReward: number;
  progressPercentage: number;
  status: "concluido" | "em_andamento" | "bloqueado";
  modulesCount: number;
}

const MOCK_COURSES: AcademyCourse[] = [
  {
    id: "course-101",
    title: "Fundamentos de Engenharia Solar & Regulatório ANEEL Lei 14.300",
    category: "Engenharia",
    duration: "2h 30min",
    ecoPointsReward: 150,
    progressPercentage: 100,
    status: "concluido",
    modulesCount: 4,
  },
  {
    id: "course-102",
    title: "Técnicas Avançadas de Vendas EPC & Quebra de Objeções B2B",
    category: "Vendas",
    duration: "3h 15min",
    ecoPointsReward: 250,
    progressPercentage: 65,
    status: "em_andamento",
    modulesCount: 6,
  },
  {
    id: "course-103",
    title: "Formação de Líderes MMN & Estruturação de Linhas em 7 Níveis",
    category: "MMN",
    duration: "4h 00min",
    ecoPointsReward: 400,
    progressPercentage: 0,
    status: "bloqueado",
    modulesCount: 8,
  },
];

export function ConsultantAcademyCourses() {
  const [activeTab, setActiveTab] = React.useState<"all" | "Engenharia" | "Vendas" | "MMN">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesCategory = activeTab === "all" || course.category === activeTab;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-mono font-bold">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>ESOL ACADEMY MOBILE</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">Catálogo de Cursos</h1>
          </div>

          <Badge variant="emerald" className="gap-1 text-[10px]">
            <Sparkles className="h-3 w-3" />
            +400 ECOPOINTS DISPONÍVEIS
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por módulo ou tema de aula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 text-xs rounded-2xl bg-slate-900/80 border-slate-800 focus-visible:ring-amber-400"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: "all", label: "Todas as Trilhas" },
            { id: "Engenharia", label: "Engenharia Solar" },
            { id: "Vendas", label: "Vendas EPC" },
            { id: "MMN", label: "Liderança MMN" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                activeTab === tab.id
                  ? "bg-amber-400 text-slate-950 border-amber-400 glow-amber"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Cards List */}
        <div className="space-y-3.5">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden hover:border-slate-700 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400">
                          {course.category}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {course.duration}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-white leading-snug">{course.title}</h3>
                    </div>

                    <div className="shrink-0">
                      {course.status === "concluido" ? (
                        <Badge variant="emerald" className="text-[10px]">🟢 CONCLUÍDO</Badge>
                      ) : course.status === "em_andamento" ? (
                        <Badge variant="sun" className="text-[10px]">🟡 EM ANDAMENTO</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">🔒 BLOQUEADO</Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{course.modulesCount} Módulos</span>
                      <span className="text-amber-400 font-bold">{course.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${course.progressPercentage}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          course.progressPercentage === 100
                            ? "bg-emerald-500"
                            : "bg-amber-400 glow-amber"
                        )}
                      />
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      +{course.ecoPointsReward} EcoPoints
                    </span>

                    <Button
                      variant={course.status === "bloqueado" ? "outline" : "sun"}
                      size="sm"
                      disabled={course.status === "bloqueado"}
                      className="h-8 text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
                    >
                      {course.status === "concluido" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-950" />
                          <span>Rever Aulas</span>
                        </>
                      ) : course.status === "em_andamento" ? (
                        <>
                          <PlayCircle className="h-3.5 w-3.5 text-slate-950" />
                          <span>Continuar Módulo</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Nível Requerido</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
