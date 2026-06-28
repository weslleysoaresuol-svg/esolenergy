import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark, TrendingUp, Clock, HelpCircle } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/parceiro/financeiro")({
  head: () => ({ meta: [{ title: "Minhas Comissões — ESOL Energy" }] }),
  component: ParceiroFinanceiroDashboard,
});

function ParceiroFinanceiroDashboard() {
  const { user } = useCurrentUser();
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComissoes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase.from as any)("parceiro_comissoes")
        .select("*, pedido:pedido_id(numero)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComissoes(data || []);
    } catch (e: any) {
      toast.error("Erro ao carregar comissões: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComissoes();
  }, [user]);

  // Cálculos
  const totalPago = comissoes
    .filter((c) => c.status === "pago")
    .reduce((acc, curr) => acc + Number(curr.valor_comissao), 0);

  const totalAReceber = comissoes
    .filter((c) => c.status === "a_receber")
    .reduce((acc, curr) => acc + Number(curr.valor_comissao), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
          <Landmark className="w-7 h-7 text-sun-deep" /> Minhas Comissões
        </h1>
        <p className="text-muted-foreground text-sm">Acompanhe seu saldo a receber e o extrato de repasses.</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Recebido</div>
            <div className="text-lg font-bold text-navy">{BRL(totalPago)}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Saldo a Receber</div>
            <div className="text-lg font-bold text-navy">{BRL(totalAReceber)}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Comissões Cadastradas</div>
            <div className="text-lg font-bold text-navy">{comissoes.length} parcelas</div>
          </div>
        </Card>
      </div>

      {/* Informativo de Prazos/Gatilhos */}
      <Card className="p-5 bg-gradient-to-br from-blue-50/50 to-slate-50 border border-slate-200/50">
        <h2 className="font-bold text-navy text-sm mb-2 flex items-center gap-1.5">📢 Como funcionam as comissões?</h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
          Para garantir a saúde financeira e segurança das operações da **Esol Energy**, seu comissionamento é pago em dois gatilhos:
          <br />
          1. **1ª Parcela (50%):** Liberada em até 5 dias úteis após a aprovação e assinatura do contrato de financiamento (ou compensação do pagamento à vista).
          <br />
          2. **2ª Parcela (50% restante):** Liberada em até 5 dias úteis após a conclusão física da montagem dos painéis no telhado do cliente.
        </p>
      </Card>

      {/* Tabela de Extrato de Comissões */}
      <Card className="p-4 overflow-x-auto">
        <h2 className="font-bold text-navy mb-4">Extrato Detalhado de Repasses</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando comissões…</p>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b text-xs text-muted-foreground uppercase">
                <th className="p-3">Data</th>
                <th className="p-3">Pedido</th>
                <th className="p-3">Parcela</th>
                <th className="p-3">Gatilho / Condição</th>
                <th className="p-3">Base de Venda</th>
                <th className="p-3">Comissão (%)</th>
                <th className="p-3">Previsão</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right font-semibold">Valor Comissão</th>
              </tr>
            </thead>
            <tbody>
              {comissoes.map((c) => (
                <tr key={c.id} className="border-b hover:bg-slate-50/50">
                  <td className="p-3">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 font-bold text-navy">{c.pedido?.numero}</td>
                  <td className="p-3">Parc. {c.parcela}/{c.total_parcelas}</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="bg-slate-50">
                      {c.parcela === 1 ? "🔒 Entrada / Financ. Aprovado" : "🛠️ Instalação Física Pronta"}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{BRL(Number(c.valor_total_pedido))}</td>
                  <td className="p-3">{c.percentual_comissao}%</td>
                  <td className="p-3 text-xs">{new Date(c.data_previsao_pagamento).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3">
                    <Badge className={c.status === "pago" ? "bg-green-100 text-green-800" : c.status === "a_receber" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}>
                      {c.status === "a_receber" ? "Previsão" : c.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-700">{BRL(Number(c.valor_comissao))}</td>
                </tr>
              ))}
              {comissoes.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-muted-foreground">Nenhuma comissão ativa ou pendente para este parceiro.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
