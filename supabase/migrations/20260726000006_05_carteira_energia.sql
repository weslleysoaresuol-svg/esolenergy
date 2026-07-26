-- ==============================================================================
-- ⚡ MÓDULO 05: CARTEIRA DE ENERGIA (GD & MLE — CONTRATOS RECORRENTES)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: carteira_energia
-- Enums: carteira_status, mercado_tipo
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.carteira_status AS ENUM (
    'novo',
    'analise_viabilidade',
    'aguardando_documentos',
    'proposta_enviada',
    'contrato_assinado',
    'protocolado_distribuidora',
    'homologado',
    'ativo',
    'suspenso',
    'cancelado'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.mercado_tipo AS ENUM ('gd', 'mle');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.carteira_energia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id),
  tipo_mercado public.mercado_tipo NOT NULL,
  fornecedor_parceiro_id text NOT NULL, -- 'origo', 'reverde', 'clarke', 'enel'
  status public.carteira_status DEFAULT 'novo' NOT NULL,
  fatura_media_mensal numeric(15, 2) NOT NULL,
  consumo_mensal_kwh numeric(15, 2) NOT NULL,
  percentual_desconto_contratado numeric(5, 2) NOT NULL,
  data_assinatura date,
  data_inicio_fornecimento date,
  data_fim_fidelidade date,
  data_protocolo_denuncia date, -- MLE: Prazo de 180 dias de aviso prévio
  historico_faturas jsonb DEFAULT '[]'::jsonb, -- Array de faturas mensais para auditoria
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
