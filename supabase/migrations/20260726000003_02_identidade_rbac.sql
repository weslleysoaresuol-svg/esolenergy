-- ==============================================================================
-- 👤 MÓDULO 02: IDENTIDADE, CONTROLE DE ACESSO (RBAC) & GOVERNANÇA
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql
-- Tabelas: profiles, user_roles, admin_audit_logs, socios_cap_table,
--          folha_pagamento_opex
-- Enums: app_role, admin_nivel, socio_opcao_remuneracao, contrato_regime
-- Triggers: handle_new_user() on auth.users
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf_cnpj_encrypted bytea NOT NULL, -- PII: Criptografia pgcrypto AES-256
  telefone text,
  meta_pixel_id text,                            -- ID do Pixel do Facebook do Consultor
  google_tag_id text,                            -- ID do GTM/GA4 do Consultor
  tiktok_pixel_id text,                          -- ID do Pixel do TikTok do Consultor
  
  avatar_url text,
  contrato_assinado boolean DEFAULT false,
  onboarding_completo boolean DEFAULT false,
  comissao_percent numeric(5, 2) DEFAULT 8.00, -- Margem individual corretor no Motor 1
  chave_pix_hash bytea, -- SPII: Chave PIX encriptada via pgcrypto
  dados_bancarios_encrypted bytea, -- SPII: JSON encriptado (AES-256)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'admin',
    'corretor',
    'instalador',
    'engenheiro',
    'financeiro',
    'pos_vendas'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Matriz de Acessos Administrativos (RBAC de 7 Níveis) & Trilha de Auditoria
DO $$ BEGIN
  CREATE TYPE public.admin_nivel AS ENUM (
    'super_admin_socio',
    'admin_juridico',
    'admin_financeiro',
    'admin_engenharia',
    'admin_vendas_mmn',
    'admin_suporte',
    'auditor_externo'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  papel_utilizado public.admin_nivel NOT NULL,
  acao text NOT NULL, -- Ex: 'aprovação_saque_pix', 'alteracao_minuta_juridica', 'revogacao_acesso'
  modulo text NOT NULL, -- Ex: 'financeiro', 'legal_vault', 'acessos'
  detalhes jsonb DEFAULT '{}'::jsonb, -- Payload completo da alteração para auditoria
  ip_origem text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela do Cap Table de Sócios-Administradores Principais
DO $$ BEGIN
  CREATE TYPE public.socio_opcao_remuneracao AS ENUM (
    'dividendos_isentos_100',
    'pro_labore_fixo',
    'juros_capital_proprio_jcp',
    'modelo_hibrido_flexivel'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.socios_cap_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  socio_id uuid REFERENCES public.profiles(id) NOT NULL UNIQUE,
  percentual_cotas numeric(5, 2) NOT NULL CHECK (percentual_cotas > 0 AND percentual_cotas <= 100),
  valor_pro_labore numeric(15, 2) DEFAULT 0.00 NOT NULL,
  opcao_remuneracao public.socio_opcao_remuneracao DEFAULT 'modelo_hibrido_flexivel' NOT NULL,
  periodicidade_dividendos text DEFAULT 'mensal' NOT NULL, -- 'mensal', 'trimestral', 'anual'
  instrucoes_bancarias_socio jsonb DEFAULT '{}'::jsonb,
  data_entrada date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Gestão de OPEX e Folha de Pagamento Administrativa
DO $$ BEGIN
  CREATE TYPE public.contrato_regime AS ENUM (
    'clt_tradicional',
    'clt_intermitente',
    'pj_honorario',
    'advogado_associado_oab',
    'estagio_lei_11788',
    'socio_equity_prolabore'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.folha_pagamento_opex (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.profiles(id) NOT NULL,
  regime public.contrato_regime NOT NULL,
  cargo_funcao text NOT NULL,
  codigo_cbo text NOT NULL, -- Código CBO oficial (Ex: '2143-05' Engenheiro, '2410-05' Advogado)
  conselho_classe_registro jsonb DEFAULT '{}'::jsonb, -- Ex: {"orgao": "CREA-SP", "numero": "506948/D"}
  sindicato_enquadramento text, -- Enquadramento no eSocial / CCT
  remuneracao_base numeric(15, 2) NOT NULL,
  bonus_metas_estimado numeric(15, 2) DEFAULT 0.00,
  dados_contratuais jsonb DEFAULT '{}'::jsonb, -- Anexo de contrato, benefícios, retenções
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TRIGGER AUTOMÁTICO: AUTOMATIC PROFILE CREATION ON SUPABASE AUTH SIGNUP
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_tenant_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  user_name text;
BEGIN
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (
    id,
    tenant_id,
    nome,
    cpf_cnpj_encrypted,
    telefone
  )
  VALUES (
    new.id,
    default_tenant_id,
    user_name,
    pgp_sym_encrypt('000.000.000-00', 'esol_sec_key_default'), -- Placeholder encriptado
    new.phone
  )
  ON CONFLICT (id) DO NOTHING;

  -- Role padrão inicial de corretor/consultor
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'corretor')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger atrelada à tabela auth.users do Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
