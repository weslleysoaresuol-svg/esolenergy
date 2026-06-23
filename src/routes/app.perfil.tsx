import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, profile, refresh, role } = useCurrentUser();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nome: form.nome, telefone: form.telefone, cpf_cnpj: form.cpf_cnpj,
      creci: form.creci, cidade: form.cidade, estado: form.estado, bio: form.bio,
      avatar_url: form.avatar_url, onboarding_completo: true,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Perfil atualizado"); await refresh(); navigate({ to: "/app" }); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Meu perfil</h1>
        <p className="text-muted-foreground">{profile?.onboarding_completo ? "Atualize seus dados" : "Complete seu cadastro para começar"}</p>
      </div>
      <Card className="p-6 border-0 shadow-md">
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nome completo *</Label><Input value={form.nome || ""} onChange={(e) => set("nome", e.target.value)} required /></div>
            <div><Label>Telefone / WhatsApp *</Label><Input value={form.telefone || ""} onChange={(e) => set("telefone", e.target.value)} required /></div>
            <div><Label>CPF / CNPJ</Label><Input value={form.cpf_cnpj || ""} onChange={(e) => set("cpf_cnpj", e.target.value)} /></div>
            <div><Label>CRECI / Registro</Label><Input value={form.creci || ""} onChange={(e) => set("creci", e.target.value)} /></div>
            <div><Label>Cidade</Label><Input value={form.cidade || ""} onChange={(e) => set("cidade", e.target.value)} /></div>
            <div><Label>Estado</Label><Input value={form.estado || ""} onChange={(e) => set("estado", e.target.value)} maxLength={2} /></div>
          </div>
          <div><Label>Bio profissional</Label><Textarea value={form.bio || ""} onChange={(e) => set("bio", e.target.value)} rows={3} /></div>
          <div><Label>Foto (URL)</Label><Input value={form.avatar_url || ""} onChange={(e) => set("avatar_url", e.target.value)} /></div>
          {role === "admin" && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-900">
              Você é <strong>administrador</strong>. Acesso total ao sistema.
            </div>
          )}
          <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy-deep">{saving ? "Salvando…" : "Salvar perfil"}</Button>
        </form>
      </Card>
    </div>
  );
}
