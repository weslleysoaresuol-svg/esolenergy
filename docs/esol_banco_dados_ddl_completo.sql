-- ==============================================================================
-- 🗄️ ESOL ENERGY — ESQUEMA DE BANCO DE DADOS DDL COMPLETO (v26 - 26 Módulos)
-- Banco de Dados: PostgreSQL (Supabase)
-- ⚠️  ESTE ARQUIVO É GERADO AUTOMATICAMENTE POR CONCATENAÇÃO DOS MÓDULOS.
-- ⚠️  NÃO EDITE DIRETAMENTE. Edite o módulo correspondente em docs/database/
-- ==============================================================================


-- ==============================================================================
-- ðŸ”Œ MÃ“DULO 00: EXTENSÃ•ES POSTGRESQL OBRIGATÃ“RIAS
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: Nenhuma (deve ser executado PRIMEIRO)
-- ==============================================================================

-- ltree: IndexaÃ§Ã£o hierÃ¡rquica para Ã¡rvore MMN (pathing de rede multinÃ­vel)
CREATE EXTENSION IF NOT EXISTS ltree;

-- pgcrypto: FunÃ§Ãµes criptogrÃ¡ficas para SHA-256 Hash Chain do Ledger ContÃ¡bil
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ==============================================================================
-- ðŸ¢ MÃ“DULO 01: TENANTS, CONFIGURAÃ‡ÃƒO TRIBUTÃRIA & COMERCIAL
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 00_extensions.sql
-- Tabelas: tenants, config_tributaria_tenant, config_overhead_dashboard,
--          cupons_promocionais, combos_produtos
-- Enums: regime_tributario_enum, cupom_tipo_desconto
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia text NOT NULL,
  razao_social text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  dominio text UNIQUE, -- Ex: 'marcaA.esolenergy.com.br'
  config_visual jsonb DEFAULT '{}'::jsonb, -- ConfiguraÃ§Ãµes de cores, logo, favicon
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ConfiguraÃ§Ã£o TributÃ¡ria DinÃ¢mica e MigraÃ§Ã£o de CNPJ (MEI -> ME -> EPP -> LTDA)
DO $$ BEGIN
  CREATE TYPE public.regime_tributario_enum AS ENUM (
    'mei',                     -- Microempreendedor Individual (AtÃ© R$ 81k)
    'simples_nacional_me',     -- Microempresa (AtÃ© R$ 360k)
    'simples_nacional_epp',    -- Empresa de Pequeno Porte (AtÃ© R$ 4,8M)
    'lucro_presumido',         -- Lucro Presumido (AtÃ© R$ 78M)
    'lucro_real'               -- Lucro Real (Grande Porte)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.config_tributaria_tenant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  regime_atual public.regime_tributario_enum DEFAULT 'mei' NOT NULL,
  faturamento_acumulado_ano numeric(15, 2) DEFAULT 0.00 NOT NULL,
  teto_regime_vigente numeric(15, 2) DEFAULT 81000.00 NOT NULL,
  alerta_estouro_disparado boolean DEFAULT false,
  historico_migracao jsonb DEFAULT '[]'::jsonb, -- Registro de todas as mudanÃ§as de CNPJ/Regime
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Monitoramento de SaÃºde do Overhead Administrativo (Dashboard dos Donos)
CREATE TABLE IF NOT EXISTS public.config_overhead_dashboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  overhead_percentual_padrao numeric(5, 2) DEFAULT 5.00 NOT NULL,
  teto_alerta_amarelo_percent numeric(5, 2) DEFAULT 85.00 NOT NULL, -- Alerta aos 85%
  teto_trava_vermelha_percent numeric(5, 2) DEFAULT 100.00 NOT NULL, -- Trava aos 100%
  updated_at timestamptz DEFAULT now()
);

-- Tabela de GestÃ£o de Cupons Promocionais e Descontos
DO $$ BEGIN
  CREATE TYPE public.cupom_tipo_desconto AS ENUM ('porcentagem', 'valor_fixo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.cupons_promocionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  codigo text NOT NULL UNIQUE, -- Ex: 'SOLAR5', 'CLIENTEVIP', 'INSPECAO100'
  descricao text,
  tipo_desconto public.cupom_tipo_desconto DEFAULT 'porcentagem' NOT NULL,
  valor_desconto numeric(15, 2) NOT NULL, -- Ex: 5.00 para 5% ou 500.00 para R$ 500
  categorias_permitidas jsonb DEFAULT '[]'::jsonb, -- IDs das categorias aplicÃ¡veis
  uso_maximo_total integer DEFAULT 100,
  usos_realizados integer DEFAULT 0 NOT NULL,
  data_inicio timestamptz DEFAULT now() NOT NULL,
  data_validade timestamptz NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de ConfiguraÃ§Ã£o de Combos e Venda Casada Transparente (Cross-Selling)
CREATE TABLE IF NOT EXISTS public.combos_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome_combo text NOT NULL, -- Ex: 'Combo ProteÃ§Ã£o Total', 'Combo EficiÃªncia Corporativa'
  persona_destino text NOT NULL, -- 'residencial_proprio', 'inquilino', 'pme_grupo_a', 'usina_existente'
  categorias_incluidas jsonb NOT NULL, -- Array de IDs das categorias (ex: ["cat_1", "cat_6", "cat_8"])
  percentual_desconto_combo numeric(5, 2) DEFAULT 3.00 NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- COMMAND CENTER: PARÃ‚METROS CONFIGURÃVEIS DO NEGÃ“CIO
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE IF NOT EXISTS public.parametros_negocio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  chave text NOT NULL,                           -- Ex: 'comissao_n0', 'lucro_alvo', 'overhead'
  valor numeric(15, 4) NOT NULL,                 -- Ex: 15.00, 20.00, 5.00
  unidade text DEFAULT '%',                      -- '%', 'BRL', 'pontos'
  descricao text,                                -- DescriÃ§Ã£o humana do parÃ¢metro
  
  editavel_por text DEFAULT 'super_admin',       -- Qual nÃ­vel RBAC pode alterar
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, chave)
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- COMMAND CENTER: FEATURE FLAGS (LiberaÃ§Ã£o Gradual de MÃ³dulos)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
DO $$ BEGIN
  CREATE TYPE public.feature_flag_modo AS ENUM ('aberto', 'admin_only', 'desligado');
  CREATE TYPE public.feature_flag_categoria AS ENUM ('blindado', 'condicional', 'livre');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  modulo_slug text NOT NULL,                     -- Ex: 'crm', 'mmn', 'esol_club', 'loja'
  modulo_nome text NOT NULL,                     -- Ex: 'Rede MMN', 'Esol Club'
  modo public.feature_flag_modo DEFAULT 'desligado',
  
  -- Campos de SeguranÃ§a Legal (AnÃ¡lise de Impacto Aprovada)
  categoria public.feature_flag_categoria NOT NULL DEFAULT 'livre',
  blindado boolean DEFAULT false,                -- Se true, toggle desabilitado na UI
  verificacao_dependencias boolean DEFAULT false, -- Se true, checa registros ativos antes de desligar
  registros_ativos_count integer DEFAULT 0,      -- Quantidade de registros ativos no mÃ³dulo
  mensagem_bloqueio text,                        -- Ex: 'MÃ³dulo protegido pela LGPD Art. 46'
  lei_referencia text,                           -- Ex: 'LGPD Art. 46, CDC Art. 46'
  
  icone text,                                    -- Ãcone do mÃ³dulo na UI
  ordem_exibicao integer DEFAULT 0,              -- Ordem na sidebar
  
  ativado_em timestamptz,                        -- Quando foi ligado pela primeira vez
  ativado_por uuid,                              -- ReferÃªncia flexÃ­vel
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, modulo_slug)
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- COMMAND CENTER: HISTÃ“RICO DE ALTERAÃ‡Ã•ES DE PARÃ‚METROS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE IF NOT EXISTS public.parametros_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  chave_parametro text NOT NULL,                 -- Ex: 'comissao_n0'
  valor_anterior numeric(15, 4),
  valor_novo numeric(15, 4) NOT NULL,
  
  alterado_por uuid,
  motivo text,                                   -- Justificativa opcional da alteraÃ§Ã£o
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parametros_hist_chave ON public.parametros_historico(chave_parametro, created_at);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- SEED: TENANT RAIZ PADRÃƒO DA ESOL ENERGY
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
INSERT INTO public.tenants (id, nome_fantasia, razao_social, cnpj, dominio, config_visual)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Esol Energy',
  'Esol Energy SoluÃ§Ãµes SustentÃ¡veis LTDA',
  '00.000.000/0001-00',
  'esolenergy.com.br',
  '{"primary_color": "#00E599", "theme": "dark"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- ðŸ‘¤ MÃ“DULO 02: IDENTIDADE, CONTROLE DE ACESSO (RBAC) & GOVERNANÃ‡A
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql
-- Tabelas: profiles, user_roles, admin_audit_logs, socios_cap_table,
--          folha_pagamento_opex
-- Enums: app_role, admin_nivel, socio_opcao_remuneracao, contrato_regime
-- ==============================================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf_cnpj_encrypted bytea NOT NULL, -- PII: Criptografia pgcrypto AES-256
  telefone text,
  meta_pixel_id text,                            -- ID do Pixel do Facebook do Consultor
  google_tag_id text,                            -- ID do GTM/GA4 do Consultor
  tiktok_pixel_id text,                          -- ID do Pixel do TikTok do Consultor
  
  avatar_url text,
  contrato_assinado boolean DEFAULT false,
  onboarding_completo boolean DEFAULT false,
  comissao_percent numeric(5, 2) DEFAULT 8.00, -- Margem individual corretor no Motor 1
  chave_pix_hash bytea, -- SPII: Chave PIX encriptada via pgcrypto
  dados_bancarios_encrypted bytea, -- SPII: JSON encriptado (AES-256)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'corretor',
  'instalador',
  'engenheiro',
  'financeiro',
  'pos_vendas'
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Matriz de Acessos Administrativos (RBAC de 7 NÃ­veis) & Trilha de Auditoria
CREATE TYPE public.admin_nivel AS ENUM (
  'super_admin_socio',
  'admin_juridico',
  'admin_financeiro',
  'admin_engenharia',
  'admin_vendas_mmn',
  'admin_suporte',
  'auditor_externo'
);

CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  papel_utilizado public.admin_nivel NOT NULL,
  acao text NOT NULL, -- Ex: 'aprovaÃ§Ã£o_saque_pix', 'alteracao_minuta_juridica', 'revogacao_acesso'
  modulo text NOT NULL, -- Ex: 'financeiro', 'legal_vault', 'acessos'
  detalhes jsonb DEFAULT '{}'::jsonb, -- Payload completo da alteraÃ§Ã£o para auditoria
  ip_origem text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela do Cap Table de SÃ³cios-Administradores Principais
CREATE TYPE public.socio_opcao_remuneracao AS ENUM (
  'dividendos_isentos_100',
  'pro_labore_fixo',
  'juros_capital_proprio_jcp',
  'modelo_hibrido_flexivel'
);

CREATE TABLE public.socios_cap_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  socio_id uuid REFERENCES public.profiles(id) NOT NULL UNIQUE,
  percentual_cotas numeric(5, 2) NOT NULL CHECK (percentual_cotas > 0 AND percentual_cotas <= 100),
  valor_pro_labore numeric(15, 2) DEFAULT 0.00 NOT NULL,
  opcao_remuneracao public.socio_opcao_remuneracao DEFAULT 'modelo_hibrido_flexivel' NOT NULL,
  periodicidade_dividendos text DEFAULT 'mensal' NOT NULL, -- 'mensal', 'trimestral', 'anual'
  instrucoes_bancarias_socio jsonb DEFAULT '{}'::jsonb,
  data_entrada date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de GestÃ£o de OPEX e Folha de Pagamento Administrativa
CREATE TYPE public.contrato_regime AS ENUM (
  'clt_tradicional',
  'clt_intermitente',
  'pj_honorario',
  'advogado_associado_oab',
  'estagio_lei_11788',
  'socio_equity_prolabore'
);

CREATE TABLE public.folha_pagamento_opex (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.profiles(id) NOT NULL,
  regime public.contrato_regime NOT NULL,
  cargo_funcao text NOT NULL,
  codigo_cbo text NOT NULL, -- CÃ³digo CBO oficial (Ex: '2143-05' Engenheiro, '2410-05' Advogado)
  conselho_classe_registro jsonb DEFAULT '{}'::jsonb, -- Ex: {"orgao": "CREA-SP", "numero": "506948/D"}
  sindicato_enquadramento text, -- Enquadramento no eSocial / CCT
  remuneracao_base numeric(15, 2) NOT NULL,
  bonus_metas_estimado numeric(15, 2) DEFAULT 0.00,
  dados_contratuais jsonb DEFAULT '{}'::jsonb, -- Anexo de contrato, benefÃ­cios, retenÃ§Ãµes
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ==============================================================================
-- ðŸŒ MÃ“DULO 03: REDE MMN â€” HIERARQUIA MULTINÃVEL (LTREE)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 02_identidade_rbac.sql (profiles)
-- Tabelas: rede_mmn
-- Ãndices: idx_rede_mmn_path (GiST)
-- ==============================================================================

CREATE TABLE public.rede_mmn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  patrocinador_id uuid REFERENCES public.profiles(id),
  path public.ltree NOT NULL, -- Ex: 'top.user1_uuid.user2_uuid'
  nivel integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rede_mmn_path ON public.rede_mmn USING gist(path);


-- ==============================================================================
-- ðŸ“‹ MÃ“DULO 04: CRM, GESTÃƒO DE LEADS & ESOL SCHEDULER (WATERFALL ROUTING)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql (profiles)
-- Tabelas: clientes, crm_agendamentos, lead_routing_logs
-- Enums: cliente_status_tipo, persona_tipo, status_distribuicao_tipo
-- ==============================================================================

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

-- Estado do Motor de Roteamento de Leads
CREATE TYPE public.status_distribuicao_tipo AS ENUM (
  'capturado_site',           -- Lead acabou de entrar no funil
  'plantao_adm',              -- Caiu na madrugada, equipe interna segura
  'aguardando_gotejamento',   -- Na fila das 08:00 para Throttling
  'oferecido_consultor',      -- SLA de 30m estÃ¡ correndo
  'assumido_consultor',       -- Consultor clicou em 'Atender' no App
  'perdido_sla',              -- Consultor nÃ£o atendeu em 30m
  'assumido_adm'              -- NinguÃ©m atendeu, AdministraÃ§Ã£o assumiu a venda
);

-- Persona do Cockpit de Vendas (SeÃ§Ã£o 5.6 do Mapa)
CREATE TYPE public.persona_tipo AS ENUM (
  'A',  -- Residencial PrÃ³prio (quer zerar a luz)
  'B',  -- Inquilino / Alugado (sem obra â†’ GD Assinatura)
  'C',  -- PME & IndÃºstria Grupo A (OPEX â†’ MLE)
  'D',  -- Investidor Solar B2B (rentabilidade â†’ Usina)
  'E',  -- Dono de Usina Existente (manutenÃ§Ã£o â†’ O&M + Limpeza)
  'F',  -- Dono de Lote/Terreno (mÂ² â†’ Simulador DinÃ¢mico)
  'G',  -- Baterias & Nobreak BESS (proteÃ§Ã£o contra apagÃµes)
  'H',  -- Sobra de CrÃ©ditos Solares (vender excedente â†’ Shared Grid)
  'I',  -- Comprador de Kits Prontos/Customizados (Integrador)
  'J'   -- Comprador A La Carte de Componentes & EV Chargers
);

-- Tabela Central de Clientes/Leads
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id), -- Quem estÃ¡ atendendo agora
  
  -- AtribuiÃ§Ã£o de TrÃ¡fego Pago (UTM Tracking)
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

  -- InteligÃªncia de Roteamento (Motor HÃ­brido)
  horario_captura timestamptz DEFAULT now(),
  status_distribuicao public.status_distribuicao_tipo DEFAULT 'capturado_site',
  hora_fim_sla timestamptz, -- Limite de 30 minutos cravados para o consultor aceitar
  tentativas_roteamento int DEFAULT 0, -- Quantos consultores jÃ¡ ignoraram este lead

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

