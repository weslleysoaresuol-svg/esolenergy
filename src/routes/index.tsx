import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/esol-logo.png";
import portfolioResidential from "@/assets/portfolio-residential.jpg";
import portfolioCommercial from "@/assets/portfolio-commercial.jpg";
import portfolioIndustrial from "@/assets/portfolio-industrial.jpg";
import portfolioRural from "@/assets/portfolio-rural.jpg";
import { Loader2, Zap, Sun, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ESOL Energy — Reduza sua conta de luz em até 95% com energia solar" },
      {
        name: "description",
        content:
          "ESOL Energy: engenharia solar fotovoltaica com simulador inteligente. Calcule sua economia em 30 segundos e receba uma proposta gratuita.",
      },
      { property: "og:title", content: "ESOL Energy — Deixe o sol trabalhar por você" },
      {
        property: "og:description",
        content:
          "Sistemas fotovoltaicos premium com financiamento facilitado. Simule e descubra quanto você pode economizar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/* ============================ SHARED BILL CONTEXT ============================ */
type Tipo = "residencial" | "comercial" | "industrial";
interface BillCtx {
  bill: number;
  setBill: (n: number) => void;
  tipo: Tipo;
  setTipo: (t: Tipo) => void;
}
const BillContext = createContext<BillCtx | null>(null);
const useBill = () => {
  const ctx = useContext(BillContext);
  if (!ctx) throw new Error("useBill outside provider");
  return ctx;
};

/* ============================ PARAMS HOOK ============================ */
interface LandingParams {
  hsp_norte: number; hsp_nordeste: number; hsp_centro_oeste: number;
  hsp_sudeste: number; hsp_sul: number;
  preco_wp_residencial_pequeno: number; preco_wp_residencial_grande: number;
  preco_wp_comercial_pequeno: number; preco_wp_comercial_grande: number;
  preco_wp_industrial: number;
  tarifa_kwh_default: number; perdas_sistema: number;
  inflacao_energetica: number; vida_util_anos: number; potencia_modulo_w: number;
}
const DEFAULT_PARAMS: LandingParams = {
  hsp_norte: 4.8, hsp_nordeste: 5.5, hsp_centro_oeste: 5.3, hsp_sudeste: 5.0, hsp_sul: 4.6,
  preco_wp_residencial_pequeno: 4.5, preco_wp_residencial_grande: 4.1,
  preco_wp_comercial_pequeno: 3.7, preco_wp_comercial_grande: 3.3,
  preco_wp_industrial: 2.9,
  tarifa_kwh_default: 0.95, perdas_sistema: 0.2,
  inflacao_energetica: 0.08, vida_util_anos: 25, potencia_modulo_w: 555,
};
function useLandingParams(): LandingParams {
  const [p, setP] = useState<LandingParams>(DEFAULT_PARAMS);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase.rpc as any)("get_parametros_landing");
        if (data) setP({ ...DEFAULT_PARAMS, ...data });
      } catch { /* keep defaults */ }
    })();
  }, []);
  return p;
}

function Landing() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [bill, setBill] = useState(800);
  const [tipo, setTipo] = useState<Tipo>("residencial");
  return (
    <BillContext.Provider value={{ bill, setBill, tipo, setTipo }}>
      <div className="min-h-screen bg-paper text-ink antialiased selection:bg-sun selection:text-navy overflow-x-hidden">
        <Nav onOpenTracking={() => setIsTrackingOpen(true)} />
        <FloatingOrcamento />
        <Hero />
        <LogosStrip />
        <MetricsBar />
        <Simulator />
        <Solutions />
        <Process />
        <FAQ />
        <FinalCTA />
        <Footer />
        <FloatingWhatsApp />
        <AcompanharModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
      </div>
    </BillContext.Provider>
  );
}

