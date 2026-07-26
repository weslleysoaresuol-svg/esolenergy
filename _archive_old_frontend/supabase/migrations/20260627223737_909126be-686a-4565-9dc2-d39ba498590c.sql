
-- 1) propostas: remove anon SELECT; expose public via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "propostas anon select por codigo" ON public.propostas;
DROP POLICY IF EXISTS "pc anon read" ON public.proposta_clientes;
REVOKE SELECT ON public.propostas FROM anon;
REVOKE SELECT ON public.proposta_clientes FROM anon;

CREATE OR REPLACE FUNCTION public.get_proposta_publica(_codigo uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _p public.propostas%ROWTYPE;
  _prof jsonb;
  _cli jsonb;
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

  RETURN jsonb_build_object(
    'proposta', to_jsonb(_p),
    'parceiro', _prof,
    'cliente', _cli,
    'expirada', (_p.expires_at < now())
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_proposta_publica(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposta_publica(uuid) TO anon, authenticated;

-- 2) parametros_comerciais: restrict full read to admin only; expose safe fields via RPC
DROP POLICY IF EXISTS "params read auth" ON public.parametros_comerciais;
DROP POLICY IF EXISTS "params read admin" ON public.parametros_comerciais;
CREATE POLICY "params read admin"
  ON public.parametros_comerciais FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_parametros_publicos()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.parametros_comerciais%ROWTYPE;
  _is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO _row FROM public.parametros_comerciais LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;

  _is_admin := public.has_role(auth.uid(), 'admin');

  IF _is_admin THEN
    RETURN to_jsonb(_row);
  END IF;

  -- Non-admins: hide commission, margin and cost-breakdown percentages
  RETURN to_jsonb(_row)
    - 'custo_comissao_pct'
    - 'margem_alvo_pct'
    - 'custo_equipamentos_pct'
    - 'custo_instalacao_pct'
    - 'custo_frete_pct'
    - 'custo_impostos_pct';
END $$;

REVOKE EXECUTE ON FUNCTION public.get_parametros_publicos() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_parametros_publicos() TO authenticated;
