import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropostaView } from "@/components/PropostaView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Copy, MessageCircle, Mail, Printer, Trash2, ShoppingCart, Landmark, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { BRL } from "@/lib/proposta-calc";

export const Route = createFileRoute("/app/propostas/$id")({ component: PropostaDetail });

function PropostaDetail() {
  const { id } = useParams({ from: "/app/propostas/$id" });
  const navigate = useNavigate();
  const { role } = useCurrentUser();
  const [proposta, setProposta] = useState<any>(null);
  const [parceiro, setParceiro] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("propostas").select("*").eq("id", id).maybeSingle();
      if (!p) return;
      setProposta(p);
      const [{ data: prof }, { data: pcs }] = await Promise.all([
        supabase.from("profiles").select("nome, email, telefone, avatar_url").eq("id", p.parceiro_id).maybeSingle(),
        supabase.from("proposta_clientes").select("cliente:cliente_id(*)").eq("proposta_id", id),
      ]);
      setParceiro(prof);
      setClientes((pcs || []).map((x: any) => x.cliente).filter(Boolean));
    })();
  }, [id]);

  const linkPublico = proposta ? `${window.location.origin}/proposta/${proposta.codigo_publico}` : "";

  const copyLink = () => { navigator.clipboard.writeText(linkPublico); toast.success("Link copiado!"); };
  const whatsapp = (telefone: string, nome: string) => {
    const msg = `Olá ${nome}! Preparei uma proposta personalizada de energia solar para você economizar na conta de luz. Confira: ${linkPublico}`;
    window.open(`https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const email = (e: string, nome: string) => {
    const subject = encodeURIComponent("Sua proposta de energia solar — ESOL Energy");
    const body = encodeURIComponent(`Olá ${nome},\n\nPreparei uma proposta exclusiva de energia solar para você. Acesse: ${linkPublico}\n\nQualquer dúvida estou à disposição!`);
    window.open(`mailto:${e}?subject=${subject}&body=${body}`);
  };

  async function excluir() {
    if (!confirm("Excluir esta proposta?")) return;
    await supabase.from("propostas").delete().eq("id", id);
    toast.success("Proposta excluída");
    navigate({ to: "/app/propostas" });
  }

  const gerarPedido = async () => {
    if (!clientePrincipal) return;
    if (!confirm(`Confirmar pedido a partir desta proposta para ${clientePrincipal?.nome}?`)) return;

    try {
      const { data, error } = await (supabase.from as any)("pedidos").insert({
        parceiro_id: proposta.parceiro_id,
        cliente_id: clientePrincipal.id,
        origem: "proposta",
        origem_id: proposta.id,
        valor_total: proposta.preco_total,
        descricao: `Pedido gerado a partir da Proposta`,
        status: "novo",
      }).select().single();

      if (error) throw error;

      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: clientePrincipal.id, 
        parceiro_id: proposta.parceiro_id,
        tipo: "pedido", 
        referencia_id: data.id,
        titulo: `Pedido ${data.numero} criado a partir da proposta`,
        descricao: `Valor: ${BRL(Number(proposta.preco_total))}`,
      });

      toast.success(`Pedido ${data.numero} criado com sucesso!`);
      navigate({ to: "/app/pedidos/$id", params: { id: data.id } });
    } catch (err: any) {
      toast.error("Erro ao gerar pedido: " + err.message);
    }
  };

  const solicitarFinanciamento = async () => {
    if (!clientePrincipal) return;
    try {
      const { data, error } = await (supabase.from as any)("financiamentos").insert({
        parceiro_id: proposta.parceiro_id,
        cliente_id: clientePrincipal.id,
        valor_solicitado: proposta.preco_total,
        status: "aguardando_documentos",
      }).select().single();
      if (error) throw error;

      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: clientePrincipal.id, 
        parceiro_id: proposta.parceiro_id,
        tipo: "financiamento", 
        referencia_id: data.id,
        titulo: "Financiamento solicitado via Proposta",
        descricao: `Valor: ${BRL(Number(proposta.preco_total))}`,
      });

      toast.success("Solicitação de Financiamento iniciada!");
      navigate({ to: "/app/financiamentos/$id", params: { id: data.id } });
    } catch (err: any) {
      toast.error("Erro ao solicitar financiamento: " + err.message);
    }
  };

  if (!proposta) return <div className="text-center py-12 text-muted-foreground">Carregando…</div>;

  const clientePrincipal = clientes[0];

  return (
    <div className="max-w-6xl space-y-5 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/app/propostas"><Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Propostas</Button></Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />PDF</Button>
          {role === "admin" && <Button variant="outline" size="sm" onClick={excluir} className="text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>}
        </div>
      </div>

      <Card className="p-5 border-0 shadow-md print:hidden">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <div className="text-xs uppercase tracking-wider text-sun-deep font-bold mb-1">Link público da proposta</div>
            <div className="flex gap-2">
              <input readOnly value={linkPublico} className="flex-1 bg-slate-50 border rounded px-3 py-2 text-sm" />
              <Button size="sm" onClick={copyLink}><Copy className="w-4 h-4 mr-1" />Copiar</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Expira em {new Date(proposta.expires_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex gap-2 self-end w-full sm:w-auto pt-2 sm:pt-0">
            <Button onClick={gerarPedido} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex gap-1.5 items-center flex-1 sm:flex-initial h-10 text-xs uppercase">
              <ShoppingCart className="w-4 h-4" /> Gerar Pedido
            </Button>
            <Button onClick={solicitarFinanciamento} className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex gap-1.5 items-center flex-1 sm:flex-initial h-10 text-xs uppercase">
              <Landmark className="w-4 h-4" /> Financiar
            </Button>
          </div>
        </div>

        {clientes.length > 0 && (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wider font-bold text-navy mb-2">Enviar para os clientes</div>
            <div className="space-y-2">
              {clientes.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-navy">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">{c.telefone} {c.email && `· ${c.email}`}</div>
                  </div>
                  <div className="flex gap-2">
                    {c.telefone && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => whatsapp(c.telefone, c.nome)}><MessageCircle className="w-4 h-4 mr-1" />WhatsApp</Button>}
                    {c.email && <Button size="sm" variant="outline" onClick={() => email(c.email, c.nome)}><Mail className="w-4 h-4 mr-1" />Email</Button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="border rounded-2xl overflow-hidden print:border-0 print:rounded-none">
        <PropostaView proposta={proposta} parceiro={parceiro} cliente={clientePrincipal} />
      </div>
    </div>
  );
}
