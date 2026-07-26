-- 1. Atualiza a trigger handle_new_user para associar o cargo correto de convites pendentes e marcar admin de forma imediata
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  assigned_role TEXT := NULL;
  _invite_role TEXT := NULL;
  _invite_note TEXT := NULL;
BEGIN
  -- Tenta buscar cargo em convites pendentes por e-mail na tabela convites
  BEGIN
    SELECT role_to_assign INTO _invite_role 
    FROM public.convites 
    WHERE LOWER(email) = LOWER(NEW.email) AND used_at IS NULL 
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    _invite_role := NULL;
  END;

  -- Tenta buscar cargo em partner_invites caso não tenha encontrado em convites
  IF _invite_role IS NULL THEN
    SELECT role_to_assign, note INTO _invite_role, _invite_note
    FROM public.partner_invites
    WHERE (LOWER(note) LIKE LOWER('Equipe: ' || NEW.email || '%') OR LOWER(note) LIKE LOWER('Parceiro: ' || NEW.email || '%') OR role_to_assign IS NOT NULL)
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    -- Se não tiver role_to_assign direto mas tiver note com Cargo
    IF _invite_role IS NULL AND _invite_note IS NOT NULL AND _invite_note LIKE '%| Cargo:%' THEN
      _invite_role := trim(split_part(_invite_note, '| Cargo:', 2));
    END IF;
  END IF;

  -- Define o cargo resolvido do convite
  IF _invite_role IS NOT NULL THEN
    assigned_role := _invite_role;
  END IF;

  -- Fallback padrão se não houver convite
  IF assigned_role IS NULL THEN
    IF LOWER(NEW.email) = 'marcos.nubank777@gmail.com' THEN
      assigned_role := 'admin';
    ELSE
      SELECT COUNT(*) INTO user_count FROM public.user_roles;
      IF user_count = 0 THEN
        assigned_role := 'admin';
      ELSE
        assigned_role := 'corretor';
      END IF;
    END IF;
  END IF;

  -- Cria o perfil do usuário
  INSERT INTO public.profiles (id, nome, email, avatar_url, ativo, onboarding_completo, contrato_assinado)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    -- Administradores entram como ativos e onboarding/contrato marcados como concluídos
    CASE WHEN assigned_role = 'admin' THEN true ELSE false END,
    CASE WHEN assigned_role = 'admin' THEN true ELSE false END,
    CASE WHEN assigned_role = 'admin' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    ativo = CASE WHEN assigned_role = 'admin' THEN true ELSE public.profiles.ativo END,
    onboarding_completo = CASE WHEN assigned_role = 'admin' THEN true ELSE public.profiles.onboarding_completo END,
    contrato_assinado = CASE WHEN assigned_role = 'admin' THEN true ELSE public.profiles.contrato_assinado END;

  -- Associa o cargo
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END $$;


-- 2. Atualiza a RPC consume_invite para limpar role 'corretor' residual de equipe
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
    
    -- Se a note contiver a marcação de cargo do ERP (| Cargo: ...), decodifica para assegurar cargo correto
    IF _invite_partner.note IS NOT NULL AND _invite_partner.note LIKE '%| Cargo:%' THEN
      _role := trim(split_part(_invite_partner.note, '| Cargo:', 2));
    END IF;
    
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

  -- Se for de equipe (não corretor), remove a role padrão 'corretor' que a trigger handle_new_user possa ter inserido
  IF _role <> 'corretor' THEN
    DELETE FROM public.user_roles WHERE user_id = _uid AND role = 'corretor';
  END IF;

  RETURN true;
END $function$;


-- 3. Limpeza retroativa de administradores criados via convite
DO $$
DECLARE
  _r RECORD;
BEGIN
  -- Percorre os usuários que usaram convites para admin na tabela convites
  BEGIN
    FOR _r IN 
      SELECT used_by 
      FROM public.convites 
      WHERE role_to_assign = 'admin' AND used_by IS NOT NULL
    LOOP
      -- Insere role admin se não existir
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (_r.used_by, 'admin') 
      ON CONFLICT (user_id, role) DO NOTHING;
      
      -- Deleta role corretor
      DELETE FROM public.user_roles WHERE user_id = _r.used_by AND role = 'corretor';
      
      -- Atualiza profile
      UPDATE public.profiles 
      SET onboarding_completo = true, contrato_assinado = true, ativo = true 
      WHERE id = _r.used_by;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    -- Silencia se a tabela convites não existir
  END;

  -- Percorre os usuários que usaram convites para admin na tabela partner_invites
  BEGIN
    FOR _r IN 
      SELECT used_by, note, role_to_assign
      FROM public.partner_invites 
      WHERE used_by IS NOT NULL 
        AND (role_to_assign = 'admin' OR note LIKE '%Cargo: admin%' OR note LIKE '%Cargo:admin%')
    LOOP
      -- Insere role admin se não existir
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (_r.used_by, 'admin') 
      ON CONFLICT (user_id, role) DO NOTHING;
      
      -- Deleta role corretor
      DELETE FROM public.user_roles WHERE user_id = _r.used_by AND role = 'corretor';
      
      -- Atualiza profile
      UPDATE public.profiles 
      SET onboarding_completo = true, contrato_assinado = true, ativo = true 
      WHERE id = _r.used_by;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    -- Silencia
  END;
END $$;
