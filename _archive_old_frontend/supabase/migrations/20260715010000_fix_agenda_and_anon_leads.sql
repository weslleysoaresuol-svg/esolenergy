-- 1. Garante a existência da tabela de configurações da agenda
CREATE TABLE IF NOT EXISTS public.configuracao_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    intervalo_minutos INTEGER NOT NULL DEFAULT 60 CHECK (intervalo_minutos > 0),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Garante a existência da tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    data_hora TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'realizado')),
    corretor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilita RLS em ambas as tabelas
ALTER TABLE public.configuracao_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- 4. Remove políticas antigas se existirent
DROP POLICY IF EXISTS "Leitura pública de configurações da agenda" ON public.configuracao_agenda;
DROP POLICY IF EXISTS "Administradores gerenciam configurações da agenda" ON public.configuracao_agenda;
DROP POLICY IF EXISTS "Inserção pública de novos agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Leitura de agendamentos por equipe e responsável" ON public.agendamentos;
DROP POLICY IF EXISTS "Modificação de agendamentos por equipe e responsável" ON public.agendamentos;

-- 5. Criação de novas políticas com amplo acesso para anon
CREATE POLICY "Leitura pública de configurações da agenda"
ON public.configuracao_agenda FOR SELECT
TO anon, authenticated
USING (ativo = true);

CREATE POLICY "Administradores gerenciam configurações da agenda"
ON public.configuracao_agenda FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Inserção pública de novos agendamentos"
ON public.agendamentos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Leitura de agendamentos por equipe e responsável"
ON public.agendamentos FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.is_internal_user(auth.uid()) OR
    corretor_id = auth.uid()
);

CREATE POLICY "Modificação de agendamentos por equipe e responsável"
ON public.agendamentos FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.is_internal_user(auth.uid()) OR
    corretor_id = auth.uid()
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.is_internal_user(auth.uid()) OR
    corretor_id = auth.uid()
);

-- 6. Popula horários de funcionamento padrão se vazios
INSERT INTO public.configuracao_agenda (dia_semana, hora_inicio, hora_fim, intervalo_minutos) 
SELECT 1, '09:00:00', '18:00:00', 60 WHERE NOT EXISTS (SELECT 1 FROM public.configuracao_agenda WHERE dia_semana = 1);
INSERT INTO public.configuracao_agenda (dia_semana, hora_inicio, hora_fim, intervalo_minutos) 
SELECT 2, '09:00:00', '18:00:00', 60 WHERE NOT EXISTS (SELECT 1 FROM public.configuracao_agenda WHERE dia_semana = 2);
INSERT INTO public.configuracao_agenda (dia_semana, hora_inicio, hora_fim, intervalo_minutos) 
SELECT 3, '09:00:00', '18:00:00', 60 WHERE NOT EXISTS (SELECT 1 FROM public.configuracao_agenda WHERE dia_semana = 3);
INSERT INTO public.configuracao_agenda (dia_semana, hora_inicio, hora_fim, intervalo_minutos) 
SELECT 4, '09:00:00', '18:00:00', 60 WHERE NOT EXISTS (SELECT 1 FROM public.configuracao_agenda WHERE dia_semana = 4);
INSERT INTO public.configuracao_agenda (dia_semana, hora_inicio, hora_fim, intervalo_minutos) 
SELECT 5, '09:00:00', '18:00:00', 60 WHERE NOT EXISTS (SELECT 1 FROM public.configuracao_agenda WHERE dia_semana = 5);

-- 7. CORREÇÃO DA TABELA public.clientes (ERRO DE ORÇAMENTO ANÔNIMO)
-- Remove política antiga de inserção se houver
DROP POLICY IF EXISTS "clientes_insert_anon" ON public.clientes;
DROP POLICY IF EXISTS "Permitir inserção pública de leads" ON public.clientes;

-- Cria política que permite usuários anônimos (leads da landing page) inserirem orçamentos/faturas
CREATE POLICY "Permitir inserção pública de leads"
ON public.clientes
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Notifica o PostgREST para limpar o cache de schema
NOTIFY pgrst, 'reload schema';
