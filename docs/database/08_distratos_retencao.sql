-- ==============================================================================
-- 📄 MÓDULO 08: DISTRATOS & CONFORMIDADE
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 05_carteira_energia.sql, 06_motor_assinaturas.sql
-- Tabelas: distratos_conformidade
-- ==============================================================================

CREATE TABLE public.distratos_conformidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  carteira_energia_id uuid REFERENCES public.carteira_energia(id) ON DELETE CASCADE,
  motivo text NOT NULL,
  descricao text,
  assinatura_distrato_id uuid REFERENCES public.assinaturas_digitais(id),
  estorno_comissoes_concluido boolean DEFAULT false,
  status text DEFAULT 'pendente' NOT NULL, -- 'pendente', 'aprovado', 'rejeitado'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
