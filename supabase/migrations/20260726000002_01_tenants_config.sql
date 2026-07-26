-- ==============================================================================
-- 🏢 MÓDULO 01: TENANTS, CONFIGURAÇÃO TRIBUTÁRIA & COMERCIAL
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 00_extensions.sql
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
  config_visual jsonb DEFAULT '{}'::jsonb, -- Configurações de cores, logo, favicon
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Configuração Tributária Dinâmica e Migração de CNPJ (MEI -> ME -> EPP -> LTDA)
DO $$ BEGIN
  CREATE TYPE public.regime_tributario_enum AS ENUM (
    'mei',                     -- Microempreendedor Individual (Até R$ 81k)
    'simples_nacional_me',     -- Microempresa (Até R$ 360k)
    'simples_nacional_epp',    -- Empresa de Pequeno Porte (Até R$ 4,8M)
    'lucro_presumido',         -- Lucro Presumido (Até R$ 78M)
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
  historico_migracao jsonb DEFAULT '[]'::jsonb, -- Registro de todas as mudanças de CNPJ/Regime
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Monitoramento de Saúde do Overhead Administrativo (Dashboard dos Donos)
CREATE TABLE IF NOT EXISTS public.config_overhead_dashboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  overhead_percentual_padrao numeric(5, 2) DEFAULT 5.00 NOT NULL,
  teto_alerta_amarelo_percent numeric(5, 2) DEFAULT 85.00 NOT NULL, -- Alerta aos 85%
  teto_trava_vermelha_percent numeric(5, 2) DEFAULT 100.00 NOT NULL, -- Trava aos 100%
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Gestão de Cupons Promocionais e Descontos
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
  categorias_permitidas jsonb DEFAULT '[]'::jsonb, -- IDs das categorias aplicáveis
  uso_maximo_total integer DEFAULT 100,
  usos_realizados integer DEFAULT 0 NOT NULL,
  data_inicio timestamptz DEFAULT now() NOT NULL,
  data_validade timestamptz NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Configuração de Combos e Venda Casada Transparente (Cross-Selling)
CREATE TABLE IF NOT EXISTS public.combos_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome_combo text NOT NULL, -- Ex: 'Combo Proteção Total', 'Combo Eficiência Corporativa'
  persona_destino text NOT NULL, -- 'residencial_proprio', 'inquilino', 'pme_grupo_a', 'usina_existente'
  categorias_incluidas jsonb NOT NULL, -- Array de IDs das categorias (ex: ["cat_1", "cat_6", "cat_8"])
  percentual_desconto_combo numeric(5, 2) DEFAULT 3.00 NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- COMMAND CENTER: PARÂMETROS CONFIGURÁVEIS DO NEGÓCIO
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.parametros_negocio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  chave text NOT NULL,                           -- Ex: 'comissao_n0', 'lucro_alvo', 'overhead'
  valor numeric(15, 4) NOT NULL,                 -- Ex: 15.00, 20.00, 5.00
  unidade text DEFAULT '%',                      -- '%', 'BRL', 'pontos'
  descricao text,                                -- Descrição humana do parâmetro
  
  editavel_por text DEFAULT 'super_admin',       -- Qual nível RBAC pode alterar
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, chave)
);

-- ══════════════════════════════════════════════════════════════
-- COMMAND CENTER: FEATURE FLAGS (Liberação Gradual de Módulos)
-- ══════════════════════════════════════════════════════════════
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
  
  -- Campos de Segurança Legal (Análise de Impacto Aprovada)
  categoria public.feature_flag_categoria NOT NULL DEFAULT 'livre',
  blindado boolean DEFAULT false,                -- Se true, toggle desabilitado na UI
  verificacao_dependencias boolean DEFAULT false, -- Se true, checa registros ativos antes de desligar
  registros_ativos_count integer DEFAULT 0,      -- Quantidade de registros ativos no módulo
  mensagem_bloqueio text,                        -- Ex: 'Módulo protegido pela LGPD Art. 46'
  lei_referencia text,                           -- Ex: 'LGPD Art. 46, CDC Art. 46'
  
  icone text,                                    -- Ícone do módulo na UI
  ordem_exibicao integer DEFAULT 0,              -- Ordem na sidebar
  
  ativado_em timestamptz,                        -- Quando foi ligado pela primeira vez
  ativado_por uuid,                              -- Referência flexível
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, modulo_slug)
);

-- ══════════════════════════════════════════════════════════════
-- COMMAND CENTER: HISTÓRICO DE ALTERAÇÕES DE PARÂMETROS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.parametros_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  chave_parametro text NOT NULL,                 -- Ex: 'comissao_n0'
  valor_anterior numeric(15, 4),
  valor_novo numeric(15, 4) NOT NULL,
  
  alterado_por uuid,
  motivo text,                                   -- Justificativa opcional da alteração
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parametros_hist_chave ON public.parametros_historico(chave_parametro, created_at);

-- ══════════════════════════════════════════════════════════════
-- SEED: TENANT RAIZ PADRÃO DA ESOL ENERGY
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.tenants (id, nome_fantasia, razao_social, cnpj, dominio, config_visual)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Esol Energy',
  'Esol Energy Soluções Sustentáveis LTDA',
  '00.000.000/0001-00',
  'esolenergy.com.br',
  '{"primary_color": "#00E599", "theme": "dark"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
