import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Eye, Check, X, Clock } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

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

  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: profs }] = await Promise.all([
        supabase
          .from("propostas")
          .select("*, parceiro:parceiro_id(nome, id), proposta_clientes(cliente:cliente_id(nome))")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, nome").order("nome"),
      ]);
      setPropostas(ps || []);
      setParceiros(profs || []);
    })();
  }, [modo]);

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
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const s = STATUS_LABEL[p.status] || STATUS_LABEL.rascunho;
                return (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <Link to="/app/propostas/$id" params={{ id: p.id }} className="font-semibold text-navy hover:underline">{p.titulo}</Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.proposta_clientes?.map((pc: any) => pc.cliente?.nome).filter(Boolean).join(", ") || "—"}</td>
                    {role === "admin" && <td className="p-3 text-muted-foreground">{p.parceiro?.nome}</td>}
                    <td className="p-3">{Number(p.kwp_sistema).toFixed(2)} kWp</td>
                    <td className="p-3 font-semibold">{BRL(Number(p.preco_total))}</td>
                    <td className="p-3"><Badge className={s.color}>{s.label}</Badge></td>
                    <td className="p-3">{getValidade(p)}</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}