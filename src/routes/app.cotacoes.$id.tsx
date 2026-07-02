import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileSpreadsheet, ShoppingCart, Share2, MessageCircle, Mail, Copy, Sun, Check, Landmark, FileText } from "lucide-react";
import { BRL, calcularProposta } from "@/lib/proposta-calc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/app/cotacoes/$id")({
  head: () => ({ meta: [{ title: "Cotação — ESOL Energy" }] }),
  component: CotacaoDetail,
});

function CotacaoDetail() {
  const { id } = Route.useParams();
  const { user, role, profile } = useCurrentUser();
  const navigate = useNavigate();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openMirror, setOpenMirror] = useState(false);
  const [params, setParams] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: pr }] = await Promise.all([
      (supabase.from as any)("cotacoes")
        .select("*, cliente:cliente_id(*), kit:kit_id(*), parceiro:parceiro_id(nome, telefone, email, comissao_percent)")
        .eq("id", id).maybeSingle(),
      (supabase.rpc as any)("get_parametros_publicos")
    ]);
    setC(data);
    if (pr) setParams(pr);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const calculoOnFly = useMemo(() => {
    if (!c || !params) return null;
    
    if (c.custo_equipamentos !== null && c.custo_equipamentos !== undefined) {
      return c;
    }
    
    const client = c.cliente;
    const clientConsumo = client ? Number((client as any).consumo_kwh || (client.valor_fatura ? Math.round(Number(client.valor_fatura) / (params.tarifa_kwh_default || 0.95)) : 500)) : 500;
    const clientEstado = client?.estado || "SP";
    
    const kwp = Number(kit?.potencia_kwp || c.kwp_sistema || 0) * (c.quantidade || 1);
    const modulos = Number(kit?.quantidade_modulos || c.qtd_modulos || 0) * (c.quantidade || 1);

    return calcularProposta({
      consumo_kwh: clientConsumo,
      tarifa_kwh: params.tarifa_kwh_default || 0.95,
      estado: clientEstado,
      tipo: "residencial",
      preco_override: c.preco_total,
      kwp_override: kwp,
      qtd_modulos_override: modulos,
      comissao_percent_override: c.parceiro?.comissao_percent !== null && c.parceiro?.comissao_percent !== undefined ? Number(c.parceiro.comissao_percent) : undefined,
    }, params);
  }, [c, params, kit]);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando…</div>;
  if (!c) return <div className="p-6">Cotação não encontrada</div>;

  const kit = c.kit || c.kit_snapshot;
  const linkPublico = typeof window !== "undefined" ? `${window.location.origin}/cotacao/${c.codigo_publico}` : "";

  const baixarPDF = async () => {
    // Print-friendly: cria um documento seguro sem interpolar HTML de dados.
    const w = window.open("", "_blank");
    if (!w || !printRef.current) return;
    const doc = w.document;
    doc.open();
    doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
    doc.close();
    // Title via textContent (evita quebra de tag <title> via kit.nome)
    const titleEl = doc.createElement("title");
    titleEl.textContent = `Cotação ${kit?.nome ?? ""}`;
    doc.head.appendChild(titleEl);
    // Tailwind via <link>/<script> tag criada por DOM (sem raw HTML)
    const script = doc.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    doc.head.appendChild(script);
    // Corpo: clone do nó React já renderizado (não é HTML controlado pelo usuário)
    doc.body.className = "p-8";
    const clone = printRef.current.cloneNode(true) as HTMLElement;
    doc.body.appendChild(clone);
    w.onload = () => w.print();
  };


  const gerarProposta = async () => {
    // Encaminha pro wizard pré-preenchido (consumo estimado por kWp do kit)
    const consumoEst = Math.round((Number(kit.potencia_kwp) * 5 * 30 * 0.8));
    toast.info("Abrindo wizard de proposta com dados pré-preenchidos…");
    navigate({
      to: "/app/propostas/nova",
      search: { cliente: c.cliente_id, consumo: consumoEst, cotacao: c.id } as any,
    });
  };

  const gerarPedido = async () => {
    if (!user) return;
    if (!confirm(`Confirmar pedido de ${c.quantidade}x ${kit.nome} para ${c.cliente?.nome}?`)) return;
    
    try {
      // 1. Cria o pedido
      const { data, error } = await (supabase.from as any)("pedidos").insert({
        parceiro_id: user.id,
        cliente_id: c.cliente_id,
        origem: "cotacao",
        origem_id: c.id,
        kit_snapshot: kit,
        descricao: `${c.quantidade}x ${kit.nome}`,
        valor_total: c.preco_total,
        status: "novo",
      }).select().single();

      if (error) throw error;

      // 2. Atualiza a cotação
      await (supabase.from as any)("cotacoes").update({
        status: "convertida_pedido", pedido_id: data.id,
      }).eq("id", c.id);

      // 3. Registra na Timeline
      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: c.cliente_id, parceiro_id: user.id,
        tipo: "pedido", referencia_id: data.id,
        titulo: `Pedido ${data.numero} criado a partir da cotação`,
        descricao: `${c.quantidade}x ${kit.nome} — ${BRL(Number(c.preco_total))}`,
      });

      // 4. Lança Comissões do Parceiro automaticamente (Gatilho 1: 50% em 30 dias, Gatilho 2: 50% em 60 dias)
      const { data: prof } = await supabase.from("profiles").select("comissao_percent").eq("id", user.id).maybeSingle();
      const pct = Number(prof?.comissao_percent || 5); // fallback para 5%
      const valTotalComissao = Number(c.preco_total) * (pct / 100);
      const valParcela = valTotalComissao / 2;

      const d30 = new Date(); d30.setDate(d30.getDate() + 30);
      const d60 = new Date(); d60.setDate(d60.getDate() + 60);

      await (supabase.from as any)("parceiro_comissoes").insert([
        {
          parceiro_id: user.id,
          pedido_id: data.id,
          valor_total_pedido: c.preco_total,
          percentual_comissao: pct,
          valor_comissao: valParcela,
          parcela: 1,
          total_parcelas: 2,
          status: "a_receber",
          data_previsao_pagamento: d30.toISOString().split("T")[0],
          detalhes: "Gatilho 1: Liberação após Fechamento/Assinatura de Contrato"
        },
        {
          parceiro_id: user.id,
          pedido_id: data.id,
          valor_total_pedido: c.preco_total,
          percentual_comissao: pct,
          valor_comissao: valParcela,
          parcela: 2,
          total_parcelas: 2,
          status: "a_receber",
          data_previsao_pagamento: d60.toISOString().split("T")[0],
          detalhes: "Gatilho 2: Liberação pós Conclusão de Montagem Física"
        }
      ]);

      // 5. Lança Compra do Kit com Fornecedor (Aldo Solar ou Sou Energy) - Faturamento Direto (Simulando kit como 50% do total)
      const { data: forn } = await (supabase.from as any)("fornecedores_solar")
        .select("id")
        .ilike("nome", kit.fornecedor || "%aldo%").maybeSingle();

      const targetFornId = forn?.id;
      
      if (targetFornId) {
        const d15 = new Date(); d15.setDate(d15.getDate() + 15);
        await (supabase.from as any)("fornecedor_pagamentos").insert({
          fornecedor_id: targetFornId,
          pedido_id: data.id,
          valor_kit: Number(c.preco_total) * 0.5, // 50% representativo de equipamentos
          status: "pendente",
          data_vencimento: d15.toISOString().split("T")[0]
        });
      }

      toast.success(`Pedido ${data.numero} criado e comissões programadas!`);
      navigate({ to: "/app/pedidos/$id", params: { id: data.id } });
    } catch (err: any) {
      toast.error("Erro ao gerar pedido: " + err.message);
    }
  };

  const solicitarFinanciamento = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase.from as any)("financiamentos").insert({
        parceiro_id: user.id,
        cliente_id: c.cliente_id,
        valor_solicitado: c.preco_total,
        status: "aguardando_documentos",
      }).select().single();
      if (error) throw error;

      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: c.cliente_id, parceiro_id: user.id,
        tipo: "financiamento", referencia_id: data.id,
        titulo: "Financiamento solicitado via Cotação",
        descricao: `${kit.nome} — ${BRL(Number(c.preco_total))}`,
      });

      toast.success("Solicitação de Financiamento iniciada!");
      navigate({ to: "/app/financiamentos/$id", params: { id: data.id } });
    } catch (err: any) {
      toast.error("Erro ao solicitar financiamento: " + err.message);
    }
  };

  const compartilharWhatsApp = () => {
    const msg = encodeURIComponent(`Olá ${c.cliente?.nome}! Segue a cotação do seu kit solar:\n\n☀️ ${kit.nome}\n💰 ${BRL(Number(c.preco_total))}\n\nVeja todos os detalhes:\n${linkPublico}`);
    const tel = (c.cliente?.telefone || "").replace(/\D/g, "");
    window.open(`https://wa.me/55${tel}?text=${msg}`, "_blank");
  };

  const copiarLink = async () => {
    await navigator.clipboard.writeText(linkPublico);
    toast.success("Link copiado!");
  };

  return (
    <div className="space-y-6">
      <Link to="/app/cotacoes" className="inline-flex items-center text-sm text-muted-foreground hover:text-navy">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card do produto */}
        <Card className="lg:col-span-2 p-6" ref={printRef as any}>
          <div className="flex items-start gap-2 mb-4">
            <Badge className="bg-sun text-navy">{kit.potencia_kwp} kWp</Badge>
            {kit.destaque && <Badge className="bg-amber-100 text-amber-800">⭐ Destaque</Badge>}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {kit.imagem_url ? (
              <img src={kit.imagem_url} alt={kit.nome} className="w-full h-56 object-cover rounded-xl" />
            ) : (
              <div className="w-full h-56 rounded-xl bg-gradient-to-br from-sun/30 to-sun-deep/20 flex items-center justify-center">
                <Sun className="w-20 h-20 text-sun-deep" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-navy mb-2">{kit.nome}</h1>
              <div className="text-3xl font-extrabold text-sun-deep mb-1">{BRL(Number(c.preco_total))}</div>
              <p className="text-xs text-muted-foreground mb-4">{c.quantidade}x · {BRL(Number(c.preco_unit))} cada</p>
              <div className="space-y-1.5 text-sm">
                <Linha label="Módulos" v={`${kit.quantidade_modulos}x ${kit.fabricante_modulos || ""} ${kit.potencia_modulo_w}W`} />
                <Linha label="Inversor" v={kit.inversor || "—"} />
                <Linha label="Tecnologia" v={kit.tecnologia_modulo} />
                <Linha label="Eficiência" v={`${kit.eficiencia_modulo}%`} />
                <Linha label="Garantia módulos" v={`${kit.garantia_modulos_anos} anos`} />
                <Linha label="Garantia inversor" v={`${kit.garantia_inversor_anos} anos`} />
              </div>
            </div>
          </div>
          {c.observacoes && (
            <div className="mt-6 p-3 bg-slate-50 rounded-lg text-sm">
              <div className="font-semibold mb-1">Observações</div>
              <p className="text-muted-foreground whitespace-pre-wrap">{c.observacoes}</p>
            </div>
          )}
        </Card>

        {/* Ações */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3">Próximo passo</h2>
            <div className="space-y-2">
              <Button onClick={baixarPDF} variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" /> Baixar PDF
              </Button>
              
              <Dialog open={openMirror} onOpenChange={setOpenMirror}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-amber-500 hover:bg-amber-600 hover:text-white text-white border-0 font-bold flex gap-1 items-center">
                    <FileText className="w-4 h-4" /> Ver Espelho Financeiro
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
                      {(calculoOnFly?.fornecedor || c.fornecedor) && (
                        <div className="bg-navy/5 rounded-xl p-3 border text-xs flex justify-between items-center">
                          <span className="font-semibold text-slate-500 uppercase text-[9px]">Distribuidor / Fornecedor</span>
                          <strong className="text-navy text-sm font-black uppercase">{calculoOnFly?.fornecedor || c.fornecedor}</strong>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Diretos (Compra B2B)</span>
                          <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
                            <CostRow label="Equipamentos (Kit)" value={calculoOnFly?.custo_equipamentos} />
                            <CostRow label="Instalação / Integração" value={calculoOnFly?.custo_instalacao} />
                            <CostRow label="Frete" value={calculoOnFly?.custo_frete} />
                            <CostRow label="Impostos de Compra" value={calculoOnFly?.custo_impostos_compra} />
                            <CostRow label="Comissão do Parceiro" value={calculoOnFly?.custo_comissao} />
                            <CostRow label="Total Custos Diretos" value={c.preco_total - (calculoOnFly?.margem_bruta || 0)} bold />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Operacionais e Margens (ESOL)</span>
                          <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
                            <CostRow label="Tributação ESOL" value={calculoOnFly?.custo_tributacao_empresa} />
                            <CostRow label="CAC / Marketing" value={calculoOnFly?.custo_marketing} />
                            <CostRow label="Engenharia / Fixo" value={calculoOnFly?.custo_engenharia_fixo} />
                            <CostRow label="Overhead / Adm" value={calculoOnFly?.custo_overhead} />
                            <CostRow label="Provisão de Garantia" value={calculoOnFly?.custo_garantia} />
                            <CostRow label="Despesas Op. Totais" value={calculoOnFly?.custos_operacionais_totais} bold />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center border">
                          <span className="font-semibold text-slate-700 text-xs">Margem Bruta</span>
                          <span className="font-bold text-slate-700 text-sm">{BRL(calculoOnFly?.margem_bruta || 0)} {c.preco_total > 0 && `(${( ((calculoOnFly?.margem_bruta || 0) / c.preco_total) * 100 ).toFixed(1)}%)`}</span>
                        </div>
                        
                        <div className={`rounded-xl p-3.5 flex justify-between items-center border ${calculoOnFly?.lucro_liquido_real >= 0 ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
                          <span className="font-bold text-xs uppercase tracking-wide">★ Lucro Líquido Real</span>
                          <span className="font-black text-sm">{BRL(calculoOnFly?.lucro_liquido_real || 0)} {calculoOnFly?.lucro_liquido_pct !== null && calculoOnFly?.lucro_liquido_pct !== undefined && calculoOnFly?.lucro_liquido_pct !== 0 ? `(${(calculoOnFly?.lucro_liquido_pct * 100).toFixed(1)}%)` : c.preco_total > 0 ? `(${( ((calculoOnFly?.lucro_liquido_real || 0) / c.preco_total) * 100 ).toFixed(1)}%)` : ""}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-3">
                        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">Especificações do Kit</span><span className="font-extrabold text-navy">{kit.nome}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Valor de Venda</span><span className="font-black text-navy">{BRL(c.preco_total)}</span></div>
                        
                        <div className="bg-sun/15 border border-sun/50 rounded-xl p-4 flex justify-between items-center text-navy-deep">
                          <div>
                            <strong className="block text-xs font-bold uppercase tracking-wider">Sua Comissão Estimada</strong>
                            <span className="text-[10px] text-navy/70">Taxa individual: {c.parceiro?.comissao_percent !== null && c.parceiro?.comissao_percent !== undefined ? `${c.parceiro.comissao_percent}%` : c.preco_total > 0 ? `${(((calculoOnFly?.custo_comissao || 0) / c.preco_total) * 100).toFixed(0)}%` : "5%"}</span>
                          </div>
                          <strong className="text-lg font-black text-navy">{BRL(calculoOnFly?.custo_comissao || (c.preco_total * 0.05))}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button onClick={gerarProposta} className="w-full justify-start bg-violet-600 hover:bg-violet-700">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Gerar Proposta Completa
              </Button>
              <Button onClick={gerarPedido} className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 font-bold"
                disabled={c.status === "convertida_pedido"}>
                {c.status === "convertida_pedido" ? <Check className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                {c.status === "convertida_pedido" ? "Pedido já gerado" : "Gerar Pedido"}
              </Button>
              <Button onClick={solicitarFinanciamento} className="w-full justify-start bg-blue-600 hover:bg-blue-700 font-bold">
                <Landmark className="w-4 h-4 mr-2" /> Solicitar Financiamento
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-navy mb-3 flex items-center gap-2"><Share2 className="w-4 h-4" /> Compartilhar</h2>
            <div className="space-y-2">
              <Button onClick={compartilharWhatsApp} variant="outline" className="w-full justify-start">
                <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" /> WhatsApp
              </Button>
              <Button
                onClick={() => window.open(`mailto:${c.cliente?.email || ""}?subject=Cotação ESOL Energy&body=${encodeURIComponent(linkPublico)}`)}
                variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2 text-blue-600" /> Email
              </Button>
              <Button onClick={copiarLink} variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" /> Copiar link
              </Button>
            </div>
            <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-muted-foreground break-all">{linkPublico}</div>
          </Card>

          <Card className="p-4 bg-slate-50">
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Cliente:</strong> {c.cliente?.nome}</div>
              <div><strong>Parceiro:</strong> {c.parceiro?.nome}</div>
              <div><strong>Criada:</strong> {new Date(c.created_at).toLocaleDateString("pt-BR")}</div>
              <div><strong>Validade:</strong> {new Date(c.expires_at).toLocaleDateString("pt-BR")}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Linha({ label, v }: { label: string; v: string }) {
  return <div className="flex justify-between gap-3 border-b border-dashed pb-1"><span className="text-muted-foreground">{label}</span><span className="text-navy font-medium text-right">{v}</span></div>;
}

const CostRow = ({ label, value, bold }: { label: string; value: number | null | undefined; bold?: boolean }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0 ${bold ? "font-bold text-navy pt-2" : "text-slate-600 text-[11px]"}`}>
    <span>{label}</span>
    <span>{typeof value === "number" && !isNaN(value) ? BRL(value) : "—"}</span>
  </div>
);
