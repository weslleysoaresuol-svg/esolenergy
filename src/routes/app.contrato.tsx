import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/SignaturePad";
import { CONTRATO_VERSAO, EMPRESA, gerarContrato } from "@/lib/contract-template";
import { toast } from "sonner";

export const Route = createFileRoute("/app/contrato")({
  head: () => ({ meta: [{ title: "Contrato de Parceria — ESOL Energy" }] }),
  component: ContratoPage,
});

function ContratoPage() {
  const { user, profile, role, refresh } = useCurrentUser();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [aceito, setAceito] = useState(false);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (role === "admin" || profile.contrato_assinado) {
      navigate({ to: "/app" });
      return;
    }
    setNome(profile.nome || "");
    setCpf(profile.cpf_cnpj || "");
  }, [profile, role, navigate]);

  const contrato = gerarContrato({ nome, cpf });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!aceito) return toast.error("É necessário aceitar os termos");
    if (!assinatura) return toast.error("Desenhe sua assinatura");
    if (!nome.trim() || !cpf.trim()) return toast.error("Preencha nome e CPF");

    setSaving(true);
    try {
      // upload assinatura
      const blob = await (await fetch(assinatura)).blob();
      const path = `${user.id}/assinatura-${Date.now()}.png`;
      const up = await supabase.storage.from("parceiros").upload(path, blob, {
        contentType: "image/png",
        upsert: false,
      });
      if (up.error) throw up.error;

      // capture IP
      let ip = "";
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        ip = (await r.json()).ip ?? "";
      } catch {}

      const { error: insErr } = await supabase.from("contratos_parceria").insert({
        user_id: user.id,
        versao: CONTRATO_VERSAO,
        conteudo: contrato,
        nome_completo: nome.trim(),
        cpf: cpf.trim(),
        aceite_termos: true,
        assinatura_url: up.data.path,
        ip_assinatura: ip,
        user_agent: navigator.userAgent,
      });
      if (insErr) throw insErr;

      const { error: upErr } = await supabase
        .from("profiles")
        .update({ contrato_assinado: true, cpf_cnpj: cpf.trim(), nome: nome.trim() })
        .eq("id", user.id);
      if (upErr) throw upErr;

      toast.success("Contrato assinado com sucesso!");
      await refresh();
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao assinar contrato");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Contrato de Parceria</h1>
        <p className="text-muted-foreground">
          Última etapa do seu cadastro como parceiro {EMPRESA.razao}.
        </p>
      </div>

      <Card className="p-6 border-0 shadow-md">
        <div className="text-xs text-muted-foreground mb-2">Versão {CONTRATO_VERSAO}</div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed font-mono">
          {contrato}
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-md">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome completo *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label>Assinatura *</Label>
            <SignaturePad onChange={setAssinatura} />
          </div>

          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <Checkbox checked={aceito} onCheckedChange={(v) => setAceito(!!v)} className="mt-0.5" />
            <span>
              Declaro que <strong>li, compreendi e aceito integralmente</strong> os termos do Contrato de
              Parceria Comercial acima, e que as informações prestadas são verdadeiras. Reconheço a validade
              jurídica desta assinatura eletrônica nos termos da MP 2.200-2/2001 e da Lei 14.063/2020.
            </span>
          </label>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy-deep">
              {saving ? "Assinando…" : "Assinar e enviar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
