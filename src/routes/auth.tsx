import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  Mail, 
  Lock, 
  SunMedium, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { EsolLogoPrimary } from "@/components/brand/EsolLogoPrimary";
import { EsolLogoNegative } from "@/components/brand/EsolLogoNegative";

export const Route = createFileRoute("/auth")({
  loader: async () => ({}),
  head: () => ({ meta: [{ title: "Acesso ao Ecossistema — ESOL Energy" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        navigate({ to: "/app" });
      }
    }).catch(() => {
      // Estado esperado para visitante não autenticado
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/app`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          }
        },
      });
      if (error) {
        toast.error(`Falha no login com Google: ${error.message}`);
      }
    } catch (err: any) {
      toast.error("Erro ao conectar com o serviço de autenticação do Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha o e-mail e a senha.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message || "Credenciais inválidas. Verifique seu e-mail e senha.");
      } else {
        toast.success("Autenticação realizada com sucesso!");
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col md:flex-row relative overflow-hidden md:h-screen font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Glows Cinematográficos */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* COLUNA ESQUERDA: FORMULÁRIO DE LOGIN DE ALTA SOFISTICAÇÃO */}
      <div className="w-full md:w-[48%] lg:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 bg-[#070D1E]/95 backdrop-blur-2xl border-r border-slate-800/80 md:h-full overflow-y-auto scrollbar-thin">
        
        {/* Barra Superior */}
        <div className="flex items-center justify-between">
          <Link to="/" className="transition hover:opacity-90 flex items-center">
            <EsolLogoNegative width={190} showTagline={false} />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao site
          </Link>
        </div>

        {/* Bloco Central: Acesso */}
        <div className="my-auto max-w-sm w-full mx-auto py-8 space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Cockpit do Consultor & Executivo
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Acesse sua conta
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              Plataforma integrada de engenharia solar, dimensionamento e gestão de comissões.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* BOTÃO GOOGLE OAUTH PREMIUM */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-xl shadow-white/5 hover:shadow-amber-500/10 border border-slate-200 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{googleLoading ? "Conectando com o Google..." : "Continuar com o Google"}</span>
            </button>

            {/* Divisor Elegante */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800/80"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span className="bg-[#070D1E] px-3 text-slate-400">Ou entre com e-mail corporativo</span>
              </div>
            </div>

            {/* FORMULÁRIO DE LOGIN TRADICIONAL */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Campo E-mail */}
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  E-mail
                </Label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="seu.nome@esolenergy.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 pr-3 rounded-xl border border-slate-800 bg-slate-950/70 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-white placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="auth-password" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Senha
                  </Label>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10 rounded-xl border border-slate-800 bg-slate-950/70 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-white placeholder:text-slate-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Opções Auxiliares */}
              <div className="flex items-center justify-between text-xs font-medium pt-1">
                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 accent-amber-500 size-3.5"
                  />
                  Lembrar acesso
                </label>
                <Link to="/" className="text-slate-400 hover:text-amber-400 transition-colors text-[11px]">
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de Submissão */}
              <Button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Autenticando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar no Cockpit
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Rodapé Informativo e Certificação */}
        <div className="pt-4 border-t border-slate-800/60">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-[11px] text-slate-400 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Novo no ecossistema?</strong>
              Para ingressar como consultor ou parceiro homologado, utilize o link de convite fornecido pelo seu líder de equipe.
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: VITRINE DE ENGENHARIA SOLAR & TELEMETRIA REAL */}
      <div 
        className="hidden md:flex md:w-[52%] lg:w-[58%] relative overflow-hidden flex-col justify-between p-10 lg:p-14 text-white bg-cover bg-center"
        style={{ backgroundImage: `url('/images/esol_real_drone_rooftop_installation.jpg')` }}
      >
        {/* Camada de Gradiente Escuro de Alto Contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/70 to-[#040814]/40 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070D1E] via-transparent to-transparent z-0" />

        {/* Header Superior Direito */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[11px] font-semibold text-slate-300">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Rede Elétrica eSOL Online
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Engenharia Homologada</span>
            <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Padrão Aneel & CREA</span>
          </div>
        </div>

        {/* Cards Flutuantes de Telemetria e Impacto */}
        <div className="max-w-xl space-y-6 mt-auto mb-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold">
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            Ecossistema Solar Inteligente
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight text-white tracking-tight">
            Deixe o sol trabalhar <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              pelo seu futuro financeiro.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
            Gerencie usinas fotovoltaicas, gere propostas com Inteligência Artificial em 30 segundos e acompanhe comissões em tempo real.
          </p>

          {/* Métricas Strip */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800">
              <span className="block text-lg font-black text-amber-400">95%</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Economia na Conta</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800">
              <span className="block text-lg font-black text-emerald-400">25 Anos</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Garantia N-Type</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800">
              <span className="block text-lg font-black text-cyan-400">7 Níveis</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rede Comercial</span>
            </div>
          </div>
        </div>

        {/* Rodapé da Imagem */}
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold relative z-10 pt-4 border-t border-slate-800/40">
          <span>ESOL Energy © {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Criptografia TLS 1.3 de Ponta a Ponta
          </span>
        </div>
      </div>
    </div>
  );
}
