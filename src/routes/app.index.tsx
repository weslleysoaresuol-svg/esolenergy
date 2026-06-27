import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { TrendingUp, Users, Target, DollarSign, ArrowRight, Globe, Inbox, AlertTriangle, Clock, CheckCircle2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/app/")(
  { component: DashboardOrList }
);

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo lead", contato: "Em contato", visita_agendada: "Visita agendada",
  proposta_enviada: "Proposta enviada", negociacao: "Negociação",
  contrato_assinado: "Contrato assinado", instalacao: "Em instalação",
  concluido: "Concluído", perdido: "Perdido",
};

const STATUS_COLOR: Record<string, string> = {
  novo: "bg-blue-100 text-blue-800", contato: "bg-cyan-100 text-cyan-800",
  visita_agendada: "bg-purple-100 text-purple-800", proposta_enviada: "bg-amber-100 text-amber-800",
  negociacao: "bg-orange-100 text-orange-800", contrato_assinado: "bg-emerald-100 text-emerald-800",
  instalacao: "bg-teal-100 text-teal-800", concluido: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
};

const KANBAN_COLS = [
  { statuses: ["novo"], label: "Novos", color: "bg-blue-500" },
  { statuses: ["contato", "visita_agendada"], label: "Em contato", color: "bg-purple-500" },
  { statuses: ["proposta_enviada", "negociacao"], label: "Proposta / Negoc.", color: "bg-amber-500" },
  { statuses: ["contrato_assinado", "instalacao"], label: "Contrato / Instal.", color: "bg-teal-500" },
  { statuses: ["concluido"], label: "Concluídos", color: "bg-emerald-500" },
];

function DashboardOrList() {
  const { role } = useCurrentUser();
  return role === "admin" ? <AdminDashboard /> : <CorretorClientes />;
}

