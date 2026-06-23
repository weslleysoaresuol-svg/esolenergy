import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/clientes")({
  component: AdminClientes,
});

const STATUS_LABEL: Record<string,string> = {
  novo:"Novo",contato:"Contato",visita_agendada:"Visita",proposta_enviada:"Proposta",
  negociacao:"Negociação",contrato_assinado:"Contrato",instalacao:"Instalação",concluido:"Concluído",perdido:"Perdido",
};

function AdminClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todos");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("clientes").select("*, profiles:corretor_id(nome)").order("created_at", { ascending: false });
      setClientes(data || []);
    })();
  }, []);

  const filtered = clientes.filter((c) =>
    (status === "todos" || c.status === status) &&
    (!q || c.nome.toLowerCase().includes(q.toLowerCase()) || c.telefone?.includes(q) || c.cidade?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-navy">Clientes</h1>
        <p className="text-muted-foreground">{filtered.length} de {clientes.length} cliente(s)</p>
      </div>
      <Card className="p-4 border-0 shadow-md flex flex-wrap gap-3">
        <Input placeholder="Buscar por nome, telefone ou cidade…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>
      <Card className="border-0 shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Cidade</th><th className="p-3">Parceiro</th><th className="p-3">Status</th><th className="p-3">Valor</th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="p-3"><Link to="/app/cliente/$id" params={{ id: c.id }} className="font-semibold text-navy hover:underline">{c.nome}</Link></td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3">{c.cidade || "—"}</td>
                <td className="p-3">{c.profiles?.nome || <span className="text-muted-foreground">Não atribuído</span>}</td>
                <td className="p-3"><Badge variant="outline">{STATUS_LABEL[c.status]}</Badge></td>
                <td className="p-3">{c.valor_estimado ? `R$ ${Number(c.valor_estimado).toLocaleString("pt-BR")}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum cliente encontrado.</div>}
      </Card>
    </div>
  );
}
