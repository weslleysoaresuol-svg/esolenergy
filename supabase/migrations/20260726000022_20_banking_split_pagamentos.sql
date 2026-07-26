-- =======================================================================================
-- MÓDULO 20: MOTOR DE SPLIT DE PAGAMENTOS E BAAS
-- Descrição: Integração com Gateway (Asaas/Stripe) para evitar bitributação.
--            Cria Subcontas para consultores, gerencia Faturas (PIX/Boleto) e o Split.
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- =======================================================================================

-- ---------------------------------------------------------------------------------------
-- 1. SUBCONTAS BANCÁRIAS (KYC E GATEWAY IDS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banking_subcontas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    gateway_provider varchar(50) NOT NULL DEFAULT 'asaas',
    gateway_account_id varchar(100) NOT NULL,
    gateway_wallet_id varchar(100),
    status_kyc varchar(30) DEFAULT 'pendente',
    motivo_rejeicao_kyc text,
    is_ativa boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, gateway_provider)
);

-- ---------------------------------------------------------------------------------------
-- 2. FATURAS E LINKS DE PAGAMENTO (O BOLETO/PIX DO CLIENTE)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banking_faturas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    cliente_id uuid NOT NULL REFERENCES public.clientes(id),
    origem_modulo varchar(50) NOT NULL,
    origem_id uuid NOT NULL,
    gateway_provider varchar(50) NOT NULL DEFAULT 'asaas',
    gateway_charge_id varchar(100) NOT NULL UNIQUE,
    valor_total numeric(15,2) NOT NULL,
    metodo_pagamento varchar(50) NOT NULL,
    link_pagamento varchar(500),
    status_pagamento varchar(50) DEFAULT 'pendente',
    data_vencimento date NOT NULL,
    data_pagamento timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 3. REGRAS DE SPLIT (O CORTE NA NUVEM)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banking_transacoes_split (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fatura_id uuid NOT NULL REFERENCES public.banking_faturas(id) ON DELETE CASCADE,
    subconta_recebedora_id uuid REFERENCES public.banking_subcontas(id),
    valor_fatia numeric(15,2) NOT NULL,
    percentual_fatia numeric(5,2),
    motivo_fatia varchar(100) NOT NULL,
    ledger_lancamento_id uuid,
    gateway_split_id varchar(100),
    status_repasse varchar(50) DEFAULT 'aguardando_pagamento',
    created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 4. WEBHOOKS AUDIT LOG (O OUVIDO DO GATEWAY)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banking_webhooks_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_provider varchar(50) NOT NULL,
    evento_tipo varchar(100) NOT NULL,
    payload_json jsonb NOT NULL,
    processado boolean DEFAULT false,
    erro_processamento text,
    created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_banking_faturas_status ON public.banking_faturas(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_banking_faturas_origem ON public.banking_faturas(origem_modulo, origem_id);
CREATE INDEX IF NOT EXISTS idx_banking_split_fatura ON public.banking_transacoes_split(fatura_id);
CREATE INDEX IF NOT EXISTS idx_banking_webhook_processado ON public.banking_webhooks_logs(processado) WHERE processado = false;
