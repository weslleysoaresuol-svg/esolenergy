import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EsolLogoPrimary } from "@/components/brand/EsolLogoPrimary";
import { EsolLogoNegative } from "@/components/brand/EsolLogoNegative";
import portfolioResidential from "@/assets/portfolio-residential.jpg";
import portfolioCommercial from "@/assets/portfolio-commercial.jpg";
import portfolioIndustrial from "@/assets/portfolio-industrial.jpg";
import portfolioRural from "@/assets/portfolio-rural.jpg";
import heroHouse from "@/assets/hero-house.jpg";
import {
  Loader2,
  Zap,
  Sun,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  PhoneCall,
  Lock,
  Building2,
  Home,
  Factory,
  Tractor,
  Award,
  DollarSign,
  HelpCircle,
  Search,
  ExternalLink,
  MessageCircle,
  X,
  Play,
  Percent,
  Layers,
  Cpu,
  UserCheck,
  Wrench,
  GraduationCap,
  Scale,
  Briefcase,
  Users,
  PieChart,
  ShoppingBag,
  FileCheck2,
  RefreshCw,
} from "lucide-react";
import { hspForEstado } from "@/lib/proposta-calc";

const FAQ_ITEMS = [
  {
    q: "O que é a Plataforma Esol Energy?",
    a: "A Esol Energy é uma plataforma 360° de energia renovável (EnergyTech) que conecta consumidores, consultores de vendas, instaladores, engenheiros credenciados e fornecedores de tecnologia em um ecossistema digital unificado. Oferecemos desde sistemas fotovoltaicos físicos até assinatura de energia limpa (GD) e Mercado Livre de Energia.",
  },
  {
    q: "Como funciona a assinatura de energia solar (Geração Distribuída)?",
    a: "Na Geração Distribuída por Assinatura, você economiza até 20% na sua fatura sem precisar instalar nada no seu telhado, sem obras e sem taxa de adesão. A energia gerada por nossas usinas solares parceiras é injetada na rede da concessionária e convertida em créditos na sua conta mensal.",
  },
  {
    q: "O que é o Selo Verde Esol?",
    a: "O Selo Verde Esol é uma certificação ecológica exclusiva registrada em nosso banco de dados. Ele é emitido para todos os sistemas solares físicos instalados e homologados pela engenharia da Esol Energy, atestando a origem limpa dos componentes, redução de emissões de CO₂ e conformidade total com a Lei 14.300/2022.",
  },
  {
    q: "Como funciona o modelo de Consultor MMN (Renda Passiva Recorrente)?",
    a: "Nosso modelo comercial permite que consultores e corretores construam sua própria equipe de vendas com plano de carreira em 12 Selos Esol, sem taxa de adesão. O consultor recebe comissão direta sobre vendas de sistemas e royalties de renda passiva mensal recorrente sobre assinaturas de energia (GD e Mercado Livre) em até 7 níveis de profundidade.",
  },
  {
    q: "O que é o Faturamento Triangulado (Split de Pagamentos)?",
    a: "Para garantir máxima proteção tributária e transparência, o banco liquida o pagamento de hardware diretamente ao distribuidor de equipamentos (faturado no nome do cliente com isenção) e a parcela de serviços/engenharia para a Esol Energy, reduzindo impostos e otimizando o valor final do projeto.",
  },
  {
    q: "Como a Esol Energy cuida da homologação junto à concessionária?",
    a: "Cuidamos de 100% da burocracia de engenharia! Nossos engenheiros credenciados desenvolvem o projeto executivo, emitem a Anotação de Responsabilidade Técnica (ART) no CREA, solicitam o Parecer de Acesso e acompanham a troca do medidor bidirecional junto à sua distribuidora (CEMIG, CPFL, Enel, Neoenergia, Light, etc.).",
  },
];

