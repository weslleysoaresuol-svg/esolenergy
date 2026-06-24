-- Sistema de convites para novos parceiros
-- 1) Ajusta handle_new_user: não atribui mais role automaticamente (apenas para o primeiro usuário = admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, nome, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;

-- 2) Tabela de convites de parceiros
CREATE TABLE public.partner_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_invites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_invites TO authenticated;
GRANT ALL ON public.partner_invites TO service_role;
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon validate by token" ON public.partner_invites
  FOR SELECT TO anon USING (true);
CREATE POLICY "auth read invites" ON public.partner_invites
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins insert invites" ON public.partner_invites
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());
CREATE POLICY "admins delete invites" ON public.partner_invites
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3) Função para o novo parceiro consumir o convite (cria role 'corretor' e marca usado)
CREATE OR REPLACE FUNCTION public.consume_invite(_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _invite public.partner_invites%ROWTYPE;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _invite FROM public.partner_invites WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  IF _invite.used_at IS NOT NULL THEN RAISE EXCEPTION 'Convite já utilizado'; END IF;
  IF _invite.expires_at < now() THEN RAISE EXCEPTION 'Convite expirado'; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'corretor')
    ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE public.partner_invites SET used_at = now(), used_by = _uid WHERE id = _invite.id;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.consume_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_invite(uuid) TO authenticated;