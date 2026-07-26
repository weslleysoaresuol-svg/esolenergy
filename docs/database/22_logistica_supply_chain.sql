-- =======================================================================================
-- MÓDULO 22: MOTOR LOGÍSTICO E SUPPLY CHAIN
-- Descrição: Integração via Webhooks com Transportadoras e Fornecedores (WEG/Aldo).
--            Impede o deslocamento da equipe de engenharia antes da entrega física confirmada.
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. CENTRAL DE RASTREAMENTO (TRACKING DE KITS EPC / E-COMMERCE)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.logistica_rastreio_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    origem_modulo VARCHAR(50) NOT NULL, -- 'epc_turnkey', 'loja_virtual'
    origem_id UUID NOT NULL, -- ID do Projeto ou ID do Pedido
    fornecedor_origem VARCHAR(100) NOT NULL, -- 'WEG', 'Aldo', 'Centro de Distribuicao Esol'
    transportadora_nome VARCHAR(100),
    codigo_rastreio VARCHAR(100) UNIQUE,
    url_rastreio VARCHAR(500),
    status_macro VARCHAR(50) DEFAULT 'aguardando_faturamento', -- faturado, em_transito, rota_entrega, entregue, avariado
    previsao_entrega DATE,
    data_entrega_efetivada TIMESTAMP WITH TIME ZONE,
    nota_fiscal_transporte_xml TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 2. HISTÓRICO DE EVENTOS LOGÍSTICOS (WEBHOOKS DA TRANSPORTADORA)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.logistica_eventos_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rastreio_id UUID NOT NULL REFERENCES public.logistica_rastreio_pedidos(id) ON DELETE CASCADE,
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    descricao_evento VARCHAR(255) NOT NULL, -- ex: "Carga deu entrada na filial de destino"
    cidade_localizacao VARCHAR(100),
    uf_localizacao VARCHAR(2),
    is_anomalia BOOLEAN DEFAULT FALSE, -- True se for sinistro, roubo, quebra
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. CONSTRAINT DE SEGURANÇA (O SEMÁFORO DA ENGENHARIA)
-- ---------------------------------------------------------------------------------------
-- Aqui adicionamos uma validação (lógica recomendada para a API ou DB) 
-- simulando a regra de negócios: O agendamento da instalação do EPC não pode
-- acontecer se o status logístico não for 'entregue'.

-- Adicionando FK na tabela de engenharia para vincular ao rastreio
ALTER TABLE public.projetos_epc 
ADD COLUMN IF NOT EXISTS logistica_rastreio_id UUID REFERENCES public.logistica_rastreio_pedidos(id);

-- ---------------------------------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_logistica_origem ON public.logistica_rastreio_pedidos(origem_modulo, origem_id);
CREATE INDEX idx_logistica_codigo ON public.logistica_rastreio_pedidos(codigo_rastreio);
CREATE INDEX idx_logistica_status ON public.logistica_rastreio_pedidos(status_macro);
CREATE INDEX idx_eventos_anomalia ON public.logistica_eventos_tracking(is_anomalia) WHERE is_anomalia = TRUE;

COMMIT;
