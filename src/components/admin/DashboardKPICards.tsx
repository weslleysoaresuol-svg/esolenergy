import * as React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Zap,
  Users,
  ShieldCheck,
  TrendingUp,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculate3DTilt, staggerContainer, scaleUp } from "@/lib/animations";

export interface KPICardData {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "amber" | "emerald" | "cyan" | "slate";
}

const KPI_DATA: KPICardData[] = [
  {
    id: "kpi-revenue",
    title: "Faturamento Bruto Consolidado",
    value: "R$ 14.850.200,00",
    change: "+24,8%",
    trend: "up",
    subtitle: "acumulado no ano fiscal",
    icon: DollarSign,
    variant: "amber",
  },
  {
    id: "kpi-power",
    title: "Capacidade Instalada Solar",
    value: "18,4 MWp",
    change: "1.240 Projetos",
    trend: "up",
    subtitle: "geração limpa homologada ANEEL",
    icon: Zap,
    variant: "emerald",
  },
  {
    id: "kpi-network",
    title: "Rede MMN & Unilevel",
    value: "3.490 Consultores",
    change: "7 Níveis",
    trend: "up",
    subtitle: "ativos no plano de carreira",
    icon: Users,
    variant: "cyan",
  },
  {
    id: "kpi-ecopoints",
    title: "EcoPoints & Tesouraria BaaS",
    value: "1.890.400 PTS",
    change: "Ledger SHA-256",
    trend: "neutral",
    subtitle: "cofre contábil auditado",
    icon: Coins,
    variant: "slate",
  },
];

function TiltCard({ card }: { card: KPICardData }) {
  const [tilt, setTilt] = React.useState({ rotateX: 0, rotateY: 0 });
  const Icon = card.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { rotateX, rotateY } = calculate3DTilt(e, 8);
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const getVariantStyles = (variant: KPICardData["variant"]) => {
    switch (variant) {
      case "amber":
        return "border-amber-400/40 bg-card/85 shadow-amber-400/10 glow-amber dark:bg-slate-900/85";
      case "emerald":
        return "border-emerald-500/40 bg-card/85 shadow-emerald-500/10 glow-emerald dark:bg-slate-900/85";
      case "cyan":
        return "border-cyan-500/40 bg-card/85 shadow-cyan-500/10 glow-cyan dark:bg-slate-900/85";
      default:
        return "border-slate-700/80 bg-card/85 shadow-lg dark:bg-slate-900/85 dark:border-slate-800";
    }
  };

  const getIconBadge = (variant: KPICardData["variant"]) => {
    switch (variant) {
      case "amber":
        return "bg-amber-400/20 text-amber-500 font-bold glow-amber";
      case "emerald":
        return "bg-emerald-500/20 text-emerald-500 font-bold glow-emerald";
      case "cyan":
        return "bg-cyan-500/20 text-cyan-500 font-bold glow-cyan";
      default:
        return "bg-slate-800 text-emerald-400 font-bold";
    }
  };

  return (
    <motion.div
      variants={scaleUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ transformStyle: "preserve-3d" }}
      className="perspective-1000 cursor-pointer"
    >
      <Card className={cn("rounded-2xl border transition-all duration-300 backdrop-blur-xl hover:shadow-2xl", getVariantStyles(card.variant))}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {card.title}
          </CardTitle>
          <div className={cn("p-2.5 rounded-xl transition-transform hover:scale-110", getIconBadge(card.variant))}>
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>

        <CardContent className="space-y-1.5">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {card.value}
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {card.change}
            </span>
            <span className="text-muted-foreground">{card.subtitle}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardKPICards() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {KPI_DATA.map((card) => (
        <TiltCard key={card.id} card={card} />
      ))}
    </motion.div>
  );
}
