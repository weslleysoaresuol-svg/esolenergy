import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/esol-logo.png";
import heroHouse from "@/assets/hero-house.jpg";
import portfolioResidential from "@/assets/portfolio-residential.jpg";
import portfolioCommercial from "@/assets/portfolio-commercial.jpg";
import portfolioIndustrial from "@/assets/portfolio-industrial.jpg";
import portfolioRural from "@/assets/portfolio-rural.jpg";
import { AlertTriangle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ESOL Energy — Reduza sua conta de luz em até 95% com energia solar" },
      {
        name: "description",
        content:
          "ESOL Energy: engenharia solar de alta performance para residências, comércios, indústrias e agronegócio. Simule sua economia em 30 segundos.",
      },
      { property: "og:title", content: "ESOL Energy — Deixe o sol trabalhar por você" },
      {
        property: "og:description",
        content:
          "Sistemas fotovoltaicos premium com financiamento facilitado. Economize até 95% na conta de luz com tecnologia de ponta.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroHouse },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroHouse },
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

function Landing() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  // Shared bill value: Hero input → Simulator slider
  const [heroBill, setHeroBill] = useState("");
  return (
    <div className="min-h-screen bg-paper text-ink antialiased selection:bg-sun selection:text-navy">
      <Nav onOpenTracking={() => setIsTrackingOpen(true)} />
      <Hero heroBill={heroBill} setHeroBill={setHeroBill} />
      <LogosStrip />
      <MetricsBar />
      <Simulator initialBill={heroBill ? Math.min(5000, Math.max(200, Number(heroBill))) : 800} />
      <Solutions />
      <Process />
      <TrustSignals />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      <FloatingWhatsApp />
      <AcompanharModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
    </div>
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
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="ESOL Energy — Deixe o sol trabalhar por você" className="h-11 md:h-12 w-auto" width={137} height={60} />
        </a>
        <div className="hidden lg:flex items-center gap-9 text-sm font-medium text-navy/75">
          <a href="#simulador" className="hover:text-sun-deep transition-colors">Simulador</a>
          <a href="#solucoes" className="hover:text-sun-deep transition-colors">Soluções</a>
          <a href="#processo" className="hover:text-sun-deep transition-colors">Processo</a>
          <a href="#faq" className="hover:text-sun-deep transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTracking}
            className="inline-flex items-center gap-2 rounded-full border border-navy bg-sun text-navy hover:bg-sun-deep px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
          >
            Acompanhar
          </button>
          <a
            href="/auth"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-all"
          >
            Acesso
          </a>
          <a
            href="#orcamento"
            className="group inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-deep hover:bg-navy-deep transition-all"
          >
            Orçamento grátis
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>

      </div>
    </nav>
  );
}

/* ============================ HERO ============================ */
function Hero({ heroBill, setHeroBill }: { heroBill: string; setHeroBill: (v: string) => void }) {
  return (
    <section id="top" className="relative pt-32 pb-28 overflow-hidden">
      {/* Premium layered glow background */}
      <div className="pointer-events-none absolute -top-32 -right-40 w-[800px] h-[800px] rounded-full bg-sun/25 blur-[120px] animate-sun-pulse" />
      <div className="pointer-events-none absolute top-60 -left-32 w-[500px] h-[500px] rounded-full bg-navy/8 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-sun/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div className="animate-fade-up">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full bg-navy/5 border border-navy/10 backdrop-blur px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-navy">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Sistema ativo em toda região
          </div>

          <h1 className="mt-7 font-display text-5xl md:text-6xl lg:text-[72px] font-extrabold leading-[1.01] text-navy text-balance tracking-tight">
            Livre da conta
            <br/>
            de luz.{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Para sempre.</span>
              <span className="absolute inset-x-0 -bottom-1 h-5 bg-sun/50 -z-0 rounded-sm skew-x-1" />
            </span>
          </h1>

          <p className="mt-7 max-w-[500px] text-lg text-ink/65 leading-relaxed text-pretty">
            Reduza sua conta de luz em até{" "}
            <strong className="text-navy font-bold">95%</strong>{" "}
            com sistemas fotovoltaicos de engenharia premium.
            25 anos de garantia. Financiamento que cabe no bolso.
          </p>

          {/* Hero smart input */}
          <div className="mt-10 max-w-[540px]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink/40 mb-2">Quanto você paga hoje?</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const el = document.getElementById("simulador");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col sm:flex-row gap-0 bg-white rounded-2xl shadow-[0_8px_48px_-8px_rgba(10,42,94,0.18)] border border-border overflow-hidden"
            >
              <div className="flex items-center gap-3 flex-1 px-5 py-1">
                <span className="text-lg font-bold text-ink/30">R$</span>
                <input
                  value={heroBill}
                  onChange={(e) => setHeroBill(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="Ex: 500, 800, 1.200..."
                  className="w-full py-4 bg-transparent outline-none text-navy text-lg font-semibold placeholder:text-ink/25 placeholder:font-normal"
                />
              </div>
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2.5 bg-sun hover:bg-sun-deep px-7 py-4 text-sm font-extrabold uppercase tracking-wider text-navy transition-all whitespace-nowrap"
              >
                Ver minha economia
                <span className="transition-transform group-hover:translate-x-1 text-base">→</span>
              </button>
            </form>
            <p className="mt-2.5 text-[11px] text-ink/40 ml-1">Grátis, sem compromisso. Resultado em segundos.</p>
          </div>

          {/* Social proof row */}
          <div className="mt-8 flex items-center gap-5">
            <div className="flex -space-x-2.5">
              {["#FFC107","#0A2A5E","#FFC107","#0A2A5E","#FFC107"].map((c, i) => (
                <div key={i} className="size-8 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: c }}>
                  {i < 2 ? "" : ""}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <span key={s} className="text-sun text-sm">★</span>)}
                <span className="text-xs font-bold text-navy ml-1">4.9/5</span>
              </div>
              <p className="text-[11px] text-ink/50 mt-0.5">Mais de 1.200 famílias e empresas atendidas</p>
            </div>
          </div>
        </div>

        {/* Right visual: premium glass card stack */}
        <div className="relative animate-fade-up [animation-delay:200ms] hidden lg:block">
          <div className="relative rounded-[40px] overflow-hidden shadow-[0_32px_80px_-16px_rgba(10,42,94,0.35)] ring-1 ring-navy/8">
            <img
              src={heroHouse}
              alt="Casa com sistema solar fotovoltaico ESOL Energy instalado"
              width={1024}
              height={1024}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
            {/* Energy generation overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white">
                <div className="text-[10px] font-bold uppercase tracking-widest text-sun">Geração em tempo real</div>
                <div className="mt-1 font-display font-extrabold text-3xl">42,8 <span className="text-lg font-semibold text-white/70">kWh hoje</span></div>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-sun rounded-full w-[72%] animate-pulse" />
                </div>
                <div className="mt-1 text-[10px] text-white/60">72% da cota diária gerada</div>
              </div>
            </div>
          </div>

          {/* Floating economy card */}
          <div className="absolute -bottom-5 -left-8 bg-white rounded-2xl shadow-deep p-5 border border-border animate-float">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Economia / 10 anos</div>
            <div className="mt-1 font-display font-extrabold text-3xl text-navy">R$ 184<span className="text-sun">k</span></div>
            <div className="mt-1 text-[10px] text-emerald-600 font-bold">↑ Acima do projetado</div>
          </div>

          {/* CO2 badge */}
          <div className="absolute -top-5 -right-4 bg-emerald-600 text-white rounded-2xl shadow-deep px-5 py-4 animate-float [animation-delay:2s]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">CO₂ evitado</div>
            <div className="mt-0.5 font-display font-extrabold text-xl">18,4 ton</div>
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
    { v: "12 MWp", l: "Potência instalada" },
    { v: "1.200+", l: "Clientes ativos" },
  ];
  return (
    <section className="bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div className="relative mx-auto max-w-7xl px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((m) => (
          <div key={m.l} className="flex flex-col">
            <div className="font-display font-extrabold text-4xl lg:text-5xl text-sun">{m.v}</div>
            <div className="mt-2 text-xs uppercase tracking-widest font-semibold text-white/55">
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
  { id: "5", nome: "Banco do Brasil", taxa_juros_mes: 0.95, prazo_maximo_meses: 96, taxa_aprovacao_media: 65, ativo: true }
];

function Simulator({ initialBill }: { initialBill: number }) {
  const [bill, setBill] = useState(initialBill);
  const [type, setType] = useState("residencial");
  const [simulatorMode, setSimulatorMode] = useState<"economia" | "financiamento">("economia");
  const [financeiras, setFinanceiras] = useState<any[]>(DEFAULT_FINANCEIRAS);
  const [selectedBankId, setSelectedBankId] = useState("1");
  const [selectedTerm, setSelectedTerm] = useState(60);

  // Sync initialBill prop → slider whenever the Hero form fires
  useEffect(() => {
    if (initialBill && initialBill >= 200) {
      setBill(Math.min(5000, Math.max(200, initialBill)));
    }
  }, [initialBill]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase.from("financeiras_solar" as any).select("*").eq("ativo", true) as any);
        if (data && data.length > 0) {
          setFinanceiras(data);
          setSelectedBankId(data[0].id);
        } else {
          const local = localStorage.getItem("esol_financeiras");
          if (local) {
            const parsed = JSON.parse(local).filter((f: any) => f.ativo);
            if (parsed.length > 0) {
              setFinanceiras(parsed);
              setSelectedBankId(parsed[0].id);
            }
          }
        }
      } catch (e) {
        const local = localStorage.getItem("esol_financeiras");
        if (local) {
          const parsed = JSON.parse(local).filter((f: any) => f.ativo);
          if (parsed.length > 0) {
            setFinanceiras(parsed);
            setSelectedBankId(parsed[0].id);
          }
        }
      }
    })();
  }, []);

  const selectedBank = useMemo(() => {
    return financeiras.find(f => f.id === selectedBankId) || financeiras[0] || DEFAULT_FINANCEIRAS[0];
  }, [financeiras, selectedBankId]);

  const result = useMemo(() => {
    const reduction = type === "industrial" ? 0.92 : type === "comercial" ? 0.93 : 0.95;
    const monthly = Math.round(bill * reduction);
    const yearly = monthly * 12;
    const tenYears = yearly * 10;
    const systemKwp = Math.max(2, Math.round((bill / 130) * 10) / 10);
    const payback = Math.max(3, Math.round((systemKwp * 5500) / yearly * 10) / 10);
    return { monthly, yearly, tenYears, systemKwp, payback };
  }, [bill, type]);

  // Preço total estimado do sistema para cálculo do financiamento
  const precoTotal = useMemo(() => {
    const pricePerWp = type === "industrial" ? 3.0 : type === "comercial" ? 3.8 : 4.8;
    return result.systemKwp * 1000 * pricePerWp;
  }, [result.systemKwp, type]);

  const financeParcela = useMemo(() => {
    if (!selectedBank) return 0;
    const rate = selectedBank.taxa_juros_mes / 100;
    const n = Math.min(selectedTerm, selectedBank.prazo_maximo_meses);
    // Fórmula Price: P = PV * [i * (1+i)^n] / [(1+i)^n - 1]
    const pmt = (precoTotal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    return Math.round(pmt);
  }, [precoTotal, selectedBank, selectedTerm]);

  const isParcelaMenorQueConta = financeParcela > 0 && financeParcela < bill;

  return (
    <section id="simulador" className="py-28 px-6 bg-paper relative">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
              Simulador inteligente
            </span>
            <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy leading-tight text-balance">
              Veja sua economia em <span className="text-sun-deep">30 segundos</span>.
            </h2>
            <p className="mt-5 text-lg text-ink/70 max-w-md text-pretty">
              Ajuste o valor da sua conta e o tipo de imóvel. Mostramos a economia real, o tamanho
              ideal do sistema e as melhores condições de parcelamento.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Cálculo baseado em irradiação solar real do seu estado",
                "Opções de financiamento com parcelas menores que sua conta atual",
                "Proposta técnica detalhada com kits de fabricantes líderes",
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

          <div className="rounded-3xl bg-white p-8 lg:p-10 shadow-deep border border-border">
            <div className="space-y-7">
              {/* Tab Selector Modo */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
                <button
                  onClick={() => setSimulatorMode("economia")}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    simulatorMode === "economia" ? "bg-navy text-white shadow-sm" : "text-ink/50 hover:text-navy"
                  }`}
                >
                  Economia Gerada
                </button>
                <button
                  onClick={() => setSimulatorMode("financiamento")}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    simulatorMode === "financiamento" ? "bg-navy text-white shadow-sm" : "text-ink/50 hover:text-navy"
                  }`}
                >
                  Financiamento Solar
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-ink/50">
                  Tipo de imóvel
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2 p-1 bg-secondary rounded-xl">
                  {["residencial", "comercial", "industrial"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                        type === t ? "bg-white text-navy shadow-sm" : "text-ink/50 hover:text-navy"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-ink/50">
                    Conta mensal
                  </label>
                  <span className="font-display text-2xl font-extrabold text-navy">
                    {BRL.format(bill)}
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={5000}
                  step={50}
                  value={bill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="mt-3 w-full accent-sun cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink/40">
                  <span>R$ 200</span>
                  <span>R$ 5.000</span>
                </div>
              </div>

              {simulatorMode === "economia" ? (
                <div className="rounded-2xl bg-navy text-white p-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sun/20 blur-2xl" />
                  <div className="relative grid grid-cols-2 gap-5">
                    <Stat label="Economia anual" value={BRL.format(result.yearly)} accent />
                    <Stat label="Em 10 anos" value={BRL.format(result.tenYears)} />
                    <Stat label="Sistema ideal" value={`${result.systemKwp} kWp`} />
                    <Stat label="Payback" value={`${result.payback} anos`} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Banco */}
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/50 block">Prazo (Meses)</label>
                      <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(Number(e.target.value))}
                        className="mt-1.5 w-full bg-secondary border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy outline-none"
                      >
                        {[24, 36, 48, 60, 72, 84, 96, 120]
                          .filter(t => t <= (selectedBank?.prazo_maximo_meses || 120))
                          .map((t) => (
                            <option key={t} value={t}>{t} parcelas</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Parcela Box */}
                  <div className="rounded-2xl bg-navy text-white p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sun/20 blur-2xl" />
                    <div className="relative space-y-4">
                      <div className="flex justify-between items-center">
                        <Stat label="Parcela Estimada" value={`${BRL.format(financeParcela)}/mês`} accent />
                        {isParcelaMenorQueConta && (
                          <span className="text-[9px] font-extrabold uppercase bg-sun text-navy px-2 py-1 rounded-md tracking-wider">
                            ⚡ Menor que a conta!
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                        <Stat label="Investimento" value={BRL.format(precoTotal)} />
                        <Stat label="Aprovação Média" value={`${selectedBank?.taxa_aprovacao_media || 80}%`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <a
                href="#orcamento"
                className="block w-full text-center rounded-xl bg-sun py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all shadow-glow"
              >
                Garantir minha economia →
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

/* ============================ SOLUTIONS ============================ */
function Solutions() {
  const items = [
    {
      img: portfolioResidential,
      tag: "Residencial",
      title: "Sua casa livre da inflação energética",
      desc: "Sistemas de 2 a 15 kWp dimensionados por engenheiros certificados. Economia real, sem surpresas.",
      meta: "A partir de R$ 199/mês",
      icon: "🏡",
    },
    {
      img: portfolioCommercial,
      tag: "Comercial",
      title: "Aumente a margem do seu negócio",
      desc: "Transforme custo fixo em ativo permanente. Retorno médio em 3 a 5 anos e valorização imediata do imóvel.",
      meta: "Retorno em ~3 a 5 anos",
      icon: "🏢",
    },
    {
      img: portfolioIndustrial,
      tag: "Industrial",
      title: "Usinas de alta potência",
      desc: "Plantas customizadas com engenharia de alta tensão, monitoramento SCADA e geração distribuída.",
      meta: "Alta Tensão A4",
      icon: "🏭",
    },
    {
      img: portfolioRural,
      tag: "Rural",
      title: "Independência para o agronegócio",
      desc: "Energia garantida para irrigação, beneficiamento e armazenagem com linhas Pronaf/BNDES.",
      meta: "Financiamento facilitado",
      icon: "🌱",
    },
  ];
  return (
    <section id="solucoes" className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
              Soluções sob medida
            </span>
            <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy leading-tight text-balance">
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
              className="group relative rounded-3xl overflow-hidden border border-border bg-white hover:shadow-[0_20px_60px_-10px_rgba(10,42,94,0.18)] hover:-translate-y-1 transition-all duration-500"
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
                <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/20 to-transparent" />
                <span className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-navy">
                  {it.icon} {it.tag}
                </span>
                <span className="absolute bottom-5 right-5 text-white text-xs font-bold bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1">
                  {it.meta}
                </span>
              </div>
              <div className="p-8">
                <h3 className="font-display font-extrabold text-2xl text-navy">{it.title}</h3>
                <p className="mt-3 text-ink/65 leading-relaxed text-pretty">{it.desc}</p>
                <a
                  href="#orcamento"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sun-deep group-hover:gap-3 transition-all"
                >
                  Solicitar projeto gratuito
                  <span className="size-6 rounded-full bg-sun/20 flex items-center justify-center text-navy transition-transform group-hover:translate-x-1">→</span>
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
    { n: "01", t: "Simulação", d: "Em 30 segundos você vê sua economia estimada, sistema ideal e condições de parcelamento.", icon: "⚡" },
    { n: "02", t: "Análise técnica", d: "Nossos engenheiros avaliam o telhado via satélite e realizam visita técnica in loco gratuitamente.", icon: "📐" },
    { n: "03", t: "Projeto e homologação", d: "Cuidamos de 100% da burocracia: ART, protocolos e vistoria na concessionária. Você só assina.", icon: "📋" },
    { n: "04", t: "Instalação", d: "Equipe certificada, equipamentos Tier 1 e garantia de 25 anos de geração. Tudo em contrato.", icon: "☀️" },
  ];
  return (
    <section id="processo" className="py-28 px-6 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="pointer-events-none absolute -top-20 right-20 w-[400px] h-[400px] rounded-full bg-sun/15 blur-[80px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-sun font-bold tracking-[0.18em] text-xs uppercase">
            Como funciona
          </span>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-white leading-tight text-balance max-w-3xl mx-auto">
            Do interesse à energia limpa,{" "}
            <span className="text-sun">passo a passo.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="group relative rounded-3xl bg-white/5 backdrop-blur border border-white/10 p-8 hover:bg-white/10 hover:border-sun/50 transition-all duration-500"
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <div className="font-display font-extrabold text-5xl text-sun/25 leading-none absolute top-6 right-6">{s.n}</div>
              <h3 className="font-display font-extrabold text-xl text-white">{s.t}</h3>
              <p className="mt-3 text-sm text-white/55 leading-relaxed">{s.d}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 text-sun/60 text-2xl z-10">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="#orcamento"
            className="inline-flex items-center gap-3 bg-sun hover:bg-sun-deep text-navy font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all shadow-[0_8px_32px_-4px_rgba(255,193,7,0.5)]"
          >
            Começar agora — é gratuito
            <span>→</span>
          </a>
          <p className="mt-3 text-white/40 text-xs">Sem compromisso. Proposta técnica gratuita.</p>
        </div>
      </div>
    </section>
  );
}

/* ============================ TRUST SIGNALS ============================ */
function TrustSignals() {
  const signals = [
    {
      icon: "🛡️",
      title: "25 Anos de Garantia",
      desc: "Garantia de geração dos painéis por contrato. Inversores com 10 anos. Instalação com 5 anos.",
      highlight: "Contrato assinado",
    },
    {
      icon: "⚙️",
      title: "Tecnologia Tier 1",
      desc: "Apenas painéis e inversores das marcas líderes globais: Jinko, Canadian Solar, Growatt, Solis.",
      highlight: "Equipamentos homologados INMETRO",
    },
    {
      icon: "📐",
      title: "Engenharia Certificada",
      desc: "Todos os projetos são assinados por engenheiros eletricistas com ART emitida e registrada no CREA.",
      highlight: "ART em todo projeto",
    },
    {
      icon: "🏛️",
      title: "Homologação Total",
      desc: "Cuidamos de 100% do processo junto à concessionária: projeto, protocolo, vistoria e ligação.",
      highlight: "Zero burocracia para você",
    },
    {
      icon: "💳",
      title: "Financiamento Facilitado",
      desc: "Parcelas que podem ser menores que sua conta atual. Trabalhamos com Solfácil, BV, Santander e Sicredi.",
      highlight: "Aprovação em até 48h",
    },
    {
      icon: "📊",
      title: "Monitoramento Online",
      desc: "Acompanhe a geração do seu sistema em tempo real pelo celular. Alertas automáticos de performance.",
      highlight: "App gratuito incluso",
    },
  ];
  return (
    <section className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">Por que a ESOL</span>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy leading-tight text-balance max-w-3xl mx-auto">
            Compromisso real.
            <br/>
            <span className="text-sun-deep">Do projeto à geração.</span>
          </h2>
          <p className="mt-5 text-ink/60 max-w-xl mx-auto text-pretty">
            Cada instalação é tratada como se fosse na nossa própria casa. Engenharia séria, materiais certificados e suporte de longo prazo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((s) => (
            <div
              key={s.title}
              className="group rounded-3xl border border-border bg-paper p-8 hover:bg-white hover:border-sun/40 hover:shadow-[0_16px_48px_-8px_rgba(10,42,94,0.12)] hover:-translate-y-1 transition-all duration-500"
            >
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="font-display font-extrabold text-xl text-navy">{s.title}</h3>
              <p className="mt-3 text-sm text-ink/65 leading-relaxed">{s.desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sun/15 px-3 py-1.5 text-[11px] font-bold text-navy tracking-wide">
                <span className="text-emerald-600">✓</span> {s.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ TESTIMONIALS ============================ */
function Testimonials() {
  const items = [
    {
      q: "Saímos de R$ 4.200 para R$ 180 de conta. Em 30 meses pagamos o sistema e agora é só lucro.",
      a: "Marcos T.",
      r: "Indústria de embalagens, Joinville/SC",
    },
    {
      q: "Equipe extremamente técnica. Fizeram a homologação na CELG sem eu mover um dedo.",
      a: "Patrícia L.",
      r: "Cliente residencial, Goiânia/GO",
    },
    {
      q: "Já indiquei a ESOL para 6 fazendas vizinhas. Profissionalismo e geração acima do prometido.",
      a: "João R.",
      r: "Produtor rural, Sorriso/MT",
    },
  ];
  return (
    <section className="py-28 px-6 bg-paper">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
            Quem confia
          </span>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy text-balance">
            Histórias reais de quem já economiza.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <blockquote
              key={t.a}
              className="rounded-3xl bg-white p-8 border border-border hover:shadow-deep transition-all"
            >
              <div className="text-sun text-3xl font-display font-extrabold leading-none">"</div>
              <p className="mt-3 text-ink/80 leading-relaxed">{t.q}</p>
              <footer className="mt-6 pt-6 border-t border-border">
                <div className="font-display font-bold text-navy">{t.a}</div>
                <div className="text-xs text-ink/50 mt-1">{t.r}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */
function FAQ() {
  const qs = [
    {
      q: "Quanto custa um sistema solar residencial?",
      a: "Sistemas residenciais começam em torno de R$ 14 mil, com parcelas em até 84x. O valor exato depende do consumo, telhado e região — nosso engenheiro envia proposta gratuita.",
    },
    {
      q: "Em quanto tempo recupero o investimento?",
      a: "O payback médio é de 3 a 5 anos. Após esse período, são mais 20 anos de energia praticamente gratuita.",
    },
    {
      q: "Funciona em dias nublados e à noite?",
      a: "Sim. O sistema gera mesmo com nuvens (em menor escala) e, à noite, você usa o crédito gerado durante o dia via compensação na rede.",
    },
    {
      q: "Qual a garantia dos equipamentos?",
      a: "Painéis com 25 anos de garantia de geração, inversores com 10 anos e instalação com 5 anos. Tudo em contrato.",
    },
    {
      q: "Vocês cuidam da homologação na concessionária?",
      a: "Sim. Cuidamos de 100% do processo: projeto, ART, protocolos e vistoria. Você só assina.",
    },
  ];
  return (
    <section id="faq" className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-14">
          <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">Dúvidas</span>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy text-balance">
            Perguntas frequentes.
          </h2>
        </div>
        <div className="space-y-3">
          {qs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-paper border border-border open:shadow-deep open:border-sun/40 transition-all"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-6 font-display font-bold text-navy text-lg">
                {item.q}
                <span className="grid place-items-center size-8 rounded-full bg-sun text-navy text-xl font-extrabold shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 text-ink/70 leading-relaxed -mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FINAL CTA / FORM ============================ */
function FinalCTA() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
    faixa: "Até R$ 500",
  });

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
      observacoes: `Lead do site — conta mensal: ${form.faixa}`,
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
    <section id="orcamento" className="py-28 px-6 bg-paper">
      <div className="mx-auto max-w-6xl">
        <div className="relative rounded-[40px] overflow-hidden bg-navy text-white shadow-deep">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-sun/30 blur-3xl animate-sun-pulse" />

          <div className="relative grid lg:grid-cols-2 gap-12 p-10 lg:p-16">
            <div>
              <span className="inline-block text-sun font-bold tracking-[0.18em] text-xs uppercase">
                Comece agora
              </span>
              <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl leading-tight text-balance">
                Transforme seu telhado em uma <span className="text-sun">mina de ouro</span>.
              </h2>
              <p className="mt-5 text-white/70 max-w-md text-pretty">
                Análise técnica gratuita. Sem compromisso. Respondemos em até 15 minutos no horário
                comercial.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Engenheiros certificados ABSOLAR",
                  "Equipamentos Tier 1 com 25 anos de garantia",
                  "Financiamento em até 84x sem entrada",
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

            <form onSubmit={onSubmit} className="rounded-3xl bg-white p-8 text-ink shadow-2xl">
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
                        Conta mensal
                      </label>
                      <select
                        required
                        value={form.faixa}
                        onChange={(e) => update("faixa", e.target.value)}
                        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-navy outline-none focus:ring-2 focus:ring-sun transition-all"
                      >
                        <option>Até R$ 500</option>
                        <option>R$ 500 a R$ 1.500</option>
                        <option>R$ 1.500 a R$ 5.000</option>
                        <option>Acima de R$ 5.000</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-sun py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all shadow-glow disabled:opacity-60"
                  >
                    {loading ? "Enviando…" : "Solicitar estudo técnico grátis →"}
                  </button>
                  <p className="text-[11px] text-ink/40 text-center">
                    Ao enviar, você concorda com nossa política de privacidade.
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
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <img src={logo} alt="ESOL Energy — Deixe o sol trabalhar por você" className="h-14 w-auto brightness-0 invert opacity-90" width={137} height={60} />
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
            <li><a href="#portfolio" className="hover:text-sun transition-colors">Projetos</a></li>
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
          <div>CNPJ 00.000.000/0001-00 · Deixe o sol trabalhar por você.</div>
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
    if (!cleanDoc) {
      toast.error("Por favor, digite um CPF ou CNPJ válido.");
      return;
    }

    setLoading(true);
    setProject(null);
    setLogs([]);
    setSearched(false);

    try {
      const { data, error } = await (supabase.rpc as any)("consultar_projeto_cliente", {
        _cpf_cnpj: cleanDoc,
      });

      if (error) throw error;

      const rows = (data as any[]) || [];
      if (rows.length > 0) {
        const found = rows[0];
        setProject(found);
        setLogs(found.recent_logs || []);
      } else {
        // Fallback para simulação local se não houver registros
        if (cleanDoc === "12345678900" || cleanDoc === "12345678000100") {
          setProject({
            nome: "Instalação Residencial Solar - Weslley Soares",
            status: "instalacao",
            cidade: "São Paulo",
            estado: "SP",
            concessionaria: "Enel SP",
            potencia_kwp: 6.4,
          });
          setLogs([
            { created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), descricao: "Painéis e inversores entregues no local da obra." },
            { created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(), descricao: "Homologação do projeto técnico aprovada pela Enel." },
            { created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), descricao: "Vistoria técnica concluída e aprovada." }
          ]);
        } else {
          toast.error("Nenhum projeto encontrado para este CPF/CNPJ.");
        }
      }
      setSearched(true);
    } catch (err: any) {
      console.error(err);
      toast.error("Ocorreu um erro ao consultar o projeto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Etapas do fluxo físico/burocrático
  const steps = [
    { key: "novo", label: "Estudo & Contrato", desc: "Análise técnica e assinatura" },
    { key: "homologacao", label: "Homologação", desc: "Parecer de acesso com a concessionária" },
    { key: "entrega", label: "Entrega de Equipamentos", desc: "Separação e envio dos kits" },
    { key: "instalacao", label: "Instalação Física", desc: "Montagem de estrutura e placas" },
    { key: "concluido", label: "Ativação & Conexão", desc: "Troca do medidor e ligação" }
  ];

  // Encontra o índice da etapa atual
  const getActiveStepIndex = () => {
    if (!project) return -1;
    const currentStatus = project.status;
    
    // Mapeamento dos status do CRM para as 5 etapas visuais
    if (["novo", "contato", "visita_agendada", "proposta_enviada", "negociacao"].includes(currentStatus)) return 0;
    if (["contrato_assinado"].includes(currentStatus)) return 1;
    if (currentStatus === "instalacao") return 3;
    if (currentStatus === "concluido") return 4;
    return 2; // padrão para transporte/entrega
  };

  const activeIndex = getActiveStepIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-deep overflow-hidden border border-border flex flex-col max-h-[90vh]">
        <div className="p-6 bg-navy text-white flex justify-between items-center">
          <div>
            <h3 className="font-display font-extrabold text-xl md:text-2xl">Acompanhar Minha Instalação</h3>
            <p className="text-xs text-white/60 mt-1">Consulte o status do seu sistema solar em tempo real</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center font-bold text-sm transition-all">&times;</button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 flex-1">
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
            <div className="space-y-8 animate-fade-up">
              {/* Resumo do Projeto */}
              <div className="bg-secondary rounded-2xl p-5 border border-slate-100 grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-ink/40 tracking-wider">Cliente / Instalação</div>
                  <div className="font-bold text-navy text-base mt-1">{project.nome}</div>
                  <div className="text-xs text-ink/60 mt-1">{project.cidade} - {project.estado}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-[10px] font-bold uppercase text-ink/40 tracking-wider">Potência do Sistema / Distribuidora</div>
                  <div className="font-extrabold text-navy text-base mt-1">{project.potencia_kwp} kWp</div>
                  <div className="text-xs text-ink/60 mt-1">{project.concessionaria}</div>
                </div>
              </div>

              {/* Linha do Tempo Física */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-navy/60">Etapa de Implantação</h4>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 pt-4 pb-2">
                  {/* Linha conectora no Desktop */}
                  <div className="hidden md:block absolute left-4 right-4 top-[38px] h-1 bg-slate-200 -z-10 rounded-full">
                    <div
                      className="h-full bg-sun transition-all duration-500 rounded-full"
                      style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {steps.map((step, idx) => {
                    const isDone = idx < activeIndex;
                    const isActive = idx === activeIndex;

                    return (
                      <div key={step.key} className="flex md:flex-col items-center md:text-center flex-1 w-full relative">
                        {/* Indicador visual / Círculo */}
                        <div
                          className={`size-10 rounded-full flex items-center justify-center font-extrabold text-sm z-10 transition-all duration-300 border-2 ${
                            isDone
                              ? "bg-sun border-sun text-navy shadow-glow scale-105"
                              : isActive
                              ? "bg-navy border-navy text-white shadow-glow scale-110 animate-pulse"
                              : "bg-white border-slate-300 text-slate-400"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>

                        {/* Textos */}
                        <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center max-w-[140px]">
                          <div className={`text-xs font-extrabold ${isActive ? "text-navy" : isDone ? "text-navy/80" : "text-slate-400"}`}>
                            {step.label}
                          </div>
                          <div className="text-[10px] text-ink/50 mt-0.5 leading-tight md:mx-auto md:max-w-[120px]">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Histórico Recente */}
              {logs.length > 0 && (
                <div className="space-y-3 bg-secondary/50 rounded-2xl p-5 border border-slate-100/50">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-navy/60">Histórico de Atividades</h4>
                  <div className="space-y-4 mt-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex gap-4 items-start text-xs text-ink/75 border-l-2 border-sun pl-4">
                        <div className="min-w-[70px] text-[10px] text-ink/40 font-bold uppercase">
                          {new Date(log.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </div>
                        <div className="flex-1 font-medium">{log.descricao}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {searched && !project && (
            <div className="text-center py-10 animate-fade-in flex flex-col items-center">
              <AlertTriangle className="size-12 text-yellow-500 mb-4" />
              <h4 className="font-display font-bold text-lg text-navy">Projeto Não Localizado</h4>
              <p className="text-sm text-ink/60 mt-1 max-w-sm">
                Não encontramos nenhuma instalação vinculada a este CPF ou CNPJ. Verifique se digitou corretamente ou contate seu corretor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
