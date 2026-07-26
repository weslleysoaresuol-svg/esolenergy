-- ==============================================================================
-- 🚀 MÓDULO 16: PERFORMANCE & TRACKING HUB (Server-Side)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: tracking_server_events, ad_spend_diario
-- Enums: evento_conversao, plataforma_ads
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.evento_conversao AS ENUM ('page_view', 'lead_form', 'initiate_checkout', 'purchase', 'contract_signed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.plataforma_ads AS ENUM ('meta_ads', 'google_ads', 'tiktok_ads', 'linkedin_ads');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: CAPI (CONVERSIONS API) SERVER-SIDE EVENTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tracking_server_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id),
  consultor_id uuid REFERENCES public.profiles(id),
  
  evento public.evento_conversao NOT NULL,
  plataforma public.plataforma_ads NOT NULL,
  pixel_id_usado text,
  
  valor_conversao numeric(12,2) DEFAULT 0.00,
  moeda varchar(3) DEFAULT 'BRL',
  
  user_ip inet,
  user_agent text,
  fbc text,
  fbp text,
  gclid text,
  
  payload_enviado jsonb,
  status_http integer,
  
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: GASTO DE ANÚNCIOS (ROAS DASHBOARD BI)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ad_spend_diario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  data_referencia date NOT NULL,
  plataforma public.plataforma_ads NOT NULL,
  campanha_id text,
  campanha_nome text,
  
  valor_gasto numeric(10,2) NOT NULL DEFAULT 0.00,
  impressoes integer DEFAULT 0,
  cliques integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, data_referencia, plataforma, campanha_id)
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_cliente ON public.tracking_server_events(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ad_spend_data ON public.ad_spend_diario(data_referencia);
