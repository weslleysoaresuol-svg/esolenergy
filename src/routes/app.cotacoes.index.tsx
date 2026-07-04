import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Eye, Zap, Sun, Sparkles } from "lucide-react";
import { BRL, calcularProposta } from "@/lib/proposta-calc";
import { toast } from "sonner";
import { KITS_FALLBACK } from "@/lib/kits-fallback";
import { CidadeEstadoInput } from "@/components/CidadeEstadoInput";

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

const recomendarKit = (kwh: number, kitsList: any[]) => {
  // Filtrar apenas kits válidos e ativos
  const validKits = kitsList.filter(k => k.ativo && k.consumo_kwh_min && k.consumo_kwh_max);
  if (validKits.length === 0) return null;
  
  // 1. Tentar encontrar kits onde o consumo caia dentro da faixa ideal
  const matches = validKits.filter(k => kwh >= k.consumo_kwh_min && kwh <= k.consumo_kwh_max);
  if (matches.length > 0) {
    // Escolher o de menor preço de tabela B2B
    return matches.sort((a, b) => Number(a.preco) - Number(b.preco))[0];
  }
  
  // 2. Se não houver faixa exata, escolher o kit com a menor distância absoluta à faixa
  return validKits.sort((a, b) => {
    const distA = Math.min(Math.abs(kwh - a.consumo_kwh_min), Math.abs(kwh - a.consumo_kwh_max));
    const distB = Math.min(Math.abs(kwh - b.consumo_kwh_min), Math.abs(kwh - b.consumo_kwh_max));
    return distA - distB;
  })[0];
};

