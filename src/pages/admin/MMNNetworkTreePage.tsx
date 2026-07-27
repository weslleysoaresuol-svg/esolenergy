import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Users,
  Award,
  ChevronRight,
  ChevronDown,
  Search,
  Zap,
  DollarSign,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface MMNMemberNode {
  id: string;
  nome: string;
  nivel: number; // 1 a 7
  graduacao: "Consultor Bronze" | "Supervisor Prata" | "Gerente Ouro" | "Diretor Diamante" | "Presidente Black";
  patrocinador: string;
  volumeKwpMes: number;
  diretosContagem: number;
  redeTotalContagem: number;
  status: "ativo" | "inativo";
  submembros?: MMNMemberNode[];
}

const MOCK_MMN_TREE: MMNMemberNode[] = [
  {
    id: "mmn-100",
    nome: "Carlos Eduardo Silva",
    nivel: 1,
    graduacao: "Presidente Black",
    patrocinador: "Master Founder",
    volumeKwpMes: 1450.0,
    diretosContagem: 12,
    redeTotalContagem: 1420,
    status: "ativo",
    submembros: [
      {
        id: "mmn-101",
        nome: "Ana Beatriz Rocha",
        nivel: 2,
        graduacao: "Diretor Diamante",
        patrocinador: "Carlos Eduardo Silva",
        volumeKwpMes: 680.0,
        diretosContagem: 8,
        redeTotalContagem: 540,
        status: "ativo",
        submembros: [
          {
            id: "mmn-102",
            nome: "Felipe Mendonça",
            nivel: 3,
            graduacao: "Gerente Ouro",
            patrocinador: "Ana Beatriz Rocha",
            volumeKwpMes: 290.0,
            diretosContagem: 5,
            redeTotalContagem: 180,
            status: "ativo",
          },
          {
            id: "mmn-103",
            nome: "Mariana Souza",
            nivel: 3,
            graduacao: "Supervisor Prata",
            patrocinador: "Ana Beatriz Rocha",
            volumeKwpMes: 140.0,
            diretosContagem: 3,
            redeTotalContagem: 45,
            status: "ativo",
          },
        ],
      },
      {
        id: "mmn-104",
        nome: "Roberto Fonseca",
        nivel: 2,
        graduacao: "Gerente Ouro",
        patrocinador: "Carlos Eduardo Silva",
        volumeKwpMes: 310.0,
        diretosContagem: 6,
        redeTotalContagem: 210,
        status: "ativo",
      },
    ],
  },
];

function MemberNodeItem({ member }: { member: MMNMemberNode }) {
  const [expanded, setExpanded] = React.useState(true);

  const getRankBadge = (graduacao: MMNMemberNode["graduacao"]) => {
    switch (graduacao) {
      case "Presidente Black":
        return <Badge variant="sun" className="text-[10px] bg-slate-900 border-amber-400 text-amber-400 glow-amber">👑 PRESIDENTE BLACK</Badge>;
      case "Diretor Diamante":
        return <Badge variant="cyan" className="text-[10px]">💎 DIRETOR DIAMANTE</Badge>;
      case "Gerente Ouro":
        return <Badge variant="sun" className="text-[10px]">🏆 GERENTE OURO</Badge>;
      case "Supervisor Prata":
        return <Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-200">🥈 SUPERVISOR PRATA</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">🥉 CONSULTOR BRONZE</Badge>;
    }
  };

  return (
    <div className="space-y-2 pl-4 border-l-2 border-amber-400/30">
      <div className="p-3.5 rounded-xl border border-border/60 bg-card/90 hover:border-amber-400/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          {member.submembros && member.submembros.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground">{member.nome}</span>
              <span className="text-[10px] font-mono text-muted-foreground">Nível {member.nivel}</span>
              {getRankBadge(member.graduacao)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Patrocinado por: <strong className="text-foreground">{member.patrocinador}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground block">Volume Mês</span>
            <strong className="text-amber-500 font-bold">{member.volumeKwpMes} kWp</strong>
          </div>

          <div className="text-right border-l border-border/40 pl-3">
            <span className="text-[10px] text-muted-foreground block">Diretos / Rede</span>
            <strong className="text-foreground">{member.diretosContagem} / {member.redeTotalContagem}</strong>
          </div>
        </div>
      </div>

      {/* Recursive Sub-members */}
      <AnimatePresence>
        {expanded && member.submembros && member.submembros.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-1"
          >
            {member.submembros.map((sub) => (
              <MemberNodeItem key={sub.id} member={sub} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MMNNetworkTreePage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Árvore Genealógica Unilevel MMN (7 Níveis)</span>
              <Badge variant="sun" className="text-[10px]">
                UNILEVEL 7 NÍVEIS
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Rede de consultores, graduações de carreira e volume mensal de geração kWp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar consultor ou patrocinador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Network Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Consultores Rede
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-500 font-bold glow-cyan">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">3.490</div>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">
                3.120 Ativos no mês
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Volume Total Gerado
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-500 font-bold glow-amber">
                <Zap className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">18,4 MWp</div>
              <p className="text-[11px] text-muted-foreground mt-1">Acumulado na rede Unilevel</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Presidentes Black
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 font-bold">
                <Award className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">4 Qualificados</div>
              <p className="text-[11px] text-muted-foreground mt-1">Topo do Plano de Carreira</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Profundidade Unilevel
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 font-bold glow-emerald">
                <Network className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-500">7 Níveis</div>
              <p className="text-[11px] text-muted-foreground mt-1">Pagamento automatizado BaaS</p>
            </CardContent>
          </Card>
        </div>

        {/* Unilevel Tree Container */}
        <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Network className="h-5 w-5 text-amber-500" />
              <span>Hierarquia de Patrocínio & Downlines</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            {MOCK_MMN_TREE.map((rootMember) => (
              <MemberNodeItem key={rootMember.id} member={rootMember} />
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
