-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000035_34_CASH_BASIS_GATE
-- Módulo: CICLO 13A — Plano 38A: Gate de Liquidação Bancária em Caixa Real V14.0
-- 1. Adicionar colunas de liquidação bancária na tabela overrides_batch_queue
-- 2. Atualizar a RPC processar_lote_overrides_mmn() com trava estrita de pagamento_liquidado
-- ==============================================================================

-- 1. Adicionar colunas pagamento_liquidado e fatura_id na fila de overrides se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'overrides_batch_queue' 
          AND column_name = 'pagamento_liquidado'
    ) THEN
        ALTER TABLE public.overrides_batch_queue 
        ADD COLUMN pagamento_liquidado BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'overrides_batch_queue' 
          AND column_name = 'fatura_id'
    ) THEN
        ALTER TABLE public.overrides_batch_queue 
        ADD COLUMN fatura_id UUID REFERENCES public.banking_faturas(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Índice para otimizar busca de itens pendentes E com pagamento estritamente liquidado
CREATE INDEX IF NOT EXISTS idx_overrides_liquidado_status 
ON public.overrides_batch_queue (pagamento_liquidado, status_processamento, created_at);

-- 2. Atualizar a RPC processar_lote_overrides_mmn() para TRAVAR qualquer escrituração se pagamento_liquidado = FALSE
CREATE OR REPLACE FUNCTION public.processar_lote_overrides_mmn(
    p_limite_lote INT DEFAULT 100
)
RETURNS TABLE (
    total_processados INT,
    total_erros INT,
    mensagem TEXT
) AS $$
DECLARE
    r_item RECORD;
    v_success_count INT := 0;
    v_error_count INT := 0;
    v_seller_path ltree;
    v_ancestry_node RECORD;
    v_nivel_override INT;
    v_comissao_unitaria NUMERIC;
BEGIN
    FOR r_item IN 
        SELECT * FROM public.overrides_batch_queue 
        WHERE status_processamento = 'PENDENTE' 
          AND pagamento_liquidado = TRUE  -- 🔒 TRAVA CASH-BASIS: Só escritura se o dinheiro entrou no caixa!
        ORDER BY created_at ASC 
        LIMIT p_limite_lote
        FOR UPDATE SKIP LOCKED
    LOOP
        BEGIN
            -- Obter path do vendedor
            SELECT node_path INTO v_seller_path 
            FROM public.rede_mmn_nodes 
            WHERE profile_id = r_item.vendedor_profile_id LIMIT 1;

            IF v_seller_path IS NOT NULL THEN
                -- Obter 7 níveis de ancestrais na árvore MMN
                v_nivel_override := 1;
                FOR v_ancestry_node IN 
                    SELECT n.profile_id, n.node_path 
                    FROM public.rede_mmn_nodes n
                    WHERE n.node_path @> v_seller_path
                      AND n.profile_id != r_item.vendedor_profile_id
                    ORDER BY nlevel(n.node_path) DESC
                    LIMIT 7
                LOOP
                    -- 1% por nível (Override Igualitário 7 Níveis = 7%)
                    v_comissao_unitaria := r_item.valor_venda * 0.01;

                    -- Escriturar comissão no ledger / historico
                    INSERT INTO public.historico_comissoes_epc (
                        tenant_id,
                        consultor_profile_id,
                        pedido_id,
                        nivel_origem,
                        valor_comissao,
                        modalidade_produto,
                        status_saque,
                        created_at
                    ) VALUES (
                        r_item.tenant_id,
                        v_ancestry_node.profile_id,
                        r_item.pedido_id,
                        v_nivel_override,
                        v_comissao_unitaria,
                        'OVERRIDE_REDE_BATCH',
                        'PENDENTE',
                        NOW()
                    );

                    v_nivel_override := v_nivel_override + 1;
                END LOOP;
            END IF;

            -- Marcar item da fila como PROCESSADO
            UPDATE public.overrides_batch_queue
            SET status_processamento = 'PROCESSADO',
                processado_em = NOW()
            WHERE id = r_item.id;

            v_success_count := v_success_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            UPDATE public.overrides_batch_queue
            SET status_processamento = 'ERRO',
                tentativas = tentativas + 1,
                erro_mensagem = SQLERRM
            WHERE id = r_item.id;
        END;
    END LOOP;

    RETURN QUERY SELECT 
        v_success_count, 
        v_error_count, 
        FORMAT('Lote de overrides cash-basis processado: %s sucessos, %s erros.', v_success_count, v_error_count);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.processar_lote_overrides_mmn IS '🔒 SEGURANÇA ABSOLUTA: Processa em lote overrides MMN EXCLUSIVAMENTE para pedidos com pagamento_liquidado = TRUE (dinheiro no caixa).';
