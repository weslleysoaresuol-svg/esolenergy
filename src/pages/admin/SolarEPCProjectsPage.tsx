import * as React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Building,
  Plus,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface EPCProject {
  id: string;
  codigo: string;
  cliente: string;
  potenciaKwp: number;
  concessionaria: string;
  etapa: "viabilidade" | "projeto_eletrico" | "parecer_aneel" | "instalacao" | "vistoria";
  progresso: number;
  valor: number;
  previsaoTermino: string;
}

const MOCK_PROJECTS: EPCProject[] = [
  {
    id: "proj-1",
    codigo: "EPC-1042",
    cliente: "Industria Solar S/A",
    potenciaKwp: 450.5,
    concessionaria: "Enel SP",
    etapa: "parecer_aneel",
    progresso: 65,
    valor: 1850000,
    previsaoTermino: "15/08/2026",
  },
  {
    id: "proj-2",
    codigo: "EPC-1043",
    cliente: "Fazenda Sol Radiante",
    potenciaKwp: 1200.0,
    concessionaria: "Cemig MG",
    etapa: "instalacao",
    progresso: 85,
    valor: 4900000,
    previsaoTermino: "28/08/2026",
  },
  {
    id: "proj-3",
    codigo: "EPC-1044",
    cliente: "Supermercado EcoVida",
    potenciaKwp: 180.0,
    concessionaria: "CPFL Paulista",
    etapa: "projeto_eletrico",
    progresso: 35,
    valor: 720000,
    previsaoTermino: "10/09/2026",
  },
  {
    id: "proj-4",
    codigo: "EPC-1045",
    cliente: "Condomínio Horizon",
    potenciaKwp: 95.4,
    concessionaria: "Light RJ",
    etapa: "viabilidade",
    progresso: 15,
    valor: 390000,
    previsaoTermino: "25/09/2026",
  },
  {
    id: "proj-5",
    codigo: "EPC-1046",
    cliente: "Centro Logístico Mega",
    potenciaKwp: 850.0,
    concessionaria: "Enel SP",
    etapa: "vistoria",
    progresso: 95,
    valor: 3400000,
    previsaoTermino: "02/08/2026",
  },
];

const KANBAN_STAGES = [
  { id: "viabilidade", title: "1. Estudo kWp & Viabilidade", color: "border-cyan-500/40 text-cyan-400" },
  { id: "projeto_eletrico", title: "2. Projeto Elétrico Unifilar", color: "border-amber-400/40 text-amber-400" },
  { id: "parecer_aneel", title: "3. Parecer ANEEL / Concessionária", color: "border-purple-500/40 text-purple-400" },
  { id: "instalacao", title: "4. Montagem & Comissionamento", color: "border-blue-500/40 text-blue-400" },
  { id: "vistoria", title: "5. Vistoria & Medidor GD", color: "border-emerald-500/40 text-emerald-400" },
] as const;

export function SolarEPCProjectsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Engenharia & Projetos Solar EPC</span>
              <Badge variant="sun" className="text-[10px]">
                QUADRO KANBAN 5 ETAPAS
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Gestão end-to-end de usinas solares, homologação ANEEL e vistoria GD.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar projeto, cliente ou kWp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
              />
            </div>

            <Button variant="sun" size="sm" className="gap-2 rounded-xl text-xs text-slate-950 font-bold">
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Projeto EPC</span>
            </Button>
          </div>
        </div>

        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const stageProjects = MOCK_PROJECTS.filter(
              (p) =>
                p.etapa === stage.id &&
                (p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-3 min-w-[260px] backdrop-blur-md dark:bg-slate-950/40 dark:border-slate-800/80"
              >
                {/* Column Header */}
                <div className={cn("p-2.5 rounded-xl border mb-3 bg-background/60 flex items-center justify-between", stage.color)}>
                  <span className="font-bold text-xs truncate">{stage.title}</span>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0 ml-1">
                    {stageProjects.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] scrollbar-none">
                  {stageProjects.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-muted-foreground border border-dashed border-border/40 rounded-xl">
                      Nenhum projeto nesta etapa
                    </div>
                  ) : (
                    stageProjects.map((proj) => (
                      <motion.div
                        key={proj.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 space-y-2.5 cursor-pointer dark:bg-slate-900/90"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-amber-500">{proj.codigo}</span>
                          <Badge variant="outline" className="text-[9px] bg-accent/50">
                            {proj.concessionaria}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-foreground truncate">{proj.cliente}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-400" />
                            <span>{proj.potenciaKwp} kWp de Potência</span>
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Progresso</span>
                            <span className="font-mono font-bold text-foreground">{proj.progresso}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 glow-amber transition-all duration-300"
                              style={{ width: `${proj.progresso}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                          <span className="font-mono font-bold text-foreground">{formatCurrency(proj.valor)}</span>
                          <span className="text-[10px] text-muted-foreground">{proj.previsaoTermino}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
