-- ============================================================================
-- ESOL ENERGY PLATFORM - SEED INITIAL DATA MOCK SCRIPT
-- Versão: v8.4 (Homologação E2E & Go-Live Final)
-- ============================================================================

-- 1. TENANT MASTER ESOL ENERGY
INSERT INTO public.tenants_config (
  id,
  razao_social,
  nome_fantasia,
  cnpj,
  aliquota_iss,
  regime_tributario,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Esol Energy Solucoes em Energia Renovavel LTDA',
  'Esol Energy Holding',
  '48912345000190',
  2.00,
  'lucro_presumido',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. PROFILES (ADMIN, ENGENHARIA & CONSULTORES MMN 7 NÍVEIS)
INSERT INTO public.profiles (
  id,
  tenant_id,
  full_name,
  email,
  cpf_cnpj,
  user_role,
  nivel_mmn,
  created_at
) VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Weslley Soares (Admin Master)',
  'admin@esolenergy.com.br',
  '12345678901',
  'admin',
  7,
  NOW()
),
(
  'c2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Ana Paula Silva (Consultor Direto)',
  'ana.paula@esolenergy.com.br',
  '98765432100',
  'consultant',
  1,
  NOW()
),
(
  'c3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Carlos Eduardo Santos (Consultor Nível 2)',
  'carlos.eduardo@esolenergy.com.br',
  '45678912300',
  'consultant',
  2,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. REDE MMN NODES (ESTRUTURA LTREE UNILEVEL)
INSERT INTO public.rede_mmn_nodes (
  id,
  tenant_id,
  profile_id,
  node_path,
  nivel_profundidade,
  vme_percentual,
  created_at
) VALUES
(
  'n1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'a1111111-1111-1111-1111-111111111111',
  'root',
  0,
  0.00,
  NOW()
),
(
  'n2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'c2222222-2222-2222-2222-222222222222',
  'root.ana_paula',
  1,
  28.50,
  NOW()
),
(
  'n3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'c3333333-3333-3333-3333-333333333333',
  'root.ana_paula.carlos_eduardo',
  2,
  12.00,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. HARDWARE CATALOG (HARDWARE SOLAR TIER-1)
INSERT INTO public.hardware_catalog (
  id,
  tenant_id,
  nome_item,
  categoria,
  fabricante,
  potencia_w,
  preco_custo,
  preco_venda,
  created_at
) VALUES
(
  'h1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Painel Fotovoltaico Canadian Solar N-Type TOPCon 575W',
  'modulo_fotovoltaico',
  'Canadian Solar',
  575,
  420.00,
  680.00,
  NOW()
),
(
  'h2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Inversor Trifasico Sungrow Commercial 75kW 380V',
  'inversor_string',
  'Sungrow',
  75000,
  14500.00,
  21800.00,
  NOW()
),
(
  'h3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Kit Gerador Solar WEG Commercial 75.4 kWp Completo',
  'kit_completo',
  'WEG Solar',
  75400,
  112000.00,
  168000.00,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. COURSES ESOL ACADEMY EAD
INSERT INTO public.esol_academy_courses (
  id,
  tenant_id,
  titulo_curso,
  descricao,
  carga_horaria_hs,
  obrigatorio_credenciamento,
  created_at
) VALUES
(
  'ead11111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Formacao de Consultores de Vendas Solar & MMN 2026',
  'Curso obrigatorio para liberação de credenciamento e emissao de contrato Esol Sign.',
  12,
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;
