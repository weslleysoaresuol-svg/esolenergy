-- ==============================================================================
-- 🔧 MÓDULO 11: PÓS-VENDA, O&M & AGENDAMENTO TÉCNICO
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: ordens_servico, agendamentos_tecnicos, avaliacoes_servico
-- Enums: tipo_servico, status_ordem_servico, status_agendamento
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.tipo_servico AS ENUM (
    'limpeza_paineis',        -- Categoria #7 — Lavagem química/física especializada
    'manutencao_corretiva',   -- Categoria #6 — Reparo/substituição de componentes
    'manutencao_preventiva',  -- Categoria #6 — Vistoria periódica programada
    'vistoria_tecnica',       -- Inspeção técnica obrigatória (Selo Verde)
    'troca_inversor',         -- Substituição de inversor com garantia
    'monitoramento_iot',      -- Categoria #5 — Instalação/manutenção de SaaS IoT
    'reativacao_sistema',     -- Reativação após sinistro/desligamento
    'retrofit_modulos'        -- Upgrade de módulos para maior eficiência
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_ordem_servico AS ENUM (
    'aberta',                 -- Solicitação recebida, aguardando triagem
    'triagem',                -- Em análise pela equipe técnica
    'agendada',               -- Data e técnico atribuídos
    'em_andamento',           -- Técnico em campo executando
    'checklist_pendente',     -- Serviço concluído, fotos pendentes
    'concluida',              -- Checklist aprovado, serviço finalizado
    'cancelada'               -- Cancelada pelo cliente ou admin
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_agendamento AS ENUM (
    'pendente',               -- Aguardando confirmação do técnico
    'confirmado',             -- Técnico confirmou presença
    'em_rota',                -- Técnico a caminho (GPS ativo)
    'no_local',               -- Técnico chegou ao endereço
    'finalizado',             -- Visita concluída
    'reagendado',             -- Cliente solicitou nova data
    'no_show'                 -- Técnico ou cliente não compareceu
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: ORDENS DE SERVIÇO (O&M, Limpeza, Vistoria)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id),
  tecnico_id uuid REFERENCES public.profiles(id),

  tipo public.tipo_servico NOT NULL,
  status public.status_ordem_servico DEFAULT 'aberta' NOT NULL,
  numero_ordem text NOT NULL,
  descricao text,
  prioridade smallint DEFAULT 2 CHECK (prioridade BETWEEN 1 AND 3),

  endereco_servico text,
  cidade_servico text,
  estado_servico varchar(2),
  latitude numeric(10,7),
  longitude numeric(10,7),

  custo_materiais numeric(12,2) DEFAULT 0,
  custo_mao_obra numeric(12,2) DEFAULT 0,
  custo_deslocamento numeric(12,2) DEFAULT 0,
  preco_cobrado_cliente numeric(12,2) DEFAULT 0,
  comissao_consultor numeric(12,2) DEFAULT 0,

  fotos_antes jsonb DEFAULT '[]'::jsonb,
  fotos_depois jsonb DEFAULT '[]'::jsonb,
  checklist_aprovado boolean DEFAULT false,

  projeto_epc_id uuid,
  equipamento_descricao text,

  sla_prazo_dias integer DEFAULT 7,
  data_solicitacao timestamptz DEFAULT now(),
  data_agendamento timestamptz,
  data_inicio_servico timestamptz,
  data_conclusao timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_os_cliente ON public.ordens_servico(cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_os_tecnico ON public.ordens_servico(tecnico_id, status);
CREATE INDEX IF NOT EXISTS idx_os_tipo ON public.ordens_servico(tipo);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: AGENDAMENTOS TÉCNICOS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.agendamentos_tecnicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tecnico_id uuid REFERENCES public.profiles(id) NOT NULL,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,

  data_agendada date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fim_estimada time,
  status public.status_agendamento DEFAULT 'pendente' NOT NULL,

  latitude_checkin numeric(10,7),
  longitude_checkin numeric(10,7),
  hora_checkin timestamptz,
  hora_checkout timestamptz,

  notas_tecnico text,
  notas_cliente text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agendamento_tecnico_data ON public.agendamentos_tecnicos(tecnico_id, data_agendada);
CREATE INDEX IF NOT EXISTS idx_agendamento_cliente ON public.agendamentos_tecnicos(cliente_id, data_agendada);

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: AVALIAÇÕES DE SERVIÇO (NPS & Feedback)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.avaliacoes_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,
  tecnico_id uuid REFERENCES public.profiles(id),

  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5),
  nps smallint CHECK (nps BETWEEN 0 AND 10),
  comentario text,
  recomendaria boolean DEFAULT true,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_tecnico ON public.avaliacoes_servico(tecnico_id);
