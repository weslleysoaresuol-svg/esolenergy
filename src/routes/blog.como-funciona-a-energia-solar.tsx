import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sun, Zap, Battery, Home, Leaf, DollarSign, ArrowRight, BookOpen, Clock, Calendar, Check } from "lucide-react";
import logo from "@/assets/esol-logo.svg";
import logoNegative from "@/assets/esol-logo-negative.svg";

const TITLE = "Como funciona a energia solar? Guia completo (2026) — ESOL Energy";
const DESCRIPTION =
  "Entenda passo a passo como a energia solar fotovoltaica funciona: efeito fotovoltaico, painéis, inversores, sistema on-grid e economia real na conta de luz.";
const URL = "https://esolenergy.com.br/blog/como-funciona-a-energia-solar";
const PUBLISHED = "2026-07-04";

export const Route = createFileRoute("/blog/como-funciona-a-energia-solar")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "como funciona a energia solar, energia solar fotovoltaica, painel solar, inversor solar, sistema on-grid, efeito fotovoltaico" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "article:published_time", content: PUBLISHED },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Como funciona a energia solar? Guia completo",
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Organization", name: "ESOL Energy" },
          publisher: {
            "@type": "Organization",
            name: "ESOL Energy",
            logo: { "@type": "ImageObject", url: "https://esolenergy.com.br/favicon.png" },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": URL },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Como funciona a energia solar em uma casa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Os painéis solares no telhado captam a luz do sol e geram corrente contínua. O inversor converte essa corrente em corrente alternada, compatível com a rede elétrica da casa. O excedente é injetado na rede da distribuidora, gerando créditos que abatem a conta de luz.",
              },
            },
            {
              "@type": "Question",
              name: "A energia solar funciona em dias nublados?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. Painéis fotovoltaicos geram energia mesmo com céu nublado, embora com produção reduzida (30 a 50% do normal). O sistema é dimensionado considerando a média anual de irradiação da região.",
              },
            },
            {
              "@type": "Question",
              name: "Quanto tempo dura um sistema de energia solar?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Painéis solares têm vida útil de 25 a 30 anos com garantia de performance. Inversores duram entre 10 e 15 anos. O retorno do investimento ocorre, em média, entre 3 e 6 anos.",
              },
            },
            {
              "@type": "Question",
              name: "Preciso de baterias para ter energia solar?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Não. O sistema on-grid (conectado à rede) usa a própria rede da distribuidora como 'bateria virtual' através do sistema de compensação de créditos, sem necessidade de baterias físicas.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased overflow-x-hidden">
      {/* Menu Superior Consistente */}
      <NavBlog />

      {/* Hero com Maestria de Design */}
      <header className="relative bg-gradient-to-br from-navy via-[#1b2a6b] to-navy-deep text-white pt-28 pb-20 px-6 overflow-hidden">
        {/* Glow de ambientação no fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(226,183,20,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#E2B714] bg-[#E2B714]/15 border border-[#E2B714]/25 px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> Guia Educacional
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white tracking-tight">
            Como funciona a energia solar?
          </h1>
          
          <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
            Um estudo aprofundado e simplificado sobre o efeito fotovoltaico, o papel de inversores e painéis, e como sistemas conectados à rede geram créditos que reduzem em até 95% a sua fatura mensal.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-[11px] text-slate-350 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#E2B714]" /> Atualizado em 04/07/2026</span>
            <span className="hidden sm:inline-block text-white/20">•</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#E2B714]" /> 8 min de leitura</span>
          </div>
        </div>
      </header>

      {/* Conteúdo do Artigo */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-deep p-6 sm:p-10 md:p-14 space-y-8">
          
          {/* Sumário */}
          <nav className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 sm:p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3B52E2] mb-3">Neste Guia Completo</h3>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs sm:text-sm font-bold text-slate-650 list-decimal list-inside">
              <li><a className="hover:text-[#3B52E2] transition-colors" href="#efeito-fotovoltaico">O Efeito Fotovoltaico</a></li>
              <li><a className="hover:text-[#3B52E2] transition-colors" href="#componentes">Componentes do Sistema</a></li>
              <li><a className="hover:text-[#3B52E2] transition-colors" href="#passo-a-passo">Passo a Passo: Sol à Tomada</a></li>
              <li><a className="hover:text-[#3B52E2] transition-colors" href="#on-grid">Sistema On-Grid e Créditos</a></li>
              <li><a className="hover:text-[#3B52E2] transition-colors" href="#beneficios">Benefícios Reais do Investimento</a></li>
              <li><a className="hover:text-[#3B52E2] transition-colors" href="#faq">Perguntas Frequentes (FAQ)</a></li>
            </ol>
          </nav>

          {/* Texto Artigo */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-6">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium border-l-4 border-[#E2B714] pl-4">
              A energia solar fotovoltaica consolidou-se como a fonte de eletricidade que mais cresce no Brasil. O motivo é puramente financeiro e ecológico: ela transforma a luz solar — um recurso infinito e abundante — em eletricidade limpa que zera quase integralmente o seu custo de energia. Mas <strong>como essa mágica física acontece?</strong> Acompanhe os detalhes abaixo.
            </p>

            <h2 id="efeito-fotovoltaico" className="text-xl sm:text-2xl font-black text-navy pt-4 flex items-center gap-2">
              <span className="text-[#E2B714] text-base">01.</span> O Efeito Fotovoltaico: A Base Científica
            </h2>
            <p>
              Tudo se inicia nas células fotovoltaicas. Os painéis instalados em seu telhado são compostos por dezenas dessas células fabricadas a partir de silício cristalino dopado (o mesmo semicondutor base dos processadores de computadores). 
            </p>
            <p>
              Quando as partículas de luz solar (fótons) colidem com os átomos de silício da célula, elas transferem energia aos elétrons livres, "empurrando-os" e gerando uma corrente elétrica contínua (CC). Esse fenômeno natural, batizado de <strong>efeito fotovoltaico</strong>, foi documentado em 1839 pelo cientista Edmond Becquerel e constitui a tecnologia mais limpa de geração energética do planeta, operando totalmente sem partes móveis, sem barulho e sem resíduos.
            </p>

            <h2 id="componentes" className="text-xl sm:text-2xl font-black text-navy pt-4 flex items-center gap-2">
              <span className="text-[#E2B714] text-base">02.</span> Componentes Essenciais de uma Usina Solar
            </h2>
            <p>
              Um sistema fotovoltaico moderno conectado à rede é composto por quatro pilares robustos que convertem e distribuem a energia com eficiência:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
              <ComponentCard icon={Sun} title="Painéis Fotovoltaicos" desc="Instalados no telhado com inclinação ideal, captam a radiação e geram eletricidade em corrente contínua (CC)." />
              <ComponentCard icon={Zap} title="Inversor Solar Inteligente" desc="O 'cérebro' do sistema. Converte a corrente contínua (CC) em corrente alternada (CA), que é compatível com seus aparelhos." />
              <ComponentCard icon={Home} title="Quadro de Distribuição" desc="Recebe a energia já convertida pelo inversor e a direciona para alimentar lâmpadas, motores, computadores e eletrodomésticos." />
              <ComponentCard icon={Battery} title="Medidor Bidirecional" desc="Substitui o medidor antigo. Ele registra tanto a energia que você puxa da rede da distribuidora quanto o excedente injetado nela." />
            </div>

            <h2 id="passo-a-passo" className="text-xl sm:text-2xl font-black text-navy pt-4 flex items-center gap-2">
              <span className="text-[#E2B714] text-base">03.</span> Passo a Passo: Do Sol à Tomada
            </h2>
            <p>
              O fluxo de funcionamento diário de um imóvel com energia solar opera em perfeita harmonia automatizada:
            </p>

            <div className="space-y-3 not-prose my-6">
              {[
                { step: "1", title: "Captação Contínua", text: "Os fótons da luz solar atingem os painéis gerando eletricidade CC." },
                { step: "2", title: "Conversão Síncrona", text: "O inversor solar transforma CC em CA (corrente alternada de 110V/220V)." },
                { step: "3", title: "Consumo Imediato", text: "A energia alimenta diretamente todos os equipamentos ativos no imóvel." },
                { step: "4", title: "Injeção de Excedente", text: "Caso a geração seja maior que o consumo, o excesso vai para a rede pública de energia." },
                { step: "5", title: "Geração de Créditos", text: "O excedente é medido e transformado em créditos energéticos válidos por 5 anos." }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl hover:bg-slate-100/50 transition-colors">
                  <div className="size-6 rounded-full bg-[#3B52E2] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-navy">{item.title}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="on-grid" className="text-xl sm:text-2xl font-black text-navy pt-4 flex items-center gap-2">
              <span className="text-[#E2B714] text-base">04.</span> Sistemas On-Grid: A Distribuidora como Bateria Virtual
            </h2>
            <p>
              A esmagadora maioria das instalações no Brasil é do tipo <strong>On-Grid</strong> (conectada à rede elétrica da distribuidora). Essa modalidade dispensa o uso de baterias químicas caras e complexas para armazenamento local.
            </p>
            <p>
              De acordo com a Lei 14.300/2022 (Marco Legal da Geração Distribuída), a rede elétrica pública atua como uma <strong>"bateria virtual"</strong>. Durante o dia, sob o sol forte, o sistema produz muita energia e injeta o excesso na rede, gerando créditos. À noite ou em dias muito chuvosos, você consome a energia da rede normalmente, e o sistema de compensação abate esses créditos da sua conta, restando apenas as taxas mínimas de disponibilidade da concessionária e iluminação pública.
            </p>

            <h2 id="beneficios" className="text-xl sm:text-2xl font-black text-navy pt-4 flex items-center gap-2">
              <span className="text-[#E2B714] text-base">05.</span> Os Benefícios Reais do Investimento
            </h2>
            <p>
              A instalação de energia solar fotovoltaica traz impactos financeiros e ecológicos profundos desde o primeiro dia de ativação:
            </p>

            <div className="grid sm:grid-cols-3 gap-4 not-prose my-6">
              <BenefitCard icon={DollarSign} title="Economia de até 95%" desc="Reduza drasticamente sua conta, livrando-se dos aumentos das bandeiras tarifárias." />
              <BenefitCard icon={Leaf} title="Sustentabilidade" desc="Fonte 100% limpa. Um sistema residencial comum evita cerca de 1.5 toneladas de CO₂ por ano." />
              <BenefitCard icon={Home} title="Valorização de Imóvel" desc="Casas e prédios comerciais com energia solar têm valorização estimada de 4% a 8%." />
            </div>

            <h2 id="faq" className="text-xl sm:text-2xl font-black text-navy pt-4 flex items-center gap-2">
              <span className="text-[#E2B714] text-base">06.</span> Perguntas Frequentes (FAQ)
            </h2>
            <div className="space-y-4 not-prose my-6">
              {[
                { q: "A energia solar funciona em dias nublados ou chuvosos?", a: "Sim. Os painéis solares continuam gerando eletricidade através da radiação difusa, embora a produção seja de 30% a 50% menor em relação a um dia ensolarado. O cálculo do motor de dimensionamento da ESOL já contempla a média climática histórica regional." },
                { q: "Quanto tempo dura um sistema fotovoltaico?", a: "Os painéis solares têm vida útil superior a 25 anos, com garantia de fabricação de performance. O inversor solar tem vida útil média de 10 a 15 anos. A manutenção consiste basicamente em limpezas simples dos módulos." },
                { q: "O sistema funciona em caso de apagão na rede elétrica?", a: "Sistemas on-grid convencionais desligam de forma automática por motivos de segurança, evitando que a eletricidade solar seja injetada na rede enquanto eletricistas realizam reparos na via pública. Para operar em apagões, é necessário um sistema híbrido com baterias." },
                { q: "Qual o prazo para o investimento se pagar (Payback)?", a: "O payback médio no Brasil varia de 3 a 5 anos. Como os equipamentos duram mais de 25 anos, são garantidos pelo menos 20 anos de energia livre e gratuita." }
              ].map((faq, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-navy">❓ {faq.q}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-650 leading-relaxed font-semibold">{faq.a}</p>
                </div>
              ))}
            </div>

          </div>

          {/* CTA Final com Maestria de Conversão */}
          <div className="relative rounded-2xl bg-gradient-to-br from-navy via-[#1e2e6d] to-[#0A1950] text-white p-6 sm:p-10 shadow-deep text-center space-y-4 overflow-hidden">
            {/* Efeitos de Glow internos */}
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-sun/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-[#3B52E2]/10 blur-3xl pointer-events-none" />
            
            <div className="max-w-xl mx-auto space-y-2 relative z-10">
              <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-sun bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Simulação Grátis e Síncrona
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Pronto para simular sua economia?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Descubra em 30 segundos a potência ideal, a quantidade de módulos e a estimativa de parcelas para o seu telhado.
              </p>
            </div>
            
            <div className="pt-2 relative z-10">
              <Link
                to="/"
                hash="simulador"
                className="inline-flex items-center gap-2 bg-sun hover:bg-sun-deep text-navy font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl shadow-glow transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                Calcular Economia com Motor Solar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Consistente */}
      <FooterBlog />
    </div>
  );
}

function ComponentCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 hover:bg-slate-100/50 transition-colors">
      <div className="size-10 rounded-xl bg-gradient-to-br from-navy to-[#3B52E2] text-white flex items-center justify-center mb-3.5 shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xs sm:text-sm font-black text-navy">{title}</h3>
      <p className="text-[11px] sm:text-xs text-slate-550 leading-relaxed font-semibold mt-1">{desc}</p>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 text-center flex flex-col items-center hover:bg-slate-100/50 transition-colors">
      <div className="size-10 rounded-full bg-sun/10 text-navy flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xs sm:text-sm font-black text-navy">{title}</h3>
      <p className="text-[11px] sm:text-xs text-slate-550 leading-relaxed font-semibold mt-1">{desc}</p>
    </div>
  );
}

/* ============================ NAV BLOG ============================ */
function NavBlog() {
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
        scrolled ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent text-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img 
            src={logo} 
            alt="ESOL Energy" 
            className={`h-10 sm:h-12 w-auto shrink-0 transition-all ${
              scrolled ? "" : "brightness-0 invert"
            }`} 
          />
        </Link>
        <div className={`hidden xl:flex items-center gap-8 text-sm font-bold absolute left-1/2 -translate-x-1/2 ${
          scrolled ? "text-navy/75" : "text-white/80"
        }`}>
          <Link to="/" hash="simulador" className="hover:text-[#E2B714] transition-colors">Simulador</Link>
          <Link to="/" hash="solucoes" className="hover:text-[#E2B714] transition-colors">Soluções</Link>
          <Link to="/" hash="processo" className="hover:text-[#E2B714] transition-colors">Processo</Link>
          <Link to="/blog/como-funciona-a-energia-solar" className="hover:text-[#E2B714] transition-colors text-[#E2B714]">Como funciona?</Link>
          <Link to="/" hash="faq" className="hover:text-[#E2B714] transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/auth"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              scrolled 
                ? "border-navy/15 bg-white/70 text-navy hover:bg-navy hover:text-white" 
                : "border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy"
            }`}
          >
            Acesso
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ============================ FOOTER BLOG ============================ */
function FooterBlog() {
  return (
    <footer className="bg-gradient-to-br from-navy to-navy-deep text-white border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <img src={logoNegative} alt="ESOL Energy" className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300" />
          <p className="mt-5 max-w-sm text-white/80 text-sm leading-relaxed">
            Engenharia solar fotovoltaica de alta performance. Deixe o sol trabalhar por você.
          </p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[#E2B714] font-black mb-4">Empresa</div>
          <ul className="space-y-3 text-sm text-white/70 font-semibold">
            <li><Link to="/" hash="solucoes" className="hover:text-sun transition-colors">Soluções</Link></li>
            <li><Link to="/" hash="processo" className="hover:text-sun transition-colors">Processo</Link></li>
            <li><Link to="/" hash="simulador" className="hover:text-sun transition-colors">Simulador</Link></li>
            <li><Link to="/blog/como-funciona-a-energia-solar" className="hover:text-sun transition-colors text-sun">Como funciona?</Link></li>
            <li><Link to="/" hash="faq" className="hover:text-sun transition-colors">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[#E2B714] font-black mb-4">Contato</div>
          <ul className="space-y-3 text-sm text-white/70 font-semibold">
            <li>contato@esolenergy.com.br</li>
            <li>Atendimento em todo o território nacional</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/70 font-semibold">
          <div>© {new Date().getFullYear()} ESOL Energy — Todos os direitos reservados.</div>
          <div>Deixe o sol trabalhar por você.</div>
        </div>
      </div>
    </footer>
  );
}
