import { createFileRoute, Link } from "@tanstack/react-router";
import { Sun, Zap, Battery, Home, Leaf, DollarSign, ArrowRight } from "lucide-react";

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
            logo: { "@type": "ImageObject", url: "https://esolenergy.com.br/favicon.ico" },
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
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <header className="bg-gradient-to-br from-navy to-[#1a2a6b] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-white/70 hover:text-white text-sm">← ESOL Energy</Link>
          <p className="mt-6 text-xs uppercase tracking-widest text-amber-300 font-bold">Guia educacional</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
            Como funciona a energia solar?
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Um guia passo a passo sobre o efeito fotovoltaico, o papel dos painéis e inversores, e como sistemas on-grid transformam luz do sol em economia na sua conta de energia.
          </p>
          <p className="mt-6 text-xs text-white/60">Atualizado em 4 de julho de 2026 · Leitura: 8 min</p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        {/* Sumário */}
        <nav className="not-prose bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Neste guia</p>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li><a className="hover:text-navy" href="#efeito-fotovoltaico">O efeito fotovoltaico</a></li>
            <li><a className="hover:text-navy" href="#componentes">Componentes de um sistema solar</a></li>
            <li><a className="hover:text-navy" href="#passo-a-passo">Passo a passo: do sol à tomada</a></li>
            <li><a className="hover:text-navy" href="#on-grid">Sistema on-grid e créditos de energia</a></li>
            <li><a className="hover:text-navy" href="#beneficios">Benefícios reais</a></li>
            <li><a className="hover:text-navy" href="#faq">Perguntas frequentes</a></li>
          </ol>
        </nav>

        <p className="text-lg">
          A energia solar fotovoltaica é hoje a fonte de eletricidade que mais cresce no Brasil — e a razão é simples: transforma a luz do sol, um recurso gratuito e abundante, em economia mensal na conta de luz. Mas <strong>como isso acontece na prática?</strong> Neste guia, você vai entender cada etapa do processo.
        </p>

        <h2 id="efeito-fotovoltaico">1. O efeito fotovoltaico: a base de tudo</h2>
        <p>
          Tudo começa dentro de uma célula solar. Painéis fotovoltaicos são compostos por células feitas de silício — o mesmo material dos chips de computador. Quando os fótons da luz solar atingem essas células, eles "empurram" elétrons do silício, gerando um fluxo de corrente elétrica contínua (CC).
        </p>
        <p>
          Esse fenômeno foi descoberto em 1839 pelo físico francês Edmond Becquerel e é chamado de <strong>efeito fotovoltaico</strong>. É ele que permite converter luz diretamente em eletricidade, sem partes móveis, sem combustão e sem emissões.
        </p>

        <h2 id="componentes">2. Componentes de um sistema solar</h2>
        <div className="not-prose grid sm:grid-cols-2 gap-4 my-6">
          <Card icon={Sun} title="Painéis fotovoltaicos" text="Instalados no telhado, captam a luz do sol e geram corrente contínua." />
          <Card icon={Zap} title="Inversor solar" text="Converte a corrente contínua (CC) dos painéis em corrente alternada (CA), usada pelos aparelhos." />
          <Card icon={Home} title="Quadro elétrico" text="Distribui a energia gerada para os pontos de consumo da casa ou empresa." />
          <Card icon={Battery} title="Medidor bidirecional" text="Conta a energia que você consome e a que injeta na rede — a base do sistema de créditos." />
        </div>

        <h2 id="passo-a-passo">3. Passo a passo: do sol à tomada</h2>
        <ol>
          <li><strong>Captação:</strong> os painéis absorvem a luz solar durante o dia.</li>
          <li><strong>Geração:</strong> as células fotovoltaicas produzem corrente contínua (CC).</li>
          <li><strong>Conversão:</strong> o inversor transforma CC em corrente alternada (CA), compatível com a rede elétrica.</li>
          <li><strong>Consumo:</strong> a energia alimenta diretamente os equipamentos da casa ou empresa.</li>
          <li><strong>Injeção:</strong> o excedente vai para a rede da distribuidora, virando créditos.</li>
          <li><strong>Compensação:</strong> à noite ou em dias com pouca geração, você usa esses créditos para abater a conta.</li>
        </ol>

        <h2 id="on-grid">4. Sistema on-grid: a "bateria virtual"</h2>
        <p>
          A maioria dos sistemas residenciais e comerciais no Brasil é do tipo <strong>on-grid</strong> (conectado à rede). Nele, você não precisa de baterias físicas — a própria rede da distribuidora funciona como armazenamento virtual, graças ao sistema de compensação regulado pela ANEEL (Resolução 482/2012 e Lei 14.300/2022).
        </p>
        <p>
          Quando seu sistema gera mais do que consome, a energia excedente vai para a rede e vira <strong>crédito de energia</strong>, válido por até 60 meses. À noite ou em dias nublados, esses créditos abatem automaticamente o consumo faturado pela distribuidora.
        </p>

        <h2 id="beneficios">5. Benefícios reais</h2>
        <div className="not-prose grid sm:grid-cols-3 gap-4 my-6">
          <Card icon={DollarSign} title="Economia de até 95%" text="Redução real na conta de luz, com retorno do investimento em 3 a 6 anos." />
          <Card icon={Leaf} title="Energia limpa" text="Zero emissões diretas: um sistema médio evita ~1,5 tonelada de CO₂ por ano." />
          <Card icon={Sun} title="Valorização do imóvel" text="Estudos apontam valorização de 4% a 8% em imóveis com sistema solar instalado." />
        </div>

        <h2 id="faq">6. Perguntas frequentes</h2>

        <h3>A energia solar funciona em dias nublados?</h3>
        <p>Sim. Painéis fotovoltaicos geram energia mesmo com céu nublado, embora com produção reduzida (30 a 50% do normal). O dimensionamento sempre considera a média anual de irradiação da sua região.</p>

        <h3>Quanto dura um sistema de energia solar?</h3>
        <p>Painéis têm vida útil de 25 a 30 anos, com garantia de performance dos fabricantes. Os inversores duram entre 10 e 15 anos. Manutenção é mínima: apenas limpeza periódica dos módulos.</p>

        <h3>E se faltar luz? O sistema continua funcionando?</h3>
        <p>Sistemas on-grid desligam automaticamente durante uma queda de energia — por segurança dos técnicos da distribuidora que atuam na rede. Para operar off-grid, é necessário instalar baterias e um inversor híbrido.</p>

        <h3>Quanto custa instalar energia solar?</h3>
        <p>O investimento varia conforme o consumo mensal, mas hoje um sistema residencial médio (300–500 kWh/mês) fica entre R$ 12 mil e R$ 25 mil, com payback entre 3 e 6 anos.</p>

        {/* CTA */}
        <div className="not-prose mt-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-8 text-navy">
          <h3 className="text-2xl font-extrabold">Pronto para calcular sua economia?</h3>
          <p className="mt-2 text-navy/80">
            Faça uma simulação gratuita em menos de 1 minuto e descubra quanto você pode economizar com energia solar.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-5 bg-navy text-white font-bold px-6 py-3 rounded-xl hover:bg-navy/90 transition"
          >
            Simular economia agora <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </main>
  );
}

function Card({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600 mt-1">{text}</p>
    </div>
  );
}
