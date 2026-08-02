-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000039_38_RPC_RECONCILIACAO_LEDGER
-- Módulo: CICLO 13B — Plano 38E: RPC reconciliar_gateway_ledger() V14.0
-- 1. Função de Auditoria Contábil Automática cruzando Gateway vs. Ledger SHA-256
-- 2. Detecção imediata de divergências financeiras centesimais
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.reconciliar_gateway_ledger(
    p_tenant_id UUID
)
RETURNS TABLE (
    sucesso BOOLEAN,
    total_faturas_pagas NUMERIC,
    total_ledger_receita NUMERIC,
    divergencia NUMERIC,
    status_auditoria TEXT,
    mensagem TEXT
) AS $$
DECLARE
    v_total_faturas NUMERIC := 0;
    v_total_ledger NUMERIC := 0;
    v_diff NUMERIC := 0;
    v_status TEXT := 'PERFEITO';
    v_msg TEXT;
BEGIN
    -- 1. Somar total de faturas bancárias efetivamente liquidadas no Gateway
    SELECT COALESCE(SUM(valor_total), 0) INTO v_total_faturas
    FROM public.banking_faturas
    WHERE tenant_id = p_tenant_id
      AND status_pagamento = 'pago';

    -- 2. Somar total de receita escriturada no Ledger Partida Dobrada SHA-256
    SELECT COALESCE(SUM(valor), 0) INTO v_total_ledger
    FROM public.ledger_lancamentos
    WHERE tenant_id = p_tenant_id
      AND origem_tipo = 'faturamento_pedido';

    -- 3. Calcular divergência
    v_diff := ROUND(v_total_faturas - v_total_ledger, 2);

    IF v_diff = 0 THEN
        v_status := '100% CONCILIADO';
        v_msg := FORMAT('Auditoria Financeira Perfeita: R$ %s em Faturas Pagas bate 100%% com R$ %s escriturados no Ledger Contábil.', v_total_faturas, v_total_ledger);
        RETURN QUERY SELECT true, v_total_faturas, v_total_ledger, 0::NUMERIC, v_status, v_msg;
    ELSE
        v_status := 'DIVERGÊNCIA DETECTADA';
        v_msg := FORMAT('ATENÇÃO AUDITORIA: Encontrada divergência de R$ %s entre Faturas Pagas (R$ %s) e escrituração no Ledger (R$ %s).', v_diff, v_total_faturas, v_total_ledger);
        RETURN QUERY SELECT false, v_total_faturas, v_total_ledger, v_diff, v_status, v_msg;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reconciliar_gateway_ledger IS '🔒 AUDITORIA CONTINUA: Cruza em tempo real as faturas liquidadas pelo gateway com o livro-razão Ledger SHA-256 da Esol Energy.';
