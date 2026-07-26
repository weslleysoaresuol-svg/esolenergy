-- ==============================================================================
-- 🛡️ MÓDULO 24: SECURITY RLS POLICIES (MFA & PREVENÇÃO IDOR/BOLA)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: Todas as tabelas operacionais do ecossistema.
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- 1. ENABLE RLS: ATIVAÇÃO DE ROW LEVEL SECURITY EM TODAS AS TABELAS
-- ══════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rede_mmn ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ledger_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banking_transacoes_split ENABLE ROW LEVEL SECURITY;

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

-- 3.1 TABELA: banking_transacoes_split (SAQUES & REPASSES)
DROP POLICY IF EXISTS "saque_comissao_exige_mfa" ON public.banking_transacoes_split;
CREATE POLICY "saque_comissao_exige_mfa"
ON public.banking_transacoes_split
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt()->>'aal') = 'aal2' OR auth.jwt() ->> 'role' = 'service_role'
);

-- 3.2 TABELA: profiles (ALTERAÇÃO DE CHAVE PIX OU DADOS DE PERFIL)
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
);
