-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000037_36_CARENCIA_LIQUIDACAO_GATE
-- Módulo: CICLO 13A — Plano 38C: Carência Condicionada à Liquidação Bancária V14.0
-- 1. Alterar data_liberacao_saque para NULL por padrão (não mais um timer cego de 30 dias)
-- 2. Atualizar RPC solicitar_saque_pix() com dupla trava de segurança (liquidação real)
-- ==============================================================================

-- 1. Alterar default da coluna data_liberacao_saque em historico_comissoes_epc
ALTER TABLE public.historico_comissoes_epc 
ALTER COLUMN data_liberacao_saque DROP DEFAULT,
ALTER COLUMN data_liberacao_saque DROP NOT NULL,
ALTER COLUMN data_liberacao_saque SET DEFAULT NULL;

-- Adicionar coluna pagamento_liquidado se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'historico_comissoes_epc' 
          AND column_name = 'pagamento_liquidado'
    ) THEN
        ALTER TABLE public.historico_comissoes_epc 
        ADD COLUMN pagamento_liquidado BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Atualizar índice para buscar saldos com liberação confirmada pós-liquidação
DROP INDEX IF EXISTS idx_comissoes_liberacao_saque;

CREATE INDEX idx_comissoes_liberacao_saque_cash_basis 
ON public.historico_comissoes_epc (consultor_profile_id, pagamento_liquidado, data_liberacao_saque, status_saque);

-- 2. Atualizar a RPC solicitar_saque_pix() exigindo pagamento_liquidado = TRUE E data_liberacao_saque <= NOW()
CREATE OR REPLACE FUNCTION public.solicitar_saque_pix(
    p_consultor_id UUID,
    p_valor_solicitado NUMERIC
)
RETURNS TABLE (
    sucesso BOOLEAN,
    saldo_disponivel NUMERIC,
    saldo_bloqueado_carencia NUMERIC,
    saque_id UUID,
    mensagem TEXT
) AS $$
DECLARE
    v_saldo_liberado NUMERIC := 0;
    v_saldo_bloqueado NUMERIC := 0;
    v_saque_novo_id UUID;
BEGIN
    -- Validar valor mínimo de saque (R$ 50,00)
    IF p_valor_solicitado < 50.00 THEN
        RETURN QUERY SELECT false, 0::NUMERIC, 0::NUMERIC, NULL::UUID, 'O valor mínimo para solicitação de saque PIX é R$ 50,00.';
        RETURN;
    END IF;

    -- 🔒 TRAVA CASH-BASIS: Saldo totalmente liberado exige pagamento_liquidado = TRUE e data_liberacao_saque <= NOW()
    SELECT COALESCE(SUM(valor_comissao), 0) INTO v_saldo_liberado
    FROM public.historico_comissoes_epc
    WHERE consultor_profile_id = p_consultor_id
      AND status_saque = 'PENDENTE'
      AND pagamento_liquidado = TRUE
      AND data_liberacao_saque IS NOT NULL
      AND data_liberacao_saque <= NOW();

    -- Saldo temporariamente bloqueado (aguardando liquidação bancária ou período de carência)
    SELECT COALESCE(SUM(valor_comissao), 0) INTO v_saldo_bloqueado
    FROM public.historico_comissoes_epc
    WHERE consultor_profile_id = p_consultor_id
      AND status_saque = 'PENDENTE'
      AND (
        pagamento_liquidado = FALSE 
        OR data_liberacao_saque IS NULL 
        OR data_liberacao_saque > NOW()
      );

    -- Verificar se o saldo liberado atende à solicitação
    IF v_saldo_liberado < p_valor_solicitado THEN
        RETURN QUERY SELECT 
            false, 
            v_saldo_liberado, 
            v_saldo_bloqueado, 
            NULL::UUID, 
            FORMAT('Saldo liberado insuficiente (R$ %s). Você possui R$ %s pendentes de liquidação bancária / carência.', v_saldo_liberado, v_saldo_bloqueado);
        RETURN;
    END IF;

    -- Registrar a solicitação de saque
    INSERT INTO public.solicitacoes_saque_pix (
        consultor_profile_id,
        valor,
        status,
        created_at
    ) VALUES (
        p_consultor_id,
        p_valor_solicitado,
        'EM_PROCESSAMENTO',
        NOW()
    ) RETURNING id INTO v_saque_novo_id;

    -- Atualizar status das comissões liberadas utilizadas
    UPDATE public.historico_comissoes_epc
    SET status_saque = 'SOLICITADO'
    WHERE consultor_profile_id = p_consultor_id
      AND status_saque = 'PENDENTE'
      AND pagamento_liquidado = TRUE
      AND data_liberacao_saque IS NOT NULL
      AND data_liberacao_saque <= NOW()
      AND id IN (
          SELECT id FROM public.historico_comissoes_epc
          WHERE consultor_profile_id = p_consultor_id 
            AND status_saque = 'PENDENTE' 
            AND pagamento_liquidado = TRUE
            AND data_liberacao_saque IS NOT NULL
            AND data_liberacao_saque <= NOW()
          LIMIT 50
      );

    RETURN QUERY SELECT 
        true, 
        (v_saldo_liberado - p_valor_solicitado), 
        v_saldo_bloqueado, 
        v_saque_novo_id, 
        'Solicitação de saque PIX registrada com sucesso. Processamento automático em até 24h.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.solicitar_saque_pix IS '🔒 SEGURANÇA ABSOLUTA: Permite saque PIX EXCLUSIVAMENTE para comissões com liquidação bancária confirmada (pagamento_liquidado = TRUE) e carência cumprida.';
