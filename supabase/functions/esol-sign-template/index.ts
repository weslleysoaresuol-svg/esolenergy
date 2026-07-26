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

    const { categoria = "contrato_parceria", dados_variaveis = {}, tenant_id } = await req.json();

    console.log(`📄 Compilando minuta jurídica para categoria '${categoria}'...`);

    // 1. Buscar o template ativo da minuta jurídica
    let query = supabase
      .from("documentos_minutas_juridicas")
      .select("*")
      .eq("categoria", categoria)
      .eq("status", "ativa")
      .order("created_at", { ascending: false })
      .limit(1);

    if (tenant_id) {
      query = query.eq("tenant_id", tenant_id);
    }

    const { data: minutas } = await query;
    const minuta = minutas?.[0];

    let templateBase = minuta?.conteudo_template;
    let tituloDocumento = minuta?.titulo || `Contrato Modelo - ${categoria}`;
    let versaoDocumento = minuta?.versao || "v1.0";

    // Template Padrão Fallback se não houver no banco
    if (!templateBase) {
      templateBase = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>TERMO E CONTRATO DE ADESÃO — ESOL ENERGY</h2>
          <p><strong>Signatário:</strong> {{NOME_CLIENTE}}</p>
          <p><strong>CPF/CNPJ:</strong> {{CPF_CNPJ}}</p>
          <p><strong>Endereço:</strong> {{ENDERECO}}</p>
          <hr />
          <p>Pelo presente instrumento, a parte contratante aceita os termos e condições da proposta comercial no valor de <strong>R$ {{VALOR_PROPOSTA}}</strong>.</p>
          <p><strong>Data de Emissão:</strong> {{DATA_EMISSAO}}</p>
        </div>
      `;
    }

    // 2. Interpolação Dinâmica das Variáveis no Template
    let conteudoCompilado = templateBase;
    for (const [chave, valor] of Object.entries(dados_variaveis)) {
      const regex = new RegExp(`{{${chave}}}`, "g");
      conteudoCompilado = conteudoCompilado.replace(regex, String(valor));
    }

    // Substituir data caso não fornecida
    if (!dados_variaveis["DATA_EMISSAO"]) {
      conteudoCompilado = conteudoCompilado.replace(/{{DATA_EMISSAO}}/g, new Date().toLocaleDateString("pt-BR"));
    }

    // 3. Cálculo de Digest Criptográfico SHA-256 do Documento Compilado
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(conteudoCompilado);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashSha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return new Response(
      JSON.stringify({
        success: true,
        minuta_id: minuta?.id || null,
        titulo: tituloDocumento,
        versao: versaoDocumento,
        categoria,
        conteudo_compilado_html: conteudoCompilado,
        hash_sha256_documento: hashSha256,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("💥 Erro na Edge Function esol-sign-template:", errorMessage);

    return new Response(
      JSON.stringify({ error: "Erro na compilação da minuta jurídica", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
