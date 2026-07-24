-- ==============================================================================
-- 🌐 MÓDULO 03: REDE MMN — HIERARQUIA MULTINÍVEL (LTREE)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 02_identidade_rbac.sql (profiles)
-- Tabelas: rede_mmn
-- Índices: idx_rede_mmn_path (GiST)
-- ==============================================================================

CREATE TABLE public.rede_mmn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  patrocinador_id uuid REFERENCES public.profiles(id),
  path public.ltree NOT NULL, -- Ex: 'top.user1_uuid.user2_uuid'
  nivel integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rede_mmn_path ON public.rede_mmn USING gist(path);
