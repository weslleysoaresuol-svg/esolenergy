-- ==============================================================================
-- 📦 MÓDULO 25: SUPABASE STORAGE BUCKETS SETUP & SECURITY POLICIES
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 02_identidade_rbac.sql
-- Buckets: faturas, contratos, kyc-selfies, epc-vistorias, atendimento-anexos,
--          loja-produtos, dam-assets
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- 1. CRIAÇÃO E CONFIGURAÇÃO DOS 7 BUCKETS DE ARMAZENAMENTO
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'faturas',
    'faturas',
    false,
    10485760, -- 10 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'contratos',
    'contratos',
    false,
    20971520, -- 20 MB
    ARRAY['application/pdf']
  ),
  (
    'kyc-selfies',
    'kyc-selfies',
    false,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png']
  ),
  (
    'epc-vistorias',
    'epc-vistorias',
    false,
    52428800, -- 50 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/zip', 'application/x-zip-compressed', 'image/vnd.dwg', 'application/octet-stream']
  ),
  (
    'atendimento-anexos',
    'atendimento-anexos',
    false,
    15728640, -- 15 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'loja-produtos',
    'loja-produtos',
    true,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'dam-assets',
    'dam-assets',
    true,
    104857600, -- 100 MB
    ARRAY['application/pdf', 'image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'video/mp4']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ══════════════════════════════════════════════════════════════
-- 2. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) EM STORAGE.OBJECTS
-- ══════════════════════════════════════════════════════════════

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- 3. POLÍTICAS DE RLS PARA BUCKETS PRIVADOS
-- ══════════════════════════════════════════════════════════════

-- 3.1 BUCKET: faturas
CREATE POLICY "faturas_select_owner_or_admin"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'faturas' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'pos_vendas', 'financeiro')
    )
  )
);

CREATE POLICY "faturas_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'faturas' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "faturas_delete_owner_or_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'faturas' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- 3.2 BUCKET: contratos
CREATE POLICY "contratos_select_authorized"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'contratos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'pos_vendas', 'financeiro')
    )
  )
);

CREATE POLICY "contratos_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contratos' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "contratos_delete_admin_only"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'contratos' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3.3 BUCKET: kyc-selfies (Ultra-Privado)
CREATE POLICY "kyc_selfies_select_owner_or_finance"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-selfies' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  )
);

CREATE POLICY "kyc_selfies_insert_owner"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-selfies' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "kyc_selfies_delete_admin_only"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kyc-selfies' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3.4 BUCKET: epc-vistorias
CREATE POLICY "epc_vistorias_select_authorized"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'epc-vistorias' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'engenheiro', 'instalador', 'pos_vendas')
    )
  )
);

CREATE POLICY "epc_vistorias_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'epc-vistorias'
);

CREATE POLICY "epc_vistorias_delete_owner_or_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'epc-vistorias' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'engenheiro')
    )
  )
);

-- 3.5 BUCKET: atendimento-anexos
CREATE POLICY "atendimento_anexos_select_authorized"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'atendimento-anexos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'pos_vendas')
    )
  )
);

CREATE POLICY "atendimento_anexos_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'atendimento-anexos'
);

-- ══════════════════════════════════════════════════════════════
-- 4. POLÍTICAS DE RLS PARA BUCKETS PÚBLICOS
-- ══════════════════════════════════════════════════════════════

-- 4.1 BUCKET: loja-produtos
CREATE POLICY "loja_produtos_select_public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'loja-produtos');

CREATE POLICY "loja_produtos_write_admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'loja-produtos' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "loja_produtos_delete_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'loja-produtos' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4.2 BUCKET: dam-assets
CREATE POLICY "dam_assets_select_public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'dam-assets');

CREATE POLICY "dam_assets_write_admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dam-assets' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "dam_assets_delete_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'dam-assets' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
