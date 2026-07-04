import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, ShieldAlert } from "lucide-react";
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
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Coluna Esquerda: Formulário de Login */}
      <div className="w-full md:w-[48%] flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 relative z-10 bg-white">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <Link to="/" className="transition hover:opacity-90">
            <img src={logo} alt="ESOL Energy" className="h-10 sm:h-12 w-auto" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-navy transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
          </Link>
        </div>

        {/* Formulário Central */}
        <div className="my-auto max-w-sm w-full mx-auto py-8 space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-navy leading-tight">
              Acesso à plataforma
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Entre com as suas credenciais de integrador solar ESOL Energy.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="auth-email" className="text-xs font-bold text-slate-700">Email</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="Insira seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 px-3.5 rounded-xl border border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-xs w-full transition"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1 relative">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="auth-password" className="text-xs font-bold text-slate-700">Senha</Label>
              </div>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-xs w-full transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition"
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
                  className="rounded border-slate-350 text-navy focus:ring-0 focus:ring-offset-0 accent-navy"
                />
                Lembrar senha
              </label>
              <Link to="/" className="text-slate-400 hover:text-navy transition">
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#3B52E2] hover:bg-[#2C41C9] text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Divisor */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white px-2">Ou</span>
              </div>
            </div>

            {/* Botão Google */}
            <Button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-navy font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Acessar com Google
            </Button>
          </form>
        </div>

        {/* Rodapé Informativo */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#E2B714] shrink-0 mt-0.5" />
          <p>
            <strong>Acesso Restrito:</strong> Se você é um novo corretor ou parceiro, precisa do <strong>link de convite</strong> enviado pelo administrador para realizar o seu cadastro.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Seção Institucional com Mockup 3D */}
      <div className="hidden md:flex md:w-[52%] bg-gradient-to-br from-[#EBF0FF] via-[#F4F7FF] to-[#EBF0FF] relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        
        {/* Marca d'água solar sutil no fundo */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo do Canto Superior Direito */}
        <div className="flex justify-end relative z-10">
          <img src={logo} alt="ESOL Energy" className="h-8 w-auto filter drop-shadow-sm opacity-90" />
        </div>

        {/* Textos Principais */}
        <div className="max-w-md space-y-3 mt-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#3B52E2] leading-tight">
            Bem-vindo!
          </h2>
          <p className="text-navy text-xl lg:text-2xl font-black leading-snug">
            A plataforma <span className="text-[#3B52E2]">mais completa</span> do mercado para o <span className="text-[#3B52E2]">integrador solar</span>.
          </p>
        </div>

        {/* Mockups 3D Flutuantes (HTML/CSS) */}
        <div className="relative flex-1 flex items-center justify-center min-h-[350px] lg:min-h-[420px] select-none perspective-[1000px] mt-4">
          
          {/* Cartão de Fundo 1: Equipamentos (3D Esquerda) */}
          <div 
            className="absolute left-[8%] top-[15%] w-[62%] bg-white border border-slate-100 rounded-xl shadow-2xl p-4 transition-all duration-1000 hover:scale-105"
            style={{
              transform: "rotateY(18deg) rotateX(10deg) rotateZ(-3deg) translateZ(50px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2 bg-[#3B52E2] rounded-full" />
                <span className="text-[9px] font-black text-navy uppercase tracking-wider">Kits de Equipamentos</span>
              </div>
              <span className="text-[8px] font-extrabold bg-[#E2B714]/10 text-[#E2B714] px-1.5 py-0.5 rounded">Aldo Solar</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-navy">Residencial 4.4 kWp</div>
                  <div className="text-[7px] font-semibold text-slate-400">8 painéis 550W + Inversor</div>
                </div>
                <div className="text-[9px] font-extrabold text-[#3B52E2]">R$ 11.230</div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-navy">Comercial 12.1 kWp</div>
                  <div className="text-[7px] font-semibold text-slate-400">22 painéis 550W + Inversor</div>
                </div>
                <div className="text-[9px] font-extrabold text-[#3B52E2]">R$ 28.450</div>
              </div>
            </div>
          </div>

          {/* Cartão de Fundo 2: Dimensionamento (3D Direita) */}
          <div 
            className="absolute right-[6%] top-[8%] w-[58%] bg-white border border-slate-100 rounded-xl shadow-2xl p-4 transition-all duration-1000 hover:scale-105"
            style={{
              transform: "rotateY(-15deg) rotateX(8deg) rotateZ(2deg) translateZ(80px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <span className="text-[9px] font-black text-navy uppercase tracking-wider">Dimensionamento Rápido</span>
              <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">98% Economia</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                <span>Consumo informado</span>
                <span className="text-navy font-black">650 kWh</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[82%] bg-[#3B52E2] rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 p-1.5 rounded text-center">
                  <div className="text-[7px] text-slate-400 font-bold uppercase">Potência</div>
                  <div className="text-[10px] font-black text-[#3B52E2]">5.5 kWp</div>
                </div>
                <div className="bg-slate-50 p-1.5 rounded text-center">
                  <div className="text-[7px] text-slate-400 font-bold uppercase">Módulos</div>
                  <div className="text-[10px] font-black text-navy">10 unid.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cartão da Frente: Dashboard Principal (Flutuando no Centro/Frente) */}
          <div 
            className="absolute w-[78%] bg-white border border-slate-100 rounded-2xl shadow-deep p-4 sm:p-5 transition-all duration-1000 hover:scale-105"
            style={{
              transform: "rotateY(8deg) rotateX(12deg) rotateZ(-1deg) translateZ(140px) translateY(40px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-full bg-[#3B52E2]/10 flex items-center justify-center">
                  <span className="size-2 bg-[#3B52E2] rounded-full" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-navy leading-none">Painel ESOL</h4>
                  <span className="text-[6.5px] font-bold text-slate-400">Sua Usina Inteligente</span>
                </div>
              </div>
              <div className="text-[8px] font-extrabold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                Online ⚡
              </div>
            </div>

            {/* Simulação de Linhas de Dashboard */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-slate-100 p-2 rounded-xl text-center space-y-0.5">
                  <span className="text-[7px] font-bold text-slate-400 uppercase">Leads Ativas</span>
                  <div className="text-[11px] font-black text-navy">42</div>
                </div>
                <div className="border border-slate-100 p-2 rounded-xl text-center space-y-0.5">
                  <span className="text-[7px] font-bold text-slate-400 uppercase">Propostas</span>
                  <div className="text-[11px] font-black text-navy">127</div>
                </div>
                <div className="border border-slate-100 p-2 rounded-xl text-center space-y-0.5 bg-[#3B52E2]/5">
                  <span className="text-[7px] font-bold text-[#3B52E2] uppercase">Faturamento</span>
                  <div className="text-[11px] font-black text-[#3B52E2]">R$ 142k</div>
                </div>
              </div>

              {/* Gráfico Linear Simulado */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-150/50 space-y-1.5">
                <div className="flex justify-between items-center text-[7.5px] font-bold text-slate-500">
                  <span>Volume Mensal de Propostas</span>
                  <span className="text-emerald-600 font-extrabold">+18.5%</span>
                </div>
                <div className="h-8 flex items-end justify-between px-1 gap-1.5">
                  <div className="w-full bg-slate-200 h-[30%] rounded-t-sm" />
                  <div className="w-full bg-slate-200 h-[45%] rounded-t-sm" />
                  <div className="w-full bg-slate-300 h-[60%] rounded-t-sm" />
                  <div className="w-full bg-[#3B52E2]/50 h-[50%] rounded-t-sm" />
                  <div className="w-full bg-[#3B52E2]/80 h-[75%] rounded-t-sm" />
                  <div className="w-full bg-[#3B52E2] h-[100%] rounded-t-sm" />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Rodapé da Coluna Direita */}
        <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold relative z-10">
          <span>ESOL Energy © {new Date().getFullYear()}</span>
          <span>Tecnologia Solar Premium</span>
        </div>
      </div>
    </div>
  );
}
