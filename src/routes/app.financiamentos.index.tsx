import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Landmark, Clock, CheckCircle2, XCircle, Plus, Send } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/financiamentos/")({
  head: () => ({ meta: [{ title: "Financiamentos — ESOL Energy" }] }),
  component: FinanciamentosList,
});

const STATUS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  aguardando_documentos: { label: "Aguardando documentos", color: "bg-slate-100 text-slate-700", icon: Clock },
  em_analise: { label: "Em análise", color: "bg-blue-100 text-blue-700", icon: Clock },
  pre_aprovado: { label: "Pré-aprovado", color: "bg-amber-100 text-amber-700", icon: Clock },
  aprovado: { label: "Aprovado", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  recusado: { label: "Recusado", color: "bg-rose-100 text-rose-700", icon: XCircle },
  contrato_assinado: { label: "Contrato assinado", color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
  liberado: { label: "Liberado", color: "bg-green-200 text-green-800", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-500", icon: XCircle },
};

function FinanciamentosList() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  // Novo Financiamento
  const [openNew, setOpenNew] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [novo, setNovo] = useState({
    cliente_id: "",
    pedido_id: "",
    banco: "BV Financeira",
    financeira: "Solfácil",
    valor_solicitado: "",
    parcelas: "60",
    taxa_juros_am: "1.39"
  });

  const loadData = async () => {
    if (!user) return;
    const [
      { data: fins },
      { data: clis },
      { data: peds }
    ] = await Promise.all([
      (supabase.from as any)("financiamentos")
        .select("*, cliente:cliente_id(nome, telefone)")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, nome").order("nome"),
      (supabase.from as any)("pedidos").select("id, numero, valor_total").order("numero")
    ]);

    setItems(fins || []);
    setClientes(clis || []);
    setPedidos(peds || []);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!novo.cliente_id || !novo.valor_solicitado) return toast.error("Preencha cliente e valor");

    setSaving(true);
    try {
      const v = Number(novo.valor_solicitado);
      const n = Number(novo.parcelas);
      const i = Number(novo.taxa_juros_am) / 100;
      const pmt = (v * i) / (1 - Math.pow(1 + i, -n));

      const { data, error } = await (supabase.from as any)("financiamentos").insert({
        parceiro_id: user.id,
        cliente_id: novo.cliente_id,
        pedido_id: novo.pedido_id || null,
        valor_solicitado: v,
        banco: novo.banco,
        financeira: novo.financeira,
        parcelas: n,
        taxa_juros_am: Number(novo.taxa_juros_am),
        parcela_mensal: pmt,
        status: "aguardando_documentos",
      }).select().single();

      if (error) throw error;

      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: novo.cliente_id, parceiro_id: user.id,
        tipo: "financiamento", referencia_id: data.id,
        titulo: "Financiamento solicitado manualmente",
        descricao: `${novo.banco} — ${BRL(v)} em ${n}x`,
      });

      toast.success("Solicitação de Financiamento criada!");
      setOpenNew(false);
      setNovo({
        cliente_id: "",
        pedido_id: "",
        banco: "BV Financeira",
        financeira: "Solfácil",
        valor_solicitado: "",
        parcelas: "60",
        taxa_juros_am: "1.39"
      });
      loadData();
    } catch (err: any) {
      toast.error("Erro ao criar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((f) =>
    !q || f.cliente?.nome?.toLowerCase().includes(q.toLowerCase()) || f.banco?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
            <Landmark className="w-7 h-7 text-blue-600" /> Financiamentos
          </h1>
          <p className="text-muted-foreground text-sm">Esteira de aprovação. Cliente vê o status visual pelo link.</p>
        </div>
        <Button onClick={() => setOpenNew(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex gap-1.5 items-center">
          <Plus className="w-4 h-4" /> Novo Financiamento
        </Button>
      </div>

      <Card className="p-3">
        <Input placeholder="Buscar por cliente ou banco…" value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <Landmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhum financiamento cadastrado. Crie um novo acima.
          </Card>
        )}
        {filtered.map((f) => {
          const st = STATUS_LABEL[f.status] || STATUS_LABEL.em_analise;
          const Icon = st.icon;
          return (
            <Link key={f.id} to="/app/financiamentos/$id" params={{ id: f.id }}>
              <Card className="p-4 hover:shadow-md transition cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy truncate">{f.cliente?.nome}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {f.banco || "Banco não definido"} • {BRL(Number(f.valor_solicitado))}
                    {f.parcelas && ` • ${f.parcelas}x`}
                  </div>
                </div>
                <Badge className={st.color}>{st.label}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* DIALOG DE CRIAÇÃO */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg rounded-2xl bg-white p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-navy text-lg flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-600" /> Nova Solicitação de Financiamento
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Cliente / Lead</Label>
              <Select
                value={novo.cliente_id}
                onValueChange={(v) => setNovo({ ...novo, cliente_id: v })}
              >
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Selecione o proponente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Banco / Instituição</Label>
                <Input
                  value={novo.banco}
                  onChange={(e) => setNovo({ ...novo, banco: e.target.value })}
                  placeholder="Ex: Santander, BV, Sicredi"
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Parceiro Financeiro</Label>
                <Input
                  value={novo.financeira}
                  onChange={(e) => setNovo({ ...novo, financeira: e.target.value })}
                  placeholder="Ex: Solfácil"
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Valor Solicitado (R$)</Label>
                <Input
                  type="number"
                  required
                  placeholder="Ex: 25000.00"
                  value={novo.valor_solicitado}
                  onChange={(e) => setNovo({ ...novo, valor_solicitado: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Parcelas (Meses)</Label>
                <Select
                  value={novo.parcelas}
                  onValueChange={(v) => setNovo({ ...novo, parcelas: v })}
                >
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[12, 24, 36, 48, 60, 72, 84, 96, 120].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} meses</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Taxa Juros (% a.m.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novo.taxa_juros_am}
                  onChange={(e) => setNovo({ ...novo, taxa_juros_am: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Vincular a Pedido Existente (Opcional)</Label>
              <Select
                value={novo.pedido_id}
                onValueChange={(v) => setNovo({ ...novo, pedido_id: v })}
              >
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {pedidos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>Pedido {p.numero} ({BRL(Number(p.valor_total))})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 text-xs uppercase"
            >
              {saving ? "Criando..." : "Submeter Solicitação"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
