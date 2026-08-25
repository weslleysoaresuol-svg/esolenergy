import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, ShieldAlert, Mail, Lock } from "lucide-react";
import { EsolLogoPrimary } from "@/components/brand/EsolLogoPrimary";
import { EsolLogoNegative } from "@/components/brand/EsolLogoNegative";
import heroHouse from "@/assets/hero-house.jpg";

export const Route = createFileRoute("/auth")({
  loader: async () => ({}),
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
      if (data?.user) navigate({ to: "/app" });
    }).catch(() => {
      // Unauthenticated visitor is the expected state on /auth
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/app" },
      });
      if (error) {
        toast.error(`Falha no login com Google: ${error.message}`);
      }
    } catch (err: any) {
      toast.error("Erro ao conectar com servidor de autenticação do Google");
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
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden md:h-screen font-sans">
      
      {/* Glow ambientais de fundo */}
      <div className="absolute top-[-10%] left-[-10%] size-[50vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] size-[60vw] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      
      {/* Coluna Esquerda: Formulário de Login (Ocupa exatamente a altura no desktop) */}
      <div className="w-full md:w-[42%] flex flex-col justify-between p-6 sm:p-8 md:p-10 relative z-10 bg-slate-900 border-r border-slate-800 md:h-full overflow-y-auto scrollbar-thin">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <Link to="/" className="transition hover:opacity-95">
            <EsolLogoPrimary variant="dark" width={200} showTagline={false} />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-all uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" /> Site
          </Link>
        </div>

        {/* Formulário Central Compacto */}
        <div className="my-auto max-w-sm w-full mx-auto py-6 space-y-5">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Acesso à plataforma
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Faça login para gerenciar suas leads, propostas e rede comercial MMN.
            </p>
          </div>

          <div className="space-y-4">
            {/* Botão Google - No Topo por recomendação de usabilidade */}
            <Button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full h-11 border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com o Google
            </Button>

            {/* Divisor */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-400">Ou com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="auth-email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail</Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 pl-9 pr-3 rounded-xl border border-slate-800 bg-slate-950/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs w-full transition-all font-medium text-white"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1 relative">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="auth-password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Senha</Label>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 pl-9 pr-9 rounded-xl border border-slate-800 bg-slate-950/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs w-full transition-all font-medium text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Lembrar e Esqueci */}
              <div className="flex items-center justify-between text-[11px] font-medium">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0 accent-amber-500 size-3.5"
                  />
                  Lembrar acesso
                </label>
                <Link to="/" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão Entrar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all duration-300 mt-1 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? "Autenticando..." : "Entrar na Plataforma"}
              </Button>
            </form>
          </div>
        </div>

        {/* Rodapé Informativo Compactado */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto flex items-start gap-2.5 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Convites:</strong> Novo parceiro? Para se cadastrar, utilize o <strong>link de indicação</strong> enviado pelo seu consultor ou líder de rede.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Seção Institucional de Maestria */}
      <div 
        className="hidden md:flex md:w-[58%] relative overflow-hidden flex-col justify-between p-10 lg:p-12 text-white border-l border-slate-800 md:h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroHouse})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent z-0" />

        {/* Logo do Canto Superior Direito com Slogan */}
        <div className="flex justify-end relative z-10 items-center gap-3">
          <div className="text-right">
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">ESOL Energy</span>
            <span className="block text-[7px] text-slate-400 font-bold uppercase tracking-wider">Ecossistema Solar</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <EsolLogoNegative width={180} showTagline={false} />
        </div>

        {/* Textos Principais */}
        <div className="max-w-lg space-y-3 mt-auto mb-4 relative z-10">
          <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Plataforma Corporativa & MMN
          </span>
          <h2 className="text-3xl lg:text-4xl font-black leading-tight text-white tracking-tight">
            Deixe o sol trabalhar por você.
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm font-medium">
            Gerencie propostas de engenharia solar, acompanhe vistorias e multiplique comissões em 7 níveis de rede comercial.
          </p>
        </div>

        {/* Rodapé da Coluna Direita */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold relative z-10">
          <span>ESOL Energy © {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 bg-amber-400 rounded-full animate-ping" />
            Engenharia Solar & Geração Distribuída
          </span>
        </div>
      </div>
    </div>
  );
}
