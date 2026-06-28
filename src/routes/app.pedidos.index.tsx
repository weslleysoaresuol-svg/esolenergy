import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

export const Route = createFileRoute("/app/pedidos/")({
  head: () => ({ meta: [{ title: "Pedidos — ESOL Energy" }] }),
  component: PedidosList,
});

const COLS = [
  { k: "novo", label: "Novo", color: "bg-slate-100" },
  { k: "em_separacao", label: "Em separação", color: "bg-blue-100" },
  { k: "faturado", label: "Faturado", color: "bg-violet-100" },
  { k: "expedido", label: "Expedido", color: "bg-cyan-100" },
  { k: "entregue", label: "Entregue", color: "bg-amber-100" },
  { k: "instalado", label: "Instalado", color: "bg-emerald-100" },
  { k: "concluido", label: "Concluído", color: "bg-green-200" },
  { k: "cancelado", label: "Cancelado", color: "bg-rose-100" },
];

function PedidosList() {
  const { user } = useCurrentUser();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase.from as any)("pedidos")
        .select("*, cliente:cliente_id(nome, telefone)")
        .order("created_at", { ascending: false });
      setPedidos(data || []);
    })();
  }, [user]);

  const filtered = pedidos.filter((p) =>
    !q || p.numero?.toLowerCase().includes(q.toLowerCase()) || p.cliente?.nome?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-emerald-600" /> Pedidos
        </h1>
        <p className="text-muted-foreground text-sm">Controle do que foi vendido e seu status logístico</p>
      </div>

      <Card className="p-3">
        <Input placeholder="Buscar por número (PED-…) ou cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      <div className="grid md:grid-cols-4 gap-3">
        {COLS.map((col) => {
          const items = filtered.filter((p) => p.status === col.k);
          return (
            <div key={col.k}>
              <div className={`${col.color} px-3 py-2 rounded-t-lg text-sm font-semibold text-navy flex justify-between`}>
                {col.label} <span className="opacity-60">{items.length}</span>
              </div>
              <div className="bg-white border border-t-0 rounded-b-lg p-2 space-y-2 min-h-[80px]">
                {items.map((p) => (
                  <Link key={p.id} to="/app/pedidos/$id" params={{ id: p.id }}>
                    <Card className="p-2.5 hover:shadow transition cursor-pointer">
                      <div className="text-xs font-bold text-navy">{p.numero}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.cliente?.nome}</div>
                      <div className="text-sm font-semibold text-emerald-700 mt-1">{BRL(Number(p.valor_total))}</div>
                    </Card>
                  </Link>
                ))}
                {items.length === 0 && <div className="text-xs text-muted-foreground/50 text-center py-3">vazio</div>}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          Nenhum pedido ainda. Gere um pedido a partir de uma cotação ou proposta.
        </Card>
      )}
    </div>
  );
}
