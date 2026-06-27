import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Loader2 } from "lucide-react";

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
  const [geralData, setGeralData] = useState<any>(null);
  const [savingGeral, setSavingGeral] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: p } = await supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle();
        setGeralData(p);
      } catch (err) {
        console.error("Falha ao carregar parâmetros comerciais", err);
        toast.error("Erro ao carregar dados do Supabase.");
      }
    })();
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
          Gerencie tarifas padrão, índices regionais HSP, dimensionamento técnico e regras de comissão.
        </p>
      </div>

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
          className="bg-sun hover:bg-sun-deep text-navy font-bold shadow-lg rounded-full px-8 py-5 text-sm transition-all"
        >
          {savingGeral ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Parâmetros
        </Button>
      </div>
    </div>
  );
}
