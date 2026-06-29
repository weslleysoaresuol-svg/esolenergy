/**
 * INTERFACE UNIFICADA DO GATEWAY DE PAGAMENTOS (ADAPTER DESIGN PATTERN)
 * Esta estrutura abstrai e unifica as APIs do Asaas e Pagar.me
 * para que o ERP possa alternar entre elas instantaneamente.
 */

export interface CustomerData {
  nome: string;
  email: string;
  cpf_cnpj: string;
  telefone: string;
}

export interface ChargeData {
  externalCustomerId: string;
  valor: number;
  metodo: "pix" | "boleto" | "credit_card";
  descricao: string;
  parcelas?: number;
}

export interface GatewayResponse {
  success: boolean;
  transactionId: string;
  customerExternalId: string;
  status: "pending" | "paid" | "failed" | "refunded" | "expired";
  pixQrCode?: string;
  pixCopiaCola?: string;
  boletoUrl?: string;
  boletoBarCode?: string;
  creditCardBrand?: string;
  rawResponse: any;
}

export interface PaymentGateway {
  name: "asaas" | "pagarme";
  createCustomer(customer: CustomerData): Promise<{ customerExternalId: string; raw: any }>;
  createCharge(charge: ChargeData): Promise<GatewayResponse>;
  refundCharge(transactionId: string): Promise<{ success: boolean; status: string; raw: any }>;
}

/**
 * ADAPTADOR DO ASAAS
 * Baseado na API V3 do Asaas (https://docs.asaas.com/)
 */
export class AsaasAdapter implements PaymentGateway {
  name: "asaas" = "asaas";
  private apiKey: string;
  private isSandbox: boolean;

  constructor(apiKey: string, environment: "sandbox" | "production") {
    this.apiKey = apiKey;
    this.isSandbox = environment === "sandbox";
  }

  private get baseUrl() {
    return this.isSandbox ? "https://sandbox.asaas.com/api/v3" : "https://api.asaas.com/api/v3";
  }

  async createCustomer(customer: CustomerData) {
    console.log("[Asaas V3] Criando cliente:", customer.nome);
    // Simulação caso não haja API Key real configurada
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      const mockId = "cus_" + Math.random().toString(36).substring(2, 10);
      return { customerExternalId: mockId, raw: { mock: true, gateway: "asaas" } };
    }