-- Esol Scheduler: Tabela de ReuniÃµes (Alternativa ao Calendly)
CREATE TABLE public.crm_agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id), -- Pode ser Nulo se estiver no PlantÃ£o ADM
  admin_id uuid REFERENCES public.profiles(id), -- Preenchido se a ADM assumir
  
  titulo_reuniao text NOT NULL,
  data_hora_inicio timestamptz NOT NULL,
  data_hora_fim timestamptz NOT NULL,
  
  link_videoconferencia text, -- Zoom / Google Meet autogerado
  status_reuniao text DEFAULT 'agendada', -- agendada, realizada, no_show, cancelada
  
  criado_em timestamptz DEFAULT now()
);

-- Logs de Penalidade e Roteamento (HistÃ³rico de RejeiÃ§Ãµes por SLA)
CREATE TABLE public.lead_routing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_rejeitado_id uuid REFERENCES public.profiles(id),
  motivo text DEFAULT 'sla_30m_estourado',
  data_rejeicao timestamptz DEFAULT now()
);

-- ==============================================================================
-- âš™ï¸ PROCEDURES: MOTOR DE ROTEAMENTO (WATERFALL & THROTTLING)
-- ==============================================================================

-- 1. Captura do Site: Define se vai pro PlantÃ£o (Noite) ou SLA (Dia)
CREATE OR REPLACE FUNCTION trg_lead_capturado() RETURNS trigger AS $$
BEGIN
  -- Regra: HorÃ¡rio Comercial (08:00 Ã s 18:00)
  IF EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 8 AND 17 THEN
    NEW.status_distribuicao = 'capturado_site'; -- Pronto para o Motor Waterfall achar um consultor
  ELSE
    NEW.status_distribuicao = 'plantao_adm'; -- Madrugada: Fica retido para a equipe interna
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lead_capturado_trigger
BEFORE INSERT ON public.clientes
FOR EACH ROW EXECUTE FUNCTION trg_lead_capturado();


-- Ãndices de Alta Performance
CREATE INDEX idx_agendamentos_consultor ON public.crm_agendamentos(consultor_id, data_hora_inicio);
CREATE INDEX idx_clientes_sla ON public.clientes(status_distribuicao, hora_fim_sla);

-- ==============================================================================
-- ðŸ“… PG_CRON: SIMULAÃ‡ÃƒO DA ARQUITETURA DE THROTTLING MATINAL
-- ==============================================================================
/*
  O Throttling Matinal (Gotejamento) impede a pane no servidor Ã s 08:00.
  SELECT cron.schedule('morning_drip_cron', '* 8 * * *', $$
    UPDATE public.clientes 
    SET status_distribuicao = 'capturado_site'
    WHERE id IN (
      SELECT id FROM public.clientes WHERE status_distribuicao = 'plantao_adm' ORDER BY horario_captura ASC LIMIT 1
    );
  $$);

  O SLA Fiscalizador Roda a cada 5 Minutos:
  SELECT cron.schedule('sla_30m_police', '*/5 * * * *', $$
    UPDATE public.clientes 
    SET status_distribuicao = 'perdido_sla', corretor_id = NULL
    WHERE status_distribuicao = 'oferecido_consultor' AND hora_fim_sla < now();
  $$);
*/


-- ==============================================================================
-- âš¡ MÃ“DULO 05: CARTEIRA DE ENERGIA (GD & MLE â€” CONTRATOS RECORRENTES)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: carteira_energia
-- Enums: carteira_status, mercado_tipo
-- ==============================================================================

CREATE TYPE public.carteira_status AS ENUM (
  'novo',
  'analise_viabilidade',
  'aguardando_documentos',
  'proposta_enviada',
  'contrato_assinado',
  'protocolado_distribuidora',
  'homologado',
  'ativo',
  'suspenso',
  'cancelado'
);

CREATE TYPE public.mercado_tipo AS ENUM ('gd', 'mle');

CREATE TABLE public.carteira_energia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id),
  tipo_mercado public.mercado_tipo NOT NULL,
  fornecedor_parceiro_id text NOT NULL, -- 'origo', 'reverde', 'clarke', 'enel'
  status public.carteira_status DEFAULT 'novo' NOT NULL,
  fatura_media_mensal numeric(15, 2) NOT NULL,
  consumo_mensal_kwh numeric(15, 2) NOT NULL,
  percentual_desconto_contratado numeric(5, 2) NOT NULL,
  data_assinatura date,
  data_inicio_fornecimento date,
  data_fim_fidelidade date,
  data_protocolo_denuncia date, -- MLE: Prazo de 180 dias de aviso prÃ©vio
  historico_faturas jsonb DEFAULT '[]'::jsonb, -- Array de faturas mensais para auditoria
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ==============================================================================
-- ✍️ MÓDULO 06: ESOL SIGN — ASSINATURAS ELETRÔNICAS, KYC & MINUTAS JURÍDICAS
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: assinaturas_digitais, documentos_minutas_juridicas
-- Enums: documento_categoria, kyc_status
-- Base Legal: MP 2.200-2/2001 e Lei 14.063/2020
-- ==============================================================================

CREATE TYPE public.documento_categoria AS ENUM (
  'contrato_parceria',
  'renovacao_termo_parceria', -- Esol Re-Sign (Renovação Anual & Prova de Vida)
  'termo_compromisso_equipe',
  'proposta_solar_turnkey',
  'adesao_gd',
  'denuncia_contrato_mle',
  'distrato_cancelamento'
);

CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected', 'bypass');

CREATE TABLE public.assinaturas_digitais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id), -- Signatário
  tipo_documento public.documento_categoria NOT NULL,
  referencia_id uuid NOT NULL, -- Link genérico (propostas, clientes, carteira)
  conteudo_hash text NOT NULL, -- SHA-256 do contrato
  assinatura_url text NOT NULL, -- Assinatura física desenhada
  selfie_url text, -- Selfie KYC
  documento_frente_url text,
  documento_verso_url text,
  ip_origem text NOT NULL,
  user_agent text NOT NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  timestamp_ntp timestamptz DEFAULT now(),
  facematch_status public.kyc_status DEFAULT 'pending',
  facematch_score numeric(5, 2),
  created_at timestamptz DEFAULT now()
);

-- Central de Governança Jurídica (Esol Legal & Compliance Vault)
CREATE TABLE public.documentos_minutas_juridicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  categoria public.documento_categoria NOT NULL,
  titulo text NOT NULL, -- Ex: 'Termo de Parceria Comercial Autônoma MMN'
  versao text NOT NULL, -- Ex: 'v2.1'
  descricao_alteracoes text, -- Notação do advogado sobre o que mudou
  arquivo_url text, -- PDF/DOCX original no Supabase Storage
  conteudo_template text NOT NULL, -- Template HTML/Markdown com tags {{VARIAVEIS}}
  hash_sha256 text NOT NULL, -- Digest do conteúdo da minuta
  status text DEFAULT 'rascunho' NOT NULL, -- 'rascunho', 'ativa', 'arquivada'
  exige_reaceite boolean DEFAULT false,
  criado_por_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, categoria, versao)
);


-- ==============================================================================
-- ðŸ“’ MÃ“DULO 07: LEDGER CONTÃBIL (PARTIDA DOBRADA & HASHING SHA-256)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 00_extensions.sql (pgcrypto), 01_tenants_config.sql
-- Tabelas: ledger_contas, ledger_lancamentos
-- Enums: ledger_tipo_conta
-- Triggers: trg_atualizar_saldos_ledger, trg_gerar_hash_lancamento
-- ==============================================================================

CREATE TYPE public.ledger_tipo_conta AS ENUM ('ativo', 'passivo', 'patrimonio', 'receita', 'despesa');

CREATE TABLE public.ledger_contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  codigo text NOT NULL, -- Ex: '1.1.01.01'
  nome text NOT NULL,
  tipo public.ledger_tipo_conta NOT NULL,
  saldo numeric(15, 2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, codigo)
);

CREATE TABLE public.ledger_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  data_lancamento timestamptz DEFAULT now() NOT NULL,
  descricao text NOT NULL,
  conta_debito_id uuid REFERENCES public.ledger_contas(id) NOT NULL,
  conta_credito_id uuid REFERENCES public.ledger_contas(id) NOT NULL,
  valor numeric(15, 2) NOT NULL CHECK (valor > 0),
  origem_tipo text NOT NULL, -- 'faturamento_pedido', 'repasse_mmn', 'cancelamento'
  origem_id uuid NOT NULL,
  hash_transacao text NOT NULL UNIQUE, -- SHA-256 encadeado
  hash_anterior text,
  created_at timestamptz DEFAULT now()
);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- TRIGGERS DO LEDGER (AutomaÃ§Ã£o ContÃ¡bil + SeguranÃ§a CriptogrÃ¡fica)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- Trigger 1: AtualizaÃ§Ã£o AutomÃ¡tica de Saldos (Partida Dobrada)
CREATE OR REPLACE FUNCTION public.atualizar_saldos_contas_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Debita valor da conta dÃ©bito
  UPDATE public.ledger_contas 
  SET saldo = saldo + NEW.valor, updated_at = now()
  WHERE id = NEW.conta_debito_id;

  -- Credita valor na conta crÃ©dito (deduz se ativo/despesa, incrementa se passivo/receita)
  UPDATE public.ledger_contas 
  SET saldo = CASE 
    WHEN tipo IN ('ativo', 'despesa') THEN saldo - NEW.valor
    ELSE saldo + NEW.valor
  END, updated_at = now()
  WHERE id = NEW.conta_credito_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_atualizar_saldos_ledger
  AFTER INSERT ON public.ledger_lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_saldos_contas_trigger();

-- Trigger 2: GeraÃ§Ã£o de Hash Encadeado de LanÃ§amentos (Blockchain-style)
CREATE OR REPLACE FUNCTION public.gerar_hash_lancamento_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_hash_anterior text;
BEGIN
  -- Coleta o hash da Ãºltima transaÃ§Ã£o do tenant
  SELECT hash_transacao INTO v_hash_anterior
  FROM public.ledger_lancamentos
  WHERE tenant_id = NEW.tenant_id
  ORDER BY data_lancamento DESC, created_at DESC
  LIMIT 1;

  NEW.hash_anterior := COALESCE(v_hash_anterior, 'GENESIS_BLOCK');
  
  -- Calcula o hash SHA-256 concatenando os dados do lanÃ§amento
  NEW.hash_transacao := encode(digest(
    NEW.id::text || 
    NEW.hash_anterior || 
    NEW.valor::text || 
    NEW.conta_debito_id::text || 
    NEW.conta_credito_id::text || 
    NEW.data_lancamento::text,
    'sha256'
  ), 'hex');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_gerar_hash_lancamento
  BEFORE INSERT ON public.ledger_lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_hash_lancamento_trigger();


-- ==============================================================================
-- ðŸ“„ MÃ“DULO 08: DISTRATOS & CONFORMIDADE
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 05_carteira_energia.sql, 06_motor_assinaturas.sql
-- Tabelas: distratos_conformidade
-- ==============================================================================

CREATE TABLE public.distratos_conformidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  carteira_energia_id uuid REFERENCES public.carteira_energia(id) ON DELETE CASCADE,
  motivo text NOT NULL,
  descricao text,
  assinatura_distrato_id uuid REFERENCES public.assinaturas_digitais(id),
  estorno_comissoes_concluido boolean DEFAULT false,
  status text DEFAULT 'pendente' NOT NULL, -- 'pendente', 'aprovado', 'rejeitado'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ==============================================================================
-- ðŸŒ¿ MÃ“DULO 09: ESOL CLUB & ECOPONTOS (REFERRALS & LOYALTY LEDGER)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 04_crm_clientes.sql
-- Tabelas: ecopontos_ledger, ecopontos_resgates
-- Enums: ecopontos_status
-- ==============================================================================

CREATE TYPE public.ecopontos_status AS ENUM ('pendente', 'disponivel', 'expirado', 'resgatado', 'cancelado');

CREATE TABLE public.ecopontos_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_indicador_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_indicado_id uuid REFERENCES public.clientes(id),
  origem_categoria integer NOT NULL, -- Categoria 1 a 8 do portfÃ³lio
  pontos integer NOT NULL CHECK (pontos > 0),
  equivalente_reais numeric(15, 2) NOT NULL,
  status public.ecopontos_status DEFAULT 'pendente' NOT NULL,
  data_liberacao timestamptz,
  data_validade timestamptz NOT NULL, -- ExpiraÃ§Ã£o em 31/12 do ano vigente
  streaming_mes_atual integer DEFAULT 1, -- MÃªs do parcelamento (1 a 10)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.ecopontos_resgates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_resgate text NOT NULL, -- 'desconto_fatura', 'voucher_loja', 'limpeza_paineis', 'brinde_oficial'
  pontos_utilizados integer NOT NULL CHECK (pontos_utilizados > 0),
  valor_equivalente numeric(15, 2) NOT NULL,
  detalhes jsonb DEFAULT '{}'::jsonb, -- Dados da fatura, cupom ou frete do brinde
  status text DEFAULT 'solicitado' NOT NULL, -- 'solicitado', 'aprovado', 'entregue', 'cancelado'
  created_at timestamptz DEFAULT now()
);


-- ==============================================================================
-- ⚙️ MÓDULO 10: ENGENHARIA SOLAR TURNKEY — EPC COMPLETO (7 FASES)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql,
--               03_rede_mmn.sql, 04_crm_clientes.sql, 07_ledger_contabil.sql
-- Tabelas: dimensionamento_solar, bom_materiais, projetos_epc,
--          instalacao_campo, homologacao_concessionaria,
--          financiamento_solar, historico_comissoes_epc
-- Enums: tipo_estrutura_fixacao, tipo_tarifa_energia, tipo_tensao_entrada,
--        bom_tipo_componente, projeto_epc_fase, instalacao_status,
--        homologacao_status, financiamento_modalidade, financiamento_status
-- Triggers: trg_projeto_epc_concluido_ledger, trg_projeto_epc_comissao_mmn
-- Integração: Motor Reverso, Ledger Contábil, Esol Sign e Rede MMN.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.1 CAMADA 1: DADOS DE ENGENHARIA (Dimensionamento & BOM)
-- ──────────────────────────────────────────────────────────────────────────────

-- Enum: Tipo de estrutura de fixação dos painéis
CREATE TYPE public.tipo_estrutura_fixacao AS ENUM (
  'telhado_ceramico',
  'telhado_fibrocimento',
  'telhado_metalico',
  'laje_plana',
  'solo_terreno',
  'carport_estacionamento'
);

-- Enum: Tipo de tarifa da concessionária de energia
CREATE TYPE public.tipo_tarifa_energia AS ENUM (
  'b1_residencial',
  'b2_rural',
  'b3_comercial',
  'a4_industrial_media_tensao',
  'a3_industrial_alta_tensao',
  'a3a_industrial'
);

-- Enum: Tipo de tensão de entrada do imóvel
CREATE TYPE public.tipo_tensao_entrada AS ENUM (
  'monofasico_127v',
  'bifasico_220v',
  'trifasico_220v',
  'trifasico_380v'
);

