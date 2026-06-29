import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNotificacoes, type Notificacao } from "@/hooks/use-notificacoes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, UserCircle, LogOut, Briefcase, UserCog,
  Plus, FileText, Link2, FileSpreadsheet, BarChart3, Settings,
  Bell, CheckCheck, X, ExternalLink, Sun, ShoppingCart, Landmark, Zap,
} from "lucide-react";
import logo from "@/assets/esol-logo.png";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Painel — ESOL Energy" }] }),
  component: AppShell,
});

const TIPO_ICON: Record<string, string> = {
  novo_lead:            "🎯",
  proposta_aceita:      "🎉",
  proposta_visualizada: "👀",
  lead_frio:            "⏰",
  proposta_expirando:   "⚠️",
};

const TIPO_LINK: Record<string, (dados: any) => string> = {
  novo_lead:            (d) => d.cliente_id ? `/app/cliente/${d.cliente_id}` : "/app",
  proposta_aceita:      (d) => d.proposta_id ? `/app/propostas/${d.proposta_id}` : "/app/propostas",
  proposta_visualizada: (d) => d.proposta_id ? `/app/propostas/${d.proposta_id}` : "/app/propostas",
};

function NotificacoesSino({ notificacoes, naoLidas, marcarLida, marcarTodasLidas, excluirNotificacao }: ReturnType<typeof useNotificacoes>) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (notif: Notificacao) => {
    await marcarLida(notif.id);
    const getLinkFn = TIPO_LINK[notif.tipo];
    if (getLinkFn) {
      const link = getLinkFn(notif.dados);
      navigate({ to: link as any });
    }
    setOpen(false);
  };

  const fmtTime = (d: string) => {
    const now = Date.now();
    const diff = Math.floor((now - new Date(d).getTime()) / 1000);
    if (diff < 60) return "agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition"
      >
        <Bell className="w-4 h-4" />
        <span>Notificações</span>
        {naoLidas > 0 && (
          <span className="absolute top-1.5 left-5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-md animate-pulse">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full top-0 ml-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-navy" />
              <span className="font-bold text-navy text-sm">Notificações</span>
              {naoLidas > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {naoLidas} nova{naoLidas > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasLidas}
                className="text-xs text-sun-deep hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> Marcar todas lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-50">
            {notificacoes.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Nenhuma notificação ainda.</p>
                <p className="text-xs mt-1">Você será notificado em tempo real aqui.</p>
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={`group flex gap-3 p-3 hover:bg-slate-50 transition cursor-pointer ${!n.lida ? "bg-blue-50/60" : ""}`}
                  onClick={() => handleClick(n)}
                >
                  {/* Ícone */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg ${!n.lida ? "bg-navy/10" : "bg-slate-100"}`}>
                    {TIPO_ICON[n.tipo] || "🔔"}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-snug ${!n.lida ? "text-navy" : "text-slate-700"}`}>
                      {n.titulo}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {n.mensagem}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{fmtTime(n.created_at)}</span>
                      {!n.lida && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                      )}
                      {TIPO_LINK[n.tipo] && (
                        <ExternalLink className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                  </div>

                  {/* Botão excluir */}
                  <button
                    onClick={(e) => { e.stopPropagation(); excluirNotificacao(n.id); }}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-red-500 mt-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="border-t p-2 bg-slate-50 text-center">
              <p className="text-[10px] text-muted-foreground">
                🔔 Notificações em tempo real via Supabase Realtime
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const { user, role, profile, loading } = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const modoAtivo = useRouterState({ select: (s) => (s.location.search as any)?.modo as string | undefined });
  const notifData = useNotificacoes();
  const { naoLidas } = notifData;

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
      role && role === "corretor" && !profile.contrato_assinado &&
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

  if (!loading && user && role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md text-center bg-white rounded-2xl shadow p-8">
          <h1 className="text-xl font-bold text-navy mb-2">Acesso pendente</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sua conta foi criada, mas ainda não está vinculada à equipe ESOL Energy. Solicite um <strong>link de convite</strong> ao administrador para concluir seu cadastro.
          </p>
          <Button onClick={signOut} variant="outline" className="w-full">Sair</Button>
        </div>
      </div>
    );
  }

  const adminNav = [
    { to: "/app", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/app/clientes", icon: Users, label: "Clientes & Leads" },
    { to: "/app/cotacoes", icon: Zap, label: "Cotações" },
    { to: "/app/propostas", icon: FileSpreadsheet, label: "Propostas" },
    { to: "/app/pedidos", icon: ShoppingCart, label: "Pedidos" },
    { to: "/app/financiamentos", icon: Landmark, label: "Financiamentos" },
    { to: "/app/financeiro", icon: Landmark, label: "Financeiro" },
    { to: "/app/kits", icon: Sun, label: "Kits Solares" },
    { to: "/app/corretores", icon: UserCog, label: "Parceiros & Convites" },
    { to: "/app/parametros", icon: Settings, label: "Parâmetros" },
    { to: "/app/perfil", icon: UserCircle, label: "Meu Perfil" },
  ];

  const auxiliarNav = [
    { to: "/app", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/app/clientes", icon: Users, label: "Clientes & Leads" },
    { to: "/app/cotacoes", icon: Zap, label: "Cotações" },
    { to: "/app/propostas", icon: FileSpreadsheet, label: "Propostas" },
    { to: "/app/pedidos", icon: ShoppingCart, label: "Pedidos" },
    { to: "/app/financiamentos", icon: Landmark, label: "Financiamentos" },
    { to: "/app/kits", icon: Sun, label: "Kits Solares" },
    { to: "/app/perfil", icon: UserCircle, label: "Meu Perfil" },
  ];

  const atendenteNav = [
    { to: "/app", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/app/clientes", icon: Users, label: "Clientes & Leads" },
    { to: "/app/cotacoes", icon: Zap, label: "Cotações" },
    { to: "/app/propostas", icon: FileSpreadsheet, label: "Propostas" },
    { to: "/app/perfil", icon: UserCircle, label: "Meu Perfil" },
  ];

  const corretorNav = [
    { to: "/app", icon: Briefcase, label: "Meus Clientes", exact: true },
    { to: "/app/cotacoes", icon: Zap, label: "Cotações" },
    { to: "/app/propostas", icon: FileSpreadsheet, label: "Propostas" },
    { to: "/app/pedidos", icon: ShoppingCart, label: "Pedidos" },
    { to: "/app/financiamentos", icon: Landmark, label: "Financiamentos" },
    { to: "/app/parceiro/financeiro", icon: Landmark, label: "Minhas Comissões" },
    { to: "/app/perfil", icon: UserCircle, label: "Meu Perfil" },
  ];

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    auxiliar: "Auxiliar Admin",
    atendente: "Atendente",
    corretor: "Parceiro",
  };

  const nav = role === "admin" 
    ? adminNav 
    : role === "auxiliar"
      ? auxiliarNav
      : role === "atendente"
        ? atendenteNav
        : corretorNav;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-navy text-white p-5">
        <Link to="/" className="mb-8"><img src={logo} alt="ESOL" className="h-10 w-auto brightness-0 invert" /></Link>
        <div className="mb-6 px-2">
          <div className="text-xs uppercase tracking-wider text-white/50">{ROLE_LABELS[role ?? ""] || "Parceiro"}</div>
          <div className="font-semibold truncate">{profile?.nome || user.email}</div>
        </div>
        <nav className="space-y-1 flex-1">
          {nav.map((item: any) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? "bg-sun text-navy" : "text-white/80 hover:bg-white/10"}`}
              >
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            );
          })}

          {/* Divisor */}
          <div className="my-2 border-t border-white/10" />

          {/* Sino de Notificações */}
          <NotificacoesSino {...notifData} />
        </nav>

        <Button onClick={signOut} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 justify-start">
          <LogOut className="w-4 h-4 mr-2" />Sair
        </Button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-navy text-white z-40 flex items-center justify-between px-4 h-14">
        <img src={logo} alt="ESOL" className="h-8 w-auto brightness-0 invert" />
        <div className="flex items-center gap-3">
          {/* Sino mobile */}
          <MobileBellBadge count={naoLidas} onClick={() => navigate({ to: "/app" })} />
          <select
            value={pathname}
            onChange={(e) => navigate({ to: e.target.value as any })}
            className="bg-navy-deep text-white text-sm rounded px-2 py-1 border border-white/20"
          >
            {nav.map((n) => <option key={n.to} value={n.to}>{n.label}</option>)}
          </select>
        </div>
      </div>

      <main className="flex-1 md:p-8 p-4 pt-20 md:pt-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function MobileBellBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative p-1">
      <Bell className="w-5 h-5 text-white" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
