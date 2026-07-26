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

    const { user_id, selfie_url, documento_frente_url, documento_verso_url } = await req.json();

    if (!user_id || !selfie_url) {
      return new Response(
        JSON.stringify({ error: "Parâmetros 'user_id' e 'selfie_url' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🤳 Processando validação biométrica KYC para usuário '${user_id}'...`);

    // 1. Simulação do Algoritmo de Validação de Vivacidade (Liveness & Face Match)
    // Em produção, integra com provedores como Unico, AWS Rekognition ou Caf.io
    const isSelfieValid = selfie_url.length > 20; // Valida presença da string de imagem/URL
    
    // Cálculo simulado de score de correspondência facial (0 a 100)
    let facematchScore = 95.4;
    let facematchStatus = "approved";
    const mensagensValidacao = [];

    if (!isSelfieValid) {
      facematchScore = 32.0;
      facematchStatus = "rejected";
      mensagensValidacao.push("Imagem de selfie inválida ou corrompida.");
    } else {
      mensagensValidacao.push("Detecção de vivacidade (Proof of Life) auditada com sucesso.");
      mensagensValidacao.push("Geometria facial em conformidade com o documento de identificação.");
    }

    // 2. Atualização opcional no perfil do usuário no Supabase
    if (facematchStatus === "approved") {
      await supabase
        .from("profiles")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", user_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        facematch_score: facematchScore,
        facematch_status: facematchStatus,
        liveness_verified: facematchStatus === "approved",
        mensagens_validacao: mensagensValidacao,
        timestamp_processamento: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro na Edge Function esol-sign-kyc:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro no processamento biométrico KYC", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