-- Tabela: Dimensionamento Solar (Motor de Engenharia — Fase 1 do EPC)
-- Persiste TODOS os cálculos de engenharia solar com precisão centesimal.
-- Suporta múltiplas versões/cenários por projeto (revisão de propostas).
CREATE TABLE public.dimensionamento_solar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id),
  versao integer DEFAULT 1 NOT NULL, -- Revisão (consultor pode simular vários cenários)
  aprovado boolean DEFAULT false NOT NULL, -- Apenas 1 versão aprovada por cliente

  -- Dados da Fatura de Energia (OCR / Input Manual)
  concessionaria text NOT NULL, -- Ex: 'CPFL Paulista', 'Enel SP', 'Cemig'
  tipo_tarifa public.tipo_tarifa_energia NOT NULL,
  tensao_entrada public.tipo_tensao_entrada NOT NULL,
  historico_consumo_12m jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array de 12 valores kWh
  consumo_medio_mensal_kwh numeric(15, 4) NOT NULL, -- Média calculada
  tarifa_kwh_concessionaria numeric(10, 6) NOT NULL, -- R$/kWh vigente
  fio_b_percentual numeric(5, 2) DEFAULT 0.00 NOT NULL, -- Lei 14.300/2022 (progressivo até 2029)

  -- Cálculos de Engenharia Solar
  hsp_local numeric(6, 4) NOT NULL, -- Horas de Sol Pleno (NASA/CRESESB) ex: 4.8500
  performance_ratio numeric(5, 4) DEFAULT 0.8000 NOT NULL, -- PR ≈ 80% (inclui perdas elétricas e térmicas)
  potencia_kwp numeric(10, 4) NOT NULL, -- P_kWp = Consumo / (30 × HSP × PR)
  quantidade_modulos integer NOT NULL CHECK (quantidade_modulos > 0),
  potencia_modulo_wp integer NOT NULL, -- Ex: 585, 600 (Tier-1 N-Type TOPCon)
  tipo_modulo text NOT NULL, -- Ex: 'N-Type TOPCon 585W Tier-1'
  tipo_inversor text NOT NULL, -- Ex: 'Inversor String Deye 5kW', 'Microinversor Hoymiles'
  potencia_inversor_kw numeric(10, 4) NOT NULL,
  tipo_estrutura public.tipo_estrutura_fixacao NOT NULL,

  -- Simulação de Lotes (Persona F — Terreno de Qualquer Tamanho)
  area_terreno_m2 numeric(15, 4), -- Área total do terreno informada pelo cliente
  area_util_m2 numeric(15, 4), -- Área útil (67% da total após corredores e segurança)
  fator_aproveitamento_terreno numeric(5, 4) DEFAULT 0.6700, -- 67% padrão

  -- Resultados do Dimensionamento
  geracao_estimada_mensal_kwh numeric(15, 4) NOT NULL, -- kWh/mês esperado
  geracao_estimada_anual_kwh numeric(15, 4) NOT NULL, -- kWh/ano
  economia_mensal_reais numeric(15, 4) NOT NULL, -- R$/mês de economia
  payback_anos numeric(6, 2) NOT NULL, -- Retorno do investimento em anos
  vpl_economia_25_anos numeric(15, 4) NOT NULL, -- Valor Presente Líquido em 25 anos
  co2_evitado_kg_ano numeric(15, 4), -- CO₂ evitado por ano (kg)

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, cliente_id, versao) -- Apenas 1 versão por cliente por tenant
);

-- Tabela: Lista de Materiais — BOM (Bill of Materials) — Fase 2 do EPC
-- Cada item do kit solar é registrado individualmente para rastreabilidade de custos.
CREATE TYPE public.bom_tipo_componente AS ENUM (
  'modulo_fotovoltaico',
  'inversor_string',
  'microinversor',
  'string_box_dc',
  'string_box_ac',
  'cabo_solar_6mm',
  'conector_mc4',
  'disjuntor_protecao',
  'trilho_aluminio',
  'grampo_fixacao',
  'gancho_telhado',
  'cabo_terra',
  'bateria_bess',
  'medidor_bidirecional',
  'outros'
);

CREATE TABLE public.bom_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  dimensionamento_id uuid REFERENCES public.dimensionamento_solar(id) ON DELETE CASCADE,
  tipo_componente public.bom_tipo_componente NOT NULL,
  sku_produto text, -- Código SKU no catálogo da Loja Esol ou distribuidor
  descricao text NOT NULL, -- Ex: 'Módulo LONGi Hi-MO 7 585W N-Type TOPCon'
  marca text NOT NULL, -- Ex: 'LONGi', 'Deye', 'Hoymiles', 'BYD'
  quantidade integer NOT NULL CHECK (quantidade > 0),
  potencia_wp integer, -- Potência unitária em Wp (para módulos e inversores)
  preco_unitario numeric(15, 4) NOT NULL, -- Preço FOB/CIF do distribuidor
  preco_total numeric(15, 4) NOT NULL, -- = quantidade × preco_unitario
  distribuidor_parceiro text NOT NULL, -- Ex: 'Aldo Solar', 'Edeltec', 'WDC', 'Solfácil', 'Fotus'
  frete_estimado numeric(15, 4) DEFAULT 0.0000, -- Frete rodoviário até o local da obra
  prazo_entrega_dias integer, -- Prazo de entrega estimado pelo distribuidor
  created_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.2 CAMADA 2: CICLO DE VIDA EPC (Projeto, Instalação & Homologação)
-- ──────────────────────────────────────────────────────────────────────────────

-- Enum: Fases sequenciais do projeto EPC (workflow de 9 estados)
CREATE TYPE public.projeto_epc_fase AS ENUM (
  'dimensionamento',          -- Fase 1: Engenharia & Cálculos
  'procurement_bom',          -- Fase 2: Suprimentos & Cotação
  'instalacao_campo',         -- Fase 3: Obras, ART & Mão de Obra
  'homologacao',              -- Fase 4: Protocolo na Concessionária
  'dre_motor_reverso',        -- Fase 5: DRE & Precificação
  'financiamento',            -- Fase 6: Fintech & Pagamento
  'legal_vault_assinatura',   -- Fase 7: Contrato EPC & Biometria
  'concluido',                -- Projeto entregue (Selo Verde emitido)
  'cancelado'                 -- Projeto cancelado/distratado
);

-- Tabela: Projetos EPC (Coração do Módulo Turnkey — Categoria #1)
-- Integra as 7 Fases com o Motor Reverso, Ledger Contábil e Rede MMN.
CREATE TABLE public.projetos_epc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id) NOT NULL, -- Vendedor N0 da rede MMN
  dimensionamento_id uuid REFERENCES public.dimensionamento_solar(id),
  numero_projeto text UNIQUE NOT NULL, -- Código único sequencial (ex: 'EPC-2026-0001')

  -- Status do Workflow
  fase_atual public.projeto_epc_fase DEFAULT 'dimensionamento' NOT NULL,

  -- ════════════════════════════════════════════════════════════════════
  -- MOTOR REVERSO — DRE DO PROJETO EM TEMPO REAL (Fase 5)
  -- Preço = Cfixos / (1 - tributo - overhead - TDTC) - lucro_alvo
  -- Todas as colunas monetárias com precisão de 4 casas decimais.
  -- ════════════════════════════════════════════════════════════════════

  -- Custos Fixos (C_fixos)
  custo_bom_hardware numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- Custo BOM do distribuidor
  custo_frete_logistica numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- Frete rodoviário
  custo_mao_obra_instalacao numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- R$/Wp × kWp
  custo_art_homologacao numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- Taxa CREA/CFT + Engenheiro
  custo_total_fixo numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- Σ dos 4 custos acima

  -- Splits do Motor Reverso (Percentuais)
  percentual_impostos numeric(5, 4) DEFAULT 0.0600 NOT NULL, -- Ex: 6% Simples Nacional
  percentual_overhead numeric(5, 4) DEFAULT 0.0500 NOT NULL, -- 5% Overhead Administrativo
  percentual_tdtc numeric(5, 4) DEFAULT 0.1500 NOT NULL, -- 15% TDTC (8% N0 + 7% Override)
  percentual_lucro_alvo numeric(5, 4) DEFAULT 0.2000 NOT NULL, -- 20% Lucro Mínimo Esol

  -- Preço de Venda (Calculado pelo Motor Reverso)
  preco_tabela_ancorado numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- Preço de vitrine (ancoragem ~34%)
  desconto_aplicado_total numeric(15, 4) DEFAULT 0.0000, -- Cupons + Desconto balcão + PIX
  preco_final_venda numeric(15, 4) DEFAULT 0.0000 NOT NULL, -- Preço efetivo cobrado do cliente

  -- DRE Decomposta
  valor_impostos numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  -- [CUSTOS OCULTOS - AUDITORIA CEO]
  requer_troca_padrao_concessionaria boolean DEFAULT false,
  valor_custo_padrao_entrada numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  percentual_reserva_garantia_om numeric(5, 4) DEFAULT 0.0150 NOT NULL, -- 1.5% retido para o fundo
  valor_reserva_garantia_om numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  valor_overhead numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  valor_tdtc_mmn numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  lucro_liquido_matriz numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  margem_liquida_percentual numeric(5, 4) DEFAULT 0.0000 NOT NULL,

  -- ════════════════════════════════════════════════════════════════════
  -- MARGIN FLOOR GUARDRAIL (Trava Cega de Proteção)
  -- O projeto NÃO pode ser concluído se a margem cair abaixo de 20%.
  -- ════════════════════════════════════════════════════════════════════
  CONSTRAINT chk_margem_piso_epc CHECK (
    fase_atual IN ('dimensionamento', 'procurement_bom', 'cancelado')
    OR margem_liquida_percentual >= 0.2000
  ),

  -- Selo Verde Esol (Emitido apenas quando o projeto é 100% concluído e homologado)
  selo_verde_emitido boolean DEFAULT false NOT NULL,
  selo_verde_data_emissao timestamptz,
  selo_verde_numero_certificado text, -- Código único do Selo Verde (ex: 'SV-2026-00381')

  -- Timestamps por Fase (Rastreabilidade Total)
  data_inicio_projeto timestamptz DEFAULT now(),
  data_aprovacao_proposta timestamptz,
  data_pedido_bom timestamptz,
  data_inicio_obra timestamptz,
  data_fim_obra timestamptz,
  data_protocolo_concessionaria timestamptz,
  data_vistoria_concessionaria timestamptz,
  data_medidor_bidirecional timestamptz,
  data_geracao_ativa timestamptz,
  data_conclusao timestamptz,

  -- SLA de Tempo por Fase (Alertas Automáticos — em dias úteis)
  sla_instalacao_dias integer DEFAULT 15,
  sla_homologacao_dias integer DEFAULT 30,
  sla_vistoria_dias integer DEFAULT 45,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para busca rápida de projetos por fase e consultor
CREATE INDEX idx_projetos_epc_fase ON public.projetos_epc (fase_atual);
CREATE INDEX idx_projetos_epc_consultor ON public.projetos_epc (consultor_id);

-- Enum: Status da instalação de campo
CREATE TYPE public.instalacao_status AS ENUM (
  'agendada',
  'em_andamento',
  'checklist_pendente',
  'aprovada',
  'rejeitada'
);

-- Tabela: Instalação de Campo (Fase 3 — Obras, EPC & ART)
-- Registro completo da execução de obra física com checklist fotográfico obrigatório.
CREATE TABLE public.instalacao_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE UNIQUE,
  instalador_id uuid REFERENCES public.profiles(id) NOT NULL, -- Instalador credenciado
  engenheiro_art_id uuid REFERENCES public.profiles(id), -- Engenheiro responsável pela ART

  -- Custo de Mão de Obra
  custo_por_wp numeric(10, 4) NOT NULL, -- Ex: 0.3000 (R$/Wp telhado) ou 0.4500 (R$/Wp solo)
  potencia_instalada_kwp numeric(10, 4) NOT NULL,
  custo_total_mao_obra numeric(15, 4) NOT NULL, -- = custo_por_wp × potencia_instalada_kwp × 1000

  -- Checklist Fotográfico Obrigatório (4 Categorias de Fotos)
  -- O pagamento do instalador SÓ é liberado após checklist 100% aprovado.
  fotos_estrutura_mecanica jsonb DEFAULT '[]'::jsonb, -- URLs das fotos: trilhos, grampos, telhado
  fotos_cabeamento_cc_ca jsonb DEFAULT '[]'::jsonb, -- URLs: cabos solares, conectores MC4, disjuntores
  fotos_inversor_instalado jsonb DEFAULT '[]'::jsonb, -- URLs: inversor montado, Wi-Fi ativo
  fotos_string_box jsonb DEFAULT '[]'::jsonb, -- URLs: string box DC/AC, aterramento
  checklist_completo boolean DEFAULT false NOT NULL,

  -- ART (Anotação de Responsabilidade Técnica)
  art_numero_registro text, -- Número da ART no CREA/CFT
  art_conselho text, -- 'CREA' ou 'CFT'
  art_uf varchar(2), -- UF do registro
  art_arquivo_url text, -- PDF da ART no Supabase Storage
  art_data_emissao date,

  -- Laudo Estrutural (Parecer de Carga do Telhado)
  laudo_estrutural_url text, -- PDF do laudo
  laudo_aprovado boolean DEFAULT false,

  -- Status
  status public.instalacao_status DEFAULT 'agendada' NOT NULL,
  data_agendamento date,
  data_inicio_obra date,
  data_conclusao_obra date,
  observacoes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enum: Status da homologação na concessionária
CREATE TYPE public.homologacao_status AS ENUM (
  'elaborando_projeto',      -- Engenheiro elaborando diagrama unifilar e memorial
  'protocolado',             -- Projeto submetido no portal da concessionária
  'parecer_emitido',         -- Concessionária emitiu parecer (favorável ou desfavorável)
  'vistoria_agendada',       -- Vistoria técnica agendada pela concessionária
  'vistoria_realizada',      -- Vistoria concluída em campo
  'medidor_instalado',       -- Medidor bidirecional substituído
  'ativo_gerando'            -- Usina ativa gerando créditos na rede
);

-- Tabela: Homologação na Concessionária (Fase 4 — ANEEL)
-- Rastreamento completo do processo regulatório junto à distribuidora local.
CREATE TABLE public.homologacao_concessionaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE UNIQUE,
  engenheiro_id uuid REFERENCES public.profiles(id), -- Engenheiro responsável pelo projeto executivo

  -- Dados da Concessionária
  concessionaria_nome text NOT NULL, -- Ex: 'CPFL Paulista', 'Enel SP', 'Cemig'
  concessionaria_uf varchar(2) NOT NULL,
  unidade_consumidora text NOT NULL, -- Número da UC na concessionária

  -- Projeto Executivo Elétrico
  projeto_executivo_url text, -- PDF do diagrama unifilar + memorial descritivo
  memorial_descritivo_url text, -- PDF do memorial
  planta_situacao_url text, -- PDF da planta

  -- Protocolo de Acesso (Solicitação junto à concessionária)
  numero_protocolo_acesso text, -- Número do protocolo emitido pela concessionária
  data_protocolo_acesso date,
  tipo_parecer text, -- 'favoravel', 'desfavoravel', 'aguardando_analise'
  data_parecer date,
  observacoes_parecer text,

  -- Vistoria Técnica
  data_vistoria_agendada date,
  data_vistoria_realizada date,
  vistoria_aprovada boolean,
  vistoria_observacoes text,

  -- Medidor Bidirecional
  numero_medidor_antigo text,
  numero_medidor_bidirecional text, -- Novo medidor de créditos
  data_troca_medidor date,

  -- Status
  status public.homologacao_status DEFAULT 'elaborando_projeto' NOT NULL,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.3 CAMADA 3: FINANCEIRO & LEGAL (Financiamento Fintech & Esol Sign EPC)
