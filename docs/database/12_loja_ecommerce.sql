-- ==============================================================================
-- 🛒 MÓDULO 12: LOJA ESOL (E-COMMERCE & CATÁLOGO DE PRODUTOS)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 04_crm_clientes.sql
-- Tabelas: produtos_loja, pedidos_loja, itens_pedido
-- Enums: categoria_produto, status_pedido
-- ==============================================================================

-- Categorias de produtos vendidos na Loja Esol (Categoria #2 do MMN)
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

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: CATÁLOGO DE PRODUTOS (SKUs)
-- Gerenciado pelo admin. Cada produto tem preço de custo (do
-- distribuidor) e preço de venda (calculado pelo Motor Reverso)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.produtos_loja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Identificação
  sku text NOT NULL,                -- Ex: 'ESOL-PNL-550W-MONO-001'
  nome text NOT NULL,               -- Ex: 'Painel Solar Canadian 550W Monocristalino'
  descricao text,
  categoria public.categoria_produto NOT NULL,
  marca text,                       -- Ex: 'Canadian Solar', 'Deye', 'BYD'
  modelo text,                      -- Ex: 'CS6W-550MS'
  imagem_url text,                  -- URL da foto no Cloudflare R2

  -- Especificações técnicas (para validação de compatibilidade)
  potencia_wp numeric(10,2),        -- Watts-pico (para painéis e inversores)
  tensao_voc numeric(8,2),          -- Tensão de circuito aberto (V) — painéis
  corrente_isc numeric(8,2),        -- Corrente de curto-circuito (A) — painéis
  mppt_min_v numeric(8,2),          -- Tensão mínima MPPT (V) — inversores
  mppt_max_v numeric(8,2),          -- Tensão máxima MPPT (V) — inversores
  corrente_max_entrada numeric(8,2),-- Corrente máxima de entrada (A) — inversores
  capacidade_kwh numeric(8,2),      -- Capacidade em kWh (baterias)
  potencia_carga_kw numeric(8,2),   -- Potência de carga (kW) — carregadores EV

  -- Preços
  preco_custo numeric(12,2) NOT NULL,    -- Preço FOB do distribuidor
  preco_custo_frete numeric(12,2) DEFAULT 0, -- Frete estimado
  preco_venda numeric(12,2),             -- Calculado pelo Motor Reverso (preço ao consumidor)
  lucro_alvo_pct numeric(5,4) DEFAULT 0.2000, -- Margem de lucro configurável por SKU
  tdtc_pct numeric(5,4) DEFAULT 0.1500,  -- TDTC específico do produto

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

-- ══════════════════════════════════════════════════════════════
-- TABELA 2: PEDIDOS DA LOJA
-- Cada pedido pode ter múltiplos itens. O preço final é
-- recalculado pelo Motor Reverso no checkout
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.pedidos_loja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES public.profiles(id), -- Consultor que vendeu

  -- Identificação
  numero_pedido text NOT NULL, -- Ex: 'PED-2026-0001'
  status public.status_pedido DEFAULT 'carrinho' NOT NULL,

  -- Valores (calculados a partir dos itens)
  subtotal numeric(12,2) DEFAULT 0,         -- Soma dos itens antes de descontos
  desconto_combo numeric(12,2) DEFAULT 0,   -- Desconto de combo (combos_produtos)
  desconto_cupom numeric(12,2) DEFAULT 0,   -- Desconto de cupom (cupons_promocionais)
  desconto_pix numeric(12,2) DEFAULT 0,     -- Desconto PIX à vista
  valor_frete numeric(12,2) DEFAULT 0,
  valor_total numeric(12,2) DEFAULT 0,      -- Subtotal - descontos + frete

  -- Comissão (Motor 1)
  tdtc_total numeric(12,2) DEFAULT 0,       -- Total de comissão da rede
  comissao_consultor numeric(12,2) DEFAULT 0, -- Parte do consultor (N0)

  -- Pagamento
  forma_pagamento text,      -- 'pix', 'cartao_credito', 'boleto', 'financiamento'
  codigo_rastreio text,      -- Código de rastreio dos Correios/transportadora

  -- Endereço de entrega
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

-- ══════════════════════════════════════════════════════════════
-- TABELA 3: ITENS DO PEDIDO
-- Cada item é um produto do catálogo com quantidade e preço
-- ══════════════════════════════════════════════════════════════
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
  preco_total numeric(12,2) NOT NULL, -- quantidade × preco_unitario

  -- Especificações (snapshot no momento da compra)
  potencia_wp numeric(10,2),
  marca text,
  modelo text,

  -- Metadados
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_itens_pedido ON public.itens_pedido(pedido_id);
