-- ==============================================================================
-- 🛡️ MÓDULO 24: SECURITY RLS POLICIES (MFA & PREVENÇÃO IDOR/BOLA)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: Todas as tabelas operacionais do ecossistema.
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- 1. ENABLE RLS: ATIVAÇÃO DE ROW LEVEL SECURITY EM TODAS AS TABELAS
-- ══════════════════════════════════════════════════════════════
-- O default do PostgreSQL é permitir acesso. Habilitar o RLS muda para "Deny-by-Default".
-- Ninguém acessa nada a menos que uma Policy libere explicitamente.

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_comissoes_mmn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_lancamentos ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- 2. POLÍTICAS DE ROTEAMENTO (Prevenção BOLA/IDOR)
-- ══════════════════════════════════════════════════════════════

-- 2.1 TABELA: clientes
-- REGRA: Um consultor só pode ver os clientes atribuídos a ele mesmo.
CREATE POLICY "consultor_visualiza_proprios_clientes" 
ON public.clientes
FOR SELECT
TO authenticated
USING (
  corretor_id = auth.uid() 
  OR 
  auth.jwt() ->> 'role' IN ('admin', 'lider_mmn_regional')
);

-- REGRA: Um consultor NÃO pode atualizar o status de um cliente de outro corretor.
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
-- REGRA: O solicitante vê seus próprios tickets, o atendente vê os tickets atribuídos a ele.
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
-- REGRA: O consultor pode inserir um pedido de SAQUE, MAS APENAS se o JWT
-- conter a flag AAL2 (Authenticator Assurance Level 2), provando o uso do Google Auth (TOTP/Passkeys).

CREATE POLICY "saque_comissao_exige_mfa"
ON public.historico_comissoes_mmn
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = consultor_id -- Impede saque para terceiros (IDOR)
  AND 
  tipo_movimentacao = 'saque'
  AND 
  (auth.jwt()->>'aal') = 'aal2' -- <- EXIGÊNCIA SOC 2: MFA Obrigatório para transações
);

-- 3.2 TABELA: profiles (ALTERAÇÃO DE CHAVE PIX)
-- REGRA: Alterar dados bancários ou PIX exige MFA AAL2.
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
    -- Se a chave pix nova for diferente da velha, exige MFA
    (NEW.chave_pix_hash IS DISTINCT FROM OLD.chave_pix_hash AND (auth.jwt()->>'aal') = 'aal2')
    OR
    (NEW.chave_pix_hash IS NOT DISTINCT FROM OLD.chave_pix_hash)
  )
);
