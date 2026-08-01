-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000034_33_BATCH_OVERRIDES
-- Módulo: CICLO 11B3 — Escalabilidade de Rede & Processamento de Overrides em Lote V12.0
-- 1. Índice GiST no node_path (ltree) da tabela rede_mmn_nodes
-- 2. Tabela de Fila de Overrides Assíncronos (overrides_batch_queue)
-- 3. Função PostgreSQL processar_lote_overrides_mmn()
-- ==============================================================================

-- 1. Criar índice GiST no node_path para alta performance em redes com 100k+ nós
CREATE INDEX IF NOT EXISTS idx_rede_mmn_path_gist 
ON public.rede_mmn_nodes USING GIST (node_path);

-- 2. Tabela para Fila de Processamento em Lote de Overrides N1-N7
CREATE TABLE IF NOT EXISTS public.overrides_batch_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    pedido_id UUID NOT NULL,
    vendedor_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    valor_venda NUMERIC(15, 2) NOT NULL,
    status_processamento VARCHAR(30) NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'PROCESSADO', 'ERRO'
    tentativas INT NOT NULL DEFAULT 0,
    erro_mensagem TEXT,
    processado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.overrides_batch_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de Fila Overrides por Service Role"
ON public.overrides_batch_queue
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Escrita de Fila Overrides por Service Role"
ON public.overrides_batch_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Indexar itens pendentes
CREATE INDEX IF NOT EXISTS idx_overrides_batch_status 
ON public.overrides_batch_queue (status_processamento, created_at);

-- 3. Função PostgreSQL RPC para Processar Lote de Overrides N1-N7 de Forma Assíncrona
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
        FORMAT('Lote de overrides processado: %s sucessos, %s erros.', v_success_count, v_error_count);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.processar_lote_overrides_mmn IS 'Processa em lote a fila assíncrona de overrides N1-N7 para redes com 100k+ consultores com alta performance.';
