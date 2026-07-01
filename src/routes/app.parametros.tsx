import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Loader2, Plus, Trash2, Landmark } from "lucide-react";

export const Route = createFileRoute("/app/parametros")({
  head: () => ({ meta: [{ title: "Tarifas & Parâmetros — ESOL Energy" }] }),
  component: Parametros,
});

const SECTIONS = [
  { 
    title: "☀️ HSP por Região (kWh/m²/dia)", 
    fields: [
      ["hsp_norte", "Região Norte"], 
      ["hsp_nordeste", "Região Nordeste"], 
      ["hsp_centro_oeste", "Região Centro-Oeste"],
      ["hsp_sudeste", "Região Sudeste"], 
      ["hsp_sul", "Região Sul"],
    ]
  },
  { 
    title: "💰 Preços de Referência Sugeridos de Venda (R$/Wp)", 
    fields: [
      ["preco_wp_residencial_pequeno", "Residencial até 5 kWp"], 
      ["preco_wp_residencial_grande", "Residencial 5+ kWp"],
      ["preco_wp_comercial_pequeno", "Comercial até 30 kWp"], 
      ["preco_wp_comercial_grande", "Comercial 30+ kWp"],
      ["preco_wp_industrial", "Industrial / Grande Porte"],
    ]
  },
  { 
    title: "⚙️ Parâmetros Técnicos Gerais", 
    fields: [
      ["tarifa_kwh_default", "Tarifa Padrão (R$/kWh)"], 
      ["perdas_sistema", "Fator de Perdas do Sistema (0 a 1)"],
      ["inflacao_energetica", "Inflação Energética Anual Média (0 a 1)"], 
      ["vida_util_anos", "Vida Útil Estimada do Sistema (Anos)"],
      ["potencia_modulo_w", "Potência Padrão do Módulo (W)"], 
      ["area_por_modulo_m2", "Área de Superfície por Módulo (m²)"],
    ]
  },
  { 
    title: "📊 Estrutura de Custos (% do Preço de Venda)", 
    fields: [
      ["custo_equipamentos_pct", "Custo Equipamentos (Fração de 0 a 1)"], 
      ["custo_instalacao_pct", "Custo Instalação (Fração de 0 a 1)"],
      ["custo_frete_pct", "Custo Frete (Fração de 0 a 1)"], 
      ["custo_impostos_pct", "Custo Impostos (Fração de 0 a 1)"],
      ["custo_comissao_pct", "Comissão do Parceiro (Fração de 0 a 1)"], 
      ["margem_alvo_pct", "Margem Alvo de Lucro (Fração de 0 a 1)"],
    ]
  },
  { 
    title: "🚀 Capacidade e Validade Operacional", 
    fields: [
      ["capacidade_instaladores_kwp_mes", "Capacidade dos Instaladores (kWp/Mês)"],
      ["validade_proposta_dias", "Validade Padrão da Proposta (Dias)"],
    ]
  },
];

function Parametros() {
  const [activeTab, setActiveTab] = useState<"tecnicos" | "financeiras">("tecnicos");
  const [geralData, setGeralData] = useState<any>(null);
  const [savingGeral, setSavingGeral] = useState(false);
  
  // Estados para gerenciamento de Financeiras
  const [financeiras, setFinanceiras] = useState<any[]>([]);
  const [loadingFin, setLoadingFin] = useState(false);
  const [savingFin, setSavingFin] = useState(false);

  const loadData = async () => {
    try {
      const { data: p } = await supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle();
      setGeralData(p);
    } catch (err) {
      console.error("Falha ao carregar parâmetros comerciais", err);
      toast.error("Erro ao carregar dados do Supabase.");
    }
  };

  const loadFinanceiras = async () => {
    setLoadingFin(true);
    try {
      const { data, error } = await supabase
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
          const { error } = await supabase
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
          const { error } = await supabase
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
      const { error } = await supabase.from("financeiras_solar").delete().eq("id", id);
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
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200/50">
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
          <Landmark className="w-4 h-4 text-sun-deep" /> Bancos & Taxas Solar (10 Financeiras)
        </button>
      </div>

      {activeTab === "tecnicos" ? (
        <>
          <div className="grid gap-6">
            {SECTIONS.map((s) => (
              <Card key={s.title} className="p-5 border-0 shadow-md bg-white">
                <h3 className="font-bold text-navy text-sm border-b pb-3 mb-4">{s.title}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.fields.map(([k, label]) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-xs text-slate-600 font-semibold">{label}</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
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
      ) : (
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
      )}
    </div>
  );
}
