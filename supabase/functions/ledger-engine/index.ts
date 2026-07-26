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

    console.log(`⚙️ Processando escrituração Ledger SHA-256 para Fatura '${fatura_id}'...`);

    // 1. Buscar a Fatura e Tenant
    const { data: fatura, error: faturaErr } = await supabase
      .from("banking_faturas")
      .select("id, tenant_id, cliente_id, valor_total, origem_modulo, origem_id")
      .eq("id", fatura_id)
      .single();

    if (faturaErr || !fatura) {
      return new Response(
        JSON.stringify({ error: `Fatura '${fatura_id}' não encontrada.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          descricao: `Liquidação Fatura ${fatura.id} [${fatura.origem_modulo}]`,
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

    // 4. Atualizar fatias de split para 'repassado'
    if (splits && splits.length > 0) {
      for (const split of splits) {
        await supabase
          .from("banking_transacoes_split")
          .update({ status_repasse: "repassado" })
          .eq("id", split.id);

        // Se o split tiver recebedor (consultor MMN), enfileirar notificação
        if (split.subconta_recebedora_id) {
          const { data: subconta } = await supabase
            .from("banking_subcontas")
            .select("user_id")
            .eq("id", split.subconta_recebedora_id)
            .single();

          if (subconta?.user_id) {
            await supabase.from("fila_notificacoes").insert({
              tenant_id: fatura.tenant_id,
              destinatario_id: subconta.user_id,
              canal: "app_sino",
              titulo: "Comissão Creditada! 💰",
              mensagem: `Sua comissão no valor de R$ ${split.valor_fatia} foi repassada com sucesso.`,
              payload_dados: { fatura_id: fatura.id, split_id: split.id },
            });
          }
        }
      }
    }

    console.log(`✅ Fatura '${fatura_id}' escriturada no Ledger SHA-256 e Splits liberados com sucesso.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Escrituração Ledger SHA-256 e Payout MMN concluídos",
        fatura_id: fatura.id,
        lancamentos: lancamentosInseridos,
        splits_processados: splits?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro na Edge Function ledger-engine:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro na escrituração contábil", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
