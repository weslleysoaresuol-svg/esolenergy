import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Users, Target, DollarSign, ArrowRight, Globe, Inbox,
  AlertTriangle, Clock, CheckCircle2, MessageCircle, Percent, Zap, BarChart3,
  FileSpreadsheet, Send, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { calcularProposta, BRL } from "@/lib/proposta-calc";
import { KITS_FALLBACK } from "@/lib/kits-fallback";

export const Route = createFileRoute("/app/")(
  { component: DashboardOrList }
);

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo lead", contato: "Em contato", visita_agendada: "Visita agendada",
  proposta_enviada: "Proposta enviada", negociacao: "Negociação",
  contrato_assinado: "Contrato assinado", instalacao: "Em instalação",
  concluido: "Concluído", perdido: "Perdido",
};

const STATUS_COLOR: Record<string, string> = {
  novo: "bg-blue-100 text-blue-800", contato: "bg-cyan-100 text-cyan-800",
  visita_agendada: "bg-purple-100 text-purple-800", proposta_enviada: "bg-amber-100 text-amber-800",
  negociacao: "bg-orange-100 text-orange-800", contrato_assinado: "bg-emerald-100 text-emerald-800",
  instalacao: "bg-teal-100 text-teal-800", concluido: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
};

const KANBAN_COLS = [
  { statuses: ["novo"], label: "Novos", color: "bg-blue-500" },
  { statuses: ["contato", "visita_agendada"], label: "Em contato", color: "bg-purple-500" },
  { statuses: ["proposta_enviada", "negociacao"], label: "Proposta / Negoc.", color: "bg-amber-500" },
  { statuses: ["contrato_assinado", "instalacao"], label: "Contrato / Instal.", color: "bg-teal-500" },
  { statuses: ["concluido"], label: "Concluídos", color: "bg-emerald-500" },
];

