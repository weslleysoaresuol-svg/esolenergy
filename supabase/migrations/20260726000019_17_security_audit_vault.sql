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
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  ator_id uuid REFERENCES public.profiles(id),
  
  nome_tabela text NOT NULL,
  registro_id uuid NOT NULL,
  
  acao text NOT NULL,
  
  dado_anterior jsonb,
  dado_novo jsonb,
  
  ip_origem inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tabela_registro ON public.security_audit_logs(nome_tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_ator ON public.security_audit_logs(ator_id);
CREATE INDEX IF NOT EXISTS idx_audit_data ON public.security_audit_logs(created_at);

-- ══════════════════════════════════════════════════════════════
-- FUNÇÃO 1: TRIGGER UNIVERSAL DE AUDITORIA
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_ator_id uuid;
  v_tenant_id uuid;
BEGIN
  BEGIN
    v_ator_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_ator_id := NULL;
  END;

  IF (TG_OP = 'UPDATE') THEN
    BEGIN
      EXECUTE 'SELECT tenant_id FROM ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ' WHERE id = $1' INTO v_tenant_id USING NEW.id;
    EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END;

    INSERT INTO public.security_audit_logs (tenant_id, ator_id, nome_tabela, registro_id, acao, dado_anterior, dado_novo)
    VALUES (v_tenant_id, v_ator_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    
    RETURN NEW;
    
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
