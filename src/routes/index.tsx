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
} from "lucide-react";
import { hspForEstado } from "@/lib/proposta-calc";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "Quanto custa um sistema solar residencial ou comercial?",
    a: "Sistemas residenciais começam em torno de R$ 12 mil a R$ 14 mil, com parcelamento facilitado em até 84x e carência de até 120 dias. O valor exato depende do consumo mensal, tipo de telhado e região. Nosso simulador calcula o investimento exato em 30 segundos.",
  },
  {
    q: "Em quanto tempo recupero o investimento (Payback)?",
    a: "O payback médio no Brasil é de 3 a 5 anos. Após esse período de retorno, você desfruta de mais 20 a 22 anos de energia solar praticamente gratuita com economia constante de até 95%.",
  },
  {
    q: "A energia solar continua valendo a pena com a Lei 14.300?",
    a: "Sim, com certeza! Mesmo com a cobrança do Fio B prevista na Lei 14.300/2022, a economia continua atingindo até 90% a 95% na fatura mensal. A energia solar continua sendo o melhor investimento financeiro contra a inflação energética brasileira.",
  },
  {
    q: "O que acontece em dias nublados ou durante a noite?",
    a: "O sistema continua gerando energia em dias nublados (em menor escala). À noite, você consome os créditos de energia acumulados na rede da concessionária durante o dia através do sistema de compensação de créditos.",
  },
  {
    q: "Qual a garantia oferecida pela ESOL Energy?",
    a: "Oferecemos garantia de 25 anos de eficiência nos painéis solares, 10 a 12 anos nos inversores e microinversores, e 5 anos de garantia total na instalação de engenharia com emissão de ART/CREA.",
  },
  {
    q: "A ESOL Energy cuida da homologação na concessionária de energia?",
    a: "Sim, cuidamos de 100% da burocracia! Desde o projeto executivo de engenharia, ART no CREA, solicitação de acesso, vistoria e troca do medidor bidirecional junto à sua concessionária (CEMIG, CPFL, Enel, Neoenergia, etc.).",
  },
];

