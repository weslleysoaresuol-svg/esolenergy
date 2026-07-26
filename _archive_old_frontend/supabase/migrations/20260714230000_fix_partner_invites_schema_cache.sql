-- Migration: Garante que role_to_assign existe como TEXT em partner_invites e force reload do schema cache do PostgREST
-- Isso resolve o erro "Could not find the 'role_to_assign' column of 'partner_invites' in the schema cache"

-- 1. Garante que a coluna role_to_assign existe em partner_invites como TEXT (não enum)
DO $$
BEGIN
  -- Se a coluna não existe, cria como TEXT com default 'corretor'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partner_invites' 
    AND column_name = 'role_to_assign'
  ) THEN
    ALTER TABLE public.partner_invites 
    ADD COLUMN role_to_assign TEXT NOT NULL DEFAULT 'corretor';
  ELSE
    -- Se já existe, garante que é TEXT (não enum)
    ALTER TABLE public.partner_invites 
    ALTER COLUMN role_to_assign TYPE TEXT USING role_to_assign::text;
    
    -- Garante que tem default definido
    ALTER TABLE public.partner_invites 
    ALTER COLUMN role_to_assign SET DEFAULT 'corretor';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Se a conversão falhar por outro motivo, tenta apenas setar o default
  BEGIN
    ALTER TABLE public.partner_invites ALTER COLUMN role_to_assign SET DEFAULT 'corretor';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 2. Garante que role_to_assign existe em convites como TEXT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'convites') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'convites' 
      AND column_name = 'role_to_assign'
    ) THEN
      ALTER TABLE public.convites ADD COLUMN role_to_assign TEXT NOT NULL DEFAULT 'corretor';
    ELSE
      ALTER TABLE public.convites ALTER COLUMN role_to_assign TYPE TEXT USING role_to_assign::text;
      ALTER TABLE public.convites ALTER COLUMN role_to_assign SET DEFAULT 'corretor';
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Força o reload do schema cache do PostgREST para que as alterações sejam detectadas imediatamente
NOTIFY pgrst, 'reload schema';
