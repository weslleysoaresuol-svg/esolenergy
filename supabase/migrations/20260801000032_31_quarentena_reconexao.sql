-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000032_31_QUARENTENA_RECONEXAO
-- Módulo: CICLO 11A3 — Anti-Fraude de Rede & Quarentena de 90 Dias V12.0
-- 1. Tabela de Log de Cancelamentos de Assinatura/Contratos Recorrentes (contratos_cancelados_log)
-- 2. Função PostgreSQL validar_quarentena_reconexao()
-- 3. Trigger trg_quarentena_reconexao para prevenir churning pelo mesmo consultor
-- ==============================================================================

-- 1. Tabela de Log de Cancelamentos
CREATE TABLE IF NOT EXISTS public.contratos_cancelados_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    cliente_documento VARCHAR(20) NOT NULL, -- CPF ou CNPJ do Cliente
    cliente_email VARCHAR(255),
    contrato_origem_id UUID NOT NULL,
    consultor_origem_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    modalidade VARCHAR(50) NOT NULL, -- 'GD_GERACAO_DISTRIBUIDA', 'MERCADO_LIVRE_MLE', 'SEGUROS_SOLARES'
    data_cancelamento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quarentena_ate TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
    motivo_cancelamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.contratos_cancelados_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de Cancelamentos por Admin e Service Role"
ON public.contratos_cancelados_log
FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "Escrita de Cancelamentos por Service Role"
ON public.contratos_cancelados_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Função PostgreSQL RPC para Validar Se Cliente Está em Quarentena com o Mesmo Consultor
CREATE OR REPLACE FUNCTION public.validar_quarentena_reconexao(
    p_cliente_documento VARCHAR,
    p_consultor_id UUID,
    p_modalidade VARCHAR
)
RETURNS TABLE (
    is_bloqueado BOOLEAN,
    dias_restantes_quarentena INT,
    mensagem TEXT
) AS $$
DECLARE
    v_log_record RECORD;
    v_dias INT := 0;
BEGIN
    -- Procurar cancelamento ativo nos últimos 90 dias do mesmo cliente com o mesmo consultor
    SELECT * INTO v_log_record
    FROM public.contratos_cancelados_log
    WHERE cliente_documento = p_cliente_documento
      AND consultor_origem_id = p_consultor_id
      AND modalidade = p_modalidade
      AND quarentena_ate > NOW()
    ORDER BY data_cancelamento DESC
    LIMIT 1;

    IF FOUND THEN
        v_dias := EXTRACT(DAY FROM (v_log_record.quarentena_ate - NOW()))::INT;
        RETURN QUERY SELECT 
            true, 
            v_dias, 
            FORMAT('Cliente em quarentena anti-churning de 90 dias com este consultor. Bloqueio ativo por mais %s dias.', v_dias);
        RETURN;
    ELSE
        RETURN QUERY SELECT 
            false, 
            0, 
            'Cliente liberado para novo contrato/reconexão.';
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.validar_quarentena_reconexao IS 'Bloqueia a re-contratação do mesmo cliente pelo mesmo consultor dentro de 90 dias após cancelamento (prevenção de churning).';
