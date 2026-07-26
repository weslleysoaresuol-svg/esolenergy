-- =======================================================================================
-- MÓDULO 21: MOTOR FISCAL AUTOMATIZADO E ERP
-- Descrição: Integração com APIs Fiscais (eNotas/Omie) para Autofaturamento de comissões
--            e emissão automatizada de notas para clientes finais (NFS-e/NF-e/RPA).
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. COFRE DE CERTIFICADOS DIGITAIS (O "AUTOFATURAMENTO" DO CONSULTOR PJ)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.fiscal_certificados_parceiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    cnpj_emissor VARCHAR(14) NOT NULL,
    pfx_certificado_encrypted TEXT NOT NULL, -- Certificado Digital Criptografado via KMS/pgcrypto
    senha_certificado_encrypted TEXT NOT NULL, 
    data_vencimento DATE NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ---------------------------------------------------------------------------------------
-- 2. FILA E HISTÓRICO DE NOTAS FISCAIS EMITIDAS (CLIENTES E CONSULTORES)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.fiscal_notas_emitidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    cliente_id UUID REFERENCES public.clientes(id), -- Null se a nota for do consultor
    user_id UUID REFERENCES auth.users(id), -- Null se a nota for da Esol pro Cliente
    origem_modulo VARCHAR(50) NOT NULL, -- 'epc_turnkey', 'saque_mmn', 'loja'
    origem_id UUID NOT NULL, -- ID do Saque ou Projeto
    tipo_nota VARCHAR(20) NOT NULL, -- 'NFSE' (Serviço), 'NFE' (Produto), 'RPA' (PF)
    valor_nota NUMERIC(15,2) NOT NULL,
    status_emissao VARCHAR(50) DEFAULT 'fila_processamento', -- fila_processamento, autorizada, rejeitada, cancelada
    chave_acesso_sefaz VARCHAR(44), -- Chave de autenticidade governamental
    numero_nota VARCHAR(20),
    link_pdf_nota VARCHAR(500),
    link_xml_nota VARCHAR(500),
    motivo_rejeicao TEXT,
    data_autorizacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. GESTÃO DE RPAs (PARA CONSULTORES PESSOA FÍSICA)
-- ---------------------------------------------------------------------------------------
-- Se o consultor não for PJ, a Esol retém o imposto na fonte e gera o Recibo de Pagamento Autônomo.
CREATE TABLE public.fiscal_rpa_pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    nota_fiscal_id UUID NOT NULL REFERENCES public.fiscal_notas_emitidas(id) ON DELETE CASCADE,
    valor_bruto NUMERIC(15,2) NOT NULL,
    desconto_inss NUMERIC(15,2) NOT NULL DEFAULT 0,
    desconto_irrf NUMERIC(15,2) NOT NULL DEFAULT 0,
    desconto_iss NUMERIC(15,2) NOT NULL DEFAULT 0,
    valor_liquido NUMERIC(15,2) NOT NULL,
    competencia_mes_ano VARCHAR(7) NOT NULL, -- Ex: '07-2026'
    is_recolhido_guia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_fiscal_notas_status ON public.fiscal_notas_emitidas(status_emissao);
CREATE INDEX idx_fiscal_notas_origem ON public.fiscal_notas_emitidas(origem_modulo, origem_id);
CREATE INDEX idx_certificados_vencimento ON public.fiscal_certificados_parceiros(data_vencimento);

COMMIT;
