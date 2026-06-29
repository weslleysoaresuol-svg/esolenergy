-- 1. ADICIONA NOVOS CARGOS AO ENUM APP_ROLE
-- Usando um bloco anônimo para evitar erros caso os valores já existam
DO $$
BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auxiliar';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'atendente';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. ADICIONA COLUNA DE CARGO A SER ATRIBUÍDO NO CONVITE
ALTER TABLE public.partner_invites 
ADD COLUMN IF NOT EXISTS role_to_assign public.app_role DEFAULT 'corretor'::public.app_role NOT NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'convites') THEN
        ALTER TABLE public.convites 
        ADD COLUMN IF NOT EXISTS role_to_assign public.app_role DEFAULT 'corretor'::public.app_role NOT NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. FORTALECE JURIDICAMENTE O CONTRATO DE PARCERIA
-- Adiciona colunas para selfie, fotos dos documentos e assinatura
ALTER TABLE public.contratos_parceria
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS documento_frente_url TEXT,
ADD COLUMN IF NOT EXISTS documento_verso_url TEXT,
ADD COLUMN IF NOT EXISTS codigo_verificacao_email TEXT,
ADD COLUMN IF NOT EXISTS hash_conteudo_contrato TEXT;

-- 4. ATUALIZA A FUNÇÃO SECURITY DEFINER DE CONSUMIR CONVITE
CREATE OR REPLACE FUNCTION public.consume_invite(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invite_partner public.partner_invites%ROWTYPE;
  _role public.app_role := 'corretor'::public.app_role;
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
    _role := _invite_partner.role_to_assign;
    
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

-- Garante as permissões de execução
REVOKE EXECUTE ON FUNCTION public.consume_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_invite(uuid) TO authenticated;
