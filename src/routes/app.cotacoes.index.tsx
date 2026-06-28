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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, Eye, Zap, Sun, Sparkles } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/cotacoes/")({
  head: () => ({ meta: [{ title: "Cotações Rápidas — ESOL Energy" }] }),
  component: CotacoesList,
});

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-slate-200 text-slate-700" },
  enviada: { label: "Enviada", color: "bg-blue-100 text-blue-700" },
  convertida_proposta: { label: "→ Proposta", color: "bg-violet-100 text-violet-700" },
  convertida_pedido: { label: "→ Pedido", color: "bg-emerald-100 text-emerald-700" },
  cancelada: { label: "Cancelada", color: "bg-rose-100 text-rose-700" },
};

function CotacoesList() {
  const { user, role } = useCurrentUser();
  const navigate = useNavigate();
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [novo, setNovo] = useState({ cliente_id: "", kit_id: "", quantidade: 1, observacoes: "" });
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    const [{ data: cs }, { data: cls }, { data: ks }] = await Promise.all([
      (supabase.from as any)("cotacoes")
        .select("*, cliente:cliente_id(nome, telefone), kit:kit_id(nome, potencia_kwp, imagem_url)")
        .order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome, telefone").order("nome"),
      (supabase.from as any)("kits_produtos").select("*").eq("ativo", true).order("potencia_kwp"),
    ]);
    setCotacoes(cs || []);
    setClientes(cls || []);
    setKits(ks || []);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const kitSel = kits.find((k) => k.id === novo.kit_id);
  const total = kitSel ? Number(kitSel.preco) * novo.quantidade : 0;

  const criar = async () => {
    if (!user || !novo.cliente_id || !novo.kit_id) {
      toast.error("Selecione cliente e kit"); return;
    }
    setSaving(true);
    const { data, error } = await (supabase.from as any)("cotacoes").insert({
      parceiro_id: user.id,
      cliente_id: novo.cliente_id,
      kit_id: novo.kit_id,
      kit_snapshot: kitSel,
      quantidade: novo.quantidade,
      preco_unit: kitSel.preco,
      preco_total: total,
      observacoes: novo.observacoes,
      status: "enviada",
    }).select().single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    // Timeline
    await (supabase.from as any)("timeline_cliente").insert({
      cliente_id: novo.cliente_id,
      parceiro_id: user.id,
      tipo: "cotacao",
      referencia_id: data.id,
      titulo: `Cotação gerada: ${kitSel.nome}`,
      descricao: `Valor: ${BRL(total)}`,
    });
    toast.success("Cotação criada!");
    setOpenNew(false);
    setNovo({ cliente_id: "", kit_id: "", quantidade: 1, observacoes: "" });
    navigate({ to: "/app/cotacoes/$id", params: { id: data.id } });
  };

  const filtered = cotacoes.filter((c) =>
    !q || c.cliente?.nome?.toLowerCase().includes(q.toLowerCase()) || c.kit?.nome?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
            <Zap className="w-7 h-7 text-sun-deep" /> Cotações Rápidas
          </h1>
          <p className="text-muted-foreground text-sm">Cote um kit em segundos e mande o link pro cliente</p>
        </div>
        <Button onClick={() => setOpenNew(true)} className="bg-sun text-navy hover:bg-sun-deep">
          <Plus className="w-4 h-4 mr-1" /> Nova cotação
        </Button>
      </div>

      <Card className="p-3">
        <Input placeholder="Buscar por cliente ou kit…" value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhuma cotação ainda. Crie a primeira em 30 segundos.
          </Card>
        )}
        {filtered.map((c) => {
          const st = STATUS_LABEL[c.status] || STATUS_LABEL.rascunho;
          return (
            <Link key={c.id} to="/app/cotacoes/$id" params={{ id: c.id }}>
              <Card className="p-4 hover:shadow-md transition cursor-pointer flex items-center gap-4">
                {c.kit?.imagem_url ? (
                  <img src={c.kit.imagem_url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-sun/20 flex items-center justify-center">
                    <Sun className="w-7 h-7 text-sun-deep" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy truncate">{c.kit?.nome || c.kit_snapshot?.nome || "Kit removido"}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {c.cliente?.nome} • {c.quantidade}x • {BRL(Number(c.preco_total))}
                  </div>
                </div>
                <Badge className={st.color}>{st.label}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova cotação rápida</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Select value={novo.cliente_id} onValueChange={(v) => setNovo({ ...novo, cliente_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kit solar</Label>
              <Select value={novo.kit_id} onValueChange={(v) => setNovo({ ...novo, kit_id: v })}>
                <SelectTrigger><SelectValue placeholder="Escolha um kit" /></SelectTrigger>
                <SelectContent>
                  {kits.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.potencia_kwp} kWp — {BRL(Number(k.preco))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {kits.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Nenhum kit cadastrado. <Link to="/app/kits" className="underline">Cadastrar agora</Link>
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantidade</Label>
                <Input type="number" min={1} value={novo.quantidade}
                  onChange={(e) => setNovo({ ...novo, quantidade: Math.max(1, Number(e.target.value) || 1) })} />
              </div>
              <div>
                <Label>Total</Label>
                <Input value={BRL(total)} readOnly className="bg-slate-50 font-semibold" />
              </div>
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea value={novo.observacoes} onChange={(e) => setNovo({ ...novo, observacoes: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpenNew(false)}>Cancelar</Button>
              <Button onClick={criar} disabled={saving} className="bg-sun text-navy hover:bg-sun-deep">
                {saving ? "Gerando…" : "Gerar cotação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
