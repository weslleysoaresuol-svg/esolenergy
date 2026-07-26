-- =======================================================================================
-- MÓDULO 20: MOTOR DE SPLIT DE PAGAMENTOS E BAAS
-- Descrição: Integração com Gateway (Asaas/Stripe) para evitar bitributação.
--            Cria Subcontas para consultores, gerencia Faturas (PIX/Boleto) e o Split.
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. SUBCONTAS BANCÁRIAS (KYC E GATEWAY IDS)
-- ---------------------------------------------------------------------------------------
-- Todo consultor MMN precisa de uma conta virtual no Gateway para receber os repasses do Split.
CREATE TABLE public.banking_subcontas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'asaas', -- asaas, stripe, pagarme
    gateway_account_id VARCHAR(100) NOT NULL, -- O ID da subconta gerada na nuvem
    gateway_wallet_id VARCHAR(100), -- Carteira virtual associada (se aplicável)
    status_kyc VARCHAR(30) DEFAULT 'pendente', -- pendente, aprovado, rejeitado
    motivo_rejeicao_kyc TEXT,
    is_ativa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gateway_provider)
);

-- ---------------------------------------------------------------------------------------
-- 2. FATURAS E LINKS DE PAGAMENTO (O BOLETO/PIX DO CLIENTE)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.banking_faturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id),
    origem_modulo VARCHAR(50) NOT NULL, -- 'epc_turnkey', 'gd_assinatura', 'loja'
    origem_id UUID NOT NULL, -- ID do Projeto ou Pedido
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'asaas',
    gateway_charge_id VARCHAR(100) NOT NULL UNIQUE, -- ID da Cobrança no Gateway
    valor_total NUMERIC(15,2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL, -- 'pix', 'boleto', 'credit_card'
    link_pagamento VARCHAR(500),
    status_pagamento VARCHAR(50) DEFAULT 'pendente', -- pendente, recebido, atrasado, falha
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. REGRAS DE SPLIT (O CORTE NA NUVEM)
-- ---------------------------------------------------------------------------------------
-- Onde a Mágica Acontece: Mapeia como os 50k do cliente serão fatiados ANTES de cair na Esol.
CREATE TABLE public.banking_transacoes_split (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fatura_id UUID NOT NULL REFERENCES public.banking_faturas(id) ON DELETE CASCADE,
    subconta_recebedora_id UUID REFERENCES public.banking_subcontas(id), -- Null = Conta Matriz (Esol)
    valor_fatia NUMERIC(15,2) NOT NULL,
    percentual_fatia NUMERIC(5,2),
    motivo_fatia VARCHAR(100) NOT NULL, -- 'comissao_venda_direta', 'royalties_n1', 'receita_matriz'
    ledger_lancamento_id UUID, -- Relaciona com a provisão no Módulo 5
    gateway_split_id VARCHAR(100), -- ID do split gerado no Gateway
    status_repasse VARCHAR(50) DEFAULT 'aguardando_pagamento', -- aguardando_pagamento, repassado, falha
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 4. WEBHOOKS AUDIT LOG (O OUVIDO DO GATEWAY)
-- ---------------------------------------------------------------------------------------
-- Log imutável de todas as notificações financeiras que o Gateway manda para a Esol.
CREATE TABLE public.banking_webhooks_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_provider VARCHAR(50) NOT NULL,
    evento_tipo VARCHAR(100) NOT NULL, -- ex: 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE'
    payload_json JSONB NOT NULL,
    processado BOOLEAN DEFAULT FALSE,
    erro_processamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_banking_faturas_status ON public.banking_faturas(status_pagamento);
CREATE INDEX idx_banking_faturas_origem ON public.banking_faturas(origem_modulo, origem_id);
CREATE INDEX idx_banking_split_fatura ON public.banking_transacoes_split(fatura_id);
CREATE INDEX idx_banking_webhook_processado ON public.banking_webhooks_logs(processado) WHERE processado = FALSE;

COMMIT;
