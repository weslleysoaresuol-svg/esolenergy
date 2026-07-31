-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260726000029_28_SELOS_GRUPOS_LIDERANCA
-- Módulo: CICLO 10A — Soberania de Vendas & Carreira de Liderança MMN V11.0
-- 1. Selos de Vendedores (L1 a L21 em 7 Grupos: Terra, Água, Ar, Fogo, Astros, Fenômenos, Conquistadores - 0% VME)
-- 2. Carreira de Liderança MMN (Graus A1 a A9 - Trava VME 40% em validar_qualificacao_vme_lideranca)
-- 3. Trava VME Inteligente para EcoPoints de Equipe (validar_acumulo_ecopoints_vme)
-- ==============================================================================

-- 1. Tabela para Histórico de Selos de Vendedores Diretos (0% Trava VME)
CREATE TABLE IF NOT EXISTS public.mmn_selos_vendedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    grupo_selo VARCHAR(50) NOT NULL, -- 'TERRA', 'ÁGUA', 'AR', 'FOGO', 'ASTROS', 'FENÔMENOS', 'CONQUISTADORES'
    nivel_selo VARCHAR(50) NOT NULL, -- 'L1 Semente' a 'L21 Legado'
    pontos_vendas_diretas NUMERIC(15, 2) NOT NULL DEFAULT 0,
    insignia_icone VARCHAR(20) NOT NULL,
    data_conquista TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.mmn_selos_vendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de Selos de Vendedores"
ON public.mmn_selos_vendedores
FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "Escrita de Selos por Service Role"
ON public.mmn_selos_vendedores
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Tabela para Histórico de Carreira de Liderança MMN (Graus A1 a A9 - 40% VME)
CREATE TABLE IF NOT EXISTS public.mmn_lideranca_rede (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    grau_codigo VARCHAR(10) NOT NULL, -- 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'
    titulo_lideranca VARCHAR(100) NOT NULL, -- 'Conectador Solar', 'Arquiteto de Expansão', etc.
    pontos_totais_equipe NUMERIC(15, 2) NOT NULL DEFAULT 0,
    pontos_validos_vme NUMERIC(15, 2) NOT NULL DEFAULT 0,
    vme_aplicado_percentual NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
    trofeu_concedido BOOLEAN DEFAULT false,
    viagem_vip_concedida BOOLEAN DEFAULT false,
    pool_equity_qualificado BOOLEAN DEFAULT false,
    data_qualificacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.mmn_lideranca_rede ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de Liderança MMN"
ON public.mmn_lideranca_rede
FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "Escrita de Liderança por Service Role"
ON public.mmn_lideranca_rede
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Função PostgreSQL RPC para Validar Qualificação de Liderança MMN (Graus A1-A9 com Trava VME 40%)
CREATE OR REPLACE FUNCTION public.validar_qualificacao_vme_lideranca(
    p_profile_id UUID,
    p_pontos_necessarios NUMERIC,
    p_vme_limite NUMERIC DEFAULT 40.0
)
RETURNS TABLE (
    is_qualificado BOOLEAN,
    pontos_totais_equipe NUMERIC,
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
    v_teto_por_perna := p_pontos_necessarios * (p_vme_limite / 100.0);

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
            WHEN v_qualificado THEN 'Qualificação de Liderança aprovada! O teto VME de 40% foi respeitado em pernas paralelas.'
            ELSE 'Volume concentrado em perna única excede 40%. Desenvolva novas pernas de equipe para avançar de Grau.'
        END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.validar_qualificacao_vme_lideranca IS 'Valida a progressão nos Graus de Liderança MMN (A1 a A9) aplicando VME 40% sobre o volume de equipe. Não afeta as comissões no PIX.';

-- 4. Função PostgreSQL RPC para Trava VME Inteligente nos EcoPoints de Equipe
CREATE OR REPLACE FUNCTION public.validar_acumulo_ecopoints_vme(
    p_profile_id UUID,
    p_ecopoints_pessoais INT,
    p_ecopoints_equipe_brutos INT,
    p_vme_limite NUMERIC DEFAULT 40.0
)
RETURNS TABLE (
    ecopoints_pessoais_validos INT,
    ecopoints_equipe_validos INT,
    total_ecopoints_liberados INT,
    vme_aplicado BOOLEAN
) AS $$
DECLARE
    v_teto_equipe INT;
    v_equipe_aproveitado INT;
BEGIN
    -- EcoPoints Pessoais (Vendas diretas + Cursos + NPS) são 100% livres de VME
    -- EcoPoints de Equipe são limitados pelo teto VME
    v_teto_equipe := ROUND(p_ecopoints_equipe_brutos * (p_vme_limite / 100.0));
    v_equipe_aproveitado := LEAST(p_ecopoints_equipe_brutos, v_teto_equipe * 2);

    RETURN QUERY SELECT 
        p_ecopoints_pessoais,
        v_equipe_aproveitado,
        (p_ecopoints_pessoais + v_equipe_aproveitado),
        true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.validar_acumulo_ecopoints_vme IS 'Aplica a Trava VME 40% apenas sobre os EcoPoints gerados por volume de equipe, mantendo os EcoPoints pessoais 100% livres.';
