
-- Tabela de contratos de parceria assinados
CREATE TABLE public.contratos_parceria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  versao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  aceite_termos BOOLEAN NOT NULL DEFAULT false,
  assinatura_url TEXT,
  ip_assinatura TEXT,
  user_agent TEXT,
  assinado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.contratos_parceria TO authenticated;
GRANT ALL ON public.contratos_parceria TO service_role;

ALTER TABLE public.contratos_parceria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contratos_select_own" ON public.contratos_parceria
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "contratos_insert_own" ON public.contratos_parceria
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contratos_admin_all" ON public.contratos_parceria
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Flag de contrato assinado no perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contrato_assinado BOOLEAN NOT NULL DEFAULT false;

-- Políticas de storage para o bucket "parceiros" (criado via tool)
CREATE POLICY "parceiros_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'parceiros' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "parceiros_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'parceiros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "parceiros_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'parceiros' AND auth.uid()::text = (storage.foldername(name))[1]);
