import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BRL, NUM, type Parametros } from "@/lib/proposta-calc";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Target, Zap, Users, Percent, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/metricas")({ component: Metricas });

const MOTIVO_PERDA_LABELS: Record<string, string> = {
  preco: "💰 Preço alto",
  concorrente: "🏢 Concorrente",
  prazo: "⏱️ Prazo",
  financiamento_reprovado: "🏦 Financiamento",
  desistiu: "🚫 Desistência",
  nao_atendeu: "📵 Não atendeu",
  outro: "📝 Outro",
};

function Metricas() {
  const [propostas, setPropostas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [params, setParams] = useState<Parametros | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: pr }, { data: cs }] = await Promise.all([
        supabase.from("propostas").select("*, parceiro:parceiro_id(nome)").order("created_at"),
        supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle(),
        supabase.from("clientes").select("status, motivo_perda, created_at, fechado_em, perdido_em, valor_estimado").order("created_at"),
      ]);
      setPropostas(ps || []);
      if (pr) setParams(pr as any);
      setClientes(cs || []);
    })();
  }, []);

  const m = useMemo(() => {
    const total = propostas.length;
    const enviadas = propostas.filter((p) => p.status !== "rascunho").length;
    const aceitas = propostas.filter((p) => p.status === "aceita");
    const aceitasNum = aceitas.length;
    const conversao = enviadas > 0 ? (aceitasNum / enviadas) * 100 : 0;
    const receitaProjetada = propostas.filter((p) => p.status !== "rascunho" && p.status !== "recusada").reduce((s, p) => s + Number(p.preco_total), 0);
    const receitaRealizada = aceitas.reduce((s, p) => s + Number(p.preco_total), 0);
    const ticketMedio = aceitasNum > 0 ? receitaRealizada / aceitasNum : 0;
    const kwpVendido = aceitas.reduce((s, p) => s + Number(p.kwp_sistema), 0);

    let custosTotais = 0;
    let margemTotal = 0;
    if (params) {
      for (const p of aceitas) {
        const c = Number(p.preco_total);
        const custo = c * (params.custo_equipamentos_pct + params.custo_instalacao_pct + params.custo_frete_pct + params.custo_impostos_pct + params.custo_comissao_pct);
        custosTotais += custo;
        margemTotal += c - custo;
      }
    }
    const margemPct = receitaRealizada > 0 ? (margemTotal / receitaRealizada) * 100 : 0;

    // Por mês
    const porMes: Record<string, { mes: string; total: number; aceitas: number; receita: number }> = {};
    for (const p of propostas) {
      const d = new Date(p.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!porMes[k]) porMes[k] = { mes: k, total: 0, aceitas: 0, receita: 0 };
      porMes[k].total++;
      if (p.status === "aceita") { porMes[k].aceitas++; porMes[k].receita += Number(p.preco_total); }
    }
    const mensal = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);

    // Por parceiro
    const porParceiro: Record<string, { nome: string; total: number; aceitas: number; receita: number }> = {};
    for (const p of propostas) {
      const nome = p.parceiro?.nome || "—";
      if (!porParceiro[nome]) porParceiro[nome] = { nome, total: 0, aceitas: 0, receita: 0 };
      porParceiro[nome].total++;
      if (p.status === "aceita") { porParceiro[nome].aceitas++; porParceiro[nome].receita += Number(p.preco_total); }
    }
    const topParceiros = Object.values(porParceiro).sort((a, b) => b.receita - a.receita).slice(0, 6);

    // Por tipo
    const porTipo: Record<string, number> = {};
    for (const p of propostas) porTipo[p.tipo_instalacao] = (porTipo[p.tipo_instalacao] || 0) + 1;
    const tipoData = Object.entries(porTipo).map(([name, value]) => ({ name, value }));

    // Capacidade
    const kwpUltimoMes = aceitas.filter((p) => new Date(p.aceita_em || p.created_at) > new Date(Date.now() - 30 * 24 * 3600 * 1000)).reduce((s, p) => s + Number(p.kwp_sistema), 0);
    const capacidadePct = params ? (kwpUltimoMes / params.capacidade_instaladores_kwp_mes) * 100 : 0;

    // === NOVOS: Motivo de Perda ===
    const perdidos = clientes.filter((c) => c.status === "perdido" && c.motivo_perda);
    const porMotivo: Record<string, number> = {};
    for (const c of perdidos) porMotivo[c.motivo_perda] = (porMotivo[c.motivo_perda] || 0) + 1;
    const motivoData = Object.entries(porMotivo)
      .map(([k, v]) => ({ name: MOTIVO_PERDA_LABELS[k] || k, value: v }))
      .sort((a, b) => b.value - a.value);

    // === NOVOS: Funil de Conversão ===
    const statusOrder = ["novo", "contato", "visita_agendada", "proposta_enviada", "negociacao", "contrato_assinado", "concluido"];
    const statusLabels: Record<string, string> = {
      novo: "Novos leads", contato: "Em contato", visita_agendada: "Visita agendada",
      proposta_enviada: "Proposta enviada", negociacao: "Negociação",
      contrato_assinado: "Contrato assinado", concluido: "Concluído",
    };
    const funnelData = statusOrder.map((s) => ({
      name: statusLabels[s],
      value: clientes.filter((c) => [...statusOrder.slice(statusOrder.indexOf(s))].includes(c.status)).length,
      fill: s === "concluido" ? "#10b981" : s === "contrato_assinado" ? "#14b8a6" : s === "negociacao" || s === "proposta_enviada" ? "#f59e0b" : "#3b82f6",
    })).filter((d) => d.value > 0);

    // === NOVOS: Tempo Médio de Fechamento ===
    const comFechamento = clientes.filter((c) => ["concluido","contrato_assinado"].includes(c.status) && c.fechado_em && c.created_at);
    const tempoMedioFechamento = comFechamento.length > 0
      ? comFechamento.reduce((s, c) => {
          const dias = (new Date(c.fechado_em).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return s + dias;
        }, 0) / comFechamento.length
      : null;

    // === NOVOS: Pipeline de Receita ===
    const emNegociacao = clientes.filter((c) => ["contato","visita_agendada","proposta_enviada","negociacao"].includes(c.status));
    const pipelineReceita = emNegociacao.reduce((s, c) => s + Number(c.valor_estimado || 0), 0);
    const pipelineProbabilidade = 0.25; // estimativa de 25% de conversão do pipeline
    const receitaEsperada = pipelineReceita * pipelineProbabilidade;

    return { total, enviadas, aceitasNum, conversao, receitaProjetada, receitaRealizada, ticketMedio, kwpVendido, custosTotais, margemTotal, margemPct, mensal, topParceiros, tipoData, kwpUltimoMes, capacidadePct, motivoData, funnelData, tempoMedioFechamento, pipelineReceita, receitaEsperada, emNegociacao: emNegociacao.length };
  }, [propostas, params, clientes]);

  const COLORS = ["#FFC107", "#001F5C", "#10b981", "#f43f5e", "#8b5cf6", "#0ea5e9"];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-navy">Métricas e Inteligência Comercial</h1>
        <p className="text-muted-foreground">Visão consolidada de propostas, conversão, receita e margem</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={TrendingUp} label="Propostas geradas" value={NUM(m.total)} sub={`${m.enviadas} enviadas`} />
        <Kpi icon={Target} label="Taxa de conversão" value={`${m.conversao.toFixed(1)}%`} sub={`${m.aceitasNum} aceitas`} color="emerald" />
        <Kpi icon={DollarSign} label="Receita realizada" value={BRL(m.receitaRealizada)} sub={`Projetada: ${BRL(m.receitaProjetada)}`} color="sun" />
        <Kpi icon={Percent} label="Margem média" value={`${m.margemPct.toFixed(1)}%`} sub={BRL(m.margemTotal) + " lucro"} color="emerald" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={DollarSign} label="Ticket médio" value={BRL(m.ticketMedio)} />
        <Kpi icon={Zap} label="kWp vendidos" value={`${NUM(m.kwpVendido, 1)} kWp`} sub={`${NUM(m.kwpUltimoMes, 1)} no mês`} />
        <Kpi icon={Users} label="Capacidade instalação" value={`${m.capacidadePct.toFixed(0)}%`} sub={`Limite: ${params?.capacidade_instaladores_kwp_mes} kWp/mês`} color={m.capacidadePct > 90 ? "rose" : "emerald"} />
        <Kpi icon={Clock} label="Tempo médio fechamento" value={m.tempoMedioFechamento != null ? `${Math.round(m.tempoMedioFechamento)} dias` : "—"} sub={m.tempoMedioFechamento != null ? "Lead → contrato" : "Dados insuficientes"} />
      </div>

      {/* Pipeline de Receita */}
      <Card className="p-5 border-0 shadow-md bg-gradient-to-r from-navy/5 to-blue-50">
        <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-sun-deep" />Pipeline de Receita</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Em negociação</div>
            <div className="text-2xl font-extrabold text-navy">{m.emNegociacao}</div>
            <div className="text-xs text-muted-foreground">leads ativos no funil</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Valor do pipeline</div>
            <div className="text-2xl font-extrabold text-blue-700">{BRL(m.pipelineReceita)}</div>
            <div className="text-xs text-muted-foreground">estimativa dos leads em negociação</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 shadow-sm border border-amber-100">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Receita esperada (25%)</div>
            <div className="text-2xl font-extrabold text-amber-700">{BRL(m.receitaEsperada)}</div>
            <div className="text-xs text-muted-foreground">com taxa histórica de conversão</div>
          </div>
        </div>
      </Card>

      {/* Funil de Conversão + Receita por mês */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-sun-deep" />Funil de Conversão</h3>
          {m.funnelData.length > 0 ? (
            <div className="space-y-2">
              {m.funnelData.map((d, i) => {
                const pct = m.funnelData[0].value > 0 ? (d.value / m.funnelData[0].value) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold text-navy">{d.value} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.fill }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Dados insuficientes para o funil.</p>
          )}
        </Card>

        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3">Receita por mês (últimos 6)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={m.mensal}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => BRL(Number(v))} />
              <Bar dataKey="receita" name="Receita" fill="#FFC107" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Propostas" fill="#001F5C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Motivo de Perda + Tipo de Instalação */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />Perda por Motivo
          </h3>
          {m.motivoData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Nenhum motivo de perda registrado ainda.<br />
              <span className="text-xs">Registre o motivo ao marcar leads como "Perdido".</span>
            </div>
          ) : (
            <div className="space-y-2">
              {m.motivoData.map((d, i) => {
                const total = m.motivoData.reduce((s, x) => s + x.value, 0);
                const pct = total > 0 ? (d.value / total) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold text-navy">{d.value} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-red-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3">Propostas por tipo de instalação</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={m.tipoData} dataKey="value" nameKey="name" outerRadius={70} label={(e) => e.name}>
                {m.tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Parceiros */}
      <Card className="p-5 border-0 shadow-md">
        <h3 className="font-semibold text-navy mb-3">Top parceiros por receita</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-slate-50">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Parceiro</th>
                <th className="p-2">Propostas</th>
                <th className="p-2">Aceitas</th>
                <th className="p-2">Conversão</th>
                <th className="p-2">Receita</th>
              </tr>
            </thead>
            <tbody>
              {m.topParceiros.map((p, i) => (
                <tr key={p.nome} className="border-t">
                  <td className="p-2 text-muted-foreground font-mono">#{i + 1}</td>
                  <td className="p-2 font-semibold text-navy">{p.nome}</td>
                  <td className="p-2">{p.total}</td>
                  <td className="p-2">{p.aceitas}</td>
                  <td className="p-2">{p.total > 0 ? ((p.aceitas / p.total) * 100).toFixed(0) : 0}%</td>
                  <td className="p-2 font-semibold text-emerald-700">{BRL(p.receita)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, color }: any) {
  const bg = color === "sun" ? "bg-sun/10 text-sun-deep" : color === "emerald" ? "bg-emerald-50 text-emerald-700" : color === "rose" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-navy";
  return (
    <Card className="p-4 border-0 shadow-md">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}><Icon className="w-4 h-4" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold text-xl text-navy">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}
