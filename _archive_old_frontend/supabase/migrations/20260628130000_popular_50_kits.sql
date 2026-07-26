-- 1. ADICIONA AS COLUNAS DE FORNECEDOR E LINK NA TABELA DE KITS SE NÃO EXISTIREM
ALTER TABLE public.kits_produtos ADD COLUMN IF NOT EXISTS fornecedor text;
ALTER TABLE public.kits_produtos ADD COLUMN IF NOT EXISTS url_fornecedor text;

-- 2. LIMPA OS KITS DE MOCK ANTIGOS PARA NÃO GERAR POLUIÇÃO VISUAL NO CATALOGO
DELETE FROM public.kits_produtos WHERE codigo LIKE 'KIT-MOCK-%' OR codigo LIKE 'KIT-SOLAR-%';

-- 3. INSERÇÃO DOS 50 KITS MAIS VENDIDOS DO BRASIL (ON-GRID)
INSERT INTO public.kits_produtos (
  codigo, faixa, nome, potencia_kwp, quantidade_modulos, fabricante_modulos, potencia_modulo_w,
  tecnologia_modulo, eficiencia_modulo, inversor, tipo_inversor, garantia_modulos_anos, garantia_inversor_anos,
  preco, consumo_kwh_min, consumo_kwh_max, destaque, ativo, fornecedor, url_fornecedor
) VALUES
-- ==========================================
-- RESIDENCIAL PEQUENO (1.5 kWp a 4.5 kWp) - 10 Kits
-- ==========================================
('KIT-RES-PEQ-01', 'residencial_pequeno', 'Kit Solar On-Grid 1.65 kWp Deye + 3x Placas Jinko 550W', 1.65, 3, 'Jinko Solar', 550, 'Monocristalino N-Type', 21.8, 'Deye SUN-1.6K-G', 'String On-Grid', 25, 10, 2980.00, 150, 250, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-PEQ-02', 'residencial_pequeno', 'Kit Solar On-Grid 2.20 kWp Growatt + 4x Placas Canadian 550W', 2.20, 4, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Growatt MIC 2000TL-X', 'String On-Grid', 25, 10, 3650.00, 200, 320, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-PEQ-03', 'residencial_pequeno', 'Kit Solar On-Grid 2.75 kWp Deye + 5x Placas Risen 550W', 2.75, 5, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Deye SUN-3K-G', 'String On-Grid', 25, 10, 4200.00, 280, 400, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-PEQ-04', 'residencial_pequeno', 'Kit Solar On-Grid 3.30 kWp Growatt + 6x Placas Jinko 550W', 3.30, 6, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MIN 3000TL-X', 'String On-Grid', 25, 10, 4890.00, 320, 480, true, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-PEQ-05', 'residencial_pequeno', 'Kit Solar On-Grid 3.85 kWp Deye + 7x Placas Canadian 550W', 3.85, 7, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-3.6K-G', 'String On-Grid', 25, 10, 5450.00, 380, 560, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-PEQ-06', 'residencial_pequeno', 'Kit Solar On-Grid 4.40 kWp Growatt + 8x Placas Risen 550W', 4.40, 8, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Growatt MIN 4200TL-X', 'String On-Grid', 25, 10, 5990.00, 420, 620, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-PEQ-07', 'residencial_pequeno', 'Kit Solar On-Grid 1.65 kWp Solis + 3x Placas JA Solar 550W', 1.65, 3, 'JA Solar', 550, 'Monocristalino N-Type', 21.8, 'Solis Mini 1500-4G', 'String On-Grid', 25, 10, 2890.00, 150, 240, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-PEQ-08', 'residencial_pequeno', 'Kit Solar On-Grid 2.20 kWp Solis + 4x Placas Jinko 550W', 2.20, 4, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis Mini 2000-4G', 'String On-Grid', 25, 10, 3500.00, 200, 310, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-PEQ-09', 'residencial_pequeno', 'Kit Solar On-Grid 3.30 kWp Solis + 6x Placas Canadian 550W', 3.30, 6, 'Canadian Solar', 550, 'Monocristalino N-Type', 22.0, 'Solis S6-GR1P3K', 'String On-Grid', 25, 10, 4700.00, 310, 470, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-PEQ-10', 'residencial_pequeno', 'Kit Solar On-Grid 4.40 kWp Deye + 8x Placas Jinko 550W', 4.40, 8, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-4K-G', 'String On-Grid', 25, 10, 5800.00, 420, 600, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),

