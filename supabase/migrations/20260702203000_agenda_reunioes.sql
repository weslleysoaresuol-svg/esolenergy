-- Migração: Criação da infraestrutura de agendamento de reuniões e controle de horários (Agenda)
-- Data: 2026-07-02 20:30:00

-- 1. Criação da tabela de configurações de slots da agenda
CREATE TABLE IF NOT EXISTS public.configuracao_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    intervalo_minutos INTEGER NOT NULL DEFAULT 60 CHECK (intervalo_minutos > 0),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Criação da tabela de agendamentos de clientes
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

-- 4. Políticas para configuracao_agenda
-- Leitura pública para a landing page renderizar a agenda
CREATE POLICY "Leitura pública de configurações da agenda"
ON public.configuracao_agenda FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- Escrita restrita a administradores
CREATE POLICY "Administradores gerenciam configurações da agenda"
ON public.configuracao_agenda FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. Políticas para agendamentos
-- Inserção pública para novos leads
CREATE POLICY "Inserção pública de novos agendamentos"
ON public.agendamentos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Leitura restrita para administradores, equipe interna ou consultor atribuído
CREATE POLICY "Leitura de agendamentos por equipe e responsável"
ON public.agendamentos FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.is_internal_user(auth.uid()) OR
    corretor_id = auth.uid()
);

-- Modificação por administradores, equipe interna ou consultor responsável
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

-- 6. População com horários padrão (Segunda a Sexta, das 09:00 às 18:00, intervalos de 60 minutos)
INSERT INTO public.configuracao_agenda (dia_semana, hora_inicio, hora_fim, intervalo_minutos) VALUES
(1, '09:00:00', '18:00:00', 60), -- Segunda
(2, '09:00:00', '18:00:00', 60), -- Terça
(3, '09:00:00', '18:00:00', 60), -- Quarta
(4, '09:00:00', '18:00:00', 60), -- Quinta
(5, '09:00:00', '18:00:00', 60)  -- Sexta
ON CONFLICT DO NOTHING;
