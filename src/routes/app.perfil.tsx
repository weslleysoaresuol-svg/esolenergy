import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, AlertTriangle, Banknote, QrCode, ShieldCheck } from "lucide-react";
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
        // Dados bancários/Pix
        pix_tipo: form.pix_tipo || null,
        pix_chave: form.pix_chave || null,
        banco_nome: form.banco_nome || null,
        banco_agencia: form.banco_agencia || null,
        banco_conta: form.banco_conta || null,
      } as any)
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado com sucesso!");
    await refresh();
    // Parceiro vai para o contrato, se ainda não assinou
    if (role === "corretor" && !profile?.contrato_assinado) navigate({ to: "/app/contrato" });
    else navigate({ to: "/app" });
  };

  const temPix = !!(form.pix_tipo && form.pix_chave);
  const temBanco = !!(form.banco_nome && form.banco_conta);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Meu Perfil</h1>
        <p className="text-muted-foreground">
          {profile?.onboarding_completo ? "Atualize seus dados" : "Complete seu cadastro para começar"}
        </p>
      </div>

      <form onSubmit={save} className="space-y-5">
        {/* Card: Dados Pessoais */}
        <Card className="p-6 border-0 shadow-md space-y-5">
          <h2 className="font-bold text-navy text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Dados Pessoais
          </h2>

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
            <div><Label>Estado (UF)</Label><Input value={form.estado || ""} onChange={(e) => set("estado", e.target.value)} maxLength={2} /></div>
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
        </Card>

        {/* Card: Dados para Recebimento de Comissões */}
        <Card className="p-6 border-0 shadow-md space-y-5">
          <div>
            <h2 className="font-bold text-navy text-base flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" /> Dados para Recebimento de Comissões
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Informe conta bancária ou Pix para receber suas comissões de vendas.
            </p>
          </div>

          {/* Banner de aviso obrigatório */}
          <div className="flex gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 leading-relaxed">
              <strong>Atenção:</strong> Os dados de pagamento <strong>devem estar cadastrados em seu CPF</strong>.
              Chaves Pix ou contas bancárias de terceiros (cônjuge, empresa, familiar) não serão aceitas para
              pagamento de comissões, conforme política da ESOL Energy.
            </div>
          </div>

          {/* Seção Pix */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-navy" />
              <h3 className="font-semibold text-navy text-sm">Chave Pix (Preferencial)</h3>
              {temPix && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Cadastrado</span>}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo da chave Pix</Label>
                <Select value={form.pix_tipo || ""} onValueChange={(v) => set("pix_tipo", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">🪪 CPF (recomendado)</SelectItem>
                    <SelectItem value="celular">📱 Celular</SelectItem>
                    <SelectItem value="email">📧 E-mail</SelectItem>
                    <SelectItem value="aleatoria">🔑 Chave Aleatória (EVP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Chave Pix</Label>
                <Input
                  className="mt-1"
                  placeholder={
                    form.pix_tipo === "cpf" ? "000.000.000-00"
                    : form.pix_tipo === "celular" ? "(11) 99999-9999"
                    : form.pix_tipo === "email" ? "seu@email.com"
                    : form.pix_tipo === "aleatoria" ? "xxxxxxxx-xxxx-xxxx-xxxx"
                    : "Selecione o tipo primeiro"
                  }
                  value={form.pix_chave || ""}
                  onChange={(e) => set("pix_chave", e.target.value)}
                />
              </div>
            </div>
            {form.pix_tipo === "cpf" && form.cpf_cnpj && form.pix_chave && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Lembre-se que a chave Pix deve estar vinculada ao CPF cadastrado: {form.cpf_cnpj}
              </p>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-navy" />
              <h3 className="font-semibold text-navy text-sm">Conta Bancária (alternativo ao Pix)</h3>
              {temBanco && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Cadastrado</span>}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <Label className="text-xs">Banco</Label>
                <Input className="mt-1" placeholder="Ex: Nubank, Itaú, Bradesco, C6 Bank..." value={form.banco_nome || ""} onChange={(e) => set("banco_nome", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Agência</Label>
                <Input className="mt-1" placeholder="0000" value={form.banco_agencia || ""} onChange={(e) => set("banco_agencia", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Conta / Dígito</Label>
                <Input className="mt-1" placeholder="00000-0" value={form.banco_conta || ""} onChange={(e) => set("banco_conta", e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              A conta deve estar no seu CPF. TED para conta de terceiros não será processada.
            </p>
          </div>
        </Card>

        <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy-deep w-full sm:w-auto">
          {saving ? "Salvando…" : "Salvar perfil"}
        </Button>
      </form>
    </div>
  );
}
