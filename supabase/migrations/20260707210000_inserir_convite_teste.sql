-- Migração temporária de teste para criar um convite de administrador fixo
-- E limpar qualquer cadastro de teste anterior com o email de teste

DO $$
DECLARE
  _old_uid uuid;
BEGIN
  -- 1. Busca e remove usuário de teste anterior se existir
  SELECT id INTO _old_uid FROM auth.users WHERE email = 'teste.admin@esolenergy.com';
  IF _old_uid IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = _old_uid;
    DELETE FROM public.profiles WHERE id = _old_uid;
    DELETE FROM auth.users WHERE id = _old_uid;
  END IF;

  -- 2. Limpa e reinserte o convite de teste na tabela convites
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'convites') THEN
    DELETE FROM public.convites WHERE token = '00000000-0000-0000-0000-000000000000';
    INSERT INTO public.convites (email, token, role_to_assign, status, created_at)
    VALUES (
      'teste.admin@esolenergy.com',
      '00000000-0000-0000-0000-000000000000',
      'admin',
      'pendente',
      now()
    );
  END IF;

  -- 3. Limpa e reinserte na tabela partner_invites (como garantia adicional)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partner_invites') THEN
    DELETE FROM public.partner_invites WHERE token = '00000000-0000-0000-0000-000000000000';
    INSERT INTO public.partner_invites (token, note, created_at, role_to_assign)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'Convite de teste para Administrador',
      now(),
      'admin'
    );
  END IF;
END $$;
