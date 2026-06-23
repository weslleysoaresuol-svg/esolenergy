import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/app/corretores")({
  component: AdminCorretores,
});

function AdminCorretores() {
  const [list, setList] = useState<any[]>([]);
  const load = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "corretor");
    const ids = (roles || []).map((r) => r.user_id);
    if (ids.length === 0) { setList([]); return; }
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
    // count clientes per corretor
    const { data: clientes } = await supabase.from("clientes").select("corretor_id, status").in("corretor_id", ids);
    const stats = (profiles || []).map((p) => {
      const cs = (clientes || []).filter((c) => c.corretor_id === p.id);
      return { ...p, total: cs.length, fechados: cs.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length };
    });
    setList(stats);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, ativo: boolean) => {
    await supabase.from("profiles").update({ ativo: !ativo }).eq("id", id);
    toast.success(!ativo ? "Parceiro ativado" : "Parceiro desativado");
    load();
  };
  const setComissao = async (id: string, v: string) => {
    await supabase.from("profiles").update({ comissao_percent: Number(v) || 0 }).eq("id", id);
    toast.success("Comissão atualizada");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-navy">Parceiros</h1>
        <p className="text-muted-foreground">{list.length} parceiro(s) cadastrado(s)</p>
      </div>
      {list.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground">Nenhum parceiro cadastrado ainda.</p>
          <p className="text-sm mt-2">Compartilhe o link <code>/auth</code> com seus parceiros para começarem.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((c) => (
            <Card key={c.id} className="p-5 border-0 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-navy">{c.nome || c.email}</h3>
                  <p className="text-xs text-muted-foreground">{c.email} · {c.cidade || "—"}</p>
                </div>
                <Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div><div className="text-xs text-muted-foreground">Clientes</div><div className="font-bold text-navy">{c.total}</div></div>
                <div><div className="text-xs text-muted-foreground">Fechados</div><div className="font-bold text-emerald-700">{c.fechados}</div></div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Comissão %</label>
                  <Input type="number" step="0.1" defaultValue={c.comissao_percent} onBlur={(e) => setComissao(c.id, e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={() => toggle(c.id, c.ativo)}>{c.ativo ? "Desativar" : "Ativar"}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
