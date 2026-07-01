-- MIGRATION: Alinhamento das Políticas de RLS para Perfis Operacionais e Financeiros do ERP (Backoffice)
-- Permite que usuários internos (como auxiliar administrativo, atendente, vendedor, engenheiro, pos-vendas, financeiro)
-- consigam visualizar e gerenciar os dados operacionais e de clientes de forma compatível com suas roles de negócio.

-- 1. CRIAÇÃO DA FUNÇÃO AUXILIAR DE VERIFICAÇÃO DE USUÁRIOS INTERNOS
CREATE OR REPLACE FUNCTION public.is_internal_user(_user_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role IN ('admin', 'auxiliar', 'atendente', 'vendedor', 'engenheiro', 'pos_vendas', 'financeiro')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_internal_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_internal_user(UUID) TO authenticated;

-- ============================================================================
-- A. TABELA public.clientes & public.interacoes
-- ============================================================================
DROP POLICY IF EXISTS "clientes_select" ON public.clientes;
CREATE POLICY "clientes_select" ON public.clientes 
  FOR SELECT TO authenticated 
  USING (corretor_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "clientes_insert" ON public.clientes;
CREATE POLICY "clientes_insert" ON public.clientes 
  FOR INSERT TO authenticated 
  WITH CHECK (corretor_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "clientes_update" ON public.clientes;
CREATE POLICY "clientes_update" ON public.clientes 
  FOR UPDATE TO authenticated 
  USING (corretor_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "interacoes_select" ON public.interacoes;
CREATE POLICY "interacoes_select" ON public.interacoes 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = cliente_id 
      AND (c.corretor_id = auth.uid() OR public.is_internal_user(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "interacoes_insert" ON public.interacoes;
CREATE POLICY "interacoes_insert" ON public.interacoes 
  FOR INSERT TO authenticated 
  WITH CHECK (
    autor_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = cliente_id 
      AND (c.corretor_id = auth.uid() OR public.is_internal_user(auth.uid()))
    )
  );

-- ============================================================================
-- B. TABELA public.propostas & public.proposta_clientes
-- ============================================================================
DROP POLICY IF EXISTS "propostas parceiro select" ON public.propostas;
CREATE POLICY "propostas parceiro select" ON public.propostas 
  FOR SELECT TO authenticated
  USING (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "propostas parceiro insert" ON public.propostas;
CREATE POLICY "propostas parceiro insert" ON public.propostas 
  FOR INSERT TO authenticated
  WITH CHECK (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "propostas parceiro update" ON public.propostas;
CREATE POLICY "propostas parceiro update" ON public.propostas 
  FOR UPDATE TO authenticated
  USING (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()))
  WITH CHECK (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "pc parceiro all" ON public.proposta_clientes;
CREATE POLICY "pc parceiro all" ON public.proposta_clientes 
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.propostas p 
      WHERE p.id = proposta_id 
      AND (p.parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()))
    )
  );

-- ============================================================================
-- C. TABELA public.pedidos
-- ============================================================================
DROP POLICY IF EXISTS "pedidos_parceiro_own" ON public.pedidos;
CREATE POLICY "pedidos_parceiro_own" ON public.pedidos
  FOR ALL TO authenticated
  USING (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()))
  WITH CHECK (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()));

-- ============================================================================
-- D. TABELA public.financiamentos & public.financiamento_eventos
-- ============================================================================
DROP POLICY IF EXISTS "fin_parceiro_own" ON public.financiamentos;
CREATE POLICY "fin_parceiro_own" ON public.financiamentos
  FOR ALL TO authenticated
  USING (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()))
  WITH CHECK (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid()));

