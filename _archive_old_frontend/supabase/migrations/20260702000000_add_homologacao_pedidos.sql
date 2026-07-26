-- Adiciona campos técnicos de homologação de engenharia à tabela de pedidos
ALTER TABLE public.pedidos 
  ADD COLUMN IF NOT EXISTS concessionaria_distribuidora VARCHAR(255),
  ADD COLUMN IF NOT EXISTS protocolo_homologacao VARCHAR(255),
  ADD COLUMN IF NOT EXISTS data_vistoria TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parecer_acesso_url TEXT;

COMMENT ON COLUMN public.pedidos.concessionaria_distribuidora IS 'Distribuidora de energia responsável pela homologação (Ex: CPFL, Neoenergia, Light, Enel)';
COMMENT ON COLUMN public.pedidos.protocolo_homologacao IS 'Número do protocolo de homologação solar junto à distribuidora';
COMMENT ON COLUMN public.pedidos.data_vistoria IS 'Data em que a distribuidora agendou ou realizou a vistoria física do gerador';
COMMENT ON COLUMN public.pedidos.parecer_acesso_url IS 'Link para o arquivo PDF ou comprovante do parecer de acesso emitido pela concessionária';
