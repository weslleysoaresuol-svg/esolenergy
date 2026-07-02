import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropostaView } from "@/components/PropostaView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Copy, MessageCircle, Mail, Printer, Trash2, ShoppingCart, Landmark, Check, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { BRL } from "@/lib/proposta-calc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/app/propostas/$id")({ component: PropostaDetail });

function PropostaDetail() {
  const { id } = useParams({ from: "/app/propostas/$id" });
  const navigate = useNavigate();
  const { role, profile } = useCurrentUser();
  const [proposta, setProposta] = useState<any>(null);
  const [parceiro, setParceiro] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [openMirror, setOpenMirror] = useState(false);

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

  const linkPublico = proposta && typeof window !== "undefined" ? `${window.location.origin}/proposta/${proposta.codigo_publico}` : "";

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
      // Resolvendo o snapshot do kit associado à proposta
      let kitSnapshot = null;
      if (proposta.kit_id) {
        const { data: kt } = await (supabase.from as any)("kits_produtos").select("*").eq("id", proposta.kit_id).maybeSingle();
        kitSnapshot = kt;
      }
      if (!kitSnapshot) {
        kitSnapshot = {
          nome: proposta.titulo || "Kit Solar",
          potencia_kwp: proposta.kwp_sistema,
          quantidade_modulos: proposta.qtd_modulos,
          preco: proposta.preco_total,
          inversor: proposta.potencia_inversor_kw ? `${proposta.potencia_inversor_kw} kW` : "Não especificado"
        };
      }

      const { data, error } = await (supabase.from as any)("pedidos").insert({
        parceiro_id: proposta.parceiro_id,
        cliente_id: clientePrincipal.id,
        origem: "proposta",
        origem_id: proposta.id,
        valor_total: proposta.preco_total,
        descricao: `Pedido gerado a partir da Proposta`,
        status: "novo",
        kit_snapshot: kitSnapshot
      }).select().single();

      if (error) throw error;

      // Sincroniza o CRM movendo o cliente para "Contrato Assinado" automaticamente
      await supabase.from("clientes").update({ status: "contrato_assinado" }).eq("id", clientePrincipal.id);

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
          
          <Dialog open={openMirror} onOpenChange={setOpenMirror}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-amber-500 hover:bg-amber-600 hover:text-white text-white border-0 flex gap-1 items-center font-bold">
                <FileText className="w-4 h-4" /> Espelho Financeiro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh]">
              <DialogHeader>
                <DialogTitle className="text-navy text-base uppercase tracking-wider font-extrabold flex items-center gap-2">
                  <FileText className="text-sun w-5 h-5" /> 
                  {role === "admin" ? "Espelho de Operação (Administrador)" : "Seu Espelho de Comissão (Parceiro)"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {role === "admin" 
                    ? "Detalhamento completo de custos diretos, indiretos e margens da ESOL Energy."
                    : "Informações do produto, valor total de venda e sua comissão estimada."}
                </DialogDescription>
              </DialogHeader>

              {role === "admin" ? (
                <div className="space-y-4 pt-2">
                  {proposta.fornecedor && (
                    <div className="bg-navy/5 rounded-xl p-3 border text-xs flex justify-between items-center">
                      <span className="font-semibold text-slate-500 uppercase text-[9px]">Distribuidor / Fornecedor</span>
                      <strong className="text-navy text-sm font-black uppercase">{proposta.fornecedor}</strong>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Diretos (Compra B2B)</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
                        <CostRow label="Equipamentos (Kit)" value={proposta.custo_equipamentos} />
                        <CostRow label="Instalação / Integração" value={proposta.custo_instalacao} />
                        <CostRow label="Frete" value={proposta.custo_frete} />
                        <CostRow label="Impostos de Compra" value={proposta.custo_impostos_compra} />
                        <CostRow label="Comissão do Parceiro" value={proposta.custo_comissao} />
                        <CostRow label="Total Custos Diretos" value={proposta.preco_total - (proposta.margem_bruta || 0)} bold />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Operacionais e Margens (ESOL)</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
                        <CostRow label="Tributação ESOL" value={proposta.custo_tributacao_empresa} />
                        <CostRow label="CAC / Marketing" value={proposta.custo_marketing} />
                        <CostRow label="Engenharia / Fixo" value={proposta.custo_engenharia_fixo} />
                        <CostRow label="Overhead / Adm" value={proposta.custo_overhead} />
                        <CostRow label="Provisão de Garantia" value={proposta.custo_garantia} />
                        <CostRow label="Despesas Op. Totais" value={proposta.custos_operacionais_totais} bold />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center border">
                      <span className="font-semibold text-slate-700 text-xs">Margem Bruta</span>
                      <span className="font-bold text-slate-700 text-sm">{BRL(proposta.margem_bruta || 0)} {proposta.preco_total > 0 && `(${( ((proposta.margem_bruta || 0) / proposta.preco_total) * 100 ).toFixed(1)}%)`}</span>
                    </div>
                    
                    <div className={`rounded-xl p-3.5 flex justify-between items-center border ${proposta.lucro_liquido_real >= 0 ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
                      <span className="font-bold text-xs uppercase tracking-wide">★ Lucro Líquido Real</span>
                      <span className="font-black text-sm">{BRL(proposta.lucro_liquido_real || 0)} {proposta.lucro_liquido_pct !== null && proposta.lucro_liquido_pct !== undefined && proposta.lucro_liquido_pct !== 0 ? `(${(proposta.lucro_liquido_pct * 100).toFixed(1)}%)` : proposta.preco_total > 0 ? `(${( ((proposta.lucro_liquido_real || 0) / proposta.preco_total) * 100 ).toFixed(1)}%)` : ""}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-3">
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">Especificações do Kit</span><span className="font-extrabold text-navy">{proposta.qtd_modulos} módulos × {proposta.potencia_modulo_w}W ({proposta.kwp_sistema} kWp)</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Área necessária</span><span className="font-semibold">{proposta.area_necessaria_m2} m²</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Investimento da Venda</span><span className="font-black text-navy">{BRL(proposta.preco_total)}</span></div>
                    
                    <div className="bg-sun/15 border border-sun/50 rounded-xl p-4 flex justify-between items-center text-navy-deep">
                      <div>
                        <strong className="block text-xs font-bold uppercase tracking-wider">Sua Comissão Estimada</strong>
                        <span className="text-[10px] text-navy/70">Taxa individual: {profile?.comissao_percent !== null && profile?.comissao_percent !== undefined ? `${profile.comissao_percent}%` : proposta.preco_total > 0 ? `${(((proposta.custo_comissao || 0) / proposta.preco_total) * 100).toFixed(0)}%` : "5%"}</span>
                      </div>
                      <strong className="text-lg font-black text-navy">{BRL(proposta.custo_comissao || (proposta.preco_total * 0.05))}</strong>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

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

const CostRow = ({ label, value, bold }: { label: string; value: number | null; bold?: boolean }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-slate-200 last:border-b-0 ${bold ? "font-bold text-navy pt-2" : "text-slate-600 text-[11px]"}`}>
    <span>{label}</span>
    <span>{value !== null ? BRL(value) : "—"}</span>
  </div>
);
