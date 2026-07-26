-- ==============================================================================
-- 🛡️ MÓDULO 17: SECURITY AUDIT VAULT (Lixeira de Dados & Time Machine)
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: 01_tenants_config.sql, 02_identidade_rbac.sql
-- Tabelas: security_audit_logs
-- Funções: process_audit_log()
-- ==============================================================================

-- ══════════════════════════════════════════════════════════════
-- TABELA 1: COFRE DE AUDITORIA (Lixeira e Histórico)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Quem fez a alteração
  ator_id uuid REFERENCES public.profiles(id),  -- O usuário logado que alterou
  
  -- O que foi alterado
  nome_tabela text NOT NULL,                    -- Ex: 'clientes', 'ledger_lancamentos'
  registro_id uuid NOT NULL,                    -- O ID da linha alterada
  
  -- Ação (INSERT, UPDATE, DELETE)
  acao text NOT NULL,
  
  -- Dados Críticos (O "Snapshot" JSONB da máquina do tempo)
  dado_anterior jsonb,                          -- Como a linha era ANTES (vazio se INSERT)
  dado_novo jsonb,                              -- Como a linha ficou DEPOIS (vazio se DELETE)
  
  -- Metadados de contexto (Opcional, para rastreio do backend)
  ip_origem inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now()
);

-- Índices pesados para busca rápida no painel de Lixeira/Auditoria
CREATE INDEX idx_audit_tabela_registro ON public.security_audit_logs(nome_tabela, registro_id);
CREATE INDEX idx_audit_ator ON public.security_audit_logs(ator_id);
CREATE INDEX idx_audit_data ON public.security_audit_logs(created_at);

-- ══════════════════════════════════════════════════════════════
-- FUNÇÃO 1: TRIGGER UNIVERSAL DE AUDITORIA
-- ══════════════════════════════════════════════════════════════
-- Esta função pode ser plugada em QUALQUER tabela operacional para blindá-la.
-- Ela detecta o usuário logado via JWT (auth.uid()) e salva o JSON.

CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_ator_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Tenta pegar o ID do usuário que fez a ação via contexto do Supabase Auth
  BEGIN
    v_ator_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_ator_id := NULL; -- Modificação feita por backend service/cron
  END;

  -- Se for um UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- Pega o tenant_id dinamicamente, se a tabela possuir
    BEGIN
      EXECUTE 'SELECT tenant_id FROM ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_tenant_id USING NEW.id;
    EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END;

    INSERT INTO public.security_audit_logs (tenant_id, ator_id, nome_tabela, registro_id, acao, dado_anterior, dado_novo)
    VALUES (v_tenant_id, v_ator_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    
    RETURN NEW;
    
  -- Se for um DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    BEGIN
      EXECUTE 'SELECT tenant_id FROM ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_tenant_id USING OLD.id;
    EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END;

    INSERT INTO public.security_audit_logs (tenant_id, ator_id, nome_tabela, registro_id, acao, dado_anterior, dado_novo)
    VALUES (v_tenant_id, v_ator_id, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), NULL);
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de como plugar (Gatilho real seria executado na instalação do banco):
-- CREATE TRIGGER trg_audit_clientes
-- AFTER UPDATE OR DELETE ON public.clientes
-- FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
