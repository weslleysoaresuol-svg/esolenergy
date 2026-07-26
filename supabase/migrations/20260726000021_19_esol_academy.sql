-- =======================================================================================
-- MÓDULO 19: ESOL ACADEMY E COMMUNICATION HUB
-- Descrição: Universidade Corporativa, Gamificação Educacional e Feed de Banners/Cronograma.
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql, 09_clube_fidelidade.sql
-- =======================================================================================

-- ---------------------------------------------------------------------------------------
-- 1. EAD: CATEGORIAS E TRILHAS DE CONHECIMENTO (CURSOS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ead_cursos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    titulo varchar(150) NOT NULL,
    descricao text,
    capa_url varchar(255),
    ordem_exibicao integer DEFAULT 0,
    mmn_level_minimo integer DEFAULT 1,
    obrigatorio_para_vender boolean DEFAULT false,
    pontos_conclusao integer DEFAULT 0,
    is_ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 2. EAD: AULAS E CONTEÚDO (MÓDULOS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ead_aulas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id uuid NOT NULL REFERENCES public.ead_cursos(id) ON DELETE CASCADE,
    titulo varchar(150) NOT NULL,
    video_url varchar(500) NOT NULL,
    duracao_minutos integer,
    material_apoio_url varchar(500),
    ordem integer NOT NULL,
    is_ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 3. EAD: PROGRESSO DO USUÁRIO (O RASTREADOR)
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ead_progresso (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    aula_id uuid NOT NULL REFERENCES public.ead_aulas(id) ON DELETE CASCADE,
    curso_id uuid NOT NULL REFERENCES public.ead_cursos(id) ON DELETE CASCADE,
    assistido_percentual numeric(5,2) DEFAULT 0.00,
    is_concluido boolean DEFAULT false,
    concluido_em timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, aula_id)
);

-- ---------------------------------------------------------------------------------------
-- 4. SOCIAL FEED: AVISOS CORPORATIVOS E BANNERS CLICÁVEIS
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feed_comunicados (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    autor_id uuid REFERENCES public.profiles(id),
    titulo varchar(150) NOT NULL,
    conteudo text,
    banner_url varchar(500) NOT NULL,
    cta_texto varchar(50),
    cta_url varchar(500),
    permitir_compartilhamento boolean DEFAULT true,
    mmn_level_alvo integer DEFAULT 1,
    data_publicacao timestamptz DEFAULT now(),
    data_expiracao timestamptz,
    is_ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- 5. CRONOGRAMA: AGENDA DE EVENTOS E LIVES
-- ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agenda_eventos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    titulo varchar(150) NOT NULL,
    descricao text,
    palestrante varchar(100),
    capa_url varchar(500),
    data_hora_inicio timestamptz NOT NULL,
    data_hora_fim timestamptz NOT NULL,
    link_transmissao varchar(500),
    mmn_level_alvo integer DEFAULT 1,
    is_ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------------------
-- TRIGGERS E FUNÇÕES (GAMIFICAÇÃO AO CONCLUIR CURSO)
-- ---------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_curso_concluido()
RETURNS TRIGGER AS $$
DECLARE
    v_total_aulas integer;
    v_aulas_concluidas integer;
    v_pontos_premio integer;
    v_tenant_id uuid;
    v_curso_titulo varchar;
BEGIN
    IF NEW.is_concluido = true AND (OLD.is_concluido = false OR OLD.is_concluido IS NULL) THEN
        NEW.concluido_em = now();

        SELECT COUNT(*) INTO v_total_aulas FROM public.ead_aulas WHERE curso_id = NEW.curso_id AND is_ativo = true;
        
        SELECT COUNT(*) INTO v_aulas_concluidas FROM public.ead_progresso 
        WHERE curso_id = NEW.curso_id AND user_id = NEW.user_id AND is_concluido = true;

        IF v_aulas_concluidas = v_total_aulas THEN
            SELECT pontos_conclusao, tenant_id, titulo INTO v_pontos_premio, v_tenant_id, v_curso_titulo
            FROM public.ead_cursos WHERE id = NEW.curso_id;

            IF v_pontos_premio > 0 THEN
                INSERT INTO public.ecopontos_extrato (tenant_id, user_id, tipo_transacao, quantidade, origem_id, descricao)
                VALUES (v_tenant_id, NEW.user_id, 'credito', v_pontos_premio, NEW.curso_id, 'Conclusão de Trilha EAD: ' || v_curso_titulo);
            END IF;
        END IF;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_curso_concluido ON public.ead_progresso;
CREATE TRIGGER trg_check_curso_concluido
    BEFORE UPDATE ON public.ead_progresso
    FOR EACH ROW
    EXECUTE FUNCTION public.check_curso_concluido();
