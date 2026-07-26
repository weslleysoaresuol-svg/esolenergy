-- =======================================================================================
-- MÓDULO 23: COFRE DE DADOS DE MERCADO (PRICING VAULT)
-- Descrição: Dicionário central de Tarifas ANEEL, Impostos Estaduais (SEFAZ),
--            Tabelas de Financiamento Bancário (CET) e Custos de Hardware (B2B).
--            Isola as regras variáveis do Motor Reverso (Módulo 3).
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql
-- =======================================================================================

-- ---------------------------------------------------------------------------------------
-- 1. DICIONÁRIO DE TARIFAS DE ENERGIA (ANEEL)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dict_concessionarias_aneel (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_concessionaria varchar(150) NOT NULL UNIQUE,
    uf_atuacao varchar(2) NOT NULL,
    tarifa_b1_residencial numeric(10, 6) NOT NULL,
    tarifa_b2_rural numeric(10, 6) NOT NULL,
    tarifa_b3_comercial numeric(10, 6) NOT NULL,
    fator_fio_b_percentual numeric(5, 4) NOT NULL,
    taxa_iluminacao_publica_media numeric(10, 2),
    data_ultima_revisao_tarifaria date NOT NULL,
    is_ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 2. DICIONÁRIO DE TRIBUTOS ESTADUAIS E FEDERAIS (SEFAZ / RFB)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dict_tributos_estaduais (
    uf varchar(2) PRIMARY KEY,
    aliquota_icms_energia_percentual numeric(5, 4) NOT NULL,
    aliquota_icms_equipamentos_percentual numeric(5, 4) NOT NULL,
    possui_convenio_confaz_isencao_gd boolean DEFAULT true,
    data_atualizacao date NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------------------------
-- 3. DICIONÁRIO DE FINANCIAMENTOS (BANCOS E TAXAS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dict_financeiras_taxas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    banco_nome varchar(100) NOT NULL,
    tipo_cliente varchar(20) NOT NULL,
    prazo_meses integer NOT NULL,
    carencia_meses integer DEFAULT 0,
    taxa_juros_mes_percentual numeric(6, 4) NOT NULL,
    cet_mes_percentual numeric(6, 4) NOT NULL,
    fator_multiplicador numeric(8, 6) NOT NULL,
    taxa_abertura_credito_tac numeric(10, 2) DEFAULT 0.00,
    is_ativo boolean DEFAULT true,
    data_atualizacao date NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(banco_nome, tipo_cliente, prazo_meses)
);

-- ---------------------------------------------------------------------------------------
-- 4. CATÁLOGO B2B DE FORNECEDORES (HARDWARE)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dict_fornecedores_skus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fornecedor_nome varchar(100) NOT NULL,
    codigo_sku varchar(100) NOT NULL,
    categoria varchar(50) NOT NULL,
    potencia_w numeric(10, 2),
    custo_compra_bruto numeric(15, 2) NOT NULL,
    peso_kg numeric(10, 2) NOT NULL,
    link_api_estoque varchar(500),
    data_atualizacao timestamptz DEFAULT now(),
    UNIQUE(fornecedor_nome, codigo_sku)
);

-- ---------------------------------------------------------------------------------------
-- 5. DICIONÁRIO DE ADQUIRÊNCIA (TAXAS DE CARTÃO DE CRÉDITO / MAQUININHA)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dict_taxas_adquirencia_cartao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_nome varchar(50) NOT NULL,
    numero_parcelas integer NOT NULL,
    taxa_mdr_percentual numeric(6, 4) NOT NULL,
    taxa_antecipacao_percentual numeric(6, 4) NOT NULL,
    taxa_total_retida_percentual numeric(6, 4) GENERATED ALWAYS AS (taxa_mdr_percentual + taxa_antecipacao_percentual) STORED,
    data_atualizacao date NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(gateway_nome, numero_parcelas)
);

-- ---------------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dict_aneel_uf ON public.dict_concessionarias_aneel(uf_atuacao);
CREATE INDEX IF NOT EXISTS idx_dict_financeiras_banco ON public.dict_financeiras_taxas(banco_nome);
CREATE INDEX IF NOT EXISTS idx_dict_skus_categoria ON public.dict_fornecedores_skus(categoria);
