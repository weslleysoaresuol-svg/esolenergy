import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Download, Copy, Check, FileText, Palette, Type, MessageSquare, 
  Sparkles, Sun, Eye, ExternalLink, ShieldCheck, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/marca")({
  head: () => ({ meta: [{ title: "Manual de Marca — ESOL Energy" }] }),
  component: BrandManualPage,
});

const BRAND_COLORS = [
  {
    name: "Navy Royal (Primária)",
    hex: "#00246B",
    rgb: "0, 36, 107",
    cmyk: "100, 85, 14, 3",
    pantone: "PMS 287 C",
    desc: "Cor de autoridade, engenharia e segurança. Usada em fundos, textos principais e elementos de peso visual.",
    bgClass: "bg-[#00246B]"
  },
  {
    name: "Solar Gold (Destaque)",
    hex: "#FFB300",
    rgb: "255, 179, 0",
    cmyk: "0, 32, 100, 0",
    pantone: "PMS 123 C",
    desc: "Cor de energia viva, calor, tecnologia solar e otimismo. Usada em botões de ação (CTA), realces e no ícone solar.",
    bgClass: "bg-[#FFB300]"
  },
  {
    name: "Slate Gray (Secundária/Texto)",
    hex: "#555555",
    rgb: "85, 85, 85",
    cmyk: "0, 0, 0, 80",
    pantone: "PMS Cool Gray 10 C",
    desc: "Cor de sobriedade, neutralidade e modernidade. Usada em textos descritivos e no termo 'ENERGY' do logotipo.",
    bgClass: "bg-[#555555]"
  },
  {
    name: "Silver Gray (Fundos Escuros)",
    hex: "#E5E7EB",
    rgb: "229, 231, 235",
    cmyk: "10, 6, 6, 0",
    pantone: "PMS Cool Gray 1 C",
    desc: "Versão de alto contraste clara. Usada nas fontes do logotipo negativo sobre fundos escuros de alta costura.",
    bgClass: "bg-[#E5E7EB]"
  }
];

const BRAND_ASSETS = [
  {
    title: "Logo Horizontal Oficial",
    desc: "Ideal para cabeçalhos, navbars, cabeçalhos de documentos e barras estreitas.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal.png",
    bgDark: false
  },
  {
    title: "Logo Horizontal Negativa",
    desc: "Otimizada para cabeçalhos escuros, propostas de alta costura e fundos marinhos.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal-negative.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal-negative.png",
    bgDark: true
  },
  {
    title: "Logo Vertical / Stacked",
    desc: "Indicada para capas de propostas, banners centrais, folders e fardamento.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-stacked.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-stacked.png",
    bgDark: false
  },
  {
    title: "Logo Vertical Negativa",
    desc: "Versão vertical otimizada para aberturas escuras e fundos contrastantes.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-stacked-negative.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-stacked-negative.png",
    bgDark: true
  },
  {
    title: "Brandmark (Ícone do Sol)",
    desc: "Apenas o símbolo solar. Usado para favicons, loader, fotos de perfil e badges.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-brandmark.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-brandmark.png",
    bgDark: false
  },
  {
    title: "Brandmark Monocromático",
    desc: "Símbolo em branco sutil. Indicado para marcas d'água e assinaturas discretas.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-brandmark-white.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-brandmark-white.png",
    bgDark: true
  }
];

