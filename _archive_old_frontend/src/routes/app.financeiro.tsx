import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Landmark, TrendingUp, TrendingDown, Users, Percent, CreditCard, PlusCircle, Check, Key, Settings, RefreshCw, ExternalLink, QrCode, Copy } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { criarCobrancaServerFn, estornarCobrancaServerFn } from "@/lib/payments.functions";

export const Route = createFileRoute("/app/financeiro")({
  head: () => ({ meta: [{ title: "Painel Financeiro — ESOL Energy" }] }),
  component: FinanceiroDashboard,
});

function FinanceiroDashboard() {
  const { user, role, loading: authLoading } = useCurrentUser();
  const [tab, setTab] = useState("resumo");
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Configurações não-sensíveis do gateway (chaves ficam apenas no servidor via secrets)
  const [gatewaySettings, setGatewaySettings] = useState<any>({
    gateway_ativo: "asaas",
    asaas_environment: "sandbox",
    pagarme_environment: "sandbox"
  });
  const criarCobrancaSrv = useServerFn(criarCobrancaServerFn);
  const estornarCobrancaSrv = useServerFn(estornarCobrancaServerFn);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [salvandoSettings, setSalvandoSettings] = useState(false);

  // Estado para gerar cobrança manual
  const [novaCob, setNovaCob] = useState({
    cliente_id: "",
    pedido_id: "",
    valor: "",
    metodo: "pix" as "pix" | "boleto" | "credit_card",
    descricao: "",
    parcelas: "1"
  });
  const [gerandoCob, setGerandoCob] = useState(false);
  const [cobrançaGerada, setCobrançaGerada] = useState<any | null>(null);

  // Estados para novo lançamento
  const [novoLanc, setNovoLanc] = useState({
    tipo: "despesa",
    categoria: "outro",
    valor: "",
    data_vencimento: new Date().toISOString().split("T")[0],
    descricao: "",
    pedido_id: "",
    parceiro_id: "",
    fornecedor_id: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { data: lan },
        { data: com },
        { data: forn },
        { data: peds },
        { data: setts },
        { data: txs },
        { data: clis }
      ] = await Promise.all([
        (supabase.from as any)("financeiro_lancamentos")
          .select("*, parceiro:parceiro_id(nome), fornecedor:fornecedor_id(nome), pedido:pedido_id(numero)")
          .order("data_vencimento", { ascending: false }),
        (supabase.from as any)("parceiro_comissoes")
          .select("*, parceiro:parceiro_id(nome), pedido:pedido_id(numero)")
          .order("created_at", { ascending: false }),
        (supabase.from as any)("fornecedores_solar").select("*").order("nome"),
        (supabase.from as any)("pedidos").select("id, numero, valor_total, cliente:cliente_id(nome)").order("created_at"),
        (supabase.from as any)("gateway_settings").select("*").eq("id", "active_config").maybeSingle(),
        (supabase.from as any)("gateway_transactions")
          .select("*, cliente:cliente_id(nome, email, telefone, cpf_cnpj), pedido:pedido_id(numero)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, nome, email, telefone, cpf_cnpj").order("nome")
      ]);

      setLancamentos(lan || []);
      setComissoes(com || []);
      setFornecedores(forn || []);
      setPedidos(peds || []);
      if (setts) setGatewaySettings(setts);
      setTransactions(txs || []);
      setClientesList(clis || []);
    } catch (e: any) {
      toast.error("Erro ao carregar dados: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const pagarComissao = async (id: string) => {
    try {
      const { error } = await (supabase.from as any)("parceiro_comissoes")
        .update({ status: "pago", data_pagamento: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Comissão marcada como paga");
      loadData();
    } catch (e: any) {
      toast.error("Erro ao pagar comissão: " + e.message);
    }
  };

  useEffect(() => {
    if (user && (role === "admin" || role === "financeiro")) {
      loadData();
    }
  }, [user, role]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Carregando dados financeiros...</span>
      </div>
    );
  }

  if (role !== "admin" && role !== "financeiro") {
    return (
      <div className="p-6 text-center text-rose-600 font-semibold">
        Acesso restrito apenas para administradores ou departamento financeiro.
      </div>
    );
  }

  // Cálculos de Resumo
  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita" && l.status === "pago")
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa" && l.status === "pago")
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Projeção Fiscal de Impostos (Simples Nacional - Média de 6% sobre faturamento de serviços)
  // Lembrando do Faturamento Direto: o faturamento de impostos é calculado apenas sobre a receita de instalação/serviço.
  const faturamentoServicos = lancamentos
    .filter((l) => l.tipo === "receita" && l.categoria === "instalacao" && l.status === "pago")
    .reduce((acc, curr) => acc + Number(curr.valor), 0);
  const impostoProjetado = faturamentoServicos * 0.06;

  // Lançamento manual
  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLanc.valor || Number(novoLanc.valor) <= 0) {
      toast.error("Insira um valor válido");
      return;
    }

    try {
      const { error } = await (supabase.from as any)("financeiro_lancamentos").insert({
        tipo: novoLanc.tipo,
        categoria: novoLanc.categoria,
        valor: Number(novoLanc.valor),
        data_vencimento: novoLanc.data_vencimento,
        status: "pago", // Já lança como pago
        data_pagamento: new Date().toISOString().split("T")[0],
        descricao: novoLanc.descricao || null,
        pedido_id: novoLanc.pedido_id || null,
        parceiro_id: novoLanc.parceiro_id || null,
        fornecedor_id: novoLanc.fornecedor_id || null,
      });

      if (error) throw error;
      toast.success("Lançamento registrado!");
      setNovoLanc({
        tipo: "despesa",
        categoria: "outro",
        valor: "",
        data_vencimento: new Date().toISOString().split("T")[0],
        descricao: "",
        pedido_id: "",
        parceiro_id: "",
        fornecedor_id: "",
      });
      loadData();
    } catch (e: any) {
      toast.error("Erro ao registrar lançamento: " + e.message);
    }
  };

  // Funções dos Gateways de Pagamento
  const salvarSettings = async () => {
    setSalvandoSettings(true);
    const { error } = await (supabase.from as any)("gateway_settings")
      .upsert({ id: "active_config", ...gatewaySettings });
    setSalvandoSettings(false);
    if (error) toast.error("Erro ao salvar configurações: " + error.message);
    else toast.success("Configuração do gateway atualizada!");
  };

  const criarCobranca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCob.cliente_id || !novaCob.valor) return toast.error("Preencha cliente e valor");
    setGerandoCob(true);

    try {
      const cli = clientesList.find(c => c.id === novaCob.cliente_id);
      if (!cli) throw new Error("Cliente não encontrado");

      // Chama servidor: credenciais ficam apenas em process.env (secrets)
      const { customerExternalId, charge: chargeRes } = await criarCobrancaSrv({
        data: {
          gateway: gatewaySettings.gateway_ativo,
          customer: {
            nome: cli.nome || "Cliente Sem Nome",
            email: cli.email || `${cli.id}@esol.energy`,
            cpf_cnpj: cli.cpf_cnpj || "000.000.000-00",
            telefone: cli.telefone || "11999999999",
          },
          charge: {
            valor: Number(novaCob.valor),
            metodo: novaCob.metodo,
            descricao: novaCob.descricao || `Cobrança manual ESOL Energy`,
            parcelas: Number(novaCob.parcelas),
          },
        },
      });

      if (!chargeRes.success) throw new Error("Falha na geração da cobrança");
      const custRes = { customerExternalId };


      // 3. Salva no banco de dados local
      const { data: inserted, error: dbErr } = await (supabase.from as any)("gateway_transactions")
        .insert({
          pedido_id: novaCob.pedido_id || null,
          cliente_id: novaCob.cliente_id,
          gateway: gatewaySettings.gateway_ativo,
          external_id: chargeRes.transactionId,
          customer_external_id: custRes.customerExternalId,
          valor: Number(novaCob.valor),
          metodo_pagamento: novaCob.metodo,
          status: chargeRes.status,
          pix_qr_code: chargeRes.pixQrCode || null,
          pix_copia_e_cola: chargeRes.pixCopiaCola || null,
          boleto_url: chargeRes.boletoUrl || null,
          boleto_bar_code: chargeRes.boletoBarCode || null,
          credit_card_brand: chargeRes.creditCardBrand || null,
          parcelas: Number(novaCob.parcelas),
          gateway_response: chargeRes.rawResponse
        })
        .select()
        .single();

      if (dbErr) throw dbErr;

      setCobrançaGerada({
        ...inserted,
        cliente: cli
      });
      toast.success("Cobrança criada com sucesso!");
      setNovaCob({
        cliente_id: "",
        pedido_id: "",
        valor: "",
        metodo: "pix",
        descricao: "",
        parcelas: "1"
      });
      loadData();
    } catch (err: any) {
      toast.error("Erro ao gerar cobrança: " + err.message);
    } finally {
      setGerandoCob(false);
    }
  };

  const simularRecebimento = async (tx: any) => {
    try {
      const { error: txErr } = await (supabase.from as any)("gateway_transactions")
        .update({ status: "paid" })
        .eq("id", tx.id);
      if (txErr) throw txErr;

      // Cria receita correspondente
      const { error: lanErr } = await (supabase.from as any)("financeiro_lancamentos").insert({
        tipo: "receita",
        categoria: "instalacao",
        valor: Number(tx.valor),
        status: "pago",
        data_vencimento: new Date().toISOString().split("T")[0],
        descricao: `Cobrança Digital Conciliada (${tx.gateway.toUpperCase()} #${tx.external_id})`,
        pedido_id: tx.pedido_id || null,
        parceiro_id: null
      });
      if (lanErr) throw lanErr;

      // Atualiza o pedido vinculado para EXPEDIDO (pois foi pago/faturado)
      if (tx.pedido_id) {
        await (supabase.from as any)("pedidos").update({
          status: "expedido",
          comprovante_url: tx.boleto_url || tx.pix_qr_code || null
        }).eq("id", tx.pedido_id);
      }

      toast.success("Webhook Simulado! Pagamento recebido, fluxo de caixa conciliado e pedido expedido.");
      loadData();
    } catch (err: any) {
      toast.error("Erro na simulação de webhook: " + err.message);
    }
  };

  const simularEstorno = async (tx: any) => {
    try {
      const refundRes = await estornarCobrancaSrv({
        data: { gateway: tx.gateway, transactionId: tx.external_id },
      });
      if (!refundRes.success) throw new Error("Falha no reembolso");


      const { error: txErr } = await (supabase.from as any)("gateway_transactions")
        .update({ status: "refunded" })
        .eq("id", tx.id);
      if (txErr) throw txErr;

      // Cria despesa estorno correspondente
      const { error: lanErr } = await (supabase.from as any)("financeiro_lancamentos").insert({
        tipo: "despesa",
        categoria: "outro",
        valor: Number(tx.valor),
        status: "pago",
        data_vencimento: new Date().toISOString().split("T")[0],
        descricao: `Reembolso de Cobrança Digital (${tx.gateway.toUpperCase()} #${tx.external_id})`,
        pedido_id: tx.pedido_id || null,
        parceiro_id: null
      });
      if (lanErr) throw lanErr;

      // Cancela o pedido correspondente ao estorno
      if (tx.pedido_id) {
        await (supabase.from as any)("pedidos").update({
          status: "cancelado"
        }).eq("id", tx.pedido_id);
      }

      toast.success("Reembolso simulado e pedido cancelado com sucesso!");
      loadData();
    } catch (err: any) {
      toast.error("Erro ao estornar cobrança: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
          <Landmark className="w-7 h-7 text-emerald-600" /> Painel Financeiro
        </h1>
        <p className="text-muted-foreground text-sm">Controle contábil, fiscal de faturamento direto e comissões.</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Receitas Confirmadas</div>
            <div className="text-lg font-bold text-navy">{BRL(totalReceitas)}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Despesas / Comissões</div>
            <div className="text-lg font-bold text-navy">{BRL(totalDespesas)}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Saldo em Caixa</div>
            <div className={`text-lg font-bold ${saldoLiquido >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {BRL(saldoLiquido)}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Provisão Simples (6%)</div>
            <div className="text-lg font-bold text-amber-700">{BRL(impostoProjetado)}</div>
            <span className="text-[9px] text-muted-foreground">Faturamento Direto considerado</span>
          </div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
          <TabsTrigger value="resumo">Extrato Geral</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões de Consultores</TabsTrigger>
          <TabsTrigger value="gateway_payments">Cobranças Digitais</TabsTrigger>
          <TabsTrigger value="novo">Novo Lançamento</TabsTrigger>
        </TabsList>

        {/* 1. EXTRATO DE LANÇAMENTOS */}
        <TabsContent value="resumo" className="space-y-4">
          <Card className="p-4 overflow-x-auto">
            <h2 className="font-bold text-navy mb-4">Fluxo de Caixa / Lançamentos</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="suns-table-header">
                    <th className="p-3">Data</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Vínculo</th>
                    <th className="p-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-3">{new Date(l.data_vencimento).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3">
                        <Badge className={l.tipo === "receita" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                          {l.tipo}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs font-bold uppercase">{l.categoria}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{l.descricao || "—"}</td>
                      <td className="p-3 text-xs">
                        {l.pedido && <span className="block font-bold">Pedido {l.pedido.numero}</span>}
                        {l.parceiro && <span className="block">Parceiro: {l.parceiro.nome}</span>}
                        {l.fornecedor && <span className="block">Fornecedor: {l.fornecedor.nome}</span>}
                      </td>
                      <td className={`p-3 text-right font-semibold ${l.tipo === "receita" ? "text-emerald-700" : "text-navy"}`}>
                        {l.tipo === "despesa" && "-"} {BRL(Number(l.valor))}
                      </td>
                    </tr>
                  ))}
                  {lancamentos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">Nenhum lançamento financeiro registrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        {/* 2. COMISSÕES DE CORRETORES */}
        <TabsContent value="comissoes" className="space-y-4">
          <Card className="p-4 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-navy">Controle de Comissões de Consultores</h2>
              <Badge className="bg-blue-100 text-blue-700">Gatilhos de repasse ativos</Badge>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="suns-table-header">
                    <th className="p-3">Consultor</th>
                    <th className="p-3">Pedido</th>
                    <th className="p-3">Parcela</th>
                    <th className="p-3">Comissão (%)</th>
                    <th className="p-3">Valor Comissão</th>
                    <th className="p-3">Previsão</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {comissoes.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-navy">{c.parceiro?.nome}</td>
                      <td className="p-3 text-xs font-bold">{c.pedido?.numero}</td>
                      <td className="p-3 text-xs">
                        Parc. {c.parcela}/{c.total_parcelas}
                        <span className="block text-[9px] text-muted-foreground">
                          {c.parcela === 1 ? "Entrada/Financ." : "Pós-Instalação"}
                        </span>
                      </td>
                      <td className="p-3">{c.percentual_comissao}%</td>
                      <td className="p-3 font-bold text-emerald-700">{BRL(Number(c.valor_comissao))}</td>
                      <td className="p-3 text-xs">{new Date(c.data_previsao_pagamento).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3">
                        <Badge className={c.status === "pago" ? "bg-green-100 text-green-800" : c.status === "a_receber" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}>
                          {c.status === "a_receber" ? "A Receber" : c.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {c.status === "a_receber" && (
                          <Button size="sm" onClick={() => pagarComissao(c.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-7 px-2">
                            <Check className="w-3.5 h-3.5 mr-1" /> Dar Baixa (Pagar)
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {comissoes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-muted-foreground">Nenhuma comissão pendente ou registrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        {/* 3. NOVO LANÇAMENTO MANUAL */}
        <TabsContent value="novo">
          <Card className="p-5 max-w-xl">
            <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
              <PlusCircle className="text-emerald-600" /> Lançar Receita ou Despesa Manual
            </h2>
            <form onSubmit={handleCriarLancamento} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo de Lançamento</Label>
                  <Select value={novoLanc.tipo} onValueChange={(v) => setNovoLanc({ ...novoLanc, tipo: v, categoria: v === "receita" ? "instalacao" : "outro" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita (Entrada)</SelectItem>
                      <SelectItem value="despesa">Despesa (Saída)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={novoLanc.categoria} onValueChange={(v) => setNovoLanc({ ...novoLanc, categoria: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {novoLanc.tipo === "receita" ? (
                        <>
                          <SelectItem value="instalacao">Serviço de Instalação</SelectItem>
                          <SelectItem value="outro">Outros Recebimentos</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="fornecedor">Aldo / Sou (Kit de Placas)</SelectItem>
                          <SelectItem value="comissao">Comissão de Consultores</SelectItem>
                          <SelectItem value="mão_de_obra">Mão de Obra de Engenharia</SelectItem>
                          <SelectItem value="imposto">Imposto / Taxa</SelectItem>
                          <SelectItem value="outro">Outras Despesas</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" required value={novoLanc.valor} onChange={(e) => setNovoLanc({ ...novoLanc, valor: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <Label>Data de Vencimento/Pagamento</Label>
                  <Input type="date" required value={novoLanc.data_vencimento} onChange={(e) => setNovoLanc({ ...novoLanc, data_vencimento: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Pedido (Opcional)</Label>
                  <Select value={novoLanc.pedido_id} onValueChange={(v) => setNovoLanc({ ...novoLanc, pedido_id: v })}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Sem pedido" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {pedidos.map((p) => <SelectItem key={p.id} value={p.id}>{p.numero} ({p.cliente?.nome?.slice(0,10)})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Fornecedor (Opcional)</Label>
                  <Select value={novoLanc.fornecedor_id} onValueChange={(v) => setNovoLanc({ ...novoLanc, fornecedor_id: v })}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Sem fornecedor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {fornecedores.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Parceiro (Opcional)</Label>
                  <Select value={novoLanc.parceiro_id} onValueChange={(v) => setNovoLanc({ ...novoLanc, parceiro_id: v })}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Sem parceiro" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {comissoes
                        .map((c) => c.parceiro)
                        .filter((p): p is { id: string; nome: string } => !!p?.id)
                        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição / Notas</Label>
                <Input value={novoLanc.descricao} onChange={(e) => setNovoLanc({ ...novoLanc, descricao: e.target.value })} placeholder="Ex: Pagamento referente a homologação..." />
              </div>

              <Button type="submit" className="bg-navy hover:bg-navy/90 text-white w-full">Registrar e Conciliar</Button>
            </form>
          </Card>
        </TabsContent>

        {/* 4. CONTROLE DE COBRANÇAS DIGITAIS (ASAAS & PAGAR.ME) */}
        <TabsContent value="gateway_payments" className="space-y-6">
          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-0 shadow">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Faturado Digital</div>
              <div className="text-xl font-bold text-navy mt-1">
                {BRL(transactions.reduce((acc, t) => acc + Number(t.valor), 0))}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{transactions.length} cobranças geradas</div>
            </Card>
            <Card className="p-4 bg-white border-0 shadow">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Recebido (Pago)</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {BRL(transactions.filter(t => t.status === "paid").reduce((acc, t) => acc + Number(t.valor), 0))}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{transactions.filter(t => t.status === "paid").length} pagamentos liquidados</div>
            </Card>
            <Card className="p-4 bg-white border-0 shadow">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Aguardando Pagamento</div>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {BRL(transactions.filter(t => t.status === "pending").reduce((acc, t) => acc + Number(t.valor), 0))}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{transactions.filter(t => t.status === "pending").length} links ativos</div>
            </Card>
            <Card className="p-4 bg-white border-0 shadow">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Estornados / Reembolsados</div>
              <div className="text-xl font-bold text-rose-700 mt-1">
                {BRL(transactions.filter(t => t.status === "refunded").reduce((acc, t) => acc + Number(t.valor), 0))}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{transactions.filter(t => t.status === "refunded").length} devoluções registradas</div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* CONFIGURAÇÃO DE CREDENCIAIS ( 전략 ) */}
            <div className="md:col-span-1 space-y-6">
              <Card className="p-5 bg-white border-0 shadow">
                <h3 className="font-bold text-navy text-sm mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" /> Provedor de Pagamento
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Gateway Ativo no ERP</Label>
                    <Select
                      value={gatewaySettings.gateway_ativo}
                      onValueChange={(v) => setGatewaySettings({ ...gatewaySettings, gateway_ativo: v })}
                    >
                      <SelectTrigger className="mt-1 font-bold text-navy h-10">
                        <SelectValue placeholder="Selecione o gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asaas">Asaas (Recomendado)</SelectItem>
                        <SelectItem value="pagarme">Pagar.me (V5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                      <Key className="w-3.5 h-3.5" /> Credenciais (Asaas)
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      As chaves de API são armazenadas <strong>somente no servidor</strong> como
                      secrets (<code>ASAAS_API_KEY</code>). Nenhuma credencial trafega pelo navegador.
                    </p>
                    <div>
                      <Label className="text-[10px]">Ambiente Asaas</Label>
                      <Select
                        value={gatewaySettings.asaas_environment}
                        onValueChange={(v) => setGatewaySettings({ ...gatewaySettings, asaas_environment: v })}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                          <SelectItem value="production">Produção (Real)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                      <Key className="w-3.5 h-3.5" /> Credenciais (Pagar.me)
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Configuradas via secret <code>PAGARME_API_KEY</code> no servidor.
                    </p>
                    <div>
                      <Label className="text-[10px]">Ambiente Pagar.me</Label>
                      <Select
                        value={gatewaySettings.pagarme_environment}
                        onValueChange={(v) => setGatewaySettings({ ...gatewaySettings, pagarme_environment: v })}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                          <SelectItem value="production">Produção (Real)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  <Button
                    onClick={salvarSettings}
                    disabled={salvandoSettings}
                    className="w-full bg-navy hover:bg-navy/90 text-white font-bold h-10 mt-2 text-xs uppercase"
                  >
                    {salvandoSettings ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </Card>

              {/* GERAR COBRANÇA DIGITAL MANUAL */}
              <Card className="p-5 bg-white border-0 shadow">
                <h3 className="font-bold text-navy text-sm mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> Criar Link de Cobrança
                </h3>
                <form onSubmit={criarCobranca} className="space-y-4">
                  <div>
                    <Label className="text-xs">Cliente / Destinatário</Label>
                    <Select
                      value={novaCob.cliente_id}
                      onValueChange={(v) => setNovaCob({ ...novaCob, cliente_id: v })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientesList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome || c.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Valor Cobrado (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Ex: 5000.00"
                        value={novaCob.valor}
                        onChange={(e) => setNovaCob({ ...novaCob, valor: e.target.value })}
                        className="text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Método</Label>
                      <Select
                        value={novaCob.metodo}
                        onValueChange={(v) => setNovaCob({ ...novaCob, metodo: v as any })}
                      >
                        <SelectTrigger className="mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX (Imediato)</SelectItem>
                          <SelectItem value="boleto">Boleto Bancário</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {novaCob.metodo === "credit_card" && (
                    <div>
                      <Label className="text-xs">Parcelamento Máximo</Label>
                      <Select
                        value={novaCob.parcelas}
                        onValueChange={(v) => setNovaCob({ ...novaCob, parcelas: v })}
                      >
                        <SelectTrigger className="mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}x sem juros</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Vincular a Pedido (Opcional)</Label>
                    <Select
                      value={novaCob.pedido_id}
                      onValueChange={(v) => setNovaCob({ ...novaCob, pedido_id: v })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
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

                  <div>
                    <Label className="text-xs">Descrição da Cobrança</Label>
                    <Input
                      placeholder="Ex: Entrada 30% do gerador solar..."
                      value={novaCob.descricao}
                      onChange={(e) => setNovaCob({ ...novaCob, descricao: e.target.value })}
                      className="text-xs mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={gerandoCob}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs uppercase"
                  >
                    {gerandoCob ? "Gerando..." : "Gerar Cobrança"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* HISTÓRICO & EXIBIÇÃO DE ÚLTIMA COBRANÇA */}
            <div className="md:col-span-2 space-y-6">
              {/* Box de Cobrança Recém Criada */}
              {cobrançaGerada && (
                <Card className="p-5 border border-emerald-300 bg-emerald-50/50 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-navy text-sm">Cobrança Gerada com Sucesso!</h4>
                      <p className="text-xs text-slate-500">Copie os dados de pagamento abaixo e envie ao cliente.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCobrançaGerada(null)} className="text-navy font-bold">Fechar</Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {cobrançaGerada.metodo_pagamento === "pix" && (
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border">
                        {cobrançaGerada.pix_qr_code && (
                          <img src={cobrançaGerada.pix_qr_code} alt="QR Code PIX" className="w-36 h-36" />
                        )}
                        <span className="text-[10px] text-muted-foreground mt-2">QR Code Pix Oficial</span>
                      </div>
                    )}

                    <div className="space-y-3 font-semibold text-xs text-slate-700">
                      <div><span className="text-[10px] text-slate-400 block">Cliente</span> {cobrançaGerada.cliente?.nome}</div>
                      <div><span className="text-[10px] text-slate-400 block">Valor</span> <strong className="text-emerald-700 text-sm">{BRL(Number(cobrançaGerada.valor))}</strong></div>
                      <div><span className="text-[10px] text-slate-400 block">Gateway</span> <Badge className="bg-slate-200 text-navy uppercase text-[9px]">{cobrançaGerada.gateway}</Badge></div>
                      <div><span className="text-[10px] text-slate-400 block">ID Externo</span> <span className="font-mono text-[10px]">{cobrançaGerada.external_id}</span></div>
                    </div>
                  </div>

                  {cobrançaGerada.pix_copia_e_cola && (
                    <div className="space-y-1">
                      <Label className="text-[10px]">Copia e Cola PIX</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={cobrançaGerada.pix_copia_e_cola} className="text-xs font-mono bg-white flex-1" />
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(cobrançaGerada.pix_copia_e_cola);
                            toast.success("Copia e Cola copiado!");
                          }}
                          className="bg-navy text-white hover:bg-navy/90"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {cobrançaGerada.boleto_url && (
                    <div className="flex gap-2">
                      <a href={cobrançaGerada.boleto_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full bg-navy text-white text-xs font-bold gap-1.5 h-9">
                          <ExternalLink className="w-4 h-4" /> Acessar PDF do Boleto
                        </Button>
                      </a>
                      {cobrançaGerada.boleto_bar_code && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(cobrançaGerada.boleto_bar_code);
                            toast.success("Código de barras copiado!");
                          }}
                          className="text-xs text-navy font-bold border-navy/20 gap-1 h-9"
                        >
                          <Copy className="w-4 h-4" /> Barras
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {/* Histórico de Transações */}
              <Card className="border-0 shadow overflow-hidden bg-white">
                <div className="p-4 border-b font-bold text-navy text-sm flex justify-between items-center">
                  <span>Histórico de Cobranças Digitais</span>
                  <Button variant="ghost" size="sm" onClick={loadData} className="text-navy flex gap-1 items-center">
                    <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                  </Button>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground text-sm">Nenhuma transação digital gerada no gateway.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="suns-table-header">
                        <tr>
                          <th className="p-3">Destinatário</th>
                          <th className="p-3">Gateway</th>
                          <th className="p-3">Valor</th>
                          <th className="p-3">Método</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Ação / Simulação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs font-semibold">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="font-bold text-navy">{tx.cliente?.nome || "Sem Nome"}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{tx.external_id}</div>
                            </td>
                            <td className="p-3">
                              <Badge className={tx.gateway === "asaas" ? "bg-blue-50 text-blue-700 border-blue-200 border" : "bg-purple-50 text-purple-700 border-purple-200 border"}>
                                {tx.gateway.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3 font-bold text-navy">{BRL(Number(tx.valor))}</td>
                            <td className="p-3 uppercase text-[10px] text-slate-600">{tx.metodo_pagamento}</td>
                            <td className="p-3">
                              <Badge
                                variant={tx.status === "paid" ? "default" : tx.status === "refunded" ? "destructive" : "secondary"}
                                className="text-[10px]"
                              >
                                {tx.status === "pending" ? "Pendente" : tx.status === "paid" ? "Pago" : tx.status === "refunded" ? "Reembolsado" : tx.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right space-y-1 sm:space-y-0 sm:space-x-2">
                              {tx.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => simularRecebimento(tx)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-1"
                                >
                                  Simular Webhook Recebido
                                </Button>
                              )}
                              {tx.status === "paid" && (
                                <Button
                                  size="sm"
                                  onClick={() => simularEstorno(tx)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[9px] px-2 py-1"
                                >
                                  Estornar (Refund)
                                </Button>
                              )}
                              {tx.pix_copia_e_cola && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    navigator.clipboard.writeText(tx.pix_copia_e_cola);
                                    toast.success("PIX copiado!");
                                  }}
                                  className="text-navy text-[9px] font-bold"
                                >
                                  Copiar Pix
                                </Button>
                              )}
                              {tx.boleto_url && (
                                <a href={tx.boleto_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost" className="text-navy text-[9px] font-bold">
                                    Ver Boleto
                                  </Button>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
