import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { TrendingUp, Users, Target, DollarSign, ArrowRight, Globe, Inbox } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: DashboardOrList,
});

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

function DashboardOrList() {
  const { role } = useCurrentUser();
  return role === "admin" ? <AdminDashboard /> : <CorretorClientes />;
}

function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, novos: 0, negociacao: 0, fechados: 0, valor: 0, corretores: 0, leadsSite: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [siteLeads, setSiteLeads] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: clientes } = await supabase.from("clientes").select("*, profiles:corretor_id(nome)").order("created_at", { ascending: false });
      const { count: corretoresCount } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "corretor");
      const list = clientes || [];
      const leads = list.filter((c) => c.origem === "landing" && !c.corretor_id);
      setStats({
        total: list.length,
        novos: list.filter((c) => c.status === "novo").length,
        negociacao: list.filter((c) => ["contato","visita_agendada","proposta_enviada","negociacao"].includes(c.status)).length,
        fechados: list.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length,
        valor: list.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).reduce((s, c) => s + Number(c.valor_estimado || 0), 0),
        corretores: corretoresCount || 0,
        leadsSite: leads.length,
      });
      setSiteLeads(leads);
      setRecent(list.slice(0, 8));
    })();
  }, []);

  const cards = [
    { label: "Leads do site", value: stats.leadsSite, icon: Globe, color: "from-sun to-amber-500" },
    { label: "Leads totais", value: stats.total, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Em negociação", value: stats.negociacao, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
    { label: "Faturamento previsto", value: stats.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), icon: DollarSign, color: "from-emerald-500 to-green-500" },
  ];

  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

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
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhum lead novo do site. Quando alguém preencher o formulário da página inicial, aparecerá aqui.</div>
          ) : (
            siteLeads.slice(0, 6).map((c) => (
              <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }} className="block p-4 hover:bg-sun/5 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-navy flex items-center gap-2">
                      {c.nome}
                      <Badge variant="outline" className="text-[10px] border-sun-deep text-sun-deep">Site</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.telefone}{c.email ? ` · ${c.email}` : ""}{c.cep ? ` · CEP ${c.cep}` : ""}
                    </div>
                    {c.observacoes && <div className="text-xs text-navy/70 mt-1 truncate">{c.observacoes}</div>}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(c.created_at)}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>

      <Card className="border-0 shadow-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-navy">Clientes recentes</h2>
          <Link to="/app/clientes" className="text-sm text-sun-deep hover:underline flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="divide-y">
          {recent.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum cliente cadastrado ainda.</div>}
          {recent.map((c) => (
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
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clientes").select("*").eq("corretor_id", user.id).order("created_at", { ascending: false });
      setClientes(data || []);
      setLoading(false);
    })();
  }, [user]);

  const groups = Object.keys(STATUS_LABEL).map((s) => ({ status: s, items: clientes.filter((c) => c.status === s) }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Meus clientes</h1>
          <p className="text-muted-foreground">{clientes.length} cliente{clientes.length === 1 ? "" : "s"} no funil</p>
        </div>
        <Link to="/app/novo" className="inline-flex items-center gap-2 bg-sun-deep text-navy px-5 py-2.5 rounded-full font-semibold hover:bg-sun">
          + Novo cliente
        </Link>
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
              {g.items.map((c) => (
                <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }}>
                  <Card className="p-4 hover:shadow-lg transition cursor-pointer border-l-4" style={{ borderLeftColor: "var(--color-sun, #facc15)" }}>
                    <div className="font-semibold text-navy">{c.nome}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.telefone}</div>
                    {c.valor_estimado && <div className="text-xs text-emerald-700 font-semibold mt-1">R$ {Number(c.valor_estimado).toLocaleString("pt-BR")}</div>}
                  </Card>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
