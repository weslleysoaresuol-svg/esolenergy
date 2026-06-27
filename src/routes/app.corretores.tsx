import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Users, Target, Link2, FileText, ClipboardCopy, Send } from "lucide-react";

export const Route = createFileRoute("/app/corretores")({
  head: () => ({ meta: [{ title: "Parceiros & Equipe — ESOL Energy" }] }),
  component: AdminCorretores,
});

const BRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function AdminCorretores() {
  const [activeTab, setActiveTab] = useState<"lista" | "convites" | "contratos">("lista");
  const [list, setList] = useState<any[]>([]);
  const [totalComissao, setTotalComissao] = useState(0);
  const [totalReceita, setTotalReceita] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados dos convites
  const [convites, setConvites] = useState<any[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [enviandoConvite, setEnviandoConvite] = useState(false);

  // Estados dos termos/contratos
  const [contratos, setContratos] = useState<any[]>([]);

  const loadParceiros = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "corretor");
    const ids = (roles || []).map((r) => r.user_id);
    if (ids.length === 0) { setList([]); setLoading(false); return; }
    
    const [{ data: profiles }, { data: clientes }, { data: propostas }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", ids),
      supabase.from("clientes").select("corretor_id, status").in("corretor_id", ids),
      supabase.from("propostas").select("parceiro_id, status, preco_total, created_at").in("parceiro_id", ids),
    ]);

    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const stats = (profiles || []).map((p) => {
      const cs = (clientes || []).filter((c) => c.corretor_id === p.id);
      const ps = (propostas || []).filter((pr) => pr.parceiro_id === p.id);
      const psAceitas = ps.filter((pr) => pr.status === "aceita");
      const receitaBruta = psAceitas.reduce((s, pr) => s + Number(pr.preco_total || 0), 0);
      const comissaoPct = Number(p.comissao_percent || 0);
      const comissaoTotal = receitaBruta * (comissaoPct / 100);
      
      const psMes = psAceitas.filter((pr) => {
        const d = new Date(pr.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === mesAtual;
      });
      const receitaMes = psMes.reduce((s, pr) => s + Number(pr.preco_total || 0), 0);
      const comissaoMes = receitaMes * (comissaoPct / 100);
      const conversao = ps.length > 0 ? ((psAceitas.length / ps.filter((pr) => pr.status !== "rascunho").length) * 100) : 0;
      
      return {
        ...p,
        total: cs.length,
        fechados: cs.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length,
        propostas: ps.length,
        propostasAceitas: psAceitas.length,
        receitaBruta,
        comissaoTotal,
        comissaoMes,
        receitaMes,
        conversao: isNaN(conversao) ? 0 : conversao,
      };
    }).sort((a, b) => b.receitaBruta - a.receitaBruta);

    setList(stats);
    setTotalComissao(stats.reduce((s, p) => s + p.comissaoMes, 0));
    setTotalReceita(stats.reduce((s, p) => s + p.receitaBruta, 0));
    setLoading(false);
  };

  const loadConvites = async () => {
    const { data } = await (supabase.from("convites" as any).select("*").order("created_at", { ascending: false }) as any);
    setConvites(data || []);
  };

  const loadContratos = async () => {
    const { data } = await supabase
      .from("contratos_parceria")
      .select("id,nome_completo,cpf,versao,assinado_em,user_id,ip_assinatura")
      .order("assinado_em", { ascending: false });
    setContratos(data || []);
  };

  useEffect(() => {
    if (activeTab === "lista") loadParceiros();
    if (activeTab === "convites") loadConvites();
    if (activeTab === "contratos") loadContratos();
  }, [activeTab]);

  const toggle = async (id: string, ativo: boolean) => {
    await supabase.from("profiles").update({ ativo: !ativo }).eq("id", id);
    toast.success(!ativo ? "Parceiro ativado" : "Parceiro desativado");
    loadParceiros();
  };

  const setComissao = async (id: string, v: string) => {
    await supabase.from("profiles").update({ comissao_percent: Number(v) || 0 }).eq("id", id);
    toast.success("Comissão atualizada");
  };

  const criarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail) return;
    setEnviandoConvite(true);
    const token = crypto.randomUUID();
    
    const { error } = await (supabase.from("convites" as any).insert({
      email: novoEmail.trim().toLowerCase(),
      token,
      status: "pendente",
    } as any) as any);

    setEnviandoConvite(false);
    if (error) {
      toast.error("Erro ao criar convite: " + error.message);
    } else {
      toast.success("Convite gerado com sucesso!");
      setNovoEmail("");
      loadConvites();
    }
  };

  const copiarLink = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de acesso copiado!");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Topo */}
      <div>
        <h1 className="text-3xl font-bold text-navy">Parceiros & Equipe</h1>
        <p className="text-muted-foreground">Gerenciamento completo de integradores, acessos e assinaturas de termos.</p>
      </div>

      {/* Abas */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("lista")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "lista" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <Users className="w-4 h-4" /> Integradores Ativos
        </button>
        <button
          onClick={() => setActiveTab("convites")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "convites" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <Link2 className="w-4 h-4" /> Convites de Acesso
        </button>
        <button
          onClick={() => setActiveTab("contratos")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "contratos" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <FileText className="w-4 h-4" /> Termos Assinados
        </button>
      </div>

      {/* ABA 1: LISTA DE PARCEIROS */}
      {activeTab === "lista" && (
        <div className="space-y-6">
          {/* KPIs globais */}
          {list.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border-0 shadow-md">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
                <div className="text-xs text-muted-foreground">Total de parceiros</div>
                <div className="font-bold text-xl text-navy">{list.length}</div>
                <div className="text-xs text-muted-foreground mt-1">{list.filter((p) => p.ativo).length} ativos</div>
              </Card>
              <Card className="p-4 border-0 shadow-md">
                <div className="w-9 h-9 rounded-lg bg-sun/10 text-sun-deep flex items-center justify-center mb-2"><DollarSign className="w-4 h-4" /></div>
                <div className="text-xs text-muted-foreground">Receita total gerada</div>
                <div className="font-bold text-xl text-navy">{BRL(totalReceita)}</div>
                <div className="text-xs text-muted-foreground mt-1">Somando todos os parceiros</div>
              </Card>
              <Card className="p-4 border-0 shadow-md bg-amber-50">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2"><DollarSign className="w-4 h-4" /></div>
                <div className="text-xs text-muted-foreground">Comissões a pagar (mês)</div>
                <div className="font-bold text-xl text-amber-700">{BRL(totalComissao)}</div>
                <div className="text-xs text-muted-foreground mt-1">Baseado em propostas aceitas</div>
              </Card>
              <Card className="p-4 border-0 shadow-md">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2"><Target className="w-4 h-4" /></div>
                <div className="text-xs text-muted-foreground">Melhor conversão</div>
                <div className="font-bold text-xl text-navy">
                  {list.length > 0 ? `${Math.max(...list.map((p) => p.conversao)).toFixed(0)}%` : "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{list.find((p) => p.conversao === Math.max(...list.map((x) => x.conversao)))?.nome || "—"}</div>
              </Card>
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-muted-foreground text-sm">Carregando parceiros...</div>
          ) : list.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-muted-foreground">Nenhum parceiro ativo cadastrado no sistema.</p>
              <button onClick={() => setActiveTab("convites")} className="mt-4 bg-navy text-white px-6 py-2.5 rounded-full font-semibold text-sm">
                Gerar primeiro convite
              </button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((c, idx) => (
                <Card key={c.id} className="p-5 border-0 shadow-md flex flex-col justify-between h-full bg-white">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm ${idx === 0 ? "bg-sun text-navy" : idx === 1 ? "bg-slate-200 text-navy" : idx === 2 ? "bg-amber-700/20 text-amber-800" : "bg-slate-100 text-navy"}`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-navy text-sm">{c.nome || c.email}</h3>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{c.email} · {c.cidade || "—"}</p>
                        </div>
                      </div>
                      <Badge variant={c.ativo ? "default" : "secondary"} className="text-[10px]">{c.ativo ? "Ativo" : "Inativo"}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-muted-foreground">Clientes</div>
                        <div className="font-bold text-navy mt-0.5">{c.total}</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2">
                        <div className="text-[10px] text-emerald-800">Fechados</div>
                        <div className="font-bold text-emerald-700 mt-0.5">{c.fechados}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-[10px] text-blue-800">Conversão</div>
                        <div className="font-bold text-blue-700 mt-0.5">{c.conversao.toFixed(0)}%</div>
                      </div>
                    </div>

                    {/* Faturamento e Comissões */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-muted-foreground uppercase">Faturamento</div>
                        <div className="font-bold text-navy mt-0.5">{BRL(c.receitaBruta)}</div>
                      </div>
                      <div className={`rounded-lg p-2 ${c.comissaoMes > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                        <div className="text-[10px] text-muted-foreground uppercase">Comissão</div>
                        <div className={`font-bold mt-0.5 ${c.comissaoMes > 0 ? "text-amber-700" : "text-navy"}`}>
                          {BRL(c.comissaoMes)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-end mt-4 border-t pt-4">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground font-semibold">Comissão %</label>
                      <Input type="number" step="0.1" defaultValue={c.comissao_percent} onBlur={(e) => setComissao(c.id, e.target.value)} className="h-8 text-xs mt-0.5" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggle(c.id, c.ativo)} className="h-8 text-xs">{c.ativo ? "Desativar" : "Ativar"}</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CONVITES DE ACESSO */}
      {activeTab === "convites" && (
        <div className="space-y-6">
          <Card className="p-5 border-0 shadow-md bg-white">
            <h3 className="font-bold text-navy text-base mb-2">Convidar Novo Parceiro Comercial</h3>
            <p className="text-xs text-muted-foreground mb-4">Insira o e-mail do integrador. O sistema gerará um link exclusivo de aceitação e assinatura do termo de parceria.</p>
            <form onSubmit={criarConvite} className="flex gap-2 max-w-lg">
              <Input
                type="email"
                required
                placeholder="E-mail do parceiro"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
              />
              <Button type="submit" disabled={enviandoConvite} className="bg-sun-deep hover:bg-sun text-navy font-bold flex gap-1.5 items-center">
                <Send className="w-4 h-4" /> {enviandoConvite ? "Gerando..." : "Gerar Convite"}
              </Button>
            </form>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden bg-white">
            <div className="p-5 border-b font-bold text-navy text-sm">Histórico de Convites Emitidos</div>
            {convites.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Nenhum convite emitido até o momento.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-navy/70 border-b">
                    <tr>
                      <th className="p-3">Destinatário</th>
                      <th className="p-3">Token</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Gerado em</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs font-semibold">
                    {convites.map((cv) => (
                      <tr key={cv.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-navy">{cv.email}</td>
                        <td className="p-3 text-muted-foreground font-mono text-[10px]">{cv.token}</td>
                        <td className="p-3">
                          <Badge variant={cv.status === "aceito" ? "default" : "secondary"} className="text-[10px]">
                            {cv.status === "aceito" ? "Aceito" : "Pendente"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(cv.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => copiarLink(cv.token)} className="text-sun-deep hover:text-navy flex gap-1 items-center justify-end w-full">
                            <ClipboardCopy className="w-3.5 h-3.5" /> Copiar Link
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ABA 3: TERMOS DE PARCERIA ASSINADOS */}
      {activeTab === "contratos" && (
        <div className="space-y-6">
          <Card className="border-0 shadow-md overflow-hidden bg-white">
            <div className="p-5 border-b font-bold text-navy text-sm">Log de Aceite dos Termos de Parceria</div>
            {contratos.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
                Nenhum termo de parceria assinado eletronicamente ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-navy/70 border-b">
                    <tr>
                      <th className="p-3">Parceiro</th>
                      <th className="p-3">CPF</th>
                      <th className="p-3">Versão</th>
                      <th className="p-3">Assinado em</th>
                      <th className="p-3">IP de Assinatura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs font-semibold">
                    {contratos.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-navy">{c.nome_completo}</td>
                        <td className="p-3 text-muted-foreground">{c.cpf}</td>
                        <td className="p-3 text-muted-foreground">Versão {c.versao}</td>
                        <td className="p-3 text-navy">{new Date(c.assinado_em).toLocaleString("pt-BR")}</td>
                        <td className="p-3 text-muted-foreground font-mono text-[10px]">{c.ip_assinatura || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
