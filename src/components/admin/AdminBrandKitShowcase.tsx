import React, { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Download, Sparkles, Moon, Sun, Layers } from 'lucide-react';
import { BRAND_INFO, BRAND_SLOGANS, BRAND_COLORS } from '@/config/brandConfig';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { EsolLogoStacked } from '@/components/brand/EsolLogoStacked';
import { EsolBrandmarkGliph } from '@/components/brand/EsolBrandmarkGliph';
import { EsolLogoNegative } from '@/components/brand/EsolLogoNegative';
import { EsolLogoMonochrome } from '@/components/brand/EsolLogoMonochrome';
import { EsolLogoCyberTech } from '@/components/brand/EsolLogoCyberTech';
import { EsolFaviconMicro } from '@/components/brand/EsolFaviconMicro';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';
import { EsolEnergyLiveBadge } from '@/components/brand/EsolEnergyLiveBadge';

/**
 * `<AdminBrandKitShowcase />` — Componente Interativo do Brand Kit no Painel Admin (V13.2)
 */
export const AdminBrandKitShowcase: React.FC = () => {
  const [darkPreview, setDarkPreview] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    toast.success(`Copiado: ${label} (${text})`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Cabeçalho do Brand Kit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <EsolBrandmarkGliph size={36} badgeColor="amber" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Brand Kit & Design System {BRAND_INFO.version}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              V13.2 Homologado
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Guia central de identidade visual, suíte de 7 logos React SVG nativos, paleta HSL e matriz oficial de slogans da {BRAND_INFO.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkPreview(!darkPreview)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {darkPreview ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-400" />}
            <span>Preview: {darkPreview ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <a
            href={BRAND_INFO.name ? '/brand-kit/MANUAL_DE_USO_V13.md' : '#'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Manual da Marca (.md)</span>
          </a>
        </div>
      </div>

      {/* Seção 1: Suíte de 7 Componentes React SVG */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Suíte Oficial de 7 Logos Vetoriais SVG</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Logo Primária */}
          <div className={`p-6 rounded-2xl border transition-all ${darkPreview ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">1. Primary Horizontal</span>
            <div className="flex items-center justify-center h-28">
              <EsolLogoPrimary variant={darkPreview ? 'dark' : 'light'} width={260} height={65} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Uso: Header de sites, propostas e apresentações comerciais.</p>
          </div>

          {/* Card 2: Logo Empilhada */}
          <div className={`p-6 rounded-2xl border transition-all ${darkPreview ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">2. Vertical Stacked</span>
            <div className="flex items-center justify-center h-28">
              <EsolLogoStacked variant={darkPreview ? 'dark' : 'light'} width={130} height={130} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Uso: Capas de e-books, modais, cartões e formatos quadrados.</p>
          </div>

          {/* Card 3: Monograma Glifo eS */}
          <div className={`p-6 rounded-2xl border transition-all ${darkPreview ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">3. Brandmark Gliph (eS)</span>
            <div className="flex items-center justify-center h-28 gap-4">
              <EsolBrandmarkGliph size={54} badgeColor="amber" />
              <EsolBrandmarkGliph size={54} badgeColor="slate" />
              <EsolBrandmarkGliph size={54} variant="transparent" />
            </div>
            <p className="text-xs text-slate-500 mt-4">Uso: Avatares de consultores, ícones de app PWA e spinners.</p>
          </div>

          {/* Card 4: Logo Negative Dark Mode */}
          <div className="p-6 rounded-2xl border bg-slate-950 border-slate-800">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-4">4. Negative Dark Mode</span>
            <div className="flex items-center justify-center h-28">
              <EsolLogoNegative width={260} height={65} />
            </div>
            <p className="text-xs text-slate-400 mt-4">Uso: Fundos escuros absolutos (#020617) com iluminação HSL Glow.</p>
          </div>

          {/* Card 5: Logo Monocromática */}
          <div className={`p-6 rounded-2xl border transition-all ${darkPreview ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">5. Monochrome P&B</span>
            <div className="flex items-center justify-center h-28">
              <EsolLogoMonochrome inverted={darkPreview} width={260} height={65} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Uso: eNotas fiscais, DRE, carimbos e gravação a laser em brindes.</p>
          </div>

          {/* Card 6: Logo CyberTech Animada */}
          <div className="p-6 rounded-2xl border bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">6. CyberTech Animada</span>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-center h-28">
              <EsolLogoCyberTech variant="dark" width={260} height={65} />
            </div>
            <p className="text-xs text-slate-400 mt-4">Uso: Hero section, vinhetas da Esol Academy e Framer Motion.</p>
          </div>

          {/* Card 7: Favicon Micro-SVG */}
          <div className={`p-6 rounded-2xl border transition-all md:col-span-2 lg:col-span-3 ${darkPreview ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">7. Favicon Micro-SVG (Navegador 16px / 32px)</span>
            <div className="flex items-center justify-around h-20">
              <div className="flex items-center gap-3">
                <EsolFaviconMicro size={16} />
                <span className="text-xs text-slate-400">16px (Aba do Navegador)</span>
              </div>
              <div className="flex items-center gap-3">
                <EsolFaviconMicro size={32} />
                <span className="text-xs text-slate-400">32px (Retina Favicon)</span>
              </div>
              <div className="flex items-center gap-3">
                <EsolFaviconMicro size={48} badgeShape="square" />
                <span className="text-xs text-slate-400">48px (PWA Square)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Paleta HSL & Tokens de Cores */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Paleta de Cores Homologada V13.2</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(BRAND_COLORS).map(([key, color]) => (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{color.name}</span>
                <div className="w-5 h-5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: color.hex }} />
              </div>

              <div className="space-y-1 text-xs font-mono">
                <button
                  onClick={() => copyToClipboard(color.hex, `${color.name} HEX`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <span>HEX: {color.hex}</span>
                  {copiedToken === color.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </button>

                <button
                  onClick={() => copyToClipboard(color.hsl, `${color.name} HSL`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <span>HSL: {color.hsl}</span>
                  {copiedToken === color.hsl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{color.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 3: Matriz Oficial de Slogans */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Matriz Oficial de Slogans por Contexto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(BRAND_SLOGANS).map(([key, slogan]) => (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{key}</span>
                <button
                  onClick={() => copyToClipboard(slogan, `Slogan (${key})`)}
                  className="text-slate-500 hover:text-white p-1 rounded"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-medium text-slate-200 italic">"{slogan}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBrandKitShowcase;
