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
import { KITS_FALLBACK } from "@/lib/kits-fallback";

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
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [clienteTipo, setClienteTipo] = useState<"existente" | "novo">("existente");
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "", cidade: "", estado: "SP" });

  const load = async () => {
    setLoading(true);
    const [cs, cls, ks] = await Promise.all([
      (supabase.from as any)("cotacoes")
        .select("*, cliente:cliente_id(*), kit:kit_id(*)")
        .order("created_at", { ascending: false }),
      // Clientes: ordenados pelo mais recente (created_at DESC) — o \u00faltimo cadastrado fica no topo
      supabase.from("clientes").select("id, nome, telefone, cidade, estado").order("created_at", { ascending: false }),
      supabase.from("kits_produtos" as any).select("*").order("potencia_kwp"),
    ]);
    setCotacoes(cs.data || []);
    setClientes(cls.data || []);
    
    // Kits: mantém ordem por potencia_kwp, mas fallback j\u00e1 vem ordenado por potencia
    let mergedKits = (ks.data || []).sort((a: any, b: any) => Number(a.potencia_kwp) - Number(b.potencia_kwp));
    if (mergedKits.length < 20) {
      const codes = new Set(mergedKits.map((k: any) => k.codigo));
      const missing = KITS_FALLBACK
        .filter((k) => !codes.has(k.id) && !codes.has(k.codigo))
        .sort((a, b) => a.potencia_kwp - b.potencia_kwp);
      mergedKits = [...mergedKits, ...missing];
    }
    setKits(mergedKits);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const kitSel = kits.find((k) => k.id === novo.kit_id);
  const total = kitSel ? Number(kitSel.preco) * novo.quantidade : 0;

  // Verifica se o kit_id é um UUID válido (kits do fallback têm IDs como "KIT-RES-PEQ-03")
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const kitIdParaDB = novo.kit_id && UUID_REGEX.test(novo.kit_id) ? novo.kit_id : null;

  const criar = async () => {
    if (!user || !novo.kit_id) {
      toast.error("Selecione o kit solar"); return;
    }
    
    let targetClienteId = novo.cliente_id;
    setSaving(true);

    try {
      // Se for cliente novo, primeiro cadastra ele
      if (clienteTipo === "novo") {
        if (!novoCliente.nome || !novoCliente.telefone) {
          toast.error("Nome e telefone são obrigatórios");
          setSaving(false);
          return;
        }

        const { data: newCl, error: errCl } = await supabase.from("clientes").insert({
          nome: novoCliente.nome.trim(),
          telefone: novoCliente.telefone.trim(),
          cidade: novoCliente.cidade.trim(),
          estado: novoCliente.estado.trim().toUpperCase(),
          corretor_id: user.id,
          status: "novo",
          origem: "manual"
        }).select().single();

        if (errCl || !newCl) {
          toast.error("Erro ao cadastrar cliente: " + errCl.message);
          setSaving(false);
          return;
        }
        targetClienteId = newCl.id;
      } else if (!targetClienteId) {
        toast.error("Selecione um cliente da lista");
        setSaving(false);
        return;
      }

      const { data, error } = await (supabase.from as any)("cotacoes").insert({
        parceiro_id: user.id,
        cliente_id: targetClienteId,
        // kit_id só é enviado se for um UUID real (kits cadastrados no banco).
        // Kits do fallback têm IDs como "KIT-RES-PEQ-03" e causariam erro de UUID.
        // Nesses casos, kit_id fica null e todos os dados ficam no kit_snapshot.
        kit_id: kitIdParaDB,
        kit_snapshot: kitSel,
        quantidade: novo.quantidade,
        preco_unit: Number(kitSel!.preco),
        preco_total: total,
        observacoes: novo.observacoes || null,
        status: "enviada",
      }).select().single();

      if (error) throw error;

      // Timeline
      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: targetClienteId,
        parceiro_id: user.id,
        tipo: "cotacao",
        referencia_id: data.id,
        titulo: `Cotação gerada: ${kitSel.nome}`,
        descricao: `Valor: ${BRL(total)}`,
      });

      toast.success("Cotação criada com sucesso!");
      setOpenNew(false);
      setNovo({ cliente_id: "", kit_id: "", quantidade: 1, observacoes: "" });
      setNovoCliente({ nome: "", telefone: "", cidade: "", estado: "SP" });
      setClienteTipo("existente");
      navigate({ to: "/app/cotacoes/$id", params: { id: data.id } });
    } catch (err: any) {
      toast.error("Erro ao gerar cotação: " + err.message);
    } finally {
      setSaving(false);
    }
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova cotação rápida</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="block mb-2 text-xs font-bold text-slate-700">Cliente da Cotação</Label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border mb-3">
                <button
                  type="button"
                  onClick={() => setClienteTipo("existente")}
                  className={`flex-1 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${clienteTipo === "existente" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-slate-500 hover:text-navy"}`}
                >
                  👥 Selecionar Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => setClienteTipo("novo")}
                  className={`flex-1 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${clienteTipo === "novo" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-slate-500 hover:text-navy"}`}
                >
                  ➕ Cadastrar Novo Lead
                </button>
              </div>

              {clienteTipo === "existente" ? (
                <Select value={novo.cliente_id} onValueChange={(v) => setNovo({ ...novo, cliente_id: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Cliente *</Label>
                    <Input placeholder="Ex: João da Silva" value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Celular / WhatsApp *</Label>
                    <Input placeholder="Ex: (11) 99999-9999" value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Cidade / UF</Label>
                    <div className="flex gap-1.5">
                      <Input placeholder="Cidade" value={novoCliente.cidade} onChange={(e) => setNovoCliente({ ...novoCliente, cidade: e.target.value })} className="h-9 text-xs flex-1" />
                      <Select value={novoCliente.estado} onValueChange={(v) => setNovoCliente({ ...novoCliente, estado: v })}>
                        <SelectTrigger className="h-9 w-16 text-xs"><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>
                          {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Kit solar</Label>
              <Select value={novo.kit_id} onValueChange={(v) => setNovo({ ...novo, kit_id: v })}>
                <SelectTrigger className="w-full">
                  <span className="truncate block text-left">
                    {kitSel ? `${kitSel.nome} — ${BRL(Number(kitSel.preco))}` : "Escolha um kit solar"}
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-[280px] overflow-y-auto w-full">
                  {kits.map((k) => (
                    <SelectItem key={k.id} value={k.id} className="text-xs">
                      <span className="block truncate max-w-[380px]">{k.nome} — {BRL(Number(k.preco))}</span>
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
