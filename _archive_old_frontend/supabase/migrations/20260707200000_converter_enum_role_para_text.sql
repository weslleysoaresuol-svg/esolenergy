-- Migração para converter a coluna role e as funções do enum app_role para TEXT
-- Isso resolve os erros de schema no banco de dados remoto da nuvem ao salvar novos cargos

-- 1. Recria a função has_role aceitando TEXT para evitar dependência do enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. Altera a coluna role da tabela user_roles para TEXT
ALTER TABLE public.user_roles ALTER COLUMN role TYPE TEXT USING role::text;

-- 3. Altera a coluna role_to_assign da tabela convites para TEXT (se ela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convites' AND column_name = 'role_to_assign') THEN
    ALTER TABLE public.convites ALTER COLUMN role_to_assign TYPE TEXT USING role_to_assign::text;
  END IF;
END $$;

-- 4. Altera a coluna role_to_assign da tabela partner_invites (se ela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_invites' AND column_name = 'role_to_assign') THEN
    ALTER TABLE public.partner_invites ALTER COLUMN role_to_assign TYPE TEXT USING role_to_assign::text;
  END IF;
END $$;

-- 5. Atualiza a trigger handle_new_user para usar TEXT
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  assigned_role TEXT;
BEGIN
  -- Cria o perfil do usuário
  INSERT INTO public.profiles (id, nome, email, avatar_url, ativo, onboarding_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN LOWER(NEW.email) = 'marcos.nubank777@gmail.com' THEN true ELSE false END,
    CASE WHEN LOWER(NEW.email) = 'marcos.nubank777@gmail.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    ativo = CASE WHEN LOWER(EXCLUDED.email) = 'marcos.nubank777@gmail.com' THEN true ELSE public.profiles.ativo END,
    onboarding_completo = CASE WHEN LOWER(EXCLUDED.email) = 'marcos.nubank777@gmail.com' THEN true ELSE public.profiles.onboarding_completo END;

  -- Define o cargo (role)
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

  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END $$;

-- 6. Atualiza a função consume_invite para usar TEXT
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
    
  RETURN true;
END $function$;
