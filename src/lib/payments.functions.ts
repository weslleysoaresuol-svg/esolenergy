import { createServerFn } from "@/lib/stubs/tanstack_start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  AsaasAdapter,
  PagarMeAdapter,
  type PaymentGateway,
  type CustomerData,
  type ChargeData,
  type GatewayResponse,
} from "@/lib/payment-gateway";

type GatewayName = "asaas" | "pagarme";

function buildGateway(name: GatewayName): PaymentGateway {
  if (name === "asaas") {
    const key = process.env.ASAAS_API_KEY;
    const env = (process.env.ASAAS_ENVIRONMENT === "production" ? "production" : "sandbox") as
      | "sandbox"
      | "production";
    if (!key) throw new Error("Credenciais do Asaas não configuradas no servidor");
    return new AsaasAdapter(key, env);
  }
  const key = process.env.PAGARME_API_KEY;
  const env = (process.env.PAGARME_ENVIRONMENT === "production" ? "production" : "sandbox") as
    | "sandbox"
    | "production";
  if (!key) throw new Error("Credenciais do Pagar.me não configuradas no servidor");
  return new PagarMeAdapter(key, env);
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const criarCobrancaServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      gateway: GatewayName;
      customer: CustomerData;
      charge: Omit<ChargeData, "externalCustomerId"> & { externalCustomerId?: string };
    }) => input,
  )
  .handler(async ({ data, context }): Promise<{
    customerExternalId: string;
    charge: GatewayResponse;
  }> => {
    await assertAdmin(context);
    const gw = buildGateway(data.gateway);
    const cust = await gw.createCustomer(data.customer);
    const charge = await gw.createCharge({
      ...data.charge,
      externalCustomerId: data.charge.externalCustomerId || cust.customerExternalId,
    });
    return { customerExternalId: cust.customerExternalId, charge };
  });

export const estornarCobrancaServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { gateway: GatewayName; transactionId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const gw = buildGateway(data.gateway);
    return await gw.refundCharge(data.transactionId);
  });
