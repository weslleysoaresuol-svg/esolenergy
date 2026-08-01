import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  ChevronRight,
  Sun,
  ShieldCheck,
  Award,
  Crown,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface NetworkMember {
  id: string;
  name: string;
  level: number; // 1 to 7
  rankSeal: string; // 'L11 Chama'
  gradeCode?: string; // 'A2'
  monthlyKwp: number;
  isActive: boolean; // Selo Ativo ☀️ vs Inativo 🌑
  avatar: string;
}

const MOCK_NETWORK_MEMBERS: NetworkMember[] = [
  {
    id: "mem-101",
    name: "Gabriel Medeiros",
    level: 1,
    rankSeal: "L15 Sol",
    gradeCode: "A2",
    monthlyKwp: 18.5,
    isActive: true,
    avatar: "GM",
  },
  {
    id: "mem-102",
    name: "Juliana Paes",
    level: 1,
    rankSeal: "L12 Fogueira",
    gradeCode: "A1",
    monthlyKwp: 24.2,
    isActive: true,
    avatar: "JP",
  },
  {
    id: "mem-103",
    name: "Rodrigo Santoro",
    level: 2,
    rankSeal: "L8 Brisa",
    monthlyKwp: 8.0,
    isActive: true,
    avatar: "RS",
  },
  {
    id: "mem-104",
    name: "Camila Pitanga",
    level: 2,
    rankSeal: "L5 Orvalho",
    monthlyKwp: 0.0,
    isActive: false, // Inativo 🌑
    avatar: "CP",
  },
  {
    id: "mem-105",
    name: "Thiago Lacerda",
    level: 3,
    rankSeal: "L9 Vento",
    monthlyKwp: 12.0,
    isActive: true,
    avatar: "TL",
  },
  {
    id: "mem-106",
    name: "Fernanda Montenegro",
    level: 4,
    rankSeal: "L3 Raiz",
    monthlyKwp: 5.5,
    isActive: true,
    avatar: "FM",
  },
  {
    id: "mem-107",
    name: "Wagner Moura",
    level: 5,
    rankSeal: "L2 Broto",
    monthlyKwp: 3.2,
    isActive: true,
    avatar: "WM",
  },
];

export function ConsultantNetworkTree() {
  const [selectedLevel, setSelectedLevel] = React.useState<number>(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [userGradeCode] = React.useState<string>("A2"); // A2 -> Max Depth 3 Níveis

  // Regulatory Depth Cap: < A3 -> 3 Níveis Max; A3+ -> 5 Níveis Max
  const maxAllowedDepth = React.useMemo(() => {
    if (["A3", "A4", "A5", "A6", "A7", "A8", "A9"].includes(userGradeCode)) return 5;
    return 3;
  }, [userGradeCode]);

  const filteredMembers = React.useMemo(() => {
    return MOCK_NETWORK_MEMBERS.filter((m) => {
      const isWithinDepth = m.level <= maxAllowedDepth;
      const matchesLevel = selectedLevel === 0 || m.level === selectedLevel;
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      return isWithinDepth && matchesLevel && matchesSearch;
    });
  }, [selectedLevel, searchTerm, maxAllowedDepth]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Users className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">
              VENDAS DIRETAS & LIDERANÇA V12.0
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Minha Equipe de Expansão</h1>
          <p className="text-xs text-slate-400">Visibilidade Privada da Árvore de Consultores</p>
        </div>

        {/* Regulatory Protection Depth Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-2 font-sans">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Visibilidade Permitida:</span>
          </span>
          <Badge variant="outline" className="text-amber-400 border-amber-400/40 text-[11px]">
            Até Nível {maxAllowedDepth} (Grau {userGradeCode})
          </Badge>
        </div>

        {/* Level Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isLocked = lvl > maxAllowedDepth;
            return (
              <button
                key={lvl}
                type="button"
                disabled={isLocked}
                onClick={() => setSelectedLevel(lvl)}
                className={cn(
                  "py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap",
                  selectedLevel === lvl
                    ? "bg-amber-400 text-slate-950 font-extrabold shadow-md glow-amber"
                    : isLocked
                    ? "text-slate-600 bg-slate-950/40 cursor-not-allowed"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                {isLocked ? <Lock className="h-3 w-3" /> : <span>Nível {lvl}</span>}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Buscar por nome do consultor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-2xl bg-slate-900/90 border-slate-800 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl hover:border-slate-700 transition-all overflow-hidden"
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs border font-mono",
                      member.isActive
                        ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                        : "bg-slate-800 border-slate-700 text-slate-500"
                    )}
                  >
                    {member.avatar}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-white">{member.name}</strong>
                      {member.isActive ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] gap-1 px-1.5 py-0">
                          <span>Ativo</span> ☀️
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px] gap-1 px-1.5 py-0">
                          <span>Inativo</span> 🌑
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Selo: {member.rankSeal}</span>
                      {member.gradeCode && (
                        <span className="text-amber-400 font-bold">• Grau {member.gradeCode}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-0.5 font-mono">
                  <span className="text-[10px] text-slate-400 block">Nível {member.level}</span>
                  <strong className="text-xs font-bold text-amber-400 block">
                    {member.monthlyKwp} kWp/mês
                  </strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
