-- ==============================================================================
-- 🗄️ ESOL ENERGY — ESQUEMA DE BANCO DE DADOS DDL COMPLETO (v11)
-- Banco de Dados: PostgreSQL (Supabase)
-- Data de Criação: Julho/2026
-- Atualização: v11 — Módulo 11: Engenharia Solar Turnkey EPC (7 Fases)
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

-- Tabela de Gestão de OPEX e Folha de Pagamento Administrativa
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
  codigo_cbo text NOT NULL, -- Código CBO oficial (Ex: '2143-05' Engenheiro, '2410-05' Advogado)
  conselho_classe_registro jsonb DEFAULT '{}'::jsonb, -- Ex: {"orgao": "CREA-SP", "numero": "506948/D"}
  sindicato_enquadramento text, -- Enquadramento no eSocial / CCT
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

-- ==============================================================================
-- 11. MÓDULO DE ENGENHARIA SOLAR TURNKEY — EPC COMPLETO (7 FASES)
-- Integração perfeita com Motor Reverso, Ledger Contábil, Esol Sign e Rede MMN.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 11.1 CAMADA 1: DADOS DE ENGENHARIA (Dimensionamento & BOM)
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
-- 11.2 CAMADA 2: CICLO DE VIDA EPC (Projeto, Instalação & Homologação)
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
  valor_overhead numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  valor_tdtc_mmn numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  lucro_liquido_esol numeric(15, 4) DEFAULT 0.0000 NOT NULL,
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
-- 11.3 CAMADA 3: FINANCEIRO & LEGAL (Financiamento Fintech & Esol Sign EPC)
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
-- 11.4 CAMADA 4: CONTABILIDADE & REDE (Triggers de Integração Automática)
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

