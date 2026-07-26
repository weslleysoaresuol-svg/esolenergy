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

    const { consumo_mensal_kwh, uf = "SP", concessionaria_codigo } = await req.json();

    if (!consumo_mensal_kwh || consumo_mensal_kwh <= 0) {
      return new Response(
        JSON.stringify({ error: "Parâmetro 'consumo_mensal_kwh' numérico e positivo é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`☀️ Calculando dimensionamento solar para consumo de ${consumo_mensal_kwh} kWh/mês no estado ${uf}...`);

    // 1. Buscar dados da concessionária ANEEL e HSP regional
    let { data: concessionaria } = await supabase
      .from("dict_concessionarias_aneel")
      .select("*")
      .eq("uf", uf.toUpperCase())
      .limit(1)
      .single();

    // Fallback padrão se não encontrar a concessionária no banco
    if (!concessionaria) {
      concessionaria = {
        hsp_medio: 4.85,
        tarifa_b1_kwh: 0.92,
        tarifa_fio_b_kwh: 0.28,
        concessionaria_nome: "Concessionária Padrão ANEEL",
      };
    }

    const hsp = Number(concessionaria.hsp_medio || 4.85);
    const tarifaBase = Number(concessionaria.tarifa_b1_kwh || 0.92);
    const tarifaFioB = Number(concessionaria.tarifa_fio_b_kwh || 0.28);

    // 2. Fator do Fio B da Lei 14.300/2022 por ano corrente
    const anoAtual = new Date().getFullYear();
    let percentualFioB = 0.60; // Padrão 2026 = 60%
    if (anoAtual <= 2023) percentualFioB = 0.15;
    else if (anoAtual === 2024) percentualFioB = 0.30;
    else if (anoAtual === 2025) percentualFioB = 0.45;
    else if (anoAtual === 2026) percentualFioB = 0.60;
    else if (anoAtual === 2027) percentualFioB = 0.75;
    else if (anoAtual >= 2028) percentualFioB = 0.90;

    const valorCustoFioBEst = tarifaFioB * percentualFioB;

    // 3. Cálculo da Potência Geradora Fotovoltaica (kWp)
    // Potência = Consumo Mensal / (30 dias * HSP * PR 0.78)
    const pr = 0.78;
    const potenciaKwpCalculada = Number((consumo_mensal_kwh / (30 * hsp * pr)).toFixed(2));
    const geracaoEstimadaMesKwh = Number((potenciaKwpCalculada * 30 * hsp * pr).toFixed(1));

    // 4. Recomendação de SKUs de Hardware Tier-1
    const moduloPotenciaW = 550;
    const quantidadeModulos = Math.ceil((potenciaKwpCalculada * 1000) / moduloPotenciaW);
    const potenciaInversorKw = Math.ceil(potenciaKwpCalculada);

    // 5. Retorno Técnico Estruturado
    return new Response(
      JSON.stringify({
        success: true,
        consumo_mensal_kwh,
        uf: uf.toUpperCase(),
        dimensionamento: {
          potencia_kwp_calculada: potenciaKwpCalculada,
          geracao_estimada_kwh_mes: geracaoEstimadaMesKwh,
          hsp_aplicado: hsp,
          performance_ratio: pr,
        },
        regulatorio_aneel: {
          concessionaria_nome: concessionaria.concessionaria_nome || "ANEEL",
          tarifa_kwh_base: tarifaBase,
          lei_14300_fator_fio_b: percentualFioB,
          custo_fio_b_kwh: Number(valorCustoFioBEst.toFixed(4)),
          isencao_icms_convenio16: true,
        },
        hardware_recomendado: {
          paineis: {
            quantidade: quantidadeModulos,
            potencia_unitaria_w: moduloPotenciaW,
            modelo: `Módulo Solar Monocristalino ${moduloPotenciaW}W Tier-1`,
          },
          inversor: {
            potencia_sugerida_kw: potenciaInversorKw,
            modelo: `Inversor Solar On-Grid ${potenciaInversorKw}kW Tier-1`,
          },
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro no cálculo da Edge Function motor-dimensionamento-solar:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro no cálculo de dimensionamento solar", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