export const Route = createFileRoute("/")({
  loader: async () => ({}),
  head: () => ({
    meta: [
      { title: "ESOL Energy — Plataforma 360° EnergyTech & Ecossistema Solar" },
      {
        name: "description",
        content:
          "Plataforma digital 360° de energia renovável: Soluções Turnkey com Selo Verde, Energia Solar por Assinatura GD, Mercado Livre de Energia e Rede Comercial MMN sem taxa de adesão.",
      },
      { property: "og:title", content: "ESOL Energy — Ecossistema Digital de Energia Renovável" },
      {
        property: "og:description",
        content: "Simule sua economia em 30 segundos nas 3 modalidades: Sistema Próprio, Assinatura GD ou Mercado Livre.",
      },
    ],
  }),
  component: LandingPage,
});

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type ModuloTipo = "turnkey" | "assinatura" | "mercadolivre";
type PerfilTipo = "cliente" | "consultor" | "instalador" | "engenheiro" | "whitelabel" | "admin";

function LandingPage() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [bill, setBill] = useState(1500);
  const [estado, setEstado] = useState("SP");
  const [activeModalidade, setActiveModalidade] = useState<ModuloTipo>("turnkey");
  const [activePerfil, setActivePerfil] = useState<PerfilTipo>("cliente");

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Ambient Lighting Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-[35%] right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
      </div>

      <div className="relative z-10">
        <HeaderNavigation onOpenTracking={() => setIsTrackingOpen(true)} />
        <main>
          <HeroEcossistemaSection
            bill={bill}
            setBill={setBill}
            estado={estado}
            setEstado={setEstado}
            activeModalidade={activeModalidade}
            setActiveModalidade={setActiveModalidade}
          />
          <ProfilesBar activePerfil={activePerfil} setActivePerfil={setActivePerfil} />
          <ThreeModeSimulatorSection
            bill={bill}
            setBill={setBill}
            estado={estado}
            setEstado={setEstado}
            activeModalidade={activeModalidade}
            setActiveModalidade={setActiveModalidade}
          />
          <ElevenCategoriesCatalogSection />
          <MMNNetworkSection />
          <EngineeringSeloVerdeSection />
          <PortalsHubSection />
          <FAQSection />
          <FinalCTASection />
        </main>
        <FooterSection />
        <FloatingWhatsAppButton />
        <AcompanharModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
      </div>
    </div>
  );
}

