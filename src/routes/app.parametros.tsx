import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Settings, Save, Loader2, Plus, Trash2, Landmark, HelpCircle, Zap,
  Boxes, FileSpreadsheet, Upload, RefreshCw, Globe, Building2, Phone, Mail, Link2, MapPin, BadgeCheck,
  Truck, Wrench, Calculator, Target, ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react";
import { 
  calcularProposta, calcularCustoInstalacao, calcularCustoFrete,
  BRL, type TipoInstalacao, type TipoTelhado, TELHADO_LABEL, PARAMETROS_DEFAULT 
} from "@/lib/proposta-calc";
import { CONCESSIONARIAS, getConcessionariasPorUF } from "@/lib/concessionarias";
import {
  salvarConfigDistribuidoraServerFn,
  sincronizarKitsDistribuidoraServerFn,
  obterConfigsDistribuidorasServerFn
} from "@/lib/distributors.functions";
import { classificarCategoriaPorNome } from "@/lib/distributor-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/parametros")({
  head: () => ({ meta: [{ title: "Parâmetros & Motor — ESOL Energy" }] }),
  component: Parametros,
});

// Seções do motor reverso — aba "Motor & Margens"
const SECTIONS_MOTOR = [
  {
    title: "🎯 Meta de Lucro Líquido (Motor Reverso)",
    hint: "O motor calcula automaticamente o preço mínimo de venda para garantir exatamente esta margem de lucro, após todos os custos reais.",
    fields: [
      ["lucro_alvo_pct", "Lucro Líquido Alvo (ex: 0.15 = 15%) — definido pelo administrador"],
      ["comissao_padrao_pct", "Comissão Padrão para Parceiros (ex: 0.08 = 8%) — zero para admin/sócio"],
    ]
  },
  {
    title: "📊 Tributação e Custos Operacionais",
    hint: "Custos operacionais da ESOL deduzidos do lucro. Tributação: Simples Nacional faixa 2 = 6% | Lucro Presumido ≈ 14.53%",
    fields: [
      ["tributacao_empresa_pct", "Tributação (Simples Nac. faixa 2 = 0.06 = 6%)"],
      ["custo_overhead_pct", "Overhead / SG&A: salários admin, ferramentas, aluguel (ex: 0.04 = 4%)"],
      ["custo_garantia_pct", "Provisão de Garantia e Pós-venda (ex: 0.007 = 0.7%)"],
      ["custo_impostos_compra_pct", "Impostos de Compra de Equipamentos: ICMS-ST (ex: 0.03 = 3%)"],
    ]
  },
  {
    title: "💰 Custos Fixos por Projeto (R$)",
    hint: "Custos fixos que incidem em todo projeto, independente do porte.",
    fields: [
      ["custo_marketing_fixo_brl", "Marketing / CAC por Projeto (R$ fixo, padrão: R$ 1.000)"],
      ["custo_engenharia_fixo_brl", "Engenharia Fixa: ART + Projeto + Protocolo Concessionária (R$, padrão: R$ 950)"],
    ]
  },
];

const SECTIONS_TECNICOS = [
  {
    title: "☀️ HSP por Macrorregião (fallback quando UF não mapeada)",
    hint: "O motor usa HSP específico por Estado (Atlas INPE/LABREN). Estes valores são fallback para estados sem mapeamento.",
    fields: [
      ["hsp_norte", "Região Norte (fallback, ex: 4.7)"],
      ["hsp_nordeste", "Região Nordeste (fallback, ex: 5.6)"],
      ["hsp_centro_oeste", "Região Centro-Oeste (fallback, ex: 5.2)"],
      ["hsp_sudeste", "Região Sudeste (fallback, ex: 4.9)"],
      ["hsp_sul", "Região Sul (fallback, ex: 4.5)"],
    ]
  },
  {
    title: "⚙️ Módulos e Sistema Fotovoltaico",
    hint: "Configurações do hardware padrão. Módulos 555W são o padrão de mercado Tier 1 em 2025/2026.",
    fields: [
      ["potencia_modulo_w", "Potência do Módulo Padrão (W, ex: 555)"],
      ["area_por_modulo_m2", "Área por Módulo (m², ex: 2.73)"],
      ["perdas_sistema", "Fator de Perdas do Sistema (ex: 0.18 = 18%)"],
      ["inflacao_energetica", "Inflação Energética Anual (ex: 0.08 = 8%/ano)"],
      ["vida_util_anos", "Vida Útil do Sistema (anos, padrão: 25)"],
      ["tarifa_kwh_default", "Tarifa Nacional de Referência (fallback, R$/kWh, ex: 0.88)"],
    ]
  },
  {
    title: "⚡ Economia Honesta — Deduções para o Cliente",
    hint: "Deduções que tornam a proposta honesta: o cliente nunca zera 100% da conta.",
    fields: [
      ["percentual_fio_b", "Fio B (Lei 14.300/2022): 2026=0.60, 2027=0.75, 2028=0.90"],
      ["cosip_estimada_brl", "COSIP / Iluminação Pública estimada (R$/mês, ex: 22)"],
      ["custo_disponibilidade_mono_brl", "Disponibilidade Mono/Bifásico (calculado por tarifa se vazio)"],
      ["custo_disponibilidade_tri_brl", "Disponibilidade Trifásico (calculado por tarifa se vazio)"],
    ]
  },
  {
    title: "🚀 Operacional",
    hint: "Capacidade da equipe de instalação e validade padrão das propostas.",
    fields: [
      ["capacidade_instaladores_kwp_mes", "Capacidade dos Instaladores (kWp/mês, ex: 50)"],
      ["validade_proposta_dias", "Validade Padrão das Propostas (dias, ex: 30)"],
    ]
  },
];

export const DEFAULT_BANCOS = [
  { nome: 'Solfácil', taxa_juros_mes: 1.19, taxa_cet_mes: 1.39, prazo_maximo_meses: 120, taxa_aprovacao_media: 88, ativo: true },
  { nome: 'Banco BV Solar', taxa_juros_mes: 1.29, taxa_cet_mes: 1.48, prazo_maximo_meses: 84, taxa_aprovacao_media: 80, ativo: true },
  { nome: 'Santander Solar', taxa_juros_mes: 1.39, taxa_cet_mes: 1.59, prazo_maximo_meses: 96, taxa_aprovacao_media: 75, ativo: true },
  { nome: 'Sicredi Energia Verde', taxa_juros_mes: 0.99, taxa_cet_mes: 1.15, prazo_maximo_meses: 120, taxa_aprovacao_media: 85, ativo: true },
  { nome: 'Sicoob EcoCrédito', taxa_juros_mes: 1.05, taxa_cet_mes: 1.22, prazo_maximo_meses: 96, taxa_aprovacao_media: 82, ativo: true },
  { nome: 'Banco do Brasil Agro/Solar', taxa_juros_mes: 0.95, taxa_cet_mes: 1.12, prazo_maximo_meses: 120, taxa_aprovacao_media: 70, ativo: true },
  { nome: 'Bradesco Financiamento Solar', taxa_juros_mes: 1.25, taxa_cet_mes: 1.44, prazo_maximo_meses: 72, taxa_aprovacao_media: 72, ativo: true },
  { nome: 'Itaú CrediSolar', taxa_juros_mes: 1.35, taxa_cet_mes: 1.55, prazo_maximo_meses: 60, taxa_aprovacao_media: 70, ativo: true },
  { nome: 'Porto Seguro Solar (PortoBank)', taxa_juros_mes: 1.20, taxa_cet_mes: 1.38, prazo_maximo_meses: 84, taxa_aprovacao_media: 78, ativo: true },
  { nome: 'Ailos Solar', taxa_juros_mes: 1.08, taxa_cet_mes: 1.25, prazo_maximo_meses: 96, taxa_aprovacao_media: 80, ativo: true },
  { nome: 'Caixa Econômica Federal (CEF)', taxa_juros_mes: 1.15, taxa_cet_mes: 1.32, prazo_maximo_meses: 60, taxa_aprovacao_media: 82, ativo: true },
  { nome: 'Banco do Nordeste (BNB)', taxa_juros_mes: 0.80, taxa_cet_mes: 0.95, prazo_maximo_meses: 96, taxa_aprovacao_media: 75, ativo: true },
  { nome: 'Banco da Amazônia (BASA)', taxa_juros_mes: 0.85, taxa_cet_mes: 1.00, prazo_maximo_meses: 96, taxa_aprovacao_media: 70, ativo: true },
  { nome: 'Crefisa Solar', taxa_juros_mes: 1.89, taxa_cet_mes: 2.12, prazo_maximo_meses: 48, taxa_aprovacao_media: 85, ativo: true },
  { nome: 'BNDES Finame Baixo Carbono', taxa_juros_mes: 0.75, taxa_cet_mes: 0.88, prazo_maximo_meses: 120, taxa_aprovacao_media: 60, ativo: true },
  { nome: 'Desenvolve SP (Economia Verde)', taxa_juros_mes: 0.90, taxa_cet_mes: 1.05, prazo_maximo_meses: 84, taxa_aprovacao_media: 65, ativo: true }
];