    try {
      const res = await fetch(`${this.baseUrl}/customers`, {
        method: "POST",
        headers: {
          "access_token": this.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: customer.nome,
          email: customer.email,
          cpfCnpj: customer.cpf_cnpj.replace(/\D/g, ""),
          mobilePhone: customer.telefone.replace(/\D/g, "")
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.description || "Erro Asaas");
      return { customerExternalId: data.id, raw: data };
    } catch (e: any) {
      throw new Error(`Asaas Customer Error: ${e.message}`);
    }
  }

  async createCharge(charge: ChargeData): Promise<GatewayResponse> {
    console.log("[Asaas V3] Criando cobrança de R$:", charge.valor);
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      const mockTxId = "pay_" + Math.random().toString(36).substring(2, 12);
      return {
        success: true,
        transactionId: mockTxId,
        customerExternalId: charge.externalCustomerId,
        status: "pending",
        pixQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ESOL_ENERGY_PIX_MOCK_PAYMENT",
        pixCopiaCola: "00020126580014br.gov.bcb.pix0136ESOLENERGYMOCK0503000520400005303986540410.005802BR5911ESOLENERGY6009SAOPAULO62070503TX163040D3A",
        boletoUrl: "https://www.asaas.com/b/pdf/mock",
        boletoBarCode: "34191.79001 01043.513184 91020.150008 7 90020000015000",
        rawResponse: { mock: true, gateway: "asaas" }
      };
    }

    try {
      const billingTypeMap: Record<string, string> = {
        pix: "PIX",
        boleto: "BOLETO",
        credit_card: "CREDIT_CARD"
      };

      const payload: any = {
        customer: charge.externalCustomerId,
        billingType: billingTypeMap[charge.metodo],
        value: charge.valor,
        dueDate: new Date(Date.now() + 72 * 3600000).toISOString().split("T")[0], // 3 dias de vencimento
        description: charge.descricao
      };

      if (charge.metodo === "credit_card") {
        payload.installmentCount = charge.parcelas || 1;
      }

      const res = await fetch(`${this.baseUrl}/payments`, {
        method: "POST",
        headers: {
          "access_token": this.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.description || "Erro Asaas");

      // Detalhes extras se for Pix ou Boleto
      let pixQr: string | undefined;
      let pixCc: string | undefined;
      
      if (charge.metodo === "pix") {
        const qrRes = await fetch(`${this.baseUrl}/payments/${data.id}/pixQrCode`, {
          headers: { "access_token": this.apiKey }
        });
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          pixQr = qrData.encodedImage;
          pixCc = qrData.payload;
        }
      }

      return {
        success: true,
        transactionId: data.id,
        customerExternalId: charge.externalCustomerId,
        status: data.status === "RECEIVED" || data.status === "CONFIRMED" ? "paid" : "pending",
        pixQrCode: pixQr,
        pixCopiaCola: pixCc,
        boletoUrl: data.bankSlipUrl,
        boletoBarCode: data.identificationField,
        rawResponse: data
      };
    } catch (e: any) {
      throw new Error(`Asaas Payment Error: ${e.message}`);
    }
  }

  async refundCharge(transactionId: string) {
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      return { success: true, status: "refunded", raw: { mock: true } };
    }
    try {
      const res = await fetch(`${this.baseUrl}/payments/${transactionId}/refund`, {
        method: "POST",
        headers: {
          "access_token": this.apiKey,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.description || "Erro Asaas");
      return { success: true, status: "refunded", raw: data };
    } catch (e: any) {
      throw new Error(`Asaas Refund Error: ${e.message}`);
    }
  }
}

/**
 * ADAPTADOR DO PAGAR.ME
 * Baseado na API V5 do Pagar.me (https://docs.pagar.me/)
 */
export class PagarMeAdapter implements PaymentGateway {
  name: "pagarme" = "pagarme";
  private apiKey: string;

  constructor(apiKey: string, _environment: "sandbox" | "production") {
    // Pagar.me usa chaves ak_test_ ou ak_live_ para mudar ambiente automaticamente
    this.apiKey = apiKey;
  }

  private get baseUrl() {
    return "https://api.pagar.me/core/v5";
  }

  private get authHeader() {
    return "Basic " + btoa(this.apiKey + ":");
  }

  async createCustomer(customer: CustomerData) {
    console.log("[Pagar.me V5] Criando cliente:", customer.nome);
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      const mockId = "cus_" + Math.random().toString(36).substring(2, 10);
      return { customerExternalId: mockId, raw: { mock: true, gateway: "pagarme" } };
    }

    try {
      const cleanPhone = customer.telefone.replace(/\D/g, "");
      const res = await fetch(`${this.baseUrl}/customers`, {
        method: "POST",
        headers: {
          "Authorization": this.authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: customer.nome,
          email: customer.email,
          type: "individual",
          document: customer.cpf_cnpj.replace(/\D/g, ""),
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: cleanPhone.substring(0, 2),
              number: cleanPhone.substring(2)
            }
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro Pagar.me");
      return { customerExternalId: data.id, raw: data };
    } catch (e: any) {
      throw new Error(`Pagar.me Customer Error: ${e.message}`);
    }
  }

  async createCharge(charge: ChargeData): Promise<GatewayResponse> {
    console.log("[Pagar.me V5] Criando cobrança de R$:", charge.valor);
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      const mockTxId = "ch_" + Math.random().toString(36).substring(2, 12);
      return {
        success: true,
        transactionId: mockTxId,
        customerExternalId: charge.externalCustomerId,
        status: "pending",
        pixQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ESOL_ENERGY_PIX_PAGARME_MOCK",
        pixCopiaCola: "00020126580014br.gov.bcb.pix0136ESOLENERGYPAGARME0503000520400005303986540410.005802BR5911ESOLENERGY6009SAOPAULO62070503TX163040D3A",
        boletoUrl: "https://pagar.me/b/pdf/mock",
        boletoBarCode: "34191.79001 01043.513184 91020.150008 7 90020000015000",
        rawResponse: { mock: true, gateway: "pagarme" }
      };
    }

    try {
      const amountInCents = Math.round(charge.valor * 100);
      let paymentPayload: any = {};

      if (charge.metodo === "pix") {
        paymentPayload = {
          payment_method: "pix",
          pix: {
            expires_in: 86400 // 24 horas
          }
        };
      } else if (charge.metodo === "boleto") {
        paymentPayload = {
          payment_method: "boleto",
          boleto: {
            instructions: "Pague até o vencimento. Não receber após vencimento.",
            due_at: new Date(Date.now() + 72 * 3600000).toISOString()
          }
        };
      } else if (charge.metodo === "credit_card") {
        paymentPayload = {
          payment_method: "credit_card",
          credit_card: {
            installments: charge.parcelas || 1,
            statement_descriptor: "ESOL ENERGY"
          }
        };
      }

      const res = await fetch(`${this.baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Authorization": this.authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_id: charge.externalCustomerId,
          items: [
            {
              amount: amountInCents,
              description: charge.descricao,
              quantity: 1,
              code: "SOLAR_KIT"
            }
          ],
          payments: [paymentPayload]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro Pagar.me");

      const transaction = data.charges?.[0];
      const lastTransaction = transaction?.last_transaction;

      return {
        success: true,
        transactionId: transaction?.id || data.id,
        customerExternalId: charge.externalCustomerId,
        status: transaction?.status === "paid" ? "paid" : "pending",
        pixQrCode: lastTransaction?.qr_code_url,
        pixCopiaCola: lastTransaction?.qr_code,
        boletoUrl: lastTransaction?.pdf,
        boletoBarCode: lastTransaction?.line,
        rawResponse: data
      };
    } catch (e: any) {
      throw new Error(`Pagar.me Order Error: ${e.message}`);
    }
  }

  async refundCharge(transactionId: string) {
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      return { success: true, status: "refunded", raw: { mock: true } };
    }
    try {
      const res = await fetch(`${this.baseUrl}/charges/${transactionId}/refund`, {
        method: "POST",
        headers: {
          "Authorization": this.authHeader,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro Pagar.me");
      return { success: true, status: "refunded", raw: data };
    } catch (e: any) {
      throw new Error(`Pagar.me Refund Error: ${e.message}`);
    }
  }
}

/**
 * FACTORY PATTERN PARA CARREGAR O GATEWAY ATIVO
 */
export class PaymentGatewayFactory {
  static create(settings: {
    gateway_ativo: "asaas" | "pagarme";
    asaas_api_key?: string;
    asaas_environment?: "sandbox" | "production";
    pagarme_api_key?: string;
    pagarme_environment?: "sandbox" | "production";
  }): PaymentGateway {
    if (settings.gateway_ativo === "asaas") {
      return new AsaasAdapter(
        settings.asaas_api_key || "mock_asaas_key",
        settings.asaas_environment || "sandbox"
      );
    } else {
      return new PagarMeAdapter(
        settings.pagarme_api_key || "mock_pagarme_key",
        settings.pagarme_environment || "sandbox"
      );
    }
  }
}
