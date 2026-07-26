
DROP POLICY IF EXISTS "Allow public read access to financeiras_solar" ON public.financeiras_solar;
CREATE POLICY "financeiras_solar_read_auth" ON public.financeiras_solar FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.financeiras_solar FROM anon;

DROP POLICY IF EXISTS "kits_read_all" ON public.kits_produtos;
CREATE POLICY "kits_read_auth" ON public.kits_produtos FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.kits_produtos FROM anon;
