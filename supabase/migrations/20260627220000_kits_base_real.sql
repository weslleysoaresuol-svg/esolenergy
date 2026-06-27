-- ============================================================
-- KITS FOTOVOLTAICOS REAIS — Base de mercado 2025/2026
-- Marcas Tier 1: Jinko, Canadian, Trina, BYD | Inversores: Deye, Sungrow, Huawei, GoodWe
-- Preços médios de mercado brasileiro (integrado, sem homologação)
-- Faixas: residencial_pequeno | residencial_grande | comercial_pequeno | comercial_grande | industrial | rural
-- ============================================================

-- Adicionar colunas extras úteis à tabela de kits
ALTER TABLE public.kits_solares
  ADD COLUMN IF NOT EXISTS potencia_modulo_w    integer,
  ADD COLUMN IF NOT EXISTS tecnologia_modulo    text    DEFAULT 'Monocristalino TOPCon',
  ADD COLUMN IF NOT EXISTS eficiencia_modulo    numeric DEFAULT 22.0,
  ADD COLUMN IF NOT EXISTS tipo_inversor        text    DEFAULT 'String On-Grid',
  ADD COLUMN IF NOT EXISTS garantia_modulos_anos integer DEFAULT 25,
  ADD COLUMN IF NOT EXISTS garantia_inversor_anos integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ativo               boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS destaque            boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS consumo_kwh_min     integer,
  ADD COLUMN IF NOT EXISTS consumo_kwh_max     integer;

-- ============================================================
-- 🏠 RESIDENCIAL PEQUENO (80–300 kWh/mês) — 1,5 a 4 kWp
-- ============================================================

INSERT INTO public.kits_solares (
  faixa, nome, potencia_kwp, quantidade_modulos, fabricante_modulos, inversor,
  potencia_modulo_w, tecnologia_modulo, eficiencia_modulo,
  tipo_inversor, garantia_modulos_anos, garantia_inversor_anos,
  preco, destaque, consumo_kwh_min, consumo_kwh_max
) VALUES

-- Kit 1.5 kWp
('residencial_pequeno',
 'Kit Solar 1,5 kWp | 3×550W Jinko | Deye 2kW',
 1.5, 3, 'Jinko Solar 550W N-Type', 'Deye SUN2000-2K',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 8500.00, false, 80, 150),

-- Kit 2 kWp
('residencial_pequeno',
 'Kit Solar 2,0 kWp | 4×555W Canadian | GoodWe 2kW',
 2.0, 4, 'Canadian Solar 555W HiKu7', 'GoodWe GW2000-XS',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid', 25, 10,
 10800.00, false, 120, 220),

-- Kit 2.75 kWp
('residencial_pequeno',
 'Kit Solar 2,75 kWp | 5×550W Risen | Sungrow SG3K',
 2.75, 5, 'Risen RSM144-10-550M', 'Sungrow SG3.0RT',
 550, 'Monocristalino TOPCon', 21.8,
 'String On-Grid', 25, 10,
 13200.00, false, 180, 280),

-- Kit 3.3 kWp — POPULAR RESIDENCIAL PEQUENO
('residencial_pequeno',
 'Kit Solar 3,3 kWp | 6×550W Jinko | Deye 4kW ★',
 3.3, 6, 'Jinko Solar JKM550N-72HL4', 'Deye SUN4000G05',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 15500.00, true, 220, 320),

-- Kit 4 kWp
('residencial_pequeno',
 'Kit Solar 4,0 kWp | 7×575W BYD | Huawei SUN2000-4K',
 4.0, 7, 'BYD BM-LBMC 575W', 'Huawei SUN2000-4KTL-L1',
 575, 'Monocristalino PERC Bifacial', 22.0,
 'String On-Grid', 25, 10,
 19800.00, false, 280, 380),

-- ============================================================
-- 🏠 RESIDENCIAL GRANDE (300–700 kWh/mês) — 4 a 10 kWp
-- ============================================================

-- Kit 5 kWp — MAIS VENDIDO
('residencial_grande',
 'Kit Solar 5,0 kWp | 9×555W Trina | Deye 5kW ★',
 5.0, 9, 'Trina Vertex S+ 555W', 'Deye SUN5000G05',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid', 25, 10,
 23500.00, true, 340, 480),

-- Kit 6 kWp
('residencial_grande',
 'Kit Solar 6,0 kWp | 11×555W Canadian | Sungrow SG5K',
 6.0, 11, 'Canadian Solar 555W HiKu7', 'Sungrow SG5.0RT',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid', 25, 10,
 27800.00, false, 440, 580),

-- Kit 7.15 kWp
('residencial_grande',
 'Kit Solar 7,15 kWp | 13×550W Jinko | Huawei 6K',
 7.15, 13, 'Jinko Solar JKM550N-72HL4', 'Huawei SUN2000-6KTL-M1',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 33200.00, false, 520, 680),