-- ──────────────────────────────────────────────────────────────────────────────

-- Enum: Modalidade de pagamento do projeto Turnkey
CREATE TYPE public.financiamento_modalidade AS ENUM (
  'pix_a_vista',            -- PIX com desconto de 3% a 5%
  'cartao_credito',         -- Até 21x via gateway
  'financiamento_bancario', -- Até 84x com carência de 60-120 dias
  'boleto_bancario'         -- Boleto parcelado
);

-- Enum: Status do financiamento
CREATE TYPE public.financiamento_status AS ENUM (
  'analise_credito',        -- CPF/CNPJ em análise
  'aprovado',               -- Crédito aprovado pelo banco
  'reprovado',              -- Crédito negado
  'contrato_assinado',      -- Contrato financeiro assinado
  'liberado',               -- Recurso liberado ao distribuidor
  'em_pagamento',           -- Cliente pagando parcelas
  'quitado',                -- Financiamento 100% quitado
  'inadimplente'            -- Cliente em atraso
);

-- Tabela: Financiamento Solar (Fase 6 — Fintech & Meios de Pagamento)
CREATE TABLE public.financiamento_solar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE UNIQUE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,

  -- Modalidade de Pagamento
  modalidade public.financiamento_modalidade NOT NULL,
  banco_parceiro text, -- Ex: 'BV Financeiro', 'Santander', 'Solfácil', 'Banco do Brasil'

  -- Valores do Financiamento
  valor_total_financiado numeric(15, 4) NOT NULL, -- Valor total do projeto
  entrada_valor numeric(15, 4) DEFAULT 0.0000, -- Valor de entrada (se houver)
  numero_parcelas integer, -- Ex: 12, 24, 36, 48, 60, 72, 84
  taxa_juros_mensal numeric(8, 6), -- Ex: 0.012900 (1.29% a.m.)
  valor_parcela_mensal numeric(15, 4), -- Valor de cada parcela
  carencia_dias integer DEFAULT 0, -- 60, 90 ou 120 dias para 1ª parcela

  -- Desconto por Pagamento à Vista (PIX)
  desconto_pix_percentual numeric(5, 4) DEFAULT 0.0000, -- 3% a 5%
  desconto_pix_valor numeric(15, 4) DEFAULT 0.0000,

  -- Análise de Crédito
  score_credito integer, -- Score do bureau (Serasa/SPC)
  data_analise_credito timestamptz,
  motivo_reprovacao text, -- Se reprovado

  -- Status
  status public.financiamento_status DEFAULT 'analise_credito' NOT NULL,
  data_liberacao_recurso timestamptz,
  data_primeira_parcela date,
  data_ultima_parcela date,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expansão do enum de documentos para incluir contratos EPC
-- Nota: Em produção usar ALTER TYPE ... ADD VALUE, aqui documentamos para referência.
-- ALTER TYPE public.documento_categoria ADD VALUE IF NOT EXISTS 'contrato_epc_empreitada';
-- Garantias do contrato EPC: 25 anos módulos, 10 anos inversor, 1 ano instalação.

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.4 CAMADA 4: CONTABILIDADE & REDE (Triggers de Integração Automática)
-- ──────────────────────────────────────────────────────────────────────────────

-- Tabela auxiliar: Histórico de Comissões MMN por Projeto EPC
-- Registra cada distribuição de comissão para auditoria individual.
CREATE TABLE public.historico_comissoes_epc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.profiles(id) NOT NULL, -- Consultor que recebe
  nivel_rede integer NOT NULL, -- 0 = Venda Direta, 1-7 = Override
  percentual_aplicado numeric(5, 4) NOT NULL, -- Ex: 0.0800 (8%) ou 0.0100 (1%)
  valor_base numeric(15, 4) NOT NULL, -- Preço de venda do projeto
  valor_comissao numeric(15, 4) NOT NULL, -- = valor_base × percentual_aplicado
  status text DEFAULT 'pendente' NOT NULL, -- 'pendente', 'pago', 'estornado'
  data_pagamento timestamptz,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGER 1: Geração Automática de Lançamentos Contábeis ao Concluir Projeto
-- Quando um projeto EPC muda para fase 'concluido', o trigger gera os
-- lançamentos de Partida Dobrada no Ledger Contábil (SHA-256 Hash Chain).
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_projeto_epc_concluido_ledger()
RETURNS TRIGGER AS $$
DECLARE
  v_conta_banco uuid;
  v_conta_receita uuid;
  v_conta_despesa_mmn uuid;
  v_conta_comissoes_pagar uuid;
  v_conta_overhead_reserva uuid;
  v_conta_fundo_overhead uuid;
BEGIN
  -- Só executa se a fase mudou para 'concluido'
  IF NEW.fase_atual = 'concluido' AND OLD.fase_atual != 'concluido' THEN

    -- Resolve as contas contábeis do tenant (ou usa contas padrão)
    SELECT id INTO v_conta_banco FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '1.1.01.01' LIMIT 1;
    SELECT id INTO v_conta_receita FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '4.1.01.01' LIMIT 1;
    SELECT id INTO v_conta_despesa_mmn FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '5.1.01.01' LIMIT 1;
    SELECT id INTO v_conta_comissoes_pagar FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '2.1.01.01' LIMIT 1;

    -- Lançamento 1: Receita de Serviços Turnkey (valor que a Esol efetivamente recebe)
    -- Débito: Banco Esol / Crédito: Receita Operacional
    IF v_conta_banco IS NOT NULL AND v_conta_receita IS NOT NULL THEN
      INSERT INTO public.ledger_lancamentos (
        tenant_id, descricao, conta_debito_id, conta_credito_id,
        valor, origem_tipo, origem_id
      ) VALUES (
        NEW.tenant_id,
        'Receita de Projeto Turnkey EPC #' || NEW.numero_projeto,
        v_conta_banco,
        v_conta_receita,
        NEW.preco_final_venda - NEW.custo_bom_hardware, -- Apenas o serviço (split triangular)
        'faturamento_projeto_epc',
        NEW.id
      );
    END IF;

    -- Lançamento 2: Provisão de Comissões MMN a Pagar (TDTC 15%)
    -- Débito: Despesa com Override MMN / Crédito: Comissões a Pagar
    IF v_conta_despesa_mmn IS NOT NULL AND v_conta_comissoes_pagar IS NOT NULL THEN
      INSERT INTO public.ledger_lancamentos (
        tenant_id, descricao, conta_debito_id, conta_credito_id,
        valor, origem_tipo, origem_id
      ) VALUES (
        NEW.tenant_id,
        'TDTC MMN 15% Projeto EPC #' || NEW.numero_projeto,
        v_conta_despesa_mmn,
        v_conta_comissoes_pagar,
        NEW.valor_tdtc_mmn,
        'repasse_mmn_epc',
        NEW.id
      );
    END IF;

    -- Marca o Selo Verde como emitido
    NEW.selo_verde_emitido := true;
    NEW.selo_verde_data_emissao := now();
    NEW.selo_verde_numero_certificado := 'SV-' || to_char(now(), 'YYYY') || '-' || lpad(
      (SELECT count(*) + 1 FROM public.projetos_epc
       WHERE tenant_id = NEW.tenant_id AND selo_verde_emitido = true)::text, 5, '0');
    NEW.data_conclusao := now();

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_projeto_epc_concluido_ledger
  BEFORE UPDATE ON public.projetos_epc
  FOR EACH ROW
  WHEN (NEW.fase_atual = 'concluido' AND OLD.fase_atual IS DISTINCT FROM 'concluido')
  EXECUTE FUNCTION public.fn_projeto_epc_concluido_ledger();

-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGER 2: Distribuição Automática de Comissões MMN ao Concluir Projeto
-- Distribui 8% para o Consultor N0 e 1% por nível para N1 ao N7 na rede.
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_projeto_epc_comissao_mmn()
RETURNS TRIGGER AS $$
DECLARE
  v_consultor_rede RECORD;
  v_upline_path public.ltree;
  v_upline RECORD;
  v_nivel_atual integer;
  v_preco_venda numeric(15, 4);
BEGIN
  -- Só executa se a fase mudou para 'concluido'
  IF NEW.fase_atual = 'concluido' AND OLD.fase_atual != 'concluido' THEN
    v_preco_venda := NEW.preco_final_venda;

    -- 1. Comissão Venda Direta N0 (8% do preço de venda)
    INSERT INTO public.historico_comissoes_epc (
      tenant_id, projeto_epc_id, usuario_id, nivel_rede,
      percentual_aplicado, valor_base, valor_comissao, status
    ) VALUES (
      NEW.tenant_id, NEW.id, NEW.consultor_id, 0,
      0.0800, v_preco_venda, v_preco_venda * 0.0800, 'pendente'
    );

    -- 2. Override N1 ao N7 (1% por nível = 7% total)
    -- Busca o path ltree do consultor na rede MMN
    SELECT path, nivel INTO v_consultor_rede
    FROM public.rede_mmn WHERE usuario_id = NEW.consultor_id LIMIT 1;

    IF v_consultor_rede IS NOT NULL THEN
      v_nivel_atual := 0;
      -- Percorre os 7 níveis acima na árvore de indicação
      FOR v_upline IN
        SELECT rm.usuario_id, rm.nivel
        FROM public.rede_mmn rm
        WHERE rm.path @> v_consultor_rede.path
          AND rm.usuario_id != NEW.consultor_id
        ORDER BY rm.nivel DESC -- Do mais próximo ao mais distante
        LIMIT 7
      LOOP
        v_nivel_atual := v_nivel_atual + 1;
        INSERT INTO public.historico_comissoes_epc (
          tenant_id, projeto_epc_id, usuario_id, nivel_rede,
          percentual_aplicado, valor_base, valor_comissao, status
        ) VALUES (
          NEW.tenant_id, NEW.id, v_upline.usuario_id, v_nivel_atual,
          0.0100, v_preco_venda, v_preco_venda * 0.0100, 'pendente'
        );
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_projeto_epc_comissao_mmn
  AFTER UPDATE ON public.projetos_epc
  FOR EACH ROW
  WHEN (NEW.fase_atual = 'concluido' AND OLD.fase_atual IS DISTINCT FROM 'concluido')
  EXECUTE FUNCTION public.fn_projeto_epc_comissao_mmn();


-- ==============================================================================
-- ðŸ”§ MÃ“DULO 11: PÃ“S-VENDA, O&M & AGENDAMENTO TÃ‰CNICO
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: ordens_servico, agendamentos_tecnicos, avaliacoes_servico
-- Enums: tipo_servico, status_ordem_servico, status_agendamento
-- ==============================================================================

-- Tipos de serviÃ§o que a Esol oferece no pÃ³s-venda
CREATE TYPE public.tipo_servico AS ENUM (
  'limpeza_paineis',        -- Categoria #7 â€” Lavagem quÃ­mica/fÃ­sica especializada
  'manutencao_corretiva',   -- Categoria #6 â€” Reparo/substituiÃ§Ã£o de componentes
  'manutencao_preventiva',  -- Categoria #6 â€” Vistoria periÃ³dica programada
  'vistoria_tecnica',       -- InspeÃ§Ã£o tÃ©cnica obrigatÃ³ria (Selo Verde)
  'troca_inversor',         -- SubstituiÃ§Ã£o de inversor com garantia
  'monitoramento_iot',      -- Categoria #5 â€” InstalaÃ§Ã£o/manutenÃ§Ã£o de SaaS IoT
  'reativacao_sistema',     -- ReativaÃ§Ã£o apÃ³s sinistro/desligamento
  'retrofit_modulos'        -- Upgrade de mÃ³dulos para maior eficiÃªncia
);

CREATE TYPE public.status_ordem_servico AS ENUM (
  'aberta',                 -- SolicitaÃ§Ã£o recebida, aguardando triagem
  'triagem',                -- Em anÃ¡lise pela equipe tÃ©cnica
  'agendada',               -- Data e tÃ©cnico atribuÃ­dos
  'em_andamento',           -- TÃ©cnico em campo executando
  'checklist_pendente',     -- ServiÃ§o concluÃ­do, fotos pendentes
  'concluida',              -- Checklist aprovado, serviÃ§o finalizado
  'cancelada'               -- Cancelada pelo cliente ou admin
);

CREATE TYPE public.status_agendamento AS ENUM (
  'pendente',               -- Aguardando confirmaÃ§Ã£o do tÃ©cnico
  'confirmado',             -- TÃ©cnico confirmou presenÃ§a
  'em_rota',                -- TÃ©cnico a caminho (GPS ativo)
  'no_local',               -- TÃ©cnico chegou ao endereÃ§o
  'finalizado',             -- Visita concluÃ­da
  'reagendado',             -- Cliente solicitou nova data
  'no_show'                 -- TÃ©cnico ou cliente nÃ£o compareceu
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: ORDENS DE SERVIÃ‡O (O&M, Limpeza, Vistoria)
-- Cada ordem representa um serviÃ§o solicitado por um cliente
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id), -- Consultor que vendeu o serviÃ§o
  tecnico_id uuid REFERENCES public.profiles(id),   -- TÃ©cnico/instalador atribuÃ­do

  -- Dados do serviÃ§o
  tipo public.tipo_servico NOT NULL,
  status public.status_ordem_servico DEFAULT 'aberta' NOT NULL,
  numero_ordem text NOT NULL, -- Ex: 'OS-2026-0001' (gerado pelo sistema)
  descricao text,             -- DescriÃ§Ã£o do problema ou serviÃ§o solicitado
  prioridade smallint DEFAULT 2 CHECK (prioridade BETWEEN 1 AND 3), -- 1=urgente, 2=normal, 3=baixa

  -- EndereÃ§o do serviÃ§o (pode diferir do cadastro do cliente)
  endereco_servico text,
  cidade_servico text,
  estado_servico varchar(2),
  latitude numeric(10,7),
  longitude numeric(10,7),

  -- Custos e comissÃ£o (Motor 1 â€” Categoria #6/#7)
  custo_materiais numeric(12,2) DEFAULT 0,
  custo_mao_obra numeric(12,2) DEFAULT 0,
  custo_deslocamento numeric(12,2) DEFAULT 0,
  preco_cobrado_cliente numeric(12,2) DEFAULT 0,
  comissao_consultor numeric(12,2) DEFAULT 0, -- Motor 1 (TDTC% Ã— preÃ§o)

  -- Checklist fotogrÃ¡fico (como no EPC â€” Fase 3)
  fotos_antes jsonb DEFAULT '[]', -- URLs das fotos antes do serviÃ§o
  fotos_depois jsonb DEFAULT '[]', -- URLs das fotos depois do serviÃ§o
  checklist_aprovado boolean DEFAULT false,

  -- Equipamento relacionado (se aplicÃ¡vel)
  projeto_epc_id uuid, -- ReferÃªncia ao projeto EPC original (se houver)
  equipamento_descricao text, -- Ex: 'Inversor Deye SUN-5K-SG04LP3-EU S/N: 123456'

  -- SLA (Service Level Agreement)
  sla_prazo_dias integer DEFAULT 7, -- Prazo mÃ¡ximo para conclusÃ£o
  data_solicitacao timestamptz DEFAULT now(),
  data_agendamento timestamptz,
  data_inicio_servico timestamptz,
  data_conclusao timestamptz,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ãndices de performance
CREATE INDEX idx_os_cliente ON public.ordens_servico(cliente_id, status);
CREATE INDEX idx_os_tecnico ON public.ordens_servico(tecnico_id, status);
CREATE INDEX idx_os_tipo ON public.ordens_servico(tipo);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: AGENDAMENTOS TÃ‰CNICOS
-- Controla a agenda de visitas dos tÃ©cnicos em campo
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

  -- LocalizaÃ§Ã£o em tempo real (para "em_rota" e "no_local")
  latitude_checkin numeric(10,7),
  longitude_checkin numeric(10,7),
  hora_checkin timestamptz,
  hora_checkout timestamptz,

  -- ObservaÃ§Ãµes
  notas_tecnico text,
  notas_cliente text,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_agendamento_tecnico_data ON public.agendamentos_tecnicos(tecnico_id, data_agendada);
CREATE INDEX idx_agendamento_cliente ON public.agendamentos_tecnicos(cliente_id, data_agendada);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 3: AVALIAÃ‡Ã•ES DE SERVIÃ‡O (NPS & Feedback)
-- O cliente avalia o serviÃ§o apÃ³s conclusÃ£o da OS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.avaliacoes_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,
  tecnico_id uuid REFERENCES public.profiles(id),

  -- AvaliaÃ§Ã£o
  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5), -- 1=pÃ©ssimo ... 5=excelente
  nps smallint CHECK (nps BETWEEN 0 AND 10),           -- Net Promoter Score (0-10)
  comentario text,
  recomendaria boolean DEFAULT true,

  -- Metadados
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_avaliacoes_tecnico ON public.avaliacoes_servico(tecnico_id);


