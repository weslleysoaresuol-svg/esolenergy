
-- 1. Replace broad SELECT policies on partner_invites with token-scoped validation
DROP POLICY IF EXISTS "anon validate by token" ON public.partner_invites;
DROP POLICY IF EXISTS "auth read invites" ON public.partner_invites;

CREATE POLICY "admins read invites" ON public.partner_invites
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Public token validator: returns minimal info only for the supplied token
CREATE OR REPLACE FUNCTION public.validate_invite(_token uuid)
RETURNS TABLE(valid boolean, reason text, expires_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _i public.partner_invites%ROWTYPE;
BEGIN
  SELECT * INTO _i FROM public.partner_invites WHERE token = _token;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Link de convite não encontrado.'::text, NULL::timestamptz; RETURN;
  END IF;
  IF _i.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Este convite já foi utilizado.'::text, _i.expires_at; RETURN;
  END IF;
  IF _i.expires_at < now() THEN
    RETURN QUERY SELECT false, 'Este convite expirou.'::text, _i.expires_at; RETURN;
  END IF;
  RETURN QUERY SELECT true, NULL::text, _i.expires_at;
END $$;

REVOKE ALL ON FUNCTION public.validate_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_invite(uuid) TO anon, authenticated;

-- 3. Lock down SECURITY DEFINER functions to required roles only
REVOKE ALL ON FUNCTION public.consume_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_invite(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
