-- Remove unrestricted anon INSERT on proposta_eventos; the SECURITY DEFINER RPC
-- public.proposta_registrar_evento is the sole sanctioned path for public events.
DROP POLICY IF EXISTS "eventos anon insert" ON public.proposta_eventos;

-- Defense-in-depth on profiles: explicitly deny any non-owner, non-admin SELECT.
-- The permissive policies already restrict to own/admin, but a RESTRICTIVE policy
-- guarantees no future permissive policy can accidentally broaden reads of
-- sensitive fields (email, telefone, cpf_cnpj, comissao_percent, creci).
DROP POLICY IF EXISTS profiles_restrict_reads ON public.profiles;
CREATE POLICY profiles_restrict_reads ON public.profiles
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
