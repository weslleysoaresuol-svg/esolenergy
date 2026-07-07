const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mmskdcvbnaqgbzmigfak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2tkY3ZibmFxZ2J6bWlnZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjA3MzAsImV4cCI6MjA5Nzc5NjczMH0.jgZLhfRohgQL6nKe-ZYaPqvSI5-i7QktYw5OpG2fRtI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Buscando perfis com nome 'Marcos'...");
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('nome', '%marcos%');

  if (error) {
    console.error("Erro ao buscar perfis:", error);
    return;
  }

  console.log(`Encontrados ${profiles.length} perfis:`);
  profiles.forEach(p => {
    console.log(`ID: ${p.id} | Nome: ${p.nome} | Email: ${p.email} | Ativo: ${p.ativo} | Onboarding: ${p.onboarding_completo}`);
  });

  console.log("\nBuscando na tabela user_roles...");
  const { data: roles, errorRoles } = await supabase
    .from('user_roles')
    .select('*');

  if (errorRoles) {
    console.error("Erro ao buscar user_roles:", errorRoles);
    return;
  }

  console.log("Lista completa de user_roles:");
  roles.forEach(r => {
    console.log(`User ID: ${r.user_id} | Role: ${r.role}`);
  });
}

check();
