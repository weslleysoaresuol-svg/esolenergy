-- MIGRAÇÃO PARA RECUPERAR O ACESSO ADMINISTRADOR DO PROPRIETÁRIO
DO $$
DECLARE
  _user_id uuid;
BEGIN
  -- 1. Busca o ID do usuário pelo e-mail
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = 'eng.weslleysoares@gmail.com';

  -- 2. Se o usuário for encontrado, atribui a role 'admin'
  IF _user_id IS NOT NULL THEN
    -- Exclui qualquer papel anterior na user_roles para esse usuário
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    -- Insere o papel de administrador na user_roles
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Garante que o perfil do usuário esteja ativo
    UPDATE public.profiles SET ativo = true WHERE id = _user_id;
  END IF;
END $$;
