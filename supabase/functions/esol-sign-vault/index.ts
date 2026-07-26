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
      user_id,
      tipo_documento = "contrato_parceria",
      referencia_id,
      conteudo_hash,
      assinatura_url,
      selfie_url,
      documento_frente_url,
      documento_verso_url,
      latitude,
      longitude,
      facematch_score = 95.0,
      facematch_status = "approved",
      tenant_id,
    } = await req.json();

    if (!referencia_id || !conteudo_hash || !assinatura_url) {
      return new Response(
        JSON.stringify({ error: "Parâmetros 'referencia_id', 'conteudo_hash' e 'assinatura_url' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Extração de Evidências Técnicas da Requisição (IP & User Agent)
    const ipOrigem =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "127.0.0.1";
    
    const userAgent = req.headers.get("user-agent") || "EsolSign-MobileClient/1.0";
    const timestampNtp = new Date().toISOString();

    console.log(`✒️ Gravando assinatura digital no Esol Sign Vault para referência '${referencia_id}' (IP: ${ipOrigem})...`);

    // 2. Gravação Imutável na Tabela assinaturas_digitais
    const { data: assinatura, error: signErr } = await supabase
      .from("assinaturas_digitais")
      .insert({
        tenant_id: tenant_id || null,
        user_id: user_id || null,
        tipo_documento,
        referencia_id,
        conteudo_hash,
        assinatura_url,
        selfie_url: selfie_url || null,
        documento_frente_url: documento_frente_url || null,
        documento_verso_url: documento_verso_url || null,
        ip_origem: ipOrigem,
        user_agent: userAgent,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        timestamp_ntp: timestampNtp,
        facematch_status,
        facematch_score: Number(facematch_score),
      })
      .select("id, created_at, timestamp_ntp")
      .single();

    if (signErr) {
      console.error("❌ Erro ao gravar assinatura no banco:", signErr);
      return new Response(
        JSON.stringify({ error: "Erro ao gravar registro no cofre de assinaturas digitais", details: signErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Assinatura digital registrada com não-repúdio no Esol Sign Vault",
        assinatura_id: assinatura.id,
        conteudo_hash,
        timestamp_ntp: assinatura.timestamp_ntp,
        evidencias: {
          ip_origem: ipOrigem,
          user_agent: userAgent,
          latitude,
          longitude,
          facematch_status,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro na Edge Function esol-sign-vault:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro no cofre de assinaturas digitais", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
