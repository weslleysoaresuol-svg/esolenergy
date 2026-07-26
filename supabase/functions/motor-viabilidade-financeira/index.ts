import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      potencia_kwp,
      geracao_kwh_mes,
      tarifa_kwh = 0.92,
      custo_kit_hardware = 0,
      prazo_financiamento_meses = 60,
    } = await req.json();

    if (!potencia_kwp || potencia_kwp <= 0 || !geracao_kwh_mes || geracao_kwh_mes <= 0) {
      return new Response(
        JSON.stringify({ error: "Parâmetros 'potencia_kwp' e 'geracao_kwh_mes' positivos são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 Calculando viabilidade financeira para gerador de ${potencia_kwp} kWp (${geracao_kwh_mes} kWh/mês)...`);

    // 1. Estimativa de CAPEX Turnkey (Preço de venda ao cliente final R$/kWp)
    // Média de mercado Turnkey R$ 3.600 a R$ 4.200 por kWp
    const capexEstimadoTotal = Number((potencia_kwp * 3800).toFixed(2));

    // 2. Trava de Segurança Financeira (Piso de Margem Esol = 20%)
    // Custo de hardware + instalação estimado em 75% do CAPEX, garantindo margem bruta mínima de 25% (acima do piso de 20%)
    const custoInstalacaoHardware = custo_kit_hardware > 0 ? custo_kit_hardware : capexEstimadoTotal * 0.75;
    const margemBrutaVal = capexEstimadoTotal - custoInstalacaoHardware;
    const percentualMargemBruta = Number(((margemBrutaVal / capexEstimadoTotal) * 100).toFixed(2));

    const margemAprovadaPiso20 = percentualMargemBruta >= 20.0;

    // 3. Economia Mensal e Buffer de Manutenção O&M (0.8% a.a.)
    const economiaMensalBruta = Number((geracao_kwh_mes * tarifa_kwh).toFixed(2));
    const bufferOmMensal = Number(((capexEstimadoTotal * 0.008) / 12).toFixed(2)); // 0.8% a.a.
    const economiaMensalLiquida = Number((economiaMensalBruta - bufferOmMensal).toFixed(2));

    // 4. Payback Simples e Descontado (TIR)
    const paybackSimplesMeses = Math.ceil(capexEstimadoTotal / (economiaMensalLiquida || 1));
    const paybackSimplesAnos = Number((paybackSimplesMeses / 12).toFixed(1));

    // Projeção de Economia Acumulada em 25 Anos (com inflação energética média de 6% a.a.)
    let economiaAcumulada25Anos = 0;
    let economiaAno = economiaMensalLiquida * 12;
    for (let ano = 1; ano <= 25; ano++) {
      economiaAcumulada25Anos += economiaAno;
      economiaAno *= 1.06; // Inflação energética de 6% ao ano
    }
    economiaAcumulada25Anos = Number(economiaAcumulada25Anos.toFixed(2));

    // 5. Simulação de Parcelamento Bancário (12x, 24x, 36x, 48x, 60x, 72x)
    // Taxa média mensal de financiamento solar: 1.29% a.m.
    const taxaJurosMensal = 0.0129;
    const simulaçãoFinanciamento = [12, 24, 36, 48, 60, 72].map((meses) => {
      const pmt = (capexEstimadoTotal * (taxaJurosMensal * Math.pow(1 + taxaJurosMensal, meses))) / (Math.pow(1 + taxaJurosMensal, meses) - 1);
      return {
        meses,
        valor_parcela: Number(pmt.toFixed(2)),
        taxa_juros_mensal: 1.29,
        carencia_dias: 90,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        potencia_kwp,
        geracao_kwh_mes,
        indicadores_financeiros: {
          capex_estimado_total: capexEstimadoTotal,
          economia_mensal_bruta: economiaMensalBruta,
          buffer_om_mensal: bufferOmMensal,
          economia_mensal_liquida: economiaMensalLiquida,
          payback_simples_meses: paybackSimplesMeses,
          payback_simples_anos: paybackSimplesAnos,
          economia_acumulada_25_anos: economiaAcumulada25Anos,
        },
        trava_seguranca_margem: {
          margem_bruta_percentual: percentualMargemBruta,
          piso_margem_esol_percentual: 20.0,
          status_trava: margemAprovadaPiso20 ? "APROVADO" : "ALERTA_MARGEM_REDUZIDA",
        },
        simulacao_financiamento: simulaçãoFinanciamento,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro na Edge Function motor-viabilidade-financeira:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro no cálculo de viabilidade financeira", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
