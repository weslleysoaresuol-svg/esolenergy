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

DO $$ BEGIN
  CREATE TYPE public.tipo_estrutura_fixacao AS ENUM (
    'telhado_ceramico',
    'telhado_fibrocimento',
    'telhado_metalico',
    'laje_plana',
    'solo_terreno',
    'carport_estacionamento'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tipo_tarifa_energia AS ENUM (
    'b1_residencial',
    'b2_rural',
    'b3_comercial',
    'a4_industrial_media_tensao',
    'a3_industrial_alta_tensao',
    'a3a_industrial'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tipo_tensao_entrada AS ENUM (
    'monofasico_127v',
    'bifasico_220v',
    'trifasico_220v',
    'trifasico_380v'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.dimensionamento_solar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id),
  versao integer DEFAULT 1 NOT NULL,
  aprovado boolean DEFAULT false NOT NULL,

  concessionaria text NOT NULL,
  tipo_tarifa public.tipo_tarifa_energia NOT NULL,
  tensao_entrada public.tipo_tensao_entrada NOT NULL,
  historico_consumo_12m jsonb NOT NULL DEFAULT '[]'::jsonb,
  consumo_medio_mensal_kwh numeric(15, 4) NOT NULL,
  tarifa_kwh_concessionaria numeric(10, 6) NOT NULL,
  fio_b_percentual numeric(5, 2) DEFAULT 0.00 NOT NULL,

  hsp_local numeric(6, 4) NOT NULL,
  performance_ratio numeric(5, 4) DEFAULT 0.8000 NOT NULL,
  potencia_kwp numeric(10, 4) NOT NULL,
  quantidade_modulos integer NOT NULL CHECK (quantidade_modulos > 0),
  potencia_modulo_wp integer NOT NULL,
  tipo_modulo text NOT NULL,
  tipo_inversor text NOT NULL,
  potencia_inversor_kw numeric(10, 4) NOT NULL,
  tipo_estrutura public.tipo_estrutura_fixacao NOT NULL,

  area_terreno_m2 numeric(15, 4),
  area_util_m2 numeric(15, 4),
  fator_aproveitamento_terreno numeric(5, 4) DEFAULT 0.6700,

  geracao_estimada_mensal_kwh numeric(15, 4) NOT NULL,
  geracao_estimada_anual_kwh numeric(15, 4) NOT NULL,
  economia_mensal_reais numeric(15, 4) NOT NULL,
  payback_anos numeric(6, 2) NOT NULL,
  vpl_economia_25_anos numeric(15, 4) NOT NULL,
  co2_evitado_kg_ano numeric(15, 4),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, cliente_id, versao)
);

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.bom_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  dimensionamento_id uuid REFERENCES public.dimensionamento_solar(id) ON DELETE CASCADE,
  tipo_componente public.bom_tipo_componente NOT NULL,
  sku_produto text,
  descricao text NOT NULL,
  marca text NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  potencia_wp integer,
  preco_unitario numeric(15, 4) NOT NULL,
  preco_total numeric(15, 4) NOT NULL,
  distribuidor_parceiro text NOT NULL,
  frete_estimado numeric(15, 4) DEFAULT 0.0000,
  prazo_entrega_dias integer,
  created_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.2 CAMADA 2: CICLO DE VIDA EPC (Projeto, Instalação & Homologação)
-- ──────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.projeto_epc_fase AS ENUM (
    'dimensionamento',
    'procurement_bom',
    'instalacao_campo',
    'homologacao',
    'dre_motor_reverso',
    'financiamento',
    'legal_vault_assinatura',
    'concluido',
    'cancelado'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.projetos_epc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id) NOT NULL,
  dimensionamento_id uuid REFERENCES public.dimensionamento_solar(id),
  numero_projeto text UNIQUE NOT NULL,

  fase_atual public.projeto_epc_fase DEFAULT 'dimensionamento' NOT NULL,

  custo_bom_hardware numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  custo_frete_logistica numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  custo_mao_obra_instalacao numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  custo_art_homologacao numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  custo_total_fixo numeric(15, 4) DEFAULT 0.0000 NOT NULL,

  percentual_impostos numeric(5, 4) DEFAULT 0.0600 NOT NULL,
  percentual_overhead numeric(5, 4) DEFAULT 0.0500 NOT NULL,
  percentual_tdtc numeric(5, 4) DEFAULT 0.1500 NOT NULL,
  percentual_lucro_alvo numeric(5, 4) DEFAULT 0.2000 NOT NULL,

  preco_tabela_ancorado numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  desconto_aplicado_total numeric(15, 4) DEFAULT 0.0000,
  preco_final_venda numeric(15, 4) DEFAULT 0.0000 NOT NULL,

  valor_impostos numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  requer_troca_padrao_concessionaria boolean DEFAULT false,
  valor_custo_padrao_entrada numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  percentual_reserva_garantia_om numeric(5, 4) DEFAULT 0.0150 NOT NULL,
  valor_reserva_garantia_om numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  valor_overhead numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  valor_tdtc_mmn numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  lucro_liquido_matriz numeric(15, 4) DEFAULT 0.0000 NOT NULL,
  margem_liquida_percentual numeric(5, 4) DEFAULT 0.0000 NOT NULL,

  CONSTRAINT chk_margem_piso_epc CHECK (
    fase_atual IN ('dimensionamento', 'procurement_bom', 'cancelado')
    OR margem_liquida_percentual >= 0.2000
  ),

  selo_verde_emitido boolean DEFAULT false NOT NULL,
  selo_verde_data_emissao timestamptz,
  selo_verde_numero_certificado text,

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

  sla_instalacao_dias integer DEFAULT 15,
  sla_homologacao_dias integer DEFAULT 30,
  sla_vistoria_dias integer DEFAULT 45,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projetos_epc_fase ON public.projetos_epc (fase_atual);
