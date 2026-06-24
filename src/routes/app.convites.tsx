import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Link as LinkIcon, Plus, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/app/convites")({
  head: () => ({ meta: [{ title: "Convites — ESOL Energy" }] }),
  component: ConvitesPage,
});

type Invite = {
  id: string;
  token: string;
  note: string | null;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
};

function ConvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("partner_invites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setInvites(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("partner_invites")
      .insert({ created_by: userData.user.id, note: note || null })
      .select()
      .single();
    setLoading(false);
    if (error) return toast.error(error.message);
    setNote("");
    const link = `${window.location.origin}/convite/${data.token}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Convite criado e link copiado!");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este convite?")) return;
    const { error } = await supabase.from("partner_invites").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Convite excluído"); load(); }
  };

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const status = (inv: Invite) => {
    if (inv.used_at) return { label: "Utilizado", icon: CheckCircle2, color: "text-green-600" };
    if (new Date(inv.expires_at) < new Date()) return { label: "Expirado", icon: XCircle, color: "text-red-600" };
    return { label: "Ativo", icon: Clock, color: "text-sun-deep" };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Convites de parceiros</h1>
        <p className="text-sm text-muted-foreground">Gere um link único para cada novo parceiro. O link expira em 72h ou quando usado.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Gerar novo convite</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Label>Identificação (opcional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: João Silva — região SP" />
            </div>
            <Button type="submit" disabled={loading} className="bg-sun-deep hover:bg-sun text-navy">
              <Plus className="w-4 h-4 mr-2" />Gerar link
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Convites emitidos ({invites.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {invites.length === 0 && <p className="text-sm text-muted-foreground">Nenhum convite ainda.</p>}
          {invites.map((inv) => {
            const s = status(inv);
            const active = !inv.used_at && new Date(inv.expires_at) >= new Date();
            return (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className={`font-medium ${s.color}`}>{s.label}</span>
                    {inv.note && <span className="text-muted-foreground">· {inv.note}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Criado {new Date(inv.created_at).toLocaleString("pt-BR")} · Expira {new Date(inv.expires_at).toLocaleString("pt-BR")}
                    {inv.used_at && ` · Usado ${new Date(inv.used_at).toLocaleString("pt-BR")}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  {active && (
                    <Button size="sm" variant="outline" onClick={() => copyLink(inv.token)}>
                      <Copy className="w-3.5 h-3.5 mr-1" />Copiar link
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(inv.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground flex gap-3">
          <LinkIcon className="w-5 h-5 flex-shrink-0 text-navy" />
          <div>
            <p className="font-medium text-navy mb-1">Como funciona</p>
            <p>Ao gerar um convite, o link é copiado automaticamente. Compartilhe com o novo parceiro. Ele poderá criar a conta (Google ou email), preencher o perfil e assinar o contrato. Cada link só serve para um parceiro e expira em 72h.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
