-- ============================================================================
-- ESOL ENERGY PLATFORM - RLS SECURITY COMPLIANCE AUDIT SCRIPT
-- Versão: v8.4 (Homologação E2E & Audit RLS Supabase)
-- ============================================================================

-- Function: audit_rls_security_status()
-- Inspeção automatizada de Row Level Security (RLS) e isolamento de tenant
CREATE OR REPLACE FUNCTION public.audit_rls_security_status()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  compliance_status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::TEXT AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count,
    CASE 
      WHEN c.relrowsecurity = TRUE AND COUNT(p.policyname) > 0 THEN 'PASSED_SECURE'
      WHEN c.relrowsecurity = TRUE THEN 'WARNING_NO_POLICIES'
      ELSE 'CRITICAL_RLS_DISABLED'
    END AS compliance_status
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policies p ON p.tablename = c.relname AND p.schemaname = n.nspname
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r' -- Apenas tabelas ordinarias
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname ASC;
END;
$$;

-- Executar consulta de laudo de conformidade RLS
SELECT * FROM public.audit_rls_security_status();