function DashboardOrList() {
  const { role } = useCurrentUser();
  return role === "admin" ? <AdminDashboard /> : <CorretorClientes />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"crm" | "bi">("crm");
  const [clientes, setClientes] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [siteLeads, setSiteLeads] = useState<any[]>([]);
  const [params, setParams] = useState<any>(null);
  const [activeKanbanCol, setActiveKanbanCol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Cadastro Expresso de Leads na Home
  const [fastName, setFastName] = useState("");
  const [fastPhone, setFastPhone] = useState("");
  const [fastBill, setFastBill] = useState("");
  const [fastKwh, setFastKwh] = useState("");
  const [fastEndereco, setFastEndereco] = useState("");
  const [fastImovelTipo, setFastImovelTipo] = useState<"residencial" | "comercial" | "industrial" | "rural">("residencial");
  const [fastInputMode, setFastInputMode] = useState<"fatura" | "kwh">("fatura");
  const [fastSaving, setFastSaving] = useState(false);

  // Cidade e Estado (Autocomplete do IBGE)
  const [fastCidade, setFastCidade] = useState("");
  const [fastEstado, setFastEstado] = useState("");
  const [ibgeMunicipios, setIbgeMunicipios] = useState<{ nome: string; uf: string }[]>([]);
  const [showSugestions, setShowSugestions] = useState(false);

  useEffect(() => {
    // Tenta carregar municípios do sessionStorage ou busca do IBGE
    const cached = typeof window !== "undefined" ? sessionStorage.getItem("ibge_municipios") : null;
    if (cached) {
      try { setIbgeMunicipios(JSON.parse(cached)); } catch(e) {}
    } else {
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const list = data.map((m: any) => ({
              nome: m.nome,
              uf: m.microrregiao?.mesorregiao?.UF?.sigla || m.regiao_imediata?.regiao_intermediaria?.UF?.sigla || ""
            })).filter(x => x.uf);
            setIbgeMunicipios(list);
            try { sessionStorage.setItem("ibge_municipios", JSON.stringify(list)); } catch(e) {}
          }
        })
        .catch(err => console.warn("Erro ao carregar lista de municipios IBGE", err));
    }
  }, []);

  const sugestoesCidades = useMemo(() => {
    if (!fastCidade || fastCidade.length < 2) return [];
    const query = fastCidade.toLowerCase().trim();
    return ibgeMunicipios
      .filter((m) => m.nome.toLowerCase().includes(query))
      .slice(0, 5);
  }, [fastCidade, ibgeMunicipios]);

  const handleFastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fastName || !fastPhone) {
      toast.error("Nome e Telefone/WhatsApp são obrigatórios!");
      return;
    }
    if (!fastCidade || !fastEstado) {
      toast.error("Município e Estado (UF) são necessários para o dimensionamento!");
      return;
    }
    
    setFastSaving(true);
    try {
      // 1. Carrega parâmetros comerciais do banco (ou fallback)
      let paramsComerciais = {
        hsp_norte: 4.5, hsp_nordeste: 5.0, hsp_centro_oeste: 4.8, hsp_sudeste: 4.5, hsp_sul: 4.0,
        preco_wp_residencial_pequeno: 2.8, preco_wp_residencial_grande: 2.5,
        preco_wp_comercial_pequeno: 2.2, preco_wp_comercial_grande: 2.0, preco_wp_industrial: 1.8,
        tarifa_kwh_default: 0.95, perdas_sistema: 0.15, inflacao_energetica: 0.08, vida_util_anos: 25,
        potencia_modulo_w: 550, area_por_modulo_m2: 2.5,
        custo_equipamentos_pct: 0.5, custo_instalacao_pct: 0.15, custo_frete_pct: 0.05, custo_impostos_pct: 0.1, custo_comissao_pct: 0.05, margem_alvo_pct: 0.15,
        validade_proposta_dias: 15,
        capacidade_instaladores_kwp_mes: 120
      };
      
      try {
        const { data: pr } = await (supabase.rpc as any)("get_parametros_publicos");
        if (pr) paramsComerciais = { ...paramsComerciais, ...pr };
      } catch (errRpc) {}

      const tarifaKwh = paramsComerciais.tarifa_kwh_default || 0.95;
      
      let billVal = 0;
      let consumoEstimado = 0;
      if (fastInputMode === "fatura") {
        billVal = Number(fastBill) || 0;
        consumoEstimado = billVal > 0 ? Math.round(billVal / tarifaKwh) : 500;
      } else {
        consumoEstimado = Number(fastKwh) || 500;
        billVal = Math.round(consumoEstimado * tarifaKwh);
      }
      
      // 2. Cadastra o cliente expressamente
      const { data: client, error: errClient } = await supabase.from("clientes").insert({
        nome: fastName.trim(),
        telefone: fastPhone.trim(),
        valor_fatura: billVal > 0 ? billVal : null,
        consumo_kwh: consumoEstimado,
        imovel_tipo: fastImovelTipo,
        status: "novo",
        origem: "manual",
        cidade: fastCidade.trim(),
        estado: fastEstado.trim().toUpperCase(),
        endereco: fastEndereco.trim() || null,
        corretor_id: user.id
      }).select().single();

      if (errClient) {
        toast.error("Erro ao salvar lead: " + errClient.message);
        setFastSaving(false);
        return;
      }
      
      // Roda o cálculo do dimensionamento comercial automático usando o estado real do lead e tipo de imóvel
      const calculo = calcularProposta({
        consumo_kwh: consumoEstimado,
        tarifa_kwh: tarifaKwh,
        estado: fastEstado.trim().toUpperCase(),
        tipo: fastImovelTipo
      }, paramsComerciais);

      // Carrega Kits fotovoltaicos do Supabase (ou fallback) e mescla para ter todos os 50
      let loadedKits = [...KITS_FALLBACK];
      try {
        const { data: dbKits } = await supabase.from("kits_produtos" as any).select("*");
        if (dbKits && dbKits.length > 0) {
          let merged = [...dbKits];
          if (dbKits.length < 20) {
            const codes = new Set(dbKits.map((k: any) => k.codigo));
            const missing = KITS_FALLBACK.filter((k) => !codes.has(k.id) && !codes.has(k.codigo));
            merged = [...merged, ...missing];
          }
          loadedKits = merged as any;
        }
      } catch(e) {}

      // Encontra o kit adequado mais econômico para o cliente
      const adequados = loadedKits.filter((k) => k.potencia_kwp >= calculo.kwp_sistema);
      const kitRecomendado = adequados.length > 0 
        ? adequados.sort((a, b) => a.preco - b.preco)[0]
        : [...loadedKits].sort((a, b) => b.potencia_kwp - a.potencia_kwp)[0];

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (paramsComerciais.validade_proposta_dias || 15));

      // 3. Cria a Proposta
      const precoFinal = kitRecomendado ? Number(kitRecomendado.preco) : calculo.preco_total;
      const kwpFinal = kitRecomendado ? Number(kitRecomendado.potencia_kwp) : calculo.kwp_sistema;
      const qtdModulosFinal = kitRecomendado ? Number(kitRecomendado.quantidade_modulos) : calculo.qtd_modulos;
      const { data: prop, error: errProp } = await supabase.from("propostas").insert({
        titulo: `Proposta Solar ${fastImovelTipo === "residencial" ? "Residencial" : fastImovelTipo === "comercial" ? "Comercial" : fastImovelTipo === "industrial" ? "Industrial" : "Rural"} - ${client.nome}`,
        parceiro_id: user.id,
        kwp_sistema: kwpFinal,
        preco_total: precoFinal,
        codigo_publico: crypto.randomUUID(),
        expires_at: expDate.toISOString(),
        status: "enviada",
        kit_id: kitRecomendado?.id || null,
        tipo_instalacao: fastImovelTipo,
        consumo_kwh: consumoEstimado,
        tarifa_kwh: tarifaKwh,
        estado: fastEstado.trim().toUpperCase(),
        cidade: fastCidade.trim(),
        regiao: calculo.regiao,
        hsp: calculo.hsp,
        qtd_modulos: qtdModulosFinal,
        potencia_modulo_w: calculo.potencia_modulo_w,
        qtd_inversores: calculo.qtd_inversores,
        potencia_inversor_kw: calculo.potencia_inversor_kw,
        area_necessaria_m2: calculo.area_necessaria_m2,
        geracao_mensal_kwh: calculo.geracao_mensal_kwh,
        economia_mensal: calculo.economia_mensal,
        economia_anual: calculo.economia_anual,
        economia_25_anos: calculo.economia_25_anos,
        payback_meses: calculo.payback_meses,
        co2_evitado_ton: calculo.co2_evitado_ton,
        arvores_equivalentes: calculo.arvores_equivalentes,
        preco_por_wp: +(precoFinal / (kwpFinal * 1000)).toFixed(2),
        validade_dias: paramsComerciais.validade_proposta_dias || 15,
        condicoes_pagamento: "À vista 5% desconto · Financiamento via parceiros bancários",
        observacoes: "Criada instantaneamente pelo painel de controle expresso"
      } as any).select().single();

      if (errProp) {
        console.error("Erro ao criar proposta expressa na home:", errProp);
        navigate({ to: "/app/cliente/$id", params: { id: client.id } });
      } else {
        // Vincula o cliente à proposta
        await supabase.from("proposta_clientes").insert({
          proposta_id: prop.id,
          cliente_id: client.id
        });
        
        toast.success("Lead e Proposta gerados instantaneamente!");
        setFastName("");
        setFastPhone("");
        setFastBill("");
        setFastKwh("");
        setFastEndereco("");
        setFastCidade("");
        setFastEstado("");
        
        // Redireciona diretamente para o envio
        navigate({ to: "/app/propostas/$id", params: { id: prop.id } });
      }
    } catch (err) {
      toast.error("Falha no processo de gravação rápida.");
    } finally {
      setFastSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        // Busca primária de clientes
        const { data: list, error: errList } = await supabase
          .from("clientes")
          .select("*, profiles:corretor_id(nome)")
          .order("updated_at", { ascending: false });

        let all: any[] = [];
        if (errList) {
          console.error("Erro ao carregar clientes com join no dashboard (tentando fallback):", errList);
          const { data: fallbackList, error: errFallback } = await supabase
            .from("clientes")
            .select("*")
            .order("updated_at", { ascending: false });
          
          if (!errFallback && fallbackList) {
            all = fallbackList;
          }
        } else if (list) {
          all = list;
        }

        // Busca de propostas
        const { data: ps, error: errPs } = await supabase
          .from("propostas")
          .select("*, parceiro:parceiro_id(nome)")
          .order("created_at");

        let finalPropostas: any[] = [];
        if (errPs) {
          console.error("Erro ao carregar propostas com join no dashboard (tentando fallback):", errPs);
          const { data: fallbackPs } = await supabase
            .from("propostas")
            .select("*")
            .order("created_at");
          finalPropostas = fallbackPs || [];
        } else {
          finalPropostas = ps || [];
        }

        // Busca de parâmetros
        let prData: any = null;
        try {
          const { data: pr } = await (supabase.rpc as any)("get_parametros_publicos");
          prData = pr;
        } catch (errRpc) {
          console.error("Erro na RPC get_parametros_publicos:", errRpc);
        }

        const leads = all.filter((c) => c.origem === "landing" && !c.corretor_id);
        
        setClientes(all);
        setSiteLeads(leads);
        setPropostas(finalPropostas);
        if (prData) setParams(prData);
      } catch (err) {
        console.error("Erro grave ao iniciar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const m = useMemo(() => {
    const totalProp = propostas.length;
    const enviadas = propostas.filter((p) => p.status !== "rascunho").length;
    const aceitas = propostas.filter((p) => p.status === "aceita");
    const aceitasNum = aceitas.length;
    const conversao = enviadas > 0 ? (aceitasNum / enviadas) * 100 : 0;
    const receitaProjetada = propostas.filter((p) => p.status !== "rascunho" && p.status !== "recusada").reduce((s, p) => s + Number(p.preco_total || 0), 0);
    const receitaRealizada = aceitas.reduce((s, p) => s + Number(p.preco_total || 0), 0);
    const ticketMedio = aceitasNum > 0 ? receitaRealizada / aceitasNum : 0;

    let custosTotais = 0;
    let margemTotal = 0;
    if (params) {
      for (const p of aceitas) {
        const c = Number(p.preco_total || 0);
        const custo = c * (params.custo_equipamentos_pct + params.custo_instalacao_pct + params.custo_frete_pct + params.custo_impostos_pct + params.custo_comissao_pct);
        custosTotais += custo;
        margemTotal += c - custo;
      }
    }
    const margemPct = receitaRealizada > 0 ? (margemTotal / receitaRealizada) * 100 : 0;

    // Por mês
    const porMes: Record<string, { mes: string; total: number; aceitas: number; receita: number }> = {};
    for (const p of propostas) {
      const d = new Date(p.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!porMes[k]) porMes[k] = { mes: k, total: 0, aceitas: 0, receita: 0 };
      porMes[k].total++;
      if (p.status === "aceita") { porMes[k].aceitas++; porMes[k].receita += Number(p.preco_total || 0); }
    }
    const mensal = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);

    // Por parceiro
    const porParceiro: Record<string, { nome: string; total: number; aceitas: number; receita: number }> = {};
    for (const p of propostas) {
      const nome = p.parceiro?.nome || "—";
      if (!porParceiro[nome]) porParceiro[nome] = { nome, total: 0, aceitas: 0, receita: 0 };
      porParceiro[nome].total++;
      if (p.status === "aceita") { porParceiro[nome].aceitas++; porParceiro[nome].receita += Number(p.preco_total || 0); }
    }
    const topParceiros = Object.values(porParceiro).sort((a, b) => b.receita - a.receita).slice(0, 6);

    // Motivos Perda
    const MOTIVO_PERDA_LABELS: Record<string, string> = {
      preco: "💰 Preço alto",
      concorrente: "🏢 Concorrente",
      prazo: "⏱️ Prazo",
      financiamento_reprovado: "🏦 Financiamento",
      desistiu: "🚫 Desistência",
      nao_atendeu: "📵 Não atendeu",
      outro: "📝 Outro",
    };
    const perdidos = clientes.filter((c) => c.status === "perdido" && c.motivo_perda);
    const porMotivo: Record<string, number> = {};
    for (const c of perdidos) porMotivo[c.motivo_perda] = (porMotivo[c.motivo_perda] || 0) + 1;
    const motivoData = Object.entries(porMotivo)
      .map(([k, v]) => ({ name: MOTIVO_PERDA_LABELS[k] || k, value: v }))
      .sort((a, b) => b.value - a.value);

    // Tempo médio de fechamento
    const comFechamento = clientes.filter((c) => ["concluido","contrato_assinado"].includes(c.status) && c.fechado_em && c.created_at);
    const tempoMedioFechamento = comFechamento.length > 0
      ? comFechamento.reduce((s, c) => {
          const dias = (new Date(c.fechado_em).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return s + dias;
        }, 0) / comFechamento.length
      : null;

    // Pipeline ponderado
    const emNegociacao = clientes.filter((c) => ["contato","visita_agendada","proposta_enviada","negociacao"].includes(c.status));
    const pipelineReceita = emNegociacao.reduce((s, c) => s + Number(c.valor_estimado || 0), 0);
    const receitaEsperada = pipelineReceita * 0.25; // 25% de taxa de fechamento estimada

    const fechados = clientes.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length;
    const valorFechados = clientes.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).reduce((s, c) => s + Number(c.valor_estimado || 0), 0);

    return {
      totalClientes: clientes.length,
      novos: clientes.filter((c) => c.status === "novo").length,
      negociacao: emNegociacao.length,
      fechados,
      valorFechados,
      totalProp,
      enviadas,
      aceitasNum,
      conversao,
      receitaProjetada,
      receitaRealizada,
      ticketMedio,
      margemTotal,
      margemPct,
      mensal,
      topParceiros,
      motivoData,
      tempoMedioFechamento,
      pipelineReceita,
      receitaEsperada
    };
  }, [clientes, propostas, params]);

  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const COLORS = ["#FFC107", "#001F5C", "#10b981", "#f43f5e", "#8b5cf6", "#0ea5e9"];

  // Filtro por coluna Kanban
  const displayedClientes = activeKanbanCol
    ? clientes.filter((c) => {
        const col = KANBAN_COLS.find((k) => k.label === activeKanbanCol);
        return col ? col.statuses.includes(c.status) : true;
      })
    : clientes;

  const corretoresCount = useMemo(() => {
    const unique = new Set(clientes.map((c) => c.corretor_id).filter(Boolean));
    return unique.size;
  }, [clientes]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Topo do Painel */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Painel de Controle</h1>
          <p className="text-muted-foreground">Visão geral gerencial — {corretoresCount} parceiros ativos na equipe</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/clientes" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-navy px-4 py-2.5 rounded-full font-semibold border text-sm transition">
            📂 Ver Clientes
          </Link>
          <Link to="/app/propostas" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-navy px-4 py-2.5 rounded-full font-semibold border text-sm transition">
            📝 Propostas
          </Link>
        </div>
      </div>

      {/* Navegação de Abas (CRM vs BI) */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("crm")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "crm" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <Target className="w-4 h-4" /> CRM & Operação
        </button>
        <button
          onClick={() => setActiveTab("bi")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "bi" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <BarChart3 className="w-4 h-4" /> Inteligência Comercial (BI)
        </button>
      </div>

      {/* ABA 1: CRM & OPERAÇÃO */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          {/* CARD DE CAPTURA & PROPOSTA INSTANTÂNEA */}
          <Card className="p-5 border-l-4 border-l-sun-deep bg-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-sun-deep animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-navy text-sm">Proposta</h3>
                  <p className="text-[11px] text-muted-foreground">Cadastre o cliente e gere a proposta para WhatsApp em uma única ação.</p>
                </div>
              </div>
              
              {/* Botões Segmented Control: Tipo de Imóvel */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
                {(["residencial", "comercial", "industrial", "rural"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFastImovelTipo(t)}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${fastImovelTipo === t ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                  >
                    {t === "residencial" ? "🏡 Residencial" : t === "comercial" ? "🏢 Comercial" : t === "industrial" ? "🏭 Industrial" : "🌾 Rural"}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleFastSubmit} className="space-y-4">
              {/* Linha 1: Contato e Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Nome do Cliente *</label>
                  <Input
                    required
                    placeholder="Ex: João da Silva"
                    value={fastName}
                    onChange={(e) => setFastName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">WhatsApp / Telefone *</label>
                  <Input
                    required
                    placeholder="Ex: (11) 99999-9999"
                    value={fastPhone}
                    onChange={(e) => setFastPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Endereço (Opcional)</label>
                  <Input
                    placeholder="Ex: Rua das Flores, 123"
                    value={fastEndereco}
                    onChange={(e) => setFastEndereco(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                
                {/* Campo Autocompletável de Município e Estado */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Município / Estado *</label>
                  <div className="flex gap-1">
                    <Input
                      required
                      placeholder="Buscar cidade..."
                      value={fastCidade}
                      onChange={(e) => {
                        setFastCidade(e.target.value);
                        setShowSugestions(true);
                      }}
                      onFocus={() => setShowSugestions(true)}
                      onBlur={() => setTimeout(() => setShowSugestions(false), 200)}
                      className="h-9 text-xs flex-1"
                    />
                    <Input
                      readOnly
                      placeholder="UF"
                      value={fastEstado}
                      className="h-9 text-xs w-11 bg-slate-50 text-center font-bold text-navy border"
                    />
                  </div>

                  {/* Dropdown de sugestões do IBGE */}
                  {showSugestions && sugestoesCidades.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y">
                      {sugestoesCidades.map((m, idx) => (
                        <button
                          key={`${m.nome}-${m.uf}-${idx}`}
                          type="button"
                          onClick={() => {
                            setFastCidade(m.nome);
                            setFastEstado(m.uf);
                            setShowSugestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-semibold flex justify-between items-center"
                        >
                          <span>{m.nome}</span>
                          <Badge variant="outline" className="text-[9px] border-slate-300 font-bold">{m.uf}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 2: Consumo Alternável e Envio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-2 border-t border-slate-100">
                {/* Seletor de Tipo de Consumo (Fatura vs kWh) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Preencher energia por</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setFastInputMode("fatura")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${fastInputMode === "fatura" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                    >
                      💰 Fatura (R$)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFastInputMode("kwh")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${fastInputMode === "kwh" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                    >
                      ⚡ Consumo (kWh)
                    </button>
                  </div>
                </div>

                {/* Input Dinâmico conforme Seleção */}
                <div className="space-y-1">
                  {fastInputMode === "fatura" ? (
                    <>
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Valor da Fatura Média (R$)</label>
                      <Input
                        type="number"
                        placeholder="Ex: 450"
                        value={fastBill}
                        onChange={(e) => setFastBill(e.target.value)}
                        className="h-9 text-xs font-bold text-navy"
                      />
                    </>
                  ) : (
                    <>
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Consumo Médio Mensal (kWh)</label>
                      <Input
                        type="number"
                        placeholder="Ex: 500"
                        value={fastKwh}
                        onChange={(e) => setFastKwh(e.target.value)}
                        className="h-9 text-xs font-bold text-navy"
                      />
                    </>
                  )}
                </div>

                {/* Botão Principal de Envio */}
                <Button
                  type="submit"
                  disabled={fastSaving}
                  className="bg-sun hover:bg-sun-deep text-navy font-extrabold h-9 text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all animate-pulse"
                >
                  {fastSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-navy" /> : <Send className="w-3.5 h-3.5 text-navy" />}
                  {fastSaving ? "Salvando..." : "Salvar & Criar Proposta 🚀"}
                </Button>
              </div>
            </form>
          </Card>

          {/* KPIs Operacionais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-0 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sun to-amber-500 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-navy">{siteLeads.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Leads aguardando atribuição</div>
            </Card>
            <Card className="p-5 border-0 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-navy">{m.totalClientes}</div>
              <div className="text-xs text-muted-foreground mt-1">Leads sob gestão da equipe</div>
            </Card>
            <Card className="p-5 border-0 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-navy">{m.negociacao}</div>
              <div className="text-xs text-muted-foreground mt-1">Negociações em andamento</div>
            </Card>
            <Card className="p-5 border-0 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-navy">
                {m.valorFechados.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Volume de vendas concluídas</div>
            </Card>
          </div>

          {/* Funil Kanban */}
          <Card className="border-0 shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy flex items-center gap-2"><Target className="w-5 h-5 text-sun-deep" />Funil de Vendas Operacional</h2>
              {activeKanbanCol && (
                <button onClick={() => setActiveKanbanCol(null)} className="text-xs text-muted-foreground hover:text-navy underline">
                  Ver todos
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
              {KANBAN_COLS.map((col) => {
                const count = clientes.filter((c) => col.statuses.includes(c.status)).length;
                const receita = clientes
                  .filter((c) => col.statuses.includes(c.status))
                  .reduce((s, c) => s + Number(c.valor_estimado || 0), 0);
                const isActive = activeKanbanCol === col.label;
                return (
                  <button
                    key={col.label}
                    onClick={() => setActiveKanbanCol(isActive ? null : col.label)}
                    className={`rounded-xl p-3 text-left transition border-2 ${isActive ? "border-navy bg-white shadow-md" : "border-transparent"} bg-slate-50 hover:bg-white hover:shadow-md`}
                  >
                    <div className={`w-full h-1 rounded-full ${col.color} mb-2`} />
                    <div className="text-2xl font-extrabold text-navy">{count}</div>
                    <div className="text-xs font-semibold text-navy/70 mt-0.5">{col.label}</div>
                    {receita > 0 && (
                      <div className="text-[10px] text-emerald-700 font-bold mt-1">
                        {receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Leads do site pendentes */}
          <Card className="border-0 shadow-md border-l-4 border-l-sun-deep">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-sun-deep" />
                <h2 className="font-bold text-navy">Novos leads recebidos do site</h2>
                {siteLeads.length > 0 && (
                  <Badge className="bg-sun text-navy">{siteLeads.length} aguardando</Badge>
                )}
              </div>
              <Link to="/app/clientes" className="text-sm text-sun-deep hover:underline flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="divide-y">
              {siteLeads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Nenhum lead novo do site aguardando atribuição de corretor.</div>
              ) : (
                siteLeads.slice(0, 5).map((c) => (
                  <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }} className="flex items-center justify-between gap-3 p-4 hover:bg-sun/5 transition">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-navy flex items-center gap-2">
                        {c.nome}
                        <Badge variant="outline" className="text-[10px] border-sun-deep text-sun-deep">Site</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.telefone} · {c.cidade || "—"}/{c.estado || "—"}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{fmtDate(c.created_at)}</div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Clientes e Leads Recentes */}
          <Card className="border-0 shadow-md">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="font-bold text-navy">Clientes e leads recentes sob gestão</h2>
              {activeKanbanCol && <Badge variant="secondary">Coluna: {activeKanbanCol}</Badge>}
            </div>
            <div className="divide-y">
              {displayedClientes.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">Nenhum cliente sob gestão localizado.</div>
              ) : (
                displayedClientes.slice(0, 8).map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div>
                      <Link to="/app/cliente/$id" params={{ id: c.id }} className="font-semibold text-navy hover:underline">{c.nome}</Link>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.telefone} · {c.cidade || "—"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={STATUS_COLOR[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                      <Link to="/app/cliente/$id" params={{ id: c.id }} className="text-xs text-sun-deep hover:underline">Ver ficha</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ABA 2: INTELIGÊNCIA COMERCIAL (BI) */}
      {activeTab === "bi" && (
        <div className="space-y-6">
          {/* Métricas e KPIs Financeiros */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-0 shadow-md">
              <div className="text-2xl font-bold text-navy">{m.conversao.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Taxa de Conversão</div>
            </Card>
            <Card className="p-4 border-0 shadow-md">
              <div className="text-2xl font-bold text-navy">{BRL(m.receitaRealizada)}</div>
              <div className="text-xs text-muted-foreground mt-1">Faturamento Realizado (Mês)</div>
            </Card>
            <Card className="p-4 border-0 shadow-md">
              <div className="text-2xl font-bold text-navy">{BRL(m.ticketMedio)}</div>
              <div className="text-xs text-muted-foreground mt-1">Ticket Médio por Projeto</div>
            </Card>
            <Card className="p-4 border-0 shadow-md bg-emerald-50/20 border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-700">{m.margemPct.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Margem Média Estimada</div>
            </Card>
          </div>

          {/* Gráfico Mensal e Funil Ponderado */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-0 shadow-md p-5 space-y-4">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-sun-deep" /> Evolução de Faturamento Mensal (BRL)</h3>
              {m.mensal.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">Massa de dados insuficiente para gerar histórico mensal.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.mensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{ fill: "#64748b", fontSize: 10 }} />
                      <Tooltip formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Faturamento"]} />
                      <Bar dataKey="receita" fill="#001F5C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="border-0 shadow-md p-5 space-y-4">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><Zap className="w-4 h-4 text-sun-deep" /> Pipeline Ponderado</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">Volume total em negociação</span>
                  <div className="text-2xl font-extrabold text-navy">
                    {m.pipelineReceita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <span className="text-xs text-muted-foreground">Faturamento provável (25% conversão)</span>
                  <div className="text-2xl font-extrabold text-emerald-700">
                    {m.receitaEsperada.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </div>
                </div>
                {m.tempoMedioFechamento && (
                  <div className="border-t pt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tempo médio para fechar</span>
                    <span className="font-bold text-navy">{m.tempoMedioFechamento.toFixed(0)} dias</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Parceiros & Motivos Perda */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md p-5 space-y-4">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><Users className="w-4 h-4 text-sun-deep" /> Performance por Parceiro (Top Vendedores)</h3>
              {m.topParceiros.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">Nenhuma venda aceita registrada para corretores.</div>
              ) : (
                <div className="space-y-3">
                  {m.topParceiros.map((p, idx) => (
                    <div key={p.nome} className="flex items-center justify-between border-b pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy w-5">{idx + 1}º</span>
                        <span className="font-semibold text-slate-700">{p.nome}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-navy">{p.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</div>
                        <div className="text-[10px] text-muted-foreground">{p.aceitas} fechados de {p.total} propostas</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-0 shadow-md p-5 space-y-4">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-sun-deep" /> Motivos de Negócios Perdidos</h3>
              {m.motivoData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">Nenhum lead marcado como "perdido" com motivo especificado.</div>
              ) : (
                <div className="space-y-3">
                  {m.motivoData.map((d) => {
                    const totalPerdas = m.motivoData.reduce((s, x) => s + x.value, 0);
                    const pct = (d.value / totalPerdas) * 100;
                    return (
                      <div key={d.name} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-700">{d.name}</span>
                          <span className="text-navy">{d.value} perdas ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function CorretorClientes() {
  const { user } = useCurrentUser();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const DIAS_SLA = 3;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clientes").select("*").eq("corretor_id", user.id).order("updated_at", { ascending: false });
      setClientes(data || []);
      setLoading(false);
    })();
  }, [user]);

  const leadsFrios = clientes.filter((c) => {
    const lastUpdate = new Date(c.updated_at || c.created_at);
    const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= DIAS_SLA && !["concluido", "perdido", "contrato_assinado"].includes(c.status);
  });

  const ativos = clientes.filter((c) => !["concluido", "perdido"].includes(c.status));
  const groups = Object.keys(STATUS_LABEL).map((s) => ({ status: s, items: clientes.filter((c) => c.status === s) }));

  const diffDias = (d: string) => {
    const days = Math.floor((now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Meus clientes</h1>
          <p className="text-muted-foreground">{ativos.length} ativo{ativos.length === 1 ? "" : "s"} · {clientes.filter((c) => c.status === "concluido").length} concluído{clientes.filter((c) => c.status === "concluido").length === 1 ? "" : "s"}</p>
        </div>
        <Link to="/app/novo" className="inline-flex items-center gap-2 bg-sun-deep text-navy px-5 py-2.5 rounded-full font-semibold hover:bg-sun">
          + Novo cliente
        </Link>
      </div>

      {/* ALERTA SLA — Leads parados */}
      {leadsFrios.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-red-500 bg-red-50/40">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800">⚠️ {leadsFrios.length} lead{leadsFrios.length > 1 ? "s" : ""} sem contato há mais de {DIAS_SLA} dias!</h3>
            </div>
            <div className="space-y-2">
              {leadsFrios.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
                  <div>
                    <Link to="/app/cliente/$id" params={{ id: c.id }} className="font-semibold text-navy hover:underline">{c.nome}</Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <Badge className={STATUS_COLOR[c.status]} variant="outline">{STATUS_LABEL[c.status]}</Badge>
                      <span className="ml-2 text-red-600 font-medium">há {diffDias(c.updated_at || c.created_at)} dias sem atualização</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.telefone && (
                      <a
                        href={`https://wa.me/${c.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${c.nome?.split(" ")[0]}, tudo bem? Aqui é da ESOL Energy. Gostaria de retomar nossa conversa sobre energia solar! 😊`)}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600"
                      >
                        <MessageCircle className="w-3 h-3" /> Contatar
                      </a>
                    )}
                    <Link to="/app/cliente/$id" params={{ id: c.id }}
                      className="inline-flex items-center gap-1 text-xs bg-navy text-white px-3 py-1.5 rounded-full hover:bg-navy-deep">
                      Ver ficha
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* KPI rápido */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-0 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-navy">{ativos.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Em andamento</div>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{clientes.filter((c) => c.status === "concluido").length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Concluídos</div>
        </Card>
        <Card className={leadsFrios.length > 0 ? "p-4 border border-red-200 bg-red-50 shadow-sm text-center" : "p-4 border-0 shadow-sm text-center"}>
          <div className={leadsFrios.length > 0 ? "text-2xl font-extrabold text-red-600" : "text-2xl font-extrabold text-navy"}>{leadsFrios.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <AlertTriangle className={leadsFrios.length > 0 ? "w-3 h-3 text-red-500" : "w-3 h-3"} /> Parados 3+ dias
          </div>
        </Card>
      </div>

      {loading ? <div className="text-muted-foreground">Carregando…</div> : clientes.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground mb-4">Você ainda não tem clientes cadastrados.</p>
          <Link to="/app/novo" className="inline-block bg-navy text-white px-6 py-2.5 rounded-full font-semibold">Cadastrar primeiro cliente</Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.filter((g) => g.items.length).map((g) => (
            <div key={g.status} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy/70">{STATUS_LABEL[g.status]}</h3>
                <span className="text-xs text-muted-foreground">{g.items.length}</span>
              </div>
              {g.items.map((c) => {
                const dias = diffDias(c.updated_at || c.created_at);
                const frio = dias >= DIAS_SLA && !["concluido", "perdido", "contrato_assinado"].includes(c.status);
                return (
                  <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }}>
                    <Card className={frio ? "p-4 hover:shadow-lg transition cursor-pointer border-l-4 border-l-red-400 bg-red-50/30" : "p-4 hover:shadow-lg transition cursor-pointer border-l-4 border-l-amber-400 bg-white"}>
                      <div className="font-semibold text-navy">{c.nome}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.telefone}</div>
                      {c.valor_estimado && <div className="text-xs text-emerald-700 font-semibold mt-1">R$ {Number(c.valor_estimado).toLocaleString("pt-BR")}</div>}
                      {frio && <div className="text-[10px] text-red-600 font-bold mt-1">⚠️ {dias} dias sem atualização</div>}
                    </Card>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
