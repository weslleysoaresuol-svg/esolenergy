import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, profile, refresh, role } = useCurrentUser();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  useEffect(() => {
    (async () => {
      if (!form.avatar_url) return setAvatarPreview(null);
      // Treat as storage path if it doesn't look like a URL
      if (/^https?:\/\//.test(form.avatar_url)) {
        setAvatarPreview(form.avatar_url);
      } else {
        const { data } = await supabase.storage
          .from("parceiros")
          .createSignedUrl(form.avatar_url, 3600);
        setAvatarPreview(data?.signedUrl ?? null);
      }
    })();
  }, [form.avatar_url]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("parceiros")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      set("avatar_url", path);
      toast.success("Foto carregada");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nome: form.nome,
        telefone: form.telefone,
        cpf_cnpj: form.cpf_cnpj,
        cidade: form.cidade,
        estado: form.estado,
        bio: form.bio,
        avatar_url: form.avatar_url,
        onboarding_completo: true,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    await refresh();
    // Parceiro vai para o contrato, se ainda não assinou
    if (role !== "admin" && !profile?.contrato_assinado) navigate({ to: "/app/contrato" });
    else navigate({ to: "/app" });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Meu perfil</h1>
        <p className="text-muted-foreground">
          {profile?.onboarding_completo ? "Atualize seus dados" : "Complete seu cadastro para começar"}
        </p>
      </div>
      <Card className="p-6 border-0 shadow-md">
        <form onSubmit={save} className="space-y-5">
          {/* Foto */}
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Foto do consultor</Label>
              <div className="flex gap-2 flex-wrap">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1" /> Anexar
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => cameraRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-1" /> Tirar foto
                </Button>
                {uploading && <span className="text-xs text-muted-foreground self-center">Enviando…</span>}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nome completo *</Label><Input value={form.nome || ""} onChange={(e) => set("nome", e.target.value)} required /></div>
            <div><Label>Telefone / WhatsApp *</Label><Input value={form.telefone || ""} onChange={(e) => set("telefone", e.target.value)} required /></div>
            <div><Label>CPF / CNPJ</Label><Input value={form.cpf_cnpj || ""} onChange={(e) => set("cpf_cnpj", e.target.value)} /></div>
            <div><Label>Cidade</Label><Input value={form.cidade || ""} onChange={(e) => set("cidade", e.target.value)} /></div>
            <div><Label>Estado</Label><Input value={form.estado || ""} onChange={(e) => set("estado", e.target.value)} maxLength={2} /></div>
          </div>
          <div><Label>Bio profissional</Label><Textarea value={form.bio || ""} onChange={(e) => set("bio", e.target.value)} rows={3} /></div>

          {role === "admin" && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-900">
              Você é <strong>administrador</strong>. Acesso total ao sistema.
            </div>
          )}
          {role !== "admin" && !profile?.contrato_assinado && (
            <div className="bg-sun/10 border border-sun/40 p-3 rounded text-sm text-navy">
              Após salvar, você será direcionado para a <strong>assinatura do contrato de parceria</strong>.
            </div>
          )}
          <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy-deep">
            {saving ? "Salvando…" : "Salvar perfil"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
