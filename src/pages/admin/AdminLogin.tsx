import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { SunMedium, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SVGFilters } from "@/components/ui/svg-filters";

export function AdminLogin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Erro no login admin:", err);
      setErrorMsg(err.message || "Credenciais inválidas ou acesso não permitido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-amber-400/30 selection:text-amber-500 font-sans antialiased relative overflow-hidden">
      <SVGFilters />

      {/* Background Decorative Neon Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <Card className="rounded-2xl border border-amber-400/30 bg-card/90 shadow-2xl backdrop-blur-2xl dark:bg-slate-950/90 dark:border-slate-800">
          <CardHeader className="space-y-3 text-center pb-6 border-b border-border/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-bold shadow-lg glow-amber">
              <SunMedium className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">
                Portal Administrativo ESOL
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Autenticação Corporativa Segura & Controles RBAC
              </CardDescription>
            </div>

            <div className="flex justify-center">
              <Badge variant="emerald" className="gap-1 text-[10px] uppercase">
                <ShieldCheck className="h-3 w-3" />
                MFA AAL2 Protection
              </Badge>
            </div>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-email">E-mail de Acesso Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    placeholder="diretoria@esolenergy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 text-xs rounded-xl focus-visible:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Senha de Segurança</Label>
                  <span className="text-[10px] text-amber-500 font-semibold cursor-pointer hover:underline">
                    Esqueceu a senha?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 text-xs rounded-xl focus-visible:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6">
              <Button
                type="submit"
                variant="sun"
                size="xl"
                disabled={loading}
                className="w-full justify-center gap-2 rounded-xl text-slate-950 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Cockpit Admin</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
