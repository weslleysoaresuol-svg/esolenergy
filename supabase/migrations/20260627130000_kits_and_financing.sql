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
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all access to kits_solares" ON public.kits_solares
    FOR ALL TO authenticated USING (
        public.has_role('admin', auth.uid())
    );

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
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all access to financeiras_solar" ON public.financeiras_solar
    FOR ALL TO authenticated USING (
        public.has_role('admin', auth.uid())
    );