function CotacoesList() {
  const { user, role, profile } = useCurrentUser();
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
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telefone: "", cep: "", endereco: "", cidade: "", estado: "SP" });
  const [params, setParams] = useState<any>(null);

  // Estados locais para edição de campos do cliente selecionado no ato da cotação
  const [editCep, setEditCep] = useState("");
  const [editEndereco, setEditEndereco] = useState("");

  const handleNewClientCepChange = async (cepValue: string) => {
    setNovoCliente(prev => ({ ...prev, cep: cepValue }));
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNovoCliente(prev => ({
            ...prev,
            cidade: data.localidade || prev.cidade || "",
            estado: data.uf || prev.estado || "",
            endereco: data.logradouro ? `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ""}` : prev.endereco || ""
          }));
          toast.success("CEP localizado!");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleEditCepChange = async (cepValue: string) => {
    setEditCep(cepValue);
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEditEndereco(data.logradouro ? `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ""}` : "");
          toast.success("CEP localizado!");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  // Estados para Recomendação Inteligente de Kit
  const [usarRecomendacao, setUsarRecomendacao] = useState(false);
  const [valFatura, setValFatura] = useState("");
  const [valConsumo, setValConsumo] = useState("");
  const [kitRecomendado, setKitRecomendado] = useState<any | null>(null);

  // Resetar recomendação ao fechar/abrir a janela
  useEffect(() => {
    if (!openNew) {
      setUsarRecomendacao(false);
      setValFatura("");
      setValConsumo("");
      setKitRecomendado(null);
    }
  }, [openNew]);

  // Preenche dados quando seleciona cliente existente
  useEffect(() => {
    if (clienteTipo === "existente" && novo.cliente_id) {
      const c = clientes.find((x) => x.id === novo.cliente_id);
      if (c) {
        setEditCep(c.cep || "");
        setEditEndereco(c.endereco || "");
        
        // Se tiver fatura/consumo, ativa recomendação inteligente automaticamente!
        if (c.valor_fatura || c.consumo_kwh) {
          setUsarRecomendacao(true);
          const fVal = c.valor_fatura ? String(c.valor_fatura) : "";
          const cVal = c.consumo_kwh ? String(c.consumo_kwh) : "";
          setValFatura(fVal);
          setValConsumo(cVal);
          
          const kwhNum = Number(cVal) || (fVal ? Math.round(Number(fVal) / 0.95) : 500);
          updateRecommendation(kwhNum);
        }
      }
    } else {
      setEditCep("");
      setEditEndereco("");
    }
  }, [novo.cliente_id, clienteTipo, clientes]);

  const updateRecommendation = (kwh: number) => {
    const recommended = recomendarKit(kwh, kits);
    setKitRecomendado(recommended);
    if (recommended) {
      setNovo((prev) => ({ ...prev, kit_id: recommended.id }));
    }
  };

  const handleFaturaChange = (val: string) => {
    setValFatura(val);
    if (!val) {
      setValConsumo("");
      setKitRecomendado(null);
      return;
    }
    const calculatedKwh = Math.round(Number(val) / 0.95);
    setValConsumo(calculatedKwh.toString());
    updateRecommendation(calculatedKwh);
  };

  const handleConsumoChange = (val: string) => {
    setValConsumo(val);
    if (!val) {
      setValFatura("");
      setKitRecomendado(null);
      return;
    }
    const calculatedBill = (Number(val) * 0.95).toFixed(2);
    setValFatura(calculatedBill);
    updateRecommendation(Number(val));
  };

  const load = async () => {
    setLoading(true);
    const [cs, cls, ks, pr] = await Promise.all([
      (supabase.from as any)("cotacoes")
        .select("*, cliente:cliente_id(*), kit:kit_id(*), parceiro:parceiro_id(nome, id, comissao_percent)")
        .order("created_at", { ascending: false }),
      // Clientes: ordenados pelo mais recente (created_at DESC) — o último cadastrado fica no topo
      supabase.from("clientes").select("id, nome, telefone, cidade, estado, consumo_kwh, valor_fatura, cep, endereco").order("created_at", { ascending: false }),
      supabase.from("kits_produtos" as any).select("*").order("potencia_kwp"),
      (supabase.rpc as any)("get_parametros_publicos")
    ]);
    setCotacoes(cs.data || []);
    setClientes(cls.data || []);
    if (pr.data) setParams(pr.data);
    
    // Kits: mantém ordem por potencia_kwp, mas fallback j\u00e1 vem ordenado por potencia
    let mergedKits = (ks.data || []).sort((a: any, b: any) => Number(a.potencia_kwp) - Number(b.potencia_kwp));
    if (mergedKits.length < 20) {
      const codes = new Set(mergedKits.map((k: any) => k.codigo));
      const missing = KITS_FALLBACK
        .filter((k: any) => !codes.has(k.id) && !codes.has(k.codigo))
        .sort((a: any, b: any) => a.potencia_kwp - b.potencia_kwp);
      mergedKits = [...mergedKits, ...(missing as any[])];
    }
    setKits(mergedKits);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const getCalculoRow = (c: any) => {
    if (c.custo_equipamentos !== null && c.custo_equipamentos !== undefined) {
      return c;
    }
    if (!params) return null;

    const client = c.cliente;
    const clientConsumo = client ? Number((client as any).consumo_kwh || (client.valor_fatura ? Math.round(Number(client.valor_fatura) / (params.tarifa_kwh_default || 0.95)) : 500)) : 500;
    const clientEstado = client?.estado || "SP";
    
    const kwp = Number(c.kit?.potencia_kwp || c.kit_snapshot?.potencia_kwp || c.kwp_sistema || 0) * (c.quantidade || 1);
    const modulos = Number(c.kit?.quantidade_modulos || c.kit_snapshot?.quantidade_modulos || c.qtd_modulos || 0) * (c.quantidade || 1);

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
  };

  const renderEspelhoDialogContent = (c: any) => {
    const calc = getCalculoRow(c);
    if (!calc) return <div className="p-4 text-center text-xs text-muted-foreground">Carregando parâmetros comerciais...</div>;
    
    return role === "admin" ? (
      <div className="space-y-4 pt-2 text-left">
        {(calc.fornecedor || c.fornecedor) && (
          <div className="bg-navy/5 rounded-xl p-3 border text-xs flex justify-between items-center">
            <span className="font-semibold text-slate-500 uppercase text-[9px]">Distribuidor / Fornecedor</span>
            <strong className="text-navy text-sm font-black uppercase">{calc.fornecedor || c.fornecedor}</strong>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Diretos (Compra B2B)</span>
            <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
              <CostRow label="Equipamentos (Kit)" value={calc.custo_equipamentos} />
              <CostRow label="Instalação / Integração" value={calc.custo_instalacao} />
              <CostRow label="Frete" value={calc.custo_frete} />
              <CostRow label="Impostos de Compra" value={calc.custo_impostos_compra} />
              <CostRow label="Comissão do Parceiro" value={calc.custo_comissao} />
              <CostRow label="Total Custos Diretos" value={c.preco_total - (calc.margem_bruta || 0)} bold />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Operacionais e Margens (ESOL)</span>
            <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
              <CostRow label="Tributação ESOL" value={calc.custo_tributacao_empresa} />
              <CostRow label="CAC / Marketing" value={calc.custo_marketing} />
              <CostRow label="Engenharia / Fixo" value={calc.custo_engenharia_fixo} />
              <CostRow label="Overhead / Adm" value={calc.custo_overhead} />
              <CostRow label="Provisão de Garantia" value={calc.custo_garantia} />
              <CostRow label="Despesas Op. Totais" value={calc.custos_operacionais_totais} bold />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center border">
            <span className="font-semibold text-slate-700 text-xs">Margem Bruta</span>
            <span className="font-bold text-slate-700 text-sm">{BRL(calc.margem_bruta || 0)} {c.preco_total > 0 && `(${( ((calc.margem_bruta || 0) / c.preco_total) * 100 ).toFixed(1)}%)`}</span>
          </div>
          
          <div className={`rounded-xl p-3.5 flex justify-between items-center border ${calc.lucro_liquido_real >= 0 ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
            <span className="font-bold text-xs uppercase tracking-wide">★ Lucro Líquido Real</span>
            <span className="font-black text-sm">{BRL(calc.lucro_liquido_real || 0)} {calc.lucro_liquido_pct !== null && calc.lucro_liquido_pct !== undefined && calc.lucro_liquido_pct !== 0 ? `(${(calc.lucro_liquido_pct * 100).toFixed(1)}%)` : c.preco_total > 0 ? `(${( ((calc.lucro_liquido_real || 0) / c.preco_total) * 100 ).toFixed(1)}%)` : ""}</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4 pt-2 text-left">
        <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-3">
          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">Especificações do Kit</span><span className="font-extrabold text-navy">{c.kit?.nome || c.kit_snapshot?.nome || "Kit Solar"}</span></div>
          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Valor de Venda</span><span className="font-black text-navy">{BRL(c.preco_total)}</span></div>
          
          <div className="bg-sun/15 border border-sun/50 rounded-xl p-4 flex justify-between items-center text-navy-deep">
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">Sua Comissão Estimada</strong>
              <span className="text-[10px] text-navy/70">Taxa individual: {c.parceiro?.comissao_percent !== null && c.parceiro?.comissao_percent !== undefined ? `${c.parceiro.comissao_percent}%` : c.preco_total > 0 ? `${(((calc.custo_comissao || 0) / c.preco_total) * 100).toFixed(0)}%` : "5%"}</span>
            </div>
            <strong className="text-lg font-black text-navy">{BRL(calc.custo_comissao || (c.preco_total * 0.05))}</strong>
          </div>
        </div>
      </div>
    );
  };

  const getPrecoVendaKit = (kit: any) => {
    if (!params) return Number(kit.preco);
    const comissao_pct = profile?.comissao_percent !== null && profile?.comissao_percent !== undefined
      ? Number(profile.comissao_percent) / 100
      : params.custo_comissao_pct;
    const impostos_compra_pct = params.custo_impostos_compra_pct ?? params.custo_impostos_pct ?? 0.03;
    const divisor = 1 - (params.custo_instalacao_pct + params.custo_frete_pct + impostos_compra_pct + comissao_pct + params.margem_alvo_pct);
    return Number(kit.preco) / (divisor > 0.1 ? divisor : params.custo_equipamentos_pct);
  };

  const kitSel = kits.find((k) => k.id === novo.kit_id);
  const total = kitSel ? getPrecoVendaKit(kitSel) * novo.quantidade : 0;

  const qCalculo = useMemo(() => {
    if (!kitSel || !params) return null;
    
    const targetClienteId = novo.cliente_id;
    const targetCliente = clientes.find((c) => c.id === targetClienteId) || novoCliente;
    const clientConsumo = targetCliente ? Number((targetCliente as any).consumo_kwh || (targetCliente.valor_fatura ? Math.round(Number(targetCliente.valor_fatura) / (params.tarifa_kwh_default || 0.95)) : 500)) : 500;
    const clientEstado = targetCliente?.estado || "SP";

    const kwp = Number(kitSel.potencia_kwp) * novo.quantidade;
    const modulos = Number(kitSel.quantidade_modulos) * novo.quantidade;

    return calcularProposta({
      consumo_kwh: clientConsumo,
      tarifa_kwh: params.tarifa_kwh_default || 0.95,
      estado: clientEstado,
      tipo: "residencial",
      custo_equipamentos_override: Number(kitSel.preco) * novo.quantidade,
      kwp_override: kwp,
      qtd_modulos_override: modulos,
      comissao_percent_override: profile?.comissao_percent !== null && profile?.comissao_percent !== undefined ? Number(profile.comissao_percent) : undefined,
    }, params);
  }, [kitSel, params, novo, clientes, novoCliente, total, profile]);

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

        if (!valFatura.trim() && !valConsumo.trim()) {
          toast.error("Preencha ao menos uma informação de consumo: Valor da Fatura ou Consumo em kWh.");
          setSaving(false);
          return;
        }

        const { data: newCl, error: errCl } = await supabase.from("clientes").insert({
          nome: novoCliente.nome.trim(),
          email: novoCliente.email.trim() || null,
          telefone: novoCliente.telefone.trim(),
          cep: novoCliente.cep.trim() || null,
          endereco: novoCliente.endereco.trim() || null,
          cidade: novoCliente.cidade.trim(),
          estado: novoCliente.estado.trim().toUpperCase(),
          valor_fatura: valFatura ? Number(valFatura) : null,
          consumo_kwh: valConsumo ? Number(valConsumo) : null,
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
      } else {
        // Se for cliente existente, atualiza as informações no cadastro dele
        await supabase.from("clientes").update({
          cep: editCep.trim() || null,
          endereco: editEndereco.trim() || null,
          valor_fatura: valFatura ? Number(valFatura) : null,
          consumo_kwh: valConsumo ? Number(valConsumo) : null,
        }).eq("id", targetClienteId);
      }

      let data: any = null;
      let error: any = null;

      const payload = {
        parceiro_id: user.id,
        cliente_id: targetClienteId,
        kit_id: kitIdParaDB,
        kit_snapshot: kitSel,
        quantidade: novo.quantidade,
        preco_unit: Number(kitSel!.preco),
        preco_total: total,
        observacoes: novo.observacoes || null,
        status: "enviada",
        
        // Novos campos do espelho financeiro
        fornecedor: kitSel.fornecedor || "Aldo Solar",
        custo_equipamentos: qCalculo?.custo_equipamentos || null,
        custo_instalacao: qCalculo?.custo_instalacao || null,
        custo_frete: qCalculo?.custo_frete || null,
        custo_impostos_compra: qCalculo?.custo_impostos_compra || null,
        custo_comissao: qCalculo?.custo_comissao || null,
        custo_tributacao_empresa: qCalculo?.custo_tributacao_empresa || null,
        custo_marketing: qCalculo?.custo_marketing || null,
        custo_engenharia_fixo: qCalculo?.custo_engenharia_fixo || null,
        custo_overhead: qCalculo?.custo_overhead || null,
        custo_garantia: qCalculo?.custo_garantia || null,
        custos_operacionais_totais: qCalculo?.custos_operacionais_totais || null,
        lucro_liquido_real: qCalculo?.lucro_liquido_real || null,
        lucro_liquido_pct: qCalculo?.lucro_liquido_pct || null,
        margem_bruta: qCalculo?.margem_bruta || null,

        // Indicadores do motor solar
        economia_ajustada_mensal: qCalculo?.economia_ajustada_mensal || null,
        economia_ajustada_anual: qCalculo?.economia_ajustada_anual || null,
        economia_ajustada_25_anos: qCalculo?.economia_ajustada_25_anos || null,
        payback_ajustado_meses: qCalculo?.payback_ajustado_meses || null,
        tir_anual_pct: qCalculo?.tir_anual_pct || null,
        vpl_brl: qCalculo?.vpl_brl || null,
        custo_disponibilidade_mensal: qCalculo?.custo_disponibilidade_mensal || null,
        ajuste_fio_b_mensal: qCalculo?.ajuste_fio_b_mensal || null,
      };

      const resInsert = await (supabase.from as any)("cotacoes").insert(payload).select().single();
      data = resInsert.data;
      error = resInsert.error;

      if (error && (error.code === "42703" || error.message?.includes("column"))) {
        console.warn("Tabela 'cotacoes' não possui os novos campos financeiros. Salvando no formato reduzido...");
        const cleanPayload = { ...payload };
        delete (cleanPayload as any).economia_ajustada_mensal;
        delete (cleanPayload as any).economia_ajustada_anual;
        delete (cleanPayload as any).economia_ajustada_25_anos;
        delete (cleanPayload as any).payback_ajustado_meses;
        delete (cleanPayload as any).tir_anual_pct;
        delete (cleanPayload as any).vpl_brl;
        delete (cleanPayload as any).custo_disponibilidade_mensal;
        delete (cleanPayload as any).ajuste_fio_b_mensal;

        const resRetry = await (supabase.from as any)("cotacoes").insert(cleanPayload).select().single();
        data = resRetry.data;
        error = resRetry.error;
      }

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
      setNovoCliente({ nome: "", email: "", telefone: "", cep: "", endereco: "", cidade: "", estado: "SP" });
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

      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-md">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="text-muted-foreground">Nenhuma cotação encontrada.</p>
        </Card>
      ) : (
        <Card className="border-0 shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="suns-table-header text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Kit Solar</th>
                <th className="p-3">Qtd</th>
                 <th className="p-3">Valor Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Espelho</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = STATUS_LABEL[c.status] || STATUS_LABEL.rascunho;
                return (
                  <tr key={c.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-semibold text-navy">
                      <Link to="/app/cotacoes/$id" params={{ id: c.id }} className="hover:underline">
                        {c.cliente?.nome || "Lead Sem Nome"}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {c.kit?.nome || c.kit_snapshot?.nome || "Kit personalizado"}
                    </td>
                    <td className="p-3 text-slate-500 font-bold">{c.quantidade}</td>
                    <td className="p-3 font-semibold text-navy">{BRL(Number(c.preco_total))}</td>
                     <td className="p-3">
                      <Badge className={st.color}>{st.label}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg">
                            <FileText className="w-4 h-4" />
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

                          {renderEspelhoDialogContent(c)}
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground text-right sm:text-left">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

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
                <div className="space-y-3">
                  <Select value={novo.cliente_id} onValueChange={(v) => setNovo({ ...novo, cliente_id: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  {novo.cliente_id && (
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">CEP (Opcional)</Label>
                        <Input placeholder="Ex: 01001-000" value={editCep} onChange={(e) => handleEditCepChange(e.target.value)} className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Endereço (Opcional)</Label>
                        <Input placeholder="Ex: Av. Paulista, 1000" value={editEndereco} onChange={(e) => setEditEndereco(e.target.value)} className="h-9 text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Cliente *</Label>
                    <Input placeholder="Ex: João da Silva" value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">E-mail (Opcional)</Label>
                    <Input type="email" placeholder="Ex: joao@email.com" value={novoCliente.email} onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Celular / WhatsApp *</Label>
                    <Input placeholder="Ex: (11) 99999-9999" value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">CEP (Opcional)</Label>
                    <Input placeholder="Ex: 01001-000" value={novoCliente.cep} onChange={(e) => handleNewClientCepChange(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Endereço (Opcional)</Label>
                    <Input placeholder="Ex: Av. Paulista, 1000 - Ap 42" value={novoCliente.endereco} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Cidade</Label>
                    <CidadeEstadoInput
                      cidade={novoCliente.cidade}
                      estado={novoCliente.estado}
                      onChange={(cit, uf) => setNovoCliente({ ...novoCliente, cidade: cit, estado: uf })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">UF</Label>
                    <Input value={novoCliente.estado} readOnly className="h-9 text-xs bg-slate-100 font-bold text-navy" />
                  </div>
                </div>
              )}
            </div>

            {/* Recomendação Inteligente de Kit */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-navy uppercase flex items-center gap-1.5 cursor-pointer" onClick={() => {
                  setUsarRecomendacao(!usarRecomendacao);
                  if (usarRecomendacao) {
                    setValFatura("");
                    setValConsumo("");
                    setKitRecomendado(null);
                  }
                }}>
                  <Sparkles className="w-4 h-4 text-sun-deep" /> Recomendação Inteligente de Kit
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsarRecomendacao(!usarRecomendacao);
                      if (usarRecomendacao) {
                        setValFatura("");
                        setValConsumo("");
                        setKitRecomendado(null);
                      }
                    }}
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border transition-all ${usarRecomendacao ? "bg-emerald-600 border-emerald-700 text-white shadow-sm" : "bg-white text-slate-500 hover:text-navy"}`}
                  >
                    {usarRecomendacao ? "Ativa ⚡" : "Desativada"}
                  </button>
                </div>
              </div>

              {usarRecomendacao && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Valor da Fatura (R$)</Label>
                      <Input 
                        type="number" 
                        placeholder="Ex: 450" 
                        value={valFatura} 
                        onChange={(e) => handleFaturaChange(e.target.value)} 
                        className="h-9 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Consumo Mensal (kWh)</Label>
                      <Input 
                        type="number" 
                        placeholder="Ex: 500" 
                        value={valConsumo} 
                        onChange={(e) => handleConsumoChange(e.target.value)} 
                        className="h-9 text-xs" 
                      />
                    </div>
                  </div>
                  {kitRecomendado && (
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Gerador Recomendado Auto:</strong>
                        <span className="font-semibold text-navy">{kitRecomendado.nome}</span>
                        <span className="block mt-0.5 text-emerald-700 font-medium">Preço de Venda: {BRL(getPrecoVendaKit(kitRecomendado))} | Consumo Ideal: {kitRecomendado.consumo_kwh_min} a {kitRecomendado.consumo_kwh_max} kWh</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-xs font-bold text-slate-700">Kit solar (Selecione ou confirme a recomendação)</Label>
              <Select value={novo.kit_id} onValueChange={(v) => setNovo({ ...novo, kit_id: v })}>
                <SelectTrigger className="w-full">
                  <span className="truncate block text-left">
                    {kitSel ? `${kitSel.nome} — ${BRL(getPrecoVendaKit(kitSel))}` : "Escolha um kit solar"}
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-[280px] overflow-y-auto w-full">
                  {kits.map((k) => (
                    <SelectItem key={k.id} value={k.id} className="text-xs">
                      <span className="block truncate max-w-[380px]">{k.nome} — {BRL(getPrecoVendaKit(k))}</span>
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

            {/* Espelho de visualização de custos no ato da geração */}
            {role === "admin" && kitSel && qCalculo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-2 text-navy">
                <strong className="block text-[10px] uppercase font-bold text-amber-800 tracking-wider">Espelho Detalhado (Exclusivo Admin)</strong>
                <div className="text-[10px] text-muted-foreground">Fornecedor: <strong>{kitSel.fornecedor || "Aldo Solar"}</strong></div>
                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                  <div>Equipamentos: <strong>{BRL(qCalculo.custo_equipamentos)}</strong></div>
                  <div>Instalação: <strong>{BRL(qCalculo.custo_instalacao)}</strong></div>
                  <div>Comissão: <strong>{BRL(qCalculo.custo_comissao)}</strong></div>
                  <div>Impostos Compra: <strong>{BRL(qCalculo.custo_impostos_compra)}</strong></div>
                  <div>Tributação ESOL: <strong>{BRL(qCalculo.custo_tributacao_empresa)}</strong></div>
                  <div>Despesas Op: <strong>{BRL(qCalculo.custos_operacionais_totais)}</strong></div>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-emerald-800 bg-white/60 p-2 rounded">
                  <span>LUCRO LÍQUIDO REAL</span>
                  <span>{BRL(qCalculo.lucro_liquido_real)} ({(qCalculo.lucro_liquido_pct * 100).toFixed(1)}%)</span>
                </div>
              </div>
            )}

            {role !== "admin" && kitSel && qCalculo && (
              <div className="bg-sun/10 border border-sun/40 rounded-xl p-3 text-xs flex justify-between items-center text-navy">
                <div>
                  <strong className="block text-[10px] uppercase font-bold text-navy tracking-wider">Sua Comissão Estimada</strong>
                  <span className="text-[9px] text-navy/70">Taxa individual: {profile?.comissao_percent !== null && profile?.comissao_percent !== undefined ? `${profile.comissao_percent}%` : "5%"}</span>
                </div>
                <strong className="text-sm font-black text-navy">{BRL(qCalculo.custo_comissao)}</strong>
              </div>
            )}

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

const CostRow = ({ label, value, bold }: { label: string; value: number | null | undefined; bold?: boolean }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-slate-200 last:border-b-0 ${bold ? "font-bold text-navy pt-2 text-xs" : "text-slate-600 text-[11px]"}`}>
    <span>{label}</span>
    <span>{typeof value === "number" && !isNaN(value) ? BRL(value) : "—"}</span>
  </div>
);
