
-- ENUM status proposta
CREATE TYPE public.proposta_status AS ENUM ('rascunho','enviada','visualizada','aceita','recusada','expirada');
CREATE TYPE public.tipo_instalacao AS ENUM ('residencial','comercial','industrial','rural');

-- PARÂMETROS COMERCIAIS (linha única, editável pelo admin)
CREATE TABLE public.parametros_comerciais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- HSP médio por região (kWh/m²/dia)
  hsp_norte numeric NOT NULL DEFAULT 4.8,
  hsp_nordeste numeric NOT NULL DEFAULT 5.5,
  hsp_centro_oeste numeric NOT NULL DEFAULT 5.3,
  hsp_sudeste numeric NOT NULL DEFAULT 5.0,
  hsp_sul numeric NOT NULL DEFAULT 4.6,
  -- Preços de referência R$/Wp
  preco_wp_residencial_pequeno numeric NOT NULL DEFAULT 4.50,
  preco_wp_residencial_grande numeric NOT NULL DEFAULT 4.10,
  preco_wp_comercial_pequeno numeric NOT NULL DEFAULT 3.70,
  preco_wp_comercial_grande numeric NOT NULL DEFAULT 3.30,
  preco_wp_industrial numeric NOT NULL DEFAULT 2.90,
  -- Tarifas e técnicos
  tarifa_kwh_default numeric NOT NULL DEFAULT 0.95,
  perdas_sistema numeric NOT NULL DEFAULT 0.20,  -- 20% perdas
  inflacao_energetica numeric NOT NULL DEFAULT 0.08, -- 8% ao ano
  vida_util_anos integer NOT NULL DEFAULT 25,
  potencia_modulo_w integer NOT NULL DEFAULT 555,
  area_por_modulo_m2 numeric NOT NULL DEFAULT 2.6,
  -- Estrutura de custos (% do preço de venda)
  custo_equipamentos_pct numeric NOT NULL DEFAULT 0.60,
  custo_instalacao_pct numeric NOT NULL DEFAULT 0.12,
  custo_frete_pct numeric NOT NULL DEFAULT 0.03,
  custo_impostos_pct numeric NOT NULL DEFAULT 0.08,
  custo_comissao_pct numeric NOT NULL DEFAULT 0.07,
  margem_alvo_pct numeric NOT NULL DEFAULT 0.14,
  -- Capacidade
  capacidade_instaladores_kwp_mes integer NOT NULL DEFAULT 200,
  validade_proposta_dias integer NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.parametros_comerciais TO authenticated;
GRANT ALL ON public.parametros_comerciais TO service_role;
ALTER TABLE public.parametros_comerciais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "params read auth" ON public.parametros_comerciais FOR SELECT TO authenticated USING (true);
CREATE POLICY "params admin write" ON public.parametros_comerciais FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_params_updated BEFORE UPDATE ON public.parametros_comerciais FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.parametros_comerciais DEFAULT VALUES;

-- PROPOSTAS
CREATE TABLE public.propostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_publico uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  titulo text NOT NULL,
  status public.proposta_status NOT NULL DEFAULT 'rascunho',
  tipo_instalacao public.tipo_instalacao NOT NULL DEFAULT 'residencial',
  -- Dados de entrada
  consumo_kwh numeric NOT NULL,
  tarifa_kwh numeric NOT NULL,
  estado text,
  cidade text,
  regiao text, -- norte/nordeste/centro_oeste/sudeste/sul
  hsp numeric NOT NULL,
  -- Sistema dimensionado
  kwp_sistema numeric NOT NULL,
  qtd_modulos integer NOT NULL,
  potencia_modulo_w integer NOT NULL,
  qtd_inversores integer NOT NULL DEFAULT 1,
  potencia_inversor_kw numeric,
  area_necessaria_m2 numeric NOT NULL,
  -- Geração / economia
  geracao_mensal_kwh numeric NOT NULL,
  economia_mensal numeric NOT NULL,
  economia_anual numeric NOT NULL,
  economia_25_anos numeric NOT NULL,
  payback_meses numeric NOT NULL,
  co2_evitado_ton numeric NOT NULL DEFAULT 0,
  arvores_equivalentes integer NOT NULL DEFAULT 0,
  -- Preço
  preco_total numeric NOT NULL,
  preco_por_wp numeric NOT NULL,
  -- Condições / extras
  observacoes text,
  condicoes_pagamento text,
  validade_dias integer NOT NULL DEFAULT 15,
  -- Edição admin
  editada_pelo_admin boolean NOT NULL DEFAULT false,
  -- Tracking
  enviada_em timestamptz,
  visualizada_em timestamptz,
  aceita_em timestamptz,
  recusada_em timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.propostas TO authenticated;
