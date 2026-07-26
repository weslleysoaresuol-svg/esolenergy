-- =======================================================================================
-- MÓDULO 23: COFRE DE DADOS DE MERCADO (PRICING VAULT)
-- Descrição: Dicionário central de Tarifas ANEEL, Impostos Estaduais (SEFAZ),
--            Tabelas de Financiamento Bancário (CET) e Custos de Hardware (B2B).
--            Isola as regras variáveis do Motor Reverso (Módulo 3).
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. DICIONÁRIO DE TARIFAS DE ENERGIA (ANEEL)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.dict_concessionarias_aneel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_concessionaria VARCHAR(150) NOT NULL UNIQUE, -- Ex: 'CPFL Paulista', 'Enel SP'
    uf_atuacao VARCHAR(2) NOT NULL,
    tarifa_b1_residencial NUMERIC(10, 6) NOT NULL, -- R$/kWh
    tarifa_b2_rural NUMERIC(10, 6) NOT NULL,
    tarifa_b3_comercial NUMERIC(10, 6) NOT NULL,
    fator_fio_b_percentual NUMERIC(5, 4) NOT NULL, -- Lei 14.300 (ex: 30% em 2024 = 0.3000)
    taxa_iluminacao_publica_media NUMERIC(10, 2), -- CIP/COSIP
    data_ultima_revisao_tarifaria DATE NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 2. DICIONÁRIO DE TRIBUTOS ESTADUAIS E FEDERAIS (SEFAZ / RFB)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.dict_tributos_estaduais (
    uf VARCHAR(2) PRIMARY KEY,
    aliquota_icms_energia_percentual NUMERIC(5, 4) NOT NULL, -- Ex: 0.1800 (18%)
    aliquota_icms_equipamentos_percentual NUMERIC(5, 4) NOT NULL,
    possui_convenio_confaz_isencao_gd BOOLEAN DEFAULT TRUE, -- Convênio ICMS 16/2015
    data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------------------------
-- 3. DICIONÁRIO DE FINANCIAMENTOS (BANCOS E TAXAS)
-- ---------------------------------------------------------------------------------------
-- Essencial para compor o "Pague em 72x" nas propostas de Venda Direta (Turnkey)
CREATE TABLE public.dict_financeiras_taxas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banco_nome VARCHAR(100) NOT NULL, -- 'Santander', 'BV Financeira', 'Solfácil'
    tipo_cliente VARCHAR(20) NOT NULL, -- 'PF' ou 'PJ'
    prazo_meses INTEGER NOT NULL, -- Ex: 72
    carencia_meses INTEGER DEFAULT 0, -- Ex: 6 (Pague a primeira em 6 meses)
    taxa_juros_mes_percentual NUMERIC(6, 4) NOT NULL, -- Ex: 1.49% = 0.0149
    cet_mes_percentual NUMERIC(6, 4) NOT NULL, -- Custo Efetivo Total
    fator_multiplicador NUMERIC(8, 6) NOT NULL, -- Fator direto para multiplicar o valor à vista
    taxa_abertura_credito_tac NUMERIC(10, 2) DEFAULT 0.00,
    is_ativo BOOLEAN DEFAULT TRUE,
    data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(banco_nome, tipo_cliente, prazo_meses)
);

-- ---------------------------------------------------------------------------------------
-- 4. CATÁLOGO B2B DE FORNECEDORES (HARDWARE)
-- ---------------------------------------------------------------------------------------
-- Atualizado via CSV ou API para refletir o custo real dos Inversores e Painéis
CREATE TABLE public.dict_fornecedores_skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fornecedor_nome VARCHAR(100) NOT NULL, -- 'WEG', 'Aldo Solar', 'Serrana'
    codigo_sku VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'PAINEL', 'INVERSOR', 'MICROINVERSOR', 'CABO'
    potencia_w NUMERIC(10, 2), -- Potência em Watts
    custo_compra_bruto NUMERIC(15, 2) NOT NULL,
    peso_kg NUMERIC(10, 2) NOT NULL, -- Essencial para cálculo de frete logístico
    link_api_estoque VARCHAR(500),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fornecedor_nome, codigo_sku)
);

-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
-- 5. DICIONÁRIO DE ADQUIRÊNCIA (TAXAS DE CARTÃO DE CRÉDITO / MAQUININHA)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.dict_taxas_adquirencia_cartao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_nome VARCHAR(50) NOT NULL, -- 'Stone', 'Cielo', 'Pagar.me'
    numero_parcelas INTEGER NOT NULL, -- 1 a 12 (ou 21)
    taxa_mdr_percentual NUMERIC(6, 4) NOT NULL, -- Taxa transacional base (ex: 1.5%)
    taxa_antecipacao_percentual NUMERIC(6, 4) NOT NULL, -- Taxa para receber à vista
    taxa_total_retida_percentual NUMERIC(6, 4) GENERATED ALWAYS AS (taxa_mdr_percentual + taxa_antecipacao_percentual) STORED,
    data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(gateway_nome, numero_parcelas)
);

-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_dict_aneel_uf ON public.dict_concessionarias_aneel(uf_atuacao);
CREATE INDEX idx_dict_financeiras_banco ON public.dict_financeiras_taxas(banco_nome);
CREATE INDEX idx_dict_skus_categoria ON public.dict_fornecedores_skus(categoria);

COMMIT;