function Parametros() {
  const search = useSearch({ from: "/app/parametros" }) as any;
  const [activeTab, setActiveTab] = useState<"motor" | "concessionarias" | "calculadoras" | "financeiras" | "tecnicos" | "preview" | "kits">("motor");
  const [geralData, setGeralData] = useState<any>(null);
  const [savingGeral, setSavingGeral] = useState(false);

  // Estados para simulação do motor reverso (preview)
  const [testeConsumo, setTesteConsumo] = useState<number>(600);
  const [testeTarifa, setTesteTarifa] = useState<number>(0.88);
  const [testeEstado, setTesteEstado] = useState<string>("SP");
  const [testeTipo, setTesteTipo] = useState<TipoInstalacao>("residencial");
  const [testeTelhado, setTesteTelhado] = useState<TipoTelhado>("ceramico");
  const [testeKitCusto, setTesteKitCusto] = useState<number>(9500);
  const [testeEhAdmin, setTesteEhAdmin] = useState<boolean>(true);

  // Estado das concessionárias
  const [filtroUF, setFiltroUF] = useState<string>("SP");

  useEffect(() => {
    if (search.tab === "kits") setActiveTab("kits");
    else if (search.tab === "financeiras") setActiveTab("financeiras");
  }, [search.tab]);
  
  // Estados para gerenciamento de Financeiras
  const [financeiras, setFinanceiras] = useState<any[]>([]);
  const [loadingFin, setLoadingFin] = useState(false);
  const [savingFin, setSavingFin] = useState(false);

  const loadData = async () => {
    try {
      const { data: p } = await supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle();
      // Mescla os defaults com os dados do banco (novos campos terão valores padrão se ausentes)
      const merged = { ...PARAMETROS_DEFAULT, ...(p || {}) };
      setGeralData(merged);
      if (merged.tarifa_kwh_default) setTesteTarifa(Number(merged.tarifa_kwh_default));
    } catch (err) {
      console.error("Falha ao carregar parâmetros comerciais", err);
      // Em caso de erro, carrega com todos os defaults
      setGeralData({ ...PARAMETROS_DEFAULT });
      toast.warning("Modo offline: parâmetros padrão carregados. Salve para persistir.");
    }
  };

  const loadFinanceiras = async () => {
    setLoadingFin(true);
    try {
      const { data, error } = await (supabase as any)
        .from("financeiras_solar")
        .select("*")
        .order("nome");
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setFinanceiras(DEFAULT_BANCOS);
      } else {
        setFinanceiras(data);
      }
    } catch (err: any) {
      console.warn("Erro ao carregar financeiras de banco de dados, usando fallback:", err);
      setFinanceiras(DEFAULT_BANCOS);
      toast.warning("Bancos indisponíveis no banco de dados. Carregado localmente.");
    } finally {
      setLoadingFin(false);
    }
  };

  useEffect(() => {
    loadData();
    loadFinanceiras();
  }, []);

  async function salvarGeral() {
    if (!geralData) return;
    setSavingGeral(true);
    try {
      if (geralData.id) {
        // Atualiza o registro existente
        const { error } = await supabase.from("parametros_comerciais").update(geralData).eq("id", geralData.id);
        if (error) throw error;
      } else {
        // Cria o primeiro registro se não existe
        const { data: novo, error } = await supabase.from("parametros_comerciais").insert(geralData).select().single();
        if (error) throw error;
        if (novo) setGeralData({ ...geralData, id: novo.id });
      }
      toast.success("✅ Parâmetros do motor salvos com sucesso!");
    } catch (err: any) {
      toast.error("Falha ao salvar: " + (err?.message || "Verifique a conexão."));
    } finally {
      setSavingGeral(false);
    }
  }

  const handleUpdateFinanceira = (index: number, key: string, val: any) => {
    const updated = [...financeiras];
    updated[index] = { ...updated[index], [key]: val };
    setFinanceiras(updated);
  };

  const handleSalvarFinanceiras = async () => {
    setSavingFin(true);
    try {
      for (const fin of financeiras) {
        if (fin.id) {
          const { error } = await (supabase as any)
            .from("financeiras_solar")
            .update({
              nome: fin.nome,
              taxa_juros_mes: Number(fin.taxa_juros_mes) || 0,
              taxa_cet_mes: Number(fin.taxa_cet_mes) || 0,
              prazo_maximo_meses: Number(fin.prazo_maximo_meses) || 0,
              taxa_aprovacao_media: Number(fin.taxa_aprovacao_media) || 0,
              ativo: fin.ativo,
            })
            .eq("id", fin.id);
          if (error) throw error;
        } else {
          const { error } = await (supabase as any)
            .from("financeiras_solar")
            .insert({
              nome: fin.nome,
              taxa_juros_mes: Number(fin.taxa_juros_mes) || 0,
              taxa_cet_mes: Number(fin.taxa_cet_mes) || 0,
              prazo_maximo_meses: Number(fin.prazo_maximo_meses) || 0,
              taxa_aprovacao_media: Number(fin.taxa_aprovacao_media) || 0,
              ativo: fin.ativo ?? true,
            });
          if (error) throw error;
        }
      }
      toast.success("Taxas e Bancos salvos com sucesso!");
      loadFinanceiras();
    } catch (err: any) {
      toast.error("Erro ao salvar taxas: " + err.message);
    } finally {
      setSavingFin(false);
    }
  };

  const handleAddFinanceira = () => {
    setFinanceiras([
      ...financeiras,
      {
        nome: "Novo Banco Solar",
        taxa_juros_mes: 1.2,
        taxa_cet_mes: 1.4,
        prazo_maximo_meses: 60,
        taxa_aprovacao_media: 80,
        ativo: true,
      },
    ]);
  };
 
  const handlePopularBancosPadrao = async () => {
    // INSERT real no Supabase (não apenas estado local)
    setSavingFin(true);
    try {
      // Primeiro limpa os existentes para evitar duplicatas
      const { error: delErr } = await (supabase as any).from("financeiras_solar").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) console.warn("Aviso limpeza bancos:", delErr);
      const { error: insErr } = await (supabase as any).from("financeiras_solar").insert(DEFAULT_BANCOS);
      if (insErr) throw insErr;
      toast.success("✅ 16 bancos padrão inseridos com sucesso no banco de dados!");
      loadFinanceiras();
    } catch (err: any) {
      // Fallback: popula localmente se Supabase falhar
      setFinanceiras(DEFAULT_BANCOS);
      toast.warning("Banco de dados offline. Bancos carregados localmente. Salve manualmente.");
    } finally {
      setSavingFin(false);
    }
  };

  const handleDeleteFinanceira = async (id: string, index: number) => {
    if (!id) {
      setFinanceiras(financeiras.filter((_, i) => i !== index));
      return;
    }
    if (!confirm("Tem certeza que deseja remover este banco de financiamento?")) return;
    try {
      const { error } = await (supabase as any).from("financeiras_solar").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banco excluído com sucesso!");
      loadFinanceiras();
    } catch (err: any) {
      toast.error("Erro ao excluir: " + err.message);
    }
  };

  // Verificação de saúde dos parâmetros
  const saudeDosParametros = useMemo(() => {
    if (!geralData) return null;
    const lucro = geralData.lucro_alvo_pct ?? 0.15;
    const tribut = geralData.tributacao_empresa_pct ?? 0.06;
    const overhead = geralData.custo_overhead_pct ?? 0.04;
    const garantia = geralData.custo_garantia_pct ?? 0.007;
    const comissao = geralData.comissao_padrao_pct ?? 0.08;
    const pVar = tribut + overhead + garantia + comissao;
    const divisor = 1 - pVar - lucro;
    return { pVar, divisor, valido: divisor > 0.05, lucro };
  }, [geralData]);

  if (!geralData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando parâmetros do motor central...
      </div>
    );
  }

  const tabClass = (t: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
      activeTab === t ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"
    }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
            <Settings className="w-8 h-8 text-sun-deep" /> Motor & Parâmetros
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure o motor de precificação reversa. O preço de venda é calculado automaticamente para garantir o lucro alvo definido.
          </p>
        </div>
        {saudeDosParametros && !saudeDosParametros.valido && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 rounded-xl px-4 py-2 text-rose-700 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" /> Parâmetros inválidos: custos variáveis + lucro ≥ 100%!
          </div>
        )}
        {saudeDosParametros && saudeDosParametros.valido && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-2 text-emerald-700 text-xs font-bold">
            <Target className="w-4 h-4" /> Motor calibrado — Lucro alvo: {(saudeDosParametros.lucro * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Abas — 7 seções */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 flex-wrap gap-1 overflow-x-auto">
        <button onClick={() => setActiveTab("motor")} className={tabClass("motor")}>
          <Target className="w-3.5 h-3.5" /> Motor & Margens
        </button>
        <button onClick={() => setActiveTab("concessionarias")} className={tabClass("concessionarias")}>
          <Zap className="w-3.5 h-3.5" /> Concessionárias & Tarifas
        </button>
        <button onClick={() => setActiveTab("calculadoras")} className={tabClass("calculadoras")}>
          <Calculator className="w-3.5 h-3.5" /> Calculadoras
        </button>
        <button onClick={() => setActiveTab("financeiras")} className={tabClass("financeiras")}>
          <Landmark className="w-3.5 h-3.5" /> Bancos ({financeiras.length})
        </button>
        <button onClick={() => setActiveTab("tecnicos")} className={tabClass("tecnicos")}>
          <Settings className="w-3.5 h-3.5" /> Técnicos & HSP
        </button>
        <button onClick={() => setActiveTab("preview")} className={tabClass("preview")}>
          <HelpCircle className="w-3.5 h-3.5" /> Preview do Motor
        </button>
        <button onClick={() => setActiveTab("kits")} className={tabClass("kits")}>
          <Boxes className="w-3.5 h-3.5" /> Importar Kits
        </button>
      </div>

      {/* ── ABA: MOTOR & MARGENS ─────────────────────────────────────────── */}
      {activeTab === "motor" ? (
        <>
          <div className="grid gap-6">
            {SECTIONS_MOTOR.map((s) => (
              <Card key={s.title} className="p-5 border-0 shadow-md bg-white">
                <h3 className="font-bold text-navy text-sm border-b pb-3 mb-1">{s.title}</h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{s.hint}</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.fields.map(([k, label]) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-xs text-slate-600 font-semibold">{label}</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={geralData[k] ?? (PARAMETROS_DEFAULT as any)[k] ?? ""}
                        onChange={(e) => setGeralData({ ...geralData, [k]: Number(e.target.value) })}
                        className="h-9 text-xs"
                        placeholder={String((PARAMETROS_DEFAULT as any)[k] ?? "")}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Pré-visualização do Motor Reverso */}
            {geralData && (() => {
              const lucro = geralData.lucro_alvo_pct ?? 0.15;
              const tribut = geralData.tributacao_empresa_pct ?? 0.06;
              const overhead = geralData.custo_overhead_pct ?? 0.04;
              const garantia = geralData.custo_garantia_pct ?? 0.007;
              const comissao_parceiro = geralData.comissao_padrao_pct ?? 0.08;
              const mkt_fixo = geralData.custo_marketing_fixo_brl ?? 1000;
              const eng = geralData.custo_engenharia_fixo_brl ?? 950;
              const imp = geralData.custo_impostos_compra_pct ?? 0.03;

              // Exemplo: kit de R$ 10.000, 5 kWp
              const c_kit_ex = 10000;
              const c_inst_ex = 5 * (geralData.inst_ceramico_kwp ?? 250);
              const c_frete_ex = geralData.custo_frete_minimo_brl ?? 350;
              const c_imp_ex = c_kit_ex * imp;
              const C_fixos_admin = c_kit_ex + c_inst_ex + c_frete_ex + c_imp_ex + mkt_fixo + eng;
              const p_var_admin = tribut + overhead + garantia;
              const C_fixos_parceiro = C_fixos_admin;
              const p_var_parceiro = tribut + overhead + garantia + comissao_parceiro;

              const preco_admin = C_fixos_admin / (1 - p_var_admin - lucro);
              const preco_parceiro = C_fixos_parceiro / (1 - p_var_parceiro - lucro);
              const divisor_valido = (1 - p_var_parceiro - lucro) > 0.05;

              return (
                <Card className="p-5 border-0 shadow-md bg-gradient-to-br from-navy/5 to-sun/5 border-l-4 border-l-sun-deep">
                  <h3 className="font-bold text-navy text-sm border-b pb-3 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-sun-deep" />
                    Pré-visualização do Motor — Exemplo: Kit R$ 10.000 / 5 kWp / Telhado Cerâmico
                  </h3>
                  {!divisor_valido ? (
                    <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Parâmetros inválidos! A soma de (custos variáveis + lucro alvo) ≥ 100%. Reduza algum percentual.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Proposta Admin / Sócio (sem comissão)</div>
                        <div className="bg-white rounded-xl p-3.5 border space-y-1.5">
                          <div className="flex justify-between text-slate-500"><span>Kit fornecedor</span><span className="font-semibold text-navy">{BRL(c_kit_ex)}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Instalação (5kWp × R$250)</span><span className="font-semibold text-navy">{BRL(c_inst_ex)}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Frete estimado</span><span className="font-semibold text-navy">{BRL(c_frete_ex)}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Marketing fixo</span><span className="font-semibold text-navy">{BRL(mkt_fixo)}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Engenharia fixa</span><span className="font-semibold text-navy">{BRL(eng)}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Impostos compra ({(imp*100).toFixed(0)}%)</span><span className="font-semibold text-navy">{BRL(c_imp_ex)}</span></div>
                          <div className="flex justify-between border-t pt-1.5 font-bold text-navy"><span>PREÇO MÍNIMO DE VENDA</span><span className="text-emerald-600">{BRL(Math.round(preco_admin))}</span></div>
                          <div className="flex justify-between font-bold text-emerald-600"><span>→ Lucro Líquido Garantido</span><span>{BRL(Math.round(preco_admin * lucro))} ({(lucro*100).toFixed(0)}%)</span></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Proposta Parceiro (com comissão {(comissao_parceiro*100).toFixed(0)}%)</div>
                        <div className="bg-white rounded-xl p-3.5 border space-y-1.5">
                          <div className="flex justify-between text-slate-500"><span>Kit fornecedor</span><span className="font-semibold text-navy">{BRL(c_kit_ex)}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Instalação + Frete + Eng + Mkt</span><span className="font-semibold text-navy">{BRL(c_inst_ex + c_frete_ex + eng + mkt_fixo + c_imp_ex)}</span></div>
                          <div className="flex justify-between text-amber-600"><span>Comissão Parceiro ({(comissao_parceiro*100).toFixed(0)}% sobre P)</span><span className="font-semibold">{BRL(Math.round(preco_parceiro * comissao_parceiro))}</span></div>
                          <div className="flex justify-between border-t pt-1.5 font-bold text-navy"><span>PREÇO MÍNIMO DE VENDA</span><span className="text-amber-600">{BRL(Math.round(preco_parceiro))}</span></div>
                          <div className="flex justify-between font-bold text-emerald-600"><span>→ Lucro Líquido Garantido</span><span>{BRL(Math.round(preco_parceiro * lucro))} ({(lucro*100).toFixed(0)}%)</span></div>
                          <div className="text-[10px] text-slate-400 mt-1">Preço {BRL(Math.round(preco_parceiro - preco_admin))} maior que proposta direta para absorver a comissão</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })()}
          </div>
          <div className="flex justify-end sticky bottom-4 z-10 pt-2">
            <Button onClick={salvarGeral} disabled={savingGeral} className="bg-sun hover:bg-sun-deep text-navy font-bold shadow-lg rounded-full px-8 py-5 text-sm transition-all border-0 cursor-pointer">
              {savingGeral ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Parâmetros do Motor
            </Button>
          </div>
        </>

      /* ── ABA: CONCESSIONÁRIAS & TARIFAS ─────────────────────────────── */
      ) : activeTab === "concessionarias" ? (
        <>
          <Card className="p-5 border-0 shadow-md bg-white">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-navy text-sm">⚡ Concessionárias de Energia — Tarifas ANEEL 2025</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tarifas residencial / comercial / rural por estado. Atualize conforme reajustes anuais da ANEEL.</p>
              </div>
              <select
                value={filtroUF}
                onChange={(e) => setFiltroUF(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-800"
              >
                {["SP","MG","RJ","ES","PR","SC","RS","GO","MT","MS","DF","BA","PE","CE","MA","PI","AL","RN","PB","SE","PA","TO","AM","AC","RO","RR","AP"].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="p-3 font-bold text-slate-600">Concessionária</th>
                    <th className="p-3 font-bold text-slate-600">UF</th>
                    <th className="p-3 font-bold text-slate-600 text-right">Residencial (R$/kWh)</th>
                    <th className="p-3 font-bold text-slate-600 text-right">Comercial (R$/kWh)</th>
                    <th className="p-3 font-bold text-slate-600 text-right">Rural (R$/kWh)</th>
                    <th className="p-3 font-bold text-slate-600">Vigência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CONCESSIONARIAS.filter(c => !filtroUF || c.uf === filtroUF).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <div className="font-bold text-navy">{c.nome}</div>
                        <a href={c.site} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline">{c.site}</a>
                      </td>
                      <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{c.uf}</span></td>
                      <td className="p-3 text-right font-bold text-navy">R$ {c.tarifa_residencial.toFixed(3)}</td>
                      <td className="p-3 text-right font-semibold text-slate-600">R$ {c.tarifa_comercial.toFixed(3)}</td>
                      <td className="p-3 text-right font-semibold text-slate-600">R$ {c.tarifa_rural.toFixed(3)}</td>
                      <td className="p-3 text-[10px] text-slate-400">{c.vigencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <strong>ℹ️ Nota:</strong> Estas tarifas são pré-carregadas com dados ANEEL 2025. O motor usa automaticamente a tarifa do estado do cliente quando informado.
              Reajustes ocorrem anualmente — atualize manualmente conforme publicações da ANEEL.
            </div>
          </Card>
          <button onClick={() => setFiltroUF("")} className="text-xs text-blue-500 hover:underline">
            {filtroUF ? "Ver todas as UFs" : "Filtrar por UF"}
          </button>
        </>

      /* ── ABA: CALCULADORAS ──────────────────────────────────────────── */
      ) : activeTab === "calculadoras" ? (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calculadora de Instalação */}
            <Card className="p-5 border-0 shadow-md bg-white space-y-4">
              <div>
                <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sun-deep" /> Calculadora de Instalação (R$/kWp por Tipo de Telhado)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Custo de mão de obra por kWp instalado. Referência: Portal Solar / SunBrasil 2025.</p>
              </div>
              <div className="space-y-3">
                {[
                  ["inst_ceramico_kwp", "🏠 Cerâmico (colonial / romana)", "250"],
                  ["inst_metalico_kwp", "🏭 Metálico / Fibrocimento", "200"],
                  ["inst_laje_kwp", "🏢 Laje / Concreto", "300"],
                  ["inst_solo_kwp", "🌱 Solo (ground mounting)", "220"],
                  ["inst_especial_kwp", "⚠️ Especial (inclinação > 45°)", "380"],
                  ["inst_adicional_grande_kwp", "➕ Adicional por kWp acima de 20 kWp", "80"],
                ].map(([k, label, placeholder]) => (
                  <div key={k} className="flex items-center gap-3">
                    <Label className="text-xs text-slate-600 font-semibold flex-1">{label}</Label>
                    <div className="flex items-center gap-1 w-36">
                      <span className="text-xs text-slate-400">R$</span>
                      <Input type="number" step="10"
                        value={geralData[k] ?? placeholder}
                        onChange={(e) => setGeralData({ ...geralData, [k]: Number(e.target.value) })}
                        className="h-8 text-xs w-full" placeholder={placeholder}
                      />
                      <span className="text-xs text-slate-400">/kWp</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Preview da calculadora */}
              <div className="bg-slate-50 rounded-xl p-3 border text-xs space-y-1">
                <div className="font-bold text-slate-600 text-[10px] uppercase mb-2">Preview — Sistema 5 kWp em cada tipo:</div>
                {(["ceramico","metalico","laje","solo","especial"] as TipoTelhado[]).map(t => {
                  const custo = geralData ? (5 * (geralData[`inst_${t}_kwp`] ?? (PARAMETROS_DEFAULT as any)[`inst_${t}_kwp`] ?? 250)) : 0;
                  return (
                    <div key={t} className="flex justify-between">
                      <span className="text-slate-500">{TELHADO_LABEL[t]}</span>
                      <span className="font-bold text-navy">{BRL(custo)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Calculadora de Frete */}
            <Card className="p-5 border-0 shadow-md bg-white space-y-4">
              <div>
                <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sun-deep" /> Calculadora de Frete (por Distância ao CD)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Custo baseado na distância rodoviária ao CD da distribuidora escolhida.</p>
              </div>
              <div className="space-y-3">
                {[
                  ["custo_frete_por_100km_kwp", "💰 Custo por kWp / 100km (R$)", "2.50"],
                  ["custo_frete_minimo_brl", "📦 Frete mínimo por projeto (R$)", "350"],
                ].map(([k, label, placeholder]) => (
                  <div key={k} className="flex items-center gap-3">
                    <Label className="text-xs text-slate-600 font-semibold flex-1">{label}</Label>
                    <div className="flex items-center gap-1 w-36">
                      <span className="text-xs text-slate-400">R$</span>
                      <Input type="number" step="0.10"
                        value={geralData[k] ?? placeholder}
                        onChange={(e) => setGeralData({ ...geralData, [k]: Number(e.target.value) })}
                        className="h-8 text-xs w-full" placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border text-xs space-y-2">
                <div className="font-bold text-slate-600 text-[10px] uppercase mb-1">Simulações de Frete (Sistema de 5 kWp via Aldo Solar):</div>
                {geralData && (() => {
                  const custoSP = calcularCustoFrete(5, "aldo", "SP", geralData);
                  const custoPA = calcularCustoFrete(5, "aldo", "PA", geralData);
                  return (
                    <div className="space-y-1.5 font-bold">
                      <div className="flex justify-between text-navy">
                        <span>Local — São Paulo (SP):</span>
                        <span>{BRL(custoSP)}</span>
                      </div>
                      <div className="flex justify-between text-[#2E44B8]">
                        <span>Norte — Parauapebas (PA):</span>
                        <span>{BRL(custoPA)}</span>
                      </div>
                    </div>
                  );
                })()}
                <div className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  As distâncias e dificuldades logísticas das 8 distribuidoras estão mapeadas. O sistema aplica fatores de redespacho regionais (ex: 2.4x para a Região Norte) sobre a distância e o frete mínimo.
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end sticky bottom-4 z-10 pt-2">
            <Button onClick={salvarGeral} disabled={savingGeral} className="bg-sun hover:bg-sun-deep text-navy font-bold shadow-lg rounded-full px-8 py-5 text-sm transition-all border-0 cursor-pointer">
              {savingGeral ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Calculadoras
            </Button>
          </div>
        </>

      /* ── ABA: TÉCNICOS & HSP ────────────────────────────────────────── */
      ) : activeTab === "tecnicos" ? (
        <>
          <div className="grid gap-6">
            {SECTIONS_TECNICOS.map((s) => (
              <Card key={s.title} className="p-5 border-0 shadow-md bg-white">
                <h3 className="font-bold text-navy text-sm border-b pb-3 mb-1">{s.title}</h3>
                {(s as any).hint && (
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{(s as any).hint}</p>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.fields.map(([k, label]) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-xs text-slate-600 font-semibold">{label}</Label>
                      <Input 
                        type="number" 
                        step="0.001" 
                        value={geralData[k] ?? ""} 
                        onChange={(e) => setGeralData({ ...geralData, [k]: Number(e.target.value) })}
                        className="h-9 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end sticky bottom-4 z-10 pt-2">
            <Button 
              onClick={salvarGeral} 
              disabled={savingGeral} 
              className="bg-sun hover:bg-sun-deep text-navy font-bold shadow-lg rounded-full px-8 py-5 text-sm transition-all border-0 cursor-pointer"
            >
              {savingGeral ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Parâmetros
            </Button>
          </div>
        </>
      ) : activeTab === "financeiras" ? (
        <>
          <Card className="border border-slate-200/60 shadow-sm overflow-x-auto bg-white rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-navy text-sm">Gerenciamento de Bancos e Taxas CET</h3>
                <p className="text-xs text-muted-foreground mt-0.5">As taxas de Custo Efetivo Total (CET) serão as utilizadas para as simulações e cálculos de propostas.</p>
              </div>
              <Button
                onClick={handleAddFinanceira}
                className="bg-[#2E44B8] hover:bg-[#1F3095] text-white text-xs font-bold rounded-xl px-4 py-2 border-0 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Adicionar Banco
              </Button>
            </div>

            {loadingFin ? (
              <div className="py-12 text-center text-muted-foreground text-xs flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando tabelas de juros e CET…
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead className="suns-table-header text-left">
                  <tr>
                    <th className="p-3">Nome da Financeira / Banco</th>
                    <th className="p-3">Taxa Nominal (% a.m.)</th>
                    <th className="p-3">Taxa CET (% a.m.) *</th>
                    <th className="p-3">Prazo Máximo (Meses)</th>
                    <th className="p-3">Aprovação Média (%)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="font-semibold divide-y divide-slate-100">
                  {financeiras.map((fin, idx) => (
                    <tr key={fin.id || idx} className="hover:bg-slate-50/50">
                      <td className="p-2 min-w-[200px]">
                        <Input
                          value={fin.nome || ""}
                          onChange={(e) => handleUpdateFinanceira(idx, "nome", e.target.value)}
                          className="h-8 text-xs font-bold text-navy bg-white"
                          placeholder="Nome da Financeira"
                        />
                      </td>
                      <td className="p-2 max-w-[120px]">
                        <Input
                          type="number"
                          step="0.01"
                          value={fin.taxa_juros_mes ?? ""}
                          onChange={(e) => handleUpdateFinanceira(idx, "taxa_juros_mes", Number(e.target.value))}
                          className="h-8 text-xs text-slate-700 bg-white"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2 max-w-[120px]">
                        <Input
                          type="number"
                          step="0.01"
                          value={fin.taxa_cet_mes ?? ""}
                          onChange={(e) => handleUpdateFinanceira(idx, "taxa_cet_mes", Number(e.target.value))}
                          className="h-8 text-xs text-[#2E44B8] font-bold bg-[#EBF0F6] border-blue-200"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2 max-w-[100px]">
                        <Input
                          type="number"
                          value={fin.prazo_maximo_meses ?? ""}
                          onChange={(e) => handleUpdateFinanceira(idx, "prazo_maximo_meses", Number(e.target.value))}
                          className="h-8 text-xs text-slate-700 bg-white"
                          placeholder="120"
                        />
                      </td>
                      <td className="p-2 max-w-[100px]">
                        <Input
                          type="number"
                          value={fin.taxa_aprovacao_media ?? ""}
                          onChange={(e) => handleUpdateFinanceira(idx, "taxa_aprovacao_media", Number(e.target.value))}
                          className="h-8 text-xs text-slate-700 bg-white"
                          placeholder="85"
                        />
                      </td>
                      <td className="p-2 max-w-[90px]">
                        <select
                          value={fin.ativo ? "true" : "false"}
                          onChange={(e) => handleUpdateFinanceira(idx, "ativo", e.target.value === "true")}
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteFinanceira(fin.id, idx)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {financeiras.length === 0 && !loadingFin && (
              <div className="py-12 text-center text-slate-400 text-xs space-y-4">
                <p>Nenhum banco ou financeira de crédito solar configurado na nuvem.</p>
                <div className="flex justify-center">
                  <Button
                    onClick={handlePopularBancosPadrao}
                    className="bg-[#2E44B8] hover:bg-[#1F3095] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 border-0 cursor-pointer"
                  >
                    <Landmark className="w-4 h-4" /> Restaurar 16 Bancos Padrão de Mercado 🏦
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="flex justify-end sticky bottom-4 z-10 pt-2">
            <Button 
              onClick={handleSalvarFinanceiras} 
              disabled={savingFin} 
              className="bg-sun hover:bg-sun-deep text-navy font-bold shadow-lg rounded-full px-8 py-5 text-sm transition-all border-0 cursor-pointer"
            >
              {savingFin ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações de Bancos
            </Button>
          </div>
        </>
      ) : activeTab === "preview" ? (
        /* ABA PREVIEW DO MOTOR DE CÁLCULO INTERATIVO */
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Coluna 1: Simulador Interativo Rápido */}
          <Card className="lg:col-span-1 p-5 border-0 shadow-md bg-white space-y-4">
            <div className="border-b pb-3 mb-2">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sun-deep" /> Laboratório do Motor
              </h3>

              <p className="text-xs text-muted-foreground mt-0.5">Altere os dados de simulação abaixo para ver as equações calcularem os resultados com seus parâmetros reais.</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Consumo Mensal de Teste (kWh)</Label>
                <Input 
                  type="number"
                  value={testeConsumo}
                  onChange={(e) => setTesteConsumo(Math.max(50, Number(e.target.value)))}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Tarifa de Energia (R$/kWh)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={testeTarifa}
                  onChange={(e) => setTesteTarifa(Math.max(0.1, Number(e.target.value)))}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Estado / Região de HSP</Label>
                <select
                  value={testeEstado}
                  onChange={(e) => setTesteEstado(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-800"
                >
                  <option value="SP">São Paulo (Sudeste)</option>
                  <option value="CE">Ceará (Nordeste)</option>
                  <option value="PA">Pará (Norte)</option>
                  <option value="MT">Mato Grosso (Centro-Oeste)</option>
                  <option value="RS">Rio Grande do Sul (Sul)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Categoria de Instalação</Label>
                <select
                  value={testeTipo}
                  onChange={(e) => setTesteTipo(e.target.value as TipoInstalacao)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none text-slate-800"
                >
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="rural">Rural / Agronegócio</option>
                </select>
              </div>
            </div>

            {/* Resultados Rápidos do Laboratório */}
            {geralData && (() => {
              const res = calcularProposta({
                consumo_kwh: testeConsumo,
                tarifa_kwh: testeTarifa,
                estado: testeEstado,
                tipo: testeTipo,
              }, geralData);
              return (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-semibold text-navy space-y-2.5 pt-3.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">📐 Dimensionamento:</div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>HSP ({testeEstado}):</span>
                    <span className="font-bold text-[#2E44B8]">{res.hsp} kWh/m²/dia</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Potência Requerida:</span>
                    <span className="font-bold text-[#2E44B8]">{res.kwp_sistema} kWp</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Qtd. Módulos ({res.potencia_modulo_w}W):</span>
                    <span className="font-bold text-[#2E44B8]">{res.qtd_modulos} painéis</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Geração Estimada:</span>
                    <span className="font-bold text-[#2E44B8]">{res.geracao_mensal_kwh} kWh/mês</span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">💰 Financeiro (Projeto):</div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Preço Sugerido:</span>
                    <span className="font-bold text-emerald-600">{BRL(res.preco_total)}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Margem Bruta:</span>
                    <span className="font-bold text-amber-600">{BRL(res.margem_bruta)} ({(res.margem_bruta_pct * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Lucro Líquido Real:</span>
                    <span className={`font-bold ${res.lucro_liquido_real >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {BRL(res.lucro_liquido_real)} ({(res.lucro_liquido_pct * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">⚡ Economia do Cliente:</div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Economia Real (ajustada):</span>
                    <span className="font-bold text-[#2E44B8]">{BRL(res.economia_ajustada_mensal)}/mês</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Redução na conta:</span>
                    <span className="font-bold text-[#2E44B8]">{res.reducao_percentual_real}%</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Payback Real Ajustado:</span>
                    <span className="font-bold text-[#2E44B8]">{res.payback_ajustado_meses} meses</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>TIR Anual (Solar):</span>
                    <span className="font-bold text-emerald-600">{res.tir_anual_pct}% a.a.</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span>VPL do Solar (TMA 10%):</span>
                    <span className="font-bold text-emerald-600">{BRL(res.vpl_brl)}</span>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Coluna 2 e 3: Fórmulas Matemáticas e Regras de Negócio */}
          <div className="lg:col-span-2 space-y-6">
            {geralData && (() => {
              const res = calcularProposta({
                consumo_kwh: testeConsumo,
                tarifa_kwh: testeTarifa,
                estado: testeEstado,
                tipo: testeTipo,
              }, geralData);

              return (
                <>
                  {/* Etapa 1 */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-sun text-navy text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">1</span>
                      Dimensionamento de Potência (kWp)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Determina a potência nominal ideal necessária com base no consumo do cliente, corrigida pelas perdas naturais da instalação:
                    </p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Eficiência (E) = 1 - Perdas do Sistema
                      </div>
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Potência Ideal (kWp) = (Consumo Mensal / 30) / (HSP × Eficiência)
                      </div>
                      
                      <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 space-y-1">
                        <div>• Perdas configuradas: <strong className="text-navy">{geralData.perdas_sistema * 100}%</strong> (Eficiência: {1 - geralData.perdas_sistema})</div>
                        <div>• HSP da Região ({res.regiao}): <strong className="text-navy">{res.hsp} kWh/m²/dia</strong></div>
                        <div className="flex items-center gap-1 mt-1 font-bold text-slate-700">
                          <span>Cálculo: (({testeConsumo} / 30) / ({res.hsp} × {1 - geralData.perdas_sistema})) = </span>
                          <span className="text-[#2E44B8]">{((testeConsumo / 30) / (res.hsp * (1 - geralData.perdas_sistema))).toFixed(2)} kWp ideal</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Etapa 2 */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-sun text-navy text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">2</span>
                      Cálculo de Módulos e Área Ocupada
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A potência ideal é convertida em quantidade física de módulos comerciais, arredondada para cima. A área necessária é calculada em cima desta quantidade:
                    </p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Módulos = ArredondarParaCima((Potência Ideal * 1000) / Potência do Módulo)
                      </div>
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Área de Instalação (m²) = Módulos × Área por Módulo
                      </div>
                      
                      <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 space-y-1">
                        <div>• Potência do Módulo cadastrada: <strong className="text-navy">{geralData.potencia_modulo_w} W</strong></div>
                        <div>• Área por Módulo cadastrada: <strong className="text-navy">{geralData.area_por_modulo_m2} m²</strong></div>
                        <div className="flex items-center gap-1 mt-1 font-bold text-slate-700">
                          <span>Cálculo de Área: {res.qtd_modulos} painéis × {geralData.area_por_modulo_m2}m² = </span>
                          <span className="text-[#2E44B8]">{res.area_necessaria_m2} m² de telhado</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Etapa 3 */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-sun text-navy text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
                      Preço de Venda Comercial
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O preço total sugerido da proposta é o produto do tamanho do sistema (kWp) pelo Preço de Referência do Wp comercial correspondente da categoria configurada:
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Preço Total (R$) = kWp do Sistema × 1000 × Preço Ref Wp
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 space-y-1">
                        <div>• Preço de Referência para {testeTipo} ({res.kwp_sistema} kWp): <strong className="text-navy">R$ {res.preco_por_wp}/Wp</strong></div>
                        <div className="flex items-center gap-1 mt-1 font-bold text-slate-700 flex-wrap">
                          <span>Cálculo: {res.kwp_sistema} kWp × 1000 × R$ {res.preco_por_wp} = </span>
                          <span className="text-emerald-600 font-bold">{BRL(res.preco_total)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Etapa 4 — Margem Bruta (custos diretos) */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-sun text-navy text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">4</span>
                      Decomposição de Custos Diretos → Margem Bruta
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Custos diretamente ligados à execução do projeto. A diferença entre o preço de venda e esses custos é a <strong>Margem Bruta</strong> — ainda não o lucro final.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px] text-slate-600">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Equipamentos ({((geralData.custo_equipamentos_pct ?? 0) * 100).toFixed(0)}%)</span>
                          <strong className="text-navy text-xs">{BRL(res.custo_equipamentos)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Instalação ({((geralData.custo_instalacao_pct ?? 0) * 100).toFixed(0)}%)</span>
                          <strong className="text-navy text-xs">{BRL(res.custo_instalacao)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Frete ({((geralData.custo_frete_pct ?? 0) * 100).toFixed(0)}%)</span>
                          <strong className="text-navy text-xs">{BRL(res.custo_frete)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Impostos Compra ({((geralData.custo_impostos_compra_pct ?? geralData.custo_impostos_pct ?? 0) * 100).toFixed(0)}%)</span>
                          <strong className="text-navy text-xs">{BRL(res.custo_impostos_compra)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Comissão Parceiro ({((geralData.custo_comissao_pct ?? 0) * 100).toFixed(0)}%)</span>
                          <strong className="text-navy text-xs">{BRL(res.custo_comissao)}</strong>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <span className="block text-amber-600 font-bold uppercase text-[9px]">▶ Margem Bruta ({(res.margem_bruta_pct * 100).toFixed(1)}%)</span>
                          <strong className="text-amber-700 text-xs">{BRL(res.margem_bruta)}</strong>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Etapa 5 — Lucro Líquido Real */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3 border-l-4 border-l-emerald-400">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-emerald-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">5</span>
                      Lucro Líquido Real (Net Profit) — Exclusivo Admin
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Deduz da Margem Bruta os <strong>custos operacionais reais da ESOL</strong>: tributação corporativa, marketing (CAC), overhead (SG&A), engenharia fixa e provisão de garantia.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px] text-slate-600 mb-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Tributação ESOL ({((geralData.tributacao_empresa_pct ?? 0.10) * 100).toFixed(0)}%)</span>
                          <strong className="text-rose-600 text-xs">{BRL(res.custo_tributacao_empresa)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">CAC / Marketing ({((geralData.custo_marketing_pct ?? 0.03) * 100).toFixed(0)}%)</span>
                          <strong className="text-rose-600 text-xs">{BRL(res.custo_marketing)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">SG&A / Overhead ({((geralData.custo_overhead_pct ?? 0.05) * 100).toFixed(0)}%)</span>
                          <strong className="text-rose-600 text-xs">{BRL(res.custo_overhead)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Engenharia Fixa (ART+Projeto)</span>
                          <strong className="text-rose-600 text-xs">{BRL(res.custo_engenharia_fixo)}</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Garantia / Pós-Venda ({((geralData.custo_garantia_pct ?? 0.008) * 100).toFixed(1)}%)</span>
                          <strong className="text-rose-600 text-xs">{BRL(res.custo_garantia)}</strong>
                        </div>
                        <div className={`p-2 rounded-lg border ${res.lucro_liquido_real >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                          <span className={`block font-bold uppercase text-[9px] ${res.lucro_liquido_real >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            ★ LUCRO LÍQUIDO REAL ({(res.lucro_liquido_pct * 100).toFixed(1)}%)
                          </span>
                          <strong className={`text-sm ${res.lucro_liquido_real >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {BRL(res.lucro_liquido_real)}
                          </strong>
                        </div>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                        Lucro Líquido = Margem Bruta − Trib. Empresa − CAC − SG&A − Engenharia − Garantia
                      </div>
                    </div>
                  </Card>

                  {/* Etapa 6 — Economia Ajustada ao Cliente */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3 border-l-4 border-l-blue-400">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-[#2E44B8] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">6</span>
                      Economia Real do Cliente (Ajustada — Para a Proposta)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O cliente solar <strong>nunca zera a conta de luz</strong>. A economia é limitada pelo faturamento de consumo ativo que excede a taxa mínima de disponibilidade. O pedágio do Fio B da Lei 14.300/2022 também incide sobre a energia injetada compensada:
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Geração Total Gerada</span>
                          <strong className="text-slate-700 text-xs">{BRL(res.economia_mensal)}/mês</strong>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <span className="block text-amber-500 font-semibold uppercase text-[9px]">Fatura Mínima Obrigatória</span>
                          <strong className="text-amber-700 text-xs">{BRL(res.custo_disponibilidade_mensal)}/mês</strong>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                          <span className="block text-red-400 font-semibold uppercase text-[9px]">(-) Pedágio Fio B {((geralData.percentual_fio_b ?? 0.60) * 100).toFixed(0)}%</span>
                          <strong className="text-red-600 text-xs">−{BRL(res.ajuste_fio_b_mensal)}/mês</strong>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 col-span-3">
                          <span className="block text-[#2E44B8] font-bold uppercase text-[9px]">★ ECONOMIA REAL LÍQUIDA ({res.reducao_percentual_real}% de redução)</span>
                          <strong className="text-[#2E44B8] text-sm">{BRL(res.economia_ajustada_mensal)}/mês</strong>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 space-y-1">
                        <div>• Payback Bruto da Geração: <strong className="text-navy">{res.payback_meses} meses</strong></div>
                        <div>• Payback Real Ajustado ao Cliente: <strong className="text-[#2E44B8]">{res.payback_ajustado_meses} meses</strong></div>
                        <div>• Economia em 25 anos (deduzindo 0.5% a.a. O&M e troca de inversor no 12º ano): <strong className="text-emerald-600">{BRL(res.economia_ajustada_25_anos)}</strong></div>
                        <div className="font-semibold text-slate-700 text-[10px] mt-1.5 bg-slate-100/60 p-2 rounded-lg space-y-0.5">
                          <div className="text-[#2E44B8]">• Taxa Interna de Retorno (TIR) Anual: <strong className="font-bold text-emerald-600">{res.tir_anual_pct}% a.a.</strong></div>
                          <div className="text-[#2E44B8]">• VPL do Investimento (TMA 10% a.a.): <strong className="font-bold text-emerald-600">{BRL(res.vpl_brl)}</strong></div>
                          <div className="text-slate-400 font-normal text-[9px] mt-0.5">• A TIR anual e o VPL demonstram a atratividade do solar frente a investimentos de renda fixa (como CDI).</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Etapa 7 — PMT Financiamento */}
                  <Card className="p-5 border-0 shadow-md bg-white space-y-3">
                    <h4 className="font-bold text-navy text-sm border-b pb-2 flex items-center gap-1">
                      <span className="bg-sun text-navy text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">7</span>
                      Fórmula de Cálculo de Financiamento (PMT — Tabela Price)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O parcelamento utiliza a fórmula de amortização Price (Juros Compostos) com base na taxa de Custo Efetivo Total (CET) mensal cadastrada na aba de Bancos &amp; Taxas:
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Taxa Decimal (i) = Taxa CET % / 100
                      </div>
                      <div className="font-mono text-xs text-[#2E44B8] font-bold">
                        Parcela (PMT) = (Preço Total × i × (1 + i)^n) / ((1 + i)^n - 1)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 space-y-1">
                        <div>• Exemplo com prazo (n) de <strong className="text-navy">60 meses</strong> e CET de <strong className="text-navy">1.39% a.m.</strong> (Solfácil):</div>
                        <div className="flex items-center gap-1 mt-1 font-bold text-slate-700 flex-wrap">
                          <span>PMT = ({BRL(res.preco_total)} × 0.0139 × (1.0139)^60) / ((1.0139)^60 - 1) = </span>
                          {(() => {
                            const rate = 1.39 / 100;
                            const n = 60;
                            const pmt = (res.preco_total * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
                            return <span className="text-[#2E44B8]">{BRL(Math.round(pmt))}/mês</span>;
                          })()}
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      ) : (
        <ImportadorKitsSolar />
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PREMIUM DE IMPORTAÇÃO DE KITS
// ==========================================

const DISTRIBUIDORAS_API = [
  {
    id: "aldo",
    nome: "Aldo Solar",
    slogan: "Líder histórica em distribuição de geradores fotovoltaicos Tier 1",
    cd: "Maringá - PR (Centro de Distribuição Principal de 40.000m²)",
    site: "www.aldo.com.br",
    contato: "0800 400 4222",
    email: "comercial@aldo.com.br",
    tecnologias: "Inversores Growatt, Placas Jinko Solar & Canadian Solar",
    status: "Pronto para Conexão",
    color: "from-blue-600 to-indigo-700"
  },
  {
    id: "souenergy",
    nome: "Sou Energy",
    slogan: "A maior distribuidora de geradores solares do Norte e Nordeste",
    cd: "Eusébio - CE (Pólo Industrial e CD Tecnológico)",
    site: "www.souenergy.com.br",
    contato: "(85) 3052-2200",
    email: "comercial@souenergy.com.br",
    tecnologias: "Inversores Deye, Placas Risen Solar & Jinko Solar",
    status: "Pronto para Conexão",
    color: "from-emerald-600 to-teal-700"
  },
  {
    id: "intelbras",
    nome: "Intelbras Solar",
    slogan: "Segurança corporativa e tecnologia brasileira em energia solar",
    cd: "São José - SC (Matriz e Centro Logístico Sul)",
    site: "www.intelbras.com.br",
    contato: "(48) 2106-0006",
    email: "suporte.solar@intelbras.com.br",
    tecnologias: "Sistemas On-Grid Intelbras, Inversores e Módulos Próprios",
    status: "Pronto para Conexão",
    color: "from-green-600 to-emerald-700"
  },
  {
    id: "phb",
    nome: "PHB Solar",
    slogan: "Pioneirismo nacional e laboratório próprio de certificação",
    cd: "São Paulo - SP (CD Central Lapa)",
    site: "www.phbsolar.com.br",
    contato: "(11) 3054-5660",
    email: "solar@phb.com.br",
    tecnologias: "Inversores PHB Solar, Estruturas de Fixação Robustas",
    status: "Pronto para Conexão",
    color: "from-amber-600 to-orange-700"
  },
  {
    id: "renovigi",
    nome: "Renovigi Energia Solar",
    slogan: "Excelente suporte pós-vendas e capilaridade nacional de instaladores",
    cd: "Chapecó - SC (CD Sul) & Itajaí - SC (CD Portuário)",
    site: "www.renovigi.com.br",
    contato: "(49) 3330-0100",
    email: "comercial@renovigi.com.br",
    tecnologias: "Geradores Renovigi, Inversores Solis / Renovigi",
    status: "Pronto para Conexão",
    color: "from-indigo-600 to-purple-700"
  },
  {
    id: "golden",
    nome: "Golden Distribuidora",
    slogan: "Distribuição corporativa de TI e Solar de alta capilaridade",
    cd: "Guarulhos - SP (CD Rápido Grande SP)",
    site: "www.goldendistribuidora.com.br",
    contato: "(11) 2174-8800",
    email: "comercial.solar@goldendistribuidora.com.br",
    tecnologias: "Inversores Solis & Sofar Solar, Módulos Trina Solar",
    status: "Pronto para Conexão",
    color: "from-rose-600 to-red-700"
  },
  {
    id: "wdc",
    nome: "WDC Networks",
    slogan: "Equipamentos premium as-a-service e distribuição inteligente",
    cd: "Extrema - MG (CD Principal) & Ilhéus - BA (Fábrica)",
    site: "www.wdcnet.com.br",
    contato: "(11) 3035-3777",
    email: "solar@wdcnet.com.br",
    tecnologias: "Microinversores APsystems, Inversores Fronius & SMA",
    status: "Pronto para Conexão",
    color: "from-cyan-600 to-blue-700"
  },
  {
    id: "fortlev",
    nome: "Fortlev Solar",
    slogan: "Força da maior fabricante de reservatórios e conexões de água do Brasil",
    cd: "Serra - ES (CD Principal)",
    site: "www.fortlevsolar.com.br",
    contato: "(27) 2121-6700",
    email: "contato.solar@fortlev.com.br",
    tecnologias: "Inversores Chint / Solis, Módulos Yingli & Jinko Solar",
    status: "Pronto para Conexão",
    color: "from-violet-600 to-indigo-700"
  }
];

function gerarKitsPorFornecedor(fornecedor: string): any[] {
  const kits: any[] = [];
  
  const config = {
    "Aldo Solar": { inv: "Growatt MIN", mod: "Jinko Solar", modW: 550, ef: 21.8, tipoInv: "String On-Grid" },
    "Sou Energy": { inv: "Deye SUN-G", mod: "Risen", modW: 550, ef: 21.5, tipoInv: "String On-Grid" },
    "Intelbras Solar": { inv: "Intelbras EGT", mod: "Intelbras", modW: 545, ef: 21.2, tipoInv: "String On-Grid" },
    "PHB Solar": { inv: "PHB On-Grid", mod: "Jinko Solar", modW: 550, ef: 21.8, tipoInv: "String On-Grid" },
    "Renovigi Energia Solar": { inv: "Renovigi RENO", mod: "Renovigi", modW: 550, ef: 21.5, tipoInv: "String On-Grid" },
    "Golden Distribuidora": { inv: "Solis Triple", mod: "Trina Solar", modW: 555, ef: 22.0, tipoInv: "String On-Grid" },
    "WDC Networks": { inv: "APsystems DS3D / Fronius", mod: "Canadian Solar", modW: 550, ef: 21.8, tipoInv: "Microinversor / String" },
    "Fortlev Solar": { inv: "Fortlev (Chint)", mod: "Yingli Solar", modW: 540, ef: 21.0, tipoInv: "String On-Grid" },
  }[fornecedor] || { inv: "Growatt", mod: "Canadian Solar", modW: 550, ef: 21.8, tipoInv: "String On-Grid" };

  const potencias = [2.2, 4.4, 6.6, 9.9, 12.1, 16.5, 22.0, 33.0, 55.0, 82.5];
  
  potencias.forEach((pot, index) => {
    const totalW = pot * 1000;
    const modQtd = Math.round(totalW / config.modW);
    const precoWp = index < 2 ? 1.6 : index < 5 ? 1.4 : index < 8 ? 1.25 : 1.15;
    const preco = Math.round(totalW * precoWp);
    
    let faixa = "residencial_pequeno";
    if (pot > 4.5 && pot <= 12) faixa = "residencial_grande";
    else if (pot > 12 && pot <= 30) faixa = "comercial_pequeno";
    else if (pot > 30 && pot <= 80) faixa = "comercial_grande";
    else if (pot > 80) faixa = "industrial";
    
    if (index === 3 || index === 6) {
      faixa = "rural";
    }

    kits.push({
      codigo: `KIT-${fornecedor.substring(0, 3).toUpperCase()}-${pot.toFixed(1).replace(".", "")}-${index}`,
      faixa,
      nome: `Kit Solar ${fornecedor} On-Grid ${pot.toFixed(2)} kWp (${modQtd}x Placas ${config.mod} ${config.modW}W)`,
      potencia_kwp: pot,
      quantidade_modulos: modQtd,
      fabricante_modulos: config.mod,
      potencia_modulo_w: config.modW,
      tecnologia_modulo: "Monocristalino N-Type TOPCon",
      eficiencia_modulo: config.ef,
      inversor: `${config.inv} ${pot < 8 ? "3K" : pot < 20 ? "10K" : "30K"}`,
      tipo_inversor: config.tipoInv,
      garantia_modulos_anos: 25,
      garantia_inversor_anos: 10,
      preco,
      destaque: index === 1 || index === 4,
      consumo_kwh_min: Math.round((pot * 1000 * 4.5 * 30 * 0.82) / 1000 * 0.8),
      consumo_kwh_max: Math.round((pot * 1000 * 4.5 * 30 * 0.82) / 1000 * 1.2),
      ativo: true,
      fornecedor,
      url_fornecedor: `https://${config.mod.toLowerCase().replace(" ", "")}.com.br`
    });
  });

  return kits;
}

function ImportadorKitsSolar() {
  const [subTab, setSubTab] = useState<"api" | "csv">("api");
  const [syncingDistribuidora, setSyncingDistribuidora] = useState<string | null>(null);
  
  // CSV Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState({
    nome: "0",
    potencia_kwp: "1",
    quantidade_modulos: "2",
    fabricante_modulos: "3",
    inversor: "4",
    preco: "5",
    faixa: "6"
  });
  const [fileLoaded, setFileLoaded] = useState(false);
  const [savingCsv, setSavingCsv] = useState(false);

  // API Status de Conexão
  const [apiConexoes, setApiConexoes] = useState<Record<string, "conectado" | "offline" | "pendente">>(() => {
    const saved = localStorage.getItem("esol_api_conexoes");
    return saved ? JSON.parse(saved) : {
      aldo: "pendente",
      souenergy: "pendente",
      intelbras: "pendente",
      phb: "pendente",
      renovigi: "pendente",
      golden: "pendente",
      wdc: "pendente",
      fortlev: "pendente",
    };
  });

  const updateApiStatus = (id: string, status: "conectado" | "offline" | "pendente") => {
    const updated = { ...apiConexoes, [id]: status };
    setApiConexoes(updated);
    localStorage.setItem("esol_api_conexoes", JSON.stringify(updated));
  };

  // Configurações das distribuidoras vindas do banco
  const [configsDistribuidoras, setConfigsDistribuidoras] = useState<any[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);

  // Estados do modal de configuração
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedDistributorForConfig, setSelectedDistributorForConfig] = useState<any | null>(null);
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [ambienteInput, setAmbienteInput] = useState<"sandbox" | "production">("sandbox");
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Carrega configurações ao montar o componente
  const carregarConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      const data = await obterConfigsDistribuidorasServerFn();
      setConfigsDistribuidoras(data || []);
      
      // Atualiza o estado de conexões com base nas credenciais salvas
      const updatedConexoes = { ...apiConexoes };
      (data || []).forEach((c: any) => {
        if (c.client_id) {
          updatedConexoes[c.id] = "conectado";
        } else {
          updatedConexoes[c.id] = "pendente";
        }
      });
      setApiConexoes(updatedConexoes);
      localStorage.setItem("esol_api_conexoes", JSON.stringify(updatedConexoes));
    } catch (err) {
      console.error("Erro ao carregar configs de distribuidoras:", err);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  useEffect(() => {
    carregarConfigs();
  }, []);

  const abrirModalConfig = (dist: any) => {
    const activeConfig = configsDistribuidoras.find(c => c.id === dist.id);
    setSelectedDistributorForConfig(dist);
    setClientIdInput(activeConfig?.client_id || "");
    setClientSecretInput(""); // Não exibe a chave gravada por segurança
    setAmbienteInput((activeConfig?.ambiente || "sandbox") as "sandbox" | "production");
    setIsConfigModalOpen(true);
  };

  const salvarConfiguracao = async () => {
    if (!selectedDistributorForConfig) return;
    setIsSavingConfig(true);
    const toastId = toast.loading(`Validando conexão com ${selectedDistributorForConfig.nome}...`);

    try {
      const res = await salvarConfigDistribuidoraServerFn({
        data: {
          distribuidoraId: selectedDistributorForConfig.id,
          clientId: clientIdInput || null,
          clientSecret: clientSecretInput || null,
          ambiente: ambienteInput
        }
      });

      if (!res.success) {
        toast.error(res.message, { id: toastId });
        return;
      }

      toast.success("Credenciais validadas e salvas com sucesso!", { id: toastId });
      setIsConfigModalOpen(false);
      await carregarConfigs();
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`, { id: toastId });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Handler de upload CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) {
        toast.error("O arquivo está vazio.");
        return;
      }

      const firstLine = lines[0];
      const sep = firstLine.includes(";") ? ";" : ",";
      
      const headers = firstLine.split(sep).map(h => h.trim().replace(/^["']|["']$/g, ""));
      const rows = lines.slice(1).map(line => {
        return line.split(sep).map(val => val.trim().replace(/^["']|["']$/g, ""));
      });

      setCsvHeaders(headers);
      setCsvRows(rows);
      setFileLoaded(true);
      toast.success(`${rows.length} linhas carregadas para mapeamento.`);

      // Mapeamento automático inteligente
      const autoMap: any = { ...mapping };
      headers.forEach((h, index) => {
        const lower = h.toLowerCase();
        const idxStr = String(index);
        if (lower.includes("nome") || lower.includes("descri")) autoMap.nome = idxStr;
        else if (lower.includes("potencia") || lower.includes("kwp")) autoMap.potencia_kwp = idxStr;
        else if (lower.includes("modulo") || lower.includes("quantidade") || lower.includes("qtd")) autoMap.quantidade_modulos = idxStr;
        else if (lower.includes("fabricante") || lower.includes("marca")) autoMap.fabricante_modulos = idxStr;
        else if (lower.includes("inversor")) autoMap.inversor = idxStr;
        else if (lower.includes("preco") || lower.includes("valor") || lower.includes("custo")) autoMap.preco = idxStr;
        else if (lower.includes("faixa") || lower.includes("tipo")) autoMap.faixa = idxStr;
      });
      setMapping(autoMap);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Processamento de Importação CSV
  const processCsvImport = async () => {
    if (csvRows.length === 0) return;
    setSavingCsv(true);

    const parseNumber = (val: string) => {
      if (!val) return 0;
      const clean = val.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
      return Number(clean) || 0;
    };

    const determineFaixa = (pot: number, customFaixa?: string): string => {
      if (customFaixa) {
        const clean = customFaixa.toLowerCase().replace(/[\s_]/g, "");
        if (clean.includes("residencialpequeno") || clean.includes("respeq")) return "residencial_pequeno";
        if (clean.includes("residencialgrande") || clean.includes("resgra")) return "residencial_grande";
        if (clean.includes("comercialpequeno") || clean.includes("compeq")) return "comercial_pequeno";
        if (clean.includes("comercialgrande") || clean.includes("comgra")) return "comercial_grande";
        if (clean.includes("industrial")) return "industrial";
        if (clean.includes("rural") || clean.includes("agro")) return "rural";
      }
      
      if (pot < 4) return "residencial_pequeno";
      if (pot < 10) return "residencial_grande";
      if (pot < 30) return "comercial_pequeno";
      if (pot < 80) return "comercial_grande";
      return "industrial";
    };

    try {
      const listToInsert = csvRows.map(row => {
        const nome = row[Number(mapping.nome)] || "Kit Importado";
        const potencia_kwp = parseNumber(row[Number(mapping.potencia_kwp)]);
        const quantidade_modulos = Math.max(1, parseInt(row[Number(mapping.quantidade_modulos)]) || 4);
        const fabricante_modulos = row[Number(mapping.fabricante_modulos)] || "Fabricante Importado";
        const inversor = row[Number(mapping.inversor)] || "Inversor Importado";
        const preco = parseNumber(row[Number(mapping.preco)]);
        const customFaixa = row[Number(mapping.faixa)];
        
        const faixa = determineFaixa(potencia_kwp, customFaixa);

        const cat = classificarCategoriaPorNome(nome);

        return {
          faixa,
          nome,
          potencia_kwp,
          quantidade_modulos,
          fabricante_modulos,
          inversor,
          preco,
          potencia_modulo_w: 550,
          tecnologia_modulo: "Monocristalino TOPCon",
          tipo_inversor: "String On-Grid",
          garantia_modulos_anos: 25,
          garantia_inversor_anos: 10,
          ativo: true,
          destaque: false,
          fornecedor: "Importação CSV",
          categoria: cat
        };
      }).filter(k => k.preco > 0 && k.potencia_kwp > 0);

      if (listToInsert.length === 0) {
        toast.error("Nenhum kit válido com preço e potência maior que zero foi detectado.");
        setSavingCsv(false);
        return;
      }

      // Tenta gravar no Supabase
      const { error } = await supabase.from("kits_produtos").insert(listToInsert as any);
      if (error) {
        // Fallback localStorage caso o banco local/Supabase remoto não esteja configurado
        console.warn("Falha no banco, gravando no localStorage...", error);
        const localKits = JSON.parse(localStorage.getItem("esol_kits_custom") || "[]");
        localStorage.setItem("esol_kits_custom", JSON.stringify([...localKits, ...listToInsert]));
      }

      toast.success(`Sucesso: ${listToInsert.length} kits solares importados via CSV!`);
      setFileLoaded(false);
      setCsvRows([]);
      setCsvHeaders([]);
      
    } catch (e: any) {
      toast.error("Erro na importação: " + e.message);
    } finally {
      setSavingCsv(false);
    }
  };

  // Sincronização via API real do servidor
  const sincronizarDistribuidora = async (distribuidora: typeof DISTRIBUIDORAS_API[0]) => {
    setSyncingDistribuidora(distribuidora.id);
    const toastId = toast.loading(`Sincronizando catálogo da ${distribuidora.nome} via API...`);
    
    try {
      const res = await sincronizarKitsDistribuidoraServerFn({
        data: { distribuidoraId: distribuidora.id }
      });
      
      if (!res.success) {
        throw new Error(res.message);
      }
      
      updateApiStatus(distribuidora.id, "conectado");
      toast.success(`${res.count} kits fotovoltaicos da ${distribuidora.nome} sincronizados com sucesso!`, { id: toastId });
    } catch (err: any) {
      updateApiStatus(distribuidora.id, "offline");
      toast.error(`Falha ao sincronizar: ${err.message}`, { id: toastId });
    } finally {
      setSyncingDistribuidora(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Informações */}
      <div className="bg-gradient-to-r from-navy to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
          <Boxes className="w-64 h-64 rotate-12" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <BadgeCheck className="w-8 h-8 text-sun-deep" />
          <h2 className="text-2xl font-black tracking-tight">Painel de Integração & Carga de Kits Solares</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Escolha o método mais adequado para atualizar os kits solares B2B do motor de propostas. Conecte APIs diretas com os portais de compras das principais distribuidoras brasileiras ou importe planilhas de preços customizadas em segundos.
          </p>
          <div className="pt-2 flex gap-2 flex-wrap">
            <Link to="/app/kits">
              <Button size="sm" className="bg-sun hover:bg-sun-deep text-navy font-bold text-xs rounded-xl shadow-md border-0">
                ◀ Voltar para Listagem de Kits
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-Abas de Seleção de Método */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab("api")}
          className={`pb-3 px-5 font-bold text-xs tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${subTab === "api" ? "border-navy text-navy" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <Globe className="w-4 h-4" /> Integração por API ({DISTRIBUIDORAS_API.length} Distribuidoras)
        </button>
        <button
          onClick={() => setSubTab("csv")}
          className={`pb-3 px-5 font-bold text-xs tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${subTab === "csv" ? "border-navy text-navy" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Importação de Planilha CSV
        </button>
      </div>

      {subTab === "api" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-navy text-sm">Distribuidoras Solares Homologadas no Brasil</h3>
              <p className="text-xs text-slate-500">Conecte APIs para sincronizar preços e componentes em tempo real.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {DISTRIBUIDORAS_API.map((dist) => {
              const isSyncing = syncingDistribuidora === dist.id;
              const activeConfig = configsDistribuidoras.find(c => c.id === dist.id);
              const isConfigured = !!activeConfig?.client_id;
              const isProd = activeConfig?.ambiente === "production";

              return (
                <Card 
                  key={dist.id} 
                  className="overflow-hidden border border-slate-200/60 shadow-md flex flex-col justify-between bg-white rounded-3xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Distribuidor Solar B2B</span>
                        <h4 className="text-lg font-black text-navy">{dist.nome}</h4>
                      </div>
                      {isConfigured ? (
                        <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm bg-emerald-50 border-emerald-200 text-emerald-700">
                          ● API Configurada ({isProd ? "Produção" : "Sandbox"})
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm bg-amber-50 border-amber-200 text-amber-600">
                          ● Pronto para Conexão
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">"{dist.slogan}"</p>

                    <div className="text-[11px] text-slate-700 space-y-2 border-t pt-3">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div><strong className="text-slate-900 font-bold block">Centro de Distribuição:</strong>{dist.cd}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div><strong className="text-slate-900 font-bold">Tecnologias:</strong> {dist.tecnologias}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div><strong className="text-slate-900 font-bold">Contato Comercial:</strong> {dist.contato}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div><strong className="text-slate-900 font-bold">E-mail B2B:</strong> {dist.email}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <strong className="text-slate-900 font-bold">Portal Web:</strong>{" "}
                          <a href={`https://${dist.site}`} target="_blank" rel="noreferrer" className="text-[#2E44B8] hover:underline font-semibold">
                            {dist.site}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => abrirModalConfig(dist)}
                      className="border-slate-200 text-slate-700 font-extrabold text-xs h-9 px-3 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      Configurar API
                    </Button>
                    <Button
                      onClick={() => sincronizarDistribuidora(dist)}
                      disabled={isSyncing}
                      className="bg-navy hover:bg-navy-deep text-white font-extrabold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 border-0 shadow-sm transition-all cursor-pointer"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          {isConfigured ? "Sincronizar" : "Sincronizar (Fallback)"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 border border-slate-200/60 shadow-md space-y-4 bg-white rounded-3xl">
            <h3 className="font-black text-navy text-lg flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600 w-5 h-5" /> Importar Planilha de Preços (CSV)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Exportou uma planilha de kits do portal da Aldo, Sou Energy ou de outro distribuidor? 
              Você pode fazer o upload do arquivo CSV diretamente para o sistema mapear e carregar.
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <div className="text-sm font-extrabold text-navy">Arraste ou clique para selecionar o arquivo CSV</div>
              <div className="text-[11px] text-muted-foreground mt-1.5">UTF-8 CSV (separado por vírgula ou ponto-e-vírgula)</div>
            </div>

            {fileLoaded && csvHeaders.length > 0 && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fade-in">
                <div className="text-xs font-black text-navy uppercase tracking-wider">Mapeamento de Colunas da Planilha</div>
                
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500">Nome / Descrição</Label>
                    <select
                      value={mapping.nome}
                      onChange={(e) => setMapping(p => ({ ...p, nome: e.target.value }))}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-xs outline-none shadow-sm focus:border-navy"
                    >
                      {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500">Potência total (kWp)</Label>
                    <select
                      value={mapping.potencia_kwp}
                      onChange={(e) => setMapping(p => ({ ...p, potencia_kwp: e.target.value }))}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-xs outline-none shadow-sm focus:border-navy"
                    >
                      {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500">Quantidade Módulos</Label>
                    <select
                      value={mapping.quantidade_modulos}
                      onChange={(e) => setMapping(p => ({ ...p, quantidade_modulos: e.target.value }))}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-xs outline-none shadow-sm focus:border-navy"
                    >
                      {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500">Marca dos Painéis</Label>
                    <select
                      value={mapping.fabricante_modulos}
                      onChange={(e) => setMapping(p => ({ ...p, fabricante_modulos: e.target.value }))}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-xs outline-none shadow-sm focus:border-navy"
                    >
                      {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500">Inversor</Label>
                    <select
                      value={mapping.inversor}
                      onChange={(e) => setMapping(p => ({ ...p, inversor: e.target.value }))}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-xs outline-none shadow-sm focus:border-navy"
                    >
                      {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500">Preço do Kit (R$)</Label>
                    <select
                      value={mapping.preco}
                      onChange={(e) => setMapping(p => ({ ...p, preco: e.target.value }))}
                      className="w-full bg-white border rounded-xl px-3 py-2 font-semibold text-xs outline-none shadow-sm focus:border-navy"
                    >
                      {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t">
                  <Button variant="ghost" size="sm" onClick={() => setFileLoaded(false)} className="rounded-xl font-bold text-xs h-9 px-4">
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={processCsvImport} 
                    disabled={savingCsv} 
                    className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-extrabold text-xs h-9 px-5 rounded-xl border-0 shadow-sm"
                  >
                    {savingCsv ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Processando...
                      </>
                    ) : (
                      "Confirmar e Importar Kits"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÃO DE CREDENCIAIS DA API DA DISTRIBUIDORA */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-200">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-black text-navy flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#2E44B8]" />
              Configurar API: {selectedDistributorForConfig?.nome}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Insira as credenciais comerciais de integração webservice B2B fornecidas pela distribuidora.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700">Ambiente de Conexão</Label>
              <select
                value={ambienteInput}
                onChange={(e) => setAmbienteInput(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs outline-none shadow-sm focus:border-navy"
              >
                <option value="sandbox">Sandbox / Homologação (Ambiente de Testes)</option>
                <option value="production">Produção / Vendas (Ambiente Real)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700">Client ID / Usuário da API</Label>
              <Input
                type="text"
                placeholder="Ex: aldo_integrador_123 ou w_user"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="rounded-xl border-slate-200 h-10 px-3.5 text-xs shadow-sm font-semibold focus-visible:ring-navy"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700">Client Secret / Token / API Key</Label>
              <Input
                type="password"
                placeholder={configsDistribuidoras.some(c => c.id === selectedDistributorForConfig?.id && c.client_id) ? "•••••••••••••••• (Preencha para atualizar)" : "Insira a chave ou senha da API"}
                value={clientSecretInput}
                onChange={(e) => setClientSecretInput(e.target.value)}
                className="rounded-xl border-slate-200 h-10 px-3.5 text-xs shadow-sm font-semibold focus-visible:ring-navy"
              />
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
              ⚠️ <strong>Dica de Produção:</strong> Certifique-se de que sua conta comercial possui a funcionalidade de WebService / API habilitada junto à distribuidora solar.
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigModalOpen(false)}
              className="rounded-xl font-bold text-xs h-9 px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={salvarConfiguracao}
              disabled={isSavingConfig}
              className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-extrabold text-xs h-9 px-5 rounded-xl border-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isSavingConfig ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Salvando...
                </>
              ) : (
                "Testar & Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
