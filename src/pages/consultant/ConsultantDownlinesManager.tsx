import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Zap,
  UserPlus,
  Filter,
  ArrowUpDown,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface DownlineConsultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  rank: string;
  registeredDate: string;
  monthlyKwp: number;
  subTeamCount: number;
  isActive: boolean;
  avatar: string;
}

const MOCK_DOWNLINES: DownlineConsultant[] = [
  {
    id: "down-1",
    name: "Gabriel Medeiros",
    email: "gabriel.m@esolenergy.com.br",
    phone: "(11) 98877-6655",
    rank: "Consultor Prata",
    registeredDate: "12/03/2026",
    monthlyKwp: 18.5,
    subTeamCount: 12,
    isActive: true,
    avatar: "GM",
  },
  {
    id: "down-2",
    name: "Juliana Paes",
    email: "juliana.p@esolenergy.com.br",
    phone: "(21) 99988-7766",
    rank: "Consultor Ouro",
    registeredDate: "05/01/2026",
    monthlyKwp: 24.2,
    subTeamCount: 22,
    isActive: true,
    avatar: "JP",
  },
  {
    id: "down-3",
    name: "Camila Pitanga",
    email: "camila.p@esolenergy.com.br",
    phone: "(31) 97766-5544",
    rank: "Consultor Bronze",
    registeredDate: "20/06/2026",
    monthlyKwp: 0.0,
    subTeamCount: 2,
    isActive: false,
    avatar: "CP",
  },
];

export function ConsultantDownlinesManager() {
  const [filterStatus, setFilterStatus] = React.useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredDownlines = MOCK_DOWNLINES.filter((item) => {
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? item.isActive
        : !item.isActive;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Users className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">GESTOR DE DOWNLINES</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Indicados Diretos</h1>
          <p className="text-xs text-slate-400">Gestão da Primeira Linha (Nível 1 MMN)</p>
        </div>

        {/* Stats Header Summary */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block">Indicados Diretos</span>
              <strong className="text-lg font-black text-amber-400 font-mono">8 Consultores</strong>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block">Taxa de Ativação</span>
              <strong className="text-lg font-black text-emerald-400 font-mono">75% Ativos</strong>
            </div>
          </CardContent>
        </Card>

        {/* Search & Status Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 text-xs rounded-2xl bg-slate-900/80 border-slate-800 focus-visible:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer",
                  filterStatus === status
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {status === "all" ? "Todos" : status === "active" ? "Ativos MMN" : "Inativos"}
              </button>
            ))}
          </div>
        </div>

        {/* Downlines Cards List */}
        <div className="space-y-3">
          {filteredDownlines.map((consultant) => (
            <motion.div
              key={consultant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Card Top */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                        {consultant.avatar}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs text-white leading-snug">{consultant.name}</h3>
                          {consultant.isActive ? (
                            <Badge variant="emerald" className="text-[8px] px-1 py-0">
                              ATIVO
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[8px] px-1 py-0">
                              INATIVO
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono block">{consultant.rank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Vendas no Mês</span>
                      <strong className="text-white font-bold">{consultant.monthlyKwp} kWp</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Equipe Própria</span>
                      <strong className="text-amber-400 font-bold">{consultant.subTeamCount} Consultores</strong>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Cadastrado em {consultant.registeredDate}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-400 hover:text-emerald-300 gap-1 cursor-pointer">
                      <Phone className="h-3 w-3" /> WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
          <UserPlus className="h-4 w-4" />
          <span>Gerar Link de Convite MMN Direto</span>
        </Button>
      </div>
    </div>
  );
}