/* ============================================================================
   1. HEADER NAVIGATION (With Ecosystem Portals & High-Fidelity Logo)
============================================================================ */
function HeaderNavigation({ onOpenTracking }: { onOpenTracking: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brandmark */}
        <a href="/" className="flex items-center gap-3 group">
          <EsolLogoPrimary className="h-9 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
        </a>

        {/* Links principais */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-300">
          <a href="#simulador" className="hover:text-amber-400 transition-colors">
            Simulador 3-em-1
          </a>
          <a href="#categorias" className="hover:text-amber-400 transition-colors">
            11 Categorias
          </a>
          <a href="#mmn" className="hover:text-amber-400 transition-colors">
            Rede MMN & Royalties
          </a>
          <a href="#engenharia" className="hover:text-amber-400 transition-colors">
            Selo Verde & Engenharia
          </a>
          <a href="#portais" className="hover:text-amber-400 transition-colors">
            Portais
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTracking}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all"
          >
            <Search className="size-3.5 text-amber-400" />
            <span>Rastrear Projeto</span>
          </button>

          <a
            href="/app"
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            <Users className="size-3.5" />
            <span>App Consultor</span>
          </a>

          <a
            href="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 transition-all active:scale-95"
          >
            <Lock className="size-3.5" />
            <span>Acesso Restrito</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   2. HERO ECOSSISTEMA (360° EnergyTech Value Proposition)
============================================================================ */
function HeroEcossistemaSection({
  bill,
  setBill,
  estado,
  setEstado,
  activeModalidade,
  setActiveModalidade,
}: {
  bill: number;
  setBill: (n: number) => void;
  estado: string;
  setEstado: (e: string) => void;
  activeModalidade: ModuloTipo;
  setActiveModalidade: (m: ModuloTipo) => void;
}) {
  const [inputValue, setInputValue] = useState(bill.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(inputValue.replace(/\D/g, ""));
    if (num >= 100) setBill(Math.min(num, 150000));
    document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Vision & Pitch */}
          <div className="lg:col-span-7">
            {/* Live Ecosystem Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-900/90 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-400 mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span>PLATAFORMA 360° ENERGYTECH • FOTOVOLTAICO + ASSINATURA GD + MLE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06] text-balance">
              Sua Plataforma Digital de{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Energia Renovável & Lucratividade
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Escolha a melhor estratégia para sua realidade: <strong className="text-amber-400 font-bold">Gerar sua própria energia</strong> com Selo Verde Esol, <strong className="text-emerald-400 font-bold">Assinar energia limpa com até 20% de desconto sem obras</strong>, ou <strong className="text-sky-400 font-bold">Lucrar na maior Rede Comercial de Energia do Brasil</strong>.
            </p>

            {/* Quick Estimator Bar */}
            <div className="mt-8 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl max-w-xl">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 flex items-center px-4 py-3 bg-slate-950/90 rounded-xl border border-slate-800 focus-within:border-amber-500/60 transition-all">
                  <span className="text-slate-400 font-bold mr-2 text-sm">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Valor da fatura (ex: 1.500)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-transparent text-white font-semibold outline-none text-sm sm:text-base placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>Comparar 3 Opções</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  Sem taxa de adesão
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-amber-400" />
                  Homologação 100% Inclusa
                </span>
              </div>
            </div>

            {/* Micro Pillars Grid */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-xl">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-lg font-black text-amber-400">Até 95%</p>
                <p className="text-[11px] text-slate-400 font-medium">Economia Turnkey</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-lg font-black text-emerald-400">0 Obras</p>
                <p className="text-[11px] text-slate-400 font-medium">Assinatura GD</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-lg font-black text-sky-400">7 Níveis</p>
                <p className="text-[11px] text-slate-400 font-medium">Royalties MMN</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Interactive Energy Cockpit */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Esol Energy Cockpit 360°</h4>
                    <p className="text-xs text-slate-400">Simulação Comparativa em Tempo Real</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  ONLINE
                </span>
              </div>

              {/* Visual Card */}
              <div className="mt-4 relative rounded-2xl overflow-hidden aspect-[16/10] border border-slate-800">
                <img
                  src={heroHouse}
                  alt="Residência equipada com sistema solar ESOL Energy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Fatura Atual</p>
                    <p className="text-base font-black text-slate-200">{BRL.format(bill)} / mês</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Economia em 25 Anos</p>
                    <p className="text-base font-black text-emerald-400">{BRL.format(bill * 0.92 * 12 * 25)}</p>
                  </div>
                </div>
              </div>

              {/* 3 Modality Toggles */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveModalidade("turnkey")}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeModalidade === "turnkey"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  1. Turnkey (Próprio)
                </button>
                <button
                  onClick={() => setActiveModalidade("assinatura")}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeModalidade === "assinatura"
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
                      : "bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  2. Assinatura GD
                </button>
                <button
                  onClick={() => setActiveModalidade("mercadolivre")}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeModalidade === "mercadolivre"
                      ? "bg-sky-500 text-slate-950 border-sky-400 shadow-md"
                      : "bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  3. Mercado Livre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   3. PROFILES BAR (6 User Profiles Roadmap)
============================================================================ */
function ProfilesBar({
  activePerfil,
  setActivePerfil,
}: {
  activePerfil: PerfilTipo;
  setActivePerfil: (p: PerfilTipo) => void;
}) {
  const perfis = [
    { id: "cliente", name: "👤 Cliente Final", role: "Economiza na fatura & indica amigos" },
    { id: "consultor", name: "🤝 Consultor MMN", role: "Vende & constrói equipe de 7 níveis" },
    { id: "instalador", name: "🔧 Instalador", role: "Executa obras & vistorias O&M" },
    { id: "engenheiro", name: "📐 Engenheiro", role: "Dimensiona & assina ART no CREA" },
    { id: "whitelabel", name: "🏢 White-Label", role: "Licencia a tecnologia Esol" },
    { id: "admin", name: "⚙️ Admin / Gestor", role: "Backoffice, Ledger & WAF Security" },
  ] as const;

  return (
    <section className="py-8 bg-slate-950/90 border-y border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-widest">
            ECOSSISTEMA PARA OS 6 PERFIS DO MERCADO DE ENERGIA
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {perfis.map((p) => {
            const active = activePerfil === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePerfil(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  active
                    ? "bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <p className="text-xs font-bold text-white">{p.name}</p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{p.role}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   4. THREE-MODE SIMULATOR SECTION (3-em-1: Turnkey, GD Assinatura, Mercado Livre)
============================================================================ */
function ThreeModeSimulatorSection({
  bill,
  setBill,
  estado,
  setEstado,
  activeModalidade,
  setActiveModalidade,
}: {
  bill: number;
  setBill: (n: number) => void;
  estado: string;
  setEstado: (e: string) => void;
  activeModalidade: ModuloTipo;
  setActiveModalidade: (m: ModuloTipo) => void;
}) {
  const hsp = hspForEstado(estado) || 5.2;

  // Calculos da modalidade Turnkey
  const geracaoKwh = bill / 0.95;
  const potenciaKwp = geracaoKwh / (30 * hsp * 0.8);
  const economiaTurnkey25Anos = bill * 0.92 * 12 * 25;
  const investimentoTurnkey = potenciaKwp * 4100;
  const paybackTurnkey = (investimentoTurnkey / (bill * 0.92 * 12)).toFixed(1);

  // Calculos da modalidade GD Assinatura
  const economiaGDMensal = bill * 0.15; // 15% medio de desconto
  const economiaGD25Anos = economiaGDMensal * 12 * 25;

  // Calculos da modalidade Mercado Livre
  const economiaMLEMensal = bill * 0.30; // 30% medio no MLE
  const economiaMLE25Anos = economiaMLEMensal * 12 * 25;

  return (
    <section id="simulador" className="py-24 bg-[#020617] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            SIMULADOR INTELIGENTE 3-EM-1
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            Compare as 3 Formas de Economizar
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Altere sua fatura mensal e veja o resultado em tempo real para cada modelo de contratação.
          </p>
        </div>

        {/* Controller Bar */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl mb-10 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase text-slate-300">Fatura Mensal de Energia</label>
                <span className="text-xl font-black text-amber-400">{BRL.format(bill)}</span>
              </div>
              <input
                type="range"
                min={300}
                max={50000}
                step={100}
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-2">Estado (Radiação Solar)</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-amber-500"
              >
                {["SP", "MG", "RJ", "ES", "PR", "SC", "RS", "BA", "GO", "DF", "CE", "PE", "MT", "MS"].map((uf) => (
                  <option key={uf} value={uf}>
                    {uf} — HSP: {hspForEstado(uf) || 5.0} kWh/m²/dia
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3 Cards Comparison Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Card 1: Turnkey (Próprio) */}
          <div
            className={`p-8 rounded-3xl border transition-all relative ${
              activeModalidade === "turnkey"
                ? "bg-slate-900/90 border-amber-500/80 shadow-2xl shadow-amber-500/10 scale-102"
                : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Opção A: Turnkey (Próprio)
              </span>
              <ShieldCheck className="size-5 text-amber-400" />
            </div>

            <h3 className="text-xl font-bold text-white">Sistema Solar no Telhado</h3>
            <p className="text-xs text-slate-400 mt-2">
              Equipamentos de alta performance instalados e homologados pela ESOL Energy com Selo Verde.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Economia na Fatura:</span>
                <span className="font-bold text-emerald-400">Até 95%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Potência Estimada:</span>
                <span className="font-bold text-white">{potenciaKwp.toFixed(2)} kWp</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Payback Médio:</span>
                <span className="font-bold text-amber-400">{paybackTurnkey} Anos</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 font-bold">Economia 25 Anos:</span>
                <span className="font-black text-emerald-400 text-sm">{BRL.format(economiaTurnkey25Anos)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModalidade("turnkey");
                window.open("https://wa.me/5531999999999?text=Quero%20proposta%20Turnkey", "_blank");
              }}
              className="mt-8 w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Solicitar Projeto Turnkey
            </button>
          </div>

          {/* Card 2: Assinatura GD */}
          <div
            className={`p-8 rounded-3xl border transition-all relative ${
              activeModalidade === "assinatura"
                ? "bg-slate-900/90 border-emerald-500/80 shadow-2xl shadow-emerald-500/10 scale-102"
                : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Opção B: Assinatura GD
              </span>
              <RefreshCw className="size-5 text-emerald-400" />
            </div>

            <h3 className="text-xl font-bold text-white">Energia Por Assinatura</h3>
            <p className="text-xs text-slate-400 mt-2">
              Sem obras no telhado, sem taxa de adesão e sem investimento. Desconto direto na fatura.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Desconto Garantido:</span>
                <span className="font-bold text-emerald-400">10% a 20%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Investimento Inicial:</span>
                <span className="font-bold text-emerald-400">R$ 0,00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Fidelidade:</span>
                <span className="font-bold text-white">Zero / Cancelamento Fácil</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 font-bold">Economia 25 Anos:</span>
                <span className="font-black text-emerald-400 text-sm">{BRL.format(economiaGD25Anos)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModalidade("assinatura");
                window.open("https://wa.me/5531999999999?text=Quero%20Assinar%20Energia%20GD", "_blank");
              }}
              className="mt-8 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Assinar Energia Limpa
            </button>
          </div>

          {/* Card 3: Mercado Livre MLE */}
          <div
            className={`p-8 rounded-3xl border transition-all relative ${
              activeModalidade === "mercadolivre"
                ? "bg-slate-900/90 border-sky-500/80 shadow-2xl shadow-sky-500/10 scale-102"
                : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                Opção C: Mercado Livre (MLE)
              </span>
              <Building2 className="size-5 text-sky-400" />
            </div>

            <h3 className="text-xl font-bold text-white">Mercado Livre de Energia</h3>
            <p className="text-xs text-slate-400 mt-2">
              Para empresas e indústrias no Grupo A (contas acima de R$ 5.000). Compra livre de geradoras.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Economia Média:</span>
                <span className="font-bold text-sky-400">Até 35%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Público Alvo:</span>
                <span className="font-bold text-white">Empresas & Indústrias</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Previsibilidade:</span>
                <span className="font-bold text-emerald-400">Preço Fixo em Contrato</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 font-bold">Economia 25 Anos:</span>
                <span className="font-black text-emerald-400 text-sm">{BRL.format(economiaMLE25Anos)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModalidade("mercadolivre");
                window.open("https://wa.me/5531999999999?text=Quero%20Migrar%20para%20Mercado%20Livre", "_blank");
              }}
              className="mt-8 w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Migrar Minha Empresa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   5. ELEVEN CATEGORIES CATALOG (11 Categorias em 3 Canais de Venda)
============================================================================ */
function ElevenCategoriesCatalogSection() {
  const categorias = [
    { num: "01", title: "Sistema Solar Completo (Turnkey)", channel: "Canal MMN", desc: "Projeto físico + ART + Equipamentos + Instalação + Selo Verde" },
    { num: "02", title: "Loja Esol (Kits, Baterias & IoT)", channel: "Canal MMN", desc: "E-commerce de painéis, inversores, carregadores veiculares e medição IoT" },
    { num: "03", title: "Energia por Assinatura (GD)", channel: "Canal MMN", desc: "Desconto direto na fatura mensal para residências e comércios sem obras" },
    { num: "04", title: "Mercado Livre de Energia (MLE)", channel: "Canal MMN", desc: "Migração de empresas PME para comercialização livre no atacado" },
    { num: "05", title: "SaaS de Telemetria & Monitoramento", channel: "Canal MMN", desc: "Acompanhamento remoto de geração e alertas em tempo real" },
    { num: "06", title: "Manutenção & Assistência (O&M)", channel: "Canal MMN", desc: "Reparos elétricos, troca de peças e assistência técnica credenciada" },
    { num: "07", title: "Limpeza Profissional de Módulos", channel: "Canal MMN", desc: "Lavagem química especializada para manter 100% da eficiência" },
    { num: "08", title: "Seguros Solares", channel: "Canal MMN", desc: "Proteção contra vendavais, descargas elétricas e roubo de equipamentos" },
    { num: "09", title: "Eficiência Energética Industrial", channel: "Indicação B2B", desc: "Projetos customizados de automação para grandes indústrias" },
    { num: "10", title: "Usinas Solares de Investimento", channel: "Indicação B2B", desc: "Construção de fazendas solares (R$ 500k a R$ 5M+) para investidores" },
    { num: "11", title: "Licenciamento White-Label", channel: "Licenciamento", desc: "Tecnologia e ecossistema Esol operando sob marca própria" },
  ];

  return (
    <section id="categorias" className="py-24 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            PORTFÓLIO COMPLETO ESOL ENERGY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            11 Categorias em 3 Canais de Atuação
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Conheça todos os produtos e serviços transacionados pelo ecossistema Esol Energy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-amber-500/30 font-mono">{item.num}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {item.channel}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   6. MMN NETWORK SECTION (Royalties de Energia & Renda Passiva Recorrente)
============================================================================ */
function MMNNetworkSection() {
  return (
    <section id="mmn" className="py-24 bg-[#020617] border-t border-slate-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              REDE COMERCIAL MMN SEM TAXA DE ADESÃO
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight leading-tight">
              Construa Sua Renda Passiva Com{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Royalties de Energia
              </span>
            </h2>
            <p className="text-slate-300 mt-6 text-base leading-relaxed">
              Torne-se um Consultor Credenciado Esol Energy. Cadastre clientes e parceiros sem pagar taxa de entrada e receba comissões sobre vendas físicas e <strong className="text-emerald-400">recorrência mensal garantida em 7 níveis de profundidade</strong> sobre contratos de energia por assinatura.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="size-5 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Sem Taxa de Adesão / Zero Investimento</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Cadastre-se gratuitamente e comece a atuar imediatamente.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="size-5 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Plano de Carreira em 12 Selos Esol</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Evolua de Selo Bronze a Diamante conforme seu volume de produção da equipe.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="size-5 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Carteira Digital & Saques PIX</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Acompanhe suas comissões em tempo real no app e solicite saques diretamente via PIX.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/auth"
                className="inline-flex items-center gap-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-8 py-4 shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-wider"
              >
                <span>Quero Ser Consultor Esol</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="size-5 text-emerald-400" />
                Override Igualitário em 7 Níveis
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { level: "Nível 1 (Diretos)", pct: "15,0% Comissão Direta" },
                  { level: "Nível 2", pct: "3,0% Override Mensal" },
                  { level: "Nível 3", pct: "3,0% Override Mensal" },
                  { level: "Nível 4", pct: "3,0% Override Mensal" },
                  { level: "Nível 5", pct: "3,0% Override Mensal" },
                  { level: "Nível 6", pct: "3,0% Override Mensal" },
                  { level: "Nível 7", pct: "3,0% Override Mensal" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300 font-bold">{item.level}</span>
                    <span className="text-emerald-400 font-black">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   7. ENGINEERING & SELO VERDE ESOL SECTION
============================================================================ */
function EngineeringSeloVerdeSection() {
  return (
    <section id="engenharia" className="py-24 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            CERTIFICAÇÃO E ENGENHARIA DE CAMPO
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            Selo Verde Esol & Faturamento Triangulado
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Proteção tributária e segurança técnica garantida por engenheiros credenciados no CREA.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            <Award className="size-10 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Selo Verde Esol Exclusivo</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Certificação ecológica registrada em nosso banco de dados. Emitido apenas para instalações físicas vistoriadas e validadas pela engenharia da Esol.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            <Scale className="size-10 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Faturamento Triangulado</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              O hardware é faturado diretamente do distribuidor homologado para o cliente com isenção fiscal, reduzindo impostos em até 60%.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            <Wrench className="size-10 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Engenharia Credenciada CREA</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Emissão de Anotação de Responsabilidade Técnica (ART), diagrama elétrico e parecer de acesso direto com as distribuidoras brasileiras.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   8. PORTALS HUB SECTION (Direct Access to All Application Pages)
============================================================================ */
function PortalsHubSection() {
  const portais = [
    {
      title: "App do Consultor (PWA)",
      link: "/app",
      icon: SmartphoneIcon,
      desc: "Cockpit Comercial, Simulador de Propostas, Gestão de Clientes e Rede MMN.",
      badge: "Disponível PWA",
    },
    {
      title: "Portal de Acesso & Biometria",
      link: "/auth",
      icon: Lock,
      desc: "Autenticação segura via Esol Sign com validação cadastral e biometria facial.",
      badge: "Esol Sign",
    },
    {
      title: "Command Center Admin",
      link: "/admin",
      icon: Cpu,
      desc: "Backoffice administrativo, DRE, Ledger Contábil, Conciliação PIX e WAF Security.",
      badge: "7 Níveis RBAC",
    },
    {
      title: "Brand Kit & Design System",
      link: "/admin/brand-kit",
      icon: Sparkles,
      desc: "Manual da Marca V13.2, Logos oficiais em alta resolução e guia de estilo.",
      badge: "V13.2 Brand",
    },
  ];

  return (
    <section id="portais" className="py-24 bg-[#020617] border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            PORTAIS DA PLATAFORMA
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            Acesse Nossas Aplicações
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Navegação direta para cada ambiente do ecossistema Esol Energy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portais.map((p, idx) => {
            const Icon = p.icon;
            return (
              <a
                key={idx}
                href={p.link}
                className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Acessar Módulo</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SmartphoneIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

/* ============================================================================
   9. FAQ ACCORDION SECTION
============================================================================ */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            TRANSPARÊNCIA TOTAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            Perguntas Frequentes Sobre o Ecossistema
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-amber-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`size-5 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-amber-400" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   10. FINAL CTA SECTION
============================================================================ */
function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-[#020617] relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="p-10 sm:p-14 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Junte-se à Revolução da{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Energia Renovável
            </span>
          </h2>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Seja um cliente economizando mensalmente na fatura ou um consultor construindo renda passiva com a Esol Energy.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5531999999999?text=Ol%C3%A1%20ESOL%20Energy!%20Vim%20pela%20plataforma%20e%20gostaria%20de%20receber%20uma%20proposta."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-black text-slate-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 transition-all uppercase tracking-wider"
            >
              <MessageCircle className="size-5" />
              <span>Solicitar Atendimento Oficial</span>
            </a>
            <a
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 border border-slate-800 px-8 py-4 text-base font-bold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <Users className="size-4" />
              <span>Conhecer App do Consultor</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   11. FOOTER SECTION
============================================================================ */
function FooterSection() {
  return (
    <footer className="bg-[#010309] border-t border-slate-900 py-12 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <EsolLogoNegative className="h-8 w-auto" />
          <div className="flex flex-wrap items-center gap-6 font-semibold">
            <a href="#simulador" className="hover:text-amber-400">Simulador 3-em-1</a>
            <a href="#categorias" className="hover:text-amber-400">11 Categorias</a>
            <a href="#mmn" className="hover:text-amber-400">Rede MMN</a>
            <a href="/app" className="hover:text-amber-400">App Consultor</a>
            <a href="/auth" className="hover:text-amber-400">Portal Acesso</a>
            <a href="/admin" className="hover:text-amber-400">Painel Admin</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} ESOL Energy Ltda. Todos os direitos reservados. Projetos registrados no CREA.</p>
          <p className="text-slate-500 font-mono">Conformidade total com a Lei 14.300/2022 & MP 2.200-2/2001.</p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   12. FLOATING WHATSAPP BUTTON
============================================================================ */
function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/5531999999999?text=Ol%C3%A1%20ESOL%20Energy!%20Vim%20pela%20plataforma%20e%20gostaria%20de%20falar%20com%20um%20especialista."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center size-14 rounded-full bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/40 hover:bg-emerald-400 hover:scale-110 transition-all active:scale-95"
      aria-label="Atendimento via WhatsApp"
    >
      <MessageCircle className="size-7 fill-slate-950" />
    </a>
  );
}

/* ============================================================================
   13. ACOMPANHAR PROJETO MODAL
============================================================================ */
function AcompanharModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
        >
          <X className="size-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">Rastrear Projeto ou Orçamento</h3>
        <p className="text-xs text-slate-400 mb-6">
          Informe seu CPF, CNPJ ou Código da Proposta para verificar o status de homologação na concessionária.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) {
              onClose();
              navigate({ to: "/auth" });
            }
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Digite CPF, CNPJ ou Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-amber-500 text-sm"
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
          >
            Buscar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