-- ==========================================
-- RESIDENCIAL GRANDE (5.0 kWp a 12.0 kWp) - 15 Kits
-- ==========================================
('KIT-RES-GRA-01', 'residencial_grande', 'Kit Solar On-Grid 5.50 kWp Growatt + 10x Placas Jinko 550W', 5.50, 10, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MIN 5000TL-X', 'String On-Grid', 25, 10, 7200.00, 520, 780, true, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-GRA-02', 'residencial_grande', 'Kit Solar On-Grid 6.60 kWp Deye + 12x Placas Canadian 550W', 6.60, 12, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-6K-G', 'String On-Grid', 25, 10, 8400.00, 620, 920, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-03', 'residencial_grande', 'Kit Solar On-Grid 7.70 kWp Growatt + 14x Placas Risen 550W', 7.70, 14, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Growatt MIN 6000TL-X', 'String On-Grid', 25, 10, 9500.00, 740, 1080, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-GRA-04', 'residencial_grande', 'Kit Solar On-Grid 8.80 kWp Deye + 16x Placas Jinko 550W', 8.80, 16, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-8K-G', 'String On-Grid', 25, 10, 10600.00, 850, 1240, true, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-05', 'residencial_grande', 'Kit Solar On-Grid 9.90 kWp Growatt + 18x Placas Canadian 550W', 9.90, 18, 'Canadian Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MOD 10KTL3-X', 'String On-Grid Trifásico', 25, 10, 12200.00, 950, 1400, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-GRA-06', 'residencial_grande', 'Kit Solar On-Grid 11.00 kWp Deye + 20x Placas Risen 550W', 11.00, 20, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Deye SUN-10K-G', 'String On-Grid Trifásico', 25, 10, 13400.00, 1050, 1550, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-07', 'residencial_grande', 'Kit Solar On-Grid 5.50 kWp Solis + 10x Placas Canadian 550W', 5.50, 10, 'Canadian Solar', 550, 'Monocristalino N-Type', 22.0, 'Solis S6-GR1P5K', 'String On-Grid', 25, 10, 7100.00, 500, 760, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-08', 'residencial_grande', 'Kit Solar On-Grid 6.60 kWp Solis + 12x Placas Jinko 550W', 6.60, 12, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S6-GR1P6K', 'String On-Grid', 25, 10, 8250.00, 600, 900, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-09', 'residencial_grande', 'Kit Solar On-Grid 8.80 kWp Fronius + 16x Placas Jinko 550W', 8.80, 16, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Fronius Primo 8.2-1', 'String On-Grid Premium', 25, 10, 14500.00, 850, 1220, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-GRA-10', 'residencial_grande', 'Kit Solar On-Grid 10.45 kWp Fronius + 19x Placas Canadian 550W', 10.45, 19, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Fronius Symo 10.0-3', 'String On-Grid Trifásico', 25, 10, 16900.00, 1000, 1450, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-GRA-11', 'residencial_grande', 'Kit Solar On-Grid 12.10 kWp Growatt + 22x Placas Jinko 550W', 12.10, 22, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MOD 12KTL3-X', 'String On-Grid Trifásico', 25, 10, 14200.00, 1150, 1700, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-RES-GRA-12', 'residencial_grande', 'Kit Solar On-Grid 7.15 kWp Deye + 13x Placas JA Solar 550W', 7.15, 13, 'JA Solar', 550, 'Monocristalino N-Type', 21.8, 'Deye SUN-7K-G', 'String On-Grid', 25, 10, 9100.00, 680, 1000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-13', 'residencial_grande', 'Kit Solar On-Grid 8.25 kWp Solis + 15x Placas Canadian 550W', 8.25, 15, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S6-GR1P8K-D', 'String On-Grid', 25, 10, 10200.00, 800, 1150, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-14', 'residencial_grande', 'Kit Solar On-Grid 9.35 kWp Deye + 17x Placas Risen 550W', 9.35, 17, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Deye SUN-9K-G', 'String On-Grid', 25, 10, 11800.00, 900, 1300, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-RES-GRA-15', 'residencial_grande', 'Kit Solar On-Grid 11.55 kWp Solis + 21x Placas Jinko 550W', 11.55, 21, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S6-GR3P10K', 'String On-Grid Trifásico', 25, 10, 13900.00, 1100, 1600, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),

