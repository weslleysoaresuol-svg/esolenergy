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
import { CONTRATO_VERSAO, EMPRESA, gerarContrato, gerarTermoUsoEquipe } from "@/lib/contract-template";
import { toast } from "sonner";
import { Camera, Upload, ShieldCheck, FileCheck } from "lucide-react";

export const Route = createFileRoute("/app/contrato")({
  head: () => ({ meta: [{ title: "Contrato de Parceria — ESOL Energy" }] }),
  component: ContratoPage,
});

function ContratoPage() {
  const { user, profile, role, refresh, loading } = useCurrentUser();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [aceito, setAceito] = useState(false);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Estados para Uploads de Identidade
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [docFrenteFile, setDocFrenteFile] = useState<File | null>(null);
  const [docVersoFile, setDocVersoFile] = useState<File | null>(null);

  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [docFrentePreview, setDocFrentePreview] = useState<string | null>(null);
  const [docVersoPreview, setDocVersoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !profile) return;
    if (role === "admin" || role !== "corretor" || profile.contrato_assinado) {
      navigate({ to: "/app" });
      return;
    }
    setNome(profile.nome || "");
    setCpf(profile.cpf_cnpj || "");
  }, [loading, profile, role, navigate]);

  const handleFileChange = (file: File, type: "selfie" | "frente" | "verso") => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "selfie") {
        setSelfieFile(file);
        setSelfiePreview(reader.result as string);
      } else if (type === "frente") {
        setDocFrenteFile(file);
        setDocFrentePreview(reader.result as string);
      } else {
        setDocVersoFile(file);
        setDocVersoPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    corretor: "Parceiro",
    auxiliar: "Auxiliar Admin",
    atendente: "Atendente",
    vendedor: "Vendedor Interno",
    engenheiro: "Engenheiro / Projetista",
    pos_vendas: "Pós-Vendas & Logística",
    financeiro: "Financeiro / Contábil",
  };

  const contrato = role === "corretor"
    ? gerarContrato({ nome, cpf })
    : gerarTermoUsoEquipe({ nome, cpf, cargo: ROLE_LABELS[role ?? ""] || "Colaborador" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!aceito) return toast.error("É necessário aceitar os termos");
    if (!assinatura) return toast.error("Desenhe sua assinatura");
    if (!nome.trim() || !cpf.trim()) return toast.error("Preencha nome e CPF");

    // Valida uploads obrigatórios
    if (!selfieFile) return toast.error("Por favor, envie a Selfie segurando o documento.");
    if (!docFrenteFile) return toast.error("Por favor, envie a foto da Frente do seu documento.");
    if (!docVersoFile) return toast.error("Por favor, envie a foto do Verso do seu documento.");

    setSaving(true);
    try {
      // 1. Upload assinatura
      const blob = await (await fetch(assinatura)).blob();
      const path = `${user.id}/assinatura-${Date.now()}.png`;
      const up = await supabase.storage.from("parceiros").upload(path, blob, {
        contentType: "image/png",
        upsert: false,
      });
      if (up.error) throw up.error;

      // 2. Upload Selfie
      const selfieExt = selfieFile.name.split(".").pop();
      const selfiePath = `${user.id}/selfie-${Date.now()}.${selfieExt}`;
      const upSelfie = await supabase.storage.from("parceiros").upload(selfiePath, selfieFile, {
        contentType: selfieFile.type,
        upsert: false,
      });
      if (upSelfie.error) throw upSelfie.error;

      // 3. Upload Frente
      const frenteExt = docFrenteFile.name.split(".").pop();
      const frentePath = `${user.id}/doc-frente-${Date.now()}.${frenteExt}`;
      const upFrente = await supabase.storage.from("parceiros").upload(frentePath, docFrenteFile, {
        contentType: docFrenteFile.type,
        upsert: false,
      });
      if (upFrente.error) throw upFrente.error;

      // 4. Upload Verso
      const versoExt = docVersoFile.name.split(".").pop();
      const versoPath = `${user.id}/doc-verso-${Date.now()}.${versoExt}`;
      const upVerso = await supabase.storage.from("parceiros").upload(versoPath, docVersoFile, {
        contentType: docVersoFile.type,
        upsert: false,
      });
      if (upVerso.error) throw upVerso.error;

      // capture IP
      let ip = "";
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        ip = (await r.json()).ip ?? "";
      } catch {}

      // Calcular hash SHA-256 do contrato para garantia de integridade
      const msgUint8 = new TextEncoder().encode(contrato);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const { error: insErr } = await (supabase.from as any)("contratos_parceria").insert({
        user_id: user.id,
        versao: CONTRATO_VERSAO,
        conteudo: contrato,
        nome_completo: nome.trim(),
        cpf: cpf.trim(),
        aceite_termos: true,
        assinatura_url: up.data.path,
        ip_assinatura: ip,
        user_agent: navigator.userAgent,
        selfie_url: upSelfie.data.path,
        documento_frente_url: upFrente.data.path,
        documento_verso_url: upVerso.data.path,
        codigo_verificacao_email: user.email,
        hash_conteudo_contrato: hashHex,
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
        <h1 className="text-3xl font-bold text-navy">
          {role === "corretor" ? "Contrato de Parceria" : "Termo de Confidencialidade & Segurança"}
        </h1>
        <p className="text-muted-foreground">
          {role === "corretor" 
            ? `Última etapa do seu cadastro como parceiro ${EMPRESA.razao}.`
            : `Última etapa do seu onboarding de acesso na equipe ${EMPRESA.razao}.`}
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

          {/* Fortalecimento Jurídico: Fotos de Validação de Identidade */}
          <div className="border-t pt-5 space-y-4">
            <h3 className="text-sm font-bold text-navy uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Validação de Identidade & Validade Jurídica
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Para garantir a validade jurídica deste termo de parceria (conforme a Lei 14.063/2020), precisamos validar sua identidade por meio de foto de documento e selfie de confirmação.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Selfie */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  1. Selfie com o Documento *
                </Label>
                <div 
                  onClick={() => document.getElementById("file-selfie")?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] hover:bg-slate-50 ${selfiePreview ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 hover:border-navy/30"}`}
                >
                  {selfiePreview ? (
                    <div className="space-y-2">
                      <img src={selfiePreview} alt="Selfie" className="w-16 h-16 object-cover rounded-full mx-auto border-2 border-emerald-500 shadow" />
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ Selfie Carregada</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-muted-foreground">
                      <Camera className="w-6 h-6 mx-auto text-slate-400" />
                      <span className="text-[10px] font-bold block uppercase text-slate-500">Tirar / Enviar Selfie</span>
                      <span className="text-[9px] block text-slate-400">Rosto + Documento visíveis</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="file-selfie" 
                    accept="image/*" 
                    capture="user" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file, "selfie");
                    }}
                  />
                </div>
              </div>

              {/* Frente do Documento */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  2. Documento (Frente) *
                </Label>
                <div 
                  onClick={() => document.getElementById("file-frente")?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] hover:bg-slate-50 ${docFrentePreview ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 hover:border-navy/30"}`}
                >
                  {docFrentePreview ? (
                    <div className="space-y-2">
                      <img src={docFrentePreview} alt="Doc Frente" className="w-20 h-12 object-cover rounded-lg mx-auto border-2 border-emerald-500 shadow" />
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ Frente Carregada</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-muted-foreground">
                      <Upload className="w-6 h-6 mx-auto text-slate-400" />
                      <span className="text-[10px] font-bold block uppercase text-slate-500">Frente do RG/CNH</span>
                      <span className="text-[9px] block text-slate-400">Imagem legível e sem reflexo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="file-frente" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file, "frente");
                    }}
                  />
                </div>
              </div>

              {/* Verso do Documento */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  3. Documento (Verso) *
                </Label>
                <div 
                  onClick={() => document.getElementById("file-verso")?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] hover:bg-slate-50 ${docVersoPreview ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 hover:border-navy/30"}`}
                >
                  {docVersoPreview ? (
                    <div className="space-y-2">
                      <img src={docVersoPreview} alt="Doc Verso" className="w-20 h-12 object-cover rounded-lg mx-auto border-2 border-emerald-500 shadow" />
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ Verso Carregado</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-muted-foreground">
                      <Upload className="w-6 h-6 mx-auto text-slate-400" />
                      <span className="text-[10px] font-bold block uppercase text-slate-500">Verso do RG/CNH</span>
                      <span className="text-[9px] block text-slate-400">Imagem legível e sem reflexo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="file-verso" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file, "verso");
                    }}
                  />
                </div>
              </div>
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
