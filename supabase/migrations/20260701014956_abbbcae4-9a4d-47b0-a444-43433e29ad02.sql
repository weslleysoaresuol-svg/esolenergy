
-- Fix proposta_eventos INSERT: require ownership of parent proposta
DROP POLICY IF EXISTS "eventos auth insert" ON public.proposta_eventos;
CREATE POLICY "eventos auth insert" ON public.proposta_eventos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.propostas p
      WHERE p.id = proposta_eventos.proposta_id
        AND (p.parceiro_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- Fix propostas INSERT: require corretor or admin role, and parceiro_id must be caller
DROP POLICY IF EXISTS "propostas parceiro insert" ON public.propostas;
CREATE POLICY "propostas parceiro insert" ON public.propostas
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      parceiro_id = auth.uid()
      AND public.has_role(auth.uid(), 'corretor'::app_role)
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
