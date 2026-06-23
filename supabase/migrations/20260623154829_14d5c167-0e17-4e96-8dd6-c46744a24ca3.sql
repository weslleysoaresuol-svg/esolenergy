
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'corretor');
CREATE TYPE public.cliente_status AS ENUM ('novo','contato','visita_agendada','proposta_enviada','negociacao','contrato_assinado','instalacao','concluido','perdido');
CREATE TYPE public.imovel_tipo AS ENUM ('residencial','comercial','industrial','rural');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  creci TEXT,
  cidade TEXT,
  estado TEXT,
  bio TEXT,
  avatar_url TEXT,
  comissao_percent NUMERIC DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT true,
  onboarding_completo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- pessoais
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT NOT NULL,
  cpf_cnpj TEXT,
  data_nascimento DATE,
  -- endereço
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  -- imóvel
  imovel_tipo public.imovel_tipo DEFAULT 'residencial',
  area_telhado NUMERIC,
  tipo_telhado TEXT,
  -- consumo
  concessionaria TEXT,
  consumo_kwh NUMERIC,
  valor_fatura NUMERIC,
  numero_uc TEXT,
  -- projeto
  potencia_kwp NUMERIC,
  valor_estimado NUMERIC,
  payback_anos NUMERIC,
  forma_pagamento TEXT,
  -- pipeline
  status public.cliente_status NOT NULL DEFAULT 'novo',
  origem TEXT DEFAULT 'manual',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
-- allow anon insert via public landing form (lead capture) - restricted to insert only
GRANT INSERT ON public.clientes TO anon;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Interações
CREATE TABLE public.interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interacoes TO authenticated;
GRANT ALL ON public.interacoes TO service_role;
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- profiles: user can read all profiles (for showing corretor name), edit only own; admin all
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles: user reads own; admin manages all
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- clientes: corretor sees own; admin sees all
CREATE POLICY "clientes_select" ON public.clientes FOR SELECT TO authenticated USING (corretor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "clientes_insert" ON public.clientes FOR INSERT TO authenticated WITH CHECK (corretor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "clientes_update" ON public.clientes FOR UPDATE TO authenticated USING (corretor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "clientes_delete_admin" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
-- public lead capture from landing
CREATE POLICY "clientes_public_insert" ON public.clientes FOR INSERT TO anon WITH CHECK (corretor_id IS NULL AND status = 'novo');

-- interações: visíveis se o usuário pode ver o cliente
CREATE POLICY "interacoes_select" ON public.interacoes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = cliente_id AND (c.corretor_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "interacoes_insert" ON public.interacoes FOR INSERT TO authenticated WITH CHECK (
  autor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = cliente_id AND (c.corretor_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handle_new_user trigger: cria profile e atribui role (primeiro = admin, demais = corretor)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  assigned_role public.app_role;
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
    assigned_role := 'admin';
  ELSE
    assigned_role := 'corretor';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
