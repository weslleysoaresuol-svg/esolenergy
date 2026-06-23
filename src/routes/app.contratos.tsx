import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/app/contratos")({
  head: () => ({ meta: [{ title: "Contratos — ESOL Energy" }] }),
  component: ContratosAdminPage,
});

function ContratosAdminPage() {
  const { role } = useCurrentUser();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("contratos_parceria")
        .select("id,nome_completo,cpf,versao,assinado_em,user_id,ip_assinatura")
        .order("assinado_em", { ascending: false });
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (role !== "admin") return <div className="text-muted-foreground">Acesso restrito.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Contratos assinados</h1>
        <p className="text-muted-foreground">Todos os contratos de parceria assinados pelos parceiros.</p>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            Nenhum contrato assinado ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Parceiro</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Versão</th>
                <th className="px-4 py-3">Assinado em</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{c.nome_completo}</td>
                  <td className="px-4 py-3">{c.cpf}</td>
                  <td className="px-4 py-3">{c.versao}</td>
                  <td className="px-4 py-3">{new Date(c.assinado_em).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.ip_assinatura || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/app/contrato/$id" params={{ id: c.id }} className="text-navy underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