-- Kit 8.25 kWp — POPULAR
('residencial_grande',
 'Kit Solar 8,25 kWp | 15×550W Risen | Deye 8K ★',
 8.25, 15, 'Risen RSM144-10-550M', 'Deye SUN-8K-SG01LP1',
 550, 'Monocristalino TOPCon', 21.8,
 'String On-Grid', 25, 10,
 38500.00, true, 600, 800),

-- Kit 10 kWp
('residencial_grande',
 'Kit Solar 10,0 kWp | 18×555W Canadian | Sungrow SG10K',
 10.0, 18, 'Canadian Solar 555W HiKu7', 'Sungrow SG10RT',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid', 25, 10,
 46500.00, false, 720, 950),

-- Kit 10 kWp Híbrido (com bateria)
('residencial_grande',
 'Kit Solar 10 kWp Híbrido | 18×555W BYD | Deye Híbrido + Bateria',
 10.0, 18, 'BYD BM-LBMC 555W', 'Deye SUN10K-SG01LP1-EU + Bateria 5kWh',
 555, 'Monocristalino PERC Bifacial', 22.0,
 'Híbrido com Armazenamento', 25, 10,
 72000.00, false, 600, 1000),

-- ============================================================
-- 🏢 COMERCIAL PEQUENO (700–2000 kWh/mês) — 10 a 30 kWp
-- ============================================================

-- Kit 12 kWp
('comercial_pequeno',
 'Kit Solar 12 kWp | 21×575W Trina | Sungrow SG15K',
 12.0, 21, 'Trina Vertex S+ 575W', 'Sungrow SG15RT',
 575, 'Monocristalino TOPCon', 22.2,
 'String On-Grid', 25, 10,
 55000.00, false, 850, 1150),

-- Kit 15 kWp — POPULAR COMERCIAL
('comercial_pequeno',
 'Kit Solar 15 kWp | 26×580W Jinko | Huawei 15K ★',
 15.0, 26, 'Jinko Tiger Neo 580W', 'Huawei SUN2000-15KTL-M3',
 580, 'Monocristalino N-Type TOPCon', 23.0,
 'String On-Grid Trifásico', 25, 10,
 68000.00, true, 1050, 1450),

