import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Clock, FileSignature, UserPlus } from "lucide-react";
import logo from "@/assets/esol-logo.png";

export const Route = createFileRoute("/convite/$token")({
  head: () => ({
    meta: [
      { title: "Convite de parceiro — ESOL Energy" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InvitePage,
});

type InviteState =
  | { status: "loading" }
  | { status: "invalid"; reason: string }
  | { status: "valid"; expiresAt: string };

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<InviteState>({ status: "loading" });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [roleToAssign, setRoleToAssign] = useState<string>("corretor");

  // Persiste token para uso após retorno do OAuth
  useEffect(() => {
    try { localStorage.setItem("pending_invite_token", token); } catch {}
  }, [token]);

  // Valida convite + se já está logado, consome direto
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("validate_invite" as any, { _token: token });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row) return setState({ status: "invalid", reason: "Link de convite não encontrado." });
      if (!row.valid) return setState({ status: "invalid", reason: row.reason ?? "Convite inválido." });
      setState({ status: "valid", expiresAt: row.expires_at });

      // Busca o cargo deste convite em ambas as tabelas (tratando indisponibilidade de schema cache)
      let cargo = "corretor";
      let emailPreenchido = "";
      
      try {
        const { data: convData } = await supabase
          .from("convites" as any)
          .select("email, role_to_assign")
          .eq("token", token)
          .maybeSingle() as any;
        if (convData) {
          if (convData.role_to_assign) cargo = convData.role_to_assign;
          if (convData.email) emailPreenchido = convData.email;
        }
      } catch (err) {
        // Silencia erro caso a tabela convites não exista no banco
      }

      try {
        if (cargo === "corretor") {
          // Busca apenas a coluna note para evitar erro de schema cache da coluna role_to_assign
          const { data: partnerData } = await supabase
            .from("partner_invites")
            .select("note")
            .eq("token", token)
            .maybeSingle() as any;
            
          if (partnerData?.note) {
            const noteText = partnerData.note;
            // Decodifica note format: "Equipe: email | Cargo: cargo" ou "Parceiro: email | Cargo: corretor"
            if (noteText.includes("| Cargo:")) {
              const parts = noteText.split("| Cargo:");
              const emailPart = parts[0].replace("Equipe:", "").replace("Parceiro:", "").trim();
              emailPreenchido = emailPart;
              cargo = parts[1].trim();
            } else {
              const cleanNote = noteText.replace("Equipe:", "").replace("Parceiro:", "").trim();
              emailPreenchido = cleanNote;
              if (noteText.startsWith("Equipe:")) {
                cargo = "auxiliar";
              }
            }
          }
        }
      } catch (err) {
        // Silencia erro de conexão
      }
      
      // Fallback via querystring
      const searchParams = new URLSearchParams(window.location.search);
      const emailQuery = searchParams.get("email");
      const cargoQuery = searchParams.get("cargo");
      
      if (emailQuery) emailPreenchido = emailQuery;
      if (cargoQuery) cargo = cargoQuery;
      
      setRoleToAssign(cargo);
      if (emailPreenchido) setEmail(emailPreenchido);


      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Se o usuário está logado com e-mail diferente do convite, desloga automaticamente para evitar conflito de conta
        if (emailPreenchido && userData.user.email?.toLowerCase() !== emailPreenchido.toLowerCase()) {
          toast.warning(`Você está logado como ${userData.user.email}. Este convite foi gerado para ${emailPreenchido}. Fazendo logout...`);
          await supabase.auth.signOut();
          window.location.reload();
          return;
        }

        // Se o usuário já possui um cargo ativo no sistema, direciona ele direto para a aplicação
        const { data: existingRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id);
        const roles = (existingRoles ?? []).map((r: any) => r.role);
        
        if (roles.includes("admin")) {
          toast.info("Você já é administrador e possui acesso total.");
          try { localStorage.removeItem("pending_invite_token"); } catch {}
          navigate({ to: "/app" });
          return;
        }
        if (roles.includes("corretor")) {
          try { localStorage.removeItem("pending_invite_token"); } catch {}
          navigate({ to: "/app" });
          return;
        }
        
        // Consome o convite caso ele esteja cadastrado mas ainda não tenha cargo associado
        const { error: rpcErr } = await supabase.rpc("consume_invite", { _token: token });
        if (rpcErr) {
          console.warn("RPC consume_invite falhou, executando fallback manual:", rpcErr);
          try {
            await supabase
              .from("partner_invites")
              .update({ 
                used_at: new Date().toISOString(), 
                used_by: userData.user.id 
              } as any)
              .eq("token", token);
            
            try {
              await supabase
                .from("convites" as any)
                .update({ 
                  used_at: new Date().toISOString(), 
                  used_by: userData.user.id,
                  status: "aceito"
                } as any)
                .eq("token", token);
            } catch (e) {}

            if (roleToAssign) {
              await supabase.from("user_roles").insert({
                user_id: userData.user.id,
                role: roleToAssign as any
              });
            }

            try { localStorage.removeItem("pending_invite_token"); } catch {}
            toast.success("Acesso liberado com sucesso!");
            navigate({ to: "/app" });
          } catch (fallbackErr) {
            console.error("Erro no fallback do useEffect:", fallbackErr);
          }
        } else {
          try { localStorage.removeItem("pending_invite_token"); } catch {}
          toast.success("Convite aceito com sucesso!");
          navigate({ to: "/app" });
        }
      }
    })();
  }, [token, navigate, roleToAssign]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/convite/" + token,
      });
      if (res.error) toast.error("Falha no login com Google");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/convite/" + token, data: { full_name: nome } },
    });
    if (error) { setLoading(false); return toast.error(error.message); }
    // Se já tem session (auto-confirm), consome agora
    if (data.session) {
      let consumeErr = null;
      try {
        const { error: rpcErr } = await supabase.rpc("consume_invite", { _token: token });
        consumeErr = rpcErr;
      } catch (err: any) {
        consumeErr = err;
      }

      // Fallback manual se o RPC falhar por falta de colunas/tabelas no banco de produção
      if (consumeErr) {
        try {
          // Atualiza apenas as colunas garantidas de partner_invites (used_at, used_by)
          await supabase
            .from("partner_invites")
            .update({ 
              used_at: new Date().toISOString(), 
              used_by: data.session.user.id 
            } as any)
            .eq("token", token);
          
          // Atualiza também na convites se existir
          try {
            await supabase
              .from("convites" as any)
              .update({ 
                used_at: new Date().toISOString(), 
                used_by: data.session.user.id,
                status: "aceito"
              } as any)
              .eq("token", token);
          } catch (e) {}

          // Atribui o cargo correto na user_roles
          if (roleToAssign) {
            await supabase.from("user_roles").insert({
              user_id: data.session.user.id,
              role: roleToAssign as any
            });
          }
          
          consumeErr = null; // Zera erro pois contornamos com sucesso!
        } catch (err) {
          // Silencia falha do fallback
        }
      }

      setLoading(false);
      if (consumeErr) return toast.error(consumeErr.message);
      
      try { localStorage.removeItem("pending_invite_token"); } catch {}
      toast.success("Conta criada! Vamos completar seu perfil.");
      navigate({ to: "/app" });
    } else {
      setLoading(false);
      toast.success("Confirme seu email para continuar.");
    }
  };

  if (state.status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Validando convite…</div>;
  }

  if (state.status === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-deep to-navy flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <img src={logo} alt="ESOL" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-navy mb-2">Convite indisponível</h1>
          <p className="text-sm text-muted-foreground mb-6">{state.reason}</p>
          <p className="text-xs text-muted-foreground">Solicite um novo link ao administrador da ESOL Energy.</p>
          <Link to="/" className="block text-sm text-navy mt-6 hover:underline">← Voltar ao site</Link>
        </div>
      </div>
    );
  }

  const hoursLeft = Math.max(0, Math.round((new Date(state.expiresAt).getTime() - Date.now()) / 3600000));

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-deep to-navy flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-center mb-6"><img src={logo} alt="ESOL" className="h-14 w-auto" /></div>
        <h1 className="text-2xl font-bold text-center text-navy mb-1">Bem-vindo à ESOL Energy</h1>
        <p className="text-sm text-center text-muted-foreground mb-2">
          {roleToAssign === "corretor" 
            ? "Você foi convidado para ser um consultor parceiro." 
            : "Você foi convidado para fazer parte da equipe interna."}
        </p>
        <p className="text-xs text-center text-muted-foreground mb-6 inline-flex items-center justify-center gap-1 w-full">
          <Clock className="w-3 h-3" /> Link válido por mais {hoursLeft}h
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Próximos passos</div>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3"><UserPlus className="w-4 h-4 mt-0.5 text-sun-deep flex-shrink-0" /><span><strong>1.</strong> Criar sua conta (Google ou email)</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-sun-deep flex-shrink-0" /><span><strong>2.</strong> Completar seu perfil de acesso</span></li>
            {roleToAssign === "corretor" && (
              <li className="flex gap-3"><FileSignature className="w-4 h-4 mt-0.5 text-sun-deep flex-shrink-0" /><span>
                <strong>3.</strong> Ler e assinar o contrato de parceria
              </span></li>
            )}
          </ol>
        </div>

        <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full mb-4 h-11">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Criar conta com Google
        </Button>

        <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><span className="relative flex justify-center text-xs uppercase bg-white px-2 text-muted-foreground">ou com email</span></div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div><Label>Nome completo</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-sun-deep hover:bg-sun text-navy">Criar conta e continuar</Button>
        </form>
      </div>
    </div>
  );
}
