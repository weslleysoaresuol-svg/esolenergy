import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Loader2, Plus, Trash2, Landmark, HelpCircle, ArrowRight } from "lucide-react";
import { calcularProposta, BRL, type TipoInstalacao } from "@/lib/proposta-calc";

export const Route = createFileRoute("/app/parametros")({
  head: () => ({ meta: [{ title: "Tarifas & Parâmetros — ESOL Energy" }] }),
  component: Parametros,
});

const SECTIONS = [
  { 
    title: "☀️ HSP por Macrorregião (kWh/m²/dia) — Fallback quando UF não disponível", 
    hint: "O motor usa automaticamente HSP específico por Estado (Atlas INPE). Esses valores são usados apenas como fallback para estados não mapeados.",
    fields: [
      ["hsp_norte", "Região Norte (fallback)"], 
      ["hsp_nordeste", "Região Nordeste (fallback)"], 
      ["hsp_centro_oeste", "Região Centro-Oeste (fallback)"],
      ["hsp_sudeste", "Região Sudeste (fallback)"], 
      ["hsp_sul", "Região Sul (fallback)"],
    ]
  },
  { 
    title: "💰 Preços de Referência de Venda (R$/Wp)", 
    hint: "Preço de venda final ao cliente por Watt-pico instalado. Benchmark de mercado 2025/2026 — residencial R$3.6-R$4.8/Wp, comercial R$2.8-R$3.8/Wp.",
    fields: [
      ["preco_wp_residencial_pequeno", "Residencial até 5 kWp (R$/Wp)"], 
      ["preco_wp_residencial_grande", "Residencial 5+ kWp (R$/Wp)"],
      ["preco_wp_comercial_pequeno", "Comercial até 30 kWp (R$/Wp)"], 
      ["preco_wp_comercial_grande", "Comercial 30+ kWp (R$/Wp)"],
      ["preco_wp_industrial", "Industrial / Grande Porte (R$/Wp)"],
    ]
  },
  { 
    title: "⚙️ Parâmetros Técnicos Gerais", 
    hint: "Base do motor de dimensionamento. Perdas típicas: 15-25% (temperatura, cabeamento, sujeira). Inflação energética histórica BR: 7-10%/ano.",
    fields: [
      ["tarifa_kwh_default", "Tarifa Média Nacional de Referência (R$/kWh com impostos)"], 
      ["perdas_sistema", "Fator de Perdas do Sistema (ex: 0.18 = 18%)"],
      ["inflacao_energetica", "Inflação Energética Anual (ex: 0.08 = 8% a.a.)"], 
      ["vida_util_anos", "Vida Útil do Sistema (anos, padrão: 25)"],
      ["potencia_modulo_w", "Potência do Módulo (W, ex: 555)"], 
      ["area_por_modulo_m2", "Área por Módulo (m², ex: 2.7)"],
    ]
  },
  { 
    title: "📦 Custos de Aquisição e Serviço (% do Preço de Venda)", 
    hint: "Custos diretos do projeto: equipamentos (~45-52%), instalação (~12-15%), frete (~3-4%), impostos de compra/ICMS-ST (~2-4%), comissão do consultor/parceiro (~6-10%).",
    fields: [
      ["custo_equipamentos_pct", "Equipamentos: Kit solar do fornecedor (ex: 0.48 = 48%)"], 
      ["custo_instalacao_pct", "Instalação: Mão de obra técnica (ex: 0.12 = 12%)"],
      ["custo_frete_pct", "Frete e Logística (ex: 0.03 = 3%)"], 
      ["custo_impostos_compra_pct", "Impostos de Compra: ICMS-ST + PIS/COFINS equipamentos (ex: 0.03 = 3%)"],
      ["custo_comissao_pct", "Comissão do Parceiro / Consultor (ex: 0.08 = 8%)"], 
      ["margem_alvo_pct", "Margem Bruta Alvo após custos diretos (ex: 0.24 = 24%)"],
    ]
  },
  {
    title: "🏢 Custos Operacionais da ESOL Energy (% do Faturamento)",
    hint: "Esses custos são deduzidos da Margem Bruta para calcular o Lucro Líquido Real. São invisíveis para o cliente mas determinam a saúde financeira da empresa.",
    fields: [
      ["tributacao_empresa_pct", "Tributação Corporativa: Simples/Presumido sobre faturamento (ex: 0.10 = 10%)"],
      ["custo_marketing_pct", "CAC / Marketing: Google Ads, Redes Sociais por projeto (ex: 0.03 = 3%)"],
      ["custo_overhead_pct", "SG&A / Overhead: Salários admin, ferramentas, aluguel rateado (ex: 0.05 = 5%)"],
      ["custo_garantia_pct", "Provisão de Garantia e Pós-venda (ex: 0.008 = 0.8%)"],
    ]
  },
  {
    title: "🔧 Custo Fixo de Engenharia por Projeto (R$)",
    hint: "Custo fixo por instalação independente do porte: ART/TRT no CREA, projeto elétrico+estrutural, protocolo e acompanhamento junto à concessionária.",
    fields: [
      ["custo_engenharia_fixo_brl", "ART + Projeto + Protocolo Concessionária por Projeto (R$, ex: 900)"],
    ]
  },
  {
    title: "⚡ Parâmetros de Economia Real do Cliente (Descontos na Proposta)",
    hint: "Valores que reduzem a economia projetada para o cliente, garantindo honestidade comercial. São deduzidos da economia bruta para exibir a economia real ajustada nas propostas.",
    fields: [
      ["custo_disponibilidade_mono_brl", "Custo de Disponibilidade — Mono/Bifásico (30 kWh × tarifa, R$/mês)"],
      ["custo_disponibilidade_tri_brl", "Custo de Disponibilidade — Trifásico (100 kWh × tarifa, R$/mês)"],
      ["cosip_estimada_brl", "COSIP / Iluminação Pública estimada — não abatida pelo solar (R$/mês)"],
      ["percentual_fio_b", "% do Fio B cobrado (Lei 14.300/2022): 2026=0.60, 2027=0.75, 2028=0.90"],
    ]
  },
  { 
    title: "🚀 Capacidade e Validade Operacional", 
    hint: "Controle de throughput da equipe de campo e validade das propostas geradas.",
    fields: [
      ["capacidade_instaladores_kwp_mes", "Capacidade dos Instaladores (kWp/Mês)"],
      ["validade_proposta_dias", "Validade Padrão da Proposta (Dias)"],
    ]
  },
];


