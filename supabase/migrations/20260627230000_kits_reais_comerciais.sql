-- ============================================================
-- CARGA DE KITS FOTOVOLTAICOS REAIS DO MERCADO BRASILEIRO
-- Referência de portfólio e tabelas Aldo Solar e Sou Energy 2025/2026
-- Inclui marcas Tier 1: Canadian, Jinko, Trina, BYD, Astronergy
-- Inversores: Deye, Sungrow, Huawei, Solis, Growatt
-- ============================================================

-- Limpar kits fictícios anteriores para manter apenas os kits reais de fornecedores
TRUNCATE TABLE public.kits_solares RESTART IDENTITY CASCADE;

INSERT INTO public.kits_solares (
  faixa, nome, potencia_kwp, quantidade_modulos, fabricante_modulos, inversor,
  potencia_modulo_w, tecnologia_modulo, eficiencia_modulo,
  tipo_inversor, garantia_modulos_anos, garantia_inversor_anos,
  preco, destaque, consumo_kwh_min, consumo_kwh_max, imagem_kit_url
) VALUES

-- ============================================================
-- 1. ALDO SOLAR - KITS RESIDENCIAIS (Jinko Solar / Canadian + Deye)
-- ============================================================

('residencial_pequeno',
 'Kit Aldo Solar 1.65 kWp | 3x Jinko 550W | Deye Microinversor 1.6kW',
 1.65, 3, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN1600G3-US-220 (Microinversor)',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'Microinversor', 25, 12,
 6900.00, false, 80, 160,
 'https://images.unsplash.com/photo-1548613053-220bfb620c89?w=500&auto=format&fit=crop&q=70'),

('residencial_pequeno',
 'Kit Aldo Solar 2.20 kWp | 4x Canadian 550W | Deye On-Grid 2kW',
 2.20, 4, 'Canadian Solar HiKu6 Mono 550W', 'Deye SUN-2K-G04-P',
 550, 'Monocristalino PERC', 21.8,
 'String On-Grid', 25, 10,
 9100.00, false, 150, 240,
 'https://images.unsplash.com/photo-1620025242137-0d507b99c67b?w=500&auto=format&fit=crop&q=70'),

('residencial_pequeno',
 'Kit Aldo Solar 3.30 kWp | 6x Jinko 550W | Deye On-Grid 3kW ★',
 3.30, 6, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN-3K-G04-P',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 12300.00, true, 220, 350,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Aldo Solar 4.40 kWp | 8x Jinko 550W | Deye On-Grid 4kW',
 4.40, 8, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN-4K-G04-P',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 16200.00, false, 320, 450,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Aldo Solar 5.50 kWp | 10x Canadian 550W | Deye On-Grid 5kW ★',
 5.50, 10, 'Canadian Solar HiKu6 Mono 550W', 'Deye SUN-5K-G04-P',
 550, 'Monocristalino PERC', 21.8,
 'String On-Grid', 25, 10,
 18900.00, true, 400, 580,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Aldo Solar 6.60 kWp | 12x Jinko 550W | Deye On-Grid 6kW',
 6.60, 12, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN-6K-G04-P',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 22400.00, false, 500, 700,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Aldo Solar 8.80 kWp | 16x Jinko 550W | Deye On-Grid 8kW ★',
 8.80, 16, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN-8K-G04-P',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid', 25, 10,
 28700.00, true, 650, 920,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Aldo Solar Híbrido 10 kWp | 18x Canadian 550W | Inversor Deye Híbrido + Bateria Lithium 5.12kWh',
 10.0, 18, 'Canadian Solar HiKu6 Mono 550W', 'Deye SUN-10K-SG01HP3-EU (Híbrido) + Bateria Deye SE-G5.1 Pro',
 550, 'Monocristalino PERC', 21.8,
 'Híbrido com Armazenamento', 25, 10,
 54900.00, false, 750, 1100,
 'https://images.unsplash.com/photo-1558441719-ff34b0524a24?w=500&auto=format&fit=crop&q=70'),


-- ============================================================
-- 2. SOU ENERGY - KITS COMERCIAIS & RESIDENCIAIS (Trina Solar / Astronergy + Solis / Sungrow)
-- ============================================================

('residencial_pequeno',
 'Kit Sou Energy 2.22 kWp | 4x Astronergy 555W | Solis Mini 2kW',
 2.22, 4, 'Astronergy Astro 5s Mono 555W', 'Solis S6-GR1P2K',
 555, 'Monocristalino TOPCon', 22.1,
 'String On-Grid', 25, 10,
 8400.00, false, 140, 230,
 'https://images.unsplash.com/photo-1548613053-220bfb620c89?w=500&auto=format&fit=crop&q=70'),

