-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260801000036_35_MARGEM_PISO_CHECK
-- Módulo: CICLO 13A — Plano 38B: Trava de Margem Piso Inviolável (20%) no PostgreSQL V14.0
-- 1. Constraint CHECK inviolável na tabela public.projetos_epc
-- 2. Trigger de validação preventiva levantar exceção descritiva em tempo de gravação
-- ==============================================================================

-- 1. Assegurar Constraint CHECK de Margem Piso de 20% em public.projetos_epc
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_margem_piso_epc'
    ) THEN
        ALTER TABLE public.projetos_epc DROP CONSTRAINT chk_margem_piso_epc;
    END IF;
    
    ALTER TABLE public.projetos_epc 
    ADD CONSTRAINT chk_margem_piso_epc CHECK (
        fase_atual IN ('dimensionamento', 'procurement_bom', 'cancelado')
        OR margem_liquida_percentual >= 0.2000
    );
END $$;

-- 2. Trigger PostgreSQL de Proteção da Margem Piso Inviolável
CREATE OR REPLACE FUNCTION public.validar_margem_piso_inviolavel_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o projeto avançou além do dimensionamento inicial e a margem for menor que 20% (0.2000)
    IF NEW.fase_atual NOT IN ('dimensionamento', 'cancelado') AND (NEW.margem_liquida_percentual IS NULL OR NEW.margem_liquida_percentual < 0.2000) THEN
        RAISE EXCEPTION '🔒 VIOLAÇÃO DE SEGURANÇA FINANCEIRA: A margem de lucro apurada (%).2f%% está abaixo do piso inviolável de 20.0%% definido pela Presidência. Operação abortada.', 
            (COALESCE(NEW.margem_liquida_percentual, 0) * 100);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atrelar Trigger à Tabela public.projetos_epc
DROP TRIGGER IF EXISTS trg_validar_margem_piso_epc ON public.projetos_epc;

CREATE TRIGGER trg_validar_margem_piso_epc
  BEFORE INSERT OR UPDATE ON public.projetos_epc
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_margem_piso_inviolavel_trigger();

COMMENT ON FUNCTION public.validar_margem_piso_inviolavel_trigger IS '🔒 SEGURANÇA ABSOLUTA: Bloqueia no banco de dados qualquer tentativa de registrar ou avançar proposta com margem inferior a 20.0%.';
