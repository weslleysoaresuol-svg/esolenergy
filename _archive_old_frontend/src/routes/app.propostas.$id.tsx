import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropostaView } from "@/components/PropostaView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Copy, MessageCircle, Mail, Printer, Trash2, ShoppingCart, Landmark, Check, FileText, Target, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { BRL, calcularProposta, PARAMETROS_DEFAULT } from "@/lib/proposta-calc";
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
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("propostas").select("*").eq("id", id).maybeSingle();
      if (!p) return;
      setProposta(p);
      const [{ data: prof }, { data: pcs }, { data: pr }] = await Promise.all([
        supabase.from("profiles").select("nome, email, telefone, avatar_url, comissao_percent").eq("id", p.parceiro_id).maybeSingle(),
        supabase.from("proposta_clientes").select("cliente:cliente_id(*)").eq("proposta_id", id),
        (supabase.rpc as any)("get_parametros_publicos")
      ]);
      setParceiro(prof);
      setClientes((pcs || []).map((x: any) => x.cliente).filter(Boolean));
      if (pr) setParams(pr);
    })();
  }, [id]);

  const calculoOnFly = useMemo(() => {
    if (!proposta || !params) return null;
    
    // Detecta se a proposta foi gerada por admin (sem parceiro) ou por parceiro
    const ehAdmin = !proposta.parceiro_id || proposta.parceiro_id === null;
    const comissaoParceiro = parceiro?.comissao_percent !== null && parceiro?.comissao_percent !== undefined
      ? Number(parceiro.comissao_percent)
      : undefined;

    // Mescla defaults para garantir novos campos disponíveis
    const paramsCompletos = { ...PARAMETROS_DEFAULT, ...params };

    return calcularProposta({
      consumo_kwh: proposta.consumo_kwh,
      tarifa_kwh: proposta.tarifa_kwh || 0.95,
      estado: proposta.estado,
      tipo: proposta.tipo_instalacao || "residencial",
      tipo_telhado: proposta.tipo_telhado || "ceramico",
      distribuidora_id: proposta.distribuidora_id || proposta.fornecedor || null,
      preco_override: proposta.preco_total,
      kwp_override: proposta.kwp_sistema,
      qtd_modulos_override: proposta.qtd_modulos,
      custo_equipamentos_override: proposta.custo_equipamentos || undefined,
      eh_admin: ehAdmin,
      comissao_percent_override: comissaoParceiro,
    }, paramsCompletos);
  }, [proposta, params, parceiro]);

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
    navigate({ to: "/app/propostas", search: { modo: "proposta" } });
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
        <Link to="/app/propostas" search={{ modo: "proposta" }}><Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Propostas</Button></Link>
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
                  {/* Badge: Proposta Direta ou Via Parceiro */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {!proposta.parceiro_id ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-2 text-emerald-700 text-xs font-bold">
                        <Building2 className="w-3.5 h-3.5" /> Proposta Direta da Empresa — Sem Comissão
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 text-amber-700 text-xs font-bold">
                        <User className="w-3.5 h-3.5" /> Via Parceiro: {parceiro?.nome || "—"} ({parceiro?.comissao_percent || 8}% comissão)
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-700 text-xs font-bold">
                      <Target className="w-3.5 h-3.5" /> Lucro Alvo: {((params?.lucro_alvo_pct || 0.15) * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Bloco 1: Custos Diretos */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">📦 Custos Diretos (Compra B2B)</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
                        <CostRow label="Kit Fornecedor" value={calculoOnFly?.custo_equipamentos} />
                        <CostRow label={`Instalação (${proposta.tipo_telhado || "cerâmico"})`} value={calculoOnFly?.custo_instalacao} />
                        <CostRow label="Frete ao CD" value={calculoOnFly?.custo_frete} />
                        <CostRow label="Impostos de Compra" value={calculoOnFly?.custo_impostos_compra} />
                        {proposta.parceiro_id && (
                          <CostRow
                            label={`Comissão Parceiro (${parceiro?.comissao_percent || 8}%)`}
                            value={calculoOnFly?.custo_comissao}
                          />
                        )}
                        <CostRow label="Total Custos Diretos" value={(calculoOnFly?.custo_equipamentos || 0) + (calculoOnFly?.custo_instalacao || 0) + (calculoOnFly?.custo_frete || 0) + (calculoOnFly?.custo_impostos_compra || 0) + (proposta.parceiro_id ? (calculoOnFly?.custo_comissao || 0) : 0)} bold />
                      </div>
                    </div>
                    
                    {/* Bloco 2: Custos Operacionais */}
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">🏢 Custos Operacionais (ESOL)</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
                        <CostRow label={`Tributação (${((params?.tributacao_empresa_pct || 0.06) * 100).toFixed(0)}%)`} value={calculoOnFly?.custo_tributacao_empresa} />
                        <CostRow label="Marketing / CAC (fixo)" value={calculoOnFly?.custo_marketing} />
                        <CostRow label="Engenharia (ART + Projeto)" value={calculoOnFly?.custo_engenharia_fixo} />
                        <CostRow label={`Overhead SG&A (${((params?.custo_overhead_pct || 0.04) * 100).toFixed(0)}%)`} value={calculoOnFly?.custo_overhead} />
                        <CostRow label={`Garantia/Pós-venda (${((params?.custo_garantia_pct || 0.007) * 100).toFixed(1)}%)`} value={calculoOnFly?.custo_garantia} />
                        <CostRow label="Total Operacional" value={calculoOnFly?.custos_operacionais_totais} bold />
                      </div>
                    </div>
                  </div>

                  {/* Bloco 3: Resumo Financeiro */}
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3.5 flex flex-col border">
                      <span className="font-semibold text-slate-500 uppercase text-[9px]">Preço de Venda</span>
                      <span className="font-black text-navy text-lg">{BRL(proposta.preco_total)}</span>
                      <span className="text-[10px] text-slate-400">{calculoOnFly?.preco_por_wp || "—"} R$/Wp</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 flex flex-col border">
                      <span className="font-semibold text-slate-500 uppercase text-[9px]">Custo Total</span>
                      <span className="font-black text-slate-700 text-lg">{BRL(calculoOnFly?.custos_totais || 0)}</span>
                      <span className="text-[10px] text-slate-400">{proposta.preco_total > 0 ? ((calculoOnFly?.custos_totais || 0) / proposta.preco_total * 100).toFixed(1) : 0}% do preço</span>
                    </div>
                    <div className={`rounded-xl p-3.5 flex flex-col border ${(calculoOnFly?.lucro_liquido_real || 0) >= 0 ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}>
                      <span className={`font-bold uppercase text-[9px] ${(calculoOnFly?.lucro_liquido_real || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>★ Lucro Líquido Real</span>
                      <span className={`font-black text-lg ${(calculoOnFly?.lucro_liquido_real || 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{BRL(calculoOnFly?.lucro_liquido_real || 0)}</span>
                      <span className={`text-[10px] font-bold ${(calculoOnFly?.lucro_liquido_real || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{((calculoOnFly?.lucro_liquido_pct || 0) * 100).toFixed(1)}% sobre o preço</span>
                    </div>
                  </div>

                  {/* Bloco 4: Indicadores de Rentabilidade */}
                  <div className="bg-navy/3 rounded-xl border p-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">📊 Rentabilidade do Projeto</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white rounded-lg p-2.5 border text-center">
                        <div className="text-slate-400 text-[9px] uppercase">Margem Bruta</div>
                        <div className="font-black text-slate-700">{BRL(calculoOnFly?.margem_bruta || 0)}</div>
                        <div className="text-[9px] text-slate-400">{((calculoOnFly?.margem_bruta_pct || 0) * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 border text-center">
                        <div className="text-slate-400 text-[9px] uppercase">Payback Ajustado</div>
                        <div className="font-black text-slate-700">{calculoOnFly?.payback_ajustado_meses || "—"}</div>
                        <div className="text-[9px] text-slate-400">meses</div>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 border text-center">
                        <div className="text-slate-400 text-[9px] uppercase">TIR Anual</div>
                        <div className="font-black text-emerald-600">{calculoOnFly?.tir_anual_pct || "—"}%</div>
                        <div className="text-[9px] text-slate-400">a.a.</div>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 border text-center">
                        <div className="text-slate-400 text-[9px] uppercase">VPL (TMA 10%)</div>
                        <div className="font-black text-emerald-600">{BRL(calculoOnFly?.vpl_brl || 0)}</div>
                        <div className="text-[9px] text-slate-400">25 anos</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-3">
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">Especificações do Kit</span><span className="font-extrabold text-navy">{proposta.qtd_modulos} módulos × {proposta.potencia_modulo_w}W ({proposta.kwp_sistema} kWp)</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Área necessária</span><span className="font-semibold">{proposta.area_necessaria_m2} m²</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Investimento da Venda</span><span className="font-black text-navy">{BRL(proposta.preco_total)}</span></div>
                    
                    {proposta.parceiro_id && (
                      <div className="bg-sun/15 border border-sun/50 rounded-xl p-4 flex justify-between items-center text-navy-deep">
                        <div>
                          <strong className="block text-xs font-bold uppercase tracking-wider">Sua Comissão Estimada</strong>
                          <span className="text-[10px] text-navy/70">Taxa individual: {parceiro?.comissao_percent !== null && parceiro?.comissao_percent !== undefined ? `${parceiro.comissao_percent}%` : proposta.preco_total > 0 ? `${(((calculoOnFly?.custo_comissao || 0) / proposta.preco_total) * 100).toFixed(0)}%` : "5%"}</span>
                        </div>
                        <strong className="text-lg font-black text-navy">{BRL(calculoOnFly?.custo_comissao || (proposta.preco_total * 0.05))}</strong>
                      </div>
                    )}
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

const CostRow = ({ label, value, bold, isZero }: { label: string; value: number | null | undefined; bold?: boolean; isZero?: boolean }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-slate-200 last:border-b-0 ${bold ? "font-bold text-navy pt-2" : "text-slate-600 text-[11px]"}`}>
    <span>{label}</span>
    {isZero
      ? <span className="text-emerald-600 font-bold text-[10px]">R$ 0 (Direta)</span>
      : <span>{typeof value === "number" && !isNaN(value) ? BRL(value) : "—"}</span>
    }
  </div>
);
