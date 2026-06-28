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
import { DollarSign, Landmark, TrendingUp, TrendingDown, Users, Percent, CreditCard, PlusCircle, Check } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/financeiro")({
  head: () => ({ meta: [{ title: "Painel Financeiro — ESOL Energy" }] }),
  component: FinanceiroDashboard,
});

function FinanceiroDashboard() {
  const { user, role } = useCurrentUser();
  const [tab, setTab] = useState("resumo");
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        { data: peds }
      ] = await Promise.all([
        (supabase.from as any)("financeiro_lancamentos")
          .select("*, parceiro:parceiro_id(nome), fornecedor:fornecedor_id(nome), pedido:pedido_id(numero)")
          .order("data_vencimento", { ascending: false }),
        (supabase.from as any)("parceiro_comissoes")
          .select("*, parceiro:parceiro_id(nome), pedido:pedido_id(numero)")
          .order("created_at", { ascending: false }),
        (supabase.from as any)("fornecedores_solar").select("*").order("nome"),
        (supabase.from as any)("pedidos").select("id, numero, valor_total, cliente:cliente_id(nome)").order("created_at")
      ]);

      setLancamentos(lan || []);
      setComissoes(com || []);
      setFornecedores(forn || []);
      setPedidos(peds || []);
    } catch (e: any) {
      toast.error("Erro ao carregar dados: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && role === "admin") {
      loadData();
    }
  }, [user, role]);

  if (role !== "admin") {
    return (
      <div className="p-6 text-center text-rose-600 font-semibold">
        Acesso restrito apenas para administradores do sistema.
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

  // Baixa de comissão (mudar status para pago)
  const pagarComissao = async (comId: string) => {
    try {
      const { error } = await (supabase.from as any)("parceiro_comissoes")
        .update({ status: "pago", data_pagamento_efetivo: new Date().toISOString().split("T")[0] })
        .eq("id", comId);

      if (error) throw error;
      toast.success("Comissão marcada como paga! Fluxo de caixa atualizado.");
      loadData();
    } catch (e: any) {
      toast.error("Erro ao pagar comissão: " + e.message);
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
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="resumo">📊 Extrato Geral</TabsTrigger>
          <TabsTrigger value="comissoes">👥 Comissões de Consultores</TabsTrigger>
          <TabsTrigger value="novo">➕ Novo Lançamento</TabsTrigger>
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
                  <tr className="border-b text-xs text-muted-foreground uppercase">
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
                  <tr className="border-b text-xs text-muted-foreground uppercase">
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
                      <SelectItem value="receita">📈 Receita (Entrada)</SelectItem>
                      <SelectItem value="despesa">📉 Despesa (Saída)</SelectItem>
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
                          <SelectItem value="instalacao">🛠️ Serviço de Instalação</SelectItem>
                          <SelectItem value="outro"> Outros Recebimentos</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="fornecedor">📦 Aldo / Sou (Kit de Placas)</SelectItem>
                          <SelectItem value="comissao">👥 Comissão de Consultores</SelectItem>
                          <SelectItem value="mão_de_obra"> Mão de Obra de Engenharia</SelectItem>
                          <SelectItem value="imposto">🏛️ Imposto / Taxa</SelectItem>
                          <SelectItem value="outro"> Outras Despesas</SelectItem>
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
      </Tabs>
    </div>
  );
}
