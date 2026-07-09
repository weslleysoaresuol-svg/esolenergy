import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DistributorAdapterFactory,
  type DistributorCredentials
} from "@/lib/distributor-api";

// Função utilitária para verificar se o usuário logado é Admin ou Auxiliar
async function assertAdminOrAuxiliar(context: { supabase: any; userId: string }) {
  const [{ data: isAdmin }, { data: isAuxiliar }] = await Promise.all([
    context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin"
    }),
    context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "auxiliar"
    })
  ]);

  if (!isAdmin && !isAuxiliar) {
    throw new Error("Acesso Proibido: Permissão necessária de Administrador ou Auxiliar.");
  }
}

/**
 * SERVER FUNCTION: Salvar Configurações de API de uma Distribuidora
 * Salva e valida as credenciais de acesso no banco de dados.
 */
export const salvarConfigDistribuidoraServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      distribuidoraId: string;
      clientId: string | null;
      clientSecret: string | null;
      ambiente: "sandbox" | "production";
      configAdicional?: any;
    }) => input
  )
  .handler(async ({ data, context }) => {
    await assertAdminOrAuxiliar(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const adapter = DistributorAdapterFactory.create(data.distribuidoraId);
    
    // 1. Testa a conexão antes de salvar
    const creds: DistributorCredentials = {
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      ambiente: data.ambiente,
      configAdicional: data.configAdicional
    };

    const testRes = await adapter.testConnection(creds);
    if (!testRes.success) {
      return { success: false, message: `Falha ao validar credenciais: ${testRes.message}` };
    }

    // 2. Grava no banco de dados (tabela distribuidoras_config)
    const { error } = await supabaseAdmin.from("distribuidoras_config" as any).upsert({
      id: data.distribuidoraId,
      client_id: data.clientId,
      client_secret: data.clientSecret,
      ambiente: data.ambiente,
      config_adicional: data.configAdicional || {},
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });

    if (error) {
      throw new Error(`Erro ao salvar no banco de dados: ${error.message}`);
    }

    return { success: true, message: "Configurações salvas e conexão validada com sucesso!" };
  });

/**
 * SERVER FUNCTION: Sincronizar Catálogo de Kits de uma Distribuidora
 * Busca os kits através do adapter do fornecedor e realiza o upsert na tabela kits_produtos.
 */
export const sincronizarKitsDistribuidoraServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { distribuidoraId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdminOrAuxiliar(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Carrega as credenciais da distribuidora salvas no banco
    const { data: dbConfig } = await supabaseAdmin
      .from("distribuidoras_config" as any)
      .select("*")
      .eq("id", data.distribuidoraId)
      .maybeSingle();

    const creds: DistributorCredentials = {
      clientId: dbConfig?.client_id || null,
      clientSecret: dbConfig?.client_secret || null,
      ambiente: (dbConfig?.ambiente || "sandbox") as "sandbox" | "production",
      configAdicional: dbConfig?.config_adicional || {}
    };

    // 2. Busca kits do adapter correspondente
    const adapter = DistributorAdapterFactory.create(data.distribuidoraId);
    const kits = await adapter.fetchKits(creds);

    if (!kits || kits.length === 0) {
      return { success: true, count: 0, message: "Nenhum kit retornado pelo distribuidor." };
    }

    // 3. Insere ou atualiza os kits na tabela kits_produtos
    // Mapeia para a estrutura do banco e remove campos extras de segurança
    const listToUpsert = kits.map(k => ({
      codigo: k.codigo,
      faixa: k.faixa,
      nome: k.nome,
      potencia_kwp: k.potencia_kwp,
      quantidade_modulos: k.quantidade_modulos,
      fabricante_modulos: k.fabricante_modulos,
      potencia_modulo_w: k.potencia_modulo_w,
      tecnologia_modulo: k.tecnologia_modulo,
      eficiencia_modulo: k.eficiencia_modulo,
      inversor: k.inversor,
      tipo_inversor: k.tipo_inversor,
      garantia_modulos_anos: k.garantia_modulos_anos,
      garantia_inversor_anos: k.garantia_inversor_anos,
      preco: k.preco,
      consumo_kwh_min: k.consumo_kwh_min,
      consumo_kwh_max: k.consumo_kwh_max,
      imagem_url: k.imagem_url,
      destaque: k.destaque,
      ativo: k.ativo,
      fornecedor: k.fornecedor,
      url_fornecedor: k.url_fornecedor,
      componentes: k.componentes || "",
      categoria: k.categoria,
      disponibilidade: k.disponibilidade || "disponivel",
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseAdmin.from("kits_produtos").upsert(listToUpsert, {
      onConflict: "codigo"
    });

    if (error) {
      throw new Error(`Erro ao salvar kits no banco: ${error.message}`);
    }

    return {
      success: true,
      count: kits.length,
      message: `Catálogo da distribuidora ${adapter.name} sincronizado com sucesso!`
    };
  });

/**
 * SERVER FUNCTION: Buscar Configurações Ativas das Distribuidoras (para exibição no Cockpit)
 */
export const obterConfigsDistribuidorasServerFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminOrAuxiliar(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("distribuidoras_config" as any)
      .select("id, client_id, ambiente, updated_at");

    if (error) {
      throw new Error(`Erro ao obter configurações: ${error.message}`);
    }

    return data || [];
  });
