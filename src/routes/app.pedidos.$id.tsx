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
import { ArrowLeft, Landmark, Save, ShieldAlert, FileText, CheckCircle2, Upload, ExternalLink, Zap, HelpCircle, FileCheck, DollarSign } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pedidos/$id")({
  component: PedidoDetail,
});

const STATUS_PIPELINE = [
  { id: "novo", label: "Abertura" },
  { id: "analise_tecnica", label: "Análise Técnica" },
  { id: "assinatura_contrato", label: "Contrato ESOL" },
  { id: "faturado", label: "Faturamento" },
  { id: "expedido", label: "Expedido" },
  { id: "instalado", label: "Instalação" },
  { id: "concluido", label: "Concluído" }
];

const STATUS_LIST = ["novo", "analise_tecnica", "assinatura_contrato", "faturado", "expedido", "entregue", "instalado", "concluido", "cancelado"];

function PedidoDetail() {
  const { id } = Route.useParams();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  
  const [p, setP] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [subindo, setSubindo] = useState(false);
  const [kits, setKits] = useState<any[]>([]);
  const [filtroKit, setFiltroKit] = useState("");
  
  // Dados manuais de transação
  const [banco, setBanco] = useState("");
  const [codigoTransacao, setCodigoTransacao] = useState("");

  // Novos campos de Homologação / Engenharia de Pós-Venda
  const [concessionaria, setConcessionaria] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [dataVistoriaStr, setDataVistoriaStr] = useState("");
  const [parecerUrl, setParecerUrl] = useState("");
  const [subindoParecer, setSubindoParecer] = useState(false);
  
  const load = async () => {
    const [{ data: ped }, { data: kt }] = await Promise.all([
      (supabase.from as any)("pedidos")
        .select("*, cliente:cliente_id(nome, telefone, email)")
        .eq("id", id).maybeSingle(),
      (supabase.from as any)("kits_produtos").select("*").eq("ativo", true)
    ]);
    
    setP(ped);
    setKits(kt || []);
    
    if (ped?.transacao_dados) {
      setBanco(ped.transacao_dados.banco || "");
      setCodigoTransacao(ped.transacao_dados.codigo_transacao || "");
    }

    if (ped) {
      setConcessionaria(ped.concessionaria_distribuidora || "");
      setProtocolo(ped.protocolo_homologacao || "");
      setDataVistoriaStr(ped.data_vistoria ? ped.data_vistoria.split("T")[0] : "");
      setParecerUrl(ped.parecer_acesso_url || "");
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!p) return <div className="p-6 text-muted-foreground">Carregando…</div>;
  const kit = p.kit_snapshot || {};

  const salvar = async (patch: any) => {
    setSaving(true);
    try {
      await (supabase.from as any)("pedidos").update(patch).eq("id", p.id);
      
      // Sincroniza o CRM de forma bidirecional ao mudar status do pedido
      if (patch.status && p.cliente_id) {
        let cStatus = null;
        let motivoPerda = null;
        let fechadoEm = null;
        let perdidoEm = null;
        
        if (patch.status === "instalado") {
          cStatus = "instalacao";
        } else if (patch.status === "concluido") {
          cStatus = "concluido";
          fechadoEm = new Date().toISOString();
        } else if (patch.status === "novo" || patch.status === "analise_tecnica" || patch.status === "assinatura_contrato" || patch.status === "faturado") {
          cStatus = "contrato_assinado";
        } else if (patch.status === "cancelado") {
          cStatus = "desistiu";
          motivoPerda = "outro";
          perdidoEm = new Date().toISOString();
        }
        
        if (cStatus) {
          await supabase.from("clientes").update({ 
            status: cStatus,
            ...(motivoPerda ? { motivo_perda: motivoPerda } : {}),
            ...(fechadoEm ? { fechado_em: fechadoEm } : {}),
            ...(perdidoEm ? { perdido_em: perdidoEm } : {})
          }).eq("id", p.cliente_id);
        }
      }
      
      toast.success("Pedido atualizado com sucesso!");
      load();
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadParecer = async (file: File) => {
    setSubindoParecer(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `pareceres_acesso/${p.id}_parecer_acesso.${ext}`;
      
      const { error: upErr } = await supabase.storage
        .from("parceiros")
        .upload(path, file, { upsert: true });
        
      if (upErr) throw upErr;

      const publicUrl = supabase.storage.from("parceiros").getPublicUrl(path).data.publicUrl;
      setParecerUrl(publicUrl);
      await (supabase.from as any)("pedidos").update({ parecer_acesso_url: publicUrl }).eq("id", p.id);
      toast.success("Parecer de Acesso carregado!");
      load();
    } catch (err: any) {
      toast.error("Erro no upload do parecer: " + err.message);
    } finally {
      setSubindoParecer(false);
    }
  };

  const solicitarFinanciamento = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase.from as any)("financiamentos").insert({
        parceiro_id: user.id,
        cliente_id: p.cliente_id,
        pedido_id: p.id,
        valor_solicitado: p.valor_total,
        status: "aguardando_documentos",
      }).select().single();
      
      if (error) throw error;
      
      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: p.cliente_id, parceiro_id: user.id,
        tipo: "financiamento", referencia_id: data.id,
        titulo: "Financiamento solicitado via Pedido",
        descricao: `Pedido ${p.numero} — ${BRL(Number(p.valor_total))}`,
      });
      
      toast.success("Financiamento criado!");
      navigate({ to: "/app/financiamentos/$id", params: { id: data.id } });
    } catch (err: any) {
      toast.error("Erro ao criar financiamento: " + err.message);
    }
  };

  // Upload do Contrato de Instalação ESOL <-> Cliente
  const handleUploadContrato = async (file: File) => {
    setSubindo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `contratos_clientes/${p.id}_contrato_esol.${ext}`;
      
      const { error: upErr } = await supabase.storage
        .from("parceiros")
        .upload(path, file, { upsert: true });
        
      if (upErr) throw upErr;

      const publicUrl = supabase.storage.from("parceiros").getPublicUrl(path).data.publicUrl;
      await (supabase.from as any)("pedidos").update({
        contrato_cliente_url: publicUrl,
        contrato_cliente_status: "assinado",
        status: "faturado" // Avança para faturamento automático
      }).eq("id", p.id);
      
      toast.success("Contrato de Instalação assinado e anexado!");
      load();
    } catch (err: any) {
      toast.error("Erro no upload do contrato: " + err.message);
    } finally {
      setSubindo(false);
    }
  };

  // Upload do Comprovante de Pagamento Manual
  const handleUploadComprovante = async (file: File) => {
    setSubindo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `comprovantes_pagamentos/${p.id}_comprovante.${ext}`;
      
      const { error: upErr } = await supabase.storage
        .from("parceiros")
        .upload(path, file, { upsert: true });
        
      if (upErr) throw upErr;

      const publicUrl = supabase.storage.from("parceiros").getPublicUrl(path).data.publicUrl;
      
      const novosDados = {
        ...(p.transacao_dados || {}),
        banco,
        codigo_transacao: codigoTransacao,
        atualizado_em: new Date().toISOString()
      };

      await (supabase.from as any)("pedidos").update({
        comprovante_url: publicUrl,
        transacao_dados: novosDados,
        status: "expedido" // Avança para expedido após faturamento aprovado
      }).eq("id", p.id);
      
      toast.success("Comprovante anexado e faturamento concluído!");
      load();
    } catch (err: any) {
      toast.error("Erro no upload do comprovante: " + err.message);
    } finally {
      setSubindo(false);
    }
  };

  // Sugerir outro kit similar por indisponibilidade no fornecedor
  const sugerirKitAlternativo = async (kitId: string) => {
    try {
      const kitSugerido = kits.find(k => k.id === kitId);
      if (!kitSugerido) return;

      await (supabase.from as any)("pedidos").update({
        kit_sugerido_id: kitId,
        kit_sugerido_aprovado: false
      }).eq("id", p.id);

      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: p.cliente_id,
        tipo: "pedido",
        referencia_id: p.id,
        titulo: "Kit Alternativo Sugerido",
        descricao: `Devido a indisponibilidade, sugerimos o kit: ${kitSugerido.nome} (${BRL(Number(kitSugerido.preco))})`,
      });

      toast.success(`Sugerido kit alternativo: ${kitSugerido.nome}`);
      load();
    } catch (err: any) {
      toast.error("Erro ao sugerir kit: " + err.message);
    }
  };

  // Aceitar kit alternativo pelo cliente
  const aceitarKitSugerido = async () => {
    try {
      const kitSugerido = kits.find(k => k.id === p.kit_sugerido_id);
      if (!kitSugerido) return;

      await (supabase.from as any)("pedidos").update({
        kit_snapshot: kitSugerido,
        valor_total: kitSugerido.preco, // Ajusta o valor total do pedido para o preço do novo kit
        kit_sugerido_aprovado: true,
        status: "assinatura_contrato" // Avança para assinatura do contrato
      }).eq("id", p.id);

      // Recalcula comissões vinculadas
      const { data: coms } = await (supabase.from as any)("parceiro_comissoes")
        .select("id, percentual_comissao, total_parcelas")
        .eq("pedido_id", p.id);
        
      if (coms && coms.length > 0) {
        for (const com of coms) {
          const novoValCom = (Number(kitSugerido.preco) * (Number(com.percentual_comissao) / 100)) / Number(com.total_parcelas);
          await (supabase.from as any)("parceiro_comissoes")
            .update({
              valor_total_pedido: kitSugerido.preco,
              valor_comissao: novoValCom
            })
            .eq("id", com.id);
        }
      }

      // Atualiza valor de pagamento ao fornecedor do kit (Faturamento Direto)
      await (supabase.from as any)("fornecedor_pagamentos")
        .update({
          valor_kit: Number(kitSugerido.preco) * 0.5
        })
        .eq("pedido_id", p.id);

      toast.success("Substituição de kit aprovada, comissões recalculadas e fornecedor atualizado!");
      load();
    } catch (err: any) {
      toast.error("Erro ao aprovar substituição: " + err.message);
    }
  };

  // Recomendar kits por similaridade de potência ou faixa de preço
  const originalPower = Number(kit.potencia_kwp || 0);
  const originalPrice = Number(p.valor_total || 0);
  
  const kitsSimilares = kits
    .filter(k => k.id !== kit.id)
    .map(k => {
      const powerDiff = Math.abs(Number(k.potencia_kwp || 0) - originalPower);
      const priceDiff = Math.abs(Number(k.preco || 0) - originalPrice);
      return { ...k, powerDiff, priceDiff };
    })
    .sort((a, b) => a.priceDiff - b.priceDiff)
    .slice(0, 3);

  const activeStepIdx = STATUS_PIPELINE.findIndex(s => s.id === p.status);

  return (
    <div className="space-y-6">
      <Link to="/app/pedidos" className="inline-flex items-center text-sm text-muted-foreground hover:text-navy">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Pedidos
      </Link>

      {/* Stepper Pipeline de Vendas */}
      <Card className="p-4 bg-slate-50 border-0 shadow-sm rounded-2xl overflow-hidden">
        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mb-3">Esteira de Processamento Comercial</div>
        <div className="flex items-center justify-between flex-wrap gap-2 md:flex-nowrap">
          {STATUS_PIPELINE.map((step, idx) => {
            const isCompleted = idx < activeStepIdx;
            const isActive = step.id === p.status;
            return (
              <div key={step.id} className="flex items-center gap-1.5 flex-1 min-w-[100px]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isActive ? "bg-sun text-navy ring-4 ring-sun/20 scale-110" : 
                  isCompleted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${isActive ? "text-navy" : "text-slate-500"}`}>
                  {step.label}
                </span>
                {idx < STATUS_PIPELINE.length - 1 && (
                  <div className={`hidden md:block h-0.5 flex-1 mx-2 ${isCompleted ? "bg-emerald-600" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy">{p.numero}</h1>
            <Badge className="bg-blue-100 text-blue-800 border-0 text-[10px] uppercase font-extrabold">{p.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Cliente: <span className="font-semibold text-navy">{p.cliente?.nome}</span> • Criado em {new Date(p.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Seção 1: Informações Básicas do Produto */}
          <Card className="p-5 space-y-4 rounded-2xl border-0 shadow-md">
            <h2 className="font-extrabold text-navy text-sm uppercase tracking-wider">📦 Detalhes do Equipamento Original</h2>
            <div>
              <div className="font-bold text-base text-navy">{kit.nome || p.descricao}</div>
              {kit.potencia_kwp && (
                <div className="text-xs text-muted-foreground mt-1">
                  {kit.potencia_kwp} kWp · {kit.quantidade_modulos} módulos · Inversor: {kit.inversor} · Fornecedor: <span className="font-semibold text-blue-600">{kit.fornecedor || "Aldo Solar"}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-black text-emerald-700">{BRL(Number(p.valor_total))}</div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed">
              <div>
                <Label className="text-xs">Forma de pagamento</Label>
                <Input defaultValue={p.forma_pagamento || ""} onBlur={(e) => salvar({ forma_pagamento: e.target.value })} className="text-xs" />
              </div>
              <div>
                <Label className="text-xs">Entrega prevista</Label>
                <Input type="date" defaultValue={p.data_entrega_prevista || ""} onBlur={(e) => salvar({ data_entrega_prevista: e.target.value || null })} className="text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Observações internas</Label>
              <Textarea defaultValue={p.observacoes || ""} onBlur={(e) => salvar({ observacoes: e.target.value })} rows={2} className="text-xs" />
            </div>
          </Card>

          {/* Seção 2: Análise Técnica / Separando no Fornecedor */}
          {p.status === "analise_tecnica" && (
            <Card className="p-5 space-y-4 border-2 border-amber-300 rounded-2xl bg-amber-50/20 shadow-md">
              <div>
                <h3 className="font-extrabold text-navy text-sm uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600" /> Passo 1: Análise Técnica & Fornecedor
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Os kits solares não são do nosso estoque próprio. Verifique a disponibilidade deste kit com o fornecedor (<span className="font-semibold">{kit.fornecedor || "Aldo/Sou Energy"}</span>) antes de prosseguir.
                </p>
              </div>

              <div className="p-3 bg-white border border-amber-100 rounded-xl space-y-2">
                <div className="text-xs font-bold text-navy">O kit está disponível no fornecedor?</div>
                <div className="flex gap-2">
                  <Button onClick={() => salvar({ status: "assinatura_contrato" })} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                    ✅ Sim, Kit Disponível (Seguir para Contrato)
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-navy uppercase tracking-wider">⚠️ Indisponível? Sugira um Kit Similar:</div>
                <div className="grid md:grid-cols-3 gap-3">
                  {kitsSimilares.map((k) => (
                    <div key={k.id} className="p-3 bg-white border rounded-xl flex flex-col justify-between hover:shadow-md transition">
                      <div>
                        <div className="font-bold text-xs text-navy line-clamp-2">{k.nome}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {k.potencia_kwp} kWp · {k.quantidade_modulos} mod
                        </div>
                        <div className="text-xs font-extrabold text-emerald-700 mt-2">{BRL(Number(k.preco))}</div>
                      </div>
                      <Button 
                        onClick={() => sugerirKitAlternativo(k.id)} 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full text-[10px] font-bold h-7 uppercase border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Sugerir Este
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {p.kit_sugerido_id && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-blue-800">Kit Sugerido para Substituição:</div>
                  <div className="text-xs text-navy font-semibold">
                    {kits.find(k => k.id === p.kit_sugerido_id)?.nome} ({BRL(Number(kits.find(k => k.id === p.kit_sugerido_id)?.preco))})
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={aceitarKitSugerido} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8">
                      👍 Cliente Aprovou Kit Novo (Substituir e Seguir)
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Seção 3: Assinatura do Contrato de Instalação (ESOL <-> Cliente) */}
          {p.status === "assinatura_contrato" && (
            <Card className="p-5 space-y-4 border-2 border-blue-300 rounded-2xl bg-blue-50/20 shadow-md">
              <div>
                <h3 className="font-extrabold text-navy text-sm uppercase tracking-wider flex items-center gap-1.5 text-blue-800">
                  <FileText className="w-5 h-5 text-blue-600" /> Passo 2: Contrato de Instalação e Serviços
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Gere ou anexe o contrato assinado entre a ESOL Energy e o cliente final. O faturamento só será liberado após a confirmação jurídica do contrato.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-blue-100 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-navy">Link Externo de Assinatura (Ex: Clicksign, Docusign)</div>
                    <Input 
                      value={p.contrato_cliente_url || ""} 
                      onChange={(e) => salvar({ contrato_cliente_url: e.target.value })} 
                      placeholder="https://clicksign.com/documento/..." 
                      className="text-xs mt-1"
                    />
                  </div>
                  {p.contrato_cliente_url && (
                    <Button asChild size="sm" variant="outline" className="mt-2 text-xs font-bold w-full">
                      <a href={p.contrato_cliente_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Acessar Assinatura Digital
                      </a>
                    </Button>
                  )}
                </div>

                <div className="p-3 bg-white border border-blue-100 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-navy">Upload do Contrato Assinado (PDF)</div>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        id="file-upload-contrato-cli"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadContrato(file);
                        }}
                        disabled={subindo}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload-contrato-cli")?.click()}
                        disabled={subindo}
                        className="w-full h-10 text-xs font-semibold"
                      >
                        <Upload className="w-4 h-4 mr-2" /> {subindo ? "Fazendo upload..." : "Upload do PDF do Contrato"}
                      </Button>
                    </div>
                    {p.contrato_cliente_url && (
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Contrato registrado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => salvar({ status: "faturado", contrato_cliente_status: "assinado" })} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase"
                >
                  Confirmar Assinatura & Seguir para Faturamento
                </Button>
              </div>
            </Card>
          )}

          {/* Seção 4: Faturamento e Confirmação de Pagamento */}
          {p.status === "faturado" && (
            <Card className="p-5 space-y-4 border-2 border-emerald-300 rounded-2xl bg-emerald-50/20 shadow-md">
              <div>
                <h3 className="font-extrabold text-navy text-sm uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                  <DollarSign className="w-5 h-5 text-emerald-600" /> Passo 3: Faturamento & Liquidação Comercial
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirme o recebimento financeiro deste pedido para liberar a separação e expedição dos módulos.
                </p>
              </div>

              {p.contrato_cliente_url && (
                <div className="p-2.5 bg-emerald-100/30 text-[11px] text-emerald-800 rounded-lg flex items-center gap-1.5 border border-emerald-200">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <strong>Contrato Vinculado:</strong> <a href={p.contrato_cliente_url} target="_blank" rel="noopener noreferrer" className="underline font-bold">Ver Contrato do Cliente</a>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-emerald-100 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-navy uppercase">🔗 Dados de Conciliação Manual</div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-[10px]">Banco de Origem</Label>
                      <Input 
                        value={banco} 
                        onChange={(e) => setBanco(e.target.value)} 
                        placeholder="Ex: Santander, Banco do Brasil" 
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Código de Autenticação / Transação</Label>
                      <Input 
                        value={codigoTransacao} 
                        onChange={(e) => setCodigoTransacao(e.target.value)} 
                        placeholder="Código do comprovante ou PIX TID" 
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-emerald-100 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-navy uppercase">📄 Anexo do Comprovante (Foto/PDF)</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Faça o upload do comprovante de transferência bancária, TED ou PIX.</p>
                  </div>
                  <div className="relative pt-2">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      id="file-upload-comprovante"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadComprovante(file);
                      }}
                      disabled={subindo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload-comprovante")?.click()}
                      disabled={subindo || !banco}
                      className="w-full h-10 text-xs font-semibold"
                    >
                      <Upload className="w-4 h-4 mr-2" /> {subindo ? "Fazendo upload..." : "Upload Comprovante"}
                    </Button>
                    {!banco && <p className="text-[9px] text-rose-500 mt-1 font-bold">Preencha o banco de origem primeiro</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => {
                    const novosDados = {
                      banco,
                      codigo_transacao: codigoTransacao,
                      confirmado_manualmente: true
                    };
                    salvar({
                      status: "expedido",
                      transacao_dados: novosDados
                    });
                  }} 
                  disabled={!banco || !codigoTransacao}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase"
                >
                  Confirmar Pagamento Manual & Despachar
                </Button>
              </div>
            </Card>
          )}

          {/* Seção 5: Homologação e Engenharia de Pós-Venda */}
          <Card className="p-5 space-y-4 rounded-2xl border-0 shadow-md">
            <div>
              <h2 className="font-extrabold text-navy text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-sun-deep" /> Homologação & Engenharia de Pós-Venda
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Mapeamento do processo de liberação técnica junto à distribuidora de energia.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Concessionária / Distribuidora</Label>
                <Input
                  value={concessionaria}
                  onChange={(e) => setConcessionaria(e.target.value)}
                  onBlur={() => salvar({ concessionaria_distribuidora: concessionaria })}
                  placeholder="Ex: CPFL, Enel, Neoenergia, Light..."
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Protocolo de Homologação</Label>
                <Input
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  onBlur={() => salvar({ protocolo_homologacao: protocolo })}
                  placeholder="Número do protocolo de entrada"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Previsão / Data de Vistoria</Label>
                <Input
                  type="date"
                  value={dataVistoriaStr}
                  onChange={(e) => setDataVistoriaStr(e.target.value)}
                  onBlur={() => salvar({ data_vistoria: dataVistoriaStr ? new Date(dataVistoriaStr).toISOString() : null })}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Parecer de Acesso (PDF)</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    id="file-upload-parecer"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadParecer(file);
                    }}
                    disabled={subindoParecer}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload-parecer")?.click()}
                    disabled={subindoParecer}
                    className="flex-1 text-xs font-semibold h-9"
                  >
                    <Upload className="w-4 h-4 mr-1.5" />
                    {subindoParecer ? "Carregando..." : parecerUrl ? "Substituir Parecer" : "Anexar Parecer"}
                  </Button>
                  {parecerUrl && (
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg">
                      <a href={parecerUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Barra Lateral de Status & Ações */}
        <div className="space-y-4">
          <Card className="p-5 rounded-2xl border-0 shadow-md">
            <h2 className="font-extrabold text-navy text-xs uppercase tracking-wider mb-3">Status Operacional</h2>
            <Select value={p.status} onValueChange={(v) => salvar({ status: v })}>
              <SelectTrigger className="text-xs font-semibold"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_LIST.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs font-semibold">
                    {s.replace(/_/g, " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-2">Altere o status manualmente se precisar forçar uma etapa.</p>
          </Card>

          <Card className="p-5 rounded-2xl border-0 shadow-md">
            <h2 className="font-extrabold text-navy text-xs uppercase tracking-wider mb-3">Financiamento Bancário</h2>
            <Button onClick={solicitarFinanciamento} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex gap-1.5 items-center justify-center text-xs h-10">
              <Landmark className="w-4 h-4" /> Solicitar Novo Financiamento
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2">Use esta opção para abrir uma esteira de crédito do valor do pedido com bancos parceiros.</p>
          </Card>

          {/* Histórico/Timeline Resumida do Pedido */}
          <Card className="p-5 rounded-2xl border-0 shadow-md space-y-3">
            <h2 className="font-extrabold text-navy text-xs uppercase tracking-wider">Histórico de Assinatura & Faturamento</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-1 border-b">
                <span className="text-muted-foreground">Contrato ESOL:</span>
                <span className={`font-bold ${p.contrato_cliente_status === "assinado" ? "text-emerald-600" : "text-amber-600"}`}>
                  {p.contrato_cliente_status === "assinado" ? "Assinado" : "Pendente"}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b">
                <span className="text-muted-foreground">Comprovante Financeiro:</span>
                <span className={`font-bold ${p.comprovante_url ? "text-emerald-600" : "text-amber-600"}`}>
                  {p.comprovante_url ? "Confirmado" : "Pendente"}
                </span>
              </div>
              {p.comprovante_url && (
                <Button asChild variant="outline" size="sm" className="w-full text-[10px] h-7">
                  <a href={p.comprovante_url} target="_blank" rel="noopener noreferrer">
                    Ver Comprovante Anexo
                  </a>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
