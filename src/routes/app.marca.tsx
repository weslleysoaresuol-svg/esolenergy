import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { 
  Download, Check, ShieldCheck, Layers, FileCode, FileImage, 
  Palette, Grid, Sparkles, Copy, ExternalLink, RefreshCw, CheckCircle2, ArrowRight
} from 'lucide-react';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';

export const Route = createFileRoute('/app/marca')({
  component: EsolBrandCenterPage,
});

const BRAND_PALETTE = [
  {
    name: "Verde Esmeralda Volt",
    role: "Ponto Fotônico & Energia Limpa",
    hex: "#10B981",
    rgb: "RGB(16, 185, 129)",
    cmyk: "CMYK(75%, 0%, 65%, 0%)",
    bgClass: "bg-[#10B981]",
    textClass: "text-white"
  },
  {
    name: "Dark Slate Navy",
    role: "Fundo Institucional & Tipografia",
    hex: "#0F172A",
    rgb: "RGB(15, 23, 42)",
    cmyk: "CMYK(65%, 45%, 0%, 84%)",
    bgClass: "bg-[#0F172A]",
    textClass: "text-white"
  },
  {
    name: "Branco Puríssimo",
    role: "Contraste Dark Mode & Papéis",
    hex: "#FFFFFF",
    rgb: "RGB(255, 255, 255)",
    cmyk: "CMYK(0%, 0%, 0%, 0%)",
    bgClass: "bg-white border border-slate-200",
    textClass: "text-slate-900"
  },
  {
    name: "Ouro Solar Premium",
    role: "Acentuação & Certificados",
    hex: "#F59E0B",
    rgb: "RGB(245, 158, 11)",
    cmyk: "CMYK(0%, 35%, 95%, 4%)",
    bgClass: "bg-[#F59E0B]",
    textClass: "text-slate-950"
  }
];

const BRAND_ASSETS = [
  // ─── GRUPO 1: ASSINATURA OFICIAL HORIZONTAL ──────────────────────────────
  {
    group: "Assinaturas Oficiais",
    title: "Marca Oficial — Dark Mode (Negativa)",
    badge: "Principal / Topo Site",
    badgeColor: "bg-emerald-500 text-slate-950 font-bold",
    uses: "Cabeçalho de site, hero escuro, apresentações corporativas, fundos navy.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal-dark.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal-dark.png",
    bgDark: true
  },
  {
    group: "Assinaturas Oficiais",
    title: "Marca Oficial — Light Mode (Positiva)",
    badge: "Documentos / Impressos",
    badgeColor: "bg-blue-600 text-white font-bold",
    uses: "Documentos oficiais, contratos ANEEL, papel timbrado, propostas PDF.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal-light.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal-light.png",
    bgDark: false
  },
  {
    group: "Assinaturas Oficiais",
    title: "Marca Oficial — Monocromática Branca",
    badge: "Marca d'água / Fotos",
    badgeColor: "bg-white/20 text-white font-bold",
    uses: "Sobreposição em fotos de usinas solares, vídeos promocionais, camisetas.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal-white.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal-white.png",
    bgDark: true
  },
  {
    group: "Assinaturas Oficiais",
    title: "Marca Oficial — Monocromática Preta",
    badge: "P&B / Carimbos",
    badgeColor: "bg-slate-200 text-slate-900 font-bold",
    uses: "Impressos monocromáticos, carimbos de engenharia, notas fiscais.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal-black.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal-black.png",
    bgDark: false
  },
  {
    group: "Assinaturas Oficiais",
    title: "Marca Oficial — Ouro Solar Premium",
    badge: "Prêmios & Troféus",
    badgeColor: "bg-amber-400 text-slate-950 font-bold",
    uses: "Certificados de sustentabilidade, selos de premiação, crachás VIP.",
    svgPath: "/brand-kit/1. Web-SVG/esol-logo-horizontal-gold.svg",
    pngPath: "/brand-kit/2. Imagens-PNG/esol-logo-horizontal-gold.png",
    bgDark: true
  },

  // ─── GRUPO 2: FAVICON & APPS ──────────────────────────────────────────────
  {
    group: "Ícone & Favicon",
    title: "Monograma Favicon — Laço Infinito s+o",
    badge: "App Icon",
    badgeColor: "bg-emerald-500 text-slate-950 font-bold",
    uses: "Favicon do navegador, ícone do app móvel, avatar de redes sociais.",
    svgPath: "/favicon.svg",
    pngPath: "/favicon.png",
    bgDark: true
  }
];

export function EsolBrandCenterPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* ── HERO HEADER ── */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="size-3.5" />
            <span>Central de Marca & Brand Guidelines 2026</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Identidade Visual Oficial <br />
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
                  esol energy.
                </span>
              </h1>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                Manual completo de uso de marca, paleta de cores homologada e arquivos vetoriais para download em altíssima definição (SVG & PNG).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assinatura no App</div>
              <EsolLogoPrimary width={240} variant="dark" />
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="size-3.5" />
                <span>Padrão 100% Minúsculo Homologado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND ASSETS GRID ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Downloads de Logotipos</h2>
            <p className="text-xs text-slate-400">Baixe a marca oficial em formato vetorial SVG ou imagem PNG transparente.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRAND_ASSETS.map((asset, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Preview Card */}
              <div className={`p-8 flex items-center justify-center min-h-[180px] relative ${asset.bgDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                <span className={`absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full ${asset.badgeColor}`}>
                  {asset.badge}
                </span>
                <img 
                  src={asset.pngPath} 
                  alt={asset.title} 
                  className="max-h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
                />
              </div>

              {/* Specs & Download CTAs */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{asset.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{asset.uses}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={asset.svgPath}
                    download
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileCode className="size-3.5" />
                    <span>SVG Vetor</span>
                  </a>

                  <a
                    href={asset.pngPath}
                    download
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileImage className="size-3.5" />
                    <span>PNG HD</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PALETA DE CORES HOMOLOGADA ── */}
      <section className="border-t border-slate-800 bg-slate-900/40 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Paleta de Cores Homologada</h2>
            <p className="text-xs text-slate-400">Cores institucionais oficiais para aplicação em UI, marketing e materiais impressos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRAND_PALETTE.map((color, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className={`h-24 rounded-xl ${color.bgClass} flex items-end p-3 shadow-inner`}>
                  <button 
                    onClick={() => handleCopyHex(color.hex)}
                    className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-[11px] font-mono font-bold text-white hover:bg-black/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedHex === color.hex ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    <span>{color.hex}</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{color.name}</h4>
                  <p className="text-xs text-slate-400">{color.role}</p>
                </div>

                <div className="text-[11px] font-mono text-slate-500 space-y-0.5 border-t border-slate-800/80 pt-3">
                  <div>{color.rgb}</div>
                  <div>{color.cmyk}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EsolBrandCenterPage;
