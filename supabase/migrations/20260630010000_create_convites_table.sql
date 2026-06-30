-- CRIA A TABELA DE CONVITES PARA EQUIPE E PARCEIROS (REPRESENTANDO PUBLIC.CONVITES NO SCHEMA CACHE)
CREATE TABLE IF NOT EXISTS public.convites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  role_to_assign public.app_role NOT NULL DEFAULT 'corretor'::public.app_role,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CONCEDE PERMISSÕES DE ACESSO
GRANT SELECT ON public.convites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.convites TO authenticated;
GRANT ALL ON public.convites TO service_role;

-- ATIVA RLS (ROW LEVEL SECURITY)
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- CRIA POLÍTICAS DE RLS
DROP POLICY IF EXISTS "anon validate by token on convites" ON public.convites;
CREATE POLICY "anon validate by token on convites" ON public.convites
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "auth read convites" ON public.convites;
CREATE POLICY "auth read convites" ON public.convites
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admins insert convites" ON public.convites;
CREATE POLICY "admins insert convites" ON public.convites
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins delete convites" ON public.convites;
CREATE POLICY "admins delete convites" ON public.convites
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
