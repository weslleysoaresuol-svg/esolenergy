-- ==============================================================================
-- 🔧 MÓDULO 11: PÓS-VENDA, O&M & AGENDAMENTO TÉCNICO
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: ordens_servico, agendamentos_tecnicos, avaliacoes_servico
-- Enums: tipo_servico, status_ordem_servico, status_agendamento
-- ==============================================================================

-- Tipos de serviço que a Esol oferece no pós-venda
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

CREATE TYPE public.status_ordem_servico AS ENUM (
  'aberta',                 -- Solicitação recebida, aguardando triagem
  'triagem',                -- Em análise pela equipe técnica
  'agendada',               -- Data e técnico atribuídos
  'em_andamento',           -- Técnico em campo executando
  'checklist_pendente',     -- Serviço concluído, fotos pendentes
  'concluida',              -- Checklist aprovado, serviço finalizado
  'cancelada'               -- Cancelada pelo cliente ou admin
);

CREATE TYPE public.status_agendamento AS ENUM (
  'pendente',               -- Aguardando confirmação do técnico
  'confirmado',             -- Técnico confirmou presença
  'em_rota',                -- Técnico a caminho (GPS ativo)
  'no_local',               -- Técnico chegou ao endereço
  'finalizado',             -- Visita concluída
  'reagendado',             -- Cliente solicitou nova data
  'no_show'                 -- Técnico ou cliente não compareceu
);

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: ORDENS DE SERVIÇO (O&M, Limpeza, Vistoria)
-- Cada ordem representa um serviço solicitado por um cliente
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id), -- Consultor que vendeu o serviço
  tecnico_id uuid REFERENCES public.profiles(id),   -- Técnico/instalador atribuído

  -- Dados do serviço
  tipo public.tipo_servico NOT NULL,
  status public.status_ordem_servico DEFAULT 'aberta' NOT NULL,
  numero_ordem text NOT NULL, -- Ex: 'OS-2026-0001' (gerado pelo sistema)
  descricao text,             -- Descrição do problema ou serviço solicitado
  prioridade smallint DEFAULT 2 CHECK (prioridade BETWEEN 1 AND 3), -- 1=urgente, 2=normal, 3=baixa

  -- Endereço do serviço (pode diferir do cadastro do cliente)
  endereco_servico text,
  cidade_servico text,
  estado_servico varchar(2),
  latitude numeric(10,7),
  longitude numeric(10,7),

  -- Custos e comissão (Motor 1 — Categoria #6/#7)
  custo_materiais numeric(12,2) DEFAULT 0,
  custo_mao_obra numeric(12,2) DEFAULT 0,
  custo_deslocamento numeric(12,2) DEFAULT 0,
  preco_cobrado_cliente numeric(12,2) DEFAULT 0,
  comissao_consultor numeric(12,2) DEFAULT 0, -- Motor 1 (TDTC% × preço)

  -- Checklist fotográfico (como no EPC — Fase 3)
  fotos_antes jsonb DEFAULT '[]', -- URLs das fotos antes do serviço
  fotos_depois jsonb DEFAULT '[]', -- URLs das fotos depois do serviço
  checklist_aprovado boolean DEFAULT false,

  -- Equipamento relacionado (se aplicável)
  projeto_epc_id uuid, -- Referência ao projeto EPC original (se houver)
  equipamento_descricao text, -- Ex: 'Inversor Deye SUN-5K-SG04LP3-EU S/N: 123456'

  -- SLA (Service Level Agreement)
  sla_prazo_dias integer DEFAULT 7, -- Prazo máximo para conclusão
  data_solicitacao timestamptz DEFAULT now(),
  data_agendamento timestamptz,
  data_inicio_servico timestamptz,
  data_conclusao timestamptz,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices de performance
CREATE INDEX idx_os_cliente ON public.ordens_servico(cliente_id, status);
CREATE INDEX idx_os_tecnico ON public.ordens_servico(tecnico_id, status);
CREATE INDEX idx_os_tipo ON public.ordens_servico(tipo);

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: AGENDAMENTOS TÉCNICOS
-- Controla a agenda de visitas dos técnicos em campo
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.agendamentos_tecnicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tecnico_id uuid REFERENCES public.profiles(id) NOT NULL,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,

  -- Agendamento
  data_agendada date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fim_estimada time,
  status public.status_agendamento DEFAULT 'pendente' NOT NULL,

  -- Localização em tempo real (para "em_rota" e "no_local")
  latitude_checkin numeric(10,7),
  longitude_checkin numeric(10,7),
  hora_checkin timestamptz,
  hora_checkout timestamptz,

  -- Observações
  notas_tecnico text,
  notas_cliente text,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_agendamento_tecnico_data ON public.agendamentos_tecnicos(tecnico_id, data_agendada);
CREATE INDEX idx_agendamento_cliente ON public.agendamentos_tecnicos(cliente_id, data_agendada);

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: AVALIAÇÕES DE SERVIÇO (NPS & Feedback)
-- O cliente avalia o serviço após conclusão da OS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.avaliacoes_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,
  tecnico_id uuid REFERENCES public.profiles(id),

  -- Avaliação
  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5), -- 1=péssimo ... 5=excelente
  nps smallint CHECK (nps BETWEEN 0 AND 10),           -- Net Promoter Score (0-10)
  comentario text,
  recomendaria boolean DEFAULT true,

  -- Metadados
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_avaliacoes_tecnico ON public.avaliacoes_servico(tecnico_id);
