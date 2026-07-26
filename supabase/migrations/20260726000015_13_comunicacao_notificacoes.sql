-- ==============================================================================
-- 📬 MÓDULO 13: COMUNICAÇÃO & NOTIFICAÇÕES
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: templates_comunicacao, fila_notificacoes
-- Enums: canal_comunicacao, status_notificacao, gatilho_notificacao
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.canal_comunicacao AS ENUM (
    'whatsapp',               -- Link parametrizado wa.me (redirect)
    'email',                  -- Resend / Brevo API
    'push_web',               -- Web Push Notification (PWA)
    'sms',                    -- SMS transacional (futuro)
    'app_interno'             -- Notificação dentro do painel (sino)
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_notificacao AS ENUM (
    'pendente',               -- Na fila, aguardando envio
    'enviada',                -- Enviada com sucesso
    'entregue',               -- Confirmação de entrega (webhook)
    'lida',                   -- Aberta/visualizada pelo destinatário
    'falha',                  -- Erro no envio (retry automático)
    'cancelada'               -- Cancelada antes do envio
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.gatilho_notificacao AS ENUM (
    -- CRM & Vendas
    'novo_lead',                      -- Lead cadastrado pelo site ou consultor
    'lead_frio_3_dias',               -- SLA: lead sem contato há 3+ dias
    'proposta_enviada',               -- Consultor enviou proposta ao cliente
    'proposta_visualizada',           -- Cliente abriu o PDF da proposta
    'proposta_aceita',                -- Cliente aceitou a proposta
    'proposta_expirando',             -- Proposta vencendo em 48h

    -- EPC & Projetos
    'projeto_fase_avancou',           -- Projeto mudou de fase no EPC
    'checklist_instalacao_pendente',  -- Instalador precisa enviar fotos
    'homologacao_aprovada',           -- Concessionária aprovou o projeto
    'selo_verde_emitido',             -- Sistema ativou o Selo Verde

    -- Financeiro
    'comissao_liberada',              -- Comissão disponível para saque
    'saque_aprovado',                 -- Saque PIX processado
    'pagamento_recebido',             -- Pagamento do cliente confirmado

    -- Pós-Venda
    'os_aberta',                      -- Nova ordem de serviço criada
    'agendamento_confirmado',         -- Técnico confirmou visita
    'servico_concluido',              -- Ordem de serviço finalizada
    'avaliacao_pendente',             -- Pedir avaliação ao cliente

    -- MMN & Rede
    'novo_consultor_na_rede',         -- Novo downline cadastrado
    'selo_carreira_desbloqueado',     -- Consultor atingiu novo selo de carreira
    'meta_mensal_atingida',           -- Meta de vendas do mês batida

    -- Legal & Compliance
    'contrato_assinado',              -- Contrato assinado via Esol Sign
    'prova_vida_pendente',            -- Re-Sign de renovação de contrato
    'distrato_solicitado',            -- Cliente solicitou cancelamento

    -- Esol Club
    'ecopontos_creditados',           -- Pontos creditados ao cliente
    'resgate_aprovado'                -- Resgate de benefício aprovado
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: TEMPLATES DE COMUNICAÇÃO
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.templates_comunicacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  nome text NOT NULL,
  gatilho public.gatilho_notificacao NOT NULL,
  canal public.canal_comunicacao NOT NULL,

  assunto text,
  corpo_template text NOT NULL,

  ativo boolean DEFAULT true,
  prioridade smallint DEFAULT 2 CHECK (prioridade BETWEEN 1 AND 3),
  delay_minutos integer DEFAULT 0,
  max_retentativas integer DEFAULT 3,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_gatilho_canal ON public.templates_comunicacao(tenant_id, gatilho, canal);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: FILA DE NOTIFICAÇÕES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.fila_notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.templates_comunicacao(id),

  destinatario_id uuid REFERENCES public.profiles(id),
  destinatario_nome text,
  destinatario_telefone text,
  destinatario_email text,

  canal public.canal_comunicacao NOT NULL,
  gatilho public.gatilho_notificacao NOT NULL,
  assunto_renderizado text,
  corpo_renderizado text NOT NULL,

  status public.status_notificacao DEFAULT 'pendente' NOT NULL,
  tentativas integer DEFAULT 0,
  erro_mensagem text,

  referencia_tipo text,
  referencia_id uuid,

  agendado_para timestamptz DEFAULT now(),
  enviado_em timestamptz,
  entregue_em timestamptz,
  lido_em timestamptz,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fila_status ON public.fila_notificacoes(status) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_fila_destinatario ON public.fila_notificacoes(destinatario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fila_gatilho ON public.fila_notificacoes(gatilho);
