-- 1. CRIAÇÃO DA TABELA DE FORNECEDORES
CREATE TABLE IF NOT EXISTS public.fornecedores_solar (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    nome text NOT NULL,
    cnpj text,
    telefone text,
    email text,
    ativo boolean DEFAULT true NOT NULL
);

-- 2. CRIAÇÃO DA TABELA DE FLUXO DE CAIXA / LANÇAMENTOS FINANCEIROS
CREATE TYPE public.financeiro_tipo AS ENUM ('receita', 'despesa');
CREATE TYPE public.financeiro_categoria AS ENUM ('instalacao', 'comissao', 'imposto', 'fornecedor', 'mão_de_obra', 'outro');
CREATE TYPE public.financeiro_status AS ENUM ('pendente', 'pago', 'cancelado');

CREATE TABLE IF NOT EXISTS public.financeiro_lancamentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    tipo public.financeiro_tipo NOT NULL,
    categoria public.financeiro_categoria NOT NULL,
    valor numeric(12,2) NOT NULL,
    data_vencimento date NOT NULL,
    data_pagamento date,
    status public.financeiro_status DEFAULT 'pendente'::public.financeiro_status NOT NULL,
    descricao text,
    pedido_id uuid REFERENCES public.pedidos(id) ON DELETE SET NULL,
    parceiro_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    fornecedor_id uuid REFERENCES public.fornecedores_solar(id) ON DELETE SET NULL
);

-- 3. CRIAÇÃO DA TABELA DE COMISSÕES DE PARCEIROS / CONSULTORES
CREATE TYPE public.comissao_status AS ENUM ('a_receber', 'pago', 'cancelado');

CREATE TABLE IF NOT EXISTS public.parceiro_comissoes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    parceiro_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pedido_id uuid REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    valor_total_pedido numeric(12,2) NOT NULL,
    percentual_comissao numeric(5,2) NOT NULL,
    valor_comissao numeric(12,2) NOT NULL,
    parcela integer DEFAULT 1 NOT NULL,
    total_parcelas integer DEFAULT 2 NOT NULL,
    status public.comissao_status DEFAULT 'a_receber'::public.comissao_status NOT NULL,
    data_previsao_pagamento date NOT NULL,
    data_pagamento_efetivo date,
    detalhes text
);

-- 4. CRIAÇÃO DA TABELA DE PAGAMENTOS AOS FORNECEDORES DE KITS
CREATE TABLE IF NOT EXISTS public.fornecedor_pagamentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    fornecedor_id uuid REFERENCES public.fornecedores_solar(id) ON DELETE CASCADE NOT NULL,
    pedido_id uuid REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    valor_kit numeric(12,2) NOT NULL,
    status public.financeiro_status DEFAULT 'pendente'::public.financeiro_status NOT NULL,
    data_vencimento date NOT NULL,
    data_pagamento date
);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.fornecedores_solar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiro_comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedor_pagamentos ENABLE ROW LEVEL SECURITY;

-- 6. CRIAÇÃO DE GRANTS
GRANT ALL ON TABLE public.fornecedores_solar TO authenticated;
GRANT ALL ON TABLE public.financeiro_lancamentos TO authenticated;
GRANT ALL ON TABLE public.parceiro_comissoes TO authenticated;
GRANT ALL ON TABLE public.fornecedor_pagamentos TO authenticated;

-- 7. POLÍTICAS DE RLS (ROW LEVEL SECURITY)

-- A. Fornecedores Solar (Somente Admin tem acesso total, outros logados podem ler para dropdowns)
CREATE POLICY "Admin tem controle total de fornecedores" 
ON public.fornecedores_solar TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parceiros cadastrados podem visualizar fornecedores ativos" 
ON public.fornecedores_solar FOR SELECT TO authenticated 
USING (ativo = true);

-- B. Lançamentos Financeiros (Apenas Admin vê e edita)
CREATE POLICY "Admin tem controle total de lancamentos" 
ON public.financeiro_lancamentos TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- C. Pagamentos Fornecedores (Apenas Admin vê e edita)
CREATE POLICY "Admin tem controle total de pagamentos a fornecedores" 
ON public.fornecedor_pagamentos TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- D. Comissões de Parceiros (Admin vê tudo, corretor vê apenas as próprias linhas)
CREATE POLICY "Admin tem controle total de comissoes" 
ON public.parceiro_comissoes TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Consultores parceiros podem ver suas proprias comissoes" 
ON public.parceiro_comissoes FOR SELECT TO authenticated 
USING (parceiro_id = auth.uid());

-- 8. TRIGGER DE LOG AUTOMÁTICO DE PAGAMENTO DE COMISSÃO
-- (Insere um lançamento de despesa no fluxo de caixa do financeiro quando uma comissão é paga)
CREATE OR REPLACE FUNCTION public.log_comissao_paga()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
        INSERT INTO public.financeiro_lancamentos (
            tipo,
            categoria,
            valor,
            data_vencimento,
            data_pagamento,
            status,
            descricao,
            pedido_id,
            parceiro_id
        ) VALUES (
            'despesa',
            'comissao',
            NEW.valor_comissao,
            NEW.data_previsao_pagamento,
            COALESCE(NEW.data_pagamento_efetivo, CURRENT_DATE),
            'pago',
            'Comissão paga ao consultor ref. Pedido ID: ' || NEW.pedido_id || ' (Parcela ' || NEW.parcela || '/' || NEW.total_parcelas || ')',
            NEW.pedido_id,
            NEW.parceiro_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_log_comissao_paga
    AFTER UPDATE OF status ON public.parceiro_comissoes
    FOR EACH ROW
    WHEN (NEW.status = 'pago')
    EXECUTE FUNCTION public.log_comissao_paga();

-- 9. INSERÇÃO DE FORNECEDORES PADRÃO
INSERT INTO public.fornecedores_solar (nome, cnpj, telefone, email, ativo)
VALUES 
('Aldo Solar', '84.860.675/0001-44', '(44) 3261-2000', 'vendas@aldosolar.com.br', true),
('Sou Energy', '18.234.332/0001-02', '(85) 3044-8888', 'comercial@souenergy.com.br', true)
ON CONFLICT DO NOTHING;
