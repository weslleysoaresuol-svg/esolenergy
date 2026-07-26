import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Tratamento de CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validação de método HTTP
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Receber payload do Webhook
    const payload = await req.json();
    console.log("📥 Webhook Financeiro Recebido:", JSON.stringify(payload));

    const provider = req.headers.get("x-gateway-provider") || "asaas";
    const eventType = payload.event || payload.type || "PAYMENT_RECEIVED";
    const paymentData = payload.payment || payload.data?.object || payload;

    const gatewayChargeId = paymentData.id || paymentData.charge_id;

    // 2. Gravar Log Imutável de Auditoria
    const { data: logData, error: logError } = await supabase
      .from("banking_webhooks_logs")
      .insert({
        gateway_provider: provider,
        evento_tipo: eventType,
        payload_json: payload,
        processado: false,
      })
      .select("id")
      .single();

    if (logError) {
      console.error("❌ Erro ao gravar log de webhook:", logError);
    }

    const logId = logData?.id;

    // 3. Conciliação da Fatura no Banco de Dados
    if (gatewayChargeId) {
      const isPaidEvent = ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED", "payment_intent.succeeded", "charge.succeeded"].includes(eventType);
      const isOverdueEvent = ["PAYMENT_OVERDUE", "payment_intent.payment_failed"].includes(eventType);

      let newStatus = "pendente";
      if (isPaidEvent) newStatus = "recebido";
      else if (isOverdueEvent) newStatus = "atrasado";

      const updatePayload: Record<string, unknown> = {
        status_pagamento: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (isPaidEvent) {
        updatePayload.data_pagamento = new Date().toISOString();
      }

      const { data: faturaData, error: faturaError } = await supabase
        .from("banking_faturas")
        .update(updatePayload)
        .eq("gateway_charge_id", gatewayChargeId)
        .select("id, valor_total, tenant_id")
        .single();

      if (faturaError) {
        console.warn(`⚠️ Fatura com gateway_charge_id '${gatewayChargeId}' não encontrada para conciliação automática.`);
      } else if (faturaData && logId) {
        // Marca o log como processado com sucesso
        await supabase
          .from("banking_webhooks_logs")
          .update({ processado: true })
          .eq("id", logId);

        console.log(`✅ Fatura '${faturaData.id}' conciliada com status '${newStatus}'.`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook financeiro recebido e registrado com sucesso",
        log_id: logId,
        charge_id: gatewayChargeId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro fatal no processamento da Edge Function de Webhook Financeiro:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro interno no servidor de webhook", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
