-- ATUALIZA A FUNÇÃO DE VALIDAÇÃO DE CONVITE PARA SUPORTAR DUAS TABELAS DE CONVITADOS
CREATE OR REPLACE FUNCTION public.validate_invite(_token uuid)
RETURNS TABLE(valid boolean, reason text, expires_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  _used_at timestamptz;
  _expires_at timestamptz;
  _found boolean := false;
BEGIN
  -- 1. Tenta buscar em partner_invites (tabela padrão)
  SELECT used_at, expires_at INTO _used_at, _expires_at 
  FROM public.partner_invites 
  WHERE token = _token;
  
  IF FOUND THEN
    _found := true;
  END IF;

  -- 2. Tenta buscar na tabela convites (tabela alternativa do ERP)
  IF NOT _found THEN
    BEGIN
      EXECUTE 'SELECT used_at, expires_at FROM public.convites WHERE token = $1'
      INTO _used_at, _expires_at
      USING _token;
      _found := true;
    EXCEPTION WHEN OTHERS THEN
      _found := false;
    END;
  END IF;

  IF NOT _found THEN
    RETURN QUERY SELECT false, 'Link de convite não encontrado.'::text, NULL::timestamptz; 
    RETURN;
  END IF;

  IF _used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Este convite já foi utilizado.'::text, _expires_at; 
    RETURN;
  END IF;

  IF _expires_at IS NOT NULL AND _expires_at < now() THEN
    RETURN QUERY SELECT false, 'Este convite expirou.'::text, _expires_at; 
    RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::text, _expires_at;
END $$;

REVOKE ALL ON FUNCTION public.validate_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_invite(uuid) TO anon, authenticated;
