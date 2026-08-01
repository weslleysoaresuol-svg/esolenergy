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
  Fuel,
  Smartphone,
  ShieldCheck,
  Zap,
  GraduationCap,
  Users,
  MapPin,
  CreditCard,
  Briefcase,
  Layers,
  Star,
  Check,
  X,
  DollarSign,
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

export type CategoryGroup = "campo" | "marca" | "alavancagem" | "capacitacao";

export interface UsefulBenefit {
  id: string;
  title: string;
  pointsRequired: number;
  categoryGroup: CategoryGroup;
  categoryLabel: string;
  iconName: string;
  description: string;
  perceivedValue: string;
  isAvailable: boolean;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Carlos Eduardo Silva", points: 8420, avatar: "CE" },
  { rank: 2, name: "Mariana Alcantara", points: 6150, avatar: "MA" },
  { rank: 3, name: "Lucas Barbosa", points: 4300, avatar: "LB" },
  { rank: 4, name: "Roberto Fonseca (Você)", points: 2750, avatar: "RF", isCurrentUser: true },
];

const MOCK_BENEFITS: UsefulBenefit[] = [
  // Grupo 1: Redução de Custo no Campo
  {
    id: "ben-1",
    title: "Voucher R$ 50 Combustível / Uber",
    pointsRequired: 500,
    categoryGroup: "campo",
    categoryLabel: "Custo no Campo",
    iconName: "⛽",
    description: "Crédito direto no app para abastecimento ou viagens de vistoria técnica.",
    perceivedValue: "R$ 50,00 em viagens",
    isAvailable: true,
  },
  {
    id: "ben-2",
    title: "Voucher R$ 100 Tag Pedágio / Sem Parar",
    pointsRequired: 1000,
    categoryGroup: "campo",
    categoryLabel: "Custo no Campo",
    iconName: "🛣️",
    description: "Facilita o deslocamento em rodovias para atendimento em cidades vizinhas.",
    perceivedValue: "R$ 100,00 de crédito",
    isAvailable: true,
  },
  {
    id: "ben-3",
    title: "Chip 5G Corporativo 10GB de Dados",
    pointsRequired: 1500,
    categoryGroup: "campo",
    categoryLabel: "Custo no Campo",
    iconName: "📱",
    description: "Internet ultra-rápida no celular para apresentar propostas no cliente sem quedas.",
    perceivedValue: "10GB alta velocidade",
    isAvailable: true,
  },

  // Grupo 2: Kit Marca & Identidade
  {
    id: "ben-4",
    title: "Kit Marca Esol (Polo, Boné, Squeeze, Crachá)",
    pointsRequired: 1000,
    categoryGroup: "marca",
    categoryLabel: "Kit Marca",
    iconName: "🧢",
    description: "Vestuário oficial de vendas para passar máxima autoridade e credibilidade.",
    perceivedValue: "Kit Completo de Campo",
    isAvailable: true,
  },
  {
    id: "ben-5",
    title: "Planner & Agendão Solar Executivo 2026",
    pointsRequired: 1200,
    categoryGroup: "marca",
    categoryLabel: "Kit Marca",
    iconName: "📓",
    description: "Organizador de couro sintético para reuniões, leads e acompanhamento de obras.",
    perceivedValue: "Edição Especial 2026",
    isAvailable: true,
  },
  {
    id: "ben-6",
    title: "Mochila Impermeável Executiva Esol",
    pointsRequired: 2000,
    categoryGroup: "marca",
    categoryLabel: "Kit Marca",
    iconName: "🎒",
    description: "Mochila estofada para notebook, tablet e documentos de engenharia.",
    perceivedValue: "Proteção Impermeável",
    isAvailable: true,
  },

  // Grupo 3: Ferramentas Comerciais & Alavancagem
  {
    id: "ben-7",
    title: "Cupom R$ 250 Esol Hardware Store",
    pointsRequired: 2500,
    categoryGroup: "alavancagem",
    categoryLabel: "Alavancagem",
    iconName: "🏷️",
    description: "Desconto para compra de cabos, conectores MC4 e microinversores na loja.",
    perceivedValue: "R$ 250,00 de desconto",
    isAvailable: true,
  },
  {
    id: "ben-8",
    title: "Destaque Consultor Recomendado da Região",
    pointsRequired: 3000,
    categoryGroup: "alavancagem",
    categoryLabel: "Alavancagem",
    iconName: "📍",
    description: "Posiciona seu perfil no topo do mapa da cidade para receber leads do site.",
    perceivedValue: "Prioridade de Leads",
    isAvailable: true,
  },
  {
    id: "ben-9",
    title: "500 Cartões de Visita NFC com QR Code",
    pointsRequired: 3500,
    categoryGroup: "alavancagem",
    categoryLabel: "Alavancagem",
    iconName: "🎴",
    description: "Aproxima o cartão no celular do cliente para abrir seu simulador solar instantaneamente.",
    perceivedValue: "500un Cartões NFC",
    isAvailable: true,
  },

  // Grupo 4: Capacitação VIP & Reconhecimento
  {
    id: "ben-10",
    title: "Curso Avançado Vendas B2B de Usinas",
    pointsRequired: 1500,
    categoryGroup: "capacitacao",
    categoryLabel: "Capacitação VIP",
    iconName: "🎓",
    description: "Treinamento fechado na Esol Academy sobre vendas de usinas de R$ 500k a R$ 5M.",
    perceivedValue: "Certificado Executivo",
    isAvailable: true,
  },
  {
    id: "ben-11",
    title: "Mentoria 1-on-1 de 45 min com Diretor C-Level",
    pointsRequired: 8000,
    categoryGroup: "capacitacao",
    categoryLabel: "Capacitação VIP",
    iconName: "🧠",
    description: "Sessão individual de aconselhamento estratégico de carreira com o Diretor Comercial.",
    perceivedValue: "Aconselhamento VIP",
    isAvailable: true,
  },
  {
    id: "ben-12",
    title: "Ingresso VIP Convenção Nacional Esol Energy",
    pointsRequired: 10000,
    categoryGroup: "capacitacao",
    categoryLabel: "Capacitação VIP",
    iconName: "🎟️",
    description: "Primeiras fileiras no auditório principal e acesso exclusivo ao coquetel executivo.",
    perceivedValue: "Acesso Total VIP",
    isAvailable: true,
  },
];

