import React from 'react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';
import { ShieldCheck, Lock, MessageCircle, ArrowUpRight } from 'lucide-react';

export interface EsolPublicFooterProps {
  className?: string;
}

/**
 * `<EsolPublicFooter />` — Rodapé Ultra-Enxuto & Justo Estilo Startup Tech 2026
 */
export const EsolPublicFooter: React.FC<EsolPublicFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-[#080E21] text-white border-t border-slate-800/80 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Linha Principal: Branding, Status e Links Justos */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Logo Oficial + Live Status Pill */}
          <div className="flex items-center gap-3">
            <EsolOfficialBrandSymbol width={135} />
            <span className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Sistemas 100% Online</span>
            </div>
          </div>

          {/* Links Essenciais Justos */}
          <nav className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400 font-medium">
            <a href="#simulador" className="hover:text-emerald-400 transition-colors">
              Simulador
            </a>
            <a href="#fluxo-energetico" className="hover:text-emerald-400 transition-colors">
              Ecossistema 3D
            </a>
            <a href="#diferenciais" className="hover:text-emerald-400 transition-colors">
              Tecnologia
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
            <a href="/auth" className="flex items-center gap-1 hover:text-white transition-colors">
              <span>Portal do Consultor</span>
              <ArrowUpRight className="size-3 text-slate-500" />
            </a>
            <a
              href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20a%20ESOL%20Energy."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all text-xs font-semibold"
            >
              <MessageCircle className="size-3" />
              <span>WhatsApp</span>
            </a>
          </nav>
        </div>

        {/* Linha Inferior: Copyright e Compliance */}
        <div className="pt-4 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono text-center sm:text-left">
          <p>© 2026 esol energy. Inovação & Engenharia Solar. Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-4 text-slate-400 text-[10px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-400" /> Homologado ANEEL & CREA
            </span>
            <span className="flex items-center gap-1">
              <Lock className="size-3 text-cyan-400" /> SSL 256-bit
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default EsolPublicFooter;
