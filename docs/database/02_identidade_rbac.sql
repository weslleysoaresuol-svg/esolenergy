-- ==============================================================================
-- 👤 MÓDULO 02: IDENTIDADE, CONTROLE DE ACESSO (RBAC) & GOVERNANÇA
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql
-- Tabelas: profiles, user_roles, admin_audit_logs, socios_cap_table,
--          folha_pagamento_opex
-- Enums: app_role, admin_nivel, socio_opcao_remuneracao, contrato_regime
-- ==============================================================================

CREATE TABLE public.profiles (
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

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'corretor',
  'instalador',
  'engenheiro',
  'financeiro',
  'pos_vendas'
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Matriz de Acessos Administrativos (RBAC de 7 Níveis) & Trilha de Auditoria
CREATE TYPE public.admin_nivel AS ENUM (
  'super_admin_socio',
  'admin_juridico',
  'admin_financeiro',
  'admin_engenharia',
  'admin_vendas_mmn',
  'admin_suporte',
  'auditor_externo'
);

CREATE TABLE public.admin_audit_logs (
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
CREATE TYPE public.socio_opcao_remuneracao AS ENUM (
  'dividendos_isentos_100',
  'pro_labore_fixo',
  'juros_capital_proprio_jcp',
  'modelo_hibrido_flexivel'
);

CREATE TABLE public.socios_cap_table (
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
CREATE TYPE public.contrato_regime AS ENUM (
  'clt_tradicional',
  'clt_intermitente',
  'pj_honorario',
  'advogado_associado_oab',
  'estagio_lei_11788',
  'socio_equity_prolabore'
);

CREATE TABLE public.folha_pagamento_opex (
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
