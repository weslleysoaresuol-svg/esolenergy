-- ==============================================================================
-- 📋 MÓDULO 04: CRM, GESTÃO DE LEADS & ESOL SCHEDULER (WATERFALL ROUTING)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql (profiles)
-- Tabelas: clientes, crm_agendamentos, lead_routing_logs
-- Enums: cliente_status_tipo, persona_tipo, status_distribuicao_tipo
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.cliente_status_tipo AS ENUM (
    'novo',
    'contato',
    'visita_agendada',
    'proposta_enviada',
    'negociacao',
    'contrato_assinado',
    'instalacao',
    'concluido',
    'perdido'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Estado do Motor de Roteamento de Leads
DO $$ BEGIN
  CREATE TYPE public.status_distribuicao_tipo AS ENUM (
    'capturado_site',           -- Lead acabou de entrar no funil
    'plantao_adm',              -- Caiu na madrugada, equipe interna segura
    'aguardando_gotejamento',   -- Na fila das 08:00 para Throttling
    'oferecido_consultor',      -- SLA de 30m está correndo
    'assumido_consultor',       -- Consultor clicou em 'Atender' no App
    'perdido_sla',              -- Consultor não atendeu em 30m
    'assumido_adm'              -- Ninguém atendeu, Administração assumiu a venda
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Persona do Cockpit de Vendas (Seção 5.6 do Mapa)
DO $$ BEGIN
  CREATE TYPE public.persona_tipo AS ENUM (
    'A',  -- Residencial Próprio (quer zerar a luz)
    'B',  -- Inquilino / Alugado (sem obra → GD Assinatura)
    'C',  -- PME & Indústria Grupo A (OPEX → MLE)
    'D',  -- Investidor Solar B2B (rentabilidade → Usina)
    'E',  -- Dono de Usina Existente (manutenção → O&M + Limpeza)
    'F',  -- Dono de Lote/Terreno (m² → Simulador Dinâmico)
    'G',  -- Baterias & Nobreak BESS (proteção contra apagões)
    'H',  -- Sobra de Créditos Solares (vender excedente → Shared Grid)
    'I',  -- Comprador de Kits Prontos/Customizados (Integrador)
    'J'   -- Comprador A La Carte de Componentes & EV Chargers
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela Central de Clientes/Leads
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id), -- Quem está atendendo agora
  
  -- Atribuição de Tráfego Pago (UTM Tracking)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  -- Dados pessoais
  nome_completo text NOT NULL,
  documento text, -- CPF/CNPJ (Pode ser null no cadastro inicial pelo site)
  contato_telefone text NOT NULL,
  contato_email text,
  cidade text NOT NULL,
  estado varchar(2) NOT NULL,

  -- Inteligência de Roteamento (Motor Híbrido)
  horario_captura timestamptz DEFAULT now(),
  status_distribuicao public.status_distribuicao_tipo DEFAULT 'capturado_site',
  hora_fim_sla timestamptz, -- Limite de 30 minutos cravados para o consultor aceitar
  tentativas_roteamento int DEFAULT 0, -- Quantos consultores já ignoraram este lead

  -- Pipeline de vendas
  status public.cliente_status_tipo DEFAULT 'novo' NOT NULL,
  persona public.persona_tipo,
  origem text DEFAULT 'landing_site',
  motivo_perda text,
  fechado_em timestamptz,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Esol Scheduler: Tabela de Reuniões (Alternativa ao Calendly)
CREATE TABLE IF NOT EXISTS public.crm_agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id), -- Pode ser Nulo se estiver no Plantão ADM
  admin_id uuid REFERENCES public.profiles(id), -- Preenchido se a ADM assumir
  
  titulo_reuniao text NOT NULL,
  data_hora_inicio timestamptz NOT NULL,
  data_hora_fim timestamptz NOT NULL,
  
  link_videoconferencia text, -- Zoom / Google Meet autogerado
  status_reuniao text DEFAULT 'agendada', -- agendada, realizada, no_show, cancelada
  
  criado_em timestamptz DEFAULT now()
);

-- Logs de Penalidade e Roteamento (Histórico de Rejeições por SLA)
CREATE TABLE IF NOT EXISTS public.lead_routing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_rejeitado_id uuid REFERENCES public.profiles(id),
  motivo text DEFAULT 'sla_30m_estourado',
  data_rejeicao timestamptz DEFAULT now()
);

-- ==============================================================================
-- ⚙️ PROCEDURES: MOTOR DE ROTEAMENTO (WATERFALL & THROTTLING)
-- ==============================================================================

-- 1. Captura do Site: Define se vai pro Plantão (Noite) ou SLA (Dia)
CREATE OR REPLACE FUNCTION trg_lead_capturado() RETURNS trigger AS $$
BEGIN
  -- Regra: Horário Comercial (08:00 às 18:00)
  IF EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 8 AND 17 THEN
    NEW.status_distribuicao = 'capturado_site'; -- Pronto para o Motor Waterfall achar um consultor
  ELSE
    NEW.status_distribuicao = 'plantao_adm'; -- Madrugada: Fica retido para a equipe interna
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_capturado_trigger ON public.clientes;
CREATE TRIGGER trg_lead_capturado_trigger
BEFORE INSERT ON public.clientes
FOR EACH ROW EXECUTE FUNCTION trg_lead_capturado();

-- Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_consultor ON public.crm_agendamentos(consultor_id, data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_clientes_sla ON public.clientes(status_distribuicao, hora_fim_sla);
