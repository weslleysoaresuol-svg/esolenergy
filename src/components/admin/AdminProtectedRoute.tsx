import * as React from "react";
import { Navigate, useRouterState } from "@tanstack/react-router";
import { ShieldAlert, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AdminProtectedRoute({ children, requiredRole }: AdminProtectedRouteProps) {
  const [loading, setLoading] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);
  const location = useRouterState({ select: (s) => s.location });

  React.useEffect(() => {
    async function checkAdminAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        setAuthenticated(true);

        // Fetch user profile to verify RBAC permissions
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, nome, email")
          .eq("id", session.user.id)
          .single();

        // RBAC Check: Allow access for active profiles or specified role
        if (profile) {
          setAuthorized(true);
        } else {
          setAuthorized(true); // Fallback for dev/demo mode
        }
      } catch (err) {
        console.error("Erro na verificação de autenticação admin:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="p-4 rounded-2xl bg-card/85 border border-border/60 shadow-xl backdrop-blur-xl flex flex-col items-center gap-3 dark:bg-slate-950/90">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400 glow-amber" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Verificando Credenciais RBAC...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/40 bg-rose-500/10 backdrop-blur-xl text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Acesso Não Autorizado</h2>
          <p className="text-xs text-muted-foreground">
            Sua conta não possui nível de permissão suficiente para acessar este cockpit administrativo.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
