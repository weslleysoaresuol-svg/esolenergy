-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260726000027_26_TRAVA_RECURSO_LIBERADO
-- Módulo: Trava Estreita de Liberação de Comissões para Financiamentos Bancários (84x)
-- ==============================================================================

-- 1. Adicionar colunas de controle de liberação de recursos bancários
ALTER TABLE public.banking_faturas 
ADD COLUMN IF NOT EXISTS recurso_liberado BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS data_liberacao_recurso TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banco_financiador VARCHAR(100);

ALTER TABLE public.banking_transacoes_split 
ADD COLUMN IF NOT EXISTS recurso_liberado BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS status_liberacao VARCHAR(40) NOT NULL DEFAULT 'aguardando_liberacao_bancaria';

-- 2. Trigger para sincronizar recurso_liberado das faturas para os splits
CREATE OR REPLACE FUNCTION sync_recurso_liberado_split()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.recurso_liberado = true AND (OLD.recurso_liberado IS NULL OR OLD.recurso_liberado = false) THEN
        NEW.data_liberacao_recurso = NOW();
        
        -- Atualizar fatias do split correspondentes
        UPDATE public.banking_transacoes_split
        SET recurso_liberado = true,
            status_liberacao = 'liberado_para_repasse'
        WHERE fatura_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_recurso_liberado_fatura
BEFORE UPDATE ON public.banking_faturas
FOR EACH ROW
EXECUTE FUNCTION sync_recurso_liberado_split();

-- 3. Função de verificação para prevenir repasse de comissão sem recurso liberado
CREATE OR REPLACE FUNCTION check_recurso_liberado_before_repasse()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo_pagamento VARCHAR(50);
BEGIN
    SELECT tipo_pagamento INTO v_tipo_pagamento
    FROM public.banking_faturas
    WHERE id = NEW.fatura_id;

    -- Se for pagamento via financiamento e o recurso não foi liberado pelo banco, trava a liberação
    IF v_tipo_pagamento = 'financiamento' AND NEW.status_split = 'repassado' AND NEW.recurso_liberado = false THEN
        RAISE EXCEPTION 'BLOQUEIO DE SEGURANÇA: Comissão via financiamento bancário só pode ser repassada após a liberação efetiva do recurso pelo banco (recurso_liberado = true).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_recurso_liberado_repasse
BEFORE UPDATE ON public.banking_transacoes_split
FOR EACH ROW
EXECUTE FUNCTION check_recurso_liberado_before_repasse();

COMMENT ON COLUMN public.banking_faturas.recurso_liberado IS 'Flag de segurança indicando se a instituição financeira repassou efetivamente o valor do financiamento 84x';
