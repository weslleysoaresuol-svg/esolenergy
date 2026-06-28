import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileSpreadsheet, ShoppingCart, Share2, MessageCircle, Mail, Copy, Sun, Check } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/cotacoes/$id")({
  head: () => ({ meta: [{ title: "Cotação — ESOL Energy" }] }),
  component: CotacaoDetail,
});

function CotacaoDetail() {
  const { id } = Route.useParams();
  const { user, role } = useCurrentUser();
  const navigate = useNavigate();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("cotacoes")
      .select("*, cliente:cliente_id(*), kit:kit_id(*), parceiro:parceiro_id(nome, telefone, email)")
      .eq("id", id).maybeSingle();
    setC(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando…</div>;
  if (!c) return <div className="p-6">Cotação não encontrada</div>;

  const kit = c.kit || c.kit_snapshot;
  const linkPublico = `${window.location.origin}/cotacao/${c.codigo_publico}`;

  const baixarPDF = async () => {
    // Print-friendly: usa window.print num clone simples
    const w = window.open("", "_blank");
    if (!w || !printRef.current) return;
    w.document.write(`<html><head><title>Cotação ${kit.nome}</title>
      <script src="https://cdn.tailwindcss.com"></script></head>
      <body class="p-8">${printRef.current.innerHTML}
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    w.document.close();
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
              <Button onClick={gerarProposta} className="w-full justify-start bg-violet-600 hover:bg-violet-700">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Gerar Proposta Completa
              </Button>
              <Button onClick={gerarPedido} className="w-full justify-start bg-emerald-600 hover:bg-emerald-700"
                disabled={c.status === "convertida_pedido"}>
                {c.status === "convertida_pedido" ? <Check className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                {c.status === "convertida_pedido" ? "Pedido já gerado" : "Gerar Pedido"}
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
