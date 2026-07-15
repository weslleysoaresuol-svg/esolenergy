-- MIGRATION: ultimate_admin_fix
-- Redefine a trigger handle_new_user e a RPC check_and_fix_admin_role para eliminar
-- dependências estáticas de colunas extras (como role_to_assign em partner_invites)
-- e corrigir a lógica de associação de e-mail.

-- 1. Redefine a trigger handle_new_user para associar cargos de forma robusta e segura
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  assigned_role TEXT := NULL;
  _invite_note TEXT := NULL;
BEGIN
  -- Tenta buscar em partner_invites por e-mail contido na note (tabela padrão garantida)
  SELECT note INTO _invite_note
  FROM public.partner_invites
  WHERE (
    LOWER(note) LIKE LOWER('Equipe: ' || NEW.email || '%')
    OR LOWER(note) LIKE LOWER('Parceiro: ' || NEW.email || '%')
    OR LOWER(note) LIKE LOWER('%' || NEW.email || '%')
  )
  AND used_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se encontrou o convite pela nota, decodifica o cargo
  IF _invite_note IS NOT NULL THEN
    IF LOWER(_invite_note) LIKE '%| cargo:%' THEN
      assigned_role := trim(split_part(_invite_note, '| Cargo:', 2));
    ELSIF LOWER(_invite_note) LIKE '%|cargo:%' THEN
      assigned_role := trim(split_part(_invite_note, '|Cargo:', 2));
    ELSE
      -- Fallback se tiver o email na nota mas sem formato de cargo, assume corretor
      assigned_role := 'corretor';
    END IF;
  END IF;

  -- Tenta buscar na tabela convites (tabela alternativa) caso não tenha achado na nota
  IF assigned_role IS NULL THEN
    BEGIN
      EXECUTE 'SELECT role_to_assign FROM public.convites WHERE LOWER(email) = LOWER($1) AND used_at IS NULL LIMIT 1'
      INTO assigned_role
      USING NEW.email;
    EXCEPTION WHEN OTHERS THEN
      assigned_role := NULL;
    END;
  END IF;

  -- Se ainda for nulo, tenta extrair de uma possível coluna role_to_assign na partner_invites de forma dinâmica
  IF assigned_role IS NULL THEN
    BEGIN
      EXECUTE 'SELECT role_to_assign FROM public.partner_invites WHERE (LOWER(note) LIKE LOWER($1) OR used_by IS NULL) AND used_at IS NULL LIMIT 1'
      INTO assigned_role
      USING '%' || NEW.email || '%';
    EXCEPTION WHEN OTHERS THEN
      assigned_role := NULL;
    END;
  END IF;

  -- Fallback padrão
  IF assigned_role IS NULL OR assigned_role = '' THEN
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

  -- Normaliza cargo
  assigned_role := LOWER(trim(assigned_role));

  -- Cria ou atualiza o perfil do usuário
  INSERT INTO public.profiles (id, nome, email, avatar_url, ativo, onboarding_completo, contrato_assinado)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    -- Admins entram como ativos e onboarding/contrato marcados como concluídos
    CASE WHEN assigned_role = 'admin' THEN true ELSE false END,
    CASE WHEN assigned_role = 'admin' THEN true ELSE false END,
    CASE WHEN assigned_role = 'admin' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    ativo = CASE WHEN assigned_role = 'admin' THEN true ELSE public.profiles.ativo END,
    onboarding_completo = CASE WHEN assigned_role = 'admin' THEN true ELSE public.profiles.onboarding_completo END,
    contrato_assinado = CASE WHEN assigned_role = 'admin' THEN true ELSE public.profiles.contrato_assinado END;

  -- Associa o cargo na tabela user_roles
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END $$;