-- Kit 20 kWp
('comercial_pequeno',
 'Kit Solar 20 kWp | 34×590W Canadian | Sungrow SG20K',
 20.0, 34, 'Canadian Solar HiKu7 590W', 'Sungrow SG20RT',
 590, 'Monocristalino TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 88000.00, false, 1400, 1900),

-- Kit 25 kWp
('comercial_pequeno',
 'Kit Solar 25 kWp | 43×580W BYD | Deye 25K Trifásico',
 25.0, 43, 'BYD BM-LBMC 580W', 'Deye SUN-25K-SG01HP3',
 580, 'Monocristalino PERC Bifacial', 22.0,
 'String On-Grid Trifásico', 25, 10,
 108000.00, false, 1750, 2400),

-- Kit 30 kWp
('comercial_pequeno',
 'Kit Solar 30 kWp | 51×590W Trina | Huawei 30K ★',
 30.0, 51, 'Trina Vertex S+ 590W', 'Huawei SUN2000-30KTL-M3',
 590, 'Monocristalino TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 128000.00, true, 2100, 2900),

-- ============================================================
-- 🏭 COMERCIAL GRANDE (2000–6000 kWh/mês) — 30 a 80 kWp
-- ============================================================

-- Kit 40 kWp
('comercial_grande',
 'Kit Solar 40 kWp | 67×600W Risen | Sungrow SG40K',
 40.0, 67, 'Risen RSM132-8-600M Bifacial', 'Sungrow SG40CX',
 600, 'Monocristalino Bifacial TOPCon', 22.8,
 'String On-Grid Trifásico', 25, 10,
 164000.00, false, 2800, 3800),

-- Kit 50 kWp — POPULAR COMERCIAL GRANDE
('comercial_grande',
 'Kit Solar 50 kWp | 83×600W Jinko | Huawei 50K ★',
 50.0, 83, 'Jinko Tiger Neo 600W', 'Huawei SUN2000-50KTL-M3',
 600, 'Monocristalino N-Type Bifacial', 23.0,
 'String On-Grid Trifásico', 25, 10,
 199000.00, true, 3500, 4800),

-- Kit 60 kWp
('comercial_grande',
 'Kit Solar 60 kWp | 100×600W Canadian | Sungrow SG60K',
 60.0, 100, 'Canadian Solar HiKu7 600W', 'Sungrow SG60CX',
 600, 'Monocristalino TOPCon Bifacial', 22.5,
 'String On-Grid Trifásico', 25, 10,
 235000.00, false, 4200, 5700),

-- Kit 75 kWp
('comercial_grande',
 'Kit Solar 75 kWp | 125×600W Trina | Huawei 75K',
 75.0, 125, 'Trina Vertex 600W Bifacial', 'Huawei SUN2000-75KTL-M3',
 600, 'Monocristalino TOPCon Bifacial', 22.5,
 'String On-Grid Trifásico', 25, 10,
 290000.00, false, 5200, 7200),

-- ============================================================
-- 🏭 INDUSTRIAL (> 6000 kWh/mês) — 80 kWp+
-- ============================================================

-- Kit 100 kWp
('industrial',
 'Kit Solar 100 kWp | 166×600W Risen | Sungrow SG110K',
 100.0, 166, 'Risen RSM132-8-600M Bifacial', 'Sungrow SG110CX-P2',
 600, 'Monocristalino Bifacial TOPCon', 22.8,
 'String On-Grid Trifásico', 25, 10,
 375000.00, false, 7000, 9500),

-- Kit 150 kWp
('industrial',
 'Kit Solar 150 kWp | 250×600W Jinko | Huawei 150K ★',
 150.0, 250, 'Jinko Tiger Neo 600W Bifacial', 'Huawei SUN2000-150KTL-H1',
 600, 'Monocristalino N-Type Bifacial', 23.0,
 'String On-Grid Trifásico', 25, 12,
 545000.00, true, 10500, 14500),

-- Kit 200 kWp
('industrial',
 'Kit Solar 200 kWp | 333×600W Canadian | Sungrow SG250K',
 200.0, 333, 'Canadian Solar HiKu7 600W Bifacial', 'Sungrow SG250HX-IN',
 600, 'Monocristalino TOPCon Bifacial', 22.5,
 'Central Inverter On-Grid', 25, 10,
 710000.00, false, 14000, 19000),

-- ============================================================
-- 🌾 RURAL / AGRONEGÓCIO — Estrutura robusta para solo
-- ============================================================

-- Kit Rural 8 kWp
('rural',
 'Kit Rural 8 kWp | 14×575W BYD | Deye 8K + Estrutura Solo',
 8.0, 14, 'BYD BM-LBMC 575W', 'Deye SUN-8K-SG01LP1',
 575, 'Monocristalino PERC Bifacial', 22.0,
 'String On-Grid', 25, 10,
 42000.00, false, 550, 780),

-- Kit Rural 15 kWp — POPULAR
('rural',
 'Kit Rural 15 kWp | 26×575W Risen | Sungrow SG15K + Estrutura Solo ★',
 15.0, 26, 'Risen RSM132-8-575M', 'Sungrow SG15RT',
 575, 'Monocristalino Bifacial TOPCon', 22.0,
 'String On-Grid Trifásico', 25, 10,
 74000.00, true, 1050, 1450),

-- Kit Rural 30 kWp
('rural',
 'Kit Rural 30 kWp | 51×590W Jinko | Huawei 30K + Estrutura Solo',
 30.0, 51, 'Jinko Tiger Neo 590W', 'Huawei SUN2000-30KTL-M3',
 590, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 136000.00, false, 2100, 2900),

-- Kit Rural 50 kWp
('rural',
 'Kit Rural 50 kWp | 84×600W Canadian | Sungrow 50K + Poste Rastreador',
 50.0, 84, 'Canadian Solar HiKu7 600W Bifacial', 'Sungrow SG50CX',
 600, 'Monocristalino TOPCon Bifacial', 22.5,
 'String On-Grid Trifásico', 25, 10,
 212000.00, false, 3500, 4800);

-- ============================================================
-- FINANCEIRAS SOLARES — Base real de mercado 2025
-- ============================================================

INSERT INTO public.financeiras_solar (nome, taxa_juros_mes, prazo_maximo_meses, taxa_aprovacao_media, ativo) VALUES
  ('Solfácil',              0.99,  84,  88, true),
  ('BV Financeira Solar',   1.19,  60,  75, true),
  ('Santander Solar',       1.35,  72,  70, true),
  ('Crefisa Solar',         1.89,  48,  82, true),
  ('Banco do Brasil Rural', 0.79, 120,  65, true),  -- Pronaf/Pronamp rural
  ('CrediSolar Itaú',       1.29,  60,  72, true),
  ('Sicredi Energia Verde', 0.89,  84,  80, true),
  ('CEF FGTS Solar',        0.50,  60,  55, true);  -- piloto FGTS

-- Índice para busca eficiente por consumo
CREATE INDEX IF NOT EXISTS idx_kits_consumo_range
  ON public.kits_solares(consumo_kwh_min, consumo_kwh_max, faixa);
CREATE INDEX IF NOT EXISTS idx_kits_kwp
  ON public.kits_solares(potencia_kwp, ativo);
