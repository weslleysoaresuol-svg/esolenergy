-- ==============================================================================
-- 🛒 MÓDULO 12: LOJA ESOL (E-COMMERCE & CATÁLOGO DE PRODUTOS)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: produtos_loja, pedidos_loja, itens_pedido
-- Enums: categoria_produto, status_pedido
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE public.categoria_produto AS ENUM (
    'painel_solar',           -- Módulos fotovoltaicos (mono/poli)
    'inversor',               -- Inversores string, micro, híbrido
    'estrutura_fixacao',      -- Trilhos, grampos, parafusos (telhado/solo)
    'string_box',             -- Proteção CC com fusíveis e DPS
    'cabo_conector',          -- Cabos solares, conectores MC4
    'bateria',                -- LiFePO4, lead-acid, BYD, Pylontech
    'carregador_ev',          -- Wallbox 7kW-22kW, carregadores portáteis
    'sensor_iot',             -- Medidores inteligentes, gateways IoT
    'kit_pronto',             -- Combo pré-montado (painéis+inversor+estrutura)
    'kit_personalizado',      -- Kit montado pelo consultor/cliente
    'acessorio'               -- Ferramentas, EPIs, cabos extras
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_pedido AS ENUM (
    'carrinho',               -- Itens selecionados, checkout não iniciado
    'aguardando_pagamento',   -- Checkout realizado, pagamento pendente
    'pago',                   -- Pagamento confirmado
    'separacao',              -- Em separação no distribuidor
    'enviado',                -- Despachado (com código de rastreio)
    'entregue',               -- Recebido pelo cliente
    'instalacao_pendente',    -- Entregue, aguardando instalação
    'concluido',              -- Instalado e funcionando
    'cancelado',              -- Cancelado pelo cliente ou admin
    'devolvido'               -- Devolução processada (CDC Art. 49)
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: CATÁLOGO DE PRODUTOS (SKUs)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.produtos_loja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  sku text NOT NULL,
  nome text NOT NULL,
  descricao text,
  categoria public.categoria_produto NOT NULL,
  marca text,
  modelo text,
  imagem_url text,

  potencia_wp numeric(10,2),
  tensao_voc numeric(8,2),
  corrente_isc numeric(8,2),
  mppt_min_v numeric(8,2),
  mppt_max_v numeric(8,2),
  corrente_max_entrada numeric(8,2),
  capacidade_kwh numeric(8,2),
  potencia_carga_kw numeric(8,2),

  preco_custo numeric(12,2) NOT NULL,
  preco_custo_frete numeric(12,2) DEFAULT 0,
  preco_venda numeric(12,2),
  lucro_alvo_pct numeric(5,4) DEFAULT 0.2000,
  tdtc_pct numeric(5,4) DEFAULT 0.1500,

  estoque_disponivel integer DEFAULT 0,
  estoque_minimo integer DEFAULT 5,
  distribuidor_parceiro text,
  prazo_entrega_dias integer DEFAULT 7,

  ativo boolean DEFAULT true,
  destaque boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_sku ON public.produtos_loja(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos_loja(categoria) WHERE ativo = true;

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: PEDIDOS DA LOJA
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.pedidos_loja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id),

  numero_pedido text NOT NULL,
  status public.status_pedido DEFAULT 'carrinho' NOT NULL,

  subtotal numeric(12,2) DEFAULT 0,
  desconto_combo numeric(12,2) DEFAULT 0,
  desconto_cupom numeric(12,2) DEFAULT 0,
  desconto_pix numeric(12,2) DEFAULT 0,
  valor_frete numeric(12,2) DEFAULT 0,
  valor_total numeric(12,2) DEFAULT 0,

  tdtc_total numeric(12,2) DEFAULT 0,
  comissao_consultor numeric(12,2) DEFAULT 0,

  forma_pagamento text,
  codigo_rastreio text,

  endereco_entrega text,
  cidade_entrega text,
  estado_entrega varchar(2),
  cep_entrega varchar(9),

  cupom_id uuid,
  combo_id uuid,

  data_pedido timestamptz DEFAULT now(),
  data_pagamento timestamptz,
  data_envio timestamptz,
  data_entrega timestamptz,
  data_cancelamento timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON public.pedidos_loja(cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_pedidos_consultor ON public.pedidos_loja(consultor_id, status);

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: ITENS DO PEDIDO
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid REFERENCES public.pedidos_loja(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos_loja(id),

  sku text NOT NULL,
  nome_produto text NOT NULL,
  categoria public.categoria_produto NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric(12,2) NOT NULL,
  preco_total numeric(12,2) NOT NULL,

  potencia_wp numeric(10,2),
  marca text,
  modelo text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itens_pedido ON public.itens_pedido(pedido_id);
