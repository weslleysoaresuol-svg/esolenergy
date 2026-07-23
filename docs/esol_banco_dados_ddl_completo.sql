-- ==============================================================================
-- 🗄️ ESOL ENERGY — ESQUEMA DE BANCO DE DADOS DDL COMPLETO (v10)
-- Banco de Dados: PostgreSQL (Supabase)
-- Data de Criação: Julho/2026
-- ==============================================================================

-- Habilita extensões obrigatórias
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. ESTRUTURA DE TENANTS (WHITE-LABEL MULTI-TENANCY)
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

-- ==============================================================================
-- 2. IDENTIDADE E CONTROLE DE ACESSO (PROFILES & ROLES)
-- ==============================================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf_cnpj text NOT NULL,
  telefone text,
  avatar_url text,
  contrato_assinado boolean DEFAULT false,
  onboarding_completo boolean DEFAULT false,
  comissao_percent numeric(5, 2) DEFAULT 8.00, -- Margem individual corretor no Motor 1
  dados_bancarios jsonb DEFAULT '{}'::jsonb, -- PIX, Banco, Agência, Conta
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

-- Matriz de Acessos Administrativos (RBAC de 7 Níveis) & Trilha de Auditoria
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
  acao text NOT NULL, -- Ex: 'aprovação_saque_pix', 'alteracao_minuta_juridica', 'revogacao_acesso'
  modulo text NOT NULL, -- Ex: 'financeiro', 'legal_vault', 'acessos'
  detalhes jsonb DEFAULT '{}'::jsonb, -- Payload completo da alteração para auditoria
  ip_origem text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela do Cap Table de Sócios-Administradores Principais
CREATE TABLE public.socios_cap_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  socio_id uuid REFERENCES public.profiles(id) NOT NULL UNIQUE,
  percentual_cotas numeric(5, 2) NOT NULL CHECK (percentual_cotas > 0 AND percentual_cotas <= 100),
  valor_pro_labore numeric(15, 2) DEFAULT 0.00 NOT NULL,
  data_entrada date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Gestão de OPEX e Folha de Pagamento Administrativa
CREATE TYPE public.contrato_regime AS ENUM ('pj_honorario', 'clt', 'prestador_autonomo', 'estagio');

CREATE TABLE public.folha_pagamento_opex (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.profiles(id) NOT NULL,
  regime public.contrato_regime NOT NULL,
  cargo_funcao text NOT NULL,
  remuneracao_base numeric(15, 2) NOT NULL,
  bonus_metas_estimado numeric(15, 2) DEFAULT 0.00,
  dados_contratuais jsonb DEFAULT '{}'::jsonb, -- Anexo de contrato, benefícios, retenções
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 3. HIERARQUIA DE REDE MMN (INDEXAÇÃO LTREE)
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
-- 4. CRM E GESTÃO DE LEADS
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

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id),
  nome_completo text NOT NULL,
  documento text NOT NULL, -- CPF/CNPJ criptografado
  contato_telefone text NOT NULL,
  contato_email text,
  cidade text NOT NULL,
  estado varchar(2) NOT NULL,
  status public.cliente_status_tipo DEFAULT 'novo' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 5. CARTEIRA DE ENERGIA (GD E MLE - CONTRATOS RECORRENTES)
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
  data_protocolo_denuncia date, -- MLE: Prazo de 180 dias de aviso prévio
  historico_faturas jsonb DEFAULT '[]'::jsonb, -- Array de faturas mensais para auditoria
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 6. MOTOR DE CONTRATOS & ASSINATURAS (ESOL SIGN)
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

CREATE TABLE public.assinaturas_esol_sign (
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
-- 7. LEDGER CONTÁBIL (PARTIDA DOBRADA E HASHING ENCADEADO)
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

-- ==============================================================================
-- 8. FLUXO DE CONFORMIDADE E DISTRATOS
-- ==============================================================================

CREATE TABLE public.distratos_conformidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  carteira_energia_id uuid REFERENCES public.carteira_energia(id) ON DELETE CASCADE,
  motivo text NOT NULL,
  descricao text,
  assinatura_distrato_id uuid REFERENCES public.assinaturas_esol_sign(id),
  estorno_comissoes_concluido boolean DEFAULT false,
  status text DEFAULT 'pendente' NOT NULL, -- 'pendente', 'aprovado', 'rejeitado'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 9. TRIGGERS E AUTOMACÕES CONTÁBEIS / SEGURANÇA
-- ==============================================================================

-- 9.1 Atualização Automática de Saldos (Partida Dobrada)
CREATE OR REPLACE FUNCTION public.atualizar_saldos_contas_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Debita valor da conta débito
  UPDATE public.ledger_contas 
  SET saldo = saldo + NEW.valor, updated_at = now()
  WHERE id = NEW.conta_debito_id;

  -- Credita valor na conta crédito (deduz se ativo/despesa, incrementa se passivo/receita)
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

-- 9.2 Geração de Hash Encadeado de Lançamentos
CREATE OR REPLACE FUNCTION public.gerar_hash_lancamento_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_hash_anterior text;
BEGIN
  -- Coleta o hash da última transação do tenant
  SELECT hash_transacao INTO v_hash_anterior
  FROM public.ledger_lancamentos
  WHERE tenant_id = NEW.tenant_id
  ORDER BY data_lancamento DESC, created_at DESC
  LIMIT 1;

  NEW.hash_anterior := COALESCE(v_hash_anterior, 'GENESIS_BLOCK');
  
  -- Calcula o hash SHA-256 concatenando os dados do lançamento
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
-- 10. MÓDULO ESOL CLUB & ECOPONTOS (REFERRALS & LOYALTY LEDGER)
-- ==============================================================================

CREATE TYPE public.ecopontos_status AS ENUM ('pendente', 'disponivel', 'expirado', 'resgatado', 'cancelado');

CREATE TABLE public.ecopontos_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_indicador_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_indicado_id uuid REFERENCES public.clientes(id),
  origem_categoria integer NOT NULL, -- Categoria 1 a 8 do portfólio
  pontos integer NOT NULL CHECK (pontos > 0),
  equivalente_reais numeric(15, 2) NOT NULL,
  status public.ecopontos_status DEFAULT 'pendente' NOT NULL,
  data_liberacao timestamptz,
  data_validade timestamptz NOT NULL, -- Expiração em 31/12 do ano vigente
  streaming_mes_atual integer DEFAULT 1, -- Mês do parcelamento (1 a 10)
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

