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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface NetworkMember {
  id: string;
  name: string;
  level: number;
  rank: string;
  monthlyKwp: number;
  isActive: boolean;
  avatar: string;
}

const MOCK_NETWORK_MEMBERS: NetworkMember[] = [
  {
    id: "mem-101",
    name: "Gabriel Medeiros",
    level: 1,
    rank: "Consultor Prata",
    monthlyKwp: 18.5,
    isActive: true,
    avatar: "GM",
  },
  {
    id: "mem-102",
    name: "Juliana Paes",
    level: 1,
    rank: "Consultor Ouro",
    monthlyKwp: 24.2,
    isActive: true,
    avatar: "JP",
  },
  {
    id: "mem-103",
    name: "Rodrigo Santoro",
    level: 2,
    rank: "Consultor Bronze",
    monthlyKwp: 8.0,
    isActive: true,
    avatar: "RS",
  },
  {
    id: "mem-104",
    name: "Camila Pitanga",
    level: 2,
    rank: "Consultor Bronze",
    monthlyKwp: 0.0,
    isActive: false,
    avatar: "CP",
  },
  {
    id: "mem-105",
    name: "Thiago Lacerda",
    level: 3,
    rank: "Consultor Bronze",
    monthlyKwp: 12.0,
    isActive: true,
    avatar: "TL",
  },
];

export function ConsultantNetworkTree() {
  const [selectedLevel, setSelectedLevel] = React.useState<number>(1);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredMembers = MOCK_NETWORK_MEMBERS.filter((m) => {
    const matchesLevel = selectedLevel === 0 || m.level === selectedLevel;
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
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
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">REDE MMN UNILEVEL</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Árvore da Equipe</h1>
          <p className="text-xs text-slate-400">Visualização da Rede em 7 Níveis de Profundidade</p>
        </div>

        {/* Network Stats Card Summary */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block">Total na Rede</span>
              <strong className="text-lg font-black text-amber-400 font-mono">48 Consultores</strong>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block">Volume Total kWp</span>
              <strong className="text-lg font-black text-emerald-400 font-mono">184.5 kWp</strong>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar consultor por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 text-xs rounded-2xl bg-slate-900/80 border-slate-800 focus-visible:ring-amber-400"
          />
        </div>

        {/* 7 Levels Selector Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedLevel(0)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
              selectedLevel === 0
                ? "bg-amber-400 text-slate-950 border-amber-400 glow-amber"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            Todos os Níveis
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                selectedLevel === lvl
                  ? "bg-amber-400 text-slate-950 border-amber-400 glow-amber"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
              )}
            >
              Nível {lvl}
            </button>
          ))}
        </div>

        {/* Member Cards List */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                        {member.avatar}
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950",
                          member.isActive ? "bg-emerald-500" : "bg-rose-500"
                        )}
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-white leading-snug">{member.name}</h3>
                        <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400 font-mono">
                          Nível {member.level}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono block">{member.rank}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <strong className="text-xs font-mono font-bold text-white block">
                      {member.monthlyKwp} kWp
                    </strong>
                    <span className="text-[9px] font-mono text-slate-500 block">Produção Mês</span>
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
