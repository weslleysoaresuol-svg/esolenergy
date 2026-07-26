-- ==============================================================================
-- 💬 MÓDULO 18: COMUNICAÇÃO, HELPDESK & LIVE CHAT (ESCALATION ROUTING)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- ENUMS DE COMUNICAÇÃO E ROTEAMENTO
-- ══════════════════════════════════════════════════════════════

CREATE TYPE public.categoria_ticket AS ENUM (
  'orcamento', 'duvida_tecnica', 'financeiro', 'contrato', 
  'reclamacao', 'ouvidoria', 'sugestao'
);

CREATE TYPE public.prioridade_ticket AS ENUM (
  'alta',               -- SLA 15min atribuição / 4h resolução
  'media',              -- SLA 1h atribuição / 24h resolução
  'baixa'               -- SLA 4h atribuição / 48h resolução
);

CREATE TYPE public.status_ticket AS ENUM (
  'aberto', 'em_atendimento', 'aguardando_cliente', 
  'aguardando_interno', 'resolvido', 'fechado', 'reaberto'
);

-- Estado do Motor de Roteamento Híbrido (Helpdesk)
CREATE TYPE public.ticket_distribuicao_tipo AS ENUM (
  'capturado',                -- Acabou de entrar
  'plantao_noturno',          -- Fila retida da madrugada (Chatbot/ADM Night)
  'aguardando_gotejamento',   -- Fila das 08:00 (Throttling)
  'na_fila_roteamento',       -- Sistema procurando atendente livre
  'oferecido_atendente',      -- SLA de atribuição correndo (15min, 1h ou 4h)
  'assumido',                 -- Atendente começou a resolver
  'escalado_nivel_2',         -- Atendente falhou no SLA, subiu de nível
  'escalado_gerencia'         -- Nível 2 falhou, subiu pro chefe
);

CREATE TYPE public.tipo_ouvidoria AS ENUM (
  'reclamacao', 'denuncia', 'elogio', 'sugestao', 'solicitacao_informacao'
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: CENTRAL DE CHAMADOS / TICKETS (Helpdesk com SLA)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.tickets_atendimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  protocolo text NOT NULL UNIQUE,
  ano_referencia integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  sequencial integer NOT NULL,
  
  -- Identificação
  solicitante_id uuid REFERENCES public.profiles(id),
  cliente_id uuid REFERENCES public.clientes(id),
  
  -- Classificação
  categoria public.categoria_ticket NOT NULL,
  prioridade public.prioridade_ticket NOT NULL DEFAULT 'media',
  status public.status_ticket NOT NULL DEFAULT 'aberto',
  
  assunto text NOT NULL,
  descricao text NOT NULL,
  
  -- Motor de Roteamento Híbrido
  status_distribuicao public.ticket_distribuicao_tipo DEFAULT 'capturado',
  nivel_escalacao integer DEFAULT 1, -- N1 (Junior), N2 (Pleno/Engenharia), N3 (Gerência)
  hora_abertura timestamptz DEFAULT now(),
  hora_fim_sla_atribuicao timestamptz, -- Tempo limite para alguém ASSUMIR
  hora_fim_sla_resolucao timestamptz,  -- Tempo limite para RESOLVER
  
  -- Atribuição
  departamento_destino text,
  atendente_id uuid REFERENCES public.profiles(id),
  tempo_primeira_resposta interval, -- Métrica de Gamificação do Suporte
  sla_estourado boolean DEFAULT false,
  
  -- Referências e Qualidade
  contrato_id uuid,
  nota_satisfacao integer CHECK (nota_satisfacao BETWEEN 1 AND 5),
  comentario_avaliacao text,
  
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  fechado_em timestamptz
);

-- Índices de Alta Performance para o Motor de Escalação
CREATE INDEX idx_tickets_distribuicao ON public.tickets_atendimento(status_distribuicao, hora_fim_sla_atribuicao);
CREATE INDEX idx_tickets_status ON public.tickets_atendimento(status, prioridade);

