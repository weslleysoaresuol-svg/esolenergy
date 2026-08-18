import React from 'react';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';
import { ShieldCheck, Lock, ArrowUpRight, MessageCircle, Mail } from 'lucide-react';

export interface EsolPublicFooterProps {
  className?: string;
}

/**
 * `<EsolPublicFooter />` — Rodapé Minimalista & Sofisticado Estilo Startup Tech 2026
 */
export const EsolPublicFooter: React.FC<EsolPublicFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-[#080E21] text-white border-t border-slate-800/80 py-10 sm:py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Linha Principal: Branding, Status e Navegação Rápida */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo Oficial + Badge de Status de Startup Tech */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <EsolOfficialBrandSymbol width={160} />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Sistemas 100% Operacionais</span>
            </div>
          </div>

          {/* Links Essenciais da Startup */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#simulador" className="hover:text-emerald-400 transition-colors">
              Simulador
            </a>
            <a href="#fluxo-energetico" className="hover:text-emerald-400 transition-colors">
              Ecossistema 3D
            </a>
            <a href="#diferenciais" className="hover:text-emerald-400 transition-colors">
              Tecnologia
            </a>
            <a href="/auth" className="flex items-center gap-1 hover:text-white transition-colors">
              <span>Área do Consultor</span>
              <ArrowUpRight className="size-3 text-slate-500" />
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all font-semibold"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp Oficial</span>
            </a>
          </nav>
        </div>

        {/* Linha Inferior: Copyright e Compliance Tech */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono text-center sm:text-left">
          <p>© 2026 esol energy. Todos os direitos reservados.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-[10px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-400" /> Padrão ANEEL & CREA
            </span>
            <span className="flex items-center gap-1">
              <Lock className="size-3 text-cyan-400" /> Criptografia 256-bit
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default EsolPublicFooter;
