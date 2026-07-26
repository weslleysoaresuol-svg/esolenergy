-- ==============================================================================
-- 🎨 MÓDULO 15: GROWTH & BRAND HUB (Marketing, Design e Social Media)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: midias_arquivos, campanhas_marketing, materiais_consultor, social_integrations
-- Enums: midia_tipo, campanha_status, social_plataforma
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.midia_tipo AS ENUM ('imagem', 'video', 'pdf', 'svg', 'documento');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.campanha_status AS ENUM ('rascunho', 'agendada', 'em_execucao', 'pausada', 'concluida', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.social_plataforma AS ENUM ('instagram', 'facebook', 'linkedin', 'whatsapp', 'youtube');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: ASSETS DIGITAIS E MÍDIAS (Digital Asset Management - DAM)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.midias_arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.profiles(id),
  
  titulo text NOT NULL,
  descricao text,
  tipo public.midia_tipo NOT NULL,
  url_arquivo text NOT NULL,
  resolucao text,
  tamanho_bytes bigint,
  tags text[],
  
  aprovado boolean DEFAULT false,
  aprovado_por uuid REFERENCES public.profiles(id),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_midias_tags ON public.midias_arquivos USING GIN (tags);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: MATERIAIS PARA CONSULTORES (Munição de Venda)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.materiais_consultor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  midia_id uuid REFERENCES public.midias_arquivos(id) ON DELETE CASCADE,
  
  titulo text NOT NULL,
  categoria text NOT NULL,
  texto_copy_sugerido text,
  
  permite_co_branding boolean DEFAULT true,
  coordenadas_qr_code jsonb,
  coordenadas_foto jsonb,
  
  ativo boolean DEFAULT true,
  downloads_totais integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: INTEGRAÇÕES SOCIAIS (SMM - Social Media Management)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.social_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  plataforma public.social_plataforma NOT NULL,
  nome_conta text NOT NULL,
  
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  
  page_id text,
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 4: CAMPANHAS DE MARKETING E DISPAROS OMNICHANNEL
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.campanhas_marketing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  midia_id uuid REFERENCES public.midias_arquivos(id),
  
  nome text NOT NULL,
  conteudo_texto text NOT NULL,
  status public.campanha_status DEFAULT 'rascunho',
  
  canais_publicacao public.social_plataforma[],
  
  agendado_para timestamptz,
  publicado_em timestamptz,
  
  total_likes integer DEFAULT 0,
  total_compartilhamentos integer DEFAULT 0,
  total_cliques integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campanhas_agendamento ON public.campanhas_marketing(agendado_para) WHERE status = 'agendada';
