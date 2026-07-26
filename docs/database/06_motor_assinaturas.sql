-- ==============================================================================
-- ✍️ MÓDULO 06: ESOL SIGN — ASSINATURAS ELETRÔNICAS, KYC & MINUTAS JURÍDICAS
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: assinaturas_digitais, documentos_minutas_juridicas
-- Enums: documento_categoria, kyc_status
-- Base Legal: MP 2.200-2/2001 e Lei 14.063/2020
-- ==============================================================================

CREATE TYPE public.documento_categoria AS ENUM (
  'contrato_parceria',
  'renovacao_termo_parceria', -- Esol Re-Sign (Renovação Anual & Prova de Vida)
  'termo_compromisso_equipe',
  'proposta_solar_turnkey',
  'adesao_gd',
  'denuncia_contrato_mle',
  'distrato_cancelamento'
);

CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected', 'bypass');

CREATE TABLE public.assinaturas_digitais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id), -- Signatário
  tipo_documento public.documento_categoria NOT NULL,
  referencia_id uuid NOT NULL, -- Link genérico (propostas, clientes, carteira)
  conteudo_hash text NOT NULL, -- SHA-256 do contrato
  assinatura_url text NOT NULL, -- Assinatura física desenhada
  selfie_url text, -- Selfie KYC
  documento_frente_url text,
  documento_verso_url text,
  ip_origem text NOT NULL,
  user_agent text NOT NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  timestamp_ntp timestamptz DEFAULT now(),
  facematch_status public.kyc_status DEFAULT 'pending',
  facematch_score numeric(5, 2),
  created_at timestamptz DEFAULT now()
);

-- Central de Governança Jurídica (Esol Legal & Compliance Vault)
CREATE TABLE public.documentos_minutas_juridicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  categoria public.documento_categoria NOT NULL,
  titulo text NOT NULL, -- Ex: 'Termo de Parceria Comercial Autônoma MMN'
  versao text NOT NULL, -- Ex: 'v2.1'
  descricao_alteracoes text, -- Notação do advogado sobre o que mudou
  arquivo_url text, -- PDF/DOCX original no Supabase Storage
  conteudo_template text NOT NULL, -- Template HTML/Markdown com tags {{VARIAVEIS}}
  hash_sha256 text NOT NULL, -- Digest do conteúdo da minuta
  status text DEFAULT 'rascunho' NOT NULL, -- 'rascunho', 'ativa', 'arquivada'
  exige_reaceite boolean DEFAULT false,
  criado_por_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, categoria, versao)
);
