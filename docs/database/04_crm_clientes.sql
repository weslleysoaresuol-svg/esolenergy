-- ==============================================================================
-- 📋 MÓDULO 04: CRM & GESTÃO DE LEADS
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql (profiles)
-- Tabelas: clientes
-- Enums: cliente_status_tipo, persona_tipo
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

-- Persona do Cockpit de Vendas (Seção 5.6 do Mapa)
-- O consultor seleciona o perfil do cliente para acionar o Recomendador Inteligente
CREATE TYPE public.persona_tipo AS ENUM (
  'A',  -- Residencial Próprio (quer zerar a luz)
  'B',  -- Inquilino / Alugado (sem obra → GD Assinatura)
  'C',  -- PME & Indústria Grupo A (OPEX → MLE)
  'D',  -- Investidor Solar B2B (rentabilidade → Usina)
  'E',  -- Dono de Usina Existente (manutenção → O&M + Limpeza)
  'F',  -- Dono de Lote/Terreno (m² → Simulador Dinâmico)
  'G',  -- Baterias & Nobreak BESS (proteção contra apagões)
  'H',  -- Sobra de Créditos Solares (vender excedente → Shared Grid)
  'I',  -- Comprador de Kits Prontos/Customizados (Integrador)
  'J'   -- Comprador A La Carte de Componentes & EV Chargers
);

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  corretor_id uuid REFERENCES public.profiles(id),

  -- Dados pessoais
  nome_completo text NOT NULL,
  documento text NOT NULL, -- CPF/CNPJ criptografado
  contato_telefone text NOT NULL,
  contato_email text,
  cidade text NOT NULL,
  estado varchar(2) NOT NULL,

  -- Pipeline de vendas
  status public.cliente_status_tipo DEFAULT 'novo' NOT NULL,
  persona public.persona_tipo, -- Perfil identificado pelo consultor (Módulo 2 do Cockpit)
  origem text DEFAULT 'consultor', -- 'consultor', 'landing', 'indicacao', 'esol_club'
  motivo_perda text, -- Preenchido quando status = 'perdido'
  fechado_em timestamptz, -- Data de fechamento (concluido ou contrato_assinado)

  -- Dados de consumo/engenharia (input do consultor)
  consumo_kwh numeric(10,2), -- Consumo médio mensal em kWh (fatura de luz)
  area_lote_m2 numeric(10,2), -- Área do lote/terreno em m² (Persona F)
  valor_estimado numeric(12,2), -- Valor estimado do projeto (pipeline ponderado)
  notas text, -- Observações internas do consultor

  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para consultas do consultor (filtra por corretor_id + status)
CREATE INDEX idx_clientes_corretor_status ON public.clientes(corretor_id, status);
-- Índice para relatórios por persona
CREATE INDEX idx_clientes_persona ON public.clientes(persona) WHERE persona IS NOT NULL;
