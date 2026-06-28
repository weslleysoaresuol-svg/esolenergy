import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Landmark, Clock, CheckCircle2, XCircle } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

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
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase.from as any)("financiamentos")
        .select("*, cliente:cliente_id(nome, telefone)")
        .order("created_at", { ascending: false });
      setItems(data || []);
    })();
  }, [user]);

  const filtered = items.filter((f) =>
    !q || f.cliente?.nome?.toLowerCase().includes(q.toLowerCase()) || f.banco?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
          <Landmark className="w-7 h-7 text-blue-600" /> Financiamentos
        </h1>
        <p className="text-muted-foreground text-sm">Esteira de aprovação. Cliente vê o status visual pelo link.</p>
      </div>

      <Card className="p-3">
        <Input placeholder="Buscar por cliente ou banco…" value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <Landmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhum financiamento. Inicie um a partir de um pedido.
          </Card>
        )}
        {filtered.map((f) => {
          const st = STATUS_LABEL[f.status] || STATUS_LABEL.em_analise;
          const Icon = st.icon;
          return (
            <Link key={f.id} to="/app/financiamentos/$id" params={{ id: f.id }}>
              <Card className="p-4 hover:shadow-md transition cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy truncate">{f.cliente?.nome}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {f.banco || "Banco não definido"} • {BRL(Number(f.valor_solicitado))}
                    {f.parcelas && ` • ${f.parcelas}x`}
                  </div>
                </div>
                <Badge className={st.color}>{st.label}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
