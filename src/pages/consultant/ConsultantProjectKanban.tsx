import * as React from "react";
import { motion } from "framer-motion";
import {
  Kanban,
  Zap,
  Clock,
  CheckCircle2,
  Building2,
  FileCheck,
  Search,
  PlusCircle,
  Sun,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface ProjectCardItem {
  id: string;
  clientName: string;
  capacityKwp: number;
  utility: "CPFL Paulista" | "Enel SP" | "CEMIG" | "Light";
  protocolNumber: string;
  stage: "proposta" | "vistoria" | "parecer" | "homologado";
  estimatedCommission: number;
}

const MOCK_PROJECTS: ProjectCardItem[] = [
  {
    id: "proj-101",
    clientName: "Supermercado Nova Era",
    capacityKwp: 42.8,
    utility: "CPFL Paulista",
    protocolNumber: "CPFL-2026-9921",
    stage: "parecer",
    estimatedCommission: 6200.0,
  },
  {
    id: "proj-102",
    clientName: "Padaria Pão D'Oro",
    capacityKwp: 12.5,
    utility: "Enel SP",
    protocolNumber: "ENEL-2026-4412",
    stage: "vistoria",
    estimatedCommission: 2100.0,
  },
  {
    id: "proj-103",
    clientName: "Indústria Metalúrgica Alfa",
    capacityKwp: 110.0,
    utility: "CEMIG",
    protocolNumber: "CEMIG-2026-8801",
    stage: "homologado",
    estimatedCommission: 14500.0,
  },
  {
    id: "proj-104",
    clientName: "Residência Carlos Silva",
    capacityKwp: 6.8,
    utility: "CPFL Paulista",
    protocolNumber: "CPFL-2026-1209",
    stage: "proposta",
    estimatedCommission: 980.0,
  },
];

export function ConsultantProjectKanban() {
  const [activeStage, setActiveStage] = React.useState<"proposta" | "vistoria" | "parecer" | "homologado">("parecer");
  const [searchTerm, setSearchTerm] = React.useState("");
  const projects = MOCK_PROJECTS;

  const filteredProjects = projects.filter((p) => {
    const matchesStage = p.stage === activeStage;
    const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Kanban className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">KANBAN DE PROJETOS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Status na Distribuidora</h1>
          <p className="text-xs text-slate-400">Acompanhamento de Obras & Homologações</p>
        </div>

        {/* 4-Stage Pipeline Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-mono">
          {[
            { id: "proposta", label: "Proposta" },
            { id: "vistoria", label: "Vistoria" },
            { id: "parecer", label: "Parecer" },
            { id: "homologado", label: "Gerando" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStage(tab.id as any)}
              className={cn(
                "py-2 rounded-xl font-bold transition-all text-center truncate cursor-pointer",
                activeStage === tab.id
                  ? "bg-amber-400 text-slate-950 shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar por cliente ou protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-9 text-xs rounded-xl bg-slate-900/80 border-slate-800 focus-visible:ring-amber-400"
          />
        </div>

        {/* Project Cards List */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              Nenhum projeto encontrado nesta etapa.
            </div>
          ) : (
            filteredProjects.map((p) => (
              <Card key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-xl">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400 font-mono">
                      {p.utility}
                    </Badge>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{p.protocolNumber}</span>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-white">{p.clientName}</h3>
                    <span className="text-xs text-slate-400 font-mono block">
                      Potência: {p.capacityKwp} kWp
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">COMISSÃO PREVISTA</span>
                    <strong className="text-xs font-black text-emerald-400 font-mono">
                      {formatCurrency(p.estimatedCommission)}
                    </strong>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* New Simulation Action Button */}
        <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          <span>Simular Novo Projeto Solar</span>
        </Button>
      </div>
    </div>
  );
}