function BrandManualPage() {
  const [activeTab, setActiveTab] = useState<"ativos" | "cores" | "tipografia" | "tom">("ativos");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Cor ${hex} copiada para a área de transferência!`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 md:p-6 animate-fade-in">
      
      {/* GLOWING HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#001046] to-[#00246B] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#FFB300]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-[#FFB300]">
            <Sparkles className="w-3.5 h-3.5" /> CENTRAL DE MARCA OFICIAL
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Manual de Identidade Visual <span className="text-[#FFB300]">ESOL Energy</span>
          </h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Consulte as diretrizes e faça o download dos ativos da marca. Garanta a consistência em propostas, folders, redes sociais e documentos corporativos.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a 
              href="/brand-kit/MANUAL_DE_USO.md" 
              download 
              className="inline-flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A100] text-[#001046] font-bold px-4 py-2.5 rounded-xl text-xs transition duration-200 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Manual Completo (.md)
            </a>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
        {[
          { id: "ativos", icon: FileText, label: "Ativos de Marca" },
          { id: "cores", icon: Palette, label: "Cores Oficiais" },
          { id: "tipografia", icon: Type, label: "Tipografia & Grid" },
          { id: "tom", icon: MessageSquare, label: "Tom de Voz & Diretrizes" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "border-[#00246B] text-[#00246B]"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[400px]">
        
        {/* TAB 1: LOGO ASSETS DOWNLOAD GRID */}
        {activeTab === "ativos" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy">Biblioteca de Logotipos</h2>
              <p className="text-slate-500 text-xs mt-1">
                Vetores nítidos (SVG) para desenvolvimento web e imagens transparentes (PNG) em alta resolução para Canva e apresentações.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BRAND_ASSETS.map((asset, idx) => (
                <div 
                  key={idx} 
                  className="group flex flex-col border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                >
                  {/* PREVIEW CONTAINER */}
                  <div className={`h-40 flex items-center justify-center p-6 relative ${asset.bgDark ? "bg-[#001046] pattern-dark" : "bg-slate-50 pattern-light"}`}>
                    {/* Floating contrast badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${asset.bgDark ? "bg-white/10 text-white" : "bg-slate-200/60 text-slate-600"}`}>
                      {asset.bgDark ? "Tema Escuro" : "Tema Claro"}
                    </span>
                    <img 
                      src={asset.svgPath} 
                      alt={asset.title} 
                      className="max-w-full max-h-full object-contain transform group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  
                  {/* BODY INFO */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{asset.title}</h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{asset.desc}</p>
                    </div>
                    
                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <a 
                        href={asset.svgPath} 
                        download
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-[11px] transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Vetor SVG
                      </a>
                      <a 
                        href={asset.pngPath} 
                        download
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#00246B]/5 hover:bg-[#00246B]/10 text-[#00246B] font-bold py-2 rounded-xl text-[11px] transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Imagem PNG
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: OFFICIAL COLOR PALETTE */}
        {activeTab === "cores" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy">Paleta de Cores Corporativas</h2>
              <p className="text-slate-500 text-xs mt-1">
                Códigos de cor oficiais para desenvolvimento (Hex), telas (RGB) e impressão gráfica (CMYK / Pantone).
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BRAND_COLORS.map((color, idx) => (
                <div 
                  key={idx} 
                  className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col"
                >
                  <div className={`h-24 ${color.bgClass} relative flex items-end p-3 shadow-inner`}>
                    <button 
                      onClick={() => handleCopyColor(color.hex)}
                      className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur-xs transition"
                      title="Copiar HEX"
                    >
                      {copiedColor === color.hex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <span className="text-white text-xs font-bold bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {color.hex}
                    </span>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{color.name}</h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-1.5">{color.desc}</p>
                    </div>
                    
                    <div className="border-t pt-2 space-y-1.5 text-[10px] text-slate-600 font-semibold">
                      <div className="flex justify-between">
                        <span>RGB:</span>
                        <span className="font-bold text-slate-700">{color.rgb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CMYK:</span>
                        <span className="font-bold text-slate-700">{color.cmyk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pantone:</span>
                        <span className="font-bold text-[#FFB300]">{color.pantone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY & GRID */}
        {activeTab === "tipografia" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* PRIMARY FONT CONTAINER */}
              <div className="border border-slate-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#00246B]/5 flex items-center justify-center text-[#00246B] font-bold text-sm">Aa</div>
                  <h3 className="font-bold text-slate-800 text-sm">Fonte Primária: Inter</h3>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Usada em todo o corpo de texto, tabelas, formulários e descrições técnicas. Oferece alta legibilidade em qualquer dispositivo digital.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 font-sans">
                  <p className="text-2xl font-normal text-slate-800">Inter Regular - 16px</p>
                  <p className="text-2xl font-semibold text-slate-800">Inter SemiBold - 16px</p>
                  <p className="text-2xl font-extrabold text-[#00246B]">Inter ExtraBold - 16px</p>
                </div>
              </div>

              {/* SECONDARY FONT CONTAINER */}
              <div className="border border-slate-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFB300]/5 flex items-center justify-center text-[#FFB300] font-bold text-sm">Aa</div>
                  <h3 className="font-bold text-slate-800 text-sm">Fonte Auxiliar: Montserrat</h3>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Usada em títulos de seções principais, banners de marketing e chamadas de destaque para transmitir imponência e modernidade geométrica.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 font-serif" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <p className="text-2xl font-light text-slate-800">Montserrat Light - 16px</p>
                  <p className="text-2xl font-bold text-slate-800">Montserrat Bold - 16px</p>
                  <p className="text-2xl font-black text-[#00246B]">Montserrat Black - 16px</p>
                </div>
              </div>
            </div>

            {/* MARGIN AND LAYOUT SPACING */}
            <div className="border border-slate-100 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Margens de Segurança do Logotipo
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Para manter a integridade visual da logo, é obrigatório manter um espaçamento mínimo livre ao redor da marca correspondente a **50% da altura da própria logo**.
              </p>
              <div className="h-28 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 p-4">
                <div className="border border-[#FFB300]/40 rounded-lg p-3 bg-white flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold px-4 py-1.5 border border-dashed border-slate-200">Margem Segura (X)</span>
                  <img src="/brand-kit/1. Web-SVG/esol-logo-horizontal.svg" className="h-10 px-4" alt="Margem" />
                  <span className="text-[10px] text-slate-400 font-bold px-4 py-1.5 border border-dashed border-slate-200">Margem Segura (X)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BRAND VOICE & GUIDELINES */}
        {activeTab === "tom" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* BRAND VOICE PRINCIPLES */}
              <div className="space-y-4">
                <h3 className="font-bold text-[#00246B] text-base">Os 3 Pilares da Nossa Voz</h3>
                
                <div className="space-y-4 text-xs">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Autoridade Técnica</h4>
                      <p className="text-slate-500 mt-1 leading-relaxed">Falamos com embasamento técnico e exatidão de engenharia solar. Evitamos promessas mágicas.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Clareza e Transparência comercial</h4>
                      <p className="text-slate-500 mt-1 leading-relaxed">Exibimos as taxas, a Lei 14.300 e o faturamento sem asteriscos ou pegadinhas.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Inovação Otimista</h4>
                      <p className="text-slate-500 mt-1 leading-relaxed">Inspiramos a transição para um futuro sustentável onde o cliente é dono da sua própria geração.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLOGAN PHILOSOPHY */}
              <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center text-center space-y-4">
                <h3 className="font-bold text-[#00246B] text-sm uppercase tracking-wider">Nosso Posicionamento</h3>
                <blockquote className="text-lg md:text-xl font-extrabold text-[#00246B] italic">
                  &ldquo;Deixe o sol trabalhar por você.&rdquo;
                </blockquote>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                  Este slogan âncora representa a inteligência da engenharia fotovoltaica: colocar uma força da natureza inesgotável para gerar valor econômico imediato ao cliente, trabalhando em silêncio e sem esforço.
                </p>
              </div>
            </div>

            {/* DO AND DONT COPY EXAMPLES */}
            <div className="border border-slate-100 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Diretrizes de Escrita e Copywriting</h3>
              <div className="grid md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">✓ Como devemos falar:</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1.5">
                    <li>&ldquo;A partir de hoje, sua conta de luz custará o mínimo operacional.&rdquo;</li>
                    <li>&ldquo;Nosso estudo projeta Payback financeiro transparente em 3,5 anos.&rdquo;</li>
                    <li>&ldquo;Homologação e engenharia solar premium com 25 anos de garantia.&rdquo;</li>
                  </ul>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-rose-800 flex items-center gap-1.5">✗ Como NÃO devemos falar:</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1.5">
                    <li>&ldquo;Ganhe energia solar 100% grátis sem pagar nada por isso.&rdquo;</li>
                    <li>&ldquo;Zere totalmente sua conta de luz sem taxa de disponibilidade.&rdquo;</li>
                    <li>&ldquo;Equipamentos mais baratos do mercado nacional com garantia vitalícia.&rdquo;</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK DOWNLOAD SECTION */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-navy text-sm">Precisa enviar os ativos para uma agência ou desenvolvedor?</h3>
          <p className="text-slate-500 text-xs">Todos os arquivos gerados estão limpos, recortados e prontos em diretório público.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <a 
            href="/brand-kit/1. Web-SVG/esol-logo-horizontal.svg" 
            download 
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#00246B] hover:bg-[#001D56] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition duration-200"
          >
            <Download className="w-4 h-4" /> Logo Principal SVG
          </a>
        </div>
      </div>
    </div>
  );
}
