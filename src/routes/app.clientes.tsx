import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Users, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/clientes")({
  head: () => ({ meta: [{ title: "Clientes & Leads — ESOL Energy" }] }),
  component: AdminClientes,
});

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  contato: "Contato",
  visita_agendada: "Visita",
  proposta_enviada: "Proposta",
  negociacao: "Negociação",
  contrato_assinado: "Contrato",
  instalacao: "Instalação",
  concluido: "Concluído",
  perdido: "Perdido",
};

function AdminClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("clientes")
        .select("*, profiles:corretor_id(nome)")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro na busca primária de clientes (tentando fallback):", error);
        // Fallback: busca sem join com profiles para garantir que os dados apareçam
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("clientes")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (fallbackError) {
          console.error("Erro no fallback de clientes:", fallbackError);
          setErrorMsg(`Falha no banco: ${fallbackError.message} (${fallbackError.code || "DB_ERROR"}). Verifique as políticas RLS.`);
          setClientes([]);
        } else {
          setClientes(fallbackData || []);
        }
      } else {
        setClientes(data || []);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = clientes.filter((c) =>
    (status === "todos" || c.status === status) &&
    (!q || c.nome.toLowerCase().includes(q.toLowerCase()) || c.telefone?.includes(q) || c.cidade?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-navy">Clientes & Leads</h1>
          <p className="text-muted-foreground">
            {loading ? "Buscando clientes..." : `${filtered.length} de ${clientes.length} cliente(s) localizado(s)`}
          </p>
        </div>
        <Link to="/app/novo" className="inline-flex items-center gap-2 bg-sun hover:bg-sun-deep text-navy px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all">
          + Novo Cliente
        </Link>
      </div>

      {errorMsg && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/40 text-red-800 text-xs flex gap-2 items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Alerta do Banco de Dados:</span> {errorMsg}
          </div>
        </Card>
      )}

      <Card className="p-4 border-0 shadow-md flex flex-wrap gap-3 bg-white">
        <Input 
          placeholder="Buscar por nome, telefone ou cidade…" 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          className="max-w-sm h-10 text-xs" 
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48 h-10 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-navy" />
          <span className="text-sm font-semibold">Carregando carteira de clientes...</span>
        </div>
      ) : (
        <Card className="border-0 shadow-md overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Cidade</th>
                <th className="p-3">Parceiro</th>
                <th className="p-3">Status</th>
                <th className="p-3">Valor</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold">
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">
                    <Link to="/app/cliente/$id" params={{ id: c.id }} className="font-bold text-navy hover:underline">
                      {c.nome}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-600">{c.telefone}</td>
                  <td className="p-3 text-slate-600">{c.cidade || "—"}</td>
                  <td className="p-3 text-slate-600">
                    {c.profiles?.nome || <span className="text-muted-foreground font-normal">Não atribuído</span>}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px]">
                      {STATUS_LABEL[c.status]}
                    </Badge>
                  </td>
                  <td className="p-3 text-navy">
                    {c.valor_estimado ? `R$ ${Number(c.valor_estimado).toLocaleString("pt-BR")}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Users className="w-8 h-8 opacity-40 text-slate-400" />
              <span>Nenhum cliente cadastrado ou localizado com estes filtros.</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
