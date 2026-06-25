import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/parametros")({ component: Parametros });

const SECTIONS = [
  { title: "HSP por região (kWh/m²/dia)", fields: [
    ["hsp_norte", "Norte"], ["hsp_nordeste", "Nordeste"], ["hsp_centro_oeste", "Centro-Oeste"],
    ["hsp_sudeste", "Sudeste"], ["hsp_sul", "Sul"],
  ]},
  { title: "Preços de venda (R$/Wp)", fields: [
    ["preco_wp_residencial_pequeno", "Residencial até 5 kWp"], ["preco_wp_residencial_grande", "Residencial 5+ kWp"],
    ["preco_wp_comercial_pequeno", "Comercial até 30 kWp"], ["preco_wp_comercial_grande", "Comercial 30+ kWp"],
    ["preco_wp_industrial", "Industrial"],
  ]},
  { title: "Parâmetros técnicos", fields: [
    ["tarifa_kwh_default", "Tarifa default (R$/kWh)"], ["perdas_sistema", "Perdas (0-1)"],
    ["inflacao_energetica", "Inflação energética (0-1)"], ["vida_util_anos", "Vida útil (anos)"],
    ["potencia_modulo_w", "Potência módulo (W)"], ["area_por_modulo_m2", "Área/módulo (m²)"],
  ]},
  { title: "Estrutura de custos (% do preço de venda)", fields: [
    ["custo_equipamentos_pct", "Equipamentos"], ["custo_instalacao_pct", "Instalação"],
    ["custo_frete_pct", "Frete"], ["custo_impostos_pct", "Impostos"],
    ["custo_comissao_pct", "Comissão parceiro"], ["margem_alvo_pct", "Margem alvo"],
  ]},
  { title: "Operacional", fields: [
    ["capacidade_instaladores_kwp_mes", "Capacidade instaladores (kWp/mês)"],
    ["validade_proposta_dias", "Validade proposta (dias)"],
  ]},
];

function Parametros() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle();
      setData(p);
    })();
  }, []);

  async function salvar() {
    setSaving(true);
    const { error } = await supabase.from("parametros_comerciais").update(data).eq("id", data.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Parâmetros salvos!");
  }

  if (!data) return <div className="text-center py-12 text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-navy">Parâmetros Comerciais</h1>
        <p className="text-muted-foreground">Configure o motor de cálculo de propostas (preços, custos, técnicos)</p>
      </div>
      {SECTIONS.map((s) => (
        <Card key={s.title} className="p-5 border-0 shadow-md">
          <h3 className="font-semibold text-navy mb-3">{s.title}</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {s.fields.map(([k, label]) => (
              <div key={k}>
                <Label className="text-xs">{label}</Label>
                <Input type="number" step="0.01" value={data[k] ?? ""} onChange={(e) => setData({ ...data, [k]: Number(e.target.value) })} />
              </div>
            ))}
          </div>
        </Card>
      ))}
      <div className="flex justify-end sticky bottom-4">
        <Button onClick={salvar} disabled={saving} className="bg-sun hover:bg-sun-deep text-navy font-semibold shadow-lg">
          {saving ? "Salvando…" : "Salvar parâmetros"}
        </Button>
      </div>
    </div>
  );
}
