-- CORREÇÃO DAS POLÍTICAS DE RLS DAS TABELAS DE CONVITES
-- QUALIFICA AS FUNÇÕES E ENUMS COM O SCHEMA PUBLIC PARA EVITAR ERROS DE SCHEMA CACHE E PERMISSÕES

-- ==========================================
-- 1. CORREÇÃO NA TABELA public.convites
-- ==========================================
DROP POLICY IF EXISTS "admins insert convites" ON public.convites;
DROP POLICY IF EXISTS "admins delete convites" ON public.convites;

CREATE POLICY "admins insert convites" ON public.convites
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins delete convites" ON public.convites
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- ==========================================
-- 2. CORREÇÃO NA TABELA public.partner_invites
-- ==========================================
DROP POLICY IF EXISTS "admins read invites" ON public.partner_invites;
DROP POLICY IF EXISTS "admins insert invites" ON public.partner_invites;
DROP POLICY IF EXISTS "admins delete invites" ON public.partner_invites;

CREATE POLICY "admins read invites" ON public.partner_invites
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins insert invites" ON public.partner_invites
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND created_by = auth.uid());

CREATE POLICY "admins delete invites" ON public.partner_invites
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
