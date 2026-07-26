-- ==============================================================================
-- 🌿 MÓDULO 09: ESOL CLUB & ECOPONTOS (REFERRALS & LOYALTY LEDGER)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 04_crm_clientes.sql
-- Tabelas: ecopontos_ledger, ecopontos_resgates
-- Enums: ecopontos_status
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.ecopontos_status AS ENUM ('pendente', 'disponivel', 'expirado', 'resgatado', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.ecopontos_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_indicador_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_indicado_id uuid REFERENCES public.clientes(id),
  origem_categoria integer NOT NULL, -- Categoria 1 a 8 do portfólio
  pontos integer NOT NULL CHECK (pontos > 0),
  equivalente_reais numeric(15, 2) NOT NULL,
  status public.ecopontos_status DEFAULT 'pendente' NOT NULL,
  data_liberacao timestamptz,
  data_validade timestamptz NOT NULL, -- Expiração em 31/12 do ano vigente
  streaming_mes_atual integer DEFAULT 1, -- Mês do parcelamento (1 a 10)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ecopontos_resgates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_resgate text NOT NULL, -- 'desconto_fatura', 'voucher_loja', 'limpeza_paineis', 'brinde_oficial'
  pontos_utilizados integer NOT NULL CHECK (pontos_utilizados > 0),
  valor_equivalente numeric(15, 2) NOT NULL,
  detalhes jsonb DEFAULT '{}'::jsonb, -- Dados da fatura, cupom ou frete do brinde
  status text DEFAULT 'solicitado' NOT NULL, -- 'solicitado', 'aprovado', 'entregue', 'cancelado'
  created_at timestamptz DEFAULT now()
);