export function ConsultantEcoPointsRank() {
  const [userPoints, setUserPoints] = React.useState(2750); // Pontos seguros consolidados
  const [activeTab, setActiveTab] = React.useState<"todos" | CategoryGroup>("todos");
  const [selectedBenefit, setSelectedBenefit] = React.useState<UsefulBenefit | null>(null);
  const [redeemedIds, setRedeemedIds] = React.useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);

  const benefits = MOCK_BENEFITS;
  const leaderboard = MOCK_LEADERBOARD;

  const filteredBenefits = React.useMemo(() => {
    if (activeTab === "todos") return benefits;
    return benefits.filter((b) => b.categoryGroup === activeTab);
  }, [activeTab, benefits]);

  const handleConfirmRedeem = () => {
    if (selectedBenefit && userPoints >= selectedBenefit.pointsRequired) {
      setUserPoints((prev) => prev - selectedBenefit.pointsRequired);
      setRedeemedIds((prev) => [...prev, selectedBenefit.id]);
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Trophy className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">
              RANKING & LOJA DE BENEFÍCIOS V11.0
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Central de Benefícios & Rank</h1>
          <p className="text-xs text-slate-400">
            Seu Saldo Válido: <strong className="text-amber-400 font-mono text-sm">{userPoints.toLocaleString()} PTS</strong>
          </p>
        </div>

        {/* 1. CARD DE RATEIO DO POOL DE 4% DA RECEITA MENSAL (DINHEIRO NO PIX) */}
        <Card className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] gap-1">
                <DollarSign className="h-3 w-3" /> RATEIO 4% DA RECEITA NO PIX
              </Badge>
              <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400">
                0% TRAVA VME
              </Badge>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-300 block">Fundo Mensal de Produtividade Direta</span>
              <strong className="text-2xl font-black text-amber-400 block font-mono glow-amber">
                R$ 48.500,00
              </strong>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                A Esol reserva <strong>4% da receita de intermediação recebida no mês</strong> e distribui em dinheiro via PIX proporcionalmente aos pontos de vendas diretas pessoais de cada consultor no Ranking Mensal!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Seu Bônus Estimado no Mês:</span>
              <strong className="text-emerald-400 font-extrabold">R$ 1.820,50 PIX</strong>
            </div>
          </CardContent>
        </Card>

        {/* 2. PÓDIO DOS CAMPEÕES DO MÊS */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <Badge variant="sun" className="text-[10px]">
                PÓDIO DOS CAMPEÕES DO MÊS
              </Badge>
              <h2 className="font-bold text-xs text-slate-300">Top Vendedores Diretos</h2>
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

        {/* 3. VITRINE DE BENEFÍCIOS ÚTEIS (12 ITENS EM 4 GRUPOS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-amber-400" /> Loja de Benefícios Úteis
            </h2>
            <span className="text-[10px] font-mono text-slate-500">{filteredBenefits.length} Benefícios</span>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("todos")}
              className={cn(
                "py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer",
                activeTab === "todos"
                  ? "bg-amber-400 text-slate-950 font-extrabold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              Todos ({benefits.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("campo")}
              className={cn(
                "py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1",
                activeTab === "campo"
                  ? "bg-amber-400 text-slate-950 font-extrabold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              ⛽ Campo
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("marca")}
              className={cn(
                "py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1",
                activeTab === "marca"
                  ? "bg-amber-400 text-slate-950 font-extrabold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              🧢 Kit Marca
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("alavancagem")}
              className={cn(
                "py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1",
                activeTab === "alavancagem"
                  ? "bg-amber-400 text-slate-950 font-extrabold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              🏷️ Alavancagem
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("capacitacao")}
              className={cn(
                "py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1",
                activeTab === "capacitacao"
                  ? "bg-amber-400 text-slate-950 font-extrabold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              🎓 Capacitação
            </button>
          </div>

          {/* BENEFITS CARDS LIST */}
          <div className="space-y-3">
            {filteredBenefits.map((ben) => {
              const canAfford = userPoints >= ben.pointsRequired;
              const isRedeemed = redeemedIds.includes(ben.id);

              return (
                <Card
                  key={ben.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden hover:border-slate-700 transition-all"
                >
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {ben.iconName}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400">
                            {ben.categoryLabel}
                          </Badge>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">{ben.perceivedValue}</span>
                        </div>
                        <h3 className="font-bold text-xs text-white leading-snug">{ben.title}</h3>
                        <span className="text-[10px] font-mono text-amber-400 font-bold block">
                          {ben.pointsRequired.toLocaleString()} EcoPoints
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
                          onClick={() => setSelectedBenefit(ben)}
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

      {/* CONFIRM REDEEM MODAL */}
      <AnimatePresence>
        {selectedBenefit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSelectedBenefit(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/50"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-4xl flex items-center justify-center mx-auto">
                  {selectedBenefit.iconName}
                </div>
                <Badge variant="sun" className="text-[10px]">
                  CONFIRMAÇÃO DE RESGATE
                </Badge>
                <h3 className="font-extrabold text-base text-white">{selectedBenefit.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{selectedBenefit.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Custo do Benefício:</span>
                  <strong className="text-amber-400">{selectedBenefit.pointsRequired.toLocaleString()} PTS</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seu Saldo Atual:</span>
                  <strong className="text-white">{userPoints.toLocaleString()} PTS</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Saldo Restante:</span>
                  <strong className="text-emerald-400">
                    {(userPoints - selectedBenefit.pointsRequired).toLocaleString()} PTS
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBenefit(null)}
                  className="w-1/2 rounded-xl text-xs border-slate-800 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  variant="sun"
                  onClick={() => {
                    handleConfirmRedeem();
                    setSelectedBenefit(null);
                  }}
                  className="w-1/2 rounded-xl text-xs font-extrabold gap-1 glow-amber cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS CONFIRMATION MODAL */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 space-y-4 text-center shadow-2xl"
            >
              <div className="h-16 w-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto glow-amber">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-lg text-white">Resgate Efetuado com Sucesso!</h3>
                <p className="text-xs text-slate-400">
                  Seu benefício foi processado. As instruções de resgate foram enviadas para seu e-mail e aba de notificações no app.
                </p>
              </div>

              <Button
                variant="sun"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full rounded-xl text-xs font-extrabold glow-amber cursor-pointer"
              >
                Concluir
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
