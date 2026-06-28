import { createFileRoute, Link } from "@tanstack/react-router";
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
import { ArrowLeft, Copy, Share2, MessageCircle, Eye, Send } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/financiamentos/$id")({
  component: FinDetail,
});

const STATUS = [
  "aguardando_documentos","em_analise","pre_aprovado","aprovado",
  "recusado","contrato_assinado","liberado","cancelado",
];

function FinDetail() {
  const { id } = Route.useParams();
  const { user } = useCurrentUser();
  const [f, setF] = useState<any>(null);
  const [eventos, setEventos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<any>({});

  const load = async () => {
    const [{ data: fin }, { data: evs }] = await Promise.all([
      (supabase.from as any)("financiamentos")
        .select("*, cliente:cliente_id(nome, telefone, email)")
        .eq("id", id).maybeSingle(),
      (supabase.from as any)("financiamento_eventos")
        .select("*").eq("financiamento_id", id).order("created_at"),
    ]);
    setF(fin);
    setEventos(evs || []);
    setEdit(fin || {});
  };
  useEffect(() => { load(); }, [id]);

  if (!f) return <div className="p-6 text-muted-foreground">Carregando…</div>;

  const calcParcela = () => {
    const v = Number(edit.valor_aprovado || edit.valor_solicitado);
    const n = Number(edit.parcelas);
    const i = Number(edit.taxa_juros_am) / 100;
    if (!v || !n || !i) return null;
    const p = (v * i) / (1 - Math.pow(1 + i, -n));
    return p;
  };

  const salvar = async (patch: any) => {
    setSaving(true);
    await (supabase.from as any)("financiamentos").update(patch).eq("id", f.id);
    setSaving(false);
    toast.success("Salvo");
    load();
  };

  const salvarTudo = async () => {
    const parcela = calcParcela();
    await salvar({
      banco: edit.banco || null,
      financeira: edit.financeira || null,
      valor_aprovado: edit.valor_aprovado || null,
      parcelas: edit.parcelas || null,
      taxa_juros_am: edit.taxa_juros_am || null,
      parcela_mensal: parcela,
      carencia_dias: edit.carencia_dias || 0,
      observacoes_internas: edit.observacoes_internas || null,
      observacoes_cliente: edit.observacoes_cliente || null,
    });
  };

  const publicar = async () => {
    await salvar({ publicado: true });
    toast.success("Link público liberado!");
  };

  const link = `${window.location.origin}/financiamento/${f.codigo_publico}`;
  const copiar = async () => { await navigator.clipboard.writeText(link); toast.success("Link copiado"); };
  const whatsapp = () => {
    const msg = encodeURIComponent(`Olá ${f.cliente?.nome}, acompanhe seu financiamento aqui:\n${link}`);
    const tel = (f.cliente?.telefone || "").replace(/\D/g, "");
    window.open(`https://wa.me/55${tel}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <Link to="/app/financiamentos" className="inline-flex items-center text-sm text-muted-foreground hover:text-navy">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-navy">Financiamento de {f.cliente?.nome}</h1>
        <p className="text-sm text-muted-foreground">Solicitado em {new Date(f.created_at).toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <h2 className="font-bold text-navy">Dados do banco / financeira</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Banco</Label><Input value={edit.banco || ""} onChange={(e) => setEdit({ ...edit, banco: e.target.value })} placeholder="Ex: Santander, BV, Sicredi…" /></div>
            <div><Label>Financeira / parceiro</Label><Input value={edit.financeira || ""} onChange={(e) => setEdit({ ...edit, financeira: e.target.value })} placeholder="Ex: Solfácil, BV Financeira" /></div>
            <div><Label>Valor solicitado</Label><Input type="number" value={edit.valor_solicitado || ""} onChange={(e) => setEdit({ ...edit, valor_solicitado: Number(e.target.value) })} /></div>
            <div><Label>Valor aprovado</Label><Input type="number" value={edit.valor_aprovado || ""} onChange={(e) => setEdit({ ...edit, valor_aprovado: Number(e.target.value) })} /></div>
            <div><Label>Parcelas (meses)</Label><Input type="number" value={edit.parcelas || ""} onChange={(e) => setEdit({ ...edit, parcelas: Number(e.target.value) })} /></div>
            <div><Label>Taxa de juros (% a.m.)</Label><Input type="number" step="0.01" value={edit.taxa_juros_am || ""} onChange={(e) => setEdit({ ...edit, taxa_juros_am: Number(e.target.value) })} /></div>
            <div><Label>Carência (dias)</Label><Input type="number" value={edit.carencia_dias || 0} onChange={(e) => setEdit({ ...edit, carencia_dias: Number(e.target.value) })} /></div>
            <div><Label>Parcela mensal calculada</Label><Input value={calcParcela() ? BRL(calcParcela()!) : "—"} readOnly className="bg-slate-50 font-semibold" /></div>
          </div>
          <div>
            <Label>Observações internas (só time)</Label>
            <Textarea value={edit.observacoes_internas || ""} onChange={(e) => setEdit({ ...edit, observacoes_internas: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Mensagem para o cliente (aparece no link público)</Label>
            <Textarea value={edit.observacoes_cliente || ""} onChange={(e) => setEdit({ ...edit, observacoes_cliente: e.target.value })} rows={3}
              placeholder="Ex: Sua análise foi aprovada com taxa preferencial. Próximos passos…" />
          </div>
          <Button onClick={salvarTudo} disabled={saving} className="bg-navy hover:bg-navy/90">Salvar alterações</Button>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3">Status</h2>
            <Select value={f.status} onValueChange={(v) => salvar({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">Toda mudança fica registrada na timeline.</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3">Link para o cliente</h2>
            {!f.publicado ? (
              <>
                <p className="text-sm text-muted-foreground mb-3">O cliente ainda não pode ver. Publique quando estiver pronto.</p>
                <Button onClick={publicar} className="w-full bg-emerald-600 hover:bg-emerald-700"><Send className="w-4 h-4 mr-2" /> Publicar para o cliente</Button>
              </>
            ) : (
              <div className="space-y-2">
                <Badge className="bg-emerald-100 text-emerald-700">✓ Publicado</Badge>
                <Button onClick={whatsapp} variant="outline" className="w-full"><MessageCircle className="w-4 h-4 mr-2 text-emerald-600" /> Enviar por WhatsApp</Button>
                <Button onClick={copiar} variant="outline" className="w-full"><Copy className="w-4 h-4 mr-2" /> Copiar link</Button>
                <Button onClick={() => window.open(link, "_blank")} variant="outline" className="w-full"><Eye className="w-4 h-4 mr-2" /> Ver como cliente</Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3">Histórico</h2>
            <div className="space-y-2 max-h-72 overflow-auto">
              {eventos.map((e) => (
                <div key={e.id} className="text-xs border-l-2 border-blue-300 pl-2">
                  <div className="font-semibold">{e.status_novo}</div>
                  <div className="text-muted-foreground">{new Date(e.created_at).toLocaleString("pt-BR")}</div>
                </div>
              ))}
              {eventos.length === 0 && <div className="text-xs text-muted-foreground">Sem eventos ainda</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
