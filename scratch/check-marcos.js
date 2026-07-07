const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mmskdcvbnaqgbzmigfak.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