GRANT SELECT ON public.propostas TO anon; -- página pública via codigo_publico
GRANT ALL ON public.propostas TO service_role;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
-- Parceiro: própria; admin: todas
CREATE POLICY "propostas parceiro select" ON public.propostas FOR SELECT TO authenticated
  USING (parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "propostas parceiro insert" ON public.propostas FOR INSERT TO authenticated
  WITH CHECK (parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "propostas parceiro update" ON public.propostas FOR UPDATE TO authenticated
  USING (parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "propostas admin delete" ON public.propostas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
-- Público anônimo: SELECT apenas se válida (não expirada) — filtrar por codigo_publico no app
CREATE POLICY "propostas anon select por codigo" ON public.propostas FOR SELECT TO anon
  USING (expires_at > now() AND status <> 'rascunho');
-- Anon pode UPDATE somente status/aceita_em/recusada_em/visualizada_em via RPC (criamos RPC abaixo)
CREATE TRIGGER trg_propostas_updated BEFORE UPDATE ON public.propostas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_propostas_parceiro ON public.propostas(parceiro_id);
CREATE INDEX idx_propostas_codigo ON public.propostas(codigo_publico);
CREATE INDEX idx_propostas_status ON public.propostas(status);

-- PROPOSTA <-> CLIENTES
CREATE TABLE public.proposta_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id uuid NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  enviado_whatsapp boolean NOT NULL DEFAULT false,
  enviado_email boolean NOT NULL DEFAULT false,
  enviado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposta_id, cliente_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposta_clientes TO authenticated;
GRANT SELECT ON public.proposta_clientes TO anon;
GRANT ALL ON public.proposta_clientes TO service_role;
ALTER TABLE public.proposta_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc parceiro all" ON public.proposta_clientes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND (p.parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND (p.parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "pc anon read" ON public.proposta_clientes FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND p.expires_at > now()));

-- EVENTOS
CREATE TABLE public.proposta_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id uuid NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'visualizada' | 'aceita' | 'recusada' | 'enviada'
  ip text,
  user_agent text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.proposta_eventos TO authenticated;
GRANT INSERT ON public.proposta_eventos TO anon;
GRANT ALL ON public.proposta_eventos TO service_role;
ALTER TABLE public.proposta_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eventos parceiro select" ON public.proposta_eventos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND (p.parceiro_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "eventos auth insert" ON public.proposta_eventos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id));
CREATE POLICY "eventos anon insert" ON public.proposta_eventos FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND p.expires_at > now()));

-- RPCs públicas para aceite/recusa (segurança definer)
CREATE OR REPLACE FUNCTION public.proposta_registrar_evento(_codigo uuid, _tipo text, _ip text DEFAULT NULL, _ua text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _p public.propostas%ROWTYPE;
BEGIN
  SELECT * INTO _p FROM public.propostas WHERE codigo_publico = _codigo;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposta não encontrada'; END IF;
  IF _p.expires_at < now() THEN RAISE EXCEPTION 'Proposta expirada'; END IF;
  INSERT INTO public.proposta_eventos (proposta_id, tipo, ip, user_agent) VALUES (_p.id, _tipo, _ip, _ua);
  IF _tipo = 'visualizada' AND _p.visualizada_em IS NULL THEN
    UPDATE public.propostas SET visualizada_em = now(),
      status = CASE WHEN status = 'enviada' THEN 'visualizada'::proposta_status ELSE status END
      WHERE id = _p.id;
  ELSIF _tipo = 'aceita' THEN
    UPDATE public.propostas SET aceita_em = now(), status = 'aceita' WHERE id = _p.id;
  ELSIF _tipo = 'recusada' THEN
    UPDATE public.propostas SET recusada_em = now(), status = 'recusada' WHERE id = _p.id;
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.proposta_registrar_evento(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.proposta_registrar_evento(uuid,text,text,text) TO anon, authenticated;
