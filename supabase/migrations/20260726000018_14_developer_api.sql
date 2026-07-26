-- ==============================================================================
-- 💻 MÓDULO 14: DEVELOPER HUB (API, WEBHOOKS & EDGE FUNCTIONS)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: api_keys, webhooks_endpoints, webhook_deliveries, edge_functions
-- Enums: api_key_ambiente, webhook_evento_tipo, delivery_status
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.api_key_ambiente AS ENUM ('test', 'live');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.webhook_evento_tipo AS ENUM (
    'lead.created', 'lead.updated',
    'contract.signed', 'contract.canceled',
    'epc.phase_changed', 'epc.approved',
    'commission.ready', 'commission.paid',
    'eco_points.credited', 'eco_points.redeemed',
    '*' -- Curinga para todos os eventos
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM ('success', 'failed', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: API KEYS (Gerenciamento de acesso externo e de IAs)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id),

  nome text NOT NULL,
  ambiente public.api_key_ambiente NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  key_hint text NOT NULL,
  
  scopes jsonb DEFAULT '["read:leads"]'::jsonb,
  
  ativo boolean DEFAULT true,
  revogado_em timestamptz,
  ultimo_uso_em timestamptz,
  expira_em timestamptz,
  
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON public.api_keys(tenant_id) WHERE ativo = true;

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: WEBHOOK ENDPOINTS (Destinos para notificações HTTP)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.webhooks_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  url text NOT NULL,
  descricao text,
  ambiente public.api_key_ambiente NOT NULL,
  eventos public.webhook_evento_tipo[] NOT NULL,
  
  secret_signing_key text NOT NULL,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: WEBHOOK DELIVERIES (Observabilidade e Logs)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid REFERENCES public.webhooks_endpoints(id) ON DELETE CASCADE,
  
  evento_disparado public.webhook_evento_tipo NOT NULL,
  payload_enviado jsonb NOT NULL,
  
  status public.delivery_status DEFAULT 'pending',
  http_status_code smallint,
  response_body text,
  tempo_execucao_ms integer,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON public.webhook_deliveries(endpoint_id, created_at DESC);

-- ══════════════════════════════════════════════════════════════
-- TABELA 4: EDGE FUNCTIONS (Custom Code / Automações Nativas)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.edge_functions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.profiles(id),

  nome text NOT NULL,
  descricao text,
  gatilho_evento public.webhook_evento_tipo NOT NULL,
  
  codigo_ts text NOT NULL,
  ativo boolean DEFAULT false,
  ambiente public.api_key_ambiente NOT NULL,
  
  total_invocacoes integer DEFAULT 0,
  taxa_erro_pct numeric(5,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