-- ==========================================
-- COMERCIAL (15.0 kWp a 45.0 kWp) - 13 Kits
-- ==========================================
('KIT-COM-01', 'comercial', 'Kit Comercial 16.50 kWp Growatt + 30x Placas Jinko 550W', 16.50, 30, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MID 15KTL3-X', 'String On-Grid Trifásico', 25, 10, 17900.00, 1500, 2200, true, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-COM-02', 'comercial', 'Kit Comercial 22.00 kWp Deye + 40x Placas Canadian 550W', 22.00, 40, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-20K-G', 'String On-Grid Trifásico', 25, 10, 22400.00, 2000, 3000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-03', 'comercial', 'Kit Comercial 27.50 kWp Growatt + 50x Placas Risen 550W', 27.50, 50, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Growatt MID 25KTL3-X', 'String On-Grid Trifásico', 25, 10, 26900.00, 2500, 3800, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-COM-04', 'comercial', 'Kit Comercial 33.00 kWp Deye + 60x Placas Jinko 550W', 33.00, 60, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-30K-G', 'String On-Grid Trifásico', 25, 10, 31500.00, 3000, 4500, true, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-05', 'comercial', 'Kit Comercial 38.50 kWp Growatt + 70x Placas Canadian 550W', 38.50, 70, 'Canadian Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MID 36KTL3-X', 'String On-Grid Trifásico', 25, 10, 36200.00, 3500, 5300, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-COM-06', 'comercial', 'Kit Comercial 44.00 kWp Deye + 80x Placas Risen 550W', 44.00, 80, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Deye SUN-40K-G', 'String On-Grid Trifásico', 25, 10, 41200.00, 4000, 6000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-07', 'comercial', 'Kit Comercial 19.80 kWp Solis + 36x Placas Jinko 550W', 19.80, 36, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S6-GR3P15K', 'String On-Grid Trifásico', 25, 10, 19800.00, 1800, 2700, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-08', 'comercial', 'Kit Comercial 24.20 kWp Solis + 44x Placas Canadian 550W', 24.20, 44, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S6-GR3P20K', 'String On-Grid Trifásico', 25, 10, 23900.00, 2200, 3300, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-09', 'comercial', 'Kit Comercial 30.25 kWp Fronius + 55x Placas Jinko 550W', 30.25, 55, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Fronius Eco 27.0-3', 'String On-Grid Trifásico', 25, 10, 38500.00, 2700, 4100, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-COM-10', 'comercial', 'Kit Comercial 35.75 kWp Solis + 65x Placas JA Solar 550W', 35.75, 65, 'JA Solar', 550, 'Monocristalino N-Type', 21.8, 'Solis S5-GR3P30K', 'String On-Grid Trifásico', 25, 10, 33200.00, 3200, 4900, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-11', 'comercial', 'Kit Comercial 41.25 kWp Fronius + 75x Placas Canadian 550W', 41.25, 75, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Fronius Tauro 50-3', 'String On-Grid Industrial', 25, 10, 49800.00, 3800, 5600, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-COM-12', 'comercial', 'Kit Comercial 17.60 kWp Solis + 32x Placas Canadian 550W', 17.60, 32, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis-3P15K-4G', 'String On-Grid Trifásico', 25, 10, 18500.00, 1600, 2400, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-COM-13', 'comercial', 'Kit Comercial 29.70 kWp Deye + 54x Placas Jinko 550W', 29.70, 54, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-25K-G', 'String On-Grid Trifásico', 25, 10, 28900.00, 2650, 4000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),

-- ==========================================
-- INDUSTRIAL & RURAL (50.0 kWp a 120.0 kWp) - 12 Kits
-- ==========================================
('KIT-IND-01', 'industrial', 'Kit Industrial 55.00 kWp Growatt + 100x Placas Jinko 550W', 55.00, 100, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MAX 50KTL3-LV', 'String On-Grid Trifásico', 25, 10, 51000.00, 5000, 7500, true, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-IND-02', 'industrial', 'Kit Industrial 66.00 kWp Deye + 120x Placas Canadian 550W', 66.00, 120, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-60K-G', 'String On-Grid Trifásico', 25, 10, 59800.00, 6000, 9000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-IND-03', 'industrial', 'Kit Industrial 82.50 kWp Growatt + 150x Placas Risen 550W', 82.50, 150, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Growatt MAX 75KTL3-LV', 'String On-Grid Trifásico', 25, 10, 72900.00, 7500, 11500, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-IND-04', 'industrial', 'Kit Industrial 99.00 kWp Deye + 180x Placas Jinko 550W', 99.00, 180, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Deye SUN-80K-G', 'String On-Grid Trifásico', 25, 10, 88200.00, 9000, 14000, true, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-IND-05', 'industrial', 'Kit Industrial 110.00 kWp Growatt + 200x Placas Canadian 550W', 110.00, 200, 'Canadian Solar', 550, 'Monocristalino N-Type', 22.0, 'Growatt MAX 100KTL3-LV', 'String On-Grid Trifásico', 25, 10, 98900.00, 10000, 15500, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-IND-06', 'industrial', 'Kit Industrial 121.00 kWp Deye + 220x Placas Risen 550W', 121.00, 220, 'Risen Energy', 550, 'Monocristalino N-Type', 21.9, 'Deye SUN-110K-G', 'String On-Grid Trifásico', 25, 10, 108500.00, 11000, 17000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-IND-07', 'industrial', 'Kit Industrial 52.80 kWp Solis + 96x Placas Jinko 550W', 52.80, 96, 'Jinko Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S5-GC50K', 'String On-Grid Trifásico', 25, 10, 48900.00, 4800, 7200, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-IND-08', 'industrial', 'Kit Industrial 77.00 kWp Solis + 140x Placas Canadian 550W', 77.00, 140, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis S5-GC60K', 'String On-Grid Trifásico', 25, 10, 68000.00, 7000, 10500, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-IND-09', 'industrial', 'Kit Industrial 88.00 kWp Sungrow + 160x Placas Jinko 550W', 88.00, 160, 'Jinko Solar', 550, 'Monocristalino N-Type', 22.0, 'Sungrow SG75CX', 'String On-Grid Premium', 25, 10, 89000.00, 8000, 12200, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-IND-10', 'industrial', 'Kit Industrial 104.50 kWp Sungrow + 190x Placas Canadian 550W', 104.50, 190, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Sungrow SG110CX', 'String On-Grid Premium', 25, 10, 104200.00, 9500, 14500, false, true, 'Aldo Solar', 'https://www.aldosolar.com.br/geradores/microgeracao-ongrid/growatt'),
('KIT-IND-11', 'industrial', 'Kit Industrial 57.75 kWp Solis + 105x Placas Canadian 550W', 57.75, 105, 'Canadian Solar', 550, 'Monocristalino TOPCon', 22.0, 'Solis-50K-5G', 'String On-Grid Trifásico', 25, 10, 52400.00, 5200, 7800, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores'),
('KIT-IND-12', 'industrial', 'Kit Industrial 93.50 kWp Solis + 170x Placas JA Solar 550W', 93.50, 170, 'JA Solar', 550, 'Monocristalino N-Type', 21.8, 'Solis S5-GC80K', 'String On-Grid Trifásico', 25, 10, 82900.00, 8500, 13000, false, true, 'Sou Energy', 'https://www.souenergy.com.br/produtos/geradores')
ON CONFLICT (codigo) DO UPDATE SET
  faixa = EXCLUDED.faixa,
  nome = EXCLUDED.nome,
  potencia_kwp = EXCLUDED.potencia_kwp,
  quantidade_modulos = EXCLUDED.quantidade_modulos,
  fabricante_modulos = EXCLUDED.fabricante_modulos,
  potencia_modulo_w = EXCLUDED.potencia_modulo_w,
  tecnologia_modulo = EXCLUDED.tecnologia_modulo,
  eficiencia_modulo = EXCLUDED.eficiencia_modulo,
  inversor = EXCLUDED.inversor,
  tipo_inversor = EXCLUDED.tipo_inversor,
  garantia_modulos_anos = EXCLUDED.garantia_modulos_anos,
  garantia_inversor_anos = EXCLUDED.garantia_inversor_anos,
  preco = EXCLUDED.preco,
  consumo_kwh_min = EXCLUDED.consumo_kwh_min,
  consumo_kwh_max = EXCLUDED.consumo_kwh_max,
  fornecedor = EXCLUDED.fornecedor,
  url_fornecedor = EXCLUDED.url_fornecedor,
  updated_at = now();
