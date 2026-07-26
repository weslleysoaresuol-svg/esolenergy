-- Atualiza a função consume_invite para marcar onboarding_completo e contrato_assinado como true para administradores no banco de dados

CREATE OR REPLACE FUNCTION public.consume_invite(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invite_partner public.partner_invites%ROWTYPE;
  _role TEXT := 'corretor';
  _uid uuid := auth.uid();
  _found boolean := false;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  -- Admins não devem aceitar convites para mudar de papel
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'admin') THEN
    RAISE EXCEPTION 'Administradores não podem aceitar convites';
  END IF;

  -- Tenta buscar na tabela partner_invites
  SELECT * INTO _invite_partner FROM public.partner_invites WHERE token = _token FOR UPDATE;
  IF FOUND THEN
    _found := true;
    _role := _invite_partner.role_to_assign::text;
    
    IF _invite_partner.used_at IS NOT NULL THEN RAISE EXCEPTION 'Convite já utilizado'; END IF;
    IF _invite_partner.expires_at < now() THEN RAISE EXCEPTION 'Convite expirado'; END IF;
    
    UPDATE public.partner_invites SET used_at = now(), used_by = _uid WHERE id = _invite_partner.id;
  END IF;

  -- Tenta buscar na tabela convites caso não tenha encontrado em partner_invites
  IF NOT _found THEN
    BEGIN
      EXECUTE 'SELECT role_to_assign, used_at FROM public.convites WHERE token = $1 FOR UPDATE'
      INTO _role, _invite_partner.used_at
      USING _token;
      
      _found := true;
      
      IF _invite_partner.used_at IS NOT NULL THEN RAISE EXCEPTION 'Convite já utilizado'; END IF;
      
      EXECUTE 'UPDATE public.convites SET used_at = now(), used_by = $1, status = ''aceito'' WHERE token = $2'
      USING _uid, _token;
    EXCEPTION WHEN OTHERS THEN
      -- Se a tabela convites não existir, simplesmente continua sem falhar
      _found := false;
    END;
  END IF;

  IF NOT _found THEN
    RAISE EXCEPTION 'Convite inválido ou expirado';
  END IF;

  -- Atribui o cargo correto ao usuário na tabela user_roles
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
  -- Se for admin, atualiza o perfil marcando onboarding e contrato como concluídos/assinados
  IF _role = 'admin' THEN
    UPDATE public.profiles 
    SET 
      onboarding_completo = true, 
      contrato_assinado = true,
      ativo = true
    WHERE id = _uid;
  END IF;

  RETURN true;
END $function$;
