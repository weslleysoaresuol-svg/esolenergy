-- ==============================================================================
-- 📋 MÓDULO 04: CRM & GESTÃO DE LEADS
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql (profiles)
-- Tabelas: clientes
-- Enums: cliente_status_tipo
-- ==============================================================================

CREATE TYPE public.cliente_status_tipo AS ENUM (
  'novo',
  'contato',
  'visita_agendada',
  'proposta_enviada',
  'negociacao',
  'contrato_assinado',
  'instalacao',
  'concluido',
  'perdido'
);

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id),
  nome_completo text NOT NULL,
  documento text NOT NULL, -- CPF/CNPJ criptografado
  contato_telefone text NOT NULL,
  contato_email text,
  cidade text NOT NULL,
  estado varchar(2) NOT NULL,
  status public.cliente_status_tipo DEFAULT 'novo' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
