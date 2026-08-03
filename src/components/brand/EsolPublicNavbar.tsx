import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { User, Menu, X, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export interface EsolPublicNavbarProps {
  className?: string;
}

/**
 * `<EsolPublicNavbar />` — Navbar do Site Institucional Público (V13.2)
 */
export const EsolPublicNavbar: React.FC<EsolPublicNavbarProps> = ({ className = '' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Simulador 3-em-1', href: '#simulador' },
    { label: 'Equipamentos Tier-1', href: '#produtos' },
    { label: 'Por que a ESOL?', href: '#diferenciais' },
    { label: 'Soluções por Perfil', href: '#perfis' },
    { label: 'Rastrear Usina', href: '#rastreamento' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo ESOL */}
        <Link to="/" className="flex items-center gap-2">
          <EsolLogoPrimary size="md" showTagline={false} />
        </Link>

        {/* Links de Navegação Desktop */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
          {navLinks.map((lnk, idx) => (
            <a
              key={idx}
              href={lnk.href}
              className="hover:text-amber-400 transition-colors tracking-wide"
            >
              {lnk.label}
            </a>
          ))}
        </nav>

        {/* Botão Área do Cliente / Entrar */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/auth"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:border-amber-500/50"
          >
            <User className="size-4 text-amber-400" />
            <span>Entrar / Área do Cliente</span>
          </Link>
        </div>

        {/* Menu Hambúrguer Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menu Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden p-6 bg-slate-950 border-b border-slate-800 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
            {navLinks.map((lnk, idx) => (
              <a
                key={idx}
                href={lnk.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 border-b border-slate-900 hover:text-amber-400"
              >
                {lnk.label}
              </a>
            ))}
          </div>

          <Link
            to="/auth"
            onClick={() => setMobileOpen(false)}
            className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs text-center block"
          >
            Entrar / Área do Cliente
          </Link>
        </div>
      )}
    </header>
  );
};

export default EsolPublicNavbar;
