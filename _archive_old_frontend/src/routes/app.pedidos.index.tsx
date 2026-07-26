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

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {COLS.map((col) => {
          const items = filtered.filter((p) => p.status === col.k);
          return (
            <div key={col.k} className="flex flex-col">
              <div className="bg-[#EBF0F6] px-3.5 py-2.5 rounded-t-2xl text-[10px] uppercase tracking-wider font-extrabold text-[#4F5E7B] flex justify-between items-center border border-[#E2E8F0] border-b-0 shadow-sm">
                <span>{col.label}</span>
                <span className="bg-[#FFFFFF] text-navy px-1.5 py-0.5 rounded-md text-[9px] font-black border border-[#E2E8F0]">
                  {items.length}
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-b-2xl p-2.5 space-y-2.5 min-h-[140px] flex-1">
                {items.map((p) => (
                  <Link key={p.id} to="/app/pedidos/$id" params={{ id: p.id }} className="block">
                    <Card className="p-3 bg-white border border-[#E2E8F0] hover:border-[#2E44B8]/40 shadow-sm hover:shadow transition duration-200 cursor-pointer rounded-xl">
                      <div className="text-xs font-bold text-navy">{p.numero}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{p.cliente?.nome}</div>
                      <div className="text-xs font-extrabold text-[#2E44B8] mt-1.5">{BRL(Number(p.valor_total))}</div>
                    </Card>
                  </Link>
                ))}
                {items.length === 0 && (
                  <div className="text-[10px] text-slate-400 font-medium text-center py-6 select-none">Vazio</div>
                )}
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
