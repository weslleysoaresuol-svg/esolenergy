-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260726000028_27_TRAVA_VME_CARREIRA
-- Módulo: Harmonização de Carreira MMN - Separação da Trava VME (40%) Exclusiva para Selos e Prêmios
-- ==============================================================================

-- 1. Tabela para histórico de qualificações de carreira com apuração de VME 40%
CREATE TABLE IF NOT EXISTS public.mmn_qualificacoes_carreira (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rank_atual VARCHAR(50) NOT NULL DEFAULT 'Consultor Bronze',
    rank_qualificado VARCHAR(50) NOT NULL,
    pontos_totais_rede NUMERIC(15, 2) NOT NULL DEFAULT 0,
    pontos_validos_vme NUMERIC(15, 2) NOT NULL DEFAULT 0,
    vme_aplicado_percentual NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
    perna_dominante_percentual NUMERIC(5, 2) DEFAULT 0.00,
    data_qualificacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ecopoints_concedidos INT DEFAULT 0,
    trofeu_liberado BOOLEAN DEFAULT false,
    viagem_liberada BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.mmn_qualificacoes_carreira ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultores e Admins visualizam qualificações"
ON public.mmn_qualificacoes_carreira
FOR ALL
TO authenticated, service_role
USING (true)
WITH CHECK (true);

-- 2. Função PostgreSQL para validar qualificação de carreira com VME 40% sem afetar dinheiro no PIX
CREATE OR REPLACE FUNCTION public.validar_qualificacao_vme_carreira(
    p_profile_id UUID,
    p_pontos_necessarios NUMERIC,
    p_vme_limite NUMERIC DEFAULT 40.0
)
RETURNS TABLE (
    is_qualificado BOOLEAN,
    pontos_totais NUMERIC,
    pontos_validos NUMERIC,
    maior_perna_percentual NUMERIC,
    mensagem TEXT
) AS $$
DECLARE
    v_total_pontos NUMERIC := 0;
    v_max_pontos_perna NUMERIC := 0;
    v_teto_por_perna NUMERIC;
    v_pontos_validos NUMERIC := 0;
    v_perna_pct NUMERIC := 0;
    v_qualificado BOOLEAN := false;
BEGIN
    -- Teto máximo em pontos que 1 única perna pode contribuir para a graduação
    v_teto_por_perna := p_pontos_necessarios * (p_vme_limite / 100.0);

    -- Buscar volume total de pontos por perna direta do consultor
    WITH pernas_volume AS (
        SELECT 
            n.id AS node_id,
            COALESCE(SUM(l.valor), 0) AS volume_perna
        FROM public.rede_mmn_nodes n
        LEFT JOIN public.ledger_lancamentos l ON l.origem_id = n.profile_id
        WHERE n.node_path <@ (
            SELECT node_path FROM public.rede_mmn_nodes WHERE profile_id = p_profile_id LIMIT 1
        )
        AND n.profile_id != p_profile_id
        GROUP BY n.id
    )
    SELECT 
        COALESCE(SUM(volume_perna), 0),
        COALESCE(MAX(volume_perna), 0),
        COALESCE(SUM(LEAST(volume_perna, v_teto_por_perna)), 0)
    INTO v_total_pontos, v_max_pontos_perna, v_pontos_validos
    FROM pernas_volume;

    IF v_total_pontos > 0 THEN
        v_perna_pct := ROUND((v_max_pontos_perna / v_total_pontos) * 100.0, 2);
    END IF;

    IF v_pontos_validos >= p_pontos_necessarios THEN
        v_qualificado := true;
    END IF;

    RETURN QUERY SELECT 
        v_qualificado,
        v_total_pontos,
        v_pontos_validos,
        v_perna_pct,
        CASE 
            WHEN v_qualificado THEN 'Qualificação aprovada! A trava VME de 40% foi respeitada para concessão de selos e prêmios.'
            ELSE 'Pontuação atingida em perna única excede o limite VME de 40%. Desenvolva novas pernas para liberar a graduação.'
        END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.validar_qualificacao_vme_carreira IS 'Calcula pontos válidos de graduação MMN aplicando VME 40% exclusivamente para selos, troféus e EcoPoints. Não afeta os repasses de comissão em dinheiro no PIX.';
