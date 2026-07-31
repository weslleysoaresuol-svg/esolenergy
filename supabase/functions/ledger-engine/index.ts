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

    const { fatura_id } = await req.json();

    if (!fatura_id) {
      return new Response(
        JSON.stringify({ error: "Parâmetro 'fatura_id' é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`⚙️ [ledger-engine] Processando escrituração Ledger SHA-256 para Fatura '${fatura_id}'...`);

    // 1. Buscar a Fatura, Tenant e Status de Liberação do Recurso
    const { data: fatura, error: faturaErr } = await supabase
      .from("banking_faturas")
      .select("id, tenant_id, cliente_id, valor_total, origem_modulo, origem_id, tipo_pagamento, recurso_liberado")
      .eq("id", fatura_id)
      .single();

    if (faturaErr || !fatura) {
      return new Response(
        JSON.stringify({ error: `Fatura '${fatura_id}' não encontrada.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TRAVA DE SEGURANÇA PLANO 33B: Se for Financiamento Bancário (84x) e o recurso NÃO foi liberado pelo banco
    const isFinanciamento = fatura.tipo_pagamento === "financiamento";
    const recursoLiberado = fatura.recurso_liberado === true || !isFinanciamento;

    if (isFinanciamento && !recursoLiberado) {
      console.warn(`🔒 [ledger-engine] TRAVA ATIVA: Fatura '${fatura_id}' é Financiamento e aguarda repasse do banco parceiro (recurso_liberado = false).`);
    }

    // 2. Buscar fatias do Split
    const { data: splits, error: splitErr } = await supabase
      .from("banking_transacoes_split")
      .select("*")
      .eq("fatura_id", fatura_id);

    if (splitErr) {
      console.error("❌ Erro ao buscar fatias do split:", splitErr);
    }

    // 3. Buscar contas contábeis de débito e crédito (Banco Matriz x Receita/Passivo MMN)
    const { data: contas } = await supabase
      .from("ledger_contas")
      .select("id, codigo, tipo")
      .eq("tenant_id", fatura.tenant_id);

    const contaDebito = contas?.find((c) => c.codigo === "1.1.01.01") || contas?.[0];
    const contaCredito = contas?.find((c) => c.codigo === "4.1.01.01") || contas?.[1] || contas?.[0];

    const lancamentosInseridos = [];

    if (contaDebito && contaCredito) {
      // Inserir lançamento contábil principal no Ledger (Dispara Triggers SHA-256 e Saldos)
      const { data: lancamento, error: lancErr } = await supabase
        .from("ledger_lancamentos")
        .insert({
          tenant_id: fatura.tenant_id,
          descricao: `Liquidação Fatura ${fatura.id} [${fatura.origem_modulo}] ${isFinanciamento ? '(Financiado)' : ''}`,
          conta_debito_id: contaDebito.id,
          conta_credito_id: contaCredito.id,
          valor: fatura.valor_total,
          origem_tipo: "faturamento_pedido",
          origem_id: fatura.origem_id || fatura.id,
          hash_transacao: `PENDING_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        })
        .select("id, hash_transacao")
        .single();

      if (!lancErr && lancamento) {
        lancamentosInseridos.push(lancamento.id);
      }
    }

    // 4. Atualizar fatias de split respeitando a trava de recurso liberado
    if (splits && splits.length > 0) {
      for (const split of splits) {
        const novoStatus = recursoLiberado ? "repassado" : "aguardando_liberacao_bancaria";

        await supabase
          .from("banking_transacoes_split")
          .update({
            status_split: novoStatus,
            recurso_liberado: recursoLiberado,
            status_liberacao: recursoLiberado ? "liberado_para_repasse" : "aguardando_liberacao_bancaria",
          })
          .eq("id", split.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: recursoLiberado
          ? "Escrituração Ledger concluída e splits repassados com sucesso."
          : "Escrituração Ledger realizada. Splits retidos aguardando liberação do recurso pelo banco (Trava 33B ativa).",
        fatura_id: fatura.id,
        is_financiamento: isFinanciamento,
        recurso_liberado: recursoLiberado,
        lancamentos_ids: lancamentosInseridos,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro geral na Edge Function ledger-engine:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro na escrituração contábil Ledger", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