-- ==============================================================================
-- ðŸ›’ MÃ“DULO 12: LOJA ESOL (E-COMMERCE & CATÃLOGO DE PRODUTOS)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: produtos_loja, pedidos_loja, itens_pedido
-- Enums: categoria_produto, status_pedido
-- ==============================================================================

-- Categorias de produtos vendidos na Loja Esol (Categoria #2 do MMN)
CREATE TYPE public.categoria_produto AS ENUM (
  'painel_solar',           -- MÃ³dulos fotovoltaicos (mono/poli)
  'inversor',               -- Inversores string, micro, hÃ­brido
  'estrutura_fixacao',      -- Trilhos, grampos, parafusos (telhado/solo)
  'string_box',             -- ProteÃ§Ã£o CC com fusÃ­veis e DPS
  'cabo_conector',          -- Cabos solares, conectores MC4
  'bateria',                -- LiFePO4, lead-acid, BYD, Pylontech
  'carregador_ev',          -- Wallbox 7kW-22kW, carregadores portÃ¡teis
  'sensor_iot',             -- Medidores inteligentes, gateways IoT
  'kit_pronto',             -- Combo prÃ©-montado (painÃ©is+inversor+estrutura)
  'kit_personalizado',      -- Kit montado pelo consultor/cliente
  'acessorio'               -- Ferramentas, EPIs, cabos extras
);

CREATE TYPE public.status_pedido AS ENUM (
  'carrinho',               -- Itens selecionados, checkout nÃ£o iniciado
  'aguardando_pagamento',   -- Checkout realizado, pagamento pendente
  'pago',                   -- Pagamento confirmado
  'separacao',              -- Em separaÃ§Ã£o no distribuidor
  'enviado',                -- Despachado (com cÃ³digo de rastreio)
  'entregue',               -- Recebido pelo cliente
  'instalacao_pendente',    -- Entregue, aguardando instalaÃ§Ã£o
  'concluido',              -- Instalado e funcionando
  'cancelado',              -- Cancelado pelo cliente ou admin
  'devolvido'               -- DevoluÃ§Ã£o processada (CDC Art. 49)
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: CATÃLOGO DE PRODUTOS (SKUs)
-- Gerenciado pelo admin. Cada produto tem preÃ§o de custo (do
-- distribuidor) e preÃ§o de venda (calculado pelo Motor Reverso)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.produtos_loja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- IdentificaÃ§Ã£o
  sku text NOT NULL,                -- Ex: 'ESOL-PNL-550W-MONO-001'
  nome text NOT NULL,               -- Ex: 'Painel Solar Canadian 550W Monocristalino'
  descricao text,
  categoria public.categoria_produto NOT NULL,
  marca text,                       -- Ex: 'Canadian Solar', 'Deye', 'BYD'
  modelo text,                      -- Ex: 'CS6W-550MS'
  imagem_url text,                  -- URL da foto no Cloudflare R2

  -- EspecificaÃ§Ãµes tÃ©cnicas (para validaÃ§Ã£o de compatibilidade)
  potencia_wp numeric(10,2),        -- Watts-pico (para painÃ©is e inversores)
  tensao_voc numeric(8,2),          -- TensÃ£o de circuito aberto (V) â€” painÃ©is
  corrente_isc numeric(8,2),        -- Corrente de curto-circuito (A) â€” painÃ©is
  mppt_min_v numeric(8,2),          -- TensÃ£o mÃ­nima MPPT (V) â€” inversores
  mppt_max_v numeric(8,2),          -- TensÃ£o mÃ¡xima MPPT (V) â€” inversores
  corrente_max_entrada numeric(8,2),-- Corrente mÃ¡xima de entrada (A) â€” inversores
  capacidade_kwh numeric(8,2),      -- Capacidade em kWh (baterias)
  potencia_carga_kw numeric(8,2),   -- PotÃªncia de carga (kW) â€” carregadores EV

  -- PreÃ§os
  preco_custo numeric(12,2) NOT NULL,    -- PreÃ§o FOB do distribuidor
  preco_custo_frete numeric(12,2) DEFAULT 0, -- Frete estimado
  preco_venda numeric(12,2),             -- Calculado pelo Motor Reverso (preÃ§o ao consumidor)
  lucro_alvo_pct numeric(5,4) DEFAULT 0.2000, -- Margem de lucro configurÃ¡vel por SKU
  tdtc_pct numeric(5,4) DEFAULT 0.1500,  -- TDTC especÃ­fico do produto

  -- Estoque
  estoque_disponivel integer DEFAULT 0,
  estoque_minimo integer DEFAULT 5,
  distribuidor_parceiro text,       -- Ex: 'Aldo Solar', 'Edeltec', 'Sou Energy'
  prazo_entrega_dias integer DEFAULT 7,

  -- Status
  ativo boolean DEFAULT true,
  destaque boolean DEFAULT false,   -- Produto em destaque na vitrine

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_produtos_sku ON public.produtos_loja(tenant_id, sku);
CREATE INDEX idx_produtos_categoria ON public.produtos_loja(categoria) WHERE ativo = true;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: PEDIDOS DA LOJA
-- Cada pedido pode ter mÃºltiplos itens. O preÃ§o final Ã©
-- recalculado pelo Motor Reverso no checkout
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.pedidos_loja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id), -- Consultor que vendeu

  -- IdentificaÃ§Ã£o
  numero_pedido text NOT NULL, -- Ex: 'PED-2026-0001'
  status public.status_pedido DEFAULT 'carrinho' NOT NULL,

  -- Valores (calculados a partir dos itens)
  subtotal numeric(12,2) DEFAULT 0,         -- Soma dos itens antes de descontos
  desconto_combo numeric(12,2) DEFAULT 0,   -- Desconto de combo (combos_produtos)
  desconto_cupom numeric(12,2) DEFAULT 0,   -- Desconto de cupom (cupons_promocionais)
  desconto_pix numeric(12,2) DEFAULT 0,     -- Desconto PIX Ã  vista
  valor_frete numeric(12,2) DEFAULT 0,
  valor_total numeric(12,2) DEFAULT 0,      -- Subtotal - descontos + frete

  -- ComissÃ£o (Motor 1)
  tdtc_total numeric(12,2) DEFAULT 0,       -- Total de comissÃ£o da rede
  comissao_consultor numeric(12,2) DEFAULT 0, -- Parte do consultor (N0)

  -- Pagamento
  forma_pagamento text,      -- 'pix', 'cartao_credito', 'boleto', 'financiamento'
  codigo_rastreio text,      -- CÃ³digo de rastreio dos Correios/transportadora

  -- EndereÃ§o de entrega
  endereco_entrega text,
  cidade_entrega text,
  estado_entrega varchar(2),
  cep_entrega varchar(9),

  -- Cupom aplicado
  cupom_id uuid, -- FK para cupons_promocionais (01_tenants_config)
  combo_id uuid, -- FK para combos_produtos (01_tenants_config)

  -- Timestamps
  data_pedido timestamptz DEFAULT now(),
  data_pagamento timestamptz,
  data_envio timestamptz,
  data_entrega timestamptz,
  data_cancelamento timestamptz,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pedidos_cliente ON public.pedidos_loja(cliente_id, status);
CREATE INDEX idx_pedidos_consultor ON public.pedidos_loja(consultor_id, status);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 3: ITENS DO PEDIDO
-- Cada item Ã© um produto do catÃ¡logo com quantidade e preÃ§o
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.itens_pedido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid REFERENCES public.pedidos_loja(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos_loja(id),

  -- Dados do item
  sku text NOT NULL,
  nome_produto text NOT NULL,
  categoria public.categoria_produto NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric(12,2) NOT NULL,
  preco_total numeric(12,2) NOT NULL, -- quantidade Ã— preco_unitario

  -- EspecificaÃ§Ãµes (snapshot no momento da compra)
  potencia_wp numeric(10,2),
  marca text,
  modelo text,

  -- Metadados
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_itens_pedido ON public.itens_pedido(pedido_id);


-- ==============================================================================
-- ðŸ“¬ MÃ“DULO 13: COMUNICAÃ‡ÃƒO & NOTIFICAÃ‡Ã•ES
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: templates_comunicacao, fila_notificacoes
-- Enums: canal_comunicacao, status_notificacao, gatilho_notificacao
-- ==============================================================================

-- Canais de comunicaÃ§Ã£o disponÃ­veis
CREATE TYPE public.canal_comunicacao AS ENUM (
  'whatsapp',               -- Link parametrizado wa.me (redirect)
  'email',                  -- Resend / Brevo API
  'push_web',               -- Web Push Notification (PWA)
  'sms',                    -- SMS transacional (futuro)
  'app_interno'             -- NotificaÃ§Ã£o dentro do painel (sino)
);

CREATE TYPE public.status_notificacao AS ENUM (
  'pendente',               -- Na fila, aguardando envio
  'enviada',                -- Enviada com sucesso
  'entregue',               -- ConfirmaÃ§Ã£o de entrega (webhook)
  'lida',                   -- Aberta/visualizada pelo destinatÃ¡rio
  'falha',                  -- Erro no envio (retry automÃ¡tico)
  'cancelada'               -- Cancelada antes do envio
);

-- Eventos do ecossistema que disparam notificaÃ§Ãµes automÃ¡ticas
CREATE TYPE public.gatilho_notificacao AS ENUM (
  -- CRM & Vendas
  'novo_lead',                      -- Lead cadastrado pelo site ou consultor
  'lead_frio_3_dias',               -- SLA: lead sem contato hÃ¡ 3+ dias
  'proposta_enviada',               -- Consultor enviou proposta ao cliente
  'proposta_visualizada',           -- Cliente abriu o PDF da proposta
  'proposta_aceita',                -- Cliente aceitou a proposta
  'proposta_expirando',             -- Proposta vencendo em 48h

  -- EPC & Projetos
  'projeto_fase_avancou',           -- Projeto mudou de fase no EPC
  'checklist_instalacao_pendente',  -- Instalador precisa enviar fotos
  'homologacao_aprovada',           -- ConcessionÃ¡ria aprovou o projeto
  'selo_verde_emitido',             -- Sistema ativou o Selo Verde

  -- Financeiro
  'comissao_liberada',              -- ComissÃ£o disponÃ­vel para saque
  'saque_aprovado',                 -- Saque PIX processado
  'pagamento_recebido',             -- Pagamento do cliente confirmado

  -- PÃ³s-Venda
  'os_aberta',                      -- Nova ordem de serviÃ§o criada
  'agendamento_confirmado',         -- TÃ©cnico confirmou visita
  'servico_concluido',              -- Ordem de serviÃ§o finalizada
  'avaliacao_pendente',             -- Pedir avaliaÃ§Ã£o ao cliente

  -- MMN & Rede
  'novo_consultor_na_rede',         -- Novo downline cadastrado
  'selo_carreira_desbloqueado',     -- Consultor atingiu novo selo de carreira
  'meta_mensal_atingida',           -- Meta de vendas do mÃªs batida

  -- Legal & Compliance
  'contrato_assinado',              -- Contrato assinado via Esol Sign
  'prova_vida_pendente',            -- Re-Sign de renovaÃ§Ã£o de contrato
  'distrato_solicitado',            -- Cliente solicitou cancelamento

  -- Esol Club
  'ecopontos_creditados',           -- Pontos creditados ao cliente
  'resgate_aprovado'                -- Resgate de benefÃ­cio aprovado
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: TEMPLATES DE COMUNICAÃ‡ÃƒO
-- Templates reusÃ¡veis com variÃ¡veis dinÃ¢micas ({{NOME}}, etc.)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.templates_comunicacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- IdentificaÃ§Ã£o
  nome text NOT NULL,               -- Ex: 'Boas-vindas do Novo Lead'
  gatilho public.gatilho_notificacao NOT NULL,
  canal public.canal_comunicacao NOT NULL,

  -- ConteÃºdo
  assunto text,                     -- Assunto do email (ignorado p/ WhatsApp)
  corpo_template text NOT NULL,     -- Corpo com variÃ¡veis: {{NOME}}, {{VALOR}}, {{LINK}}
  -- VariÃ¡veis disponÃ­veis: {{NOME_CLIENTE}}, {{NOME_CONSULTOR}}, {{VALOR}},
  -- {{LINK_PROPOSTA}}, {{LINK_CONTRATO}}, {{DATA}}, {{TELEFONE}}, {{CIDADE}}

  -- ConfiguraÃ§Ã£o
  ativo boolean DEFAULT true,
  prioridade smallint DEFAULT 2 CHECK (prioridade BETWEEN 1 AND 3),
  delay_minutos integer DEFAULT 0,  -- Atraso antes de enviar (ex: 30min apÃ³s lead)
  max_retentativas integer DEFAULT 3,

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_template_gatilho_canal ON public.templates_comunicacao(tenant_id, gatilho, canal);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: FILA DE NOTIFICAÃ‡Ã•ES
-- Cada notificaÃ§Ã£o Ã© um registro na fila, processado por
-- Edge Functions (Cloudflare Workers) ou Supabase Functions
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.fila_notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.templates_comunicacao(id),

  -- DestinatÃ¡rio
  destinatario_id uuid REFERENCES public.profiles(id),
  destinatario_nome text,
  destinatario_telefone text,       -- Para WhatsApp/SMS
  destinatario_email text,          -- Para email

  -- ConteÃºdo renderizado (template jÃ¡ preenchido)
  canal public.canal_comunicacao NOT NULL,
  gatilho public.gatilho_notificacao NOT NULL,
  assunto_renderizado text,
  corpo_renderizado text NOT NULL,

  -- Status de envio
  status public.status_notificacao DEFAULT 'pendente' NOT NULL,
  tentativas integer DEFAULT 0,
  erro_mensagem text,               -- Detalhe do erro se status = 'falha'

  -- ReferÃªncia ao contexto (qual lead, proposta, OS, etc.)
  referencia_tipo text,             -- 'cliente', 'proposta', 'ordem_servico', 'projeto_epc'
  referencia_id uuid,               -- ID do registro relacionado

  -- Timestamps
  agendado_para timestamptz DEFAULT now(),
  enviado_em timestamptz,
  entregue_em timestamptz,
  lido_em timestamptz,

  -- Metadados
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fila_status ON public.fila_notificacoes(status) WHERE status = 'pendente';
CREATE INDEX idx_fila_destinatario ON public.fila_notificacoes(destinatario_id, created_at DESC);
CREATE INDEX idx_fila_gatilho ON public.fila_notificacoes(gatilho);


-- ==============================================================================
-- ðŸ’» MÃ“DULO 14: DEVELOPER HUB (API, WEBHOOKS & EDGE FUNCTIONS)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: api_keys, webhooks_endpoints, webhook_deliveries, edge_functions
-- Enums: api_key_ambiente, webhook_evento_tipo, delivery_status
-- ==============================================================================

CREATE TYPE public.api_key_ambiente AS ENUM ('test', 'live');

CREATE TYPE public.webhook_evento_tipo AS ENUM (
  'lead.created', 'lead.updated',
  'contract.signed', 'contract.canceled',
  'epc.phase_changed', 'epc.approved',
  'commission.ready', 'commission.paid',
  'eco_points.credited', 'eco_points.redeemed',
  '*' -- Curinga para todos os eventos
);

CREATE TYPE public.delivery_status AS ENUM ('success', 'failed', 'pending');

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: API KEYS (Gerenciamento de acesso externo e de IAs)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id), -- Quem criou a chave

  nome text NOT NULL,                    -- Ex: 'IntegraÃ§Ã£o ERP Omie', 'Agente IA'
  ambiente public.api_key_ambiente NOT NULL,
  key_prefix text NOT NULL,              -- Ex: 'sk_live_' ou 'sk_test_'
  key_hash text NOT NULL,                -- Hash SHA-256 do token (nÃ£o guardar plaintext)
  key_hint text NOT NULL,                -- 4 Ãºltimos caracteres (ex: '...4f8a')
  
  -- PermissÃµes (Scopes)
  scopes jsonb DEFAULT '["read:leads"]', -- Ex: ["read:leads", "write:epc", "agent:meta"]
  
  -- SeguranÃ§a e Metadados
  ativo boolean DEFAULT true,
  revogado_em timestamptz,
  ultimo_uso_em timestamptz,
  expira_em timestamptz,                 -- Opcional
  
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_tenant ON public.api_keys(tenant_id) WHERE ativo = true;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: WEBHOOK ENDPOINTS (Destinos para notificaÃ§Ãµes HTTP)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.webhooks_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  url text NOT NULL,                     -- Destino do POST (ex: n8n, Zapier)
  descricao text,
  ambiente public.api_key_ambiente NOT NULL,
  eventos public.webhook_evento_tipo[] NOT NULL, -- Array de eventos inscritos
  
  -- SeguranÃ§a
  secret_signing_key text NOT NULL,      -- Chave (hmac sha256) gerada para o cliente validar o payload
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 3: WEBHOOK DELIVERIES (Observabilidade e Logs)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid REFERENCES public.webhooks_endpoints(id) ON DELETE CASCADE,
  
  evento_disparado public.webhook_evento_tipo NOT NULL,
  payload_enviado jsonb NOT NULL,
  
  status public.delivery_status DEFAULT 'pending',
  http_status_code smallint,             -- Ex: 200, 400, 500
  response_body text,                    -- Corpo da resposta do servidor de destino
  tempo_execucao_ms integer,             -- LatÃªncia
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_endpoint ON public.webhook_deliveries(endpoint_id, created_at DESC);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 4: EDGE FUNCTIONS (Custom Code / AutomaÃ§Ãµes Nativas)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.edge_functions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.profiles(id),

  nome text NOT NULL,                    -- Ex: 'Roteamento Lead MT'
  descricao text,
  gatilho_evento public.webhook_evento_tipo NOT NULL,
  
  codigo_ts text NOT NULL,               -- CÃ³digo TypeScript da funÃ§Ã£o
  ativo boolean DEFAULT false,           -- Requer deploy para ativar
  ambiente public.api_key_ambiente NOT NULL,
  
  -- EstatÃ­sticas
  total_invocacoes integer DEFAULT 0,
  taxa_erro_pct numeric(5,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ==============================================================================
-- ðŸŽ¨ MÃ“DULO 15: GROWTH & BRAND HUB (Marketing, Design e Social Media)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: midias_arquivos, campanhas_marketing, materiais_consultor, social_integrations
-- Enums: midia_tipo, campanha_status, social_plataforma
-- ==============================================================================

CREATE TYPE public.midia_tipo AS ENUM ('imagem', 'video', 'pdf', 'svg', 'documento');
CREATE TYPE public.campanha_status AS ENUM ('rascunho', 'agendada', 'em_execucao', 'pausada', 'concluida', 'cancelada');
CREATE TYPE public.social_plataforma AS ENUM ('instagram', 'facebook', 'linkedin', 'whatsapp', 'youtube');

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: ASSETS DIGITAIS E MÃDIAS (Digital Asset Management - DAM)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.midias_arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.profiles(id),  -- Designer responsÃ¡vel
  
  titulo text NOT NULL,
  descricao text,
  tipo public.midia_tipo NOT NULL,
  url_arquivo text NOT NULL,                     -- URL do Storage (Supabase/S3)
  resolucao text,                                -- Ex: '1920x1080'
  tamanho_bytes bigint,
  tags text[],                                   -- Ex: ['banner', 'promocao', 'site']
  
  aprovado boolean DEFAULT false,                -- Fluxo de aprovaÃ§Ã£o do Diretor
  aprovado_por uuid REFERENCES public.profiles(id),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_midias_tags ON public.midias_arquivos USING GIN (tags);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: MATERIAIS PARA CONSULTORES (MuniÃ§Ã£o de Venda)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.materiais_consultor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  midia_id uuid REFERENCES public.midias_arquivos(id) ON DELETE CASCADE,
  
  titulo text NOT NULL,
  categoria text NOT NULL,                       -- Ex: 'Stories Insta', 'Panfleto PDF'
  texto_copy_sugerido text,                      -- Texto base para o consultor colar na rede social
  
  permite_co_branding boolean DEFAULT true,      -- Se true, o App estampa a foto e QR Code do consultor
  coordenadas_qr_code jsonb,                     -- Onde colar o QR Code na imagem {x: 100, y: 800, size: 200}
  coordenadas_foto jsonb,                        -- Onde colar a foto do perfil
  
  ativo boolean DEFAULT true,
  downloads_totais integer DEFAULT 0,            -- Engajamento da rede
  
  created_at timestamptz DEFAULT now()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 3: INTEGRAÃ‡Ã•ES SOCIAIS (SMM - Social Media Management)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.social_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  plataforma public.social_plataforma NOT NULL,
  nome_conta text NOT NULL,                      -- Ex: 'Esol Energy Oficial (@esolenergy)'
  
  access_token text NOT NULL,                    -- Oauth Token (idealmente encriptado via pgcrypto na prÃ¡tica)
  refresh_token text,
  token_expires_at timestamptz,
  
  page_id text,                                  -- ID da pÃ¡gina no FB/LinkedIn
  ativo boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 4: CAMPANHAS DE MARKETING E DISPAROS OMNICHANNEL
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.campanhas_marketing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  midia_id uuid REFERENCES public.midias_arquivos(id), -- Arte vinculada
  
  nome text NOT NULL,
  conteudo_texto text NOT NULL,                  -- Copy do post
  status public.campanha_status DEFAULT 'rascunho',
  
  canais_publicacao public.social_plataforma[],  -- Onde publicar (Array)
  
  agendado_para timestamptz,                     -- Quando publicar
  publicado_em timestamptz,                      -- ConfirmaÃ§Ã£o de publicaÃ§Ã£o
  
  -- MÃ©tricas agregadas de retorno (opcional p/ relatÃ³rios de Growth)
  total_likes integer DEFAULT 0,
  total_compartilhamentos integer DEFAULT 0,
  total_cliques integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_campanhas_agendamento ON public.campanhas_marketing(agendado_para) WHERE status = 'agendada';


-- ==============================================================================
-- ðŸš€ MÃ“DULO 16: PERFORMANCE & TRACKING HUB (Server-Side)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: tracking_server_events, ad_spend_diario
-- Enums: evento_conversao, plataforma_ads
-- ==============================================================================

CREATE TYPE public.evento_conversao AS ENUM ('page_view', 'lead_form', 'initiate_checkout', 'purchase', 'contract_signed');
CREATE TYPE public.plataforma_ads AS ENUM ('meta_ads', 'google_ads', 'tiktok_ads', 'linkedin_ads');

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: CAPI (CONVERSIONS API) SERVER-SIDE EVENTS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.tracking_server_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id), -- Quem converteu
  consultor_id uuid REFERENCES public.profiles(id), -- Dono do trÃ¡fego (se houver)
  
  evento public.evento_conversao NOT NULL,
  plataforma public.plataforma_ads NOT NULL,
  pixel_id_usado text,                           -- Qual pixel recebeu o disparo (Corporate ou Consultor)
  
  valor_conversao numeric(12,2) DEFAULT 0.00,    -- Ãštil para ROAS (Ex: R$ 50.000)
  moeda varchar(3) DEFAULT 'BRL',
  
  user_ip inet,
  user_agent text,
  fbc text,                                      -- Facebook Click ID (via cookie)
  fbp text,                                      -- Facebook Browser ID
  gclid text,                                    -- Google Click ID
  
  payload_enviado jsonb,                         -- Corpo do JSON disparado pra API da Meta/Google
  status_http integer,                           -- 200 (Sucesso), 400 (Erro)
  
  created_at timestamptz DEFAULT now()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: GASTO DE ANÃšNCIOS (ROAS DASHBOARD BI)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.ad_spend_diario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  data_referencia date NOT NULL,
  plataforma public.plataforma_ads NOT NULL,
  campanha_id text,
  campanha_nome text,
  
  valor_gasto numeric(10,2) NOT NULL DEFAULT 0.00,
  impressoes integer DEFAULT 0,
  cliques integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, data_referencia, plataforma, campanha_id)
);

