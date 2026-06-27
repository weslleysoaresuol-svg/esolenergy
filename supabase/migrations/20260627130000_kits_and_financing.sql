-- Create public.kits_solares table if not exists
CREATE TABLE IF NOT EXISTS public.kits_solares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faixa TEXT NOT NULL, -- 'residencial_pequeno', 'residencial_grande', 'comercial_pequeno', 'comercial_grande', 'industrial', 'rural'
    nome TEXT NOT NULL,
    potencia_kwp NUMERIC NOT NULL,
    quantidade_modulos INTEGER NOT NULL,
    fabricante_modulos TEXT NOT NULL,
    inversor TEXT NOT NULL,
    preco NUMERIC NOT NULL,
    imagem_kit_url TEXT,
    imagem_componentes_url TEXT,
    documento_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for public.kits_solares
ALTER TABLE public.kits_solares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to kits_solares" ON public.kits_solares
    FOR SELECT USING (true);

CREATE POLICY "Allow admin all access to kits_solares" ON public.kits_solares
    FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), 'admin')
    ) WITH CHECK (
        public.has_role(auth.uid(), 'admin')
    );

-- Table Grants for kits_solares
GRANT SELECT ON public.kits_solares TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kits_solares TO authenticated;
GRANT ALL ON public.kits_solares TO service_role;


-- Create public.financeiras_solar table if not exists
CREATE TABLE IF NOT EXISTS public.financeiras_solar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    taxa_juros_mes NUMERIC NOT NULL,
    prazo_maximo_meses INTEGER NOT NULL,
    taxa_aprovacao_media NUMERIC NOT NULL,
    ativo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for public.financeiras_solar
ALTER TABLE public.financeiras_solar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to financeiras_solar" ON public.financeiras_solar
    FOR SELECT USING (true);

CREATE POLICY "Allow admin all access to financeiras_solar" ON public.financeiras_solar
    FOR ALL TO authenticated USING (
        public.has_role(auth.uid(), 'admin')
    ) WITH CHECK (
        public.has_role(auth.uid(), 'admin')
    );

-- Table Grants for financeiras_solar
GRANT SELECT ON public.financeiras_solar TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financeiras_solar TO authenticated;
GRANT ALL ON public.financeiras_solar TO service_role;


-- Security Definer function to allow secure public order tracking by CPF/CNPJ
CREATE OR REPLACE FUNCTION public.consultar_projeto_cliente(_cpf_cnpj TEXT)
RETURNS TABLE (
    nome TEXT,
    status public.cliente_status,
    cidade TEXT,
    estado TEXT,
    concessionaria TEXT,
    potencia_kwp NUMERIC,
    recent_logs JSONB
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    found_id UUID;
    clean_cpf_cnpj TEXT;
BEGIN
    -- Limpa pontuações do CPF/CNPJ para comparação
    clean_cpf_cnpj := regexp_replace(_cpf_cnpj, '[^0-9]', '', 'g');
    
    SELECT id INTO found_id 
    FROM public.clientes 
    WHERE regexp_replace(cpf_cnpj, '[^0-9]', '', 'g') = clean_cpf_cnpj 
       OR cpf_cnpj = _cpf_cnpj
    LIMIT 1;

    IF found_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        c.nome,
        c.status,
        c.cidade,
        c.estado,
        c.concessionaria,
        c.potencia_kwp,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('created_at', i.created_at, 'descricao', i.descricao))
             FROM (
                 SELECT created_at, descricao 
                 FROM public.interacoes 
                 WHERE cliente_id = c.id 
                 ORDER BY created_at DESC 
                 LIMIT 3
             ) i),
            '[]'::jsonb
        ) as recent_logs
    FROM public.clientes c
    WHERE c.id = found_id;
END;
$$;

-- Grant execution to public / anonymous users
GRANT EXECUTE ON FUNCTION public.consultar_projeto_cliente(TEXT) TO anon, authenticated;
