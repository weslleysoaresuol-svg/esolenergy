import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Landmark, Clock, CheckCircle2, XCircle, Plus, Send, HelpCircle } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/financiamentos/")({
  head: () => ({ meta: [{ title: "Financiamentos — ESOL Energy" }] }),
  component: FinanciamentosList,
});

const STATUS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  aguardando_documentos: { label: "Aguardando documentos", color: "bg-slate-100 text-slate-700", icon: Clock },
  em_analise: { label: "Em análise", color: "bg-blue-100 text-blue-700", icon: Clock },
  pre_aprovado: { label: "Pré-aprovado", color: "bg-amber-100 text-amber-700", icon: Clock },
  aprovado: { label: "Aprovado", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  recusado: { label: "Recusado", color: "bg-rose-100 text-rose-700", icon: XCircle },
  contrato_assinado: { label: "Contrato assinado", color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
  liberado: { label: "Liberado", color: "bg-green-200 text-green-800", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-500", icon: XCircle },
};

function FinanciamentosList() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  // Novo Financiamento (Simulações)
  const [openNew, setOpenNew] = useState(false);
  const [simType, setSimType] = useState<"pf" | "pj">("pf");
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [clientes, setClientes] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Estados dos Endereços e Dados Dinâmicos do IBGE/CEP
  const [ufs, setUfs] = useState<{ sigla: string; nome: string }[]>([]);
  const [pfCidadesList, setPfCidadesList] = useState<string[]>([]);
  const [pjCidadesList, setPjCidadesList] = useState<string[]>([]);

  // Campos de Simulação Comuns e Específicos
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [vincularPedidoId, setVincularPedidoId] = useState("");
  
  // PF Form States (Passo 1/2)
  const [pfNome, setPfNome] = useState("");
  const [pfCpf, setPfCpf] = useState("");
  const [pfTelefone, setPfTelefone] = useState("");
  const [pfEmail, setPfEmail] = useState("");
  const [pfNasc, setPfNasc] = useState("");
  const [pfEstadoCivil, setPfEstadoCivil] = useState("");
  const [pfValor, setPfValor] = useState("");
  const [pfRenda, setPfRenda] = useState("");
  const [pfKwp, setPfKwp] = useState("");
  const [pfCarencia, setPfCarencia] = useState("30");
  const [pfContaLuz, setPfContaLuz] = useState("");
  const [pfMesmoTitular, setPfMesmoTitular] = useState("sim");

  // PF Form States (Passo 2/2)
  const [pfCep, setPfCep] = useState("");
  const [pfEstado, setPfEstado] = useState("");
  const [pfCidade, setPfCidade] = useState("");
  const [pfEndereco, setPfEndereco] = useState("");
  const [pfBairro, setPfBairro] = useState("");
  const [pfNumero, setPfNumero] = useState("");
  const [pfComplemento, setPfComplemento] = useState("");
  const [pfSolicitarEspecial, setPfSolicitarEspecial] = useState(false);

  // PJ Form States (Passo 1/2)
  const [pjSocioNome, setPjSocioNome] = useState("");
  const [pjCnpj, setPjCnpj] = useState("");
  const [pjRazaoSocial, setPjRazaoSocial] = useState("");
  const [pjSocioCpf, setPjSocioCpf] = useState("");
  const [pjTelefone, setPjTelefone] = useState("");
  const [pjEmail, setPjEmail] = useState("");
  const [pjSocioNasc, setPjSocioNasc] = useState("");
  const [pjFundacao, setPjFundacao] = useState("");
  const [pjFaturamento, setPjFaturamento] = useState("");
  const [pjSocioRenda, setPjSocioRenda] = useState("");
  const [pjValor, setPjValor] = useState("");
  const [pjCarencia, setPjCarencia] = useState("30");
  const [pjParcelas, setPjParcelas] = useState<string[]>(["60"]);
  const [pjKwp, setPjKwp] = useState("");
  const [pjContaLuz, setPjContaLuz] = useState("");

  // PJ Form States (Passo 2/2)
  const [pjCep, setPjCep] = useState("");
  const [pjEstado, setPjEstado] = useState("");
  const [pjCidade, setPjCidade] = useState("");
  const [pjEndereco, setPjEndereco] = useState("");
  const [pjBairro, setPjBairro] = useState("");
  const [pjNumero, setPjNumero] = useState("");
  const [pjComplemento, setPjComplemento] = useState("");

  const loadData = async () => {
    if (!user) return;
    const [
      { data: fins },
      { data: clis },
      { data: peds }
    ] = await Promise.all([
      (supabase.from as any)("financiamentos")
        .select("*, cliente:cliente_id(nome, telefone)")
        .order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome").order("nome"),
      (supabase.from as any)("pedidos").select("id, numero, valor_total").order("numero")
    ]);

    setItems(fins || []);
    setClientes(clis || []);
    setPedidos(peds || []);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Carregar Estados do IBGE no Mount
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?ordenar=nome")
      .then((res) => res.json())
      .then((data) => setUfs(data || []))
      .catch(() => {});
  }, []);

  // Carregar cidades dinâmicas do PF
  useEffect(() => {
    if (!pfEstado) {
      setPfCidadesList([]);
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${pfEstado}/municipios?ordenar=nome`)
      .then((res) => res.json())
      .then((data) => setPfCidadesList((data || []).map((c: any) => c.nome)))
      .catch(() => {});
  }, [pfEstado]);

  // Carregar cidades dinâmicas do PJ
  useEffect(() => {
    if (!pjEstado) {
      setPjCidadesList([]);
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${pjEstado}/municipios?ordenar=nome`)
      .then((res) => res.json())
      .then((data) => setPjCidadesList((data || []).map((c: any) => c.nome)))
      .catch(() => {});
  }, [pjEstado]);

  // Pre-fill fields when selecting client in modal
  useEffect(() => {
    if (!selectedClienteId) return;
    (async () => {
      const { data } = await supabase.from("clientes").select("*").eq("id", selectedClienteId).maybeSingle();
      if (data) {
        if (simType === "pf") {
          setPfNome(data.nome || "");
          setPfCpf(data.cpf_cnpj || "");
          setPfTelefone(data.telefone || "");
          setPfEmail(data.email || "");
          setPfValor(data.valor_estimado ? String(data.valor_estimado) : "");
          setPfEstado(data.estado || "");
          setPfCidade(data.cidade || "");
        } else {
          setPjRazaoSocial(data.nome || "");
          setPjCnpj(data.cpf_cnpj || "");
          setPjTelefone(data.telefone || "");
          setPjEmail(data.email || "");
          setPjValor(data.valor_estimado ? String(data.valor_estimado) : "");
          setPjEstado(data.estado || "");
          setPjCidade(data.cidade || "");
        }
      }
    })();
  }, [selectedClienteId, simType]);

  // Buscar endereço via CEP para PF
  const handlePfCepChange = async (cep: string) => {
    setPfCep(cep);
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setPfEstado(data.uf || "");
          setPfBairro(data.bairro || "");
          setPfEndereco(data.logradouro || "");
          // Espera o trigger do estado recarregar a lista de cidades e então seleciona a cidade
          setTimeout(() => {
            setPfCidade(data.localidade || "");
          }, 400);
          toast.success("Endereço preenchido!");
        }
      } catch (err) {}
    }
  };

  // Buscar endereço via CEP para PJ
  const handlePjCepChange = async (cep: string) => {
    setPjCep(cep);
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setPjEstado(data.uf || "");
          setPjBairro(data.bairro || "");
          setPjEndereco(data.logradouro || "");
          setTimeout(() => {
            setPjCidade(data.localidade || "");
          }, 400);
          toast.success("Endereço preenchido!");
        }
      } catch (err) {}
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId) return toast.error("Selecione o proponente (Cliente/Lead).");
    
    // Validação básica do Passo 1
    if (simType === "pf") {
      if (!pfNome || !pfCpf || !pfTelefone || !pfValor) {
        return toast.error("Preencha todos os campos obrigatórios.");
      }
    } else {
      if (!pjSocioNome || !pjCnpj || !pjRazaoSocial || !pjSocioCpf || !pjTelefone || !pjValor) {
        return toast.error("Preencha todos os campos obrigatórios.");
      }
    }
    setWizardStep(2);
  };

  const handleSubmitSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validação Passo 2
    if (simType === "pf") {
      if (!pfCep || !pfEstado || !pfCidade || !pfEndereco || !pfBairro || !pfNumero) {
        return toast.error("Por favor, preencha os campos de endereço obrigatórios.");
      }
    } else {
      if (!pjCep || !pjEstado || !pjCidade || !pjEndereco || !pjBairro || !pjNumero) {
        return toast.error("Por favor, preencha os campos de endereço obrigatórios.");
      }
    }

    setSaving(true);
    try {
      const valor = Number(simType === "pf" ? pfValor : pjValor);
      const parcelasOpt = simType === "pf" ? 60 : Number(pjParcelas[0] || "60");
      const taxa = 1.39;
      const i = taxa / 100;
      const pmt = (valor * i) / (1 - Math.pow(1 + i, -parcelasOpt));

      // ID randomizado para o financiamento
      const randomId = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { data, error } = await (supabase.from as any)("financiamentos").insert({
        id: randomId,
        parceiro_id: user.id,
        cliente_id: selectedClienteId,
        pedido_id: vincularPedidoId === "none" || !vincularPedidoId ? null : vincularPedidoId,
        valor_solicitado: valor,
        banco: "BV Financeira",
        financeira: simType === "pf" ? "Solfácil (Convencional)" : "Solfácil (Especial PJ)",
        parcelas: parcelasOpt,
        taxa_juros_am: taxa,
        parcela_mensal: pmt,
        status: "aguardando_documentos",
      }).select().single();

      if (error) throw error;

      // Atualiza os dados de contato e localização do cliente
      const docCliente = simType === "pf" ? pfCpf : pjCnpj;
      const estadoCliente = simType === "pf" ? pfEstado : pjEstado;
      const cidadeCliente = simType === "pf" ? pfCidade : pjCidade;
      const emailCliente = simType === "pf" ? pfEmail : pjEmail;
      const telefoneCliente = simType === "pf" ? pfTelefone : pjTelefone;

      await (supabase.from as any)("clientes").update({
        cpf_cnpj: docCliente || null,
        email: emailCliente || null,
        telefone: telefoneCliente || null,
        estado: estadoCliente || null,
        cidade: cidadeCliente || null,
        endereco: (simType === "pf" ? `${pfEndereco}, ${pfNumero} - ${pfBairro}` : `${pjEndereco}, ${pjNumero} - ${pjBairro}`),
      }).eq("id", selectedClienteId);

      // Registra na timeline
      await (supabase.from as any)("timeline_cliente").insert({
        cliente_id: selectedClienteId,
        parceiro_id: user.id,
        tipo: "financiamento",
        referencia_id: data.id,
        titulo: `Financiamento ${simType.toUpperCase()} Enviado`,
        descricao: `Simulação Passo 2 concluída com sucesso! Comprovante enviado para análise das operadoras.`,
      });

      toast.success("Solicitação de financiamento enviada com sucesso!");
      setOpenNew(false);
      
      // Reseta os estados
      setWizardStep(1);
      setSelectedClienteId("");
      setVincularPedidoId("");
      loadData();
    } catch (err: any) {
      toast.error("Erro ao enviar simulação: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePjParcela = (val: string) => {
    if (pjParcelas.includes(val)) {
      setPjParcelas(pjParcelas.filter((x) => x !== val));
    } else {
      if (pjParcelas.length >= 4) {
        toast.error("Selecione no máximo 4 opções de parcelas.");
        return;
      }
      setPjParcelas([...pjParcelas, val]);
    }
  };

  const filtered = items.filter((f) =>
    !q || f.cliente?.nome?.toLowerCase().includes(q.toLowerCase()) || f.banco?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1">
      {/* Topo do Financiamento */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
            <Landmark className="w-7 h-7 text-[#2E44B8]" /> Financiamentos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Nesta área, você pode gerenciar simulações e solicitações de financiamentos para seus clientes.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setSimType("pf"); setWizardStep(1); setOpenNew(true); }}
            className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-bold rounded-full text-xs px-5 py-2.5 transition shadow cursor-pointer border-0"
          >
            Financiamentos convencionais
          </button>
          <button
            onClick={() => { setSimType("pj"); setWizardStep(1); setOpenNew(true); }}
            className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-bold rounded-full text-xs px-5 py-2.5 transition shadow cursor-pointer border-0"
          >
            Financiamentos especiais
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white border border-slate-200/50 p-4 rounded-xl text-xs text-slate-500 gap-2">
        <span>Conheça nossa política de repasses e taxas operacionais clicando ao lado.</span>
        <button className="text-[#2E44B8] hover:underline font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-0 bg-transparent">
          <HelpCircle className="w-4 h-4" /> Termos de Repasse
        </button>
      </div>

      {/* Caixa de Busca */}
      <Card className="p-4 border border-slate-200/60 bg-white">
        <Input 
          placeholder="Buscar por cliente ou banco…" 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          className="h-10 text-xs max-w-sm"
        />
      </Card>

      {/* Lista de Financiamentos (Tabela Suns Brasil) */}
      <Card className="border border-slate-200/60 shadow-sm overflow-x-auto bg-white rounded-2xl">
        <table className="w-full text-sm">
          <thead className="suns-table-header text-left">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Código Pedido</th>
              <th className="p-3">Status de Aprovação</th>
              <th className="p-3">Status de Repasse</th>
              <th className="p-3">Nome do Cliente</th>
              <th className="p-3">Valor do Financiamento</th>
              <th className="p-3">Última Atualização</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs font-semibold">
            {filtered.map((f) => {
              const st = STATUS_LABEL[f.status] || STATUS_LABEL.em_analise;
              return (
                <tr key={f.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3">
                    <Link to="/app/financiamentos/$id" params={{ id: f.id }} className="text-[#2E44B8] font-bold hover:underline">
                      {f.id.substring(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-500">
                    <Badge variant="outline" className="text-[9px] font-bold border-slate-200 uppercase">
                      {f.financeira?.includes("PJ") ? "PJ" : "PF"}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-400">
                    {f.pedido_id ? f.pedido_id.substring(0, 8).toUpperCase() : "—"}
                  </td>
                  <td className="p-3">
                    <Badge className={`${st.color} border-0 text-[10px] font-bold py-0.5 px-2`}>
                      {st.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-400">
                    —
                  </td>
                  <td className="p-3 text-navy font-bold">{f.cliente?.nome || "Cliente indefinido"}</td>
                  <td className="p-3 text-navy font-extrabold">{BRL(Number(f.valor_solicitado))}</td>
                  <td className="p-3 text-slate-500 font-medium">
                    {new Date(f.updated_at || f.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3">
                    <Link to="/app/financiamentos/$id" params={{ id: f.id }} className="text-[#2E44B8] hover:underline font-bold">
                      Detalhes
                    </Link>
                  </td>
                </tr>
                );
              })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <Landmark className="w-8 h-8 opacity-30" />
            <span>Nenhum financiamento cadastrado. Crie uma simulação nos botões acima.</span>
          </div>
        )}
      </Card>
      <div className="text-xs text-slate-400 font-semibold pl-1">
        Quantidade de registros: {filtered.length}
      </div>

      {/* DIALOG DE SIMULAÇÃO PF / PJ (Estilo prints da Suns Brasil) */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
          <DialogHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <DialogTitle className="font-extrabold text-[#2E44B8] text-lg">
              Simulação de financiamento para {simType === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => { setSimType(simType === "pf" ? "pj" : "pf"); setWizardStep(1); }}
              className="text-xs text-[#2E44B8] hover:underline font-bold bg-[#EBF0F6] px-3.5 py-1.5 rounded-full border-0 cursor-pointer"
            >
              Deseja solicitar para {simType === "pf" ? "Pessoa Jurídica?" : "Pessoa Física?"}
            </button>
          </DialogHeader>

          {wizardStep === 1 ? (
            /* =================== PASSO 1 / 2 =================== */
            <form onSubmit={handleNextStep} className="space-y-6 pt-4 text-xs font-semibold text-slate-700">
              {/* Proponente e Pedido */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Proponente (Cliente/Lead)</Label>
                  <Select
                    value={selectedClienteId}
                    onValueChange={setSelectedClienteId}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Selecione o lead proponente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Vincular a Pedido (Opcional)</Label>
                  <Select
                    value={vincularPedidoId}
                    onValueChange={setVincularPedidoId}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {pedidos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>Pedido {p.numero} ({BRL(Number(p.valor_total))})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-extrabold text-[#2E44B8] text-sm mb-4">Dados da simulação (Passo 1/2)</h3>
                
                {simType === "pf" ? (
                  /* Form Passo 1 PF */
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <Label className="text-slate-600">Nome completo do cliente</Label>
                      <Input
                        value={pfNome}
                        onChange={(e) => setPfNome(e.target.value)}
                        placeholder="Nome do titular"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">CPF do cliente</Label>
                      <Input
                        value={pfCpf}
                        onChange={(e) => setPfCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Telefone com DDD do cliente</Label>
                      <Input
                        value={pfTelefone}
                        onChange={(e) => setPfTelefone(e.target.value)}
                        placeholder="+55 (99) 99999-9999"
                        className="h-10 text-xs"
                        required
                      />
                      <p className="text-[10px] text-red-500/80 font-medium leading-tight">
                        (precisa ser o telefone do cliente final, senão o financiamento será reprovado. O número informado deve ser válido para ligações, SMS e WhatsApp.)
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">E-mail do cliente</Label>
                      <Input
                        type="email"
                        value={pfEmail}
                        onChange={(e) => setPfEmail(e.target.value)}
                        placeholder="email@cliente.com"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Data de nascimento do cliente</Label>
                      <Input
                        type="date"
                        value={pfNasc}
                        onChange={(e) => setPfNasc(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Estado civil *</Label>
                      <select
                        value={pfEstadoCivil}
                        onChange={(e) => setPfEstadoCivil(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="solteiro">Solteiro(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viuvo">Viúvo(a)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Valor a ser financiado</Label>
                      <Input
                        type="number"
                        value={pfValor}
                        onChange={(e) => setPfValor(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Renda total mensal (em reais) do cliente</Label>
                      <Input
                        type="number"
                        value={pfRenda}
                        onChange={(e) => setPfRenda(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Potência em kWp do projeto</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={pfKwp}
                        onChange={(e) => setPfKwp(e.target.value)}
                        placeholder="0.00 kWp"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">Carência desejável</Label>
                      <div className="flex gap-4 pt-1.5">
                        {["30", "60", "90"].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="pfCarencia"
                              value={d}
                              checked={pfCarencia === d}
                              onChange={(e) => setPfCarencia(e.target.value)}
                              className="text-[#2E44B8] focus:ring-0"
                            />
                            {d} dias
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Valor médio da conta de luz dos últimos 3 meses</Label>
                      <Input
                        type="number"
                        value={pfContaLuz}
                        onChange={(e) => setPfContaLuz(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                      />
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">(precisa bater com a conta de energia)</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">A conta de energia está no nome da mesma pessoa?</Label>
                      <div className="flex gap-4 pt-1.5">
                        {[
                          { label: "Sim", val: "sim" },
                          { label: "Não", val: "nao" }
                        ].map((o) => (
                          <label key={o.val} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="pfMesmoTitular"
                              value={o.val}
                              checked={pfMesmoTitular === o.val}
                              onChange={(e) => setPfMesmoTitular(e.target.value)}
                              className="text-[#2E44B8] focus:ring-0"
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Passo 1 PJ */
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <Label className="text-slate-600">Nome do sócio administrador do cliente</Label>
                      <Input
                        value={pjSocioNome}
                        onChange={(e) => setPjSocioNome(e.target.value)}
                        placeholder="Nome completo do sócio"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">CNPJ do cliente</Label>
                      <Input
                        value={pjCnpj}
                        onChange={(e) => setPjCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Razão social do cliente</Label>
                      <Input
                        value={pjRazaoSocial}
                        onChange={(e) => setPjRazaoSocial(e.target.value)}
                        placeholder="Nome da empresa"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">CPF do sócio administrador do cliente</Label>
                      <Input
                        value={pjSocioCpf}
                        onChange={(e) => setPjSocioCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Telefone com DDD do cliente</Label>
                      <Input
                        value={pjTelefone}
                        onChange={(e) => setPjTelefone(e.target.value)}
                        placeholder="+55 (99) 99999-9999"
                        className="h-10 text-xs"
                        required
                      />
                      <p className="text-[10px] text-red-500/80 font-medium leading-tight">
                        (precisa ser o telefone do cliente final, senão o financiamento será reprovado. O número informado deve ser válido para ligações, SMS e WhatsApp.)
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">E-mail do cliente</Label>
                      <Input
                        type="email"
                        value={pjEmail}
                        onChange={(e) => setPjEmail(e.target.value)}
                        placeholder="email@empresa.com"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Data de nascimento do sócio administrador do cliente</Label>
                      <Input
                        type="date"
                        value={pjSocioNasc}
                        onChange={(e) => setPjSocioNasc(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Data de fundação da empresa do cliente</Label>
                      <Input
                        type="date"
                        value={pjFundacao}
                        onChange={(e) => setPjFundacao(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Faturamento médio mensal dos últimos 12 meses do cliente</Label>
                      <Input
                        type="number"
                        value={pjFaturamento}
                        onChange={(e) => setPjFaturamento(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Renda mensal do sócio administrador do cliente</Label>
                      <Input
                        type="number"
                        value={pjSocioRenda}
                        onChange={(e) => setPjSocioRenda(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Valor a ser financiado</Label>
                      <Input
                        type="number"
                        value={pjValor}
                        onChange={(e) => setPjValor(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">Carência desejável</Label>
                      <div className="flex flex-wrap gap-4 pt-1.5">
                        {["30", "60", "90", "120", "150"].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="pjCarencia"
                              value={d}
                              checked={pjCarencia === d}
                              onChange={(e) => setPjCarencia(e.target.value)}
                              className="text-[#2E44B8] focus:ring-0"
                            />
                            {d} dias
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">Parcelamento desejável (selecione de 1 até 4 opções)*</Label>
                      <div className="flex flex-wrap gap-4 pt-1.5">
                        {["36", "48", "60", "72"].map((p) => (
                          <label key={p} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              value={p}
                              checked={pjParcelas.includes(p)}
                              onChange={() => handleTogglePjParcela(p)}
                              className="text-[#2E44B8] rounded border-slate-300 focus:ring-0"
                            />
                            {p} parcelas
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Potência em kWp do projeto</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={pjKwp}
                        onChange={(e) => setPjKwp(e.target.value)}
                        placeholder="0.00 kWp"
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Valor médio da conta de energia do cliente</Label>
                      <Input
                        type="number"
                        value={pjContaLuz}
                        onChange={(e) => setPjContaLuz(e.target.value)}
                        placeholder="R$ 0,00"
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-bold text-xs px-8 py-3 rounded-xl shadow-sm transition cursor-pointer border-0"
                >
                  Próximo
                </Button>
              </div>
            </form>
          ) : (
            /* =================== PASSO 2 / 2 =================== */
            <form onSubmit={handleSubmitSimulation} className="space-y-6 pt-4 text-xs font-semibold text-slate-700 animate-fade-in">
              <div>
                <h3 className="font-extrabold text-[#2E44B8] text-sm mb-4">Dados da simulação (Passo 2/2)</h3>
                
                {simType === "pf" ? (
                  /* Passo 2 PF - Endereço do Cliente */
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <Label className="text-slate-600">CEP do cliente</Label>
                      <Input
                        value={pfCep}
                        onChange={(e) => handlePfCepChange(e.target.value)}
                        placeholder="69515-000"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-600">Estado do cliente</Label>
                        <select
                          value={pfEstado}
                          onChange={(e) => { setPfEstado(e.target.value); setPfCidade(""); }}
                          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          required
                        >
                          <option value="">Selecione</option>
                          {ufs.map((u) => (
                            <option key={u.sigla} value={u.sigla}>{u.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-600">Cidade do cliente</Label>
                        <select
                          value={pfCidade}
                          onChange={(e) => setPfCidade(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          required
                        >
                          <option value="">Selecione</option>
                          {pfCidadesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Endereço do cliente</Label>
                      <Input
                        value={pfEndereco}
                        onChange={(e) => setPfEndereco(e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Bairro do cliente</Label>
                      <Input
                        value={pfBairro}
                        onChange={(e) => setPfBairro(e.target.value)}
                        placeholder="Nome do Bairro"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Número do cliente</Label>
                      <Input
                        value={pfNumero}
                        onChange={(e) => setPfNumero(e.target.value)}
                        placeholder="Ex: 106, S/N"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Complemento do cliente</Label>
                      <Input
                        value={pfComplemento}
                        onChange={(e) => setPfComplemento(e.target.value)}
                        placeholder="Apto, Bloco, etc."
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="md:col-span-2 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pfSolicitarEspecial}
                          onChange={(e) => setPfSolicitarEspecial(e.target.checked)}
                          className="text-[#2E44B8] rounded border-slate-300 focus:ring-0"
                        />
                        Deseja solicitar também simulação de crédito especial?
                      </label>
                    </div>
                  </div>
                ) : (
                  /* Passo 2 PJ - Endereço do Sócio */
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <Label className="text-slate-600">CEP do sócio administrador do cliente</Label>
                      <Input
                        value={pjCep}
                        onChange={(e) => handlePjCepChange(e.target.value)}
                        placeholder="69515-000"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-600">Estado do sócio administrador</Label>
                        <select
                          value={pjEstado}
                          onChange={(e) => { setPjEstado(e.target.value); setPjCidade(""); }}
                          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          required
                        >
                          <option value="">Selecione</option>
                          {ufs.map((u) => (
                            <option key={u.sigla} value={u.sigla}>{u.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-600">Cidade do sócio administrador</Label>
                        <select
                          value={pjCidade}
                          onChange={(e) => setPjCidade(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          required
                        >
                          <option value="">Selecione</option>
                          {pjCidadesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Bairro do sócio administrador do cliente</Label>
                      <Input
                        value={pjBairro}
                        onChange={(e) => setPjBairro(e.target.value)}
                        placeholder="Nome do Bairro"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Endereço do sócio administrador do cliente</Label>
                      <Input
                        value={pjEndereco}
                        onChange={(e) => setPjEndereco(e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Número do sócio administrador do cliente</Label>
                      <Input
                        value={pjNumero}
                        onChange={(e) => setPjNumero(e.target.value)}
                        placeholder="Ex: 106, S/N"
                        className="h-10 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600">Complemento do sócio administrador do cliente</Label>
                      <Input
                        value={pjComplemento}
                        onChange={(e) => setPjComplemento(e.target.value)}
                        placeholder="Apto, Bloco, etc."
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-2.5 rounded-xl transition border-0 cursor-pointer"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-bold text-xs px-8 py-3 rounded-xl shadow-sm transition disabled:opacity-50 border-0 cursor-pointer"
                >
                  {saving ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
