-- ============================================================
-- SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL
-- Usando Supabase Realtime (WebSocket) + Browser Push API
-- Zero dependências externas
-- ============================================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo        text        NOT NULL,
  -- tipos: 'novo_lead' | 'proposta_aceita' | 'proposta_visualizada' | 'lead_frio' | 'proposta_expirando'
  titulo      text        NOT NULL,
  mensagem    text        NOT NULL,
  dados       jsonb       NOT NULL DEFAULT '{}',
  lida        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: cada usuário vê apenas as próprias notificações
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON public.notificacoes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notif_insert_system" ON public.notificacoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notif_update_own" ON public.notificacoes
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notif_delete_own" ON public.notificacoes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Permissões para service_role (triggers SECURITY DEFINER)
GRANT ALL ON public.notificacoes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacoes TO authenticated;

-- Habilita Realtime na tabela (WebSocket push automático)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

-- ============================================================
-- TRIGGER 1: Notifica parceiro quando recebe um novo lead
-- Dispara quando corretor_id é atribuído ou alterado em clientes
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_notify_novo_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só dispara quando corretor_id é definido ou muda
  IF NEW.corretor_id IS NOT NULL
     AND (OLD.corretor_id IS DISTINCT FROM NEW.corretor_id)
  THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, dados)
    VALUES (
      NEW.corretor_id,
      'novo_lead',
      '🎯 Novo lead atribuído!',
      'Você recebeu um novo lead: ' || COALESCE(NEW.nome, 'sem nome')
        || CASE WHEN NEW.cidade IS NOT NULL THEN ' (' || NEW.cidade || ')' ELSE '' END,
      jsonb_build_object(
        'cliente_id',   NEW.id,
        'cliente_nome', NEW.nome,
        'telefone',     NEW.telefone,
        'cidade',       NEW.cidade,
        'consumo_kwh',  NEW.consumo_kwh
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_novo_lead ON public.clientes;
CREATE TRIGGER trg_notify_novo_lead
  AFTER INSERT OR UPDATE OF corretor_id ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_novo_lead();

-- ============================================================
-- TRIGGER 2: Notifica parceiro e admin quando proposta é aceita
-- Dispara quando status da proposta muda para 'aceita'
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_notify_proposta_aceita()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  IF NEW.status = 'aceita' AND OLD.status IS DISTINCT FROM 'aceita' THEN
    -- Notifica parceiro
    IF NEW.parceiro_id IS NOT NULL THEN
      INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, dados)
      VALUES (
        NEW.parceiro_id,
        'proposta_aceita',
        '🎉 Proposta aceita!',
        'A proposta "' || COALESCE(NEW.titulo, 'sem título')
          || '" foi ACEITA pelo cliente! Valor: R$ '
          || TO_CHAR(NEW.preco_total, 'FM999G999G990D00'),
        jsonb_build_object(
          'proposta_id', NEW.id,
          'titulo',      NEW.titulo,
          'valor',       NEW.preco_total,
          'codigo',      NEW.codigo_publico
        )
      );
    END IF;

    -- Notifica todos os admins
    FOR v_admin_id IN
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, dados)
      VALUES (
        v_admin_id,
        'proposta_aceita',
        '✅ Proposta fechada!',
        'Proposta "' || COALESCE(NEW.titulo, 'sem título')
          || '" aceita. Valor: R$ '
          || TO_CHAR(NEW.preco_total, 'FM999G999G990D00'),
        jsonb_build_object(
          'proposta_id',  NEW.id,
          'titulo',       NEW.titulo,
          'valor',        NEW.preco_total,
          'parceiro_id',  NEW.parceiro_id
        )
      );
    END LOOP;

    -- Atualiza automaticamente o status dos clientes vinculados
    UPDATE public.clientes
    SET status = 'contrato_assinado',
        fechado_em = now()
    WHERE id IN (
      SELECT cliente_id FROM public.proposta_clientes WHERE proposta_id = NEW.id
    )
    AND status NOT IN ('contrato_assinado', 'instalacao', 'concluido');

  END IF;

  -- Notifica parceiro quando cliente visualiza proposta
  IF NEW.status = 'visualizada' AND OLD.status IS DISTINCT FROM 'visualizada' THEN
    IF NEW.parceiro_id IS NOT NULL THEN
      INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, dados)
      VALUES (
        NEW.parceiro_id,
        'proposta_visualizada',
        '👀 Proposta visualizada!',
        'O cliente abriu e visualizou a proposta "' || COALESCE(NEW.titulo, 'sem título') || '". Ótima hora para ligar!',
        jsonb_build_object(
          'proposta_id', NEW.id,
          'titulo',      NEW.titulo
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_proposta_status ON public.propostas;
CREATE TRIGGER trg_notify_proposta_status
  AFTER UPDATE OF status ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_proposta_aceita();

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida
  ON public.notificacoes(user_id, lida, created_at DESC);