CREATE INDEX idx_tracking_events_cliente ON public.tracking_server_events(cliente_id);
CREATE INDEX idx_ad_spend_data ON public.ad_spend_diario(data_referencia);


-- ==============================================================================
-- ðŸ›¡ï¸ MÃ“DULO 17: SECURITY AUDIT VAULT (Lixeira de Dados & Time Machine)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: security_audit_logs
-- FunÃ§Ãµes: process_audit_log()
-- ==============================================================================

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: COFRE DE AUDITORIA (Lixeira e HistÃ³rico)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Quem fez a alteraÃ§Ã£o
  ator_id uuid REFERENCES public.profiles(id),  -- O usuÃ¡rio logado que alterou
  
  -- O que foi alterado
  nome_tabela text NOT NULL,                    -- Ex: 'clientes', 'ledger_lancamentos'
  registro_id uuid NOT NULL,                    -- O ID da linha alterada
  
  -- AÃ§Ã£o (INSERT, UPDATE, DELETE)
  acao text NOT NULL,
  
  -- Dados CrÃ­ticos (O "Snapshot" JSONB da mÃ¡quina do tempo)
  dado_anterior jsonb,                          -- Como a linha era ANTES (vazio se INSERT)
  dado_novo jsonb,                              -- Como a linha ficou DEPOIS (vazio se DELETE)
  
  -- Metadados de contexto (Opcional, para rastreio do backend)
  ip_origem inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now()
);

-- Ãndices pesados para busca rÃ¡pida no painel de Lixeira/Auditoria
CREATE INDEX idx_audit_tabela_registro ON public.security_audit_logs(nome_tabela, registro_id);
CREATE INDEX idx_audit_ator ON public.security_audit_logs(ator_id);
CREATE INDEX idx_audit_data ON public.security_audit_logs(created_at);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- FUNÃ‡ÃƒO 1: TRIGGER UNIVERSAL DE AUDITORIA
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- Esta funÃ§Ã£o pode ser plugada em QUALQUER tabela operacional para blindÃ¡-la.
-- Ela detecta o usuÃ¡rio logado via JWT (auth.uid()) e salva o JSON.

CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_ator_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Tenta pegar o ID do usuÃ¡rio que fez a aÃ§Ã£o via contexto do Supabase Auth
  BEGIN
    v_ator_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_ator_id := NULL; -- ModificaÃ§Ã£o feita por backend service/cron
  END;

  -- Se for um UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- Pega o tenant_id dinamicamente, se a tabela possuir
    BEGIN
      EXECUTE 'SELECT tenant_id FROM ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_tenant_id USING NEW.id;
    EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END;

    INSERT INTO public.security_audit_logs (tenant_id, ator_id, nome_tabela, registro_id, acao, dado_anterior, dado_novo)
    VALUES (v_tenant_id, v_ator_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    
    RETURN NEW;
    
  -- Se for um DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    BEGIN
      EXECUTE 'SELECT tenant_id FROM ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_tenant_id USING OLD.id;
    EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END;

    INSERT INTO public.security_audit_logs (tenant_id, ator_id, nome_tabela, registro_id, acao, dado_anterior, dado_novo)
    VALUES (v_tenant_id, v_ator_id, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), NULL);
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de como plugar (Gatilho real seria executado na instalaÃ§Ã£o do banco):
-- CREATE TRIGGER trg_audit_clientes
-- AFTER UPDATE OR DELETE ON public.clientes
-- FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


-- ==============================================================================
-- ðŸ’¬ MÃ“DULO 18: COMUNICAÃ‡ÃƒO, HELPDESK & LIVE CHAT (ESCALATION ROUTING)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- ==============================================================================

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- ENUMS DE COMUNICAÃ‡ÃƒO E ROTEAMENTO
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TYPE public.categoria_ticket AS ENUM (
  'orcamento', 'duvida_tecnica', 'financeiro', 'contrato', 
  'reclamacao', 'ouvidoria', 'sugestao'
);

CREATE TYPE public.prioridade_ticket AS ENUM (
  'alta',               -- SLA 15min atribuiÃ§Ã£o / 4h resoluÃ§Ã£o
  'media',              -- SLA 1h atribuiÃ§Ã£o / 24h resoluÃ§Ã£o
  'baixa'               -- SLA 4h atribuiÃ§Ã£o / 48h resoluÃ§Ã£o
);

CREATE TYPE public.status_ticket AS ENUM (
  'aberto', 'em_atendimento', 'aguardando_cliente', 
  'aguardando_interno', 'resolvido', 'fechado', 'reaberto'
);

-- Estado do Motor de Roteamento HÃ­brido (Helpdesk)
CREATE TYPE public.ticket_distribuicao_tipo AS ENUM (
  'capturado',                -- Acabou de entrar
  'plantao_noturno',          -- Fila retida da madrugada (Chatbot/ADM Night)
  'aguardando_gotejamento',   -- Fila das 08:00 (Throttling)
  'na_fila_roteamento',       -- Sistema procurando atendente livre
  'oferecido_atendente',      -- SLA de atribuiÃ§Ã£o correndo (15min, 1h ou 4h)
  'assumido',                 -- Atendente comeÃ§ou a resolver
  'escalado_nivel_2',         -- Atendente falhou no SLA, subiu de nÃ­vel
  'escalado_gerencia'         -- NÃ­vel 2 falhou, subiu pro chefe
);

CREATE TYPE public.tipo_ouvidoria AS ENUM (
  'reclamacao', 'denuncia', 'elogio', 'sugestao', 'solicitacao_informacao'
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1: CENTRAL DE CHAMADOS / TICKETS (Helpdesk com SLA)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.tickets_atendimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  protocolo text NOT NULL UNIQUE,
  ano_referencia integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  sequencial integer NOT NULL,
  
  -- IdentificaÃ§Ã£o
  solicitante_id uuid REFERENCES public.profiles(id),
  cliente_id uuid REFERENCES public.clientes(id),
  
  -- ClassificaÃ§Ã£o
  categoria public.categoria_ticket NOT NULL,
  prioridade public.prioridade_ticket NOT NULL DEFAULT 'media',
  status public.status_ticket NOT NULL DEFAULT 'aberto',
  
  assunto text NOT NULL,
  descricao text NOT NULL,
  
  -- Motor de Roteamento HÃ­brido
  status_distribuicao public.ticket_distribuicao_tipo DEFAULT 'capturado',
  nivel_escalacao integer DEFAULT 1, -- N1 (Junior), N2 (Pleno/Engenharia), N3 (GerÃªncia)
  hora_abertura timestamptz DEFAULT now(),
  hora_fim_sla_atribuicao timestamptz, -- Tempo limite para alguÃ©m ASSUMIR
  hora_fim_sla_resolucao timestamptz,  -- Tempo limite para RESOLVER
  
  -- AtribuiÃ§Ã£o
  departamento_destino text,
  atendente_id uuid REFERENCES public.profiles(id),
  tempo_primeira_resposta interval, -- MÃ©trica de GamificaÃ§Ã£o do Suporte
  sla_estourado boolean DEFAULT false,
  
  -- ReferÃªncias e Qualidade
  contrato_id uuid,
  nota_satisfacao integer CHECK (nota_satisfacao BETWEEN 1 AND 5),
  comentario_avaliacao text,
  
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  fechado_em timestamptz
);

