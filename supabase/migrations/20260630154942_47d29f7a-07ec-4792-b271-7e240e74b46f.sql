CREATE OR REPLACE FUNCTION public.get_parametros_landing()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.parametros_comerciais%ROWTYPE;
BEGIN
  SELECT * INTO _row FROM public.parametros_comerciais LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'hsp_norte', _row.hsp_norte,
    'hsp_nordeste', _row.hsp_nordeste,
    'hsp_centro_oeste', _row.hsp_centro_oeste,
    'hsp_sudeste', _row.hsp_sudeste,
    'hsp_sul', _row.hsp_sul,
    'preco_wp_residencial_pequeno', _row.preco_wp_residencial_pequeno,
    'preco_wp_residencial_grande', _row.preco_wp_residencial_grande,
    'preco_wp_comercial_pequeno', _row.preco_wp_comercial_pequeno,
    'preco_wp_comercial_grande', _row.preco_wp_comercial_grande,
    'preco_wp_industrial', _row.preco_wp_industrial,
    'tarifa_kwh_default', _row.tarifa_kwh_default,
    'perdas_sistema', _row.perdas_sistema,
    'inflacao_energetica', _row.inflacao_energetica,
    'vida_util_anos', _row.vida_util_anos,
    'potencia_modulo_w', _row.potencia_modulo_w
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_parametros_landing() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_parametros_landing() TO anon, authenticated;