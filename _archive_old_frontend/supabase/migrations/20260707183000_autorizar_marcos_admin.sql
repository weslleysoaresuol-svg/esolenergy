-- Migração para autorizar e promover o Marcos como administrador
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
    CASE WHEN NEW.email = 'marcos.nubank777@gmail.com' THEN true ELSE false END,
    CASE WHEN NEW.email = 'marcos.nubank777@gmail.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    ativo = CASE WHEN EXCLUDED.email = 'marcos.nubank777@gmail.com' THEN true ELSE public.profiles.ativo END,
    onboarding_completo = CASE WHEN EXCLUDED.email = 'marcos.nubank777@gmail.com' THEN true ELSE public.profiles.onboarding_completo END;

  -- Define o cargo (role)
  IF NEW.email = 'marcos.nubank777@gmail.com' THEN
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

-- Atualiza o usuário Marcos se ele já estiver cadastrado no auth.users
DO $$
DECLARE
  _user_id uuid;
BEGIN
  -- 1. Busca o ID do usuário pelo e-mail
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = 'marcos.nubank777@gmail.com';

  -- 2. Se o usuário for encontrado, atribui a role 'admin' e ativa seu perfil
  IF _user_id IS NOT NULL THEN
    -- Remove roles anteriores
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    -- Atribui cargo de admin
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Ativa o perfil e marca onboarding como concluído
    UPDATE public.profiles 
    SET ativo = true, onboarding_completo = true 
    WHERE id = _user_id;
  END IF;
END $$;