/* ============================ NAV ============================ */
function Nav({ onOpenTracking }: { onOpenTracking: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="ESOL Energy — Deixe o sol trabalhar por você" className="h-10 sm:h-12 w-auto shrink-0" width={137} height={60} />
        </a>
        <div className="hidden xl:flex items-center gap-8 text-sm font-medium text-navy/75 absolute left-1/2 -translate-x-1/2">
          <a href="#simulador" className="hover:text-sun-deep transition-colors">Simulador</a>
          <a href="#solucoes" className="hover:text-sun-deep transition-colors">Soluções</a>
          <a href="#processo" className="hover:text-sun-deep transition-colors">Processo</a>
          <a href="#faq" className="hover:text-sun-deep transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenTracking}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white/70 backdrop-blur px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-navy hover:bg-navy hover:text-white hover:border-navy transition-all"
          >
            Acompanhar
          </button>
          <a
            href="/auth"
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white/70 backdrop-blur px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-navy hover:bg-navy hover:text-white hover:border-navy transition-all"
          >
            Acesso
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ============================ FLOATING ORÇAMENTO ============================ */
function FloatingOrcamento() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const cta = document.getElementById("orcamento");
      if (!cta) return;
      const rect = cta.getBoundingClientRect();
      setHidden(rect.top < window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <a
      href="#orcamento"
      aria-label="Pedir orçamento grátis"
      className={`fixed z-40 right-4 sm:right-6 top-[72px] sm:top-[88px] transition-all duration-500 ${
        hidden ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100 animate-float-soft"
      }`}
    >
      <span className="relative inline-flex items-center gap-2 rounded-full bg-sun text-navy px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-glow cta-halo overflow-hidden">
        <Sparkles className="size-4" />
        Orçamento grátis
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[cta-shine_2.8s_ease-in-out_infinite]" />
        </span>
      </span>
    </a>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  const { setBill } = useBill();
  const [val, setVal] = useState("");
  return (
    <section id="top" className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[720px] h-[720px] rounded-full bg-sun/30 blur-3xl animate-sun-pulse" />
      <div className="pointer-events-none absolute top-40 -left-32 w-[480px] h-[480px] rounded-full bg-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, var(--navy) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }} />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-sun/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-navy animate-fade-up">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sun-deep opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sun-deep" />
          </span>
          Engenharia solar de alta performance
        </div>

        <h1 className="mt-7 font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-extrabold leading-[1.0] text-navy text-balance animate-fade-up [animation-delay:60ms]">
          Deixe o sol{" "}
          <span className="relative inline-block">
            <span className="relative z-10">trabalhar</span>
            <span className="absolute inset-x-0 bottom-1 sm:bottom-2 h-3 sm:h-5 bg-sun/70 -z-0 rounded-sm" />
          </span>{" "}
          por você.
        </h1>

        <p className="mt-7 max-w-2xl mx-auto text-base sm:text-lg text-ink/70 leading-relaxed text-pretty animate-fade-up [animation-delay:140ms]">
          Reduza sua conta de luz em até <strong className="text-navy">95%</strong> com sistemas
          fotovoltaicos premium. Engenharia, instalação e 25 anos de garantia.
        </p>

        {/* mini lead form — calcula e propaga o valor para o simulador */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(val.replace(/\D/g, ""));
            if (n >= 100) setBill(Math.min(n, 50000));
            requestAnimationFrame(() => {
              document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
          className="mt-9 mx-auto flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-2xl sm:rounded-full shadow-deep border border-border max-w-xl animate-fade-up [animation-delay:220ms]"
        >
          <div className="flex items-center gap-3 flex-1 px-4 sm:px-5">
            <span className="text-ink/40 font-bold text-lg">R$</span>
            <input
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="Quanto vem na sua conta de luz?"
              className="w-full py-3 bg-transparent outline-none text-navy font-medium placeholder:text-ink/30"
              aria-label="Valor da conta de luz"
            />
          </div>
          <button
            type="submit"
            className="relative group inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-sun px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all whitespace-nowrap shadow-glow cta-halo overflow-hidden"
          >
            <span className="relative z-10">Calcular economia →</span>
            <span aria-hidden className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[cta-shine_2.8s_ease-in-out_infinite]" />
          </button>
        </form>

        <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-ink/60 animate-fade-up [animation-delay:300ms]">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-sun-deep" /> 25 anos de garantia</span>
          <span className="inline-flex items-center gap-1.5"><Zap className="size-4 text-sun-deep" /> Equipamentos Tier 1</span>
          <span className="inline-flex items-center gap-1.5"><TrendingUp className="size-4 text-sun-deep" /> Payback médio 3–5 anos</span>
        </div>

        {/* abstract sun visual */}
        <div className="relative mt-16 sm:mt-20 mx-auto max-w-3xl animate-fade-up [animation-delay:380ms]">
          <div className="relative aspect-[16/6] rounded-[40px] bg-gradient-to-br from-navy via-navy-deep to-navy overflow-hidden border border-navy/20">
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-sun/40 blur-3xl animate-sun-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center">
              <Sun className="size-20 sm:size-28 text-sun drop-shadow-[0_0_40px_rgba(255,193,7,0.6)]" strokeWidth={1.2} />
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 text-white/90">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sun">Sua usina solar</div>
                <div className="font-display font-extrabold text-xl sm:text-2xl">Independência energética em 30 dias</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Geração 25 anos</div>
                <div className="font-display font-extrabold text-2xl text-sun">−95% conta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ TRUST LOGOS ============================ */
function LogosStrip() {
  const items = [
    "ABSOLAR Associada",
    "INMETRO Certificada",
    "Garantia 25 anos",
    "Tecnologia Tier 1",
    "ANEEL Homologação",
    "ISO 9001",
  ];
  const loop = [...items, ...items];
  return (
    <section className="border-y border-border bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-6 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {loop.map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-semibold text-ink/50">
              <span className="size-1.5 rounded-full bg-sun" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ METRICS ============================ */
function MetricsBar() {
  const metrics = [
    { v: "95%", l: "Redução média na conta" },
    { v: "25a", l: "Garantia dos painéis" },
    { v: "Tier 1", l: "Equipamentos premium" },
    { v: "3–5a", l: "Retorno do investimento" },
  ];
  return (
    <section className="bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {metrics.map((m) => (
          <div key={m.l} className="flex flex-col">
            <div className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sun">{m.v}</div>
            <div className="mt-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-white/55">
              {m.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================ SIMULADOR ============================ */
const DEFAULT_FINANCEIRAS = [
  { id: "1", nome: "Solfácil", taxa_juros_mes: 1.29, prazo_maximo_meses: 120, taxa_aprovacao_media: 85, ativo: true },
  { id: "2", nome: "BV Financeira", taxa_juros_mes: 1.39, prazo_maximo_meses: 84, taxa_aprovacao_media: 80, ativo: true },
  { id: "3", nome: "Santander", taxa_juros_mes: 1.49, prazo_maximo_meses: 96, taxa_aprovacao_media: 75, ativo: true },
  { id: "4", nome: "Sicredi", taxa_juros_mes: 1.09, prazo_maximo_meses: 120, taxa_aprovacao_media: 70, ativo: true },
  { id: "5", nome: "Banco do Brasil", taxa_juros_mes: 0.95, prazo_maximo_meses: 96, taxa_aprovacao_media: 65, ativo: true },
];

function Simulator() {
  const { bill, setBill, tipo, setTipo } = useBill();
  const params = useLandingParams();
  const [mode, setMode] = useState<"economia" | "financiamento">("economia");
  const [financeiras, setFinanceiras] = useState<any[]>(DEFAULT_FINANCEIRAS);
  const [selectedBankId, setSelectedBankId] = useState("1");
  const [selectedTerm, setSelectedTerm] = useState(60);

  const sectionRef = useRef<HTMLDivElement>(null);
  const billHighlightRef = useRef<HTMLDivElement>(null);
  const lastBill = useRef(bill);
  useEffect(() => {
    if (bill !== lastBill.current) {
      lastBill.current = bill;
      const el = billHighlightRef.current;
      if (el) {
        el.classList.remove("ring-4", "ring-sun");
        // force reflow then re-add
        void el.offsetWidth;
        el.classList.add("ring-4", "ring-sun");
        setTimeout(() => el.classList.remove("ring-4", "ring-sun"), 1400);
      }
    }
  }, [bill]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase.from("financeiras_solar" as any).select("*").eq("ativo", true) as any);
        if (data && data.length > 0) {
          setFinanceiras(data);
          setSelectedBankId(data[0].id);
        }
      } catch { /* keep defaults */ }
    })();
  }, []);

  const selectedBank = useMemo(
    () => financeiras.find((f) => f.id === selectedBankId) || financeiras[0] || DEFAULT_FINANCEIRAS[0],
    [financeiras, selectedBankId],
  );

  // HSP médio nacional (poderá ser ajustado por estado em proposta real)
  const hspMedio = useMemo(() => {
    return (params.hsp_norte + params.hsp_nordeste + params.hsp_centro_oeste + params.hsp_sudeste + params.hsp_sul) / 5;
  }, [params]);

  const result = useMemo(() => {
    const tarifa = params.tarifa_kwh_default;
    const eficiencia = 1 - params.perdas_sistema;
    const consumoKwh = bill / tarifa;
    const consumoDiario = consumoKwh / 30;
    const kwpIdeal = consumoDiario / (hspMedio * eficiencia);
    const qtdModulos = Math.max(2, Math.ceil((kwpIdeal * 1000) / params.potencia_modulo_w));
    const systemKwp = +(qtdModulos * params.potencia_modulo_w / 1000).toFixed(2);

    const geracaoMensal = systemKwp * hspMedio * 30 * eficiencia;
    const reduction = tipo === "industrial" ? 0.92 : tipo === "comercial" ? 0.93 : 0.95;
    const monthly = Math.round(Math.min(bill * reduction, geracaoMensal * tarifa));
    const yearly = monthly * 12;

    let total25 = 0;
    for (let ano = 0; ano < params.vida_util_anos; ano++) {
      total25 += yearly * Math.pow(1 + params.inflacao_energetica, ano);
    }

    const precoWp =
      tipo === "industrial" ? params.preco_wp_industrial :
      tipo === "comercial" ? (systemKwp >= 30 ? params.preco_wp_comercial_grande : params.preco_wp_comercial_pequeno) :
      (systemKwp >= 5 ? params.preco_wp_residencial_grande : params.preco_wp_residencial_pequeno);
    const precoTotal = +(systemKwp * 1000 * precoWp).toFixed(0);
    const payback = monthly > 0 ? +(precoTotal / monthly / 12).toFixed(1) : 0;

    return { monthly, yearly, total25: Math.round(total25), systemKwp, payback, precoTotal };
  }, [bill, tipo, params, hspMedio]);

  const financeParcela = useMemo(() => {
    if (!selectedBank) return 0;
    const rate = selectedBank.taxa_juros_mes / 100;
    const n = Math.min(selectedTerm, selectedBank.prazo_maximo_meses);
    const pmt = (result.precoTotal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    return Math.round(pmt);
  }, [result.precoTotal, selectedBank, selectedTerm]);

  const parcelaMenor = financeParcela > 0 && financeParcela < bill;

  return (
    <section id="simulador" ref={sectionRef} className="py-20 sm:py-28 px-5 sm:px-6 bg-paper relative">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
              Simulador inteligente
            </span>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-navy leading-tight text-balance">
              Veja sua economia em <span className="text-sun-deep">30 segundos</span>.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-ink/70 max-w-md text-pretty">
              Cálculo baseado em irradiação solar real e nos preços de engenharia atualizados da ESOL.
              Ajuste sua conta, escolha o perfil e descubra o tamanho ideal do sistema.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Dimensionamento técnico com HSP regional",
                "Preço por Wp atualizado pelo nosso motor comercial",
                "Compare economia ou parcela menor que a conta atual",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-ink/75">
                  <span className="mt-1 grid place-items-center size-5 rounded-full bg-sun text-navy text-[11px] font-extrabold shrink-0">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-6 sm:p-8 lg:p-10 shadow-deep border border-border">
            <div className="space-y-6 sm:space-y-7">
              {/* Modo */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
                <button
                  onClick={() => setMode("economia")}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    mode === "economia" ? "bg-navy text-white shadow-sm" : "text-ink/50 hover:text-navy"
                  }`}
                >
                  Economia gerada
                </button>
                <button
                  onClick={() => setMode("financiamento")}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    mode === "financiamento" ? "bg-navy text-white shadow-sm" : "text-ink/50 hover:text-navy"
                  }`}
                >
                  Financiamento solar
                </button>
              </div>

              {/* Tipo */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-ink/50">
                  Tipo de imóvel
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2 p-1 bg-secondary rounded-xl">
                  {(["residencial", "comercial", "industrial"] as Tipo[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipo(t)}
                      className={`py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                        tipo === t ? "bg-white text-navy shadow-sm" : "text-ink/50 hover:text-navy"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conta mensal — preenchida automaticamente pelo hero */}
              <div ref={billHighlightRef} className="rounded-2xl p-3 -m-3 transition-all duration-500">
                <div className="flex items-baseline justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-ink/50">
                    Conta mensal
                  </label>
                  <span className="font-display text-2xl sm:text-3xl font-extrabold text-navy">
                    {BRL.format(bill)}
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={10000}
                  step={50}
                  value={Math.min(Math.max(bill, 200), 10000)}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="mt-3 w-full accent-sun cursor-pointer"
                  aria-label="Valor da conta de luz"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink/40">
                  <span>R$ 200</span>
                  <span>R$ 10.000</span>
                </div>
              </div>

              {mode === "economia" ? (
                <div className="rounded-2xl bg-navy text-white p-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sun/20 blur-2xl" />
                  <div className="relative grid grid-cols-2 gap-5">
                    <Stat label="Economia anual" value={BRL.format(result.yearly)} accent />
                    <Stat label={`Em ${params.vida_util_anos} anos`} value={BRL.format(result.total25)} />
                    <Stat label="Sistema ideal" value={`${result.systemKwp} kWp`} />
                    <Stat label="Payback estimado" value={`${result.payback} anos`} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/50 block">Financeira</label>
                      <select
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                        className="mt-1.5 w-full bg-secondary border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy outline-none"
                      >
                        {financeiras.map((fin) => (
                          <option key={fin.id} value={fin.id}>{fin.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/50 block">Prazo (meses)</label>
                      <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(Number(e.target.value))}
                        className="mt-1.5 w-full bg-secondary border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy outline-none"
                      >
                        {[24, 36, 48, 60, 72, 84, 96, 120]
                          .filter((t) => t <= (selectedBank?.prazo_maximo_meses || 120))
                          .map((t) => (
                            <option key={t} value={t}>{t} parcelas</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-navy text-white p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sun/20 blur-2xl" />
                    <div className="relative space-y-4">
                      <div className="flex justify-between items-center gap-3 flex-wrap">
                        <Stat label="Parcela estimada" value={`${BRL.format(financeParcela)}/mês`} accent />
                        {parcelaMenor && (
                          <span className="text-[9px] font-extrabold uppercase bg-sun text-navy px-2 py-1 rounded-md tracking-wider">
                            ⚡ Menor que sua conta
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                        <Stat label="Investimento" value={BRL.format(result.precoTotal)} />
                        <Stat label="Aprovação média" value={`${selectedBank?.taxa_aprovacao_media || 80}%`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <a
                href="#orcamento"
                className="relative block w-full text-center rounded-xl bg-sun py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all shadow-glow cta-halo overflow-hidden"
              >
                <span className="relative z-10">Quero garantir essa economia →</span>
                <span aria-hidden className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[cta-shine_2.8s_ease-in-out_infinite]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</div>
      <div className={`mt-1 font-display font-extrabold text-2xl ${accent ? "text-sun" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

/* ============================ SOLUTIONS (única seção com fotos) ============================ */
function Solutions() {
  const items = [
    {
      img: portfolioResidential,
      tag: "Residencial",
      title: "Sua casa livre da inflação energética",
      desc: "Sistemas de 2 a 15 kWp dimensionados para sua família. Conforto sem medo da conta.",
      meta: "A partir de R$ 199/mês",
    },
    {
      img: portfolioCommercial,
      tag: "Comercial",
      title: "Aumente a margem do seu negócio",
      desc: "Transforme custo fixo em ativo. Energia previsível e valorização imediata do imóvel.",
      meta: "Retorno em ~3 anos",
    },
    {
      img: portfolioIndustrial,
      tag: "Industrial",
      title: "Usinas de alta potência",
      desc: "Plantas customizadas com monitoramento e geração distribuída para sua indústria.",
      meta: "Alta tensão A4",
    },
    {
      img: portfolioRural,
      tag: "Rural",
      title: "Independência para o agronegócio",
      desc: "Energia para irrigação, beneficiamento e armazenagem. Linhas Pronaf/BNDES.",
      meta: "Financiamento facilitado",
    },
  ];
  return (
    <section id="solucoes" className="py-20 sm:py-28 px-5 sm:px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
              Soluções sob medida
            </span>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-navy leading-tight text-balance">
              Engenharia solar para cada perfil.
            </h2>
          </div>
          <p className="text-ink/60 max-w-sm text-pretty">
            Do telhado de uma casa a megawatts de potência industrial — projetamos o sistema certo
            para a sua realidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it) => (
            <article
              key={it.tag}
              className="group relative rounded-3xl overflow-hidden border border-border bg-white hover:shadow-deep transition-all duration-500"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={it.img}
                  alt={`Solução ${it.tag} ESOL Energy`}
                  loading="lazy"
                  width={1280}
                  height={800}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
                <span className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy">
                  {it.tag}
                </span>
                <span className="absolute bottom-5 left-5 text-white/85 text-xs font-semibold uppercase tracking-wider">
                  {it.meta}
                </span>
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-navy">{it.title}</h3>
                <p className="mt-3 text-ink/65 text-pretty">{it.desc}</p>
                <a
                  href="#orcamento"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy group-hover:text-sun-deep transition-colors"
                >
                  Quero esta solução
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ PROCESS ============================ */
function Process() {
  const steps = [
    { n: "01", t: "Simulação", d: "Em 30s você vê sua economia estimada." },
    { n: "02", t: "Análise técnica", d: "Engenheiros avaliam telhado via satélite e in loco." },
    { n: "03", t: "Projeto e homologação", d: "Cuidamos de toda a burocracia com a concessionária." },
    { n: "04", t: "Instalação", d: "Equipe própria, equipamentos Tier 1, 25 anos de garantia." },
  ];
  return (
    <section id="processo" className="py-20 sm:py-28 px-5 sm:px-6 bg-paper">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
            Como funciona
          </span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-navy leading-tight text-balance max-w-3xl mx-auto">
            Do interesse à energia limpa, sem dor de cabeça.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-3xl bg-white p-6 sm:p-8 border border-border hover:border-sun hover:shadow-glow transition-all duration-500"
            >
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-sun/30 leading-none">
                {s.n}
              </div>
              <h3 className="mt-4 font-display font-extrabold text-xl text-navy">{s.t}</h3>
              <p className="mt-2 text-sm text-ink/65">{s.d}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-3 text-sun text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */
function FAQ() {
  const qs = [
    { q: "Quanto custa um sistema solar residencial?", a: "Sistemas residenciais começam em torno de R$ 14 mil, com parcelas em até 84x. O valor exato depende do consumo, telhado e região — nosso engenheiro envia proposta gratuita." },
    { q: "Em quanto tempo recupero o investimento?", a: "O payback médio é de 3 a 5 anos. Após esse período, são mais 20 anos de energia praticamente gratuita." },
    { q: "Funciona em dias nublados e à noite?", a: "Sim. O sistema gera mesmo com nuvens (em menor escala) e, à noite, você usa o crédito gerado durante o dia via compensação na rede." },
    { q: "Qual a garantia dos equipamentos?", a: "Painéis com 25 anos de garantia de geração, inversores com 10 anos e instalação com 5 anos. Tudo em contrato." },
    { q: "Vocês cuidam da homologação na concessionária?", a: "Sim. Cuidamos de 100% do processo: projeto, ART, protocolos e vistoria. Você só assina." },
  ];
  return (
    <section id="faq" className="py-20 sm:py-28 px-5 sm:px-6 bg-white">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12 sm:mb-14">
          <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">Dúvidas</span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-navy text-balance">
            Perguntas frequentes.
          </h2>
        </div>
        <div className="space-y-3">
          {qs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-paper border border-border open:shadow-deep open:border-sun/40 transition-all"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 sm:p-6 font-display font-bold text-navy text-base sm:text-lg">
                {item.q}
                <span className="grid place-items-center size-8 rounded-full bg-sun text-navy text-xl font-extrabold shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-ink/70 leading-relaxed -mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FINAL CTA / FORM ============================ */
function FinalCTA() {
  const { bill } = useBill();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
    conta: bill,
  });

  // sincroniza valor da conta com o que o cliente já digitou nas seções anteriores
  useEffect(() => {
    setForm((f) => ({ ...f, conta: bill }));
  }, [bill]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Nome e WhatsApp são obrigatórios");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("clientes").insert({
      nome: form.nome.trim(),
      email: form.email.trim() || null,
      telefone: form.telefone.trim(),
      cep: form.cep.trim() || null,
      observacoes: `Lead do site — conta mensal informada: ${BRL.format(form.conta || 0)}`,
      origem: "landing",
      status: "novo",
      corretor_id: null,
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar. Tente novamente.");
      return;
    }
    toast.success("Recebemos seu pedido!");
    setSent(true);
  };

  return (
    <section id="orcamento" className="py-20 sm:py-28 px-5 sm:px-6 bg-paper">
      <div className="mx-auto max-w-6xl">
        <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden bg-navy text-white shadow-deep">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-sun/30 blur-3xl animate-sun-pulse" />

          <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-12 p-7 sm:p-10 lg:p-16">
            <div>
              <span className="inline-block text-sun font-bold tracking-[0.18em] text-xs uppercase">
                Comece agora
              </span>
              <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight text-balance">
                Transforme seu telhado em uma <span className="text-sun">mina de ouro</span>.
              </h2>
              <p className="mt-5 text-white/70 max-w-md text-pretty">
                Análise técnica gratuita. Sem compromisso. Respondemos em até 15 minutos no horário comercial.
              </p>

              <ul className="mt-7 sm:mt-8 space-y-3.5">
                {[
                  "Engenheiros certificados ABSOLAR",
                  "Equipamentos Tier 1 com 25 anos de garantia",
                  "Financiamento em até 120x sem entrada",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-white/85">
                    <span className="mt-1 grid place-items-center size-5 rounded-full bg-sun text-navy text-[11px] font-extrabold shrink-0">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 sm:p-8 text-ink shadow-2xl">
              {sent ? (
                <div className="text-center py-10">
                  <div className="mx-auto size-16 rounded-full bg-sun grid place-items-center text-navy text-3xl font-extrabold">
                    ✓
                  </div>
                  <h3 className="mt-5 font-display font-extrabold text-2xl text-navy">
                    Recebemos seu pedido!
                  </h3>
                  <p className="mt-2 text-ink/65">
                    Nosso especialista entrará em contato em até 15 minutos.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Nome completo" placeholder="Ex: João Silva" value={form.nome} onChange={(v) => update("nome", v)} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="E-mail" type="email" placeholder="voce@email.com" value={form.email} onChange={(v) => update("email", v)} required={false} />
                    <Field label="WhatsApp" type="tel" placeholder="(11) 99999-9999" value={form.telefone} onChange={(v) => update("telefone", v)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="CEP da instalação" placeholder="00000-000" value={form.cep} onChange={(v) => update("cep", v)} required={false} />
                    <div>
                      <label className="text-[11px] uppercase font-bold tracking-widest text-ink/50">
                        Conta mensal (R$)
                      </label>
                      <input
                        required
                        inputMode="numeric"
                        value={form.conta ? String(form.conta) : ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, conta: Number(e.target.value.replace(/\D/g, "")) || 0 }))
                        }
                        placeholder="Ex: 850"
                        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-navy font-semibold outline-none focus:ring-2 focus:ring-sun transition-all"
                      />
                      <p className="mt-1 text-[10px] text-ink/40">Já preenchemos com o valor do simulador.</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative mt-2 w-full rounded-xl bg-sun py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all shadow-glow disabled:opacity-60 cta-halo overflow-hidden"
                  >
                    <span className="relative z-10">{loading ? "Enviando…" : "Quero economizar agora →"}</span>
                    {!loading && (
                      <span aria-hidden className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[cta-shine_2.8s_ease-in-out_infinite]" />
                    )}
                  </button>
                  <p className="text-[11px] text-ink/40 text-center">
                    Resposta em até 15 minutos · Sem compromisso
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase font-bold tracking-widest text-ink/50">{label}</label>
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-navy outline-none placeholder:text-ink/30 focus:ring-2 focus:ring-sun transition-all"
      />
    </div>
  );
}

/* ============================ FOOTER ============================ */
function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <img src={logo} alt="ESOL Energy — Deixe o sol trabalhar por você" className="h-12 sm:h-14 w-auto brightness-0 invert opacity-90" width={137} height={60} />
          <p className="mt-5 max-w-sm text-white/60 text-sm leading-relaxed">
            Engenharia solar fotovoltaica de alta performance. Deixe o sol trabalhar por você.
          </p>
          <div className="mt-6 flex gap-3">
            {["IG", "in", "FB", "YT"].map((s) => (
              <a
                key={s}
                href="#"
                className="grid place-items-center size-10 rounded-full bg-white/5 hover:bg-sun hover:text-navy text-white/70 text-xs font-bold transition-all"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-sun font-bold mb-4">Empresa</div>
          <ul className="space-y-3 text-sm text-white/70">
            <li><a href="#solucoes" className="hover:text-sun transition-colors">Soluções</a></li>
            <li><a href="#processo" className="hover:text-sun transition-colors">Processo</a></li>
            <li><a href="#simulador" className="hover:text-sun transition-colors">Simulador</a></li>
            <li><a href="#faq" className="hover:text-sun transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-sun font-bold mb-4">Contato</div>
          <ul className="space-y-3 text-sm text-white/70">
            <li>contato@esolenergy.com.br</li>
            <li>(11) 4000-0000</li>
            <li>Atendimento Brasil inteiro</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <div>© {new Date().getFullYear()} ESOL Energy — Todos os direitos reservados.</div>
          <div>Deixe o sol trabalhar por você.</div>
        </div>
      </div>
    </footer>
  );
}

/* ============================ WHATSAPP ============================ */
function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/5511400000000?text=Ol%C3%A1%21%20Quero%20simular%20minha%20economia%20com%20energia%20solar."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 grid place-items-center size-14 rounded-full bg-sun text-navy shadow-glow hover:scale-110 transition-transform animate-float"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
      </svg>
    </a>
  );
}

/* ============================ ACOMPANHAR MODAL ============================ */
function AcompanharModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDoc = doc.replace(/\D/g, "");
    if (!cleanDoc) { toast.error("Digite um CPF ou CNPJ válido."); return; }
    setLoading(true);
    setProject(null);
    setLogs([]);
    setSearched(false);
    try {
      const { data, error } = await (supabase.rpc as any)("consultar_projeto_cliente", { _cpf_cnpj: cleanDoc });
      if (error) throw error;
      const rows = (data as any[]) || [];
      if (rows.length > 0) {
        const found = rows[0];
        setProject(found);
        setLogs(found.recent_logs || []);
      } else {
        toast.error("Nenhum projeto encontrado para este CPF/CNPJ.");
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao consultar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: "novo", label: "Estudo & Contrato", desc: "Análise técnica e assinatura" },
    { key: "homologacao", label: "Homologação", desc: "Parecer de acesso com a concessionária" },
    { key: "entrega", label: "Entrega de Equipamentos", desc: "Separação e envio dos kits" },
    { key: "instalacao", label: "Instalação Física", desc: "Montagem de estrutura e placas" },
    { key: "concluido", label: "Ativação & Conexão", desc: "Troca do medidor e ligação" },
  ];

  const getActiveStepIndex = () => {
    if (!project) return -1;
    const s = project.status;
    if (["novo", "contato", "visita_agendada", "proposta_enviada", "negociacao"].includes(s)) return 0;
    if (["contrato_assinado"].includes(s)) return 1;
    if (s === "instalacao") return 3;
    if (s === "concluido") return 4;
    return 2;
  };
  const activeIndex = getActiveStepIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-deep overflow-hidden border border-border flex flex-col max-h-[90vh]">
        <div className="p-6 bg-navy text-white flex justify-between items-center">
          <div>
            <h3 className="font-display font-extrabold text-xl md:text-2xl">Acompanhar minha instalação</h3>
            <p className="text-xs text-white/60 mt-1">Consulte o status do seu sistema solar</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center font-bold text-sm transition-all">&times;</button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-secondary p-3 rounded-2xl border border-slate-100">
            <input
              type="text"
              placeholder="Digite seu CPF ou CNPJ (apenas números)"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 outline-none text-navy font-semibold placeholder:text-ink/30 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-sun hover:bg-sun-deep text-navy text-xs font-bold uppercase tracking-wider transition-all shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              {loading ? "Buscando..." : "Consultar"}
            </button>
          </form>

          {searched && project && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-secondary rounded-2xl p-5 border border-slate-100 grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-ink/40 tracking-wider">Cliente / Instalação</div>
                  <div className="font-bold text-navy text-base mt-1">{project.nome}</div>
                  <div className="text-xs text-ink/60 mt-1">{project.cidade} - {project.estado}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-[10px] font-bold uppercase text-ink/40 tracking-wider">Potência / Distribuidora</div>
                  <div className="font-bold text-navy text-base mt-1">{project.potencia_kwp} kWp</div>
                  <div className="text-xs text-ink/60 mt-1">{project.concessionaria}</div>
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((s, i) => {
                  const active = i === activeIndex;
                  const done = i < activeIndex;
                  return (
                    <div key={s.key} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      active ? "bg-sun/10 border-sun" : done ? "bg-white border-border" : "bg-white/50 border-border opacity-50"
                    }`}>
                      <div className={`size-9 grid place-items-center rounded-full font-bold text-sm shrink-0 ${
                        active ? "bg-sun text-navy animate-pulse" : done ? "bg-navy text-white" : "bg-secondary text-ink/40"
                      }`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-navy text-sm">{s.label}</div>
                        <div className="text-xs text-ink/60 mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {logs.length > 0 && (
                <div className="border-t border-border pt-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-ink/50 mb-3">Últimas atualizações</div>
                  <ul className="space-y-2">
                    {logs.map((l, i) => (
                      <li key={i} className="text-xs text-ink/70 flex gap-2">
                        <span className="text-sun-deep">•</span>
                        <span>{l.descricao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
