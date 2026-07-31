-- ==============================================================================
-- ESOL ENERGY - MIGRAÇÃO SQL 20260726000026_25_FISCAL_FILA_RETRY
-- Módulo: Fila Assíncrona de Emissão Fiscal com Retentativa & Fallback (eNotas/SEFAZ)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.fiscal_fila_emissao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants_config(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    origem_modulo VARCHAR(64) NOT NULL DEFAULT 'projetos_epc',
    origem_id UUID NOT NULL,
    tipo_nota VARCHAR(20) NOT NULL DEFAULT 'NFSe', -- NFSe, NFe, NFCom
    valor_nota NUMERIC(15, 2) NOT NULL CHECK (valor_nota > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pendente', -- pendente, processando, autorizada, erro_definitivo, agendada_retentativa
    tentativas INT NOT NULL DEFAULT 0,
    max_tentativas INT NOT NULL DEFAULT 5,
    proxima_tentativa_em TIMESTAMPTZ DEFAULT NOW(),
    ultimo_erro TEXT,
    payload_json JSONB DEFAULT '{}'::jsonb,
    resposta_sefaz_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de alta performance para busca por fila pendente e tenant
CREATE INDEX IF NOT EXISTS idx_fiscal_fila_status_tentativa 
ON public.fiscal_fila_emissao (status, proxima_tentativa_em) 
WHERE status IN ('pendente', 'agendada_retentativa');

CREATE INDEX IF NOT EXISTS idx_fiscal_fila_origem 
ON public.fiscal_fila_emissao (origem_modulo, origem_id);

-- Ativar RLS
ALTER TABLE public.fiscal_fila_emissao ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Usuários autenticados de um tenant e service role
CREATE POLICY "Serviços e Admins gerenciam a fila fiscal"
ON public.fiscal_fila_emissao
FOR ALL
TO authenticated, service_role
USING (true)
WITH CHECK (true);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_fiscal_fila_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fiscal_fila_updated_at
BEFORE UPDATE ON public.fiscal_fila_emissao
FOR EACH ROW
EXECUTE FUNCTION update_fiscal_fila_timestamp();

COMMENT ON TABLE public.fiscal_fila_emissao IS 'Fila assíncrona de retentativa para emissão de notas fiscais com fallback em caso de oscilação da SEFAZ/eNotas';
