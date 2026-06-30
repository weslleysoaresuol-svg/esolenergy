-- ADICIONA COLUNAS PARA A ESTEIRA COMERCIAL SOLAR (PEDIDOS & FINANCIAMENTOS)
ALTER TABLE public.pedidos 
    ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
    ADD COLUMN IF NOT EXISTS transacao_dados JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS kit_sugerido_id UUID REFERENCES public.kits_solares(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS kit_sugerido_aprovado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS contrato_cliente_url TEXT,
    ADD COLUMN IF NOT EXISTS contrato_cliente_status VARCHAR(50) DEFAULT 'pendente';

ALTER TABLE public.financiamentos
    ADD COLUMN IF NOT EXISTS contrato_banco_url TEXT,
    ADD COLUMN IF NOT EXISTS comprovante_financiamento_url TEXT;

-- ADICIONA NOVO STATUS NA ESTEIRA DE PEDIDOS: 'analise_tecnica'
-- O PostgreSQL não permite apagar/alterar diretamente um tipo ENUM existente facilmente, 
-- mas podemos garantir que os campos aceitem os novos status operacionais.
