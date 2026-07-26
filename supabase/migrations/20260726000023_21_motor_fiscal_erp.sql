-- =======================================================================================
-- MÓDULO 21: MOTOR FISCAL AUTOMATIZADO E ERP
-- Descrição: Integração com APIs Fiscais (eNotas/Omie) para Autofaturamento de comissões
--            e emissão automatizada de notas para clientes finais (NFS-e/NF-e/RPA).
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- =======================================================================================

-- ---------------------------------------------------------------------------------------
-- 1. COFRE DE CERTIFICADOS DIGITAIS (O "AUTOFATURAMENTO" DO CONSULTOR PJ)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fiscal_certificados_parceiros (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    cnpj_emissor varchar(14) NOT NULL,
    pfx_certificado_encrypted text NOT NULL,
    senha_certificado_encrypted text NOT NULL,
    data_vencimento date NOT NULL,
    is_ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- ---------------------------------------------------------------------------------------
-- 2. FILA E HISTÓRICO DE NOTAS FISCAIS EMITIDAS (CLIENTES E CONSULTORES)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fiscal_notas_emitidas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    cliente_id uuid REFERENCES public.clientes(id),
    user_id uuid REFERENCES public.profiles(id),
    origem_modulo varchar(50) NOT NULL,
    origem_id uuid NOT NULL,
    tipo_nota varchar(20) NOT NULL,
    valor_nota numeric(15,2) NOT NULL,
    status_emissao varchar(50) DEFAULT 'fila_processamento',
    chave_acesso_sefaz varchar(44),
    numero_nota varchar(20),
    link_pdf_nota varchar(500),
    link_xml_nota varchar(500),
    motivo_rejeicao text,
    data_autorizacao timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 3. GESTÃO DE RPAs (PARA CONSULTORES PESSOA FÍSICA)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fiscal_rpa_pagamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nota_fiscal_id uuid NOT NULL REFERENCES public.fiscal_notas_emitidas(id) ON DELETE CASCADE,
    valor_bruto numeric(15,2) NOT NULL,
    desconto_inss numeric(15,2) NOT NULL DEFAULT 0,
    desconto_irrf numeric(15,2) NOT NULL DEFAULT 0,
    desconto_iss numeric(15,2) NOT NULL DEFAULT 0,
    valor_liquido numeric(15,2) NOT NULL,
    competencia_mes_ano varchar(7) NOT NULL,
    is_recolhido_guia boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fiscal_notas_status ON public.fiscal_notas_emitidas(status_emissao);
CREATE INDEX IF NOT EXISTS idx_fiscal_notas_origem ON public.fiscal_notas_emitidas(origem_modulo, origem_id);
CREATE INDEX IF NOT EXISTS idx_certificados_vencimento ON public.fiscal_certificados_parceiros(data_vencimento);
