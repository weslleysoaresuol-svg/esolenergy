const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mmskdcvbnaqgbzmigfak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2tkY3ZibmFxZ2J6bWlnZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjA3MzAsImV4cCI6MjA5Nzc5NjczMH0.jgZLhfRohgQL6nKe-ZYaPqvSI5-i7QktYw5OpG2fRtI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking if validate_invite RPC returns the test token...");
  const { data, error } = await supabase.rpc('validate_invite', {
    _token: '00000000-0000-0000-0000-000000000000'
  });

  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("RPC Result:", data);
  }

  console.log("\nChecking partner_invites directly for public access (checking if row exists)...");
  const { data: invite, error: inviteErr } = await supabase
    .from('partner_invites')
    .select('*')
    .eq('token', '00000000-0000-0000-0000-000000000000');

  if (inviteErr) {
    console.error("Direct Query Error:", inviteErr);
  } else {
    console.log("Direct Query Result:", invite);
  }
}

check();
