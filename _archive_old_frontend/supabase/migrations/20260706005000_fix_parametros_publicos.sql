-- Recreate get_parametros_publicos to whitelist installation and freight columns for partners (non-admins)
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

  -- Non-admins: return only operational fields, whitelisting safe installation and freight costs (not sensitive margins)
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
    'preco_wp_industrial', _row.preco_wp_industrial,
    -- Whitelisted for operational calculations (prevents NaN/0.00 investment)
    'inst_ceramico_kwp', _row.inst_ceramico_kwp,
    'inst_metalico_kwp', _row.inst_metalico_kwp,
    'inst_laje_kwp', _row.inst_laje_kwp,
    'inst_solo_kwp', _row.inst_solo_kwp,
    'inst_especial_kwp', _row.inst_especial_kwp,
    'inst_adicional_grande_kwp', _row.inst_adicional_grande_kwp,
    'custo_frete_por_100km_kwp', _row.custo_frete_por_100km_kwp,
    'custo_frete_minimo_brl', _row.custo_frete_minimo_brl
  );
END $function$;
