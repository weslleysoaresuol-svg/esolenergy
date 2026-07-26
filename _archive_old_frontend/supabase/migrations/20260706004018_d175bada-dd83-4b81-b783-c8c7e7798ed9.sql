
-- 1) financeiras_solar: fix fake admin policy
DROP POLICY IF EXISTS "Allow admin all access to financeiras_solar" ON public.financeiras_solar;
CREATE POLICY "Admins manage financeiras_solar"
  ON public.financeiras_solar
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Drop leaky public view (also resolves SECURITY DEFINER view lint)
DROP VIEW IF EXISTS public.parametros_publicos;

-- 3) get_parametros_publicos: whitelist safe fields for non-admins
CREATE OR REPLACE FUNCTION public.get_parametros_publicos()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _row public.parametros_comerciais%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _row FROM public.parametros_comerciais LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;

  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN to_jsonb(_row);
  END IF;

  -- Non-admins: return only operational fields, never cost/margin/commission
  RETURN jsonb_build_object(
    'hsp_norte', _row.hsp_norte,
    'hsp_nordeste', _row.hsp_nordeste,
    'hsp_centro_oeste', _row.hsp_centro_oeste,
    'hsp_sudeste', _row.hsp_sudeste,
    'hsp_sul', _row.hsp_sul,
    'tarifa_kwh_default', _row.tarifa_kwh_default,
    'perdas_sistema', _row.perdas_sistema,
    'inflacao_energetica', _row.inflacao_energetica,
    'vida_util_anos', _row.vida_util_anos,
    'potencia_modulo_w', _row.potencia_modulo_w,
    'area_por_modulo_m2', _row.area_por_modulo_m2,
    'percentual_fio_b', _row.percentual_fio_b,
    'cosip_estimada_brl', _row.cosip_estimada_brl,
    'custo_disponibilidade_mono_brl', _row.custo_disponibilidade_mono_brl,
    'custo_disponibilidade_tri_brl', _row.custo_disponibilidade_tri_brl,
    'validade_proposta_dias', _row.validade_proposta_dias,
    'capacidade_instaladores_kwp_mes', _row.capacidade_instaladores_kwp_mes,
    'preco_wp_residencial_pequeno', _row.preco_wp_residencial_pequeno,
    'preco_wp_residencial_grande', _row.preco_wp_residencial_grande,
    'preco_wp_comercial_pequeno', _row.preco_wp_comercial_pequeno,
    'preco_wp_comercial_grande', _row.preco_wp_comercial_grande,
    'preco_wp_industrial', _row.preco_wp_industrial
  );
END $function$;

