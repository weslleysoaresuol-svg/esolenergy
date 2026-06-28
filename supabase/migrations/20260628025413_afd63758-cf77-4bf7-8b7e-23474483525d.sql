
-- Revoga EXECUTE padrão de PUBLIC/anon/authenticated em todas as funções SECURITY DEFINER do schema public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.consume_invite(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_invite(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_parametros_publicos() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_parametros_publicos() TO authenticated;

-- Funções públicas (precisam ser chamáveis sem login)
REVOKE EXECUTE ON FUNCTION public.validate_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_invite(uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_proposta_publica(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposta_publica(uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.proposta_registrar_evento(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.proposta_registrar_evento(uuid, text, text, text) TO anon, authenticated;
