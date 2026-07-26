import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Eye, Check, X, Clock } from "lucide-react";
import { BRL, calcularProposta } from "@/lib/proposta-calc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/app/propostas/")({
  validateSearch: (search: Record<string, unknown>) => ({
    modo: (search.modo as string) ?? "proposta",
  }),
  component: PropostasList,
});

const STATUS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  rascunho: { label: "Rascunho", color: "bg-slate-200 text-slate-700", icon: FileText },
  enviada: { label: "Enviada", color: "bg-blue-100 text-blue-700", icon: Clock },
  visualizada: { label: "Visualizada", color: "bg-amber-100 text-amber-700", icon: Eye },
  aceita: { label: "Aceita", color: "bg-emerald-100 text-emerald-700", icon: Check },
  recusada: { label: "Recusada", color: "bg-rose-100 text-rose-700", icon: X },
  expirada: { label: "Expirada", color: "bg-slate-100 text-slate-500", icon: Clock },
};

function PropostasList() {
  const { role } = useCurrentUser();
  const [propostas, setPropostas] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterParceiro, setFilterParceiro] = useState("todos");
  const [parceiros, setParceiros] = useState<any[]>([]);
  const { modo } = Route.useSearch();

  const [params, setParams] = useState<any>(null);
  const [expandedPropostaId, setExpandedPropostaId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: profs }, { data: pr }] = await Promise.all([
        supabase
          .from("propostas")
          .select("*, parceiro:parceiro_id(nome, id, comissao_percent), proposta_clientes(cliente:cliente_id(nome, estado, consumo_kwh, valor_fatura))")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, nome").order("nome"),
        (supabase.rpc as any)("get_parametros_publicos"),
      ]);
      setPropostas(ps || []);
      setParceiros(profs || []);
      if (pr) setParams(pr);
    })();
  }, [modo]);

  const getCalculoRow = (p: any) => {
    if (p.custo_equipamentos !== null && p.custo_equipamentos !== undefined) {
      return p;
    }
    if (!params) return null;

    const firstClient = p.proposta_clientes?.[0]?.cliente;
    const clientConsumo = firstClient ? Number(firstClient.consumo_kwh || (firstClient.valor_fatura ? Math.round(Number(firstClient.valor_fatura) / (params.tarifa_kwh_default || 0.95)) : 500)) : 500;
    const clientEstado = firstClient?.estado || "SP";

    return calcularProposta({
      consumo_kwh: clientConsumo,
      tarifa_kwh: params.tarifa_kwh_default || 0.95,
      estado: clientEstado,
      tipo: p.tipo_instalacao || "residencial",
      tipo_telhado: p.tipo_telhado || "ceramico",
      preco_override: p.preco_total,
      kwp_override: p.kwp_sistema,
      qtd_modulos_override: p.qtd_modulos,
      distribuidora_id: p.distribuidora_id || p.fornecedor || null,
      eh_admin: !p.parceiro_id,
      comissao_percent_override: p.parceiro_id && p.parceiro?.comissao_percent !== null && p.parceiro?.comissao_percent !== undefined ? Number(p.parceiro.comissao_percent) : undefined,
    }, params);
  };

  const renderEspelhoDialogContent = (p: any) => {
    const calc = getCalculoRow(p);
    if (!calc) return <div className="p-4 text-center text-xs text-muted-foreground">Carregando parâmetros comerciais...</div>;
    
    return role === "admin" ? (
      <div className="space-y-4 pt-2 text-left">
        {(calc.fornecedor || p.fornecedor) && (
          <div className="bg-navy/5 rounded-xl p-3 border text-xs flex justify-between items-center">
            <span className="font-semibold text-slate-500 uppercase text-[9px]">Distribuidor / Fornecedor</span>
            <strong className="text-navy text-sm font-black uppercase">{calc.fornecedor || p.fornecedor}</strong>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Diretos (Compra B2B)</span>
            <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
              <CostRow label="Equipamentos (Kit)" value={calc.custo_equipamentos} />
              <CostRow label="Instalação / Integração" value={calc.custo_instalacao} />
              <CostRow label="Frete" value={calc.custo_frete} />
              <CostRow label="Impostos de Compra" value={calc.custo_impostos_compra} />
              {p.parceiro_id && <CostRow label="Comissão do Parceiro" value={calc.custo_comissao} />}
              <CostRow label="Total Custos Diretos" value={p.preco_total - (calc.margem_bruta || 0)} bold />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="font-extrabold text-slate-600 uppercase text-[10px] block tracking-wide">Custos Operacionais e Margens (ESOL)</span>
            <div className="bg-slate-50 rounded-xl p-3.5 border space-y-1">
              <CostRow label="Tributação ESOL" value={calc.custo_tributacao_empresa} />
              <CostRow label="CAC / Marketing" value={calc.custo_marketing} />
              <CostRow label="Engenharia / Fixo" value={calc.custo_engenharia_fixo} />
              <CostRow label="Overhead / Adm" value={calc.custo_overhead} />
              <CostRow label="Provisão de Garantia" value={calc.custo_garantia} />
              <CostRow label="Despesas Op. Totais" value={calc.custos_operacionais_totais} bold />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center border">
            <span className="font-semibold text-slate-700 text-xs">Margem Bruta</span>
            <span className="font-bold text-slate-700 text-sm">{BRL(calc.margem_bruta || 0)} {p.preco_total > 0 && `(${( ((calc.margem_bruta || 0) / p.preco_total) * 100 ).toFixed(1)}%)`}</span>
          </div>
          
          <div className={`rounded-xl p-3.5 flex justify-between items-center border ${calc.lucro_liquido_real >= 0 ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
            <span className="font-bold text-xs uppercase tracking-wide">★ Lucro Líquido Real</span>
            <span className="font-black text-sm">{BRL(calc.lucro_liquido_real || 0)} {calc.lucro_liquido_pct !== null && calc.lucro_liquido_pct !== undefined && calc.lucro_liquido_pct !== 0 ? `(${(calc.lucro_liquido_pct * 100).toFixed(1)}%)` : p.preco_total > 0 ? `(${( ((calc.lucro_liquido_real || 0) / p.preco_total) * 100 ).toFixed(1)}%)` : ""}</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4 pt-2 text-left">
        <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-3">
          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">Especificações do Kit</span><span className="font-extrabold text-navy">{p.qtd_modulos} módulos × {p.potencia_modulo_w}W ({p.kwp_sistema} kWp)</span></div>
          {p.area_necessaria_m2 && <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Área necessária</span><span className="font-semibold">{p.area_necessaria_m2} m²</span></div>}
          <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Investimento da Venda</span><span className="font-black text-navy">{BRL(p.preco_total)}</span></div>
          
          {p.parceiro_id && (
            <div className="bg-sun/15 border border-sun/50 rounded-xl p-4 flex justify-between items-center text-navy-deep">
              <div>
                <strong className="block text-xs font-bold uppercase tracking-wider">Sua Comissão Estimada</strong>
                <span className="text-[10px] text-navy/70">Taxa individual: {p.parceiro?.comissao_percent !== null && p.parceiro?.comissao_percent !== undefined ? `${p.parceiro.comissao_percent}%` : p.preco_total > 0 ? `${(((calc.custo_comissao || 0) / p.preco_total) * 100).toFixed(0)}%` : "5%"}</span>
              </div>
              <strong className="text-lg font-black text-navy">{BRL(calc.custo_comissao || (p.preco_total * 0.05))}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  const now = new Date();
  
  // Filtra de acordo com o tipo de documento
  const typedPropostas = propostas.filter((p) => {
    const cond = p.condicoes_pagamento || "";
    if (modo === "cotacao") {
      return cond.includes("[DOC:COTACAO]");
    }
    if (modo === "financiamento") {
      return cond.includes("[DOC:FIN_AGUARDANDO]") || cond.includes("[DOC:FIN_APROVADO:");
    }
    // Propostas padrão: não possuem tags de cotação ou financiamento
    return !cond.includes("[DOC:COTACAO]") && !cond.includes("[DOC:FIN_AGUARDANDO]") && !cond.includes("[DOC:FIN_APROVADO:");
  });

  const filtered = typedPropostas.filter((p) => {
    const matchQ = !q || p.titulo?.toLowerCase().includes(q.toLowerCase()) ||
      p.proposta_clientes?.some((pc: any) => pc.cliente?.nome?.toLowerCase().includes(q.toLowerCase()));
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    const matchParceiro = filterParceiro === "todos" || p.parceiro?.id === filterParceiro;
    return matchQ && matchStatus && matchParceiro;
  });

  const getValidade = (p: any) => {
    if (!p.expires_at) return null;
    const exp = new Date(p.expires_at);
    const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-xs text-red-500 font-medium">Expirada</span>;
    if (days <= 3) return <span className="text-xs text-amber-600 font-medium">⚠️ {days}d restantes</span>;
    return <span className="text-xs text-muted-foreground">{days}d restantes</span>;
  };

  const getModoTitle = () => {
    if (modo === "cotacao") return "Cotações Rápidas";
    if (modo === "financiamento") return "Simulações de Financiamento";
    return "Propostas Comerciais";
  };

  const getModoButton = () => {
    if (modo === "cotacao") return "Nova cotação";
    if (modo === "financiamento") return "Nova simulação";
    return "Nova proposta";
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">{getModoTitle()}</h1>
          <p className="text-muted-foreground">{filtered.length} de {typedPropostas.length} registro(s)</p>
        </div>
        <Link to="/app/propostas/nova" search={{ modo } as any}>
          <Button className="bg-sun hover:bg-sun-deep text-navy font-bold shadow-md rounded-xl"><Plus className="w-4.5 h-4.5 mr-1" />{getModoButton()}</Button>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <Card className="p-4 border-0 shadow-md flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por título ou cliente…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {role === "admin" && (
          <Select value={filterParceiro} onValueChange={setFilterParceiro}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Todos os parceiros" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os parceiros</SelectItem>
              {parceiros.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {(filterStatus !== "todos" || filterParceiro !== "todos" || q) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterStatus("todos"); setFilterParceiro("todos"); setQ(""); }} className="text-muted-foreground">
            Limpar filtros
          </Button>
        )}
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-md">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma proposta encontrada com esses filtros.</p>
        </Card>
      ) : (
        <Card className="border-0 shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="suns-table-header text-left">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Cliente(s)</th>
                {role === "admin" && <th className="p-3">Parceiro</th>}
                <th className="p-3">Sistema</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
                <th className="p-3">Validade</th>
                <th className="p-3 text-center">Espelho</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const s = STATUS_LABEL[p.status] || STATUS_LABEL.rascunho;
                const isExpanded = expandedPropostaId === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr className="border-t hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <Link to="/app/propostas/$id" params={{ id: p.id }} className="font-semibold text-navy hover:underline">{p.titulo}</Link>
                      </td>
                      <td className="p-3 text-muted-foreground">{p.proposta_clientes?.map((pc: any) => pc.cliente?.nome).filter(Boolean).join(", ") || "—"}</td>
                      {role === "admin" && <td className="p-3 text-muted-foreground">{p.parceiro?.nome}</td>}
                      <td className="p-3">{Number(p.kwp_sistema).toFixed(2)} kWp</td>
                      <td className="p-3 font-semibold">{BRL(Number(p.preco_total))}</td>
                      <td className="p-3"><Badge className={s.color}>{s.label}</Badge></td>
                      <td className="p-3">{getValidade(p)}</td>
                      <td className="p-3 text-center">
                        <Button 
                          type="button"
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setExpandedPropostaId(isExpanded ? null : p.id)}
                          className={`h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-transform ${isExpanded ? "rotate-90 bg-amber-50" : ""}`}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-t border-b">
                        <td colSpan={role === "admin" ? 9 : 8} className="p-4">
                          <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-4 max-w-5xl mx-auto">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="text-sun w-5 h-5" />
                                <h4 className="text-navy text-sm font-extrabold uppercase tracking-wider">
                                  {role === "admin" ? "Espelho de Operação (Administrador)" : "Seu Espelho de Comissão (Parceiro)"}
                                </h4>
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-mono">
                                Proposta #{String(p.id).slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            {renderEspelhoDialogContent(p)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

const CostRow = ({ label, value, bold }: { label: string; value: number | null | undefined; bold?: boolean }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-slate-200 last:border-b-0 ${bold ? "font-bold text-navy pt-2 text-xs" : "text-slate-600 text-[11px]"}`}>
    <span>{label}</span>
    <span>{typeof value === "number" && !isNaN(value) ? BRL(value) : "—"}</span>
  </div>
);