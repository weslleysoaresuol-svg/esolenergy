-- =======================================================================================
-- MÃ“DULO 11: ESOL ACADEMY E COMMUNICATION HUB
-- DescriÃ§Ã£o: Universidade Corporativa, GamificaÃ§Ã£o Educacional e Feed de Banners/Cronograma.
-- =======================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------------
-- 1. EAD: CATEGORIAS E TRILHAS DE CONHECIMENTO (CURSOS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.ead_cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    capa_url VARCHAR(255),
    ordem_exibicao INTEGER DEFAULT 0,
    mmn_level_minimo INTEGER DEFAULT 1, -- Trava de NÃ­vel (Ex: SÃ³ nÃ­vel 5 pra cima vÃª)
    obrigatorio_para_vender BOOLEAN DEFAULT FALSE, -- Trava o CRM se nÃ£o assistir
    pontos_conclusao INTEGER DEFAULT 0, -- EcoPontos dados ao terminar o curso
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 2. EAD: AULAS E CONTEÃšDO (MÃ“DULOS)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.ead_aulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID NOT NULL REFERENCES public.ead_cursos(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    video_url VARCHAR(500) NOT NULL, -- Link YouTube Unlisted, Vimeo ou Cloudflare
    duracao_minutos INTEGER,
    material_apoio_url VARCHAR(500), -- PDF anexo
    ordem INTEGER NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 3. EAD: PROGRESSO DO USUÃRIO (O RASTREADOR)
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.ead_progresso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    aula_id UUID NOT NULL REFERENCES public.ead_aulas(id),
    curso_id UUID NOT NULL REFERENCES public.ead_cursos(id),
    assistido_percentual NUMERIC(5,2) DEFAULT 0.00,
    is_concluido BOOLEAN DEFAULT FALSE,
    concluido_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, aula_id)
);

-- ---------------------------------------------------------------------------------------
-- 4. SOCIAL FEED: AVISOS CORPORATIVOS E BANNERS CLICÃVEIS
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.feed_comunicados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    autor_id UUID REFERENCES auth.users(id), -- Quem postou (Administrador/Master)
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT,
    banner_url VARCHAR(500) NOT NULL, -- A imagem principal do Feed
    cta_texto VARCHAR(50), -- Call to Action (Ex: "Baixar PDF", "Ler Mais")
    cta_url VARCHAR(500),
    permitir_compartilhamento BOOLEAN DEFAULT TRUE, -- Ativa o botão nativo de Share (WhatsApp/Insta)
    mmn_level_alvo INTEGER DEFAULT 1, -- NÃ­vel mÃ­nimo para ver o banner no feed
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_expiracao TIMESTAMP WITH TIME ZONE, -- Quando o aviso some do feed
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- 5. CRONOGRAMA: AGENDA DE EVENTOS E LIVES
-- ---------------------------------------------------------------------------------------
CREATE TABLE public.agenda_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants_config(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    palestrante VARCHAR(100),
    capa_url VARCHAR(500),
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    link_transmissao VARCHAR(500), -- Zoom, Meet, Youtube
    mmn_level_alvo INTEGER DEFAULT 1, -- Trava de Acesso ao Evento
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------------
-- TRIGGERS E FUNÃ‡Ã•ES (GAMIFICAÃ‡ÃƒO AO CONCLUIR CURSO)
-- ---------------------------------------------------------------------------------------

-- FunÃ§Ã£o para checar se o curso todo foi concluÃ­do ao marcar uma aula como lida
CREATE OR REPLACE FUNCTION public.check_curso_concluido()
RETURNS TRIGGER AS $$
DECLARE
    v_total_aulas INTEGER;
    v_aulas_concluidas INTEGER;
    v_pontos_premio INTEGER;
    v_tenant_id UUID;
    v_curso_titulo VARCHAR;
BEGIN
    IF NEW.is_concluido = TRUE AND OLD.is_concluido = FALSE THEN
        NEW.concluido_em = NOW();

        -- Conta aulas totais
        SELECT COUNT(*) INTO v_total_aulas FROM public.ead_aulas WHERE curso_id = NEW.curso_id AND is_ativo = TRUE;
        
        -- Conta aulas concluidas pelo usuÃ¡rio
        SELECT COUNT(*) INTO v_aulas_concluidas FROM public.ead_progresso 
        WHERE curso_id = NEW.curso_id AND user_id = NEW.user_id AND is_concluido = TRUE;

        -- Se bateu o total, credita os EcoPontos
        IF v_aulas_concluidas = v_total_aulas THEN
            SELECT pontos_conclusao, tenant_id, titulo INTO v_pontos_premio, v_tenant_id, v_curso_titulo
            FROM public.ead_cursos WHERE id = NEW.curso_id;

            IF v_pontos_premio > 0 THEN
                -- Insere na carteira (MÃ³dulo 9)
                INSERT INTO public.ecopontos_extrato (tenant_id, user_id, tipo_transacao, quantidade, origem_id, descricao)
                VALUES (v_tenant_id, NEW.user_id, 'credito', v_pontos_premio, NEW.curso_id, 'ConclusÃ£o de Trilha EAD: ' || v_curso_titulo);
            END IF;
        END IF;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_curso_concluido
    BEFORE UPDATE ON public.ead_progresso
    FOR EACH ROW
    EXECUTE FUNCTION public.check_curso_concluido();

COMMIT;