CREATE INDEX IF NOT EXISTS idx_projetos_epc_consultor ON public.projetos_epc (consultor_id);

DO $$ BEGIN
  CREATE TYPE public.instalacao_status AS ENUM (
    'agendada',
    'em_andamento',
    'checklist_pendente',
    'aprovada',
    'rejeitada'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.instalacao_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE UNIQUE,
  instalador_id uuid REFERENCES public.profiles(id) NOT NULL,
  engenheiro_art_id uuid REFERENCES public.profiles(id),

  custo_por_wp numeric(10, 4) NOT NULL,
  potencia_instalada_kwp numeric(10, 4) NOT NULL,
  custo_total_mao_obra numeric(15, 4) NOT NULL,

  fotos_estrutura_mecanica jsonb DEFAULT '[]'::jsonb,
  fotos_cabeamento_cc_ca jsonb DEFAULT '[]'::jsonb,
  fotos_inversor_instalado jsonb DEFAULT '[]'::jsonb,
  fotos_string_box jsonb DEFAULT '[]'::jsonb,
  checklist_completo boolean DEFAULT false NOT NULL,

  art_numero_registro text,
  art_conselho text,
  art_uf varchar(2),
  art_arquivo_url text,
  art_data_emissao date,

  laudo_estrutural_url text,
  laudo_aprovado boolean DEFAULT false,

  status public.instalacao_status DEFAULT 'agendada' NOT NULL,
  data_agendamento date,
  data_inicio_obra date,
  data_conclusao_obra date,
  observacoes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE public.homologacao_status AS ENUM (
    'elaborando_projeto',
    'protocolado',
    'parecer_emitido',
    'vistoria_agendada',
    'vistoria_realizada',
    'medidor_instalado',
    'ativo_gerando'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.homologacao_concessionaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE UNIQUE,
  engenheiro_id uuid REFERENCES public.profiles(id),

  concessionaria_nome text NOT NULL,
  concessionaria_uf varchar(2) NOT NULL,
  unidade_consumidora text NOT NULL,

  projeto_executivo_url text,
  memorial_descritivo_url text,
  planta_situacao_url text,

  numero_protocolo_acesso text,
  data_protocolo_acesso date,
  tipo_parecer text,
  data_parecer date,
  observacoes_parecer text,

  data_vistoria_agendada date,
  data_vistoria_realizada date,
  vistoria_aprovada boolean,
  vistoria_observacoes text,

  numero_medidor_antigo text,
  numero_medidor_bidirecional text,
  data_troca_medidor date,

  status public.homologacao_status DEFAULT 'elaborando_projeto' NOT NULL,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.3 CAMADA 3: FINANCEIRO & LEGAL (Financiamento Fintech & Esol Sign EPC)
-- ──────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.financiamento_modalidade AS ENUM (
    'pix_a_vista',
    'cartao_credito',
    'financiamento_bancario',
    'boleto_bancario'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.financiamento_status AS ENUM (
    'analise_credito',
    'aprovado',
    'reprovado',
    'contrato_assinado',
    'liberado',
    'em_pagamento',
    'quitado',
    'inadimplente'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.financiamento_solar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE UNIQUE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,

  modalidade public.financiamento_modalidade NOT NULL,
  banco_parceiro text,

  valor_total_financiado numeric(15, 4) NOT NULL,
  entrada_valor numeric(15, 4) DEFAULT 0.0000,
  numero_parcelas integer,
  taxa_juros_mensal numeric(8, 6),
  valor_parcela_mensal numeric(15, 4),
  carencia_dias integer DEFAULT 0,

  desconto_pix_percentual numeric(5, 4) DEFAULT 0.0000,
  desconto_pix_valor numeric(15, 4) DEFAULT 0.0000,

  score_credito integer,
  data_analise_credito timestamptz,
  motivo_reprovacao text,

  status public.financiamento_status DEFAULT 'analise_credito' NOT NULL,
  data_liberacao_recurso timestamptz,
  data_primeira_parcela date,
  data_ultima_parcela date,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10.4 CAMADA 4: CONTABILIDADE & REDE (Triggers de Integração Automática)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.historico_comissoes_epc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  projeto_epc_id uuid REFERENCES public.projetos_epc(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.profiles(id) NOT NULL,
  nivel_rede integer NOT NULL,
  percentual_aplicado numeric(5, 4) NOT NULL,
  valor_base numeric(15, 4) NOT NULL,
  valor_comissao numeric(15, 4) NOT NULL,
  status text DEFAULT 'pendente' NOT NULL,
  data_pagamento timestamptz,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGER 1: Geração Automática de Lançamentos Contábeis ao Concluir Projeto
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_projeto_epc_concluido_ledger()
RETURNS TRIGGER AS $$
DECLARE
  v_conta_banco uuid;
  v_conta_receita uuid;
  v_conta_despesa_mmn uuid;
  v_conta_comissoes_pagar uuid;
BEGIN
  IF NEW.fase_atual = 'concluido' AND OLD.fase_atual != 'concluido' THEN

    SELECT id INTO v_conta_banco FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '1.1.01.01' LIMIT 1;
    SELECT id INTO v_conta_receita FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '4.1.01.01' LIMIT 1;
    SELECT id INTO v_conta_despesa_mmn FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '5.1.01.01' LIMIT 1;
    SELECT id INTO v_conta_comissoes_pagar FROM public.ledger_contas
      WHERE tenant_id = NEW.tenant_id AND codigo = '2.1.01.01' LIMIT 1;

    IF v_conta_banco IS NOT NULL AND v_conta_receita IS NOT NULL THEN
      INSERT INTO public.ledger_lancamentos (
        tenant_id, descricao, conta_debito_id, conta_credito_id,
        valor, origem_tipo, origem_id
      ) VALUES (
        NEW.tenant_id,
        'Receita de Projeto Turnkey EPC #' || NEW.numero_projeto,
        v_conta_banco,
        v_conta_receita,
        NEW.preco_final_venda - NEW.custo_bom_hardware,
        'faturamento_projeto_epc',
        NEW.id
      );
    END IF;

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

DROP TRIGGER IF EXISTS trg_projeto_epc_concluido_ledger ON public.projetos_epc;
CREATE TRIGGER trg_projeto_epc_concluido_ledger
  BEFORE UPDATE ON public.projetos_epc
  FOR EACH ROW
  WHEN (NEW.fase_atual = 'concluido' AND OLD.fase_atual IS DISTINCT FROM 'concluido')
  EXECUTE FUNCTION public.fn_projeto_epc_concluido_ledger();

-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGER 2: Distribuição Automática de Comissões MMN ao Concluir Projeto
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_projeto_epc_comissao_mmn()
RETURNS TRIGGER AS $$
DECLARE
  v_consultor_rede RECORD;
  v_upline RECORD;
  v_nivel_atual integer;
  v_preco_venda numeric(15, 4);
BEGIN
  IF NEW.fase_atual = 'concluido' AND OLD.fase_atual != 'concluido' THEN
    v_preco_venda := NEW.preco_final_venda;

    INSERT INTO public.historico_comissoes_epc (
      tenant_id, projeto_epc_id, usuario_id, nivel_rede,
      percentual_aplicado, valor_base, valor_comissao, status
    ) VALUES (
      NEW.tenant_id, NEW.id, NEW.consultor_id, 0,
      0.0800, v_preco_venda, v_preco_venda * 0.0800, 'pendente'
    );

    SELECT path, nivel INTO v_consultor_rede
    FROM public.rede_mmn WHERE usuario_id = NEW.consultor_id LIMIT 1;

    IF v_consultor_rede IS NOT NULL THEN
      v_nivel_atual := 0;
      FOR v_upline IN
        SELECT rm.usuario_id, rm.nivel
        FROM public.rede_mmn rm
        WHERE rm.path @> v_consultor_rede.path
          AND rm.usuario_id != NEW.consultor_id
        ORDER BY rm.nivel DESC
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

DROP TRIGGER IF EXISTS trg_projeto_epc_comissao_mmn ON public.projetos_epc;
CREATE TRIGGER trg_projeto_epc_comissao_mmn
  AFTER UPDATE ON public.projetos_epc
  FOR EACH ROW
  WHEN (NEW.fase_atual = 'concluido' AND OLD.fase_atual IS DISTINCT FROM 'concluido')
  EXECUTE FUNCTION public.fn_projeto_epc_comissao_mmn();
