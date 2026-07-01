-- 1. Restaura a conta de administrador
DO $$
DECLARE
  _user_id uuid;
BEGIN
  SELECT id INTO _user_id FROM auth.users WHERE email = 'eng.weslleysoares@gmail.com';
  IF _user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.profiles SET ativo = true WHERE id = _user_id;
  END IF;
END $$;

-- 2. Cria a tabela de aprovações para o consenso
CREATE TABLE IF NOT EXISTS public.admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(new_admin_id, approved_by)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_approvals TO authenticated;
GRANT ALL ON public.admin_approvals TO service_role;

ALTER TABLE public.admin_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_approvals_select" ON public.admin_approvals;
DROP POLICY IF EXISTS "admin_approvals_insert" ON public.admin_approvals;
DROP POLICY IF EXISTS "admin_approvals_delete" ON public.admin_approvals;

CREATE POLICY "admin_approvals_select" ON public.admin_approvals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin_approvals_insert" ON public.admin_approvals
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND auth.uid() = approved_by);

CREATE POLICY "admin_approvals_delete" ON public.admin_approvals
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
