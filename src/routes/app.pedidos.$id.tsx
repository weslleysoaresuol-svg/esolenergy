import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Landmark, Save } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pedidos/$id")({
  component: PedidoDetail,
});

const STATUS = ["novo","em_separacao","faturado","expedido","entregue","instalado","concluido","cancelado"];

function PedidoDetail() {
  const { id } = Route.useParams();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await (supabase.from as any)("pedidos")
      .select("*, cliente:cliente_id(nome, telefone, email)")
      .eq("id", id).maybeSingle();
    setP(data);
  };
  useEffect(() => { load(); }, [id]);

  if (!p) return <div className="p-6 text-muted-foreground">Carregando…</div>;
  const kit = p.kit_snapshot || {};

  const salvar = async (patch: any) => {
    setSaving(true);
    await (supabase.from as any)("pedidos").update(patch).eq("id", p.id);
    setSaving(false);
    toast.success("Salvo");
    load();
  };

  const solicitarFinanciamento = async () => {
    if (!user) return;
    const { data, error } = await (supabase.from as any)("financiamentos").insert({
      parceiro_id: user.id,
      cliente_id: p.cliente_id,
      pedido_id: p.id,
      valor_solicitado: p.valor_total,
      status: "aguardando_documentos",
    }).select().single();
    if (error) { toast.error(error.message); return; }
    await (supabase.from as any)("timeline_cliente").insert({
      cliente_id: p.cliente_id, parceiro_id: user.id,
      tipo: "financiamento", referencia_id: data.id,
      titulo: "Financiamento solicitado", descricao: `Pedido ${p.numero} — ${BRL(Number(p.valor_total))}`,
    });
    toast.success("Financiamento criado!");
    navigate({ to: "/app/financiamentos/$id", params: { id: data.id } });
  };

  return (
    <div className="space-y-6">
      <Link to="/app/pedidos" className="inline-flex items-center text-sm text-muted-foreground hover:text-navy">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{p.numero}</h1>
          <p className="text-sm text-muted-foreground">
            {p.cliente?.nome} • criado em {new Date(p.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 text-sm">{p.status}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 p-5 space-y-4">
          <h2 className="font-bold text-navy">Produto</h2>
          <div>
            <div className="font-semibold">{kit.nome || p.descricao}</div>
            {kit.potencia_kwp && (
              <div className="text-sm text-muted-foreground">
                {kit.potencia_kwp} kWp · {kit.quantidade_modulos} módulos · {kit.inversor}
              </div>
            )}
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{BRL(Number(p.valor_total))}</div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <Label>Forma de pagamento</Label>
              <Input defaultValue={p.forma_pagamento || ""} onBlur={(e) => salvar({ forma_pagamento: e.target.value })} />
            </div>
            <div>
              <Label>Entrega prevista</Label>
              <Input type="date" defaultValue={p.data_entrega_prevista || ""} onBlur={(e) => salvar({ data_entrega_prevista: e.target.value || null })} />
            </div>
          </div>
          <div>
            <Label>Observações internas</Label>
            <Textarea defaultValue={p.observacoes || ""} onBlur={(e) => salvar({ observacoes: e.target.value })} rows={2} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3">Status</h2>
            <Select value={p.status} onValueChange={(v) => salvar({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3">Financiamento</h2>
            <Button onClick={solicitarFinanciamento} className="w-full bg-blue-600 hover:bg-blue-700">
              <Landmark className="w-4 h-4 mr-2" /> Solicitar financiamento
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Abre esteira de aprovação com banco/financeira</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
