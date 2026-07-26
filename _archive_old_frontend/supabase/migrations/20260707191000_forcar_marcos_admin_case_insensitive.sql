-- Migração para forçar o Marcos como administrador de forma case-insensitive
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  assigned_role public.app_role;
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

DO $$
DECLARE
  _user_id uuid;
BEGIN
  -- 1. Busca o ID do usuário pelo e-mail em letras minúsculas
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE LOWER(email) = 'marcos.nubank777@gmail.com';

  -- 2. Se o usuário for encontrado, atribui a role 'admin' e ativa o perfil
  IF _user_id IS NOT NULL THEN
    -- Exclui qualquer papel anterior
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    -- Insere a role 'admin' na tabela user_roles
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Ativa o perfil dele e marca onboarding como concluído para destravar
    UPDATE public.profiles 
    SET 
      ativo = true, 
      onboarding_completo = true,
      contrato_assinado = true -- Define como assinado por padrão para tirar o aviso visual e liberar acesso total
    WHERE id = _user_id;
  END IF;
END $$;
