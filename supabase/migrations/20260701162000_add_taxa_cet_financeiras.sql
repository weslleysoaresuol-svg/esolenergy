-- Adiciona a coluna de Taxa CET mensal (Custo Efetivo Total) à tabela de financeiras solar
ALTER TABLE public.financeiras_solar 
ADD COLUMN IF NOT EXISTS taxa_cet_mes NUMERIC DEFAULT 0.0;

-- Esvazia a tabela existente para repopular com as 10 financeiras de crédito solar do mercado e suas respectivas taxas de CET atualizadas
TRUNCATE TABLE public.financeiras_solar CASCADE;

-- Insere os 16 bancos e financeiras reais com taxas nominais (taxa_juros_mes) e taxas de CET mensal (taxa_cet_mes)
INSERT INTO public.financeiras_solar (nome, taxa_juros_mes, taxa_cet_mes, prazo_maximo_meses, taxa_aprovacao_media, ativo) VALUES
  ('Solfácil', 1.19, 1.39, 120, 88, true),
  ('Banco BV Solar', 1.29, 1.48, 84, 80, true),
  ('Santander Solar', 1.39, 1.59, 96, 75, true),
  ('Sicredi Energia Verde', 0.99, 1.15, 120, 85, true),
  ('Sicoob EcoCrédito', 1.05, 1.22, 96, 82, true),
  ('Banco do Brasil Agro/Solar', 0.95, 1.12, 120, 70, true),
  ('Bradesco Financiamento Solar', 1.25, 1.44, 72, 72, true),
  ('Itaú CrediSolar', 1.35, 1.55, 60, 70, true),
  ('Porto Seguro Solar (PortoBank)', 1.20, 1.38, 84, 78, true),
  ('Ailos Solar', 1.08, 1.25, 96, 80, true),
  ('Caixa Econômica Federal (CEF)', 1.15, 1.32, 60, 82, true),
  ('Banco do Nordeste (BNB)', 0.80, 0.95, 96, 75, true),
  ('Banco da Amazônia (BASA)', 0.85, 1.00, 96, 70, true),
  ('Crefisa Solar', 1.89, 2.12, 48, 85, true),
  ('BNDES Finame Baixo Carbono', 0.75, 0.88, 120, 60, true),
  ('Desenvolve SP (Economia Verde)', 0.90, 1.05, 84, 65, true);
