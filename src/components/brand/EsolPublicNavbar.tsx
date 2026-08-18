import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';
import { User, Menu, X, ArrowUpRight, Zap } from 'lucide-react';

export interface EsolPublicNavbarProps {
  className?: string;
}

/**
 * `<EsolPublicNavbar />` — Navbar Ultra-Compacta & Tecnológica Estilo Startup Tech 2026
 */
export const EsolPublicNavbar: React.FC<EsolPublicNavbarProps> = ({ className = '' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Simulador', href: '#simulador' },
    { label: 'Ecossistema 3D', href: '#fluxo-energetico' },
    { label: 'Tecnologia', href: '#diferenciais' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] bg-[#080E21]/80 backdrop-blur-xl border-b border-slate-800/60 shadow-xl transition-all ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo mestre esol energy. em escala precisa */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <EsolOfficialBrandSymbol width={140} />
        </Link>

        {/* Links de Navegação Desktop Minimalistas */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          {navLinks.map((lnk, idx) => (
            <a
              key={idx}
              href={lnk.href}
              className="hover:text-emerald-400 transition-colors py-1"
            >
              {lnk.label}
            </a>
          ))}
        </nav>

        {/* CTAs Diretos de Startup */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            to="/auth"
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <User className="size-3.5 text-emerald-400" />
            <span>Área do Cliente</span>
          </Link>

          <a
            href="#simulador"
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="size-3.5 fill-slate-950" />
            <span>Simular Agora</span>
          </a>
        </div>

        {/* Botão Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Menu Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden p-5 bg-[#080E21] border-b border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2.5 text-xs font-semibold text-slate-300">
            {navLinks.map((lnk, idx) => (
              <a
                key={idx}
                href={lnk.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 hover:text-emerald-400"
              >
                {lnk.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs text-center"
            >
              Área do Cliente / Entrar
            </Link>

            <a
              href="#simulador"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs text-center block"
            >
              Simular Agora
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default EsolPublicNavbar;
