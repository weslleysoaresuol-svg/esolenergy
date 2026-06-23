import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/app/novo")({
  component: NovoCliente,
});

const STEPS = ["Pessoais", "Imóvel", "Consumo", "Projeto"];

function NovoCliente() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState<any>({ imovel_tipo: "residencial", status: "novo" });
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!user) return;
    if (!f.nome || !f.telefone) return toast.error("Nome e telefone são obrigatórios");
    setSaving(true);
    const { data, error } = await supabase.from("clientes").insert({
      ...f, corretor_id: user.id,
      consumo_kwh: f.consumo_kwh ? Number(f.consumo_kwh) : null,
      valor_fatura: f.valor_fatura ? Number(f.valor_fatura) : null,
      potencia_kwp: f.potencia_kwp ? Number(f.potencia_kwp) : null,
      valor_estimado: f.valor_estimado ? Number(f.valor_estimado) : null,
      area_telhado: f.area_telhado ? Number(f.area_telhado) : null,
    }).select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Cliente cadastrado!");
    navigate({ to: "/app/cliente/$id", params: { id: data.id } });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Novo cliente</h1>
        <p className="text-muted-foreground">Etapa {step + 1} de {STEPS.length}: {STEPS[step]}</p>
      </div>
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${i <= step ? "bg-sun-deep" : "bg-slate-200"}`} />
        ))}
      </div>
      <Card className="p-6 border-0 shadow-md space-y-4">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Nome completo *</Label><Input value={f.nome || ""} onChange={(e) => set("nome", e.target.value)} required /></div>
            <div><Label>Telefone / WhatsApp *</Label><Input value={f.telefone || ""} onChange={(e) => set("telefone", e.target.value)} required /></div>
            <div><Label>Email</Label><Input type="email" value={f.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>CPF / CNPJ</Label><Input value={f.cpf_cnpj || ""} onChange={(e) => set("cpf_cnpj", e.target.value)} /></div>
            <div><Label>Data nascimento</Label><Input type="date" value={f.data_nascimento || ""} onChange={(e) => set("data_nascimento", e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Endereço</Label><Input value={f.endereco || ""} onChange={(e) => set("endereco", e.target.value)} /></div>
            <div><Label>Cidade</Label><Input value={f.cidade || ""} onChange={(e) => set("cidade", e.target.value)} /></div>
            <div><Label>Estado</Label><Input maxLength={2} value={f.estado || ""} onChange={(e) => set("estado", e.target.value)} /></div>
            <div><Label>CEP</Label><Input value={f.cep || ""} onChange={(e) => set("cep", e.target.value)} /></div>
          </div>
        )}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Tipo de imóvel</Label>
              <Select value={f.imovel_tipo} onValueChange={(v) => set("imovel_tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Área disponível telhado (m²)</Label><Input type="number" value={f.area_telhado || ""} onChange={(e) => set("area_telhado", e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Tipo de telhado</Label><Input placeholder="cerâmico, metálico, fibrocimento…" value={f.tipo_telhado || ""} onChange={(e) => set("tipo_telhado", e.target.value)} /></div>
          </div>
        )}
        {step === 2 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Concessionária</Label><Input value={f.concessionaria || ""} onChange={(e) => set("concessionaria", e.target.value)} /></div>
            <div><Label>Número UC</Label><Input value={f.numero_uc || ""} onChange={(e) => set("numero_uc", e.target.value)} /></div>
            <div><Label>Consumo médio (kWh/mês)</Label><Input type="number" value={f.consumo_kwh || ""} onChange={(e) => set("consumo_kwh", e.target.value)} /></div>
            <div><Label>Valor médio fatura (R$)</Label><Input type="number" step="0.01" value={f.valor_fatura || ""} onChange={(e) => set("valor_fatura", e.target.value)} /></div>
          </div>
        )}
        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Potência sugerida (kWp)</Label><Input type="number" step="0.01" value={f.potencia_kwp || ""} onChange={(e) => set("potencia_kwp", e.target.value)} /></div>
            <div><Label>Valor estimado (R$)</Label><Input type="number" step="0.01" value={f.valor_estimado || ""} onChange={(e) => set("valor_estimado", e.target.value)} /></div>
            <div><Label>Forma de pagamento</Label><Input placeholder="à vista, financiado…" value={f.forma_pagamento || ""} onChange={(e) => set("forma_pagamento", e.target.value)} /></div>
            <div><Label>Status inicial</Label>
              <Select value={f.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo lead</SelectItem>
                  <SelectItem value="contato">Em contato</SelectItem>
                  <SelectItem value="visita_agendada">Visita agendada</SelectItem>
                  <SelectItem value="proposta_enviada">Proposta enviada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Observações</Label><Textarea rows={3} value={f.observacoes || ""} onChange={(e) => set("observacoes", e.target.value)} /></div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← Voltar</Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} className="bg-navy hover:bg-navy-deep">Próximo →</Button>
          ) : (
            <Button type="button" onClick={save} disabled={saving} className="bg-sun-deep hover:bg-sun text-navy">{saving ? "Salvando…" : "Cadastrar cliente"}</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
