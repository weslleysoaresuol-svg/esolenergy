-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000030_29_ANTI_STACKING
-- Módulo: CICLO 11A1 — Anti-Fraude de Rede & Regra Anti-Stacking V12.0
-- 1. Função PostgreSQL verificar_anti_stacking()
-- 2. Tabela de Registros de Stacking Anulados (mmn_stacking_log)
-- 3. Trigger / RPC de Validação para anular Selos e EcoPoints sem afetar comissões financeiras
-- ==============================================================================

-- 1. Tabela para Log de Tentativas ou Ocorrências de Stacking Anuladas
CREATE TABLE IF NOT EXISTS public.mmn_stacking_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    pedido_id UUID NOT NULL,
    buyer_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nivel_distancia INT NOT NULL, -- Distância no ltree ou hierarquia (0 = self, 1..3 = linha direta)
    motivo VARCHAR(255) NOT NULL DEFAULT 'Venda auto-circular ou em linha direta ascendente/descendente (Anti-Stacking N3)',
    pontos_selo_anulados NUMERIC(15, 2) NOT NULL DEFAULT 0,
    ecopoints_anulados INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.mmn_stacking_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de Log Stacking por Admin e Service Role"
ON public.mmn_stacking_log
FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "Escrita de Log Stacking por Service Role"
ON public.mmn_stacking_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Função PostgreSQL para Verificar Stacking entre Comprador e Vendedor
CREATE OR REPLACE FUNCTION public.verificar_anti_stacking(
    p_buyer_profile_id UUID,
    p_seller_profile_id UUID
)
RETURNS TABLE (
    is_stacking BOOLEAN,
    distancia_niveis INT,
    mensagem TEXT
) AS $$
DECLARE
    v_buyer_path ltree;
    v_seller_path ltree;
    v_distancia INT := 999;
BEGIN
    -- Se comprador e vendedor forem a mesma pessoa
    IF p_buyer_profile_id = p_seller_profile_id THEN
        RETURN QUERY SELECT 
            true, 
            0, 
            'Compra auto-referenciada (comprador e vendedor são a mesma conta). Pontos de carreira e EcoPoints anulados.';
        RETURN;
    END IF;

    -- Buscar paths ltree das duas contas na hierarquia MMN
    SELECT node_path INTO v_buyer_path FROM public.rede_mmn_nodes WHERE profile_id = p_buyer_profile_id LIMIT 1;
    SELECT node_path INTO v_seller_path FROM public.rede_mmn_nodes WHERE profile_id = p_seller_profile_id LIMIT 1;

    -- Se um dos nós não estiver registrado na árvore MMN, não há stacking MMN de rede
    IF v_buyer_path IS NULL OR v_seller_path IS NULL THEN
        RETURN QUERY SELECT false, 999, 'Venda regular para cliente final externo à árvore MMN.';
        RETURN;
    END IF;

    -- Verificar se o vendedor é ancestral do comprador
    IF v_buyer_path <@ v_seller_path THEN
        v_distancia := nlevel(v_buyer_path) - nlevel(v_seller_path);
        IF v_distancia <= 3 THEN
            RETURN QUERY SELECT 
                true, 
                v_distancia, 
                FORMAT('Comprador é descendente direto N%s do vendedor. Regra Anti-Stacking N3 ativada.', v_distancia);
            RETURN;
        END IF;
    END IF;

    -- Verificar se o comprador é ancestral do vendedor
    IF v_seller_path <@ v_buyer_path THEN
        v_distancia := nlevel(v_seller_path) - nlevel(v_buyer_path);
        IF v_distancia <= 3 THEN
            RETURN QUERY SELECT 
                true, 
                v_distancia, 
                FORMAT('Comprador é ascendente direto N%s do vendedor. Regra Anti-Stacking N3 ativada.', v_distancia);
            RETURN;
        END IF;
    END IF;

    -- Se ultrapassou N3 ou estão em pernas diferentes sem relação direta N3
    RETURN QUERY SELECT false, v_distancia, 'Venda em pernas independentes ou distância > 3 níveis. Pontos válidos.';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.verificar_anti_stacking IS 'Cruza as contas do comprador e vendedor no ltree da árvore MMN para anular acúmulo artificial de pontos e selos (anti-stacking N3).';

-- 3. Função Handler que é invocada ao escriturar a venda para ajustar pontos
CREATE OR REPLACE FUNCTION public.processar_pontuacao_venda_anti_stacking(
    p_pedido_id UUID,
    p_buyer_profile_id UUID,
    p_seller_profile_id UUID,
    p_pontos_selo_brutos NUMERIC,
    p_ecopoints_brutos INT
)
RETURNS TABLE (
    pontos_selo_concedidos NUMERIC,
    ecopoints_concedidos INT,
    was_anulado BOOLEAN,
    motivo_anulacao TEXT
) AS $$
DECLARE
    v_is_stacking BOOLEAN;
    v_distancia INT;
    v_msg TEXT;
BEGIN
    SELECT is_stacking, distancia_niveis, mensagem
    INTO v_is_stacking, v_distancia, v_msg
    FROM public.verificar_anti_stacking(p_buyer_profile_id, p_seller_profile_id);

    IF v_is_stacking THEN
        -- Registrar log de stacking
        INSERT INTO public.mmn_stacking_log (
            pedido_id,
            buyer_profile_id,
            seller_profile_id,
            nivel_distancia,
            motivo,
            pontos_selo_anulados,
            ecopoints_anulados
        ) VALUES (
            p_pedido_id,
            p_buyer_profile_id,
            p_seller_profile_id,
            v_distancia,
            v_msg,
            p_pontos_selo_brutos,
            p_ecopoints_brutos
        );

        RETURN QUERY SELECT 0::NUMERIC, 0::INT, true, v_msg;
    ELSE
        RETURN QUERY SELECT p_pontos_selo_brutos, p_ecopoints_brutos, false, 'Pontuação concedida com sucesso.';
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.processar_pontuacao_venda_anti_stacking IS 'Processa e zera os pontos de carreira e EcoPoints se for detectado stacking, sem interferir no repasse financeiro no PIX.';
