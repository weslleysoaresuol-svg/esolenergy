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
import { Zap, ArrowRight, Save, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/app/novo")({
  head: () => ({ meta: [{ title: "Cadastro Expresso — ESOL Energy" }] }),
  component: NovoCliente,
});

const STEPS = ["Dados & Fatura", "Imóvel (Opcional)", "Especificações (Opcional)"];

function NovoCliente() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // Estado do formulário unificado
  const [f, setF] = useState<any>({
    nome: "",
    telefone: "",
    email: "",
    cpf_cnpj: "",
    cep: "",
    cidade: "",
    estado: "",
    endereco: "",
    consumo_kwh: "",
    valor_fatura: "",
    imovel_tipo: "residencial",
    area_telhado: "",
    tipo_telhado: "",
    concessionaria: "",
    numero_uc: "",
    potencia_kwp: "",
    valor_estimado: "",
    forma_pagamento: "",
    status: "novo",
    observacoes: ""
  });

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const handleCepChange = async (cepValue: string) => {
    set("cep", cepValue);
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setF((prev: any) => ({
            ...prev,
            cep: cepValue,
            cidade: data.localidade || prev.cidade || "",
            estado: data.uf || prev.estado || "",
            endereco: data.logradouro 
              ? `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ""}` 
              : prev.endereco || ""
          }));
          toast.success("CEP localizado!");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const save = async (redirectDirectToProposal = true) => {
    if (!user) return;
    if (!f.nome || !f.telefone) {
      toast.error("Nome e Telefone/WhatsApp são obrigatórios para registrar o lead.");
      setStep(0);
      return;
    }
    
    setSaving(true);
    try {
      const { data, error } = await supabase.from("clientes").insert({
        ...f,
        corretor_id: user.id,
        consumo_kwh: f.consumo_kwh ? Number(f.consumo_kwh) : null,
        valor_fatura: f.valor_fatura ? Number(f.valor_fatura) : null,
        potencia_kwp: f.potencia_kwp ? Number(f.potencia_kwp) : null,
        valor_estimado: f.valor_estimado ? Number(f.valor_estimado) : null,
        area_telhado: f.area_telhado ? Number(f.area_telhado) : null,
      }).select().single();

      if (error) {
        toast.error("Erro ao salvar: " + error.message);
      } else {
        toast.success("Cliente cadastrado com sucesso!");
        if (redirectDirectToProposal) {
          // Redireciona diretamente para a criação de propostas com o ID do cliente
          navigate({ to: "/app/propostas/nova", search: { cliente: data.id } as any });
        } else {
          // Redireciona para a ficha do cliente recém-criado
          navigate({ to: "/app/cliente/$id", params: { id: data.id } });
        }
      }
    } catch (err) {
      toast.error("Falha de conexão com o banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
          <Zap className="w-8 h-8 text-sun-deep" /> Cadastro Expresso Solar
        </h1>
        <p className="text-muted-foreground text-sm">
          Insira os dados essenciais para qualificar e gerar a proposta comercial em segundos.
        </p>
      </div>

      {/* Indicador de passos */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <button 
            key={s} 
            onClick={() => setStep(i)}
            className="flex-1 text-left focus:outline-none"
          >
            <div className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-sun-deep" : "bg-slate-200"}`} />
            <span className={`text-[10px] mt-1 block font-bold uppercase tracking-wider ${i === step ? "text-navy" : "text-slate-400"}`}>
              {s}
            </span>
          </button>
        ))}
      </div>

      <Card className="p-6 border-0 shadow-md space-y-4 bg-white">
        {/* PASSO 0: DADOS ESSENCIAIS (PESSOAIS & CONSUMO) */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy border-b pb-2 mb-3">📋 Dados de Contato e Fatura</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Nome Completo do Cliente *</Label>
                <Input value={f.nome || ""} onChange={(e) => set("nome", e.target.value)} required placeholder="Ex: João Silva Santos" className="h-10 text-xs mt-1" />
              </div>
              
              <div>
                <Label className="text-xs font-semibold">Telefone / WhatsApp *</Label>
                <Input value={f.telefone || ""} onChange={(e) => set("telefone", e.target.value)} required placeholder="Ex: (11) 99999-9999" className="h-10 text-xs mt-1" />
              </div>
              
              <div>
                <Label className="text-xs font-semibold">E-mail</Label>
                <Input type="email" value={f.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="Ex: joao@email.com" className="h-10 text-xs mt-1" />
              </div>

              {/* Destaque para dados da Fatura de Energia */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-navy flex items-center gap-1">⚡ Consumo Energético do Lead</span>
                  <span className="text-[10px] text-muted-foreground">Preencha ao menos um campo</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Valor Médio da Fatura (R$)</Label>
                  <Input type="number" step="0.01" value={f.valor_fatura || ""} onChange={(e) => set("valor_fatura", e.target.value)} placeholder="Ex: 450.00" className="h-9 text-xs mt-1 bg-white font-bold text-navy" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Consumo Médio Mensal (kWh/mês)</Label>
                  <Input type="number" value={f.consumo_kwh || ""} onChange={(e) => set("consumo_kwh", e.target.value)} placeholder="Ex: 500" className="h-9 text-xs mt-1 bg-white font-bold text-navy" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">CEP (Calcula Cidade/UF)</Label>
                <Input placeholder="Ex: 01001-000" value={f.cep || ""} onChange={(e) => handleCepChange(e.target.value)} className="h-10 text-xs mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs font-semibold">Cidade</Label>
                  <Input value={f.cidade || ""} onChange={(e) => set("cidade", e.target.value)} className="h-10 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">UF</Label>
                  <Input maxLength={2} value={f.estado || ""} onChange={(e) => set("estado", e.target.value.toUpperCase())} className="h-10 text-xs mt-1" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Endereço</Label>
                <Input placeholder="Rua, número, bairro..." value={f.endereco || ""} onChange={(e) => set("endereco", e.target.value)} className="h-10 text-xs mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* PASSO 1: DADOS DO IMÓVEL (OPCIONAL) */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy border-b pb-2 mb-3">🏠 Especificações do Local (Opcional)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Tipo de Imóvel</Label>
                <Select value={f.imovel_tipo} onValueChange={(v) => set("imovel_tipo", v)}>
                  <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Área Disponível para Telhado (m²)</Label>
                <Input type="number" value={f.area_telhado || ""} onChange={(e) => set("area_telhado", e.target.value)} placeholder="Ex: 45" className="h-10 text-xs mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Tipo de Telhado / Estrutura</Label>
                <Input placeholder="Ex: Cerâmico, Metálico, Fibrocimento, Laje..." value={f.tipo_telhado || ""} onChange={(e) => set("tipo_telhado", e.target.value)} className="h-10 text-xs mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: ESPECIFICAÇÕES DO PROJETO (OPCIONAL) */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy border-b pb-2 mb-3">🛠️ Parâmetros Adicionais do Projeto (Opcional)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Concessionária de Energia</Label>
                <Input placeholder="Ex: CPFL, Enel, Cemig..." value={f.concessionaria || ""} onChange={(e) => set("concessionaria", e.target.value)} className="h-10 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Número da Unidade Consumidora (UC)</Label>
                <Input placeholder="Ex: 887654321" value={f.numero_uc || ""} onChange={(e) => set("numero_uc", e.target.value)} className="h-10 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Potência Pré-Sugerida (kWp)</Label>
                <Input type="number" step="0.01" value={f.potencia_kwp || ""} onChange={(e) => set("potencia_kwp", e.target.value)} placeholder="Ex: 5.4" className="h-10 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Valor Estimado do Sistema (R$)</Label>
                <Input type="number" step="0.01" value={f.valor_estimado || ""} onChange={(e) => set("valor_estimado", e.target.value)} placeholder="Ex: 18500.00" className="h-10 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Forma de Pagamento Preferencial</Label>
                <Input placeholder="Ex: Financ. Solfácil, À Vista, Cartão..." value={f.forma_pagamento || ""} onChange={(e) => set("forma_pagamento", e.target.value)} className="h-10 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Status de Cadastro Inicial</Label>
                <Select value={f.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo Lead</SelectItem>
                    <SelectItem value="contato">Em Contato</SelectItem>
                    <SelectItem value="visita_agendada">Vistoria Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Observações Internas</Label>
                <Textarea rows={3} value={f.observacoes || ""} onChange={(e) => set("observacoes", e.target.value)} placeholder="Notas sobre a conversa ou restrições..." className="text-xs mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* BOTOES INFERIORES DE AÇÃO EXTRAPOLADOS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t">
          <div className="flex gap-2 w-full sm:w-auto justify-start">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep((s) => Math.max(0, s - 1))} 
              disabled={step === 0}
              className="h-11 text-xs"
            >
              ← Voltar
            </Button>
            
            {step < STEPS.length - 1 && (
              <Button 
                type="button" 
                onClick={() => setStep((s) => s + 1)} 
                variant="secondary"
                className="h-11 text-xs font-semibold flex items-center gap-1"
              >
                Configurar Telhado <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Botão Secundário: Salvar e ver Ficha */}
            <Button
              type="button"
              variant="outline"
              disabled={saving || !f.nome || !f.telefone}
              onClick={() => save(false)}
              className="h-11 text-xs font-semibold border-slate-300 text-slate-700 w-full sm:w-auto"
            >
              {saving ? "Salvando..." : "Apenas Salvar Lead"}
            </Button>

            {/* Botão Principal: Salvar e ir DIRETO para dimensionar a Proposta */}
            <Button 
              type="button" 
              onClick={() => save(true)} 
              disabled={saving || !f.nome || !f.telefone} 
              className="bg-sun hover:bg-sun-deep text-navy font-extrabold h-11 text-xs px-6 flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto"
            >
              {saving ? "Salvando..." : "Salvar & Gerar Proposta 🚀"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
