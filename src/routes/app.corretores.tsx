import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";

export const Route = createFileRoute("/app/corretores")({
  component: AdminCorretores,
});

const BRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function AdminCorretores() {
  const [list, setList] = useState<any[]>([]);
  const [totalComissao, setTotalComissao] = useState(0);
  const [totalReceita, setTotalReceita] = useState(0);

  const load = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "corretor");
    const ids = (roles || []).map((r) => r.user_id);
    if (ids.length === 0) { setList([]); return; }
    const [{ data: profiles }, { data: clientes }, { data: propostas }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", ids),
      supabase.from("clientes").select("corretor_id, status").in("corretor_id", ids),
      supabase.from("propostas").select("parceiro_id, status, preco_total, created_at").in("parceiro_id", ids),
    ]);

    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const stats = (profiles || []).map((p) => {
      const cs = (clientes || []).filter((c) => c.corretor_id === p.id);
      const ps = (propostas || []).filter((pr) => pr.parceiro_id === p.id);
      const psAceitas = ps.filter((pr) => pr.status === "aceita");
      const receitaBruta = psAceitas.reduce((s, pr) => s + Number(pr.preco_total || 0), 0);
      const comissaoPct = Number(p.comissao_percent || 0);
      const comissaoTotal = receitaBruta * (comissaoPct / 100);
      // Propostas aceitas no mês atual
      const psMes = psAceitas.filter((pr) => {
        const d = new Date(pr.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === mesAtual;
      });
      const receitaMes = psMes.reduce((s, pr) => s + Number(pr.preco_total || 0), 0);
      const comissaoMes = receitaMes * (comissaoPct / 100);
      const conversao = ps.length > 0 ? ((psAceitas.length / ps.filter((pr) => pr.status !== "rascunho").length) * 100) : 0;
      return {
        ...p,
        total: cs.length,
        fechados: cs.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length,
        propostas: ps.length,
        propostasAceitas: psAceitas.length,
        receitaBruta,
        comissaoTotal,
        comissaoMes,
        receitaMes,
        conversao: isNaN(conversao) ? 0 : conversao,
      };
    }).sort((a, b) => b.receitaBruta - a.receitaBruta);

    setList(stats);
    setTotalComissao(stats.reduce((s, p) => s + p.comissaoMes, 0));
    setTotalReceita(stats.reduce((s, p) => s + p.receitaBruta, 0));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string, ativo: boolean) => {
    await supabase.from("profiles").update({ ativo: !ativo }).eq("id", id);
    toast.success(!ativo ? "Parceiro ativado" : "Parceiro desativado");
    load();
  };
  const setComissao = async (id: string, v: string) => {
    await supabase.from("profiles").update({ comissao_percent: Number(v) || 0 }).eq("id", id);
    toast.success("Comissão atualizada");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-navy">Parceiros</h1>
        <p className="text-muted-foreground">{list.length} parceiro(s) cadastrado(s)</p>
      </div>

      {/* KPIs globais */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-0 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
            <div className="text-xs text-muted-foreground">Total de parceiros</div>
            <div className="font-bold text-xl text-navy">{list.length}</div>
            <div className="text-xs text-muted-foreground mt-1">{list.filter((p) => p.ativo).length} ativos</div>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-sun/10 text-sun-deep flex items-center justify-center mb-2"><DollarSign className="w-4 h-4" /></div>
            <div className="text-xs text-muted-foreground">Receita total gerada</div>
            <div className="font-bold text-xl text-navy">{BRL(totalReceita)}</div>
            <div className="text-xs text-muted-foreground mt-1">Somando todos os parceiros</div>
          </Card>
          <Card className="p-4 border-0 shadow-md bg-amber-50">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2"><DollarSign className="w-4 h-4" /></div>
            <div className="text-xs text-muted-foreground">💰 Comissões a pagar (mês)</div>
            <div className="font-bold text-xl text-amber-700">{BRL(totalComissao)}</div>
            <div className="text-xs text-muted-foreground mt-1">Baseado em propostas aceitas</div>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2"><Target className="w-4 h-4" /></div>
            <div className="text-xs text-muted-foreground">Melhor conversão</div>
            <div className="font-bold text-xl text-navy">
              {list.length > 0 ? `${Math.max(...list.map((p) => p.conversao)).toFixed(0)}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{list.find((p) => p.conversao === Math.max(...list.map((x) => x.conversao)))?.nome || "—"}</div>
          </Card>
        </div>
      )}

      {list.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground">Nenhum parceiro cadastrado ainda.</p>
          <p className="text-sm mt-2">Compartilhe o link <code>/auth</code> com seus parceiros para começarem.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((c, idx) => (
            <Card key={c.id} className="p-5 border-0 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm ${idx === 0 ? "bg-sun text-navy" : idx === 1 ? "bg-slate-200 text-navy" : idx === 2 ? "bg-amber-700/20 text-amber-800" : "bg-slate-100 text-navy"}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">{c.nome || c.email}</h3>
                    <p className="text-xs text-muted-foreground">{c.email} · {c.cidade || "—"}</p>
                  </div>
                </div>
                <Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Clientes</div>
                  <div className="font-bold text-navy">{c.total}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Fechados</div>
                  <div className="font-bold text-emerald-700">{c.fechados}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Conversão</div>
                  <div className="font-bold text-blue-700">{c.conversao.toFixed(0)}%</div>
                </div>
              </div>

              {/* Receita e Comissão */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Receita gerada</div>
                  <div className="font-bold text-navy text-sm">{BRL(c.receitaBruta)}</div>
                </div>
                <div className={`rounded-lg p-2 ${c.comissaoMes > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">💰 Comissão do mês</div>
                  <div className={`font-bold text-sm ${c.comissaoMes > 0 ? "text-amber-700" : "text-navy"}`}>
                    {BRL(c.comissaoMes)}
                  </div>
                  {c.comissaoTotal !== c.comissaoMes && (
                    <div className="text-[9px] text-muted-foreground">Total: {BRL(c.comissaoTotal)}</div>
                  )}
                </div>
              </div>

              {/* Barra de desempenho */}
              {c.propostasAceitas > 0 && c.propostas > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{c.propostasAceitas} aceitas de {c.propostas} propostas</span>
                    <span>{c.conversao.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(c.conversao, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Comissão %</label>
                  <Input type="number" step="0.1" defaultValue={c.comissao_percent} onBlur={(e) => setComissao(c.id, e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={() => toggle(c.id, c.ativo)}>{c.ativo ? "Desativar" : "Ativar"}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