-- 2. Redefine a RPC check_and_fix_admin_role para ser totalmente dinâmica e segura
CREATE OR REPLACE FUNCTION public.check_and_fix_admin_role()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _email TEXT;
  _has_admin_invite BOOLEAN := false;
  _current_role TEXT;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('fixed', false, 'role', null);
  END IF;

  -- Busca o email do usuário logado
  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  -- Verifica se ele já possui a role admin ativa
  SELECT role INTO _current_role FROM public.user_roles WHERE user_id = _uid AND role = 'admin' LIMIT 1;
  IF _current_role = 'admin' THEN
    -- Garante que o perfil dele esteja marcado como completo
    UPDATE public.profiles
    SET onboarding_completo = true, contrato_assinado = true, ativo = true
    WHERE id = _uid;

    -- Garante a remoção da role corretor residual se houver
    DELETE FROM public.user_roles WHERE user_id = _uid AND role = 'corretor';

    RETURN jsonb_build_object('fixed', true, 'role', 'admin');
  END IF;

  -- Busca na nota de partner_invites por email e cargo admin (sem usar coluna role_to_assign)
  SELECT EXISTS (
    SELECT 1 FROM public.partner_invites
    WHERE LOWER(note) LIKE '%' || LOWER(_email) || '%'
    AND (
      LOWER(note) LIKE '%cargo: admin%' 
      OR LOWER(note) LIKE '%cargo:admin%'
      OR LOWER(note) LIKE '%cargo: "admin"%'
      OR LOWER(note) LIKE '%cargo: ""admin""%'
    )
  ) INTO _has_admin_invite;

  -- Busca complementar dinâmica na tabela convites
  IF NOT _has_admin_invite THEN
    BEGIN
      EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.convites WHERE LOWER(email) = LOWER($1) AND LOWER(role_to_assign::text) = ''admin'' LIMIT 1)'
      INTO _has_admin_invite
      USING _email;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- Busca complementar dinâmica na coluna role_to_assign de partner_invites se existir
  IF NOT _has_admin_invite THEN
    BEGIN
      EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.partner_invites WHERE (LOWER(note) LIKE LOWER($1) OR used_by = $2) AND LOWER(role_to_assign::text) = ''admin'' LIMIT 1)'
      INTO _has_admin_invite
      USING '%' || _email || '%', _uid;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF _has_admin_invite THEN
    -- Aplica a correção de role admin
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Exclui a role corretor residual
    DELETE FROM public.user_roles WHERE user_id = _uid AND role = 'corretor';

    -- Atualiza perfil como completo
    UPDATE public.profiles
    SET onboarding_completo = true, contrato_assinado = true, ativo = true
    WHERE id = _uid;

    RETURN jsonb_build_object('fixed', true, 'role', 'admin');
  END IF;

  -- Caso contrário, retorna a role atual (corretor)
  SELECT role INTO _current_role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
  RETURN jsonb_build_object('fixed', false, 'role', _current_role);
END $function$;

REVOKE EXECUTE ON FUNCTION public.check_and_fix_admin_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_and_fix_admin_role() TO authenticated;


-- 3. Correção retroativa imediata para o e-mail empreendedor.marcossilva@gmail.com
-- e qualquer outro admin afetado
DO $$
DECLARE
  _u RECORD;
BEGIN
  FOR _u IN 
    SELECT id, email FROM auth.users 
    WHERE LOWER(email) = 'empreendedor.marcossilva@gmail.com'
       OR LOWER(email) IN (
         SELECT email FROM public.convites WHERE LOWER(role_to_assign::text) = 'admin'
       )
       OR id IN (
         SELECT used_by FROM public.partner_invites 
         WHERE LOWER(note) LIKE '%cargo: admin%' 
            OR LOWER(note) LIKE '%cargo:admin%'
       )
  LOOP
    -- Garante a role admin
    INSERT INTO public.user_roles (user_id, role) VALUES (_u.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Deleta a role corretor residual
    DELETE FROM public.user_roles WHERE user_id = _u.id AND role = 'corretor';

    -- Atualiza o perfil como completo
    UPDATE public.profiles
    SET onboarding_completo = true, contrato_assinado = true, ativo = true
    WHERE id = _u.id;
  END LOOP;
END $$;

-- 4. Força reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
