
-- ============================================================================
-- ESOL ENERGY — Módulo Comercial Completo
-- Tabelas: kits_produtos, cotacoes, pedidos, financiamentos,
--          financiamento_eventos, timeline_cliente
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.cotacao_status AS ENUM (
    'rascunho','enviada','convertida_proposta','convertida_pedido','cancelada'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pedido_status AS ENUM (
    'novo','em_separacao','faturado','expedido','entregue','instalado','concluido','cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pedido_origem AS ENUM ('cotacao','proposta','manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.financiamento_status AS ENUM (
    'aguardando_documentos','em_analise','pre_aprovado','aprovado','recusado',
    'contrato_assinado','liberado','cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.timeline_tipo AS ENUM (
    'cotacao','proposta','pedido','financiamento','interacao','contrato','observacao'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 1. KITS PRODUTOS (catálogo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kits_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  faixa text NOT NULL DEFAULT 'residencial_pequeno',
  nome text NOT NULL,
  potencia_kwp numeric NOT NULL,
  quantidade_modulos integer NOT NULL,
  fabricante_modulos text,
  potencia_modulo_w integer NOT NULL DEFAULT 550,
  tecnologia_modulo text DEFAULT 'Monocristalino N-Type TOPCon',
  eficiencia_modulo numeric DEFAULT 22.0,
  inversor text,
  tipo_inversor text DEFAULT 'String On-Grid',
  garantia_modulos_anos integer DEFAULT 25,
  garantia_inversor_anos integer DEFAULT 10,
  preco numeric NOT NULL,
  consumo_kwh_min numeric,
  consumo_kwh_max numeric,
  imagem_url text,
  destaque boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kits_produtos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kits_produtos TO authenticated;
GRANT ALL ON public.kits_produtos TO service_role;

ALTER TABLE public.kits_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kits_read_all" ON public.kits_produtos
  FOR SELECT USING (true);

CREATE POLICY "kits_admin_write" ON public.kits_produtos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_kits_updated_at
  BEFORE UPDATE ON public.kits_produtos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. COTAÇÕES (rápidas, por produto)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cotacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_publico uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  kit_id uuid REFERENCES public.kits_produtos(id) ON DELETE SET NULL,
  -- snapshot do kit (para histórico imutável)
  kit_snapshot jsonb,
  quantidade integer NOT NULL DEFAULT 1,
  preco_unit numeric NOT NULL,
  preco_total numeric NOT NULL,
  observacoes text,
  status public.cotacao_status NOT NULL DEFAULT 'rascunho',
  proposta_id uuid,
  pedido_id uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cotacoes_parceiro ON public.cotacoes(parceiro_id);
CREATE INDEX idx_cotacoes_cliente  ON public.cotacoes(cliente_id);
CREATE INDEX idx_cotacoes_codigo   ON public.cotacoes(codigo_publico);
CREATE INDEX idx_cotacoes_status   ON public.cotacoes(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cotacoes TO authenticated;
GRANT ALL ON public.cotacoes TO service_role;

ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cotacoes_admin_all" ON public.cotacoes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "cotacoes_parceiro_own" ON public.cotacoes
  FOR ALL TO authenticated
  USING (parceiro_id = auth.uid())
  WITH CHECK (parceiro_id = auth.uid());

CREATE TRIGGER trg_cotacoes_updated_at
  BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. PEDIDOS
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.pedidos_numero_seq START 1;

CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE
    DEFAULT ('PED-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.pedidos_numero_seq')::text, 5, '0')),
  parceiro_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  origem public.pedido_origem NOT NULL DEFAULT 'manual',
  origem_id uuid, -- cotacao_id ou proposta_id
  kit_snapshot jsonb,
  descricao text,
  valor_total numeric NOT NULL,
  forma_pagamento text,
  status public.pedido_status NOT NULL DEFAULT 'novo',
  observacoes text,
  observacoes_cliente text,
  data_entrega_prevista date,
  data_instalacao_prevista date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedidos_parceiro ON public.pedidos(parceiro_id);
CREATE INDEX idx_pedidos_cliente  ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_status   ON public.pedidos(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos_admin_all" ON public.pedidos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pedidos_parceiro_own" ON public.pedidos
  FOR ALL TO authenticated
  USING (parceiro_id = auth.uid())
  WITH CHECK (parceiro_id = auth.uid());

CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. FINANCIAMENTOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financiamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_publico uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  pedido_id uuid REFERENCES public.pedidos(id) ON DELETE SET NULL,
  proposta_id uuid REFERENCES public.propostas(id) ON DELETE SET NULL,
  banco text,
  financeira text,
  valor_solicitado numeric NOT NULL,
  valor_aprovado numeric,
  parcelas integer,
  taxa_juros_am numeric, -- % ao mês
  parcela_mensal numeric,
  carencia_dias integer DEFAULT 0,
  status public.financiamento_status NOT NULL DEFAULT 'aguardando_documentos',
  observacoes_internas text,
  observacoes_cliente text,
  publicado boolean NOT NULL DEFAULT false,
  decidido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fin_parceiro ON public.financiamentos(parceiro_id);
CREATE INDEX idx_fin_cliente  ON public.financiamentos(cliente_id);
CREATE INDEX idx_fin_codigo   ON public.financiamentos(codigo_publico);
CREATE INDEX idx_fin_status   ON public.financiamentos(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financiamentos TO authenticated;
GRANT ALL ON public.financiamentos TO service_role;

ALTER TABLE public.financiamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_admin_all" ON public.financiamentos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "fin_parceiro_own" ON public.financiamentos
  FOR ALL TO authenticated
  USING (parceiro_id = auth.uid())
  WITH CHECK (parceiro_id = auth.uid());

CREATE TRIGGER trg_fin_updated_at
  BEFORE UPDATE ON public.financiamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. FINANCIAMENTO EVENTOS (log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financiamento_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  financiamento_id uuid NOT NULL REFERENCES public.financiamentos(id) ON DELETE CASCADE,
  status_anterior public.financiamento_status,
  status_novo public.financiamento_status NOT NULL,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  nota text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fin_ev_fin ON public.financiamento_eventos(financiamento_id);

GRANT SELECT, INSERT ON public.financiamento_eventos TO authenticated;
GRANT ALL ON public.financiamento_eventos TO service_role;

ALTER TABLE public.financiamento_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_ev_read" ON public.financiamento_eventos
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.financiamentos f
            WHERE f.id = financiamento_id AND f.parceiro_id = auth.uid())
  );

CREATE POLICY "fin_ev_insert" ON public.financiamento_eventos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.financiamentos f
            WHERE f.id = financiamento_id AND f.parceiro_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 6. TIMELINE DO CLIENTE (feed unificado)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timeline_cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  parceiro_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tipo public.timeline_tipo NOT NULL,
  referencia_id uuid,
  titulo text NOT NULL,
  descricao text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_cliente ON public.timeline_cliente(cliente_id, created_at DESC);

GRANT SELECT, INSERT ON public.timeline_cliente TO authenticated;
GRANT ALL ON public.timeline_cliente TO service_role;

ALTER TABLE public.timeline_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_admin_all" ON public.timeline_cliente
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "timeline_parceiro_own_cliente" ON public.timeline_cliente
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_id AND c.corretor_id = auth.uid()
  ));

CREATE POLICY "timeline_parceiro_insert" ON public.timeline_cliente
  FOR INSERT TO authenticated
  WITH CHECK (
    parceiro_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.clientes c
            WHERE c.id = cliente_id AND c.corretor_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 7. RPCs PÚBLICAS (cliente abre o link sem login)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cotacao_publica(_codigo uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _c public.cotacoes%ROWTYPE;
  _kit jsonb;
  _parceiro jsonb;
  _cliente jsonb;
BEGIN
  SELECT * INTO _c FROM public.cotacoes WHERE codigo_publico = _codigo;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF _c.status = 'rascunho' THEN RETURN NULL; END IF;

  SELECT to_jsonb(k) INTO _kit FROM public.kits_produtos k WHERE k.id = _c.kit_id;
  SELECT to_jsonb(p) INTO _parceiro FROM (
    SELECT nome, email, telefone, avatar_url FROM public.profiles WHERE id = _c.parceiro_id
  ) p;
  SELECT to_jsonb(cl) INTO _cliente FROM (
    SELECT nome, cidade, estado FROM public.clientes WHERE id = _c.cliente_id
  ) cl;

  RETURN jsonb_build_object(
    'cotacao', to_jsonb(_c),
    'kit', COALESCE(_kit, _c.kit_snapshot),
    'parceiro', _parceiro,
    'cliente', _cliente,
    'expirada', (_c.expires_at < now())
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_cotacao_publica(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cotacao_publica(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_financiamento_publico(_codigo uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _f public.financiamentos%ROWTYPE;
  _parceiro jsonb;
  _cliente jsonb;
  _eventos jsonb;
BEGIN
  SELECT * INTO _f FROM public.financiamentos WHERE codigo_publico = _codigo;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF NOT _f.publicado THEN RETURN NULL; END IF;

  SELECT to_jsonb(p) INTO _parceiro FROM (
    SELECT nome, email, telefone, avatar_url FROM public.profiles WHERE id = _f.parceiro_id
  ) p;
  SELECT to_jsonb(cl) INTO _cliente FROM (
    SELECT nome, cidade, estado FROM public.clientes WHERE id = _f.cliente_id
  ) cl;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'status_novo', e.status_novo, 'nota', e.nota, 'created_at', e.created_at
  ) ORDER BY e.created_at), '[]'::jsonb) INTO _eventos
    FROM public.financiamento_eventos e WHERE e.financiamento_id = _f.id;

  RETURN jsonb_build_object(
    'financiamento', jsonb_build_object(
      'id', _f.id,
      'status', _f.status,
      'banco', _f.banco,
      'financeira', _f.financeira,
      'valor_solicitado', _f.valor_solicitado,
      'valor_aprovado', _f.valor_aprovado,
      'parcelas', _f.parcelas,
      'taxa_juros_am', _f.taxa_juros_am,
      'parcela_mensal', _f.parcela_mensal,
      'carencia_dias', _f.carencia_dias,
      'observacoes_cliente', _f.observacoes_cliente,
      'decidido_em', _f.decidido_em,
      'created_at', _f.created_at,
      'updated_at', _f.updated_at
    ),
    'parceiro', _parceiro,
    'cliente', _cliente,
    'eventos', _eventos
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_financiamento_publico(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_financiamento_publico(uuid) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 8. TRIGGER: log automático de mudança de status no financiamento
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_financiamento_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.financiamento_eventos (financiamento_id, status_anterior, status_novo, autor_id)
      VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.financiamento_eventos (financiamento_id, status_anterior, status_novo, autor_id)
      VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    IF NEW.status IN ('aprovado','recusado','liberado') AND NEW.decidido_em IS NULL THEN
      NEW.decidido_em := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_log_fin_status
  BEFORE INSERT OR UPDATE ON public.financiamentos
  FOR EACH ROW EXECUTE FUNCTION public.log_financiamento_status();
