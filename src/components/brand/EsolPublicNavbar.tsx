import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { EsolOfficialBrandSymbol } from '@/components/brand/EsolOfficialBrandSymbol';
import { User, Menu, X, Sun, Moon, Sparkles, Palette } from 'lucide-react';

export interface EsolPublicNavbarProps {
  className?: string;
}

/**
 * `<EsolPublicNavbar />` — Navbar Energitech do Site Institucional Público (V15.0)
 * Design Glassmorphism de alta tecnologia com o logotipo oficial esol energy. reluzente.
 */
export const EsolPublicNavbar: React.FC<EsolPublicNavbarProps> = ({ className = '' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navLinks = [
    { label: 'Simulador 3-em-1', href: '#simulador' },
    { label: 'Ecossistema Esol', href: '#ecossistema' },
    { label: 'App & Monitoramento', href: '#app-preview' },
    { label: 'Prova Social & Usinas', href: '#prova-social' },
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className={`sticky top-0 z-[40] bg-[#0F172A]/90 backdrop-blur-2xl border-b border-slate-800/80 shadow-2xl ${className}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo mestre esol energy. */}
        <Link to="/" className="flex items-center gap-2 group">
          <EsolOfficialBrandSymbol width={220} />
        </Link>

        {/* Links de Navegação Desktop */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
          {navLinks.map((lnk, idx) => (
            <a
              key={idx}
              href={lnk.href}
              className="hover:text-emerald-400 transition-colors tracking-wide py-2"
            >
              {lnk.label}
            </a>
          ))}

          <Link
            to="/app/marca"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Palette className="size-3.5" />
            <span>Central de Brand</span>
          </Link>
        </nav>

        {/* CTAs & Switcher de Tema */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-all cursor-pointer"
            title="Alternar Tema (Dark / Light)"
          >
            {isDarkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
          </button>

          <Link
            to="/auth"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:border-emerald-500/40"
          >
            <User className="size-3.5 text-emerald-400" />
            <span>Área do Cliente</span>
          </Link>

          <a
            href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20da%20ESOL%20Energy."
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs transition-all duration-300 shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer"
          >
            Estudo Gratuito CREA
          </a>
        </div>

        {/* Menu Hambúrguer Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menu Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden p-6 bg-[#0F172A] border-b border-slate-800 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
            {navLinks.map((lnk, idx) => (
              <a
                key={idx}
                href={lnk.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 border-b border-slate-900 hover:text-emerald-400"
              >
                {lnk.label}
              </a>
            ))}
            <Link
              to="/app/marca"
              onClick={() => setMobileOpen(false)}
              className="py-2 border-b border-slate-900 text-emerald-400 font-bold flex items-center gap-2"
            >
              <Palette className="size-4" />
              <span>Central de Brand</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs text-center"
            >
              Área do Cliente / Entrar
            </Link>

            <a
              href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20da%20ESOL%20Energy."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs text-center block"
            >
              Estudo Gratuito CREA
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default EsolPublicNavbar;
