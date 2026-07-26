-- Criar tabela de aprovações de novos administradores para consenso mútuo
CREATE TABLE IF NOT EXISTS public.admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(new_admin_id, approved_by)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_approvals TO authenticated;
GRANT ALL ON public.admin_approvals TO service_role;

-- Enable RLS
ALTER TABLE public.admin_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_approvals_select" ON public.admin_approvals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_approvals_insert" ON public.admin_approvals
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND auth.uid() = approved_by
  );

CREATE POLICY "admin_approvals_delete" ON public.admin_approvals
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
