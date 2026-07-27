import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  Crown,
  Gift,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Sun,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface EcoPointsProduct {
  id: string;
  title: string;
  pointsRequired: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Carlos Eduardo Silva", points: 8420, avatar: "CE" },
  { rank: 2, name: "Mariana Alcantara", points: 6150, avatar: "MA" },
  { rank: 3, name: "Lucas Barbosa", points: 4300, avatar: "LB" },
  { rank: 4, name: "Roberto Fonseca (Você)", points: 1450, avatar: "RF", isCurrentUser: true },
];

const MOCK_PRODUCTS: EcoPointsProduct[] = [
  {
    id: "prod-1",
    title: "Voucher R$ 500 Combustível / Uber",
    pointsRequired: 500,
    category: "Vouchers",
    imageUrl: "⛽",
    isAvailable: true,
  },
  {
    id: "prod-2",
    title: "iPhone 15 Pro Max 256GB Titanium",
    pointsRequired: 12000,
    category: "Eletrônicos",
    imageUrl: "📱",
    isAvailable: false,
  },
  {
    id: "prod-3",
    title: "Viagem Resort All-Inclusive (Com Acompanhante)",
    pointsRequired: 25000,
    category: "Viagens",
    imageUrl: "✈️",
    isAvailable: false,
  },
];

export function ConsultantEcoPointsRank() {
  const [userPoints, setUserPoints] = React.useState(1450);
  const [redeemedProductId, setRedeemedProductId] = React.useState<string | null>(null);

  const handleRedeemProduct = (prod: EcoPointsProduct) => {
    if (userPoints >= prod.pointsRequired) {
      setUserPoints((prev) => prev - prod.pointsRequired);
      setRedeemedProductId(prod.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Trophy className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">RANK & PRÊMIOS ECOPOINTS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Classificação & Loja</h1>
          <p className="text-xs text-slate-400">Seu Saldo Atual: <strong className="text-amber-400 font-mono">{userPoints.toLocaleString()} PTS</strong></p>
        </div>

        {/* Podium Top 3 Leaders */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <Badge variant="sun" className="text-[10px]">
                PÓDIO DOS CAMPEÕES
              </Badge>
              <h2 className="font-bold text-xs text-slate-300">Top Consultores do Mês</h2>
            </div>

            {/* Top 3 Visual Podium */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center space-y-1">
                <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                  MA
                </div>
                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[80px]">Mariana A.</span>
                <span className="text-[9px] font-mono text-amber-400 font-bold">6.150 PTS</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">🥈 2º LUGAR</Badge>
              </div>

              {/* 1st Place (Center Big) */}
              <div className="flex flex-col items-center space-y-1 -mt-3">
                <div className="relative">
                  <Crown className="h-5 w-5 text-amber-400 absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce" />
                  <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center font-black text-sm text-amber-400 shadow-lg glow-amber">
                    CE
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-white truncate max-w-[90px]">Carlos E.</span>
                <span className="text-[10px] font-mono text-amber-400 font-extrabold">8.420 PTS</span>
                <Badge variant="sun" className="text-[9px] px-1.5 py-0">🏆 1º LUGAR</Badge>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center space-y-1">
                <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                  LB
                </div>
                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[80px]">Lucas B.</span>
                <span className="text-[9px] font-mono text-amber-400 font-bold">4.300 PTS</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-400">🥉 3º LUGAR</Badge>
              </div>
            </div>

            {/* Current User Rank Bar */}
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">4º</span>
                <span className="font-bold text-white">Sua Posição (Roberto F.)</span>
              </div>
              <strong className="font-mono text-amber-400 font-extrabold">{userPoints.toLocaleString()} PTS</strong>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Store Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4 text-amber-400" /> Vitrine de Prêmios Resgatáveis
          </h2>

          <div className="space-y-3">
            {MOCK_PRODUCTS.map((prod) => {
              const canAfford = userPoints >= prod.pointsRequired;
              const isRedeemed = redeemedProductId === prod.id;

              return (
                <Card key={prod.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {prod.imageUrl}
                      </div>

                      <div className="space-y-0.5">
                        <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400">
                          {prod.category}
                        </Badge>
                        <h3 className="font-bold text-xs text-white leading-snug">{prod.title}</h3>
                        <span className="text-[10px] font-mono text-amber-400 font-bold block">
                          {prod.pointsRequired.toLocaleString()} EcoPoints
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isRedeemed ? (
                        <Badge variant="emerald" className="gap-1 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> RESGATADO
                        </Badge>
                      ) : (
                        <Button
                          variant={canAfford ? "sun" : "outline"}
                          size="sm"
                          disabled={!canAfford}
                          onClick={() => handleRedeemProduct(prod)}
                          className="h-8 text-xs font-bold rounded-xl gap-1 cursor-pointer"
                        >
                          {canAfford ? (
                            <>
                              <Gift className="h-3.5 w-3.5" />
                              <span>Resgatar</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              <span>Insuficiente</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
