import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Eye, Check, X, Clock } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

export const Route = createFileRoute("/app/propostas/")({ component: PropostasList });

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

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("propostas")
        .select("*, parceiro:parceiro_id(nome), proposta_clientes(cliente:cliente_id(nome))")
        .order("created_at", { ascending: false });
      setPropostas(data || []);
    })();
  }, []);

  const filtered = propostas.filter((p) =>
    !q || p.titulo?.toLowerCase().includes(q.toLowerCase()) ||
    p.proposta_clientes?.some((pc: any) => pc.cliente?.nome?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Propostas</h1>
          <p className="text-muted-foreground">{filtered.length} proposta(s)</p>
        </div>
        <Link to="/app/propostas/nova">
          <Button className="bg-sun hover:bg-sun-deep text-navy font-semibold"><Plus className="w-4 h-4 mr-1" />Nova proposta</Button>
        </Link>
      </div>

      <Card className="p-4 border-0 shadow-md">
        <Input placeholder="Buscar por título ou cliente…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-md">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma proposta ainda. Crie a primeira!</p>
        </Card>
      ) : (
        <Card className="border-0 shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Cliente(s)</th>
                {role === "admin" && <th className="p-3">Parceiro</th>}
                <th className="p-3">Sistema</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
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