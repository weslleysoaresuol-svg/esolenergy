import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BRL, NUM, calcularProposta, type Parametros } from "@/lib/proposta-calc";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, DollarSign, Target, Zap, Users, Percent } from "lucide-react";

export const Route = createFileRoute("/app/metricas")({ component: Metricas });

function Metricas() {
  const [propostas, setPropostas] = useState<any[]>([]);
  const [params, setParams] = useState<Parametros | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: pr }] = await Promise.all([
        supabase.from("propostas").select("*, parceiro:parceiro_id(nome)").order("created_at"),
        supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle(),
      ]);
      setPropostas(ps || []);
      if (pr) setParams(pr as any);
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

    // Custos consolidados usando parâmetros
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

    return { total, enviadas, aceitasNum, conversao, receitaProjetada, receitaRealizada, ticketMedio, kwpVendido, custosTotais, margemTotal, margemPct, mensal, topParceiros, tipoData, kwpUltimoMes, capacidadePct };
  }, [propostas, params]);

  const COLORS = ["#FFC107", "#001F5C", "#10b981", "#f43f5e"];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-navy">Métricas e Inteligência Comercial</h1>
        <p className="text-muted-foreground">Visão consolidada de propostas, conversão, receita e margem</p>
      </div>

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
        <Kpi icon={DollarSign} label="Custos consolidados" value={BRL(m.custosTotais)} sub="Equip + instal + frete + impostos + comissão" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3">Receita por mês (últimos 6)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={m.mensal}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => BRL(Number(v))} />
              <Bar dataKey="receita" fill="#FFC107" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3">Propostas por tipo</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={m.tipoData} dataKey="value" nameKey="name" outerRadius={80} label={(e) => e.name}>
                {m.tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 border-0 shadow-md">
        <h3 className="font-semibold text-navy mb-3">Top parceiros por receita</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-slate-50">
              <tr><th className="p-2">Parceiro</th><th className="p-2">Propostas</th><th className="p-2">Aceitas</th><th className="p-2">Conversão</th><th className="p-2">Receita</th></tr>
            </thead>
            <tbody>
              {m.topParceiros.map((p) => (
                <tr key={p.nome} className="border-t">
                  <td className="p-2 font-semibold text-navy">{p.nome}</td>
                  <td className="p-2">{p.total}</td>
                  <td className="p-2">{p.aceitas}</td>
                  <td className="p-2">{p.total > 0 ? ((p.aceitas / p.total) * 100).toFixed(0) : 0}%</td>
                  <td className="p-2 font-semibold">{BRL(p.receita)}</td>
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