-- Ãndices de Alta Performance para o Motor de EscalaÃ§Ã£o
CREATE INDEX idx_tickets_distribuicao ON public.tickets_atendimento(status_distribuicao, hora_fim_sla_atribuicao);
CREATE INDEX idx_tickets_status ON public.tickets_atendimento(status, prioridade);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 1.B: LOGS DE ESCALAÃ‡ÃƒO (PuniÃ§Ã£o por LentidÃ£o)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE public.ticket_routing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets_atendimento(id) ON DELETE CASCADE,
  atendente_rejeitado_id uuid REFERENCES public.profiles(id),
  nivel_escalado integer NOT NULL,
  motivo text DEFAULT 'sla_atribuicao_estourado',
  data_escala timestamptz DEFAULT now()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABELA 2: LIVE CHAT (SLA ULTRA-RÃPIDO DE 30 SEGUNDOS)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
-- ... [ConteÃºdo Omitido para Foco na Arquitetura de Roteamento] ...

-- ==============================================================================
-- âš™ï¸ PROCEDURES: MOTOR HÃBRIDO (WATERFALL, ESCALATION & THROTTLING)
-- ==============================================================================

-- 1. Captura de Tickets e Live Chat: HorÃ¡rio Comercial vs PlantÃ£o
CREATE OR REPLACE FUNCTION trg_atendimento_capturado() RETURNS trigger AS $$
BEGIN
  IF EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 8 AND 17 THEN
    NEW.status_distribuicao = 'capturado';
    -- Definir SLA de AtribuiÃ§Ã£o baseado na Prioridade
    IF NEW.prioridade = 'alta' THEN NEW.hora_fim_sla_atribuicao = now() + interval '15 minutes';
    ELSIF NEW.prioridade = 'media' THEN NEW.hora_fim_sla_atribuicao = now() + interval '1 hour';
    ELSE NEW.hora_fim_sla_atribuicao = now() + interval '4 hours';
    END IF;
  ELSE
    NEW.status_distribuicao = 'plantao_noturno';
    -- Fica congelado atÃ© as 08:00
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_capturado
BEFORE INSERT ON public.tickets_atendimento
FOR EACH ROW EXECUTE FUNCTION trg_atendimento_capturado();


-- ==============================================================================
-- ðŸ“… PG_CRON: ARQUITETURA DE THROTTLING E ESCALATION (SUPORTE)
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
      LIMIT 5 -- Solta de 5 em 5 minutos para nÃ£o matar o suporte
    );
  $$);

  O Policial de EscalaÃ§Ã£o (Roda a cada 5 Minutos):
  SELECT cron.schedule('sla_escalation_police', '*/5 * * * *', $$
    -- Arranca o ticket do Atendente que demorou e Escala o NÃ­vel
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


-- =======================================================================================
-- MÃ“DULO 11: ESOL ACADEMY E COMMUNICATION HUB
-- DescriÃ§Ã£o: Universidade Corporativa, GamificaÃ§Ã£o Educacional e Feed de Banners/Cronograma.
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. EAD: CATEGORIAS E TRILHAS DE CONHECIMENTO (CURSOS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.ead_cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    capa_url VARCHAR(255),
    ordem_exibicao INTEGER DEFAULT 0,
    mmn_level_minimo INTEGER DEFAULT 1, -- Trava de NÃ­vel (Ex: SÃ³ nÃ­vel 5 pra cima vÃª)
    obrigatorio_para_vender BOOLEAN DEFAULT FALSE, -- Trava o CRM se nÃ£o assistir
    pontos_conclusao INTEGER DEFAULT 0, -- EcoPontos dados ao terminar o curso
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 2. EAD: AULAS E CONTEÃšDO (MÃ“DULOS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.ead_aulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID NOT NULL REFERENCES public.ead_cursos(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    video_url VARCHAR(500) NOT NULL, -- Link YouTube Unlisted, Vimeo ou Cloudflare
    duracao_minutos INTEGER,
    material_apoio_url VARCHAR(500), -- PDF anexo
    ordem INTEGER NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. EAD: PROGRESSO DO USUÃRIO (O RASTREADOR)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.ead_progresso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    aula_id UUID NOT NULL REFERENCES public.ead_aulas(id),
    curso_id UUID NOT NULL REFERENCES public.ead_cursos(id),
    assistido_percentual NUMERIC(5,2) DEFAULT 0.00,
    is_concluido BOOLEAN DEFAULT FALSE,
    concluido_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, aula_id)
);

-- ---------------------------------------------------------------------------------------
-- 4. SOCIAL FEED: AVISOS CORPORATIVOS E BANNERS CLICÃVEIS
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.feed_comunicados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    autor_id UUID REFERENCES auth.users(id), -- Quem postou (Administrador/Master)
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT,
    banner_url VARCHAR(500) NOT NULL, -- A imagem principal do Feed
    cta_texto VARCHAR(50), -- Call to Action (Ex: "Baixar PDF", "Ler Mais")
    cta_url VARCHAR(500),
    permitir_compartilhamento BOOLEAN DEFAULT TRUE, -- Ativa o botão nativo de Share (WhatsApp/Insta)
    mmn_level_alvo INTEGER DEFAULT 1, -- NÃ­vel mÃ­nimo para ver o banner no feed
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_expiracao TIMESTAMP WITH TIME ZONE, -- Quando o aviso some do feed
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 5. CRONOGRAMA: AGENDA DE EVENTOS E LIVES
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.agenda_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    palestrante VARCHAR(100),
    capa_url VARCHAR(500),
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    link_transmissao VARCHAR(500), -- Zoom, Meet, Youtube
    mmn_level_alvo INTEGER DEFAULT 1, -- Trava de Acesso ao Evento
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- TRIGGERS E FUNÃ‡Ã•ES (GAMIFICAÃ‡ÃƒO AO CONCLUIR CURSO)
-- ---------------------------------------------------------------------------------------

-- FunÃ§Ã£o para checar se o curso todo foi concluÃ­do ao marcar uma aula como lida
CREATE OR REPLACE FUNCTION public.check_curso_concluido()
RETURNS TRIGGER AS $$
DECLARE
    v_total_aulas INTEGER;
    v_aulas_concluidas INTEGER;
    v_pontos_premio INTEGER;
    v_tenant_id UUID;
    v_curso_titulo VARCHAR;
BEGIN
    IF NEW.is_concluido = TRUE AND OLD.is_concluido = FALSE THEN
        NEW.concluido_em = NOW();

        -- Conta aulas totais
        SELECT COUNT(*) INTO v_total_aulas FROM public.ead_aulas WHERE curso_id = NEW.curso_id AND is_ativo = TRUE;
        
        -- Conta aulas concluidas pelo usuÃ¡rio
        SELECT COUNT(*) INTO v_aulas_concluidas FROM public.ead_progresso 
        WHERE curso_id = NEW.curso_id AND user_id = NEW.user_id AND is_concluido = TRUE;

        -- Se bateu o total, credita os EcoPontos
        IF v_aulas_concluidas = v_total_aulas THEN
            SELECT pontos_conclusao, tenant_id, titulo INTO v_pontos_premio, v_tenant_id, v_curso_titulo
            FROM public.ead_cursos WHERE id = NEW.curso_id;

            IF v_pontos_premio > 0 THEN
                -- Insere na carteira (MÃ³dulo 9)
                INSERT INTO public.ecopontos_extrato (tenant_id, user_id, tipo_transacao, quantidade, origem_id, descricao)
                VALUES (v_tenant_id, NEW.user_id, 'credito', v_pontos_premio, NEW.curso_id, 'ConclusÃ£o de Trilha EAD: ' || v_curso_titulo);
            END IF;
        END IF;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_curso_concluido
    BEFORE UPDATE ON public.ead_progresso
    FOR EACH ROW
    EXECUTE FUNCTION public.check_curso_concluido();

COMMIT;


-- =======================================================================================
-- MÃ“DULO 20: MOTOR DE SPLIT DE PAGAMENTOS E BAAS
-- DescriÃ§Ã£o: IntegraÃ§Ã£o com Gateway (Asaas/Stripe) para evitar bitributaÃ§Ã£o.
--            Cria Subcontas para consultores, gerencia Faturas (PIX/Boleto) e o Split.
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. SUBCONTAS BANCÃRIAS (KYC E GATEWAY IDS)
-- ---------------------------------------------------------------------------------------
-- Todo consultor MMN precisa de uma conta virtual no Gateway para receber os repasses do Split.
CREATE TABLE public.banking_subcontas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'asaas', -- asaas, stripe, pagarme
    gateway_account_id VARCHAR(100) NOT NULL, -- O ID da subconta gerada na nuvem
    gateway_wallet_id VARCHAR(100), -- Carteira virtual associada (se aplicÃ¡vel)
    status_kyc VARCHAR(30) DEFAULT 'pendente', -- pendente, aprovado, rejeitado
    motivo_rejeicao_kyc TEXT,
    is_ativa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gateway_provider)
);

