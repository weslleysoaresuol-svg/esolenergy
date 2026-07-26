-- ==============================================================================
-- 🚀 MÓDULO 16: PERFORMANCE & TRACKING HUB (Server-Side)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: tracking_server_events, ad_spend_diario
-- Enums: evento_conversao, plataforma_ads
-- ==============================================================================

CREATE TYPE public.evento_conversao AS ENUM ('page_view', 'lead_form', 'initiate_checkout', 'purchase', 'contract_signed');
CREATE TYPE public.plataforma_ads AS ENUM ('meta_ads', 'google_ads', 'tiktok_ads', 'linkedin_ads');

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: CAPI (CONVERSIONS API) SERVER-SIDE EVENTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.tracking_server_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id), -- Quem converteu
  consultor_id uuid REFERENCES public.profiles(id), -- Dono do tráfego (se houver)
  
  evento public.evento_conversao NOT NULL,
  plataforma public.plataforma_ads NOT NULL,
  pixel_id_usado text,                           -- Qual pixel recebeu o disparo (Corporate ou Consultor)
  
  valor_conversao numeric(12,2) DEFAULT 0.00,    -- Útil para ROAS (Ex: R$ 50.000)
  moeda varchar(3) DEFAULT 'BRL',
  
  user_ip inet,
  user_agent text,
  fbc text,                                      -- Facebook Click ID (via cookie)
  fbp text,                                      -- Facebook Browser ID
  gclid text,                                    -- Google Click ID
  
  payload_enviado jsonb,                         -- Corpo do JSON disparado pra API da Meta/Google
  status_http integer,                           -- 200 (Sucesso), 400 (Erro)
  
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: GASTO DE ANÚNCIOS (ROAS DASHBOARD BI)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.ad_spend_diario (
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

CREATE INDEX idx_tracking_events_cliente ON public.tracking_server_events(cliente_id);
CREATE INDEX idx_ad_spend_data ON public.ad_spend_diario(data_referencia);
