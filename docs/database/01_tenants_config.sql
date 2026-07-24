-- ==============================================================================
-- 🏢 MÓDULO 01: TENANTS, CONFIGURAÇÃO TRIBUTÁRIA & COMERCIAL
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 00_extensions.sql
-- Tabelas: tenants, config_tributaria_tenant, config_overhead_dashboard,
--          cupons_promocionais, combos_produtos_esol
-- Enums: regime_tributario_enum, cupom_tipo_desconto
-- ==============================================================================

CREATE TABLE public.tenants (
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
CREATE TYPE public.regime_tributario_enum AS ENUM (
  'mei',                     -- Microempreendedor Individual (Até R$ 81k)
  'simples_nacional_me',     -- Microempresa (Até R$ 360k)
  'simples_nacional_epp',    -- Empresa de Pequeno Porte (Até R$ 4,8M)
  'lucro_presumido',         -- Lucro Presumido (Até R$ 78M)
  'lucro_real'               -- Lucro Real (Grande Porte)
);

CREATE TABLE public.config_tributaria_tenant (
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
CREATE TABLE public.config_overhead_dashboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  overhead_percentual_padrao numeric(5, 2) DEFAULT 5.00 NOT NULL,
  teto_alerta_amarelo_percent numeric(5, 2) DEFAULT 85.00 NOT NULL, -- Alerta aos 85%
  teto_trava_vermelha_percent numeric(5, 2) DEFAULT 100.00 NOT NULL, -- Trava aos 100%
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Gestão de Cupons Promocionais e Descontos
CREATE TYPE public.cupom_tipo_desconto AS ENUM ('porcentagem', 'valor_fixo');

CREATE TABLE public.cupons_promocionais (
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
CREATE TABLE public.combos_produtos_esol (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome_combo text NOT NULL, -- Ex: 'Combo Proteção Total', 'Combo Eficiência Corporativa'
  persona_destino text NOT NULL, -- 'residencial_proprio', 'inquilino', 'pme_grupo_a', 'usina_existente'
  categorias_incluidas jsonb NOT NULL, -- Array de IDs das categorias (ex: ["cat_1", "cat_6", "cat_8"])
  percentual_desconto_combo numeric(5, 2) DEFAULT 3.00 NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);
