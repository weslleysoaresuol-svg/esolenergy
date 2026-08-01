-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000031_30_ANTI_PARKING_DETECTION
-- Módulo: CICLO 11A2 — Anti-Fraude de Rede & Detector de Parking V12.0
-- 1. Tabela de Alertas de Auditoria Anti-Fraude (audit_fraud_alerts)
-- 2. View Materializada mv_suspicious_parking_pairs
-- 3. Função PostgreSQL RPC atualizar_alertas_parking() para varredura agendada
-- ==============================================================================

-- 1. Tabela de Alertas de Fraude e Parking
CREATE TABLE IF NOT EXISTS public.audit_fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL, -- 'PARKING_CEP', 'PARKING_PIX', 'PARKING_CONTA_BANCARIA', 'PARKING_TELEFONE'
    profile_id_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_id_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nivel_severidade VARCHAR(20) NOT NULL DEFAULT 'MEDIA', -- 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA'
    detalhes_compartilhados JSONB NOT NULL DEFAULT '{}'::jsonb,
    status_auditoria VARCHAR(30) NOT NULL DEFAULT 'PENDENTE_ANALISE', -- 'PENDENTE_ANALISE', 'IGNORADO', 'CONFIRMADO_FRAUDE'
    auditado_por UUID REFERENCES public.profiles(id),
    observacao_auditor TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.audit_fraud_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de Alertas por Admin e Service Role"
ON public.audit_fraud_alerts
FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "Escrita de Alertas por Service Role"
ON public.audit_fraud_alerts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. View Materializada para Identificar Pares de Consultores com Dados Identicos na Mesma Sub-Árvore
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_suspicious_parking_pairs AS
SELECT 
    n1.profile_id AS profile_id_1,
    n2.profile_id AS profile_id_2,
    p1.full_name AS nome_consultor_1,
    p2.full_name AS nome_consultor_2,
    CASE 
        WHEN p1.pix_key IS NOT NULL AND p1.pix_key = p2.pix_key THEN 'PARKING_PIX'
        WHEN p1.bank_account IS NOT NULL AND p1.bank_account = p2.bank_account THEN 'PARKING_CONTA_BANCARIA'
        WHEN p1.zip_code IS NOT NULL AND p1.zip_code = p2.zip_code THEN 'PARKING_CEP'
        WHEN p1.phone IS NOT NULL AND p1.phone = p2.phone THEN 'PARKING_TELEFONE'
        ELSE 'OUTRO_PADRAO'
    END AS motivo_suspeita,
    jsonb_build_object(
        'pix_key', p1.pix_key,
        'zip_code', p1.zip_code,
        'phone', p1.phone,
        'bank_account', p1.bank_account,
        'path_1', n1.node_path::text,
        'path_2', n2.node_path::text
    ) AS detalhes
FROM public.rede_mmn_nodes n1
JOIN public.rede_mmn_nodes n2 ON n1.id != n2.id
JOIN public.profiles p1 ON p1.id = n1.profile_id
JOIN public.profiles p2 ON p2.id = n2.profile_id
WHERE (
    (p1.pix_key IS NOT NULL AND p1.pix_key = p2.pix_key) OR
    (p1.bank_account IS NOT NULL AND p1.bank_account = p2.bank_account) OR
    (p1.zip_code IS NOT NULL AND p1.zip_code = p2.zip_code AND LENGTH(p1.zip_code) > 5) OR
    (p1.phone IS NOT NULL AND p1.phone = p2.phone)
)
-- Apenas se estiverem na mesma árvore de rede
AND (n1.node_path <@ n2.node_path OR n2.node_path <@ n1.node_path);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_suspicious_parking ON public.mv_suspicious_parking_pairs (profile_id_1, profile_id_2);

-- 3. Função para Atualizar a View Materializada e Gerar Alertas Automáticos na Tabela audit_fraud_alerts
CREATE OR REPLACE FUNCTION public.atualizar_alertas_parking()
RETURNS INT AS $$
DECLARE
    v_alertas_gerados INT := 0;
BEGIN
    -- Atualizar view materializada em background
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_suspicious_parking_pairs;

    -- Inserir novos alertas na tabela audit_fraud_alerts se não existirem
    INSERT INTO public.audit_fraud_alerts (
        tipo_alerta,
        profile_id_1,
        profile_id_2,
        nivel_severidade,
        detalhes_compartilhados
    )
    SELECT 
        m.motivo_suspeita,
        m.profile_id_1,
        m.profile_id_2,
        CASE 
            WHEN m.motivo_suspeita IN ('PARKING_PIX', 'PARKING_CONTA_BANCARIA') THEN 'CRITICA'
            WHEN m.motivo_suspeita = 'PARKING_TELEFONE' THEN 'ALTA'
            ELSE 'MEDIA'
        END,
        m.detalhes
    FROM public.mv_suspicious_parking_pairs m
    WHERE NOT EXISTS (
        SELECT 1 FROM public.audit_fraud_alerts a 
        WHERE a.profile_id_1 = m.profile_id_1 AND a.profile_id_2 = m.profile_id_2
    );

    GET DIAGNOSTICS v_alertas_gerados = ROW_COUNT;
    RETURN v_alertas_gerados;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.atualizar_alertas_parking IS 'Varre a rede MMN em busca de duplicidades suspeitas de CEP, PIX, conta bancária ou telefone entre consultores da mesma sub-árvore e registra alertas.';
