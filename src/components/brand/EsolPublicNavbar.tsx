import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, MessageCircle, User } from 'lucide-react';

export interface EsolPublicNavbarProps {
  className?: string;
}

/**
 * `<EsolPublicNavbar />` — Navbar idêntica ao Mockup Oficial (V13.2)
 */
export const EsolPublicNavbar: React.FC<EsolPublicNavbarProps> = ({ className = '' }) => {
  return (
    <header className={`w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo eSOL energy */}
        <Link to="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-black tracking-tight text-cyan-400">e</span>
          <span className="text-2xl font-black tracking-tight text-white">SOL</span>
          <span className="text-xs font-bold tracking-wider text-amber-400 ml-1 uppercase">energy</span>
        </Link>

        {/* Links Centrais com Dropdowns */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#solucoes" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
            <span>Soluções</span>
            <ChevronDown className="size-3.5 opacity-60" />
          </a>
          <a href="#vantagens" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
            <span>Vantagens</span>
            <ChevronDown className="size-3.5 opacity-60" />
          </a>
          <a href="#simulador" className="hover:text-amber-400 transition-colors">
            Calculadora
          </a>
          <a href="#sobre" className="hover:text-amber-400 transition-colors">
            Sobre Nós
          </a>
        </nav>

        {/* Botão de Ação: Falar com Especialista & Login */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all duration-300"
          >
            <User className="size-3.5 text-cyan-400" />
            <span>Entrar</span>
          </Link>

          <a
            href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20da%20ESOL%20Energy."
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs font-bold text-slate-100 transition-all duration-300 shadow-lg"
          >
            Falar com Especialista
          </a>
        </div>
      </div>
    </header>
  );
};

export default EsolPublicNavbar;
