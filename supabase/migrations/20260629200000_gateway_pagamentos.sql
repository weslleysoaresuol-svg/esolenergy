-- CRIAÇÃO DA TABELA DE TRANSAÇÕES DOS GATEWAYS DE PAGAMENTO
CREATE TABLE IF NOT EXISTS public.gateway_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    gateway VARCHAR(50) NOT NULL CHECK (gateway IN ('asaas', 'pagarme')),
    external_id VARCHAR(255) NOT NULL UNIQUE,
    customer_external_id VARCHAR(255),
    valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    metodo_pagamento VARCHAR(50) NOT NULL CHECK (metodo_pagamento IN ('pix', 'boleto', 'credit_card')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'expired')),
    pix_qr_code TEXT,
    pix_copia_e_cola TEXT,
    boleto_url TEXT,
    boleto_bar_code TEXT,
    credit_card_brand VARCHAR(50),
    parcelas INTEGER DEFAULT 1,
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CRIAÇÃO DA TABELA DE CONFIGURAÇÃO DE CREDENCIAIS DOS FORNECEDORES DE PAGAMENTO
CREATE TABLE IF NOT EXISTS public.gateway_settings (
    id VARCHAR(50) PRIMARY KEY CHECK (id IN ('active_config')),
    gateway_ativo VARCHAR(50) NOT NULL DEFAULT 'asaas' CHECK (gateway_ativo IN ('asaas', 'pagarme')),
    asaas_api_key TEXT,
    asaas_environment VARCHAR(50) NOT NULL DEFAULT 'sandbox' CHECK (asaas_environment IN ('sandbox', 'production')),
    pagarme_api_key TEXT,
    pagarme_environment VARCHAR(50) NOT NULL DEFAULT 'sandbox' CHECK (pagarme_environment IN ('sandbox', 'production')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADICIONANDO POLÍTICAS RLS E SEGURANÇA
ALTER TABLE public.gateway_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem fazer tudo com transacoes" ON public.gateway_transactions
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parceiros podem ler transacoes de seus pedidos" ON public.gateway_transactions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p 
            WHERE p.id = gateway_transactions.pedido_id 
            AND p.parceiro_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem gerenciar configuracoes de gateway" ON public.gateway_settings
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- INSERE CONFIGURAÇÃO INICIAL PADRÃO
INSERT INTO public.gateway_settings (id, gateway_ativo, asaas_environment, pagarme_environment)
VALUES ('active_config', 'asaas', 'sandbox', 'sandbox')
ON CONFLICT (id) DO NOTHING;
