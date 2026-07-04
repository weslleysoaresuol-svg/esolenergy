import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, ShieldAlert, Mail, Lock } from "lucide-react";
import logo from "@/assets/esol-logo.png";

export const Route = createFileRoute("/auth")({
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Orbes de brilho solar e ambiente no fundo para design de altíssimo nível (Glow Effects) */}
      <div className="absolute top-[-10%] left-[-10%] size-[50vw] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] size-[60vw] rounded-full bg-[#E2B714]/10 blur-[150px] pointer-events-none" />
      
      {/* Coluna Esquerda: Formulário de Login (com visual premium translúcido) */}
      <div className="w-full md:w-[45%] flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <Link to="/" className="transition hover:opacity-95">
            <img src={logo} alt="ESOL Energy" className="h-10 sm:h-11 w-auto" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-navy transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
          </Link>
        </div>

        {/* Formulário Central (Glassmorphism de Maestria) */}
        <div className="my-auto max-w-md w-full mx-auto py-8">
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(8,112,184,0.06)] rounded-3xl p-6 sm:p-8 md:p-10 space-y-6">
            
            <div className="space-y-1 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-black text-navy leading-tight tracking-tight">
                Plataforma ESOL
              </h1>
              <p className="text-xs text-slate-400 font-semibold">
                Insira seus dados para acessar o motor solar e gerenciar leads.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs font-black text-slate-650 tracking-wide">E-mail</Label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B52E2] transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="exemplo@esolenergy.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#3B52E2] focus:ring-1 focus:ring-[#3B52E2] outline-none text-xs w-full transition-all font-medium text-navy"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="auth-password" className="text-xs font-black text-slate-650 tracking-wide">Senha</Label>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B52E2] transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#3B52E2] focus:ring-1 focus:ring-[#3B52E2] outline-none text-xs w-full transition-all font-medium text-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Lembrar e Esqueci */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#3B52E2] focus:ring-0 focus:ring-offset-0 accent-[#3B52E2] size-3.5"
                  />
                  Lembrar acesso
                </label>
                <Link to="/" className="text-slate-400 hover:text-navy transition-colors">
                  Recuperar senha?
                </Link>
              </div>

              {/* Botão Entrar Premium com Gradiente */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-navy to-[#3B52E2] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-glow cursor-pointer transition-all duration-300 mt-2 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? "Autenticando..." : "Acessar Sistema"}
              </Button>

              {/* Divisor */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-400 tracking-wider">
                  <span className="bg-white px-2">Autenticação Social</span>
                </div>
              </div>

              {/* Botão Google */}
              <Button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                variant="outline"
                className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-navy font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </Button>
            </form>
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="bg-slate-100/80 backdrop-blur-sm border border-slate-200/40 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed max-w-md mx-auto flex items-start gap-2.5 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-[#E2B714] shrink-0 mt-0.5" />
          <p>
            <strong>Acesso Restrito:</strong> Se você é um novo corretor ou parceiro, precisa do <strong>link de convite</strong> enviado pelo administrador para realizar o seu cadastro.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Seção Institucional de Maestria (55% da largura) */}
      <div className="hidden md:flex md:w-[55%] bg-gradient-to-br from-navy via-navy-deep to-navy relative overflow-hidden flex-col justify-between p-12 lg:p-16 text-white border-l border-white/5">
        
        {/* Divisória diagonal estilizada para maestria de design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,82,226,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(226,183,20,0.08),transparent_50%)]" />

        {/* Logo no Canto Superior Direito com Slogan */}
        <div className="flex justify-end relative z-10 items-center gap-3">
          <div className="text-right">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-[#E2B714]">Engenharia Solar</span>
            <span className="block text-[6px] text-slate-400 font-semibold">Premium</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <img src={logo} alt="ESOL Energy" className="h-8 w-auto filter brightness-0 invert opacity-90" />
        </div>

        {/* Textos Principais com Maestria de Tipografia */}
        <div className="max-w-lg space-y-4 mt-4 relative z-10">
          <span className="inline-block text-[9px] font-black uppercase tracking-[0.25em] text-[#E2B714] bg-[#E2B714]/10 border border-[#E2B714]/20 px-3 py-1 rounded-full">
            Inovação Fotovoltaica
          </span>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-white tracking-tight">
            Deixe o sol trabalhar por você.
          </h2>
          <p className="text-slate-300 text-sm lg:text-base font-medium leading-relaxed max-w-md">
            Bem-vindo à ferramenta mais inteligente do integrador solar. Dimensionamentos de HSP instantâneos e propostas automatizadas com engenharia fina.
          </p>
        </div>

        {/* Mockups 3D Flutuantes de Maestria (HTML/CSS com perspectiva aprimorada) */}
        <div className="relative flex-1 flex items-center justify-center min-h-[350px] lg:min-h-[420px] select-none perspective-[1200px] mt-6">
          
          {/* Cartão de Fundo 1: Equipamentos (3D Esquerda/Trás) */}
          <div 
            className="absolute left-[8%] top-[10%] w-[58%] bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 transition-all duration-700 hover:scale-[1.03]"
            style={{
              transform: "rotateY(16deg) rotateX(12deg) rotateZ(-3deg) translateZ(40px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2 bg-[#3B52E2] rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-navy uppercase tracking-wider">Kits & Equipamentos</span>
              </div>
              <span className="text-[8px] font-black bg-[#E2B714]/10 text-[#E2B714] px-1.5 py-0.5 rounded">Aldo Solar</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-navy">Residencial 4.4 kWp</div>
                  <div className="text-[7px] font-bold text-slate-400">8 painéis + Inversor</div>
                </div>
                <div className="text-[9.5px] font-extrabold text-[#3B52E2]">R$ 11.230</div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-navy">Comercial 12.1 kWp</div>
                  <div className="text-[7px] font-bold text-slate-400">22 painéis + Inversor</div>
                </div>
                <div className="text-[9.5px] font-extrabold text-[#3B52E2]">R$ 28.450</div>
              </div>
            </div>
          </div>

          {/* Cartão de Fundo 2: Dimensionamento (3D Direita/Trás) */}
          <div 
            className="absolute right-[6%] top-[5%] w-[54%] bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 transition-all duration-700 hover:scale-[1.03]"
            style={{
              transform: "rotateY(-12deg) rotateX(10deg) rotateZ(2deg) translateZ(80px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-[9px] font-black text-navy uppercase tracking-wider">Dimensionamento HSP</span>
              <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">98% Economia</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                <span>Consumo Médio</span>
                <span className="text-navy font-black">650 kWh/mês</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[82%] bg-[#3B52E2] rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                  <div className="text-[7px] text-slate-400 font-bold uppercase">Potência</div>
                  <div className="text-[10px] font-black text-[#3B52E2]">5.5 kWp</div>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                  <div className="text-[7px] text-slate-400 font-bold uppercase">Módulos</div>
                  <div className="text-[10px] font-black text-navy">10 unid.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cartão de Destaque da Frente: Dashboard Principal (3D Centro/Frente com Maestria) */}
          <div 
            className="absolute w-[76%] bg-white border border-slate-100/90 rounded-2xl shadow-deep p-4 sm:p-5 transition-all duration-700 hover:scale-[1.03]"
            style={{
              transform: "rotateY(6deg) rotateX(14deg) rotateZ(-1deg) translateZ(150px) translateY(55px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-gradient-to-br from-navy to-[#3B52E2] flex items-center justify-center text-[10px] font-black text-white">
                  ES
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-navy leading-none">Painel Comercial</h4>
                  <span className="text-[6.5px] font-bold text-[#3B52E2]">Dashboard Unificada</span>
                </div>
              </div>
              <div className="text-[8px] font-extrabold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="size-1 bg-emerald-500 rounded-full animate-ping" />
                Conectado ⚡
              </div>
            </div>

            {/* Simulação de Linhas de Dashboard */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-slate-100 p-2 rounded-xl text-center space-y-0.5 bg-slate-50/50">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block">Leads</span>
                  <div className="text-[11px] font-black text-navy">42</div>
                </div>
                <div className="border border-slate-100 p-2 rounded-xl text-center space-y-0.5 bg-slate-50/50">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block">Propostas</span>
                  <div className="text-[11px] font-black text-navy">127</div>
                </div>
                <div className="border border-slate-100 p-2 rounded-xl text-center space-y-0.5 bg-gradient-to-br from-[#3B52E2]/5 to-[#3B52E2]/10">
                  <span className="text-[7px] font-bold text-[#3B52E2] uppercase tracking-wider block">Economia</span>
                  <div className="text-[11px] font-black text-[#3B52E2]">R$ 142k</div>
                </div>
              </div>

              {/* Gráfico Linear Simulado de Alta Qualidade */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-[7.5px] font-bold text-slate-500">
                  <span>Projeção Mensal de Propostas</span>
                  <span className="text-[#3B52E2] font-black flex items-center gap-0.5">85% conversão</span>
                </div>
                <div className="h-9 flex items-end justify-between px-1 gap-1.5">
                  <div className="w-full bg-slate-200 h-[35%] rounded-t" />
                  <div className="w-full bg-slate-200 h-[50%] rounded-t" />
                  <div className="w-full bg-slate-350 h-[65%] rounded-t" />
                  <div className="w-full bg-[#3B52E2]/40 h-[55%] rounded-t" />
                  <div className="w-full bg-[#3B52E2]/70 h-[80%] rounded-t animate-pulse" />
                  <div className="w-full bg-gradient-to-t from-navy to-[#3B52E2] h-[100%] rounded-t" />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Rodapé da Coluna Direita */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold relative z-10">
          <span>ESOL Energy © {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 bg-[#E2B714] rounded-full" />
            Deixe o sol trabalhar por você.
          </span>
        </div>
      </div>
    </div>
  );
}
