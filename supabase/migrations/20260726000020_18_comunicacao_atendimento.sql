-- ==============================================================================
-- 💬 MÓDULO 18: COMUNICAÇÃO, HELPDESK & LIVE CHAT (ESCALATION ROUTING)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- ENUMS DE COMUNICAÇÃO E ROTEAMENTO
-- ══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE public.categoria_ticket AS ENUM (
    'orcamento', 'duvida_tecnica', 'financeiro', 'contrato', 
    'reclamacao', 'ouvidoria', 'sugestao'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.prioridade_ticket AS ENUM (
    'alta',               -- SLA 15min atribuição / 4h resolução
    'media',              -- SLA 1h atribuição / 24h resolução
    'baixa'               -- SLA 4h atribuição / 48h resolução
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_ticket AS ENUM (
    'aberto', 'em_atendimento', 'aguardando_cliente', 
    'aguardando_interno', 'resolvido', 'fechado', 'reaberto'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tipo_ouvidoria AS ENUM (
    'reclamacao', 'denuncia', 'elogio', 'sugestao', 'solicitacao_informacao'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: CENTRAL DE CHAMADOS / TICKETS (Helpdesk com SLA)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tickets_atendimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  protocolo text NOT NULL UNIQUE,
  ano_referencia integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  sequencial integer NOT NULL,
  
  solicitante_id uuid REFERENCES public.profiles(id),
  cliente_id uuid REFERENCES public.clientes(id),
  
  categoria public.categoria_ticket NOT NULL,
  prioridade public.prioridade_ticket NOT NULL DEFAULT 'media',
  status public.status_ticket NOT NULL DEFAULT 'aberto',
  
  assunto text NOT NULL,
  descricao text NOT NULL,
  
  status_distribuicao public.ticket_distribuicao_tipo DEFAULT 'capturado',
  nivel_escalacao integer DEFAULT 1,
  hora_abertura timestamptz DEFAULT now(),
  hora_fim_sla_atribuicao timestamptz,
  hora_fim_sla_resolucao timestamptz,
  
  departamento_destino text,
  atendente_id uuid REFERENCES public.profiles(id),
  tempo_primeira_resposta interval,
  sla_estourado boolean DEFAULT false,
  
  contrato_id uuid,
  nota_satisfacao integer CHECK (nota_satisfacao BETWEEN 1 AND 5),
  comentario_avaliacao text,
  
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  fechado_em timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tickets_distribuicao ON public.tickets_atendimento(status_distribuicao, hora_fim_sla_atribuicao);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets_atendimento(status, prioridade);

-- ══════════════════════════════════════════════════════════════
-- TABELA 1.B: LOGS DE ESCALAÇÃO (Punição por Lentidão)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ticket_routing_logs (
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
CREATE TABLE IF NOT EXISTS public.live_chat_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id),
  
  status text DEFAULT 'na_fila',
  hora_fim_sla_30s timestamptz,
  atendente_id uuid REFERENCES public.profiles(id),
  
  created_at timestamptz DEFAULT now(),
  encerrado_em timestamptz
);

-- ==============================================================================
-- ⚙️ PROCEDURES: MOTOR HÍBRIDO (WATERFALL, ESCALATION & THROTTLING)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.trg_atendimento_capturado() RETURNS trigger AS $$
BEGIN
  IF EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 8 AND 17 THEN
    NEW.status_distribuicao = 'capturado';
    IF NEW.prioridade = 'alta' THEN NEW.hora_fim_sla_atribuicao = now() + interval '15 minutes';
    ELSIF NEW.prioridade = 'media' THEN NEW.hora_fim_sla_atribuicao = now() + interval '1 hour';
    ELSE NEW.hora_fim_sla_atribuicao = now() + interval '4 hours';
    END IF;
  ELSE
    NEW.status_distribuicao = 'plantao_noturno';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ticket_capturado ON public.tickets_atendimento;
CREATE TRIGGER trg_ticket_capturado
BEFORE INSERT ON public.tickets_atendimento
FOR EACH ROW EXECUTE FUNCTION public.trg_atendimento_capturado();