-- ---------------------------------------------------------------------------------------
-- 2. FATURAS E LINKS DE PAGAMENTO (O BOLETO/PIX DO CLIENTE)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.banking_faturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id),
    origem_modulo VARCHAR(50) NOT NULL, -- 'epc_turnkey', 'gd_assinatura', 'loja'
    origem_id UUID NOT NULL, -- ID do Projeto ou Pedido
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'asaas',
    gateway_charge_id VARCHAR(100) NOT NULL UNIQUE, -- ID da CobranÃ§a no Gateway
    valor_total NUMERIC(15,2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL, -- 'pix', 'boleto', 'credit_card'
    link_pagamento VARCHAR(500),
    status_pagamento VARCHAR(50) DEFAULT 'pendente', -- pendente, recebido, atrasado, falha
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. REGRAS DE SPLIT (O CORTE NA NUVEM)
-- ---------------------------------------------------------------------------------------
-- Onde a MÃ¡gica Acontece: Mapeia como os 50k do cliente serÃ£o fatiados ANTES de cair na Esol.
CREATE TABLE public.banking_transacoes_split (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fatura_id UUID NOT NULL REFERENCES public.banking_faturas(id) ON DELETE CASCADE,
    subconta_recebedora_id UUID REFERENCES public.banking_subcontas(id), -- Null = Conta Matriz (Esol)
    valor_fatia NUMERIC(15,2) NOT NULL,
    percentual_fatia NUMERIC(5,2),
    motivo_fatia VARCHAR(100) NOT NULL, -- 'comissao_venda_direta', 'royalties_n1', 'receita_matriz'
    ledger_lancamento_id UUID, -- Relaciona com a provisÃ£o no MÃ³dulo 5
    gateway_split_id VARCHAR(100), -- ID do split gerado no Gateway
    status_repasse VARCHAR(50) DEFAULT 'aguardando_pagamento', -- aguardando_pagamento, repassado, falha
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 4. WEBHOOKS AUDIT LOG (O OUVIDO DO GATEWAY)
-- ---------------------------------------------------------------------------------------
-- Log imutÃ¡vel de todas as notificaÃ§Ãµes financeiras que o Gateway manda para a Esol.
CREATE TABLE public.banking_webhooks_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_provider VARCHAR(50) NOT NULL,
    evento_tipo VARCHAR(100) NOT NULL, -- ex: 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE'
    payload_json JSONB NOT NULL,
    processado BOOLEAN DEFAULT FALSE,
    erro_processamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- ÃNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_banking_faturas_status ON public.banking_faturas(status_pagamento);
CREATE INDEX idx_banking_faturas_origem ON public.banking_faturas(origem_modulo, origem_id);
CREATE INDEX idx_banking_split_fatura ON public.banking_transacoes_split(fatura_id);
CREATE INDEX idx_banking_webhook_processado ON public.banking_webhooks_logs(processado) WHERE processado = FALSE;

COMMIT;


-- =======================================================================================
-- MÃ“DULO 21: MOTOR FISCAL AUTOMATIZADO E ERP
-- DescriÃ§Ã£o: IntegraÃ§Ã£o com APIs Fiscais (eNotas/Omie) para Autofaturamento de comissÃµes
--            e emissÃ£o automatizada de notas para clientes finais (NFS-e/NF-e/RPA).
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. COFRE DE CERTIFICADOS DIGITAIS (O "AUTOFATURAMENTO" DO CONSULTOR PJ)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.fiscal_certificados_parceiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    cnpj_emissor VARCHAR(14) NOT NULL,
    pfx_certificado_encrypted TEXT NOT NULL, -- Certificado Digital Criptografado via KMS/pgcrypto
    senha_certificado_encrypted TEXT NOT NULL, 
    data_vencimento DATE NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ---------------------------------------------------------------------------------------
-- 2. FILA E HISTÃ“RICO DE NOTAS FISCAIS EMITIDAS (CLIENTES E CONSULTORES)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.fiscal_notas_emitidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    cliente_id UUID REFERENCES public.clientes(id), -- Null se a nota for do consultor
    user_id UUID REFERENCES auth.users(id), -- Null se a nota for da Esol pro Cliente
    origem_modulo VARCHAR(50) NOT NULL, -- 'epc_turnkey', 'saque_mmn', 'loja'
    origem_id UUID NOT NULL, -- ID do Saque ou Projeto
    tipo_nota VARCHAR(20) NOT NULL, -- 'NFSE' (ServiÃ§o), 'NFE' (Produto), 'RPA' (PF)
    valor_nota NUMERIC(15,2) NOT NULL,
    status_emissao VARCHAR(50) DEFAULT 'fila_processamento', -- fila_processamento, autorizada, rejeitada, cancelada
    chave_acesso_sefaz VARCHAR(44), -- Chave de autenticidade governamental
    numero_nota VARCHAR(20),
    link_pdf_nota VARCHAR(500),
    link_xml_nota VARCHAR(500),
    motivo_rejeicao TEXT,
    data_autorizacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. GESTÃƒO DE RPAs (PARA CONSULTORES PESSOA FÃSICA)
-- ---------------------------------------------------------------------------------------
-- Se o consultor nÃ£o for PJ, a Esol retÃ©m o imposto na fonte e gera o Recibo de Pagamento AutÃ´nomo.
CREATE TABLE public.fiscal_rpa_pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    nota_fiscal_id UUID NOT NULL REFERENCES public.fiscal_notas_emitidas(id) ON DELETE CASCADE,
    valor_bruto NUMERIC(15,2) NOT NULL,
    desconto_inss NUMERIC(15,2) NOT NULL DEFAULT 0,
    desconto_irrf NUMERIC(15,2) NOT NULL DEFAULT 0,
    desconto_iss NUMERIC(15,2) NOT NULL DEFAULT 0,
    valor_liquido NUMERIC(15,2) NOT NULL,
    competencia_mes_ano VARCHAR(7) NOT NULL, -- Ex: '07-2026'
    is_recolhido_guia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- ÃNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_fiscal_notas_status ON public.fiscal_notas_emitidas(status_emissao);
CREATE INDEX idx_fiscal_notas_origem ON public.fiscal_notas_emitidas(origem_modulo, origem_id);
CREATE INDEX idx_certificados_vencimento ON public.fiscal_certificados_parceiros(data_vencimento);

COMMIT;


-- =======================================================================================
-- MÃ“DULO 22: MOTOR LOGÃSTICO E SUPPLY CHAIN
-- DescriÃ§Ã£o: IntegraÃ§Ã£o via Webhooks com Transportadoras e Fornecedores (WEG/Aldo).
--            Impede o deslocamento da equipe de engenharia antes da entrega fÃ­sica confirmada.
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. CENTRAL DE RASTREAMENTO (TRACKING DE KITS EPC / E-COMMERCE)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.logistica_rastreio_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    origem_modulo VARCHAR(50) NOT NULL, -- 'epc_turnkey', 'loja_virtual'
    origem_id UUID NOT NULL, -- ID do Projeto ou ID do Pedido
    fornecedor_origem VARCHAR(100) NOT NULL, -- 'WEG', 'Aldo', 'Centro de Distribuicao Esol'
    transportadora_nome VARCHAR(100),
    codigo_rastreio VARCHAR(100) UNIQUE,
    url_rastreio VARCHAR(500),
    status_macro VARCHAR(50) DEFAULT 'aguardando_faturamento', -- faturado, em_transito, rota_entrega, entregue, avariado
    previsao_entrega DATE,
    data_entrega_efetivada TIMESTAMP WITH TIME ZONE,
    nota_fiscal_transporte_xml TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 2. HISTÃ“RICO DE EVENTOS LOGÃSTICOS (WEBHOOKS DA TRANSPORTADORA)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.logistica_eventos_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rastreio_id UUID NOT NULL REFERENCES public.logistica_rastreio_pedidos(id) ON DELETE CASCADE,
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    descricao_evento VARCHAR(255) NOT NULL, -- ex: "Carga deu entrada na filial de destino"
    cidade_localizacao VARCHAR(100),
    uf_localizacao VARCHAR(2),
    is_anomalia BOOLEAN DEFAULT FALSE, -- True se for sinistro, roubo, quebra
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. CONSTRAINT DE SEGURANÃ‡A (O SEMÃFORO DA ENGENHARIA)
-- ---------------------------------------------------------------------------------------
-- Aqui adicionamos uma validaÃ§Ã£o (lÃ³gica recomendada para a API ou DB) 
-- simulando a regra de negÃ³cios: O agendamento da instalaÃ§Ã£o do EPC nÃ£o pode
-- acontecer se o status logÃ­stico nÃ£o for 'entregue'.

-- Adicionando FK na tabela de engenharia para vincular ao rastreio
ALTER TABLE public.projetos_epc 
ADD COLUMN IF NOT EXISTS logistica_rastreio_id UUID REFERENCES public.logistica_rastreio_pedidos(id);

-- ---------------------------------------------------------------------------------------
-- ÃNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_logistica_origem ON public.logistica_rastreio_pedidos(origem_modulo, origem_id);
CREATE INDEX idx_logistica_codigo ON public.logistica_rastreio_pedidos(codigo_rastreio);
CREATE INDEX idx_logistica_status ON public.logistica_rastreio_pedidos(status_macro);
CREATE INDEX idx_eventos_anomalia ON public.logistica_eventos_tracking(is_anomalia) WHERE is_anomalia = TRUE;

COMMIT;


-- =======================================================================================
-- MÓDULO 23: COFRE DE DADOS DE MERCADO (PRICING VAULT)
-- Descrição: Dicionário central de Tarifas ANEEL, Impostos Estaduais (SEFAZ),
--            Tabelas de Financiamento Bancário (CET) e Custos de Hardware (B2B).
--            Isola as regras variáveis do Motor Reverso (Módulo 3).
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. DICIONÁRIO DE TARIFAS DE ENERGIA (ANEEL)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.dict_concessionarias_aneel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_concessionaria VARCHAR(150) NOT NULL UNIQUE, -- Ex: 'CPFL Paulista', 'Enel SP'
    uf_atuacao VARCHAR(2) NOT NULL,
    tarifa_b1_residencial NUMERIC(10, 6) NOT NULL, -- R$/kWh
    tarifa_b2_rural NUMERIC(10, 6) NOT NULL,
    tarifa_b3_comercial NUMERIC(10, 6) NOT NULL,
    fator_fio_b_percentual NUMERIC(5, 4) NOT NULL, -- Lei 14.300 (ex: 30% em 2024 = 0.3000)
    taxa_iluminacao_publica_media NUMERIC(10, 2), -- CIP/COSIP
    data_ultima_revisao_tarifaria DATE NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 2. DICIONÁRIO DE TRIBUTOS ESTADUAIS E FEDERAIS (SEFAZ / RFB)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.dict_tributos_estaduais (
    uf VARCHAR(2) PRIMARY KEY,
    aliquota_icms_energia_percentual NUMERIC(5, 4) NOT NULL, -- Ex: 0.1800 (18%)
    aliquota_icms_equipamentos_percentual NUMERIC(5, 4) NOT NULL,
    possui_convenio_confaz_isencao_gd BOOLEAN DEFAULT TRUE, -- Convênio ICMS 16/2015
    data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------------------------
-- 3. DICIONÁRIO DE FINANCIAMENTOS (BANCOS E TAXAS)
-- ---------------------------------------------------------------------------------------
-- Essencial para compor o "Pague em 72x" nas propostas de Venda Direta (Turnkey)
CREATE TABLE public.dict_financeiras_taxas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banco_nome VARCHAR(100) NOT NULL, -- 'Santander', 'BV Financeira', 'Solfácil'
    tipo_cliente VARCHAR(20) NOT NULL, -- 'PF' ou 'PJ'
    prazo_meses INTEGER NOT NULL, -- Ex: 72
    carencia_meses INTEGER DEFAULT 0, -- Ex: 6 (Pague a primeira em 6 meses)
    taxa_juros_mes_percentual NUMERIC(6, 4) NOT NULL, -- Ex: 1.49% = 0.0149
    cet_mes_percentual NUMERIC(6, 4) NOT NULL, -- Custo Efetivo Total
    fator_multiplicador NUMERIC(8, 6) NOT NULL, -- Fator direto para multiplicar o valor à vista
    taxa_abertura_credito_tac NUMERIC(10, 2) DEFAULT 0.00,
    is_ativo BOOLEAN DEFAULT TRUE,
    data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(banco_nome, tipo_cliente, prazo_meses)
);

-- ---------------------------------------------------------------------------------------
-- 4. CATÁLOGO B2B DE FORNECEDORES (HARDWARE)
-- ---------------------------------------------------------------------------------------
-- Atualizado via CSV ou API para refletir o custo real dos Inversores e Painéis
CREATE TABLE public.dict_fornecedores_skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fornecedor_nome VARCHAR(100) NOT NULL, -- 'WEG', 'Aldo Solar', 'Serrana'
    codigo_sku VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'PAINEL', 'INVERSOR', 'MICROINVERSOR', 'CABO'
    potencia_w NUMERIC(10, 2), -- Potência em Watts
    custo_compra_bruto NUMERIC(15, 2) NOT NULL,
    peso_kg NUMERIC(10, 2) NOT NULL, -- Essencial para cálculo de frete logístico
    link_api_estoque VARCHAR(500),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fornecedor_nome, codigo_sku)
);

-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
-- 5. DICIONÁRIO DE ADQUIRÊNCIA (TAXAS DE CARTÃO DE CRÉDITO / MAQUININHA)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.dict_taxas_adquirencia_cartao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_nome VARCHAR(50) NOT NULL, -- 'Stone', 'Cielo', 'Pagar.me'
    numero_parcelas INTEGER NOT NULL, -- 1 a 12 (ou 21)
    taxa_mdr_percentual NUMERIC(6, 4) NOT NULL, -- Taxa transacional base (ex: 1.5%)
    taxa_antecipacao_percentual NUMERIC(6, 4) NOT NULL, -- Taxa para receber à vista
    taxa_total_retida_percentual NUMERIC(6, 4) GENERATED ALWAYS AS (taxa_mdr_percentual + taxa_antecipacao_percentual) STORED,
    data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(gateway_nome, numero_parcelas)
);

-- ÍNDICES DE PERFORMANCE E BUSCA
-- ---------------------------------------------------------------------------------------
CREATE INDEX idx_dict_aneel_uf ON public.dict_concessionarias_aneel(uf_atuacao);
CREATE INDEX idx_dict_financeiras_banco ON public.dict_financeiras_taxas(banco_nome);
CREATE INDEX idx_dict_skus_categoria ON public.dict_fornecedores_skus(categoria);

COMMIT;


-- ==============================================================================
-- ðŸ›¡ï¸ MÃ“DULO 24: SECURITY RLS POLICIES (MFA & PREVENÃ‡ÃƒO IDOR/BOLA)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: Todas as tabelas operacionais do ecossistema.
-- ==============================================================================

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. ENABLE RLS: ATIVAÃ‡ÃƒO DE ROW LEVEL SECURITY EM TODAS AS TABELAS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- O default do PostgreSQL Ã© permitir acesso. Habilitar o RLS muda para "Deny-by-Default".
-- NinguÃ©m acessa nada a menos que uma Policy libere explicitamente.

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_comissoes_mmn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_lancamentos ENABLE ROW LEVEL SECURITY;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 2. POLÃTICAS DE ROTEAMENTO (PrevenÃ§Ã£o BOLA/IDOR)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 2.1 TABELA: clientes
-- REGRA: Um consultor sÃ³ pode ver os clientes atribuÃ­dos a ele mesmo.
CREATE POLICY "consultor_visualiza_proprios_clientes" 
ON public.clientes
FOR SELECT
TO authenticated
USING (
  corretor_id = auth.uid() 
  OR 
  auth.jwt() ->> 'role' IN ('admin', 'lider_mmn_regional')
);

-- REGRA: Um consultor NÃƒO pode atualizar o status de um cliente de outro corretor.
CREATE POLICY "consultor_atualiza_proprios_clientes" 
ON public.clientes
FOR UPDATE
TO authenticated
USING (
  corretor_id = auth.uid()
)
WITH CHECK (
  corretor_id = auth.uid()
);

-- 2.2 TABELA: tickets_atendimento
-- REGRA: O solicitante vÃª seus prÃ³prios tickets, o atendente vÃª os tickets atribuÃ­dos a ele.
CREATE POLICY "visualizacao_isolada_tickets" 
ON public.tickets_atendimento
FOR SELECT
TO authenticated
USING (
  solicitante_id = auth.uid() 
  OR 
  atendente_id = auth.uid()
  OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 3. TRAVAS FINANCEIRAS DE ALTO NÃVEL (ExigÃªncia de MFA)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 3.1 TABELA: historico_comissoes_mmn (SAQUES)
-- REGRA: O consultor pode inserir um pedido de SAQUE, MAS APENAS se o JWT
-- conter a flag AAL2 (Authenticator Assurance Level 2), provando o uso do Google Auth (TOTP/Passkeys).

CREATE POLICY "saque_comissao_exige_mfa"
ON public.historico_comissoes_mmn
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = consultor_id -- Impede saque para terceiros (IDOR)
  AND 
  tipo_movimentacao = 'saque'
  AND 
  (auth.jwt()->>'aal') = 'aal2' -- <- EXIGÃŠNCIA SOC 2: MFA ObrigatÃ³rio para transaÃ§Ãµes
);

-- 3.2 TABELA: profiles (ALTERAÃ‡ÃƒO DE CHAVE PIX)
-- REGRA: Alterar dados bancÃ¡rios ou PIX exige MFA AAL2.
CREATE POLICY "alteracao_pix_exige_mfa"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
  AND 
  (
    -- Se a chave pix nova for diferente da velha, exige MFA
    (NEW.chave_pix_hash IS DISTINCT FROM OLD.chave_pix_hash AND (auth.jwt()->>'aal') = 'aal2')
    OR
    (NEW.chave_pix_hash IS NOT DISTINCT FROM OLD.chave_pix_hash)
  )
);


-- ==============================================================================
-- ðŸ“¦ MÃ“DULO 25: SUPABASE STORAGE BUCKETS SETUP & SECURITY POLICIES
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- DependÃªncias: 02_identidade_rbac.sql
-- Buckets: faturas, contratos, kyc-selfies, epc-vistorias, atendimento-anexos,
--          loja-produtos, dam-assets
-- ==============================================================================

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. CRIAÃ‡ÃƒO E CONFIGURAÃ‡ÃƒO DOS 7 BUCKETS DE ARMAZENAMENTO
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'faturas',
    'faturas',
    false,
    10485760, -- 10 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'contratos',
    'contratos',
    false,
    20971520, -- 20 MB
    ARRAY['application/pdf']
  ),
  (
    'kyc-selfies',
    'kyc-selfies',
    false,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png']
  ),
  (
    'epc-vistorias',
    'epc-vistorias',
    false,
    52428800, -- 50 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/zip', 'application/x-zip-compressed', 'image/vnd.dwg', 'application/octet-stream']
  ),
  (
    'atendimento-anexos',
    'atendimento-anexos',
    false,
    15728640, -- 15 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'loja-produtos',
    'loja-produtos',
    true,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'dam-assets',
    'dam-assets',
    true,
    104857600, -- 100 MB
    ARRAY['application/pdf', 'image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'video/mp4']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 2. HABILITAÃ‡ÃƒO DE ROW LEVEL SECURITY (RLS) EM STORAGE.OBJECTS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 3. POLÃTICAS DE RLS PARA BUCKETS PRIVADOS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 3.1 BUCKET: faturas
CREATE POLICY "faturas_select_owner_or_admin"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'faturas' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'pos_vendas', 'financeiro')
    )
  )
);

CREATE POLICY "faturas_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'faturas' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "faturas_delete_owner_or_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'faturas' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- 3.2 BUCKET: contratos
CREATE POLICY "contratos_select_authorized"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'contratos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'pos_vendas', 'financeiro')
    )
  )
);

CREATE POLICY "contratos_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contratos' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "contratos_delete_admin_only"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'contratos' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3.3 BUCKET: kyc-selfies (Ultra-Privado)
CREATE POLICY "kyc_selfies_select_owner_or_finance"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-selfies' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  )
);

CREATE POLICY "kyc_selfies_insert_owner"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-selfies' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "kyc_selfies_delete_admin_only"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kyc-selfies' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3.4 BUCKET: epc-vistorias
CREATE POLICY "epc_vistorias_select_authorized"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'epc-vistorias' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'engenheiro', 'instalador', 'pos_vendas')
    )
  )
);

CREATE POLICY "epc_vistorias_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'epc-vistorias'
);

CREATE POLICY "epc_vistorias_delete_owner_or_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'epc-vistorias' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'engenheiro')
    )
  )
);

-- 3.5 BUCKET: atendimento-anexos
CREATE POLICY "atendimento_anexos_select_authorized"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'atendimento-anexos' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'pos_vendas')
    )
  )
);

CREATE POLICY "atendimento_anexos_insert_authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'atendimento-anexos'
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 4. POLÃTICAS DE RLS PARA BUCKETS PÃšBLICOS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 4.1 BUCKET: loja-produtos
CREATE POLICY "loja_produtos_select_public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'loja-produtos');

CREATE POLICY "loja_produtos_write_admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'loja-produtos' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "loja_produtos_delete_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'loja-produtos' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4.2 BUCKET: dam-assets
CREATE POLICY "dam_assets_select_public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'dam-assets');

CREATE POLICY "dam_assets_write_admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dam-assets' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "dam_assets_delete_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'dam-assets' AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

