-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000040_39_RPC_REVERSAO_INADIMPLENCIA
-- Módulo: CICLO 13B — Plano 38F: RPC reverter_comissoes_inadimplencia() V14.0
-- 1. Função de Estorno em Cascata de Comissões MMN N1-N7 por Distrato / Inadimplência
-- 2. Atualização de Faturas, Fila de Overrides e Escrituração de Estorno no Ledger SHA-256
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.reverter_comissoes_inadimplencia(
    p_pedido_id UUID,
    p_motivo TEXT DEFAULT 'DISTRACT_CANCELAMENTO_CLIENTE'
)
RETURNS TABLE (
    sucesso BOOLEAN,
    pedido_id UUID,
    total_comissoes_revertidas INT,
    valor_estornado NUMERIC,
    mensagem TEXT
) AS $$
DECLARE
    v_total_comissoes INT := 0;
    v_valor_total NUMERIC := 0;
    v_tenant_id UUID;
    v_fatura RECORD;
    v_conta_caixa_id UUID;
    v_conta_estorno_id UUID;
BEGIN
    -- 1. Buscar fatura associada
    SELECT * INTO v_fatura 
    FROM public.banking_faturas 
    WHERE origem_id = p_pedido_id LIMIT 1;

    IF v_fatura.id IS NOT NULL THEN
        v_tenant_id := v_fatura.tenant_id;

        -- Cancelar status da fatura bancária
        UPDATE public.banking_faturas
        SET status_pagamento = 'cancelado',
            updated_at = NOW()
        WHERE id = v_fatura.id;
    END IF;

    -- 2. Cancelar pendências na fila de overrides assíncronos
    UPDATE public.overrides_batch_queue
    SET status_processamento = 'CANCELADO',
        erro_mensagem = FORMAT('Pedido estornado/cancelado: %s', p_motivo)
    WHERE pedido_id = p_pedido_id;

    -- 3. Revogar todas as comissões da cadeia de 7 níveis no histórico
    SELECT COUNT(*), COALESCE(SUM(valor_comissao), 0) 
    INTO v_total_comissoes, v_valor_total
    FROM public.historico_comissoes_epc
    WHERE pedido_id = p_pedido_id
      AND status_saque IN ('PENDENTE', 'SOLICITADO');

    UPDATE public.historico_comissoes_epc
    SET status_saque = 'CANCELADO',
        pagamento_liquidado = FALSE
    WHERE pedido_id = p_pedido_id
      AND status_saque IN ('PENDENTE', 'SOLICITADO');

    -- 4. Escrituração Contábil de Estorno/Cancelamento no Ledger SHA-256
    IF v_tenant_id IS NOT NULL THEN
        SELECT id INTO v_conta_caixa_id 
        FROM public.ledger_contas 
        WHERE tenant_id = v_tenant_id AND codigo LIKE '1.1%' LIMIT 1;

        SELECT id INTO v_conta_estorno_id 
        FROM public.ledger_contas 
        WHERE tenant_id = v_tenant_id AND codigo LIKE '3.1%' LIMIT 1;

        IF v_conta_caixa_id IS NOT NULL AND v_conta_estorno_id IS NOT NULL THEN
            INSERT INTO public.ledger_lancamentos (
                tenant_id,
                descricao,
                conta_debito_id,
                conta_credito_id,
                valor,
                origem_tipo,
                origem_id,
                hash_transacao
            ) VALUES (
                v_tenant_id,
                FORMAT('Estorno Contábil por Inadimplência/Cancelamento Pedido %s (Motivo: %s)', p_pedido_id, p_motivo),
                v_conta_estorno_id,  -- Débito: Reversão de Receita
                v_conta_caixa_id,    -- Crédito: Ajuste de Caixa
                COALESCE(v_fatura.valor_total, 0),
                'cancelamento',
                p_pedido_id,
                encode(digest(NOW()::text || p_pedido_id::text || 'ESTORNO', 'sha256'), 'hex')
            );
        END IF;
    END IF;

    RETURN QUERY SELECT 
        true, 
        p_pedido_id, 
        v_total_comissoes, 
        v_valor_total, 
        FORMAT('Reversão em cascata concluída com sucesso: %s comissões anuladas, R$ %s bloqueados.', v_total_comissoes, v_valor_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reverter_comissoes_inadimplencia IS '🔒 SEGURANÇA ABSOLUTA: Anula em cascata todas as comissões MMN e lança estorno contábil no Ledger SHA-256 se o pedido for cancelado ou distratado.';
