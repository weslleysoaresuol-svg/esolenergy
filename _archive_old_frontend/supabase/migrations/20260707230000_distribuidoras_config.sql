-- MIGRATION: Configuração das APIs de Distribuidoras Solar B2B

CREATE TABLE IF NOT EXISTS public.distribuidoras_config (
    id VARCHAR(50) PRIMARY KEY,
    client_id TEXT,
    client_secret TEXT,
    ambiente VARCHAR(50) NOT NULL DEFAULT 'sandbox' CHECK (ambiente IN ('sandbox', 'production')),
    config_adicional JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita Row Level Security
ALTER TABLE public.distribuidoras_config ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: Apenas admins podem ler/escrever
DROP POLICY IF EXISTS "Admins manage distribuidoras_config" ON public.distribuidoras_config;
CREATE POLICY "Admins manage distribuidoras_config" ON public.distribuidoras_config
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Grants de acesso à tabela
GRANT SELECT, INSERT, UPDATE, DELETE ON public.distribuidoras_config TO authenticated;
GRANT SELECT ON public.distribuidoras_config TO anon;
GRANT ALL ON public.distribuidoras_config TO service_role;

-- Popula os 8 distribuidores homologados por padrão
INSERT INTO public.distribuidoras_config (id, ambiente)
VALUES 
    ('aldo', 'sandbox'),
    ('souenergy', 'sandbox'),
    ('intelbras', 'sandbox'),
    ('phb', 'sandbox'),
    ('renovigi', 'sandbox'),
    ('golden', 'sandbox'),
    ('wdc', 'sandbox'),
    ('fortlev', 'sandbox')
ON CONFLICT (id) DO NOTHING;
