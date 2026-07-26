-- ==============================================================================
-- 🎨 MÓDULO 15: GROWTH & BRAND HUB (Marketing, Design e Social Media)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: midias_arquivos, campanhas_marketing, materiais_consultor, social_integrations
-- Enums: midia_tipo, campanha_status, social_plataforma
-- ==============================================================================

CREATE TYPE public.midia_tipo AS ENUM ('imagem', 'video', 'pdf', 'svg', 'documento');
CREATE TYPE public.campanha_status AS ENUM ('rascunho', 'agendada', 'em_execucao', 'pausada', 'concluida', 'cancelada');
CREATE TYPE public.social_plataforma AS ENUM ('instagram', 'facebook', 'linkedin', 'whatsapp', 'youtube');

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: ASSETS DIGITAIS E MÍDIAS (Digital Asset Management - DAM)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.midias_arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.profiles(id),  -- Designer responsável
  
  titulo text NOT NULL,
  descricao text,
  tipo public.midia_tipo NOT NULL,
  url_arquivo text NOT NULL,                     -- URL do Storage (Supabase/S3)
  resolucao text,                                -- Ex: '1920x1080'
  tamanho_bytes bigint,
  tags text[],                                   -- Ex: ['banner', 'promocao', 'site']
  
  aprovado boolean DEFAULT false,                -- Fluxo de aprovação do Diretor
  aprovado_por uuid REFERENCES public.profiles(id),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_midias_tags ON public.midias_arquivos USING GIN (tags);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: MATERIAIS PARA CONSULTORES (Munição de Venda)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.materiais_consultor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  midia_id uuid REFERENCES public.midias_arquivos(id) ON DELETE CASCADE,
  
  titulo text NOT NULL,
  categoria text NOT NULL,                       -- Ex: 'Stories Insta', 'Panfleto PDF'
  texto_copy_sugerido text,                      -- Texto base para o consultor colar na rede social
  
  permite_co_branding boolean DEFAULT true,      -- Se true, o App estampa a foto e QR Code do consultor
  coordenadas_qr_code jsonb,                     -- Onde colar o QR Code na imagem {x: 100, y: 800, size: 200}
  coordenadas_foto jsonb,                        -- Onde colar a foto do perfil
  
  ativo boolean DEFAULT true,
  downloads_totais integer DEFAULT 0,            -- Engajamento da rede
  
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: INTEGRAÇÕES SOCIAIS (SMM - Social Media Management)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.social_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  plataforma public.social_plataforma NOT NULL,
  nome_conta text NOT NULL,                      -- Ex: 'Esol Energy Oficial (@esolenergy)'
  
  access_token text NOT NULL,                    -- Oauth Token (idealmente encriptado via pgcrypto na prática)
  refresh_token text,
  token_expires_at timestamptz,
  
  page_id text,                                  -- ID da página no FB/LinkedIn
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 4: CAMPANHAS DE MARKETING E DISPAROS OMNICHANNEL
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.campanhas_marketing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  midia_id uuid REFERENCES public.midias_arquivos(id), -- Arte vinculada
  
  nome text NOT NULL,
  conteudo_texto text NOT NULL,                  -- Copy do post
  status public.campanha_status DEFAULT 'rascunho',
  
  canais_publicacao public.social_plataforma[],  -- Onde publicar (Array)
  
  agendado_para timestamptz,                     -- Quando publicar
  publicado_em timestamptz,                      -- Confirmação de publicação
  
  -- Métricas agregadas de retorno (opcional p/ relatórios de Growth)
  total_likes integer DEFAULT 0,
  total_compartilhamentos integer DEFAULT 0,
  total_cliques integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_campanhas_agendamento ON public.campanhas_marketing(agendado_para) WHERE status = 'agendada';
