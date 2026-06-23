import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import logo from "@/assets/esol-logo.png";
import heroHouse from "@/assets/hero-house.jpg";
import portfolioResidential from "@/assets/portfolio-residential.jpg";
import portfolioCommercial from "@/assets/portfolio-commercial.jpg";
import portfolioIndustrial from "@/assets/portfolio-industrial.jpg";
import portfolioRural from "@/assets/portfolio-rural.jpg";

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
  return (
    <div className="min-h-screen bg-paper text-ink antialiased selection:bg-sun selection:text-navy">
      <Nav />
      <Hero />
      <LogosStrip />
      <MetricsBar />
      <Simulator />
      <Solutions />
      <Process />
      <Portfolio />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

/* ============================ NAV ============================ */
function Nav() {
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
          <img src={logo} alt="ESOL Energy" className="h-16 md:h-20 w-auto" width={230} height={80} />
        </a>
        <div className="hidden lg:flex items-center gap-9 text-sm font-medium text-navy/75">
          <a href="#simulador" className="hover:text-sun-deep transition-colors">Simulador</a>
          <a href="#solucoes" className="hover:text-sun-deep transition-colors">Soluções</a>
          <a href="#processo" className="hover:text-sun-deep transition-colors">Processo</a>
          <a href="#portfolio" className="hover:text-sun-deep transition-colors">Projetos</a>
          <a href="#faq" className="hover:text-sun-deep transition-colors">FAQ</a>
        </div>
        <a
          href="#orcamento"
          className="group inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-deep hover:bg-navy-deep transition-all"
        >
          Orçamento grátis
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </div>
    </nav>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  const [bill, setBill] = useState("");
  return (
    <section id="top" className="relative pt-32 pb-24 overflow-hidden">
      {/* sun glow */}
      <div className="pointer-events-none absolute -top-32 -right-40 w-[640px] h-[640px] rounded-full bg-sun/30 blur-3xl animate-sun-pulse" />
      <div className="pointer-events-none absolute top-40 -left-20 w-[420px] h-[420px] rounded-full bg-navy/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-14 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-sun/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-navy">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sun-deep opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sun-deep" />
            </span>
            Líder em eficiência fotovoltaica
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] text-navy text-balance">
            Deixe o sol{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-navy">trabalhar</span>
              <span className="absolute inset-x-0 bottom-1 h-4 bg-sun/60 -z-0 rounded-sm" />
            </span>{" "}
            por você.
          </h1>

          <p className="mt-7 max-w-xl text-lg text-ink/70 leading-relaxed text-pretty">
            Reduza sua conta de luz em até <strong className="text-navy">95%</strong> com sistemas
            fotovoltaicos premium da ESOL Energy. Engenharia, instalação e monitoramento 25 anos de garantia.
          </p>

          {/* mini lead form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.getElementById("simulador");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-9 flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-2xl shadow-deep border border-border max-w-xl"
          >
            <div className="flex items-center gap-3 flex-1 px-4">
              <span className="text-ink/40 font-semibold">R$</span>
              <input
                value={bill}
                onChange={(e) => setBill(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Valor da sua conta de luz"
                className="w-full py-3 bg-transparent outline-none text-navy font-medium placeholder:text-ink/30"
              />
            </div>
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sun px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all whitespace-nowrap shadow-glow"
            >
              Calcular economia
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </form>

          <div className="mt-5 flex items-center gap-4 text-xs text-ink/50">
            <div className="flex -space-x-2">
              {["#FFC107", "#0A2A5E", "#FFC107", "#0A2A5E"].map((c, i) => (
                <div
                  key={i}
                  className="size-7 rounded-full ring-2 ring-white"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="font-medium">+1.200 famílias e empresas economizando hoje</span>
          </div>
        </div>

        {/* Visual */}
        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="relative rounded-[36px] overflow-hidden shadow-deep ring-1 ring-black/5">
            <img
              src={heroHouse}
              alt="Residência brasileira de alto padrão com sistema solar fotovoltaico ESOL Energy"
              width={1024}
              height={1024}
              className="w-full h-auto aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent" />
          </div>

          {/* floating stats */}
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-deep p-5 border border-border animate-float">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
              Economia média / 10 anos
            </div>
            <div className="mt-1 font-display font-extrabold text-3xl text-navy">
              R$ 184<span className="text-sun">k</span>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-navy text-white rounded-2xl shadow-deep p-5 animate-float [animation-delay:1.5s]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-sun">
              Geração hoje
            </div>
            <div className="mt-1 font-display font-extrabold text-2xl">42,8 kWh</div>
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

/* ============================ SIMULATOR ============================ */
function Simulator() {
  const [bill, setBill] = useState(800);
  const [type, setType] = useState("residencial");

  const result = useMemo(() => {
    const reduction = type === "industrial" ? 0.92 : type === "comercial" ? 0.93 : 0.95;
    const monthly = Math.round(bill * reduction);
    const yearly = monthly * 12;
    const tenYears = yearly * 10;
    const systemKwp = Math.max(2, Math.round((bill / 130) * 10) / 10);
    const payback = Math.max(3, Math.round((systemKwp * 5500) / yearly * 10) / 10);
    return { monthly, yearly, tenYears, systemKwp, payback };
  }, [bill, type]);

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
              ideal do sistema e o tempo de retorno.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Cálculo baseado em irradiação solar real do seu estado",
                "Considera bandeiras tarifárias e Lei 14.300/22",
                "Proposta técnica enviada por especialista em até 24h",
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

              <div className="rounded-2xl bg-navy text-white p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-sun/20 blur-2xl" />
                <div className="relative grid grid-cols-2 gap-5">
                  <Stat label="Economia anual" value={BRL.format(result.yearly)} accent />
                  <Stat label="Em 10 anos" value={BRL.format(result.tenYears)} />
                  <Stat label="Sistema ideal" value={`${result.systemKwp} kWp`} />
                  <Stat label="Payback" value={`${result.payback} anos`} />
                </div>
              </div>

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
      desc: "Sistemas de 2 a 15 kWp com instalação em 48h. Conforto sem medo da conta.",
      meta: "A partir de R$ 199/mês",
    },
    {
      img: portfolioCommercial,
      tag: "Comercial",
      title: "Aumente a margem do seu negócio",
      desc: "Transforme custo fixo em ativo. Retorno em 3 anos e valorização imediata.",
      meta: "Retorno em ~3 anos",
    },
    {
      img: portfolioIndustrial,
      tag: "Industrial",
      title: "Usinas de alta potência",
      desc: "Plantas customizadas com monitoramento SCADA e geração distribuída.",
      meta: "Alta Tensão A4",
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
              className="group relative rounded-3xl overflow-hidden border border-border bg-white hover:shadow-deep transition-all duration-500"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={it.img}
                  alt={`Projeto ${it.tag} ESOL Energy`}
                  loading="lazy"
                  width={1280}
                  height={800}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
                <span className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy">
                  {it.tag}
                </span>
                <span className="absolute bottom-5 left-5 text-white/80 text-xs font-semibold uppercase tracking-wider">
                  {it.meta}
                </span>
              </div>
              <div className="p-8">
                <h3 className="font-display font-extrabold text-2xl text-navy">{it.title}</h3>
                <p className="mt-3 text-ink/65 text-pretty">{it.desc}</p>
                <a
                  href="#orcamento"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy group-hover:text-sun-deep transition-colors"
                >
                  Solicitar projeto
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
    { n: "03", t: "Projeto e homologação", d: "Cuidamos de toda burocracia com a concessionária." },
    { n: "04", t: "Instalação em 48h", d: "Equipe própria, equipamentos Tier 1, garantia 25 anos." },
  ];
  return (
    <section id="processo" className="py-28 px-6 bg-paper">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
            Como funciona
          </span>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy leading-tight text-balance max-w-3xl mx-auto">
            Do interesse à energia limpa em poucos dias.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-3xl bg-white p-8 border border-border hover:border-sun hover:shadow-glow transition-all duration-500"
            >
              <div className="font-display font-extrabold text-6xl text-sun/30 leading-none">
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

/* ============================ PORTFOLIO ============================ */
function Portfolio() {
  const works = [
    { img: portfolioIndustrial, t: "Indústria Metalúrgica · 1.2 MWp", l: "Joinville/SC" },
    { img: portfolioCommercial, t: "Edifício Corporativo · 320 kWp", l: "São Paulo/SP" },
    { img: portfolioResidential, t: "Condomínio Alto Padrão · 18 kWp", l: "Goiânia/GO" },
    { img: portfolioRural, t: "Fazenda de Soja · 540 kWp", l: "Sorriso/MT" },
  ];
  return (
    <section id="portfolio" className="py-28 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-sun-deep font-bold tracking-[0.18em] text-xs uppercase">
              Projetos entregues
            </span>
            <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl text-navy leading-tight text-balance">
              Mais de 12 MWp gerando agora.
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {works.map((w) => (
            <figure
              key={w.t}
              className="group relative rounded-2xl overflow-hidden border border-border"
            >
              <img
                src={w.img}
                alt={w.t}
                loading="lazy"
                width={1280}
                height={960}
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
              <figcaption className="absolute bottom-5 left-5 right-5 text-white">
                <div className="font-display font-extrabold text-sm">{w.t}</div>
                <div className="text-[11px] uppercase tracking-widest text-sun font-bold mt-1">
                  {w.l}
                </div>
              </figcaption>
            </figure>
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-3xl bg-white p-8 text-ink shadow-2xl"
            >
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
                  <Field label="Nome completo" placeholder="Ex: João Silva" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="E-mail" type="email" placeholder="voce@email.com" />
                    <Field label="WhatsApp" type="tel" placeholder="(11) 99999-9999" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="CEP da instalação" placeholder="00000-000" />
                    <div>
                      <label className="text-[11px] uppercase font-bold tracking-widest text-ink/50">
                        Conta mensal
                      </label>
                      <select
                        required
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
                    className="mt-2 w-full rounded-xl bg-sun py-4 text-sm font-extrabold uppercase tracking-wider text-navy hover:bg-sun-deep transition-all shadow-glow"
                  >
                    Solicitar estudo técnico grátis →
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
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase font-bold tracking-widest text-ink/50">{label}</label>
      <input
        required
        type={type}
        placeholder={placeholder}
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
          <img src={logo} alt="ESOL Energy" className="h-20 w-auto brightness-0 invert opacity-90" width={230} height={80} />
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
