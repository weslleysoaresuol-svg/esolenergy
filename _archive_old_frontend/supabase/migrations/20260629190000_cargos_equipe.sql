-- ADICIONA OS NOVOS CARGOS AO ENUM APP_ROLE NO BANCO
DO $$
BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vendedor';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'engenheiro';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pos_vendas';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'financeiro';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