function Parametros() {
  const [activeTab, setActiveTab] = useState<"tecnicos" | "financeiras" | "motor">("tecnicos");
  const [geralData, setGeralData] = useState<any>(null);
  const [savingGeral, setSavingGeral] = useState(false);

  // Estados para simulação interativa de teste do motor
  const [testeConsumo, setTesteConsumo] = useState<number>(600);
  const [testeTarifa, setTesteTarifa] = useState<number>(0.95);
  const [testeEstado, setTesteEstado] = useState<string>("SP");
  const [testeTipo, setTesteTipo] = useState<TipoInstalacao>("residencial");
  
  // Estados para gerenciamento de Financeiras
  const [financeiras, setFinanceiras] = useState<any[]>([]);
  const [loadingFin, setLoadingFin] = useState(false);
  const [savingFin, setSavingFin] = useState(false);

  const loadData = async () => {
    try {
      const { data: p } = await supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle();
      setGeralData(p);
      if (p) setTesteTarifa(Number(p.tarifa_kwh_default));
    } catch (err) {
      console.error("Falha ao carregar parâmetros comerciais", err);
      toast.error("Erro ao carregar dados do Supabase.");
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
      setFinanceiras(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar financeiras", err);
      toast.error("Falha ao carregar as taxas de bancos.");
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
      const { error } = await supabase.from("parametros_comerciais").update(geralData).eq("id", geralData.id);
      if (error) {
        toast.error("Erro ao salvar no banco: " + error.message);
      } else {
        toast.success("Parâmetros salvos com sucesso!");
      }
    } catch (err) {
      toast.error("Falha na conexão com o banco de dados.");
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

  if (!geralData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando parâmetros técnicos do sistema...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
          <Settings className="w-8 h-8 text-sun-deep" /> Tarifas & Parâmetros
        </h1>
        <p className="text-muted-foreground">
          Gerencie tarifas padrão, índices regionais HSP, dimensionamento técnico e as taxas de bancos/financeiras de crédito solar.
        </p>
      </div>

      {/* Abas */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200/50 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("tecnicos")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === "tecnicos" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          Parâmetros Gerais & HSP
        </button>
        <button
          onClick={() => setActiveTab("financeiras")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === "financeiras" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <Landmark className="w-4 h-4 text-sun-deep" /> Bancos & Taxas Solar (16 Financeiras)
        </button>
        <button
          onClick={() => setActiveTab("motor")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === "motor" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          ⚙️ Como Funciona o Motor (Fórmulas)
        </button>
      </div>

      {activeTab === "tecnicos" ? (
        <>
          <div className="grid gap-6">
            {SECTIONS.map((s) => (
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
              <div className="py-10 text-center text-slate-400 text-xs">
                Nenhum banco ou financeira configurada. Clique em Adicionar Banco acima.
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
      ) : (
        /* ABA DO MOTOR DE CÁLCULO INTERATIVO */
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
                  <div className="flex justify-between pb-0.5">
                    <span>Payback Real Ajustado:</span>
                    <span className="font-bold text-[#2E44B8]">{res.payback_ajustado_meses} meses</span>
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
                      O cliente solar <strong>nunca zera a conta de luz</strong>. Três custos fixos e obrigatórios permanecem: o Custo de Disponibilidade (taxa mínima de conexão), a COSIP (iluminação pública municipal) e o Fio B da Lei 14.300/2022.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 font-semibold uppercase text-[9px]">Economia Bruta (Motor)</span>
                          <strong className="text-slate-700 text-xs">{BRL(res.economia_mensal)}/mês</strong>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                          <span className="block text-red-400 font-semibold uppercase text-[9px]">(-) Custo Disponibilidade</span>
                          <strong className="text-red-600 text-xs">−{BRL(res.custo_disponibilidade_mensal)}/mês</strong>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                          <span className="block text-red-400 font-semibold uppercase text-[9px]">(-) COSIP Municipal</span>
                          <strong className="text-red-600 text-xs">−{BRL(res.cosip_mensal)}/mês</strong>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100 col-span-2">
                          <span className="block text-red-400 font-semibold uppercase text-[9px]">(-) Pedágio Fio B {((geralData.percentual_fio_b ?? 0.60) * 100).toFixed(0)}% (Lei 14.300/2022)</span>
                          <strong className="text-red-600 text-xs">−{BRL(res.ajuste_fio_b_mensal)}/mês sobre energia compensada</strong>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                          <span className="block text-[#2E44B8] font-bold uppercase text-[9px]">★ ECONOMIA REAL ({res.reducao_percentual_real}% de redução)</span>
                          <strong className="text-[#2E44B8] text-sm">{BRL(res.economia_ajustada_mensal)}/mês</strong>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 space-y-0.5">
                        <div>• Payback Simples (sem ajustes): <strong className="text-navy">{res.payback_meses} meses</strong></div>
                        <div>• Payback Real Ajustado: <strong className="text-[#2E44B8]">{res.payback_ajustado_meses} meses</strong></div>
                        <div>• Economia em 25 anos (ajustada c/ inflação {((geralData.inflacao_energetica ?? 0.08) * 100).toFixed(0)}%/a): <strong className="text-emerald-600">{BRL(res.economia_ajustada_25_anos)}</strong></div>
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
      )}
    </div>
  );
}
