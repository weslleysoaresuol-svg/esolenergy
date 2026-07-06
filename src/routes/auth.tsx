import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, ShieldAlert, Mail, Lock } from "lucide-react";
import logo from "@/assets/esol-logo.svg";
import heroHouse from "@/assets/hero-house.jpg";

export const Route = createFileRoute("/auth")({
  loader: async () => {
    if (typeof window === "undefined") {
      try {
        const fs = await import("fs");
        const path = await import("path");
        
        const sourceLogo = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783188730454.png";
        const destLogo = path.join(process.cwd(), "src", "assets", "esol-logo.png");
        if (fs.existsSync(sourceLogo)) {
          fs.copyFileSync(sourceLogo, destLogo);
          console.log("⚡ [ESOL SSR] Logo copiada com sucesso!");
        }

        const sourceFav = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783190599008.png";
        const destFav = path.join(process.cwd(), "public", "favicon.png");
        if (fs.existsSync(sourceFav)) {
          fs.copyFileSync(sourceFav, destFav);
          console.log("⚡ [ESOL SSR] Favicon copiado com sucesso!");
        }
      } catch (e) {
        console.error("❌ [ESOL SSR] Erro na cópia de mídias:", e);
      }
    }
    return {};
  },
  head: () => ({ meta: [{ title: "Acesso — ESOL Energy" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app" });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
      if (res.error) toast.error("Falha no login com Google");
      else if (!res.redirected) navigate({ to: "/app" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden md:h-screen font-sans">
      
      {/* Glow ambientais de fundo */}
      <div className="absolute top-[-10%] left-[-10%] size-[50vw] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] size-[60vw] rounded-full bg-[#E2B714]/5 blur-[150px] pointer-events-none" />
      
      {/* Coluna Esquerda: Formulário de Login (Ocupa exatamente a altura no desktop) */}
      <div className="w-full md:w-[42%] flex flex-col justify-between p-6 sm:p-8 md:p-10 relative z-10 bg-white border-r border-slate-100 md:h-full overflow-y-auto scrollbar-thin">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <Link to="/" className="transition hover:opacity-95">
            <img src={logo} alt="ESOL Energy" className="h-16 w-auto" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-navy transition-all uppercase tracking-wider">
            <ArrowLeft className="w-3 h-3" /> Site
          </Link>
        </div>

        {/* Formulário Central Compacto (Google no topo, E-mail/Senha embaixo) */}
        <div className="my-auto max-w-sm w-full mx-auto py-6 space-y-5">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-xl font-black text-navy tracking-tight">
              Acesso à plataforma
            </h1>
            <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
              Faça login para gerenciar suas leads e propostas de engenharia solar.
            </p>
          </div>

          <div className="space-y-4">
            {/* Botão Google - No Topo por recomendação de usabilidade */}
            <Button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full h-10 border border-slate-200 hover:bg-slate-50 text-navy font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Acessar com Google
            </Button>

            {/* Divisor */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-400 tracking-wider">
                <span className="bg-white px-2">Ou com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="auth-email" className="text-[10px] font-black text-slate-500 uppercase tracking-wider">E-mail</Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B52E2] transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#3B52E2] focus:ring-1 focus:ring-[#3B52E2] outline-none text-xs w-full transition-all font-medium text-navy"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1 relative">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="auth-password" className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Senha</Label>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B52E2] transition-colors">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 pl-9 pr-9 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#3B52E2] focus:ring-1 focus:ring-[#3B52E2] outline-none text-xs w-full transition-all font-medium text-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3B52E2] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Lembrar e Esqueci */}
              <div className="flex items-center justify-between text-[10px] font-bold">
                <label className="flex items-center gap-1 text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-350 text-[#3B52E2] focus:ring-0 focus:ring-offset-0 accent-[#3B52E2] size-3"
                  />
                  Lembrar acesso
                </label>
                <Link to="/" className="text-slate-400 hover:text-[#3B52E2] transition-colors">
                  Recuperar senha?
                </Link>
              </div>

              {/* Botão Entrar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-gradient-to-r from-navy to-[#3B52E2] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-glow cursor-pointer transition-all duration-300 mt-1 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? "Autenticando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>

        {/* Rodapé Informativo Compactado */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[9.5px] text-slate-500 leading-relaxed max-w-sm mx-auto flex items-start gap-2 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-[#E2B714] shrink-0 mt-0.5" />
          <p>
            <strong>Convites:</strong> Novo parceiro? Para se cadastrar, utilize o <strong>link de convite</strong> enviado pelo administrador do painel.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Seção Institucional de Maestria (58% da largura, exibe imagem conceitual real de energia solar!) */}
      <div 
        className="hidden md:flex md:w-[58%] relative overflow-hidden flex-col justify-between p-10 lg:p-12 text-white border-l border-slate-100 md:h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroHouse})` }}
      >
        {/* Overlay escuro em gradiente de alta fusão de cor para legibilidade e elegância */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/35 to-navy/15 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/30 to-transparent z-0" />

        {/* Logo do Canto Superior Direito com Slogan */}
        <div className="flex justify-end relative z-10 items-center gap-2">
          <div className="text-right">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-[#E2B714]">ESOL Energy</span>
            <span className="block text-[6px] text-slate-350 font-bold uppercase tracking-wider">Premium Tech</span>
          </div>
          <div className="h-5 w-px bg-white/20" />
          <img src={logo} alt="ESOL Energy" className="h-10 w-auto filter brightness-0 invert opacity-90" />
        </div>

        {/* Textos Principais / Slogan Concept */}
        <div className="max-w-lg space-y-3 mt-auto mb-4 relative z-10">
          <span className="inline-block text-[8px] font-black uppercase tracking-[0.2em] text-[#E2B714] bg-[#E2B714]/15 border border-[#E2B714]/25 px-2.5 py-0.5 rounded-full">
            Energia do Futuro
          </span>
          <h2 className="text-3xl lg:text-4xl font-black leading-tight text-white tracking-tight">
            Deixe o sol trabalhar por você.
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-sm font-medium">
            Projetando o futuro da geração distribuída com dimensionamento de alta precisão e integrações inteligentes Tier 1.
          </p>
        </div>

        {/* Rodapé da Coluna Direita */}
        <div className="flex justify-between items-center text-[9px] text-slate-350 font-bold relative z-10">
          <span>ESOL Energy © {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <span className="size-1 bg-[#E2B714] rounded-full" />
            Engenharia Solar Fotovoltaica
          </span>
        </div>
      </div>
    </div>
  );
}
