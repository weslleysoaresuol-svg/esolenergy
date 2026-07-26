-- CORREÇÃO RETROATIVA ABRANGENTE: Corresponde usuários por EMAIL nos convites, não por used_by
-- Isso corrige administradores que foram redirecionados antes de consume_invite ser chamado

-- 1. Corrige baseado em partner_invites: extrai o email da coluna 'note' e corresponde ao auth.users
DO $$
DECLARE
  _r RECORD;
  _extracted_email TEXT;
  _found_user_id UUID;
BEGIN
  FOR _r IN 
    SELECT id, note, role_to_assign, used_by
    FROM public.partner_invites
    WHERE (
      LOWER(role_to_assign::text) = 'admin'
      OR LOWER(note) LIKE '% | cargo: admin%'
      OR LOWER(note) LIKE '%|cargo: admin%'
      OR LOWER(note) LIKE '% | cargo:admin%'
    )
  LOOP
    -- Extrai email do formato: "Equipe: email@test.com | Cargo: admin"
    IF _r.note IS NOT NULL AND _r.note LIKE '% | Cargo:%' THEN
      _extracted_email := LOWER(trim(
        replace(replace(
          split_part(_r.note, ' | Cargo:', 1),
          'Equipe: ', ''), 'Parceiro: ', '')
      ));
    ELSIF _r.note IS NOT NULL AND _r.note LIKE '%|Cargo:%' THEN
      _extracted_email := LOWER(trim(
        replace(replace(
          split_part(_r.note, '|Cargo:', 1),
          'Equipe: ', ''), 'Parceiro: ', '')
      ));
    ELSE
      _extracted_email := NULL;
    END IF;

    -- Corrige por email extraído da note
    IF _extracted_email IS NOT NULL AND _extracted_email != '' AND _extracted_email LIKE '%@%' THEN
      SELECT id INTO _found_user_id FROM auth.users WHERE LOWER(email) = _extracted_email LIMIT 1;

      IF _found_user_id IS NOT NULL THEN
        -- Garante role admin
        INSERT INTO public.user_roles (user_id, role) VALUES (_found_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- Remove role corretor residual
        DELETE FROM public.user_roles WHERE user_id = _found_user_id AND role = 'corretor';

        -- Atualiza perfil como admin completo
        UPDATE public.profiles
        SET onboarding_completo = true, contrato_assinado = true, ativo = true
        WHERE id = _found_user_id;

        RAISE NOTICE 'Corrigido por email: user_id=% email=%', _found_user_id, _extracted_email;
      END IF;
    END IF;

    -- Também corrige por used_by se disponível
    IF _r.used_by IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (_r.used_by, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;

      DELETE FROM public.user_roles WHERE user_id = _r.used_by AND role = 'corretor';

      UPDATE public.profiles
      SET onboarding_completo = true, contrato_assinado = true, ativo = true
      WHERE id = _r.used_by;
    END IF;

  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro no bloco partner_invites: %', SQLERRM;
END $$;

-- 2. Corrige baseado em convites (tabela alternativa)
DO $$
DECLARE
  _r RECORD;
  _found_user_id UUID;
BEGIN
  BEGIN
    FOR _r IN
      SELECT email, used_by
      FROM public.convites
      WHERE LOWER(role_to_assign::text) = 'admin'
    LOOP
      SELECT id INTO _found_user_id FROM auth.users WHERE LOWER(email) = LOWER(_r.email) LIMIT 1;

      IF _found_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (_found_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        DELETE FROM public.user_roles WHERE user_id = _found_user_id AND role = 'corretor';

        UPDATE public.profiles
        SET onboarding_completo = true, contrato_assinado = true, ativo = true
        WHERE id = _found_user_id;
      END IF;

      IF _r.used_by IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (_r.used_by, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        DELETE FROM public.user_roles WHERE user_id = _r.used_by AND role = 'corretor';

        UPDATE public.profiles
        SET onboarding_completo = true, contrato_assinado = true, ativo = true
        WHERE id = _r.used_by;
      END IF;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro no bloco convites: %', SQLERRM;
  END;
END $$;

-- 3. Cria RPC de auto-diagnóstico: verifica se o usuário autenticado tem convite de admin
-- e corrige sua role automaticamente (chamado pelo frontend ao detectar role errada)
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

  -- Busca o email do usuário
  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  -- Verifica a role atual
  SELECT role INTO _current_role FROM public.user_roles WHERE user_id = _uid AND role = 'admin' LIMIT 1;

  IF _current_role = 'admin' THEN
    RETURN jsonb_build_object('fixed', false, 'role', 'admin');
  END IF;

  -- Verifica se existe convite de admin para esse email em partner_invites
  SELECT true INTO _has_admin_invite
  FROM public.partner_invites
  WHERE (
    LOWER(note) LIKE '%' || LOWER(_email) || '%'
    AND (LOWER(note) LIKE '%cargo: admin%' OR LOWER(note) LIKE '%cargo:admin%')
  )
  OR LOWER(role_to_assign::text) = 'admin'
  LIMIT 1;

  -- Também verifica na tabela convites
  IF NOT _has_admin_invite THEN
    BEGIN
      EXECUTE 'SELECT true FROM public.convites WHERE LOWER(email) = LOWER($1) AND LOWER(role_to_assign::text) = ''admin'' LIMIT 1'
      INTO _has_admin_invite
      USING _email;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF _has_admin_invite THEN
    -- Corrige a role automaticamente
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    DELETE FROM public.user_roles WHERE user_id = _uid AND role = 'corretor';

    UPDATE public.profiles
    SET onboarding_completo = true, contrato_assinado = true, ativo = true
    WHERE id = _uid;

    RETURN jsonb_build_object('fixed', true, 'role', 'admin');
  END IF;

  RETURN jsonb_build_object('fixed', false, 'role', _current_role);
END $function$;

REVOKE EXECUTE ON FUNCTION public.check_and_fix_admin_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_and_fix_admin_role() TO authenticated;

-- 4. Força reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
