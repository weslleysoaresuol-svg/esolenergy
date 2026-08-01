-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000033_32_CARENCIA_SAQUE
-- Módulo: CICLO 11B1 — Proteção Financeira & Carência de 30 Dias V12.0
-- 1. Alteração da Tabela historico_comissoes_epc (campo data_liberacao_saque)
-- 2. Atualização da RPC solicitar_saque_pix() com validação de carência
-- ==============================================================================

-- 1. Adicionar data_liberacao_saque se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'historico_comissoes_epc' 
          AND column_name = 'data_liberacao_saque'
    ) THEN
        ALTER TABLE public.historico_comissoes_epc 
        ADD COLUMN data_liberacao_saque TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days');
    END IF;
END $$;

-- Indexar para otimizar busca de saldo disponível para saque
CREATE INDEX IF NOT EXISTS idx_comissoes_liberacao_saque 
ON public.historico_comissoes_epc (consultor_profile_id, data_liberacao_saque, status_saque);

-- 2. Atualizar ou Criar a RPC solicitar_saque_pix() com Trava de Carência
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

    -- Calcular saldo totalmente liberado (data_liberacao_saque <= NOW())
    SELECT COALESCE(SUM(valor_comissao), 0) INTO v_saldo_liberado
    FROM public.historico_comissoes_epc
    WHERE consultor_profile_id = p_consultor_id
      AND status_saque = 'PENDENTE'
      AND data_liberacao_saque <= NOW();

    -- Calcular saldo bloqueado temporariamente em carência (data_liberacao_saque > NOW())
    SELECT COALESCE(SUM(valor_comissao), 0) INTO v_saldo_bloqueado
    FROM public.historico_comissoes_epc
    WHERE consultor_profile_id = p_consultor_id
      AND status_saque = 'PENDENTE'
      AND data_liberacao_saque > NOW();

    -- Verificar se o saldo liberado atende à solicitação
    IF v_saldo_liberado < p_valor_solicitado THEN
        RETURN QUERY SELECT 
            false, 
            v_saldo_liberado, 
            v_saldo_bloqueado, 
            NULL::UUID, 
            FORMAT('Saldo liberado insuficiente (R$ %s). Você possui R$ %s bloqueados em carência de 30 dias.', v_saldo_liberado, v_saldo_bloqueado);
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
      AND data_liberacao_saque <= NOW()
      AND id IN (
          SELECT id FROM public.historico_comissoes_epc
          WHERE consultor_profile_id = p_consultor_id AND status_saque = 'PENDENTE' AND data_liberacao_saque <= NOW()
          LIMIT 50
      );

    RETURN QUERY SELECT 
        true, 
        (v_saldo_liberado - p_valor_solicitado), 
        v_saldo_bloqueado, 
        v_saque_novo_id, 
        'Solicitação de saque PIX registrada com sucesso. Processamento automático em até 24h.';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.solicitar_saque_pix IS 'Verifica a carência de 30 dias para vendas únicas antes de liberar o saque via PIX, mantendo o saldo em carência visível porem bloqueado.';