function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, novos: 0, negociacao: 0, fechados: 0, valor: 0, corretores: 0, leadsSite: 0 });
  const [clientes, setClientes] = useState<any[]>([]);
  const [siteLeads, setSiteLeads] = useState<any[]>([]);
  const [activeKanbanCol, setActiveKanbanCol] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: list } = await supabase.from("clientes").select("*, profiles:corretor_id(nome)").order("updated_at", { ascending: false });
      const { count: corretoresCount } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "corretor");
      const all = list || [];
      const leads = all.filter((c) => c.origem === "landing" && !c.corretor_id);
      setStats({
        total: all.length,
        novos: all.filter((c) => c.status === "novo").length,
        negociacao: all.filter((c) => ["contato","visita_agendada","proposta_enviada","negociacao"].includes(c.status)).length,
        fechados: all.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length,
        valor: all.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).reduce((s, c) => s + Number(c.valor_estimado || 0), 0),
        corretores: corretoresCount || 0,
        leadsSite: leads.length,
      });
      setSiteLeads(leads);
      setClientes(all);
    })();
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  const cards = [
    { label: "Leads do site", value: stats.leadsSite, icon: Globe, color: "from-sun to-amber-500" },
    { label: "Leads totais", value: stats.total, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Em negociação", value: stats.negociacao, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
    { label: "Faturamento previsto", value: stats.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), icon: DollarSign, color: "from-emerald-500 to-green-500" },
  ];

  // Filtro por coluna Kanban
  const displayedClientes = activeKanbanCol
    ? clientes.filter((c) => {
        const col = KANBAN_COLS.find((k) => k.label === activeKanbanCol);
        return col ? col.statuses.includes(c.status) : true;
      })
    : clientes;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da operação — {stats.corretores} parceiros ativos</p>
        </div>
        <Link to="/app/novo" className="inline-flex items-center gap-2 bg-sun-deep text-navy px-5 py-2.5 rounded-full font-semibold hover:bg-sun">
          + Novo cliente
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 border-0 shadow-md">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-navy">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Kanban Visual */}
      <Card className="border-0 shadow-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy flex items-center gap-2"><Target className="w-5 h-5 text-sun-deep" />Funil de Vendas</h2>
          {activeKanbanCol && (
            <button onClick={() => setActiveKanbanCol(null)} className="text-xs text-muted-foreground hover:text-navy underline">
              Ver todos
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
          {KANBAN_COLS.map((col) => {
            const count = clientes.filter((c) => col.statuses.includes(c.status)).length;
            const receita = clientes
              .filter((c) => col.statuses.includes(c.status))
              .reduce((s, c) => s + Number(c.valor_estimado || 0), 0);
            const isActive = activeKanbanCol === col.label;
            return (
              <button
                key={col.label}
                onClick={() => setActiveKanbanCol(isActive ? null : col.label)}
                className={`rounded-xl p-3 text-left transition border-2 ${isActive ? "border-navy" : "border-transparent"} bg-slate-50 hover:bg-white hover:shadow-md`}
              >
                <div className={`w-full h-1 rounded-full ${col.color} mb-2`} />
                <div className="text-2xl font-extrabold text-navy">{count}</div>
                <div className="text-xs font-semibold text-navy/70 mt-0.5">{col.label}</div>
                {receita > 0 && (
                  <div className="text-[10px] text-emerald-700 font-medium mt-1">
                    {receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Mini funil gráfico */}
        <div className="flex items-end gap-1 h-8 mt-2">
          {KANBAN_COLS.map((col) => {
            const count = clientes.filter((c) => col.statuses.includes(c.status)).length;
            const maxCount = Math.max(...KANBAN_COLS.map((k) => clientes.filter((c) => k.statuses.includes(c.status)).length), 1);
            const h = Math.max(12, (count / maxCount) * 32);
            return <div key={col.label} className={`flex-1 rounded-t-sm ${col.color} opacity-70 transition-all`} style={{ height: h }} title={`${col.label}: ${count}`} />;
          })}
        </div>
      </Card>

      {/* Leads do site */}
      <Card className="border-0 shadow-md border-l-4 border-l-sun-deep">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-sun-deep" />
            <h2 className="font-bold text-navy">Novos leads do site</h2>
            {siteLeads.length > 0 && (
              <Badge className="bg-sun text-navy">{siteLeads.length} aguardando</Badge>
            )}
          </div>
          <Link to="/app/clientes" className="text-sm text-sun-deep hover:underline flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="divide-y">
          {siteLeads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhum lead novo do site aguardando atribuição.</div>
          ) : (
            siteLeads.slice(0, 5).map((c) => (
              <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }} className="flex items-center justify-between gap-3 p-4 hover:bg-sun/5 transition">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-navy flex items-center gap-2">
                    {c.nome}
                    <Badge variant="outline" className="text-[10px] border-sun-deep text-sun-deep">Site</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.telefone}{c.email ? ` · ${c.email}` : ""}{c.cidade ? ` · ${c.cidade}` : ""}</div>
                  {c.observacoes && <div className="text-xs text-navy/70 mt-1 truncate">{c.observacoes}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{fmtDate(c.created_at)}</div>
                  {c.telefone && (
                    <a href={`https://wa.me/${c.telefone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>

      {/* Lista de clientes (filtrada pelo kanban ou recentes) */}
      <Card className="border-0 shadow-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-navy">
            {activeKanbanCol ? `Clientes — ${activeKanbanCol}` : "Clientes recentes"}
          </h2>
          <Link to="/app/clientes" className="text-sm text-sun-deep hover:underline flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="divide-y">
          {displayedClientes.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum cliente nesta etapa.</div>}
          {(activeKanbanCol ? displayedClientes : displayedClientes.slice(0, 10)).map((c) => (
            <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }} className="block p-4 hover:bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-navy flex items-center gap-2">
                    {c.nome}
                    {c.origem === "landing" && <Badge variant="outline" className="text-[10px] border-sun-deep text-sun-deep">Site</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{c.telefone} · {c.cidade || "—"} · Parceiro: {c.profiles?.nome || "Não atribuído"}</div>
                </div>
                <Badge className={STATUS_COLOR[c.status]}>{STATUS_LABEL[c.status]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CorretorClientes() {
  const { user } = useCurrentUser();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const DIAS_SLA = 3;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clientes").select("*").eq("corretor_id", user.id).order("updated_at", { ascending: false });
      setClientes(data || []);
      setLoading(false);
    })();
  }, [user]);

  const leadsFrios = clientes.filter((c) => {
    const lastUpdate = new Date(c.updated_at || c.created_at);
    const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= DIAS_SLA && !["concluido", "perdido", "contrato_assinado"].includes(c.status);
  });

  const ativos = clientes.filter((c) => !["concluido", "perdido"].includes(c.status));
  const groups = Object.keys(STATUS_LABEL).map((s) => ({ status: s, items: clientes.filter((c) => c.status === s) }));

  const diffDias = (d: string) => {
    const days = Math.floor((now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Meus clientes</h1>
          <p className="text-muted-foreground">{ativos.length} ativo{ativos.length === 1 ? "" : "s"} · {clientes.filter((c) => c.status === "concluido").length} concluído{clientes.filter((c) => c.status === "concluido").length === 1 ? "" : "s"}</p>
        </div>
        <Link to="/app/novo" className="inline-flex items-center gap-2 bg-sun-deep text-navy px-5 py-2.5 rounded-full font-semibold hover:bg-sun">
          + Novo cliente
        </Link>
      </div>

      {/* ALERTA SLA — Leads parados */}
      {leadsFrios.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-red-500 bg-red-50/40">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800">⚠️ {leadsFrios.length} lead{leadsFrios.length > 1 ? "s" : ""} sem contato há mais de {DIAS_SLA} dias!</h3>
            </div>
            <div className="space-y-2">
              {leadsFrios.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
                  <div>
                    <Link to="/app/cliente/$id" params={{ id: c.id }} className="font-semibold text-navy hover:underline">{c.nome}</Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <Badge className={STATUS_COLOR[c.status]} variant="outline">{STATUS_LABEL[c.status]}</Badge>
                      <span className="ml-2 text-red-600 font-medium">há {diffDias(c.updated_at || c.created_at)} dias sem atualização</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.telefone && (
                      <a
                        href={`https://wa.me/${c.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${c.nome?.split(" ")[0]}, tudo bem? Aqui é da ESOL Energy. Gostaria de retomar nossa conversa sobre energia solar! 😊`)}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600"
                      >
                        <MessageCircle className="w-3 h-3" /> Contatar
                      </a>
                    )}
                    <Link to="/app/cliente/$id" params={{ id: c.id }}
                      className="inline-flex items-center gap-1 text-xs bg-navy text-white px-3 py-1.5 rounded-full hover:bg-navy-deep">
                      Ver ficha
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* KPI rápido */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-0 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-navy">{ativos.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Em andamento</div>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{clientes.filter((c) => c.status === "concluido").length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Concluídos</div>
        </Card>
        <Card className={`p-4 border-0 shadow-sm text-center ${leadsFrios.length > 0 ? "bg-red-50 border border-red-200" : ""}`}>
          <div className={`text-2xl font-extrabold ${leadsFrios.length > 0 ? "text-red-600" : "text-navy"}`}>{leadsFrios.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <AlertTriangle className={`w-3 h-3 ${leadsFrios.length > 0 ? "text-red-500" : ""}`} /> Parados 3+ dias
          </div>
        </Card>
      </div>

      {loading ? <div className="text-muted-foreground">Carregando…</div> : clientes.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground mb-4">Você ainda não tem clientes cadastrados.</p>
          <Link to="/app/novo" className="inline-block bg-navy text-white px-6 py-2.5 rounded-full font-semibold">Cadastrar primeiro cliente</Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.filter((g) => g.items.length).map((g) => (
            <div key={g.status} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy/70">{STATUS_LABEL[g.status]}</h3>
                <span className="text-xs text-muted-foreground">{g.items.length}</span>
              </div>
              {g.items.map((c) => {
                const dias = diffDias(c.updated_at || c.created_at);
                const frio = dias >= DIAS_SLA && !["concluido", "perdido", "contrato_assinado"].includes(c.status);
                return (
                  <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }}>
                    <Card className={`p-4 hover:shadow-lg transition cursor-pointer border-l-4 ${frio ? "border-l-red-400 bg-red-50/30" : ""}`} style={!frio ? { borderLeftColor: "var(--color-sun, #facc15)" } : {}}>
                      <div className="font-semibold text-navy">{c.nome}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.telefone}</div>
                      {c.valor_estimado && <div className="text-xs text-emerald-700 font-semibold mt-1">R$ {Number(c.valor_estimado).toLocaleString("pt-BR")}</div>}
                      {frio && <div className="text-[10px] text-red-600 font-bold mt-1">⚠️ {dias} dias sem atualização</div>}
                    </Card>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
