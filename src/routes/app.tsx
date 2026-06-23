import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UserCircle, LogOut, Briefcase, UserCog, Plus, FileText } from "lucide-react";
import logo from "@/assets/esol-logo.png";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Painel — ESOL Energy" }] }),
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const { user, role, profile, loading } = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && profile && !profile.onboarding_completo && pathname !== "/app/perfil") {
      navigate({ to: "/app/perfil" });
      return;
    }
    if (
      !loading && user && profile && profile.onboarding_completo &&
      role && role !== "admin" && !profile.contrato_assinado &&
      pathname !== "/app/contrato" && pathname !== "/app/perfil"
    ) {
      navigate({ to: "/app/contrato" });
    }
  }, [loading, user, profile, role, pathname, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const adminNav = [
    { to: "/app", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/app/clientes", icon: Users, label: "Clientes" },
    { to: "/app/novo", icon: Plus, label: "Novo cliente" },
    { to: "/app/corretores", icon: UserCog, label: "Parceiros" },
    { to: "/app/contratos", icon: FileText, label: "Contratos" },
    { to: "/app/perfil", icon: UserCircle, label: "Meu perfil" },
  ];
  const corretorNav = [
    { to: "/app", icon: Briefcase, label: "Meus clientes", exact: true },
    { to: "/app/novo", icon: Plus, label: "Novo cliente" },
    { to: "/app/perfil", icon: UserCircle, label: "Meu perfil" },
  ];
  const nav = role === "admin" ? adminNav : corretorNav;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col bg-navy text-white p-5">
        <Link to="/" className="mb-8"><img src={logo} alt="ESOL" className="h-10 w-auto brightness-0 invert" /></Link>
        <div className="mb-6 px-2">
          <div className="text-xs uppercase tracking-wider text-white/50">{role === "admin" ? "Administrador" : "Parceiro"}</div>
          <div className="font-semibold truncate">{profile?.nome || user.email}</div>
        </div>
        <nav className="space-y-1 flex-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? "bg-sun text-navy" : "text-white/80 hover:bg-white/10"}`}>
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            );
          })}
        </nav>
        <Button onClick={signOut} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 justify-start">
          <LogOut className="w-4 h-4 mr-2" />Sair
        </Button>
      </aside>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-navy text-white z-40 flex items-center justify-between px-4 h-14">
        <img src={logo} alt="ESOL" className="h-8 w-auto brightness-0 invert" />
        <select value={pathname} onChange={(e) => navigate({ to: e.target.value })} className="bg-navy-deep text-white text-sm rounded px-2 py-1 border border-white/20">
          {nav.map((n) => <option key={n.to} value={n.to}>{n.label}</option>)}
        </select>
      </div>

      <main className="flex-1 md:p-8 p-4 pt-20 md:pt-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