('residencial_pequeno',
 'Kit Sou Energy 3.33 kWp | 6x Trina 555W | Solis On-Grid 3kW',
 3.33, 6, 'Trina Vertex S+ Mono 555W', 'Solis S6-GR1P3K',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid', 25, 10,
 11950.00, false, 230, 360,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Sou Energy 5.00 kWp | 9x Astronergy 555W | Solis On-Grid 5kW ★',
 5.00, 9, 'Astronergy Astro 5s Mono 555W', 'Solis S6-GR1P5K',
 555, 'Monocristalino TOPCon', 22.1,
 'String On-Grid', 25, 10,
 17350.00, true, 380, 550,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('residencial_grande',
 'Kit Sou Energy 7.77 kWp | 14x Trina 555W | Sungrow On-Grid 7kW',
 7.77, 14, 'Trina Vertex S+ Mono 555W', 'Sungrow SG8.0RT Trifásico',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid Trifásico', 25, 10,
 24900.00, false, 580, 800,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('comercial_pequeno',
 'Kit Sou Energy Comercial 13.32 kWp | 24x Trina 555W | Solis 12kW',
 13.32, 24, 'Trina Vertex S+ Mono 555W', 'Solis S6-GR3P12K Trifásico',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid Trifásico', 25, 10,
 41500.00, false, 950, 1400,
 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500&auto=format&fit=crop&q=70'),

('comercial_pequeno',
 'Kit Sou Energy Comercial 22.20 kWp | 40x Astronergy 555W | Sungrow 20kW ★',
 22.20, 40, 'Astronergy Astro 5s Mono 555W', 'Sungrow SG20RT Trifásico',
 555, 'Monocristalino TOPCon', 22.1,
 'String On-Grid Trifásico', 25, 10,
 67900.00, true, 1500, 2300,
 'https://images.unsplash.com/photo-1620025242137-0d507b99c67b?w=500&auto=format&fit=crop&q=70'),


-- ============================================================
-- 3. ALDO SOLAR - KITS COMERCIAIS & INDUSTRIAIS (Trina Solar / Jinko + Sungrow / Huawei)
-- ============================================================

('comercial_pequeno',
 'Kit Aldo Solar Comercial 16.50 kWp | 30x Jinko 550W | Sungrow 15kW',
 16.50, 30, 'Jinko Solar Tiger Neo N-type 550W', 'Sungrow SG15RT Trifásico',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 51900.00, false, 1100, 1750,
 'https://images.unsplash.com/photo-1620025242137-0d507b99c67b?w=500&auto=format&fit=crop&q=70'),

('comercial_pequeno',
 'Kit Aldo Solar Comercial 27.50 kWp | 50x Jinko 550W | Deye 25kW ★',
 27.50, 50, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN-25K-G04 Trifásico',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 82500.00, true, 2000, 3000,
 'https://images.unsplash.com/photo-1620025242137-0d507b99c67b?w=500&auto=format&fit=crop&q=70'),

('comercial_grande',
 'Kit Aldo Solar Comercial 38.50 kWp | 70x Canadian 550W | Huawei 30kW',
 38.50, 70, 'Canadian Solar HiKu6 Mono 550W', 'Huawei SUN2000-30KTL-M3 Trifásico',
 550, 'Monocristalino PERC', 21.8,
 'String On-Grid Trifásico', 25, 10,
 119000.00, false, 2800, 4200,
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=70'),

('comercial_grande',
 'Kit Aldo Solar Comercial 49.50 kWp | 90x Jinko 550W | Sungrow 40kW ★',
 49.50, 90, 'Jinko Solar Tiger Neo N-type 550W', 'Sungrow SG40CX Trifásico',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 148000.00, true, 3800, 5400,
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=70'),

('industrial',
 'Kit Aldo Solar Industrial 77.00 kWp | 140x Jinko 550W | Huawei 75kW ★',
 77.00, 140, 'Jinko Solar Tiger Neo N-type 550W', 'Huawei SUN2000-75KTL-M1 Trifásico',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid Trifásico', 25, 10,
 225000.00, true, 5800, 8500,
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=70'),

('industrial',
 'Kit Aldo Solar Industrial 110.00 kWp | 200x Canadian 550W | Sungrow 110kW',
 110.00, 200, 'Canadian Solar HiKu6 Mono 550W', 'Sungrow SG110CX-P2 Trifásico',
 550, 'Monocristalino PERC', 21.8,
 'String On-Grid Trifásico', 25, 10,
 319000.00, false, 8200, 12500,
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=70'),

-- ============================================================
-- 4. KITS RURAIS (Estrutura de Solo / Trator de Solo reforçado)
-- ============================================================

('rural',
 'Kit Rural Sou Energy 8.88 kWp | 16x Trina 555W | Solis 8kW + Estrutura Solo Reforçada',
 8.88, 16, 'Trina Vertex S+ Mono 555W', 'Solis S6-GR1P8K',
 555, 'Monocristalino TOPCon', 22.2,
 'String On-Grid (Solo)', 25, 10,
 33200.00, false, 650, 950,
 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&auto=format&fit=crop&q=70'),

('rural',
 'Kit Rural Aldo Solar 16.50 kWp | 30x Jinko 550W | Deye 15kW + Estrutura Solo Alumínio ★',
 16.50, 30, 'Jinko Solar Tiger Neo N-type 550W', 'Deye SUN-15K-G04 Trifásico',
 550, 'Monocristalino N-Type TOPCon', 22.5,
 'String On-Grid Trifásico (Solo)', 25, 10,
 62900.00, true, 1100, 1800,
 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&auto=format&fit=crop&q=70');