export const Route = createFileRoute("/")({
  loader: async () => ({}),
  head: () => ({
    meta: [
      { title: "ESOL Energy — Engenharia Fotovoltaica Premium & Soluções em Energia" },
      {
        name: "description",
        content:
          "Reduza sua conta de luz em até 95% com a ESOL Energy. Projetos residenciais, comerciais, industriais e rurais com 25 anos de garantia e homologação inclusa.",
      },
      { property: "og:title", content: "ESOL Energy — Deixe o Sol Trabalhar Por Você" },
      {
        property: "og:description",
        content: "Simule sua economia solar em 30 segundos. Soluções fotovoltaicas de alto padrão com engenharia própria.",
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

type Tipo = "residencial" | "comercial" | "industrial" | "rural";

interface BillCtx {
  bill: number;
  setBill: (n: number) => void;
  tipo: Tipo;
  setTipo: (t: Tipo) => void;
  estado: string;
  setEstado: (e: string) => void;
}

const BillContext = createContext<BillCtx | null>(null);
const useBill = () => {
  const ctx = useContext(BillContext);
  if (!ctx) throw new Error("useBill outside provider");
  return ctx;
};

function LandingPage() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [bill, setBill] = useState(850);
  const [tipo, setTipo] = useState<Tipo>("residencial");
  const [estado, setEstado] = useState("SP");

  return (
    <BillContext.Provider value={{ bill, setBill, tipo, setTipo, estado, setEstado }}>
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
        {/* Modern Ambient Glow Matrix */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] right-10 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[180px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
        </div>

        <div className="relative z-10">
          <Navbar onOpenTracking={() => setIsTrackingOpen(true)} />
          <main>
            <HeroSection />
            <LiveMetricsBar />
            <InteractiveSimulatorSection />
            <SolutionsGridSection />
            <EngineeringProcessSection />
            <ComparativeSection />
            <FAQSection />
            <FinalCTASection />
          </main>
          <FooterSection />
          <FloatingWhatsAppButton />
          <AcompanharModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
        </div>
      </div>
    </BillContext.Provider>
  );
}

/* ============================================================================
   NAVBAR (Glassmorphism & High-Fidelity Branding)
============================================================================ */
function Navbar({ onOpenTracking }: { onOpenTracking: () => void }) {
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
          ? "bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <EsolLogoPrimary className="h-9 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
        </a>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#simulador" className="hover:text-amber-400 transition-colors">
            Simulador Solar
          </a>
          <a href="#solucoes" className="hover:text-amber-400 transition-colors">
            Soluções
          </a>
          <a href="#engenharia" className="hover:text-amber-400 transition-colors">
            Engenharia EPC
          </a>
          <a href="#comparativo" className="hover:text-amber-400 transition-colors">
            Comparativo
          </a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTracking}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 backdrop-blur px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all"
          >
            <Search className="size-3.5 text-amber-400" />
            Acompanhar Projeto
          </button>

          <a
            href="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-amber-500 transition-all transform active:scale-95"
          >
            <Lock className="size-3.5" />
            <span>Portal de Acesso</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   HERO SECTION (Ultra-Modern Dark Solar Cockpit)
============================================================================ */
function HeroSection() {
  const { setBill } = useBill();
  const [inputValue, setInputValue] = useState("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(inputValue.replace(/\D/g, ""));
    if (num >= 100) setBill(Math.min(num, 150000));
    const target = document.getElementById("simulador");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Quick Lead Form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Live Badge */}
            <div className="inline-flex self-start items-center gap-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span>LÍDER EM ENGENHARIA FOTOVOLTAICA & GD — 25 ANOS DE GARANTIA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] text-balance">
              Deixe o Sol Gerar Sua{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Independência Financeira
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl text-pretty">
              Reduza sua conta de luz em até <strong className="text-amber-400 font-bold">95%</strong> com sistemas
              fotovoltaicos de engenharia própria da <span className="text-white font-semibold">ESOL Energy</span>. Projeto, homologação e instalação completa com tecnologia de alta eficiência.
            </p>

            {/* Quick Estimator Card */}
            <div className="mt-8 p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl max-w-xl">
              <form onSubmit={handleCalculate} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 flex items-center px-4 py-3 bg-slate-950/80 rounded-xl border border-slate-800 focus-within:border-amber-500/60 transition-all">
                  <span className="text-slate-400 font-bold mr-2 text-sm">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Sua conta mensal (ex: 850)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-transparent text-white font-semibold placeholder:text-slate-500 outline-none text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>Calcular Economia</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  Simulação gratuita instantânea
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-amber-400" />
                  Sem compromisso
                </span>
              </div>
            </div>

            {/* Social Trust Metrics */}
            <div className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-slate-800/80">
              <div>
                <p className="text-2xl font-extrabold text-white">+1.200</p>
                <p className="text-xs text-slate-400">Projetos Instalados</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <p className="text-2xl font-extrabold text-amber-400">R$ 48M+</p>
                <p className="text-xs text-slate-400">Economia Gerada aos Clientes</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <p className="text-2xl font-extrabold text-white">25 Anos</p>
                <p className="text-xs text-slate-400">Garantia de Eficiência</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Modern Solar Dashboard Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-sky-500 opacity-20 blur-xl animate-pulse" />

              <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-2xl shadow-2xl">
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      <Zap className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Sistema Solar Fotovoltaico</h4>
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Geração Ativa em Tempo Real
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">25 kWp</span>
                </div>

                {/* Dashboard Main Visual Hero House */}
                <div className="mt-4 relative rounded-2xl overflow-hidden aspect-[16/10] border border-slate-800">
                  <img
                    src={heroHouse}
                    alt="Residência de alto padrão com placas solares ESOL Energy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Geração Estimada / Mês</p>
                      <p className="text-base font-extrabold text-amber-400">2.450 kWh / mês</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Economia Acumulada</p>
                      <p className="text-base font-extrabold text-emerald-400">R$ 2.327 / mês</p>
                    </div>
                  </div>
                </div>

                {/* Micro Stats Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Payback Previsto</p>
                    <p className="text-lg font-black text-white">3,2 Anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Redução na Fatura</p>
                    <p className="text-lg font-black text-emerald-400">- 94,8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   LIVE METRICS STRIP
============================================================================ */
function LiveMetricsBar() {
  return (
    <section className="relative py-8 bg-slate-950/90 border-y border-slate-800/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <p className="text-3xl font-black text-amber-400">95%</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Redução Máxima na Fatura</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-black text-white">25 Anos</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Garantia de Painel</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-black text-emerald-400">84x</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Financiamento Facilitado</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-black text-white">100%</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Homologação Inclusa</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   INTERACTIVE SIMULATOR SECTION (The Crown Jewel)
============================================================================ */
function InteractiveSimulatorSection() {
  const { bill, setBill, tipo, setTipo, estado, setEstado } = useBill();
  const [params] = useState({
    hsp: 5.2,
    tarifa: 0.95,
    perdas: 0.2,
    inflacao: 0.08,
  });

  const hsp = hspForEstado(estado) || params.hsp;

  // Calculos de Engenharia Solar
  const geracaoNecessariaKwh = bill / params.tarifa;
  const potenciaKwp = geracaoNecessariaKwh / (30 * hsp * (1 - params.perdas));
  const numModulos = Math.ceil((potenciaKwp * 1000) / 550);
  const economiaAnual = bill * 0.92 * 12;
  const economia25Anos = Array.from({ length: 25 }).reduce<number>((acc, _, i) => {
    return acc + economiaAnual * Math.pow(1 + params.inflacao, i);
  }, 0);

  const investimentoEstimado = potenciaKwp * 4100;
  const paybackAnos = (investimentoEstimado / economiaAnual).toFixed(1);

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent(
      `Olá ESOL Energy! Fiz a simulação no site:\n- Conta Mensal: R$ ${bill}\n- Estado: ${estado}\n- Tipo: ${tipo}\n- Potência Estimada: ${potenciaKwp.toFixed(2)} kWp\n- Economia Estimada em 25 Anos: ${BRL.format(economia25Anos)}\nGostaria de receber uma proposta comercial oficial com projeto de engenharia!`
    );
    window.open(`https://wa.me/5531999999999?text=${text}`, "_blank");
  };

  return (
    <section id="simulador" className="relative py-24 bg-[#030712]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            SIMULADOR SOLAR INTELIGENTE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            Calcule Sua Economia em{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              30 Segundos
            </span>
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Ajuste o valor da sua conta de luz e descubra o tamanho ideal do seu sistema solar e o retorno do investimento.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            {/* Type Selector Tabs */}
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-8">
              {(
                [
                  { id: "residencial", label: "Residencial", icon: Home },
                  { id: "comercial", label: "Comercial", icon: Building2 },
                  { id: "industrial", label: "Industrial", icon: Factory },
                  { id: "rural", label: "Rural", icon: Tractor },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const active = tipo === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTipo(t.id)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bill Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-300">Valor da Fatura Mensal</label>
                <span className="text-2xl font-black text-amber-400">{BRL.format(bill)}</span>
              </div>
              <input
                type="range"
                min={200}
                max={50000}
                step={100}
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>R$ 200</span>
                <span>R$ 25.000</span>
                <span>R$ 50.000+</span>
              </div>
            </div>

            {/* UF Selector */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-300 mb-2">Estado / Região (Radiação Solar)</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-amber-500 transition-all text-sm"
              >
                {["SP", "MG", "RJ", "ES", "PR", "SC", "RS", "BA", "GO", "DF", "CE", "PE", "MT", "MS"].map((uf) => (
                  <option key={uf} value={uf}>
                    {uf} — Radiação estimada: {hspForEstado(uf) || 5.0} kWh/m²/dia
                  </option>
                ))}
              </select>
            </div>

            {/* WhatsApp Direct CTA */}
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base py-4 shadow-xl shadow-emerald-500/20 transition-all transform active:scale-98 uppercase tracking-wider"
            >
              <MessageCircle className="size-5" />
              <span>Receber Proposta Oficial no WhatsApp</span>
            </button>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="size-5 text-amber-400" />
              Resultado da Sua Simulação
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Economia em 25 Anos</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{BRL.format(economia25Anos)}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase">
                  Proteção Inflacionária
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase">Potência do Sistema</p>
                  <p className="text-xl font-black text-white mt-1">{potenciaKwp.toFixed(2)} kWp</p>
                  <p className="text-[11px] text-slate-500 mt-1">Aprox. {numModulos} painéis solares 550W</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase">Payback Estimado</p>
                  <p className="text-xl font-black text-amber-400 mt-1">{paybackAnos} Anos</p>
                  <p className="text-[11px] text-slate-500 mt-1">Retorno de 100% do investimento</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Redução Estimada na Fatura</p>
                  <p className="text-xl font-black text-white mt-1">De {BRL.format(bill)} para ~{BRL.format(bill * 0.08)}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400">- 92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   SOLUTIONS GRID (Residencial, Comercial, Industrial, Agronegócio)
============================================================================ */
function SolutionsGridSection() {
  const solutions = [
    {
      title: "Energia Solar Residencial",
      desc: "Sistemas para casas e condomínios. Proteja sua família dos aumentos contínuos das tarifas de luz com equipamentos de estética impecável.",
      img: portfolioResidential,
      tag: "Residencial",
      stats: "Economia de até 95%",
    },
    {
      title: "Energia Solar Comercial",
      desc: "Transforme o custo fixo de energia do seu comércio ou escritório em lucro líquido acumulado e sustentabilidade de marca.",
      img: portfolioCommercial,
      tag: "Comercial",
      stats: "Payback em 3 Anos",
    },
    {
      title: "Projetos Industriais & Usinas",
      desc: "Soluções de alta voltagem para indústrias, fábricas e galpões. Engenharia especializada em grande escala e subestações.",
      img: portfolioIndustrial,
      tag: "Industrial",
      stats: "Alta Rentabilidade",
    },
    {
      title: "Agronegócio & Fazendas",
      desc: "Independência energética para irrigadores, secadores de grãos e estruturas rurais. Isenção fiscal e linhas de crédito agro.",
      img: portfolioRural,
      tag: "Agro",
      stats: "Linhas Agro 84x",
    },
  ];

  return (
    <section id="solucoes" className="py-24 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            SOLUÇÕES CUSTOMIZADAS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            Engenharia Solar Para Cada{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Necessidade
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((item, index) => (
            <div
              key={index}
              className="group rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-slate-900/90 text-amber-400 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                  {item.tag}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{item.stats}</span>
                  <a
                    href="#simulador"
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Simular <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   ENGINEERING PROCESS (Passo a Passo Transparente)
============================================================================ */
function EngineeringProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Simulação & Estudo Técnico",
      desc: "Analisamos sua conta de luz, tipo de telhado e irradiação solar da sua região para criar o projeto ideal.",
    },
    {
      num: "02",
      title: "Engenharia & Homologação",
      desc: "Nossos engenheiros desenvolvem o projeto executivo e emitem a ART no CREA, cuidando de 100% da burocracia na concessionária.",
    },
    {
      num: "03",
      title: "Instalação Ágil & Segura",
      desc: "Equipe técnica própria instala os módulos fotovoltaicos e inversores seguindo rígidos padrões de segurança NBR.",
    },
    {
      num: "04",
      title: "Ativação & Monitoramento PWA",
      desc: "Troca do medidor bidirecional e ativação da usina. Você acompanha a geração de energia em tempo real pelo celular.",
    },
  ];

  return (
    <section id="engenharia" className="py-24 bg-[#030712] border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            PROCESSO DE EXCELÊNCIA
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            Do Projeto à Ativação Sem Burocracia
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-4xl font-black text-amber-500/20 font-mono">{s.num}</span>
              <h3 className="text-lg font-bold text-white mt-4">{s.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   COMPARATIVE SECTION (Geração Distribuída vs Concessionária Tradicional)
============================================================================ */
function ComparativeSection() {
  return (
    <section id="comparativo" className="py-24 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            POR QUE MUDAR AGORA?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            ESOL Energy vs. Concessionária Tradicional
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Concessionaria Tradicional */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-red-500/20">
            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <X className="size-5" />
              Concessionária Tradicional (Sem Solar)
            </h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">✕</span>
                Aumentos anuais contínuos de tarifas acima da inflação.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">✕</span>
                Pagamento vitalício sem acúmulo de patrimônio.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">✕</span>
                Vulnerabilidade a bandeiras tarifárias vermelhas e amarelas.
              </li>
            </ul>
          </div>

          {/* ESOL Energy */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 relative">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              Com Sistema Solar ESOL Energy
            </h3>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                Redução imediata de até 95% na conta de luz mensal.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                Investimento que se paga em 3 a 5 anos e gera lucro por 25 anos.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                Valorização imediata do imóvel em até 10% a 15%.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   FAQ ACCORDION SECTION
============================================================================ */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-[#030712] border-t border-slate-800/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            DÚVIDAS FREQUENTES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
            Perguntas & Respostas Frequentes
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
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
   FINAL CTA SECTION
============================================================================ */
function FinalCTASection() {
  return (
    <section id="orcamento" className="py-24 bg-gradient-to-b from-slate-950 to-[#030712] relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="p-10 sm:p-14 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Pronto Para Economizar Até{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              95% na Sua Conta?
            </span>
          </h2>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Solicite uma proposta técnica gratuita de engenharia personalizada para sua casa ou empresa.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5531999999999?text=Ol%C3%A1%20ESOL%20Energy!%20Gostaria%20de%20receber%20um%20or%C3%A7amento%20gr%C3%A1tis%20de%20energia%20solar."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-extrabold text-slate-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-amber-500 transition-all uppercase tracking-wider"
            >
              <MessageCircle className="size-5" />
              <span>Solicitar Orçamento Grátis</span>
            </a>
            <a
              href="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 border border-slate-800 px-8 py-4 text-base font-bold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <Lock className="size-4" />
              <span>Área do Consultor</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   FOOTER SECTION
============================================================================ */
function FooterSection() {
  return (
    <footer className="bg-[#02050e] border-t border-slate-900 py-12 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <EsolLogoNegative className="h-8 w-auto" />
          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a href="#simulador" className="hover:text-amber-400">Simulador</a>
            <a href="#solucoes" className="hover:text-amber-400">Soluções</a>
            <a href="/auth" className="hover:text-amber-400">Portal de Acesso</a>
            <a href="/app" className="hover:text-amber-400">App do Consultor</a>
            <a href="/admin" className="hover:text-amber-400">Painel Admin</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} ESOL Energy Ltda. Todos os direitos reservados. Projetos registrados no CREA.</p>
          <p className="text-slate-500">Desenvolvido com tecnologia de alta performance.</p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   FLOATING WHATSAPP BUTTON
============================================================================ */
function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/5531999999999?text=Ol%C3%A1%20ESOL%20Energy!%20Vim%20pelo%20site%20e%20gostaria%20de%20tirar%20d%C3%BAvidas."
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
   ACOMPANHAR PROJETO MODAL
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

        <h3 className="text-xl font-bold text-white mb-2">Acompanhar Meu Projeto</h3>
        <p className="text-xs text-slate-400 mb-6">
          Digite seu CPF/CNPJ ou o código do seu orçamento para rastrear a homologação em tempo real.
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
            placeholder="Digite seu CPF, CNPJ ou Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-amber-500 text-sm"
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
          >
            Buscar Projeto
          </button>
        </form>
      </div>
    </div>
  );
}