-- 4) get_cotacao_publica: return only customer-safe fields
CREATE OR REPLACE FUNCTION public.get_cotacao_publica(_codigo uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _c public.cotacoes%ROWTYPE;
  _kit jsonb;
  _parceiro jsonb;
  _cliente jsonb;
  _cotacao_safe jsonb;
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

  _cotacao_safe := jsonb_build_object(
    'id', _c.id,
    'codigo_publico', _c.codigo_publico,
    'kit_id', _c.kit_id,
    'quantidade', _c.quantidade,
    'preco_unit', _c.preco_unit,
    'preco_total', _c.preco_total,
    'observacoes', _c.observacoes,
    'status', _c.status,
    'expires_at', _c.expires_at,
    'created_at', _c.created_at,
    'economia_ajustada_mensal', _c.economia_ajustada_mensal,
    'economia_ajustada_anual', _c.economia_ajustada_anual,
    'economia_ajustada_25_anos', _c.economia_ajustada_25_anos,
    'payback_ajustado_meses', _c.payback_ajustado_meses,
    'tir_anual_pct', _c.tir_anual_pct,
    'vpl_brl', _c.vpl_brl,
    'custo_disponibilidade_mensal', _c.custo_disponibilidade_mensal,
    'ajuste_fio_b_mensal', _c.ajuste_fio_b_mensal
  );

  RETURN jsonb_build_object(
    'cotacao', _cotacao_safe,
    'kit', COALESCE(_kit, _c.kit_snapshot),
    'parceiro', _parceiro,
    'cliente', _cliente,
    'expirada', (_c.expires_at < now())
  );
END $function$;

-- 5) get_proposta_publica: return only customer-safe fields
CREATE OR REPLACE FUNCTION public.get_proposta_publica(_codigo uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _p public.propostas%ROWTYPE;
  _prof jsonb;
  _cli jsonb;
  _prop_safe jsonb;
BEGIN
  SELECT * INTO _p FROM public.propostas WHERE codigo_publico = _codigo;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF _p.status = 'rascunho' THEN RETURN NULL; END IF;

  SELECT to_jsonb(pr) INTO _prof FROM (
    SELECT nome, email, telefone, avatar_url
    FROM public.profiles WHERE id = _p.parceiro_id
  ) pr;

  SELECT to_jsonb(cl) INTO _cli FROM (
    SELECT c.nome, c.cidade, c.estado
    FROM public.proposta_clientes pc
    JOIN public.clientes c ON c.id = pc.cliente_id
    WHERE pc.proposta_id = _p.id
    LIMIT 1
  ) cl;

  _prop_safe := jsonb_build_object(
    'id', _p.id,
    'codigo_publico', _p.codigo_publico,
    'titulo', _p.titulo,
    'status', _p.status,
    'tipo_instalacao', _p.tipo_instalacao,
    'tipo_telhado', _p.tipo_telhado,
    'consumo_kwh', _p.consumo_kwh,
    'tarifa_kwh', _p.tarifa_kwh,
    'estado', _p.estado,
    'cidade', _p.cidade,
    'regiao', _p.regiao,
    'hsp', _p.hsp,
    'kwp_sistema', _p.kwp_sistema,
    'qtd_modulos', _p.qtd_modulos,
    'potencia_modulo_w', _p.potencia_modulo_w,
    'qtd_inversores', _p.qtd_inversores,
    'potencia_inversor_kw', _p.potencia_inversor_kw,
    'area_necessaria_m2', _p.area_necessaria_m2,
    'geracao_mensal_kwh', _p.geracao_mensal_kwh,
    'economia_mensal', _p.economia_mensal,
    'economia_anual', _p.economia_anual,
    'economia_25_anos', _p.economia_25_anos,
    'payback_meses', _p.payback_meses,
    'co2_evitado_ton', _p.co2_evitado_ton,
    'arvores_equivalentes', _p.arvores_equivalentes,
    'preco_total', _p.preco_total,
    'preco_por_wp', _p.preco_por_wp,
    'observacoes', _p.observacoes,
    'condicoes_pagamento', _p.condicoes_pagamento,
    'validade_dias', _p.validade_dias,
    'enviada_em', _p.enviada_em,
    'visualizada_em', _p.visualizada_em,
    'aceita_em', _p.aceita_em,
    'recusada_em', _p.recusada_em,
    'expires_at', _p.expires_at,
    'created_at', _p.created_at,
    'economia_ajustada_mensal', _p.economia_ajustada_mensal,
    'economia_ajustada_anual', _p.economia_ajustada_anual,
    'economia_ajustada_25_anos', _p.economia_ajustada_25_anos,
    'payback_ajustado_meses', _p.payback_ajustado_meses,
    'tir_anual_pct', _p.tir_anual_pct,
    'vpl_brl', _p.vpl_brl,
    'custo_disponibilidade_mensal', _p.custo_disponibilidade_mensal,
    'ajuste_fio_b_mensal', _p.ajuste_fio_b_mensal
  );

  RETURN jsonb_build_object(
    'proposta', _prop_safe,
    'parceiro', _prof,
    'cliente', _cli,
    'expirada', (_p.expires_at < now())
  );
END $function$;
