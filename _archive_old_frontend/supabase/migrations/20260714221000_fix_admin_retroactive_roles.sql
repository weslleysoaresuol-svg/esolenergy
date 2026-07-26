-- Corrige as contas que foram criadas com a role 'corretor' (parceiro) incorretamente devido ao bug do fallback do convite
-- e que pertencem ao domínio corporativo ou ao Marcos.

-- 1. Atualiza na user_roles para 'admin'
UPDATE public.user_roles ur
SET role = 'admin'::public.app_role
FROM auth.users u
WHERE ur.user_id = u.id
  AND ur.role = 'corretor'::public.app_role
  AND (
    LOWER(u.email) LIKE '%@esolenergy.com' 
    OR LOWER(u.email) LIKE '%@esolenergy.com.br' 
    OR LOWER(u.email) = 'marcos.nubank777@gmail.com'
  );

-- 2. Atualiza os perfis dessas contas para marcar onboarding_completo = true e contrato_assinado = true
UPDATE public.profiles p
SET 
  onboarding_completo = true,
  contrato_assinado = true,
  ativo = true
FROM auth.users u
WHERE p.id = u.id
  AND (
    LOWER(u.email) LIKE '%@esolenergy.com' 
    OR LOWER(u.email) LIKE '%@esolenergy.com.br' 
    OR LOWER(u.email) = 'marcos.nubank777@gmail.com'
  );
