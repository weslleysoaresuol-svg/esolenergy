-- ==============================================================================
-- 🛡️ MÓDULO 24: SECURITY RLS POLICIES (MFA & PREVENÇÃO IDOR/BOLA)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: Todas as tabelas operacionais do ecossistema.
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- 1. ENABLE RLS: ATIVAÇÃO DE ROW LEVEL SECURITY EM TODAS AS TABELAS
-- ══════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.historico_comissoes_mmn ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ledger_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- 2. POLÍTICAS DE ROTEAMENTO (Prevenção BOLA/IDOR)
-- ══════════════════════════════════════════════════════════════

-- 2.1 TABELA: clientes
DROP POLICY IF EXISTS "consultor_visualiza_proprios_clientes" ON public.clientes;
CREATE POLICY "consultor_visualiza_proprios_clientes" 
ON public.clientes
FOR SELECT
TO authenticated
USING (
  corretor_id = auth.uid() 
  OR 
  auth.jwt() ->> 'role' IN ('admin', 'lider_mmn_regional')
);

DROP POLICY IF EXISTS "consultor_atualiza_proprios_clientes" ON public.clientes;
CREATE POLICY "consultor_atualiza_proprios_clientes" 
ON public.clientes
FOR UPDATE
TO authenticated
USING (
  corretor_id = auth.uid()
)
WITH CHECK (
  corretor_id = auth.uid()
);

-- 2.2 TABELA: tickets_atendimento
DROP POLICY IF EXISTS "visualizacao_isolada_tickets" ON public.tickets_atendimento;
CREATE POLICY "visualizacao_isolada_tickets" 
ON public.tickets_atendimento
FOR SELECT
TO authenticated
USING (
  solicitante_id = auth.uid() 
  OR 
  atendente_id = auth.uid()
  OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- ══════════════════════════════════════════════════════════════
-- 3. TRAVAS FINANCEIRAS DE ALTO NÍVEL (Exigência de MFA)
-- ══════════════════════════════════════════════════════════════

-- 3.1 TABELA: historico_comissoes_mmn (SAQUES)
DROP POLICY IF EXISTS "saque_comissao_exige_mfa" ON public.historico_comissoes_mmn;
CREATE POLICY "saque_comissao_exige_mfa"
ON public.historico_comissoes_mmn
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = consultor_id 
  AND 
  tipo_movimentacao = 'saque'
  AND 
  (auth.jwt()->>'aal') = 'aal2'
);

-- 3.2 TABELA: profiles (ALTERAÇÃO DE CHAVE PIX)
DROP POLICY IF EXISTS "alteracao_pix_exige_mfa" ON public.profiles;
CREATE POLICY "alteracao_pix_exige_mfa"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
  AND 
  (
    (NEW.chave_pix_hash IS DISTINCT FROM OLD.chave_pix_hash AND (auth.jwt()->>'aal') = 'aal2')
    OR
    (NEW.chave_pix_hash IS NOT DISTINCT FROM OLD.chave_pix_hash)
  )
);
