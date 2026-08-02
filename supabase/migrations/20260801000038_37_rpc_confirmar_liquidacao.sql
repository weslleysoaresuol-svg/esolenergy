-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000038_37_RPC_CONFIRMAR_LIQUIDACAO
-- Módulo: CICLO 13B — Plano 38D: RPC confirmar_liquidacao_pagamento() V14.0
-- 1. Função PostgreSQL centralizadora acionada via Webhook de Gateway (Asaas/Stripe)
-- 2. Atualização de Fatura, Fila de Overrides e Histórico com escrituração no Ledger SHA-256
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.confirmar_liquidacao_pagamento(
    p_fatura_id UUID,
    p_transacao_gateway_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    sucesso BOOLEAN,
    fatura_id UUID,
    pedido_id UUID,
    valor_liquidado NUMERIC,
    mensagem TEXT
) AS $$
DECLARE
    v_fatura RECORD;
    v_pedido_id UUID;
    v_tenant_id UUID;
    v_conta_caixa_id UUID;
    v_conta_receita_id UUID;
BEGIN
    -- 1. Buscar a fatura no banco
    SELECT * INTO v_fatura 
    FROM public.banking_faturas 
    WHERE id = p_fatura_id FOR UPDATE;

    IF v_fatura.id IS NULL THEN
        RETURN QUERY SELECT false, p_fatura_id, NULL::UUID, 0::NUMERIC, 'Fatura bancária não encontrada no ecossistema.';
        RETURN;
    END IF;

    IF v_fatura.status_pagamento = 'pago' THEN
        RETURN QUERY SELECT true, p_fatura_id, v_fatura.origem_id, v_fatura.valor_total, 'Pagamento já havia sido liquidado anteriormente.';
        RETURN;
    END IF;

    v_pedido_id := v_fatura.origem_id;
    v_tenant_id := v_fatura.tenant_id;

    -- 2. Atualizar status da fatura para PAGO
    UPDATE public.banking_faturas
    SET status_pagamento = 'pago',
        data_pagamento = NOW(),
        updated_at = NOW()
    WHERE id = p_fatura_id;

    -- 3. Liberar itens da fila de overrides MMN (pagamento_liquidado = TRUE)
    UPDATE public.overrides_batch_queue
    SET pagamento_liquidado = TRUE,
        fatura_id = p_fatura_id
    WHERE pedido_id = v_pedido_id 
       OR id = p_fatura_id;

    -- 4. Atualizar comissões já escrituradas no histórico (pagamento_liquidado = TRUE e carência inicia contagem)
    UPDATE public.historico_comissoes_epc
    SET pagamento_liquidado = TRUE,
        data_liberacao_saque = NOW() + INTERVAL '30 days'
    WHERE pedido_id = v_pedido_id;

    -- 5. Atualizar status do repasse no Split
    UPDATE public.banking_transacoes_split
    SET status_repasse = 'liberado_para_processamento'
    WHERE fatura_id = p_fatura_id;

    -- 6. Escrituração Contábil Automática no Ledger Partida Dobrada SHA-256
    SELECT id INTO v_conta_caixa_id 
    FROM public.ledger_contas 
    WHERE tenant_id = v_tenant_id AND codigo LIKE '1.1%' LIMIT 1;

    SELECT id INTO v_conta_receita_id 
    FROM public.ledger_contas 
    WHERE tenant_id = v_tenant_id AND codigo LIKE '3.1%' LIMIT 1;

    IF v_conta_caixa_id IS NOT NULL AND v_conta_receita_id IS NOT NULL THEN
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
            FORMAT('Liquidação Bancária Real Cash-Basis Fatura %s (Pedido %s)', p_fatura_id, v_pedido_id),
            v_conta_caixa_id,     -- Débito: Entrada de Caixa/Banco
            v_conta_receita_id,   -- Crédito: Receita Operacional Efetivada
            v_fatura.valor_total,
            'faturamento_pedido',
            v_pedido_id,
            encode(digest(NOW()::text || p_fatura_id::text || v_fatura.valor_total::text, 'sha256'), 'hex')
        );
    END IF;

    RETURN QUERY SELECT 
        true, 
        p_fatura_id, 
        v_pedido_id, 
        v_fatura.valor_total, 
        'Liquidação bancária em Caixa Real processada com sucesso. Comissões e Ledger liberados.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.confirmar_liquidacao_pagamento IS '🔒 MOTOR CASH-BASIS: Processa a confirmação real de pagamento recebida do gateway, liberando comissões e efetuando escrituração no Ledger SHA-256.';
