
-- 1) Limpa papéis duplicados (admin tem precedência)
DELETE FROM public.user_roles ur
WHERE ur.role = 'corretor'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = ur.user_id AND ur2.role = 'admin'
  );

-- 2) Atualiza consume_invite para impedir que admins virem corretores
CREATE OR REPLACE FUNCTION public.consume_invite(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invite public.partner_invites%ROWTYPE;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  -- Admins não devem virar parceiros através de convites
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'admin') THEN
    RAISE EXCEPTION 'Administradores não podem aceitar convites de parceiro';
  END IF;

  SELECT * INTO _invite FROM public.partner_invites WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  IF _invite.used_at IS NOT NULL THEN RAISE EXCEPTION 'Convite já utilizado'; END IF;
  IF _invite.expires_at < now() THEN RAISE EXCEPTION 'Convite expirado'; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'corretor')
    ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE public.partner_invites SET used_at = now(), used_by = _uid WHERE id = _invite.id;
  RETURN true;
END $function$;

-- 3) Seed default parametros_comerciais
INSERT INTO public.parametros_comerciais (
  hsp_norte, hsp_nordeste, hsp_centro_oeste, hsp_sudeste, hsp_sul,
  preco_wp_residencial_pequeno, preco_wp_residencial_grande,
  preco_wp_comercial_pequeno, preco_wp_comercial_grande, preco_wp_industrial,
  tarifa_kwh_default, perdas_sistema, inflacao_energetica, vida_util_anos,
  potencia_modulo_w, area_por_modulo_m2,
  custo_equipamentos_pct, custo_instalacao_pct, custo_frete_pct, custo_impostos_pct, custo_comissao_pct, margem_alvo_pct,
  capacidade_instaladores_kwp_mes, validade_proposta_dias
)
SELECT 5.2, 5.5, 5.6, 4.9, 4.5,
       4.80, 4.20,
       4.00, 3.60, 3.30,
       0.95, 0.18, 0.08, 25,
       550, 2.60,
       0.55, 0.12, 0.04, 0.08, 0.07, 0.18,
       400, 15
WHERE NOT EXISTS (SELECT 1 FROM public.parametros_comerciais);