DROP POLICY IF EXISTS "fin_ev_read" ON public.financiamento_eventos;
CREATE POLICY "fin_ev_read" ON public.financiamento_eventos
  FOR SELECT TO authenticated
  USING (
    public.is_internal_user(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.financiamentos f
      WHERE f.id = public.financiamento_eventos.financiamento_id AND f.parceiro_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "fin_ev_insert" ON public.financiamento_eventos;
CREATE POLICY "fin_ev_insert" ON public.financiamento_eventos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_internal_user(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.financiamentos f
      WHERE f.id = public.financiamento_eventos.financiamento_id AND f.parceiro_id = auth.uid()
    )
  );

-- ============================================================================
-- E. TABELA public.timeline_cliente
-- ============================================================================
DROP POLICY IF EXISTS "timeline_parceiro_own_cliente" ON public.timeline_cliente;
CREATE POLICY "timeline_parceiro_own_cliente" ON public.timeline_cliente
  FOR SELECT TO authenticated
  USING (
    public.is_internal_user(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.timeline_cliente.cliente_id AND c.corretor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "timeline_parceiro_insert" ON public.timeline_cliente;
CREATE POLICY "timeline_parceiro_insert" ON public.timeline_cliente
  FOR INSERT TO authenticated
  WITH CHECK (
    (parceiro_id = auth.uid() OR public.is_internal_user(auth.uid())) AND
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = public.timeline_cliente.cliente_id 
      AND (c.corretor_id = auth.uid() OR public.is_internal_user(auth.uid()))
    )
  );

-- ============================================================================
-- F. TABELA public.kits_produtos (Gravação para Auxiliar Admin)
-- ============================================================================
DROP POLICY IF EXISTS "kits_admin_write" ON public.kits_produtos;
CREATE POLICY "kits_admin_write" ON public.kits_produtos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'auxiliar'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'auxiliar'::public.app_role));

-- ============================================================================
-- G. TABELAS FINANCEIRAS E GATEWAYS (Gerenciamento para o papel Financeiro)
-- ============================================================================

-- 1. Lançamentos Financeiros
DROP POLICY IF EXISTS "Admin/Financeiro tem controle total de lancamentos" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Admin tem controle total de lancamentos" ON public.financeiro_lancamentos;
CREATE POLICY "Admin/Financeiro tem controle total de lancamentos" 
  ON public.financeiro_lancamentos FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role));

-- 2. Pagamentos a Fornecedores
DROP POLICY IF EXISTS "Admin/Financeiro tem controle total de pagamentos a fornecedores" ON public.fornecedor_pagamentos;
DROP POLICY IF EXISTS "Admin tem controle total de pagamentos a fornecedores" ON public.fornecedor_pagamentos;
CREATE POLICY "Admin/Financeiro tem controle total de pagamentos a fornecedores" 
  ON public.fornecedor_pagamentos FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role));

-- 3. Comissões de Corretores
DROP POLICY IF EXISTS "Admin/Financeiro tem controle total de comissoes" ON public.parceiro_comissoes;
DROP POLICY IF EXISTS "Admin tem controle total de comissoes" ON public.parceiro_comissoes;
CREATE POLICY "Admin/Financeiro tem controle total de comissoes" 
  ON public.parceiro_comissoes FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role));

-- 4. Fornecedores Solar (Escrita para Financeiro também)
DROP POLICY IF EXISTS "Admin/Financeiro tem controle total de fornecedores" ON public.fornecedores_solar;
DROP POLICY IF EXISTS "Admin tem controle total de fornecedores" ON public.fornecedores_solar;
CREATE POLICY "Admin/Financeiro tem controle total de fornecedores" 
  ON public.fornecedores_solar FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role));

-- 5. Transações de Gateway
DROP POLICY IF EXISTS "Admin/Financeiro podem gerenciar transacoes de gateway" ON public.gateway_transactions;
DROP POLICY IF EXISTS "Admins podem fazer tudo com transacoes" ON public.gateway_transactions;
CREATE POLICY "Admin/Financeiro podem gerenciar transacoes de gateway" 
  ON public.gateway_transactions FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'financeiro'::public.app_role));