-- ══════════════════════════════════════════════════════════════
-- TABELA 1.B: LOGS DE ESCALAÇÃO (Punição por Lentidão)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.ticket_routing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets_atendimento(id) ON DELETE CASCADE,
  atendente_rejeitado_id uuid REFERENCES public.profiles(id),
  nivel_escalado integer NOT NULL,
  motivo text DEFAULT 'sla_atribuicao_estourado',
  data_escala timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: LIVE CHAT (SLA ULTRA-RÁPIDO DE 30 SEGUNDOS)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.live_chat_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id),
  
  -- SLA de 30 Segundos
  status text DEFAULT 'na_fila', -- na_fila, conectado, encerrado, bot_noturno
  hora_fim_sla_30s timestamptz,
  atendente_id uuid REFERENCES public.profiles(id),
  
  created_at timestamptz DEFAULT now(),
  encerrado_em timestamptz
);

-- Demais tabelas mantidas (chat_canais, chat_mensagens, comunicados, ouvidoria)
-- ... [Conteúdo Omitido para Foco na Arquitetura de Roteamento] ...

-- ==============================================================================
-- ⚙️ PROCEDURES: MOTOR HÍBRIDO (WATERFALL, ESCALATION & THROTTLING)
-- ==============================================================================

-- 1. Captura de Tickets e Live Chat: Horário Comercial vs Plantão
CREATE OR REPLACE FUNCTION trg_atendimento_capturado() RETURNS trigger AS $$
BEGIN
  IF EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 8 AND 17 THEN
    NEW.status_distribuicao = 'capturado';
    -- Definir SLA de Atribuição baseado na Prioridade
    IF NEW.prioridade = 'alta' THEN NEW.hora_fim_sla_atribuicao = now() + interval '15 minutes';
    ELSIF NEW.prioridade = 'media' THEN NEW.hora_fim_sla_atribuicao = now() + interval '1 hour';
    ELSE NEW.hora_fim_sla_atribuicao = now() + interval '4 hours';
    END IF;
  ELSE
    NEW.status_distribuicao = 'plantao_noturno';
    -- Fica congelado até as 08:00
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_capturado
BEFORE INSERT ON public.tickets_atendimento
FOR EACH ROW EXECUTE FUNCTION trg_atendimento_capturado();


-- ==============================================================================
-- 📅 PG_CRON: ARQUITETURA DE THROTTLING E ESCALATION (SUPORTE)
-- ==============================================================================
/*
  O Throttling Matinal (Gotejamento de Tickets Acumulados):
  SELECT cron.schedule('morning_drip_tickets', '* 8 * * *', $$
    -- Roteamento por Workload (Entrega pro atendente com menos tickets)
    UPDATE public.tickets_atendimento 
    SET status_distribuicao = 'na_fila_roteamento'
    WHERE id IN (
      SELECT id FROM public.tickets_atendimento 
      WHERE status_distribuicao = 'plantao_noturno' 
      ORDER BY prioridade ASC, hora_abertura ASC 
      LIMIT 5 -- Solta de 5 em 5 minutos para não matar o suporte
    );
  $$);

  O Policial de Escalação (Roda a cada 5 Minutos):
  SELECT cron.schedule('sla_escalation_police', '*/5 * * * *', $$
    -- Arranca o ticket do Atendente que demorou e Escala o Nível
    UPDATE public.tickets_atendimento 
    SET status_distribuicao = 'escalado_nivel_2',
        nivel_escalacao = nivel_escalacao + 1,
        atendente_id = NULL,
        sla_estourado = true
    WHERE status_distribuicao = 'oferecido_atendente' 
      AND hora_fim_sla_atribuicao < now();
  $$);

  Live Chat Policial (Roda a cada 10 SEGUNDOS em worker Node.js/Edge):
  -- Arranca o chat do atendente se bater 30s.
*/
