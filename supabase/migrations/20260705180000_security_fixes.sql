-- MIGRATION: Correções de Segurança Críticas do Deep Security Scan

-- 1. CORREÇÃO: Restringir a política de RLS em financeiras_solar para admins reais
DROP POLICY IF EXISTS "Allow admin all access to financeiras_solar" ON public.financeiras_solar;
CREATE POLICY "Allow admin all access to financeiras_solar" ON public.financeiras_solar
    FOR ALL TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'::public.app_role)) 
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- 2. CORREÇÃO: Bloquear leitura pública/geral de tokens de convites (leak de tokens)
-- Remove políticas de SELECT anteriores para anon e authenticated comum
DROP POLICY IF EXISTS "anon validate by token on convites" ON public.convites;
DROP POLICY IF EXISTS "auth read convites" ON public.convites;

-- Apenas admins e usuários internos podem listar ou buscar registros diretamente
CREATE POLICY "Allow admin and internal users select convites" ON public.convites
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_internal_user(auth.uid()));


-- 3. CORREÇÃO: Atualizar a função RPC validate_invite para expor os dados seguros do convite de forma encapsulada
DROP FUNCTION IF EXISTS public.validate_invite(uuid);

CREATE OR REPLACE FUNCTION public.validate_invite(_token uuid)
RETURNS TABLE(
  valid boolean, 
  reason text, 
  expires_at timestamptz, 
  email text, 
  role_to_assign text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  _used_at timestamptz;
  _expires_at timestamptz;
  _note text;
  _email text;
  _role text;
  _found boolean := false;
BEGIN
  -- 1. Tenta buscar em partner_invites (tabela padrão)
  SELECT used_at, expires_at, note 
  INTO _used_at, _expires_at, _note
  FROM public.partner_invites 
  WHERE token = _token;
  
  IF FOUND THEN
    _found := true;
    -- Decodifica note format: "Equipe: email | Cargo: cargo" ou "Parceiro: email | Cargo: corretor"
    IF _note IS NOT NULL THEN
      IF _note LIKE '%| Cargo:%' THEN
        _role := trim(split_part(_note, '| Cargo:', 2));
        _email := trim(replace(replace(split_part(_note, '| Cargo:', 1), 'Equipe:', ''), 'Parceiro:', ''));
      ELSE
        _email := trim(replace(replace(_note, 'Equipe:', ''), 'Parceiro:', ''));
        IF _note LIKE 'Equipe:%' THEN
          _role := 'auxiliar';
        ELSE
          _role := 'corretor';
        END IF;
      END IF;
    END IF;
  END IF;

  -- 2. Tenta buscar na tabela convites (tabela alternativa do ERP)
  IF NOT _found THEN
    BEGIN
      EXECUTE 'SELECT used_at, expires_at, email, role_to_assign FROM public.convites WHERE token = $1'
      INTO _used_at, _expires_at, _email, _role
      USING _token;
      _found := true;
    EXCEPTION WHEN OTHERS THEN
      _found := false;
    END;
  END IF;

  IF NOT _found THEN
    RETURN QUERY SELECT false, 'Link de convite não encontrado.'::text, NULL::timestamptz, NULL::text, NULL::text; 
    RETURN;
  END IF;

  IF _used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Este convite já foi utilizado.'::text, _expires_at, _email, _role; 
    RETURN;
  END IF;

  IF _expires_at IS NOT NULL AND _expires_at < now() THEN
    RETURN QUERY SELECT false, 'Este convite expirou.'::text, _expires_at, _email, _role; 
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'Convite válido.'::text, _expires_at, _email, _role;
END $$;

REVOKE EXECUTE ON FUNCTION public.validate_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_invite(uuid) TO anon, authenticated;


-- 4. CORREÇÃO: Ocultar dados financeiros internos nas RPCs públicas de cotações e propostas
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
    'cotacao', to_jsonb(_c)
      - 'fornecedor'
      - 'custo_equipamentos'
      - 'custo_instalacao'
      - 'custo_frete'
      - 'custo_impostos_compra'
      - 'custo_comissao'
      - 'custo_tributacao_empresa'
      - 'custo_marketing'
      - 'custo_engenharia_fixo'
      - 'custo_overhead'
      - 'custo_garantia'
      - 'custos_operacionais_totais'
      - 'lucro_liquido_real'
      - 'lucro_liquido_pct'
      - 'margem_bruta',
    'kit', COALESCE(_kit, _c.kit_snapshot),
    'parceiro', _parceiro,
    'cliente', _cliente,
    'expirada', (_c.expires_at < now())
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_cotacao_publica(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cotacao_publica(uuid) TO anon, authenticated;


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
    'proposta', to_jsonb(_p)
      - 'fornecedor'
      - 'custo_equipamentos'
      - 'custo_instalacao'
      - 'custo_frete'
      - 'custo_impostos_compra'
      - 'custo_comissao'
      - 'custo_tributacao_empresa'
      - 'custo_marketing'
      - 'custo_engenharia_fixo'
      - 'custo_overhead'
      - 'custo_garantia'
      - 'custos_operacionais_totais'
      - 'lucro_liquido_real'
      - 'lucro_liquido_pct'
      - 'margem_bruta',
    'parceiro', _prof,
    'cliente', _cli,
    'expirada', (_p.expires_at < now())
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_proposta_publica(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposta_publica(uuid) TO anon, authenticated;


-- 5. CORREÇÃO: Remover campos de margem de lucro e comissões da view parametros_publicos
CREATE OR REPLACE VIEW public.parametros_publicos AS
SELECT
  id,
  hsp_norte, hsp_nordeste, hsp_centro_oeste, hsp_sudeste, hsp_sul,
  perdas_sistema, inflacao_energetica, vida_util_anos,
  potencia_modulo_w, area_por_modulo_m2, tarifa_kwh_default,
  percentual_fio_b, cosip_estimada_brl,
  custo_disponibilidade_mono_brl, custo_disponibilidade_tri_brl,
  validade_proposta_dias, capacidade_instaladores_kwp_mes
FROM public.parametros_comerciais
LIMIT 1;

GRANT SELECT ON public.parametros_publicos TO authenticated;
GRANT SELECT ON public.parametros_publicos TO anon;
