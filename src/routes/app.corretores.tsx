import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  TrendingUp, DollarSign, Users, Target, Link2, FileText, ClipboardCopy, Send,
  Search, Phone, Mail, MapPin, Banknote, QrCode, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, User, Star, Calendar
} from "lucide-react";

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
  const [busca, setBusca] = useState("");

  // Estados dos convites
  const [convites, setConvites] = useState<any[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [novoCargo, setNovoCargo] = useState<"corretor" | "auxiliar" | "atendente">("corretor");
  const [enviandoConvite, setEnviandoConvite] = useState(false);

  // Estados dos termos/contratos
  const [contratos, setContratos] = useState<any[]>([]);

  // Drawer de detalhe do parceiro
  const [parceiroSel, setParceiroSel] = useState<any>(null);
  const [contratosParceiro, setContratosParceiro] = useState<any[]>([]);
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  const loadParceiros = async () => {
    setLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "corretor");
    const ids = (roles || []).map((r) => r.user_id);
    if (ids.length === 0) { setList([]); setLoading(false); return; }

    const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));

    const [{ data: profiles }, { data: clientes }, { data: propostas }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", ids),
      supabase.from("clientes").select("corretor_id, status").in("corretor_id", ids),
      supabase.from("propostas").select("parceiro_id, status, preco_total, created_at").in("parceiro_id", ids),
    ]);

    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const stats = (profiles || []).map((p) => {
      const userRole = roleMap.get(p.id) || "corretor";
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
      const conv = ps.filter((pr) => pr.status !== "rascunho");
      const conversao = conv.length > 0 ? (psAceitas.length / conv.length) * 100 : 0;

      return {
        ...p,
        role: userRole,
        total: cs.length,
        fechados: cs.filter((c) => ["contrato_assinado", "instalacao", "concluido"].includes(c.status)).length,
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
    const { data } = await (supabase
      .from("convites" as any)
      .select("*")
      .eq("role_to_assign", "corretor")
      .order("created_at", { ascending: false }) as any);
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
    if (parceiroSel?.id === id) setParceiroSel((p: any) => ({ ...p, ativo: !ativo }));
  };

  const setComissao = async (id: string, v: string) => {
    await supabase.from("profiles").update({ comissao_percent: Number(v) || 0 }).eq("id", id);
    toast.success("Comissão atualizada");
  };

  const criarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail) return;
    setEnviandoConvite(true);
    const token = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 10)).join("-");
    const { error } = await (supabase.from("convites" as any).insert({
      email: novoEmail.trim().toLowerCase(),
      token,
      status: "pendente",
      role_to_assign: "corretor",
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

  const abrirParceiro = async (p: any) => {
    setParceiroSel(p);
    setLoadingDrawer(true);
    const { data } = await supabase
      .from("contratos_parceria")
      .select("id,nome_completo,cpf,versao,assinado_em,user_id,ip_assinatura,selfie_url,documento_frente_url,documento_verso_url,user_agent,hash_conteudo_contrato,codigo_verificacao_email")
      .eq("user_id", p.id)
      .order("assinado_em", { ascending: false });
    setContratosParceiro(data || []);
    setLoadingDrawer(false);
  };

  // Filtro de busca
  const listaFiltrada = list.filter((p) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      (p.nome || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.cidade || "").toLowerCase().includes(q) ||
      (p.cpf_cnpj || "").toLowerCase().includes(q)
    );
  });

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

      {/* ===== ABA 1: LISTA DE PARCEIROS ===== */}
      {activeTab === "lista" && (
        <div className="space-y-5">
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
                <div className="text-xs text-muted-foreground mt-1">Todos os parceiros</div>
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
                <div className="text-xs text-muted-foreground mt-1">
                  {list.find((p) => p.conversao === Math.max(...list.map((x) => x.conversao)))?.nome || "—"}
                </div>
              </Card>
            </div>
          )}

          {/* Barra de busca */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail, cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground text-sm">Carregando parceiros...</div>
          ) : listaFiltrada.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              {busca ? (
                <p className="text-muted-foreground">Nenhum parceiro encontrado para "<strong>{busca}</strong>".</p>
              ) : (
                <>
                  <p className="text-muted-foreground">Nenhum parceiro ativo cadastrado no sistema.</p>
                  <button onClick={() => setActiveTab("convites")} className="mt-4 bg-navy text-white px-6 py-2.5 rounded-full font-semibold text-sm">
                    Gerar primeiro convite
                  </button>
                </>
              )}
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listaFiltrada.map((c, idx) => (
                <Card
                  key={c.id}
                  onClick={() => abrirParceiro(c)}
                  className="p-5 border-0 shadow-md flex flex-col justify-between h-full bg-white hover:shadow-lg hover:border-navy/20 border cursor-pointer transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${idx === 0 ? "bg-sun text-navy" : idx === 1 ? "bg-slate-200 text-navy" : idx === 2 ? "bg-amber-700/20 text-amber-800" : "bg-slate-100 text-navy"}`}>
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            `#${idx + 1}`
                          )}
                        </div>
                        <div>
                          <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-navy text-sm truncate max-w-[160px]">{c.nome || c.email}</h3>
                            <Badge variant="outline" className="text-[9px] w-fit bg-slate-50 border-slate-200 uppercase font-extrabold text-slate-500">
                              {c.role === "auxiliar" ? "Auxiliar Admin" : c.role === "atendente" ? "Atendente" : "Parceiro"}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px] mt-0.5">{c.email} · {c.cidade || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={c.ativo ? "default" : "secondary"} className="text-[10px]">{c.ativo ? "Ativo" : "Inativo"}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-navy transition-colors" />
                      </div>
                    </div>

                    {c.role === "corretor" ? (
                      <>
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

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 rounded-lg p-2">
                            <div className="text-[10px] text-muted-foreground uppercase">Faturamento</div>
                            <div className="font-bold text-navy mt-0.5">{BRL(c.receitaBruta)}</div>
                          </div>
                          <div className={`rounded-lg p-2 ${c.comissaoMes > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                            <div className="text-[10px] text-muted-foreground uppercase">Comissão Mês</div>
                            <div className={`font-bold mt-0.5 ${c.comissaoMes > 0 ? "text-amber-700" : "text-navy"}`}>
                              {BRL(c.comissaoMes)}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/80 space-y-1">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Permissões de Acesso</div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {c.role === "auxiliar" 
                            ? "Acesso operacional: controle de kits solares, pedidos e financiamentos." 
                            : "Acesso comercial: registro de leads, cotações e propostas."}
                        </p>
                      </div>
                    )}

                    {/* Indicador de dados bancários */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {(c.pix_chave || c.banco_conta) ? (
                        <><CheckCircle2 className="w-3 h-3 text-emerald-600" /><span className="text-emerald-700 font-semibold">Dados bancários cadastrados</span></>
                      ) : (
                        <><AlertTriangle className="w-3 h-3 text-amber-500" /><span className="text-amber-700 font-semibold">Dados bancários pendentes</span></>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t text-center">
                    Clique para ver detalhes completos →
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ABA 2: CONVITES ===== */}
      {activeTab === "convites" && (
        <div className="space-y-6">
          <Card className="p-5 border-0 shadow-md bg-white">
            <h3 className="font-bold text-navy text-base mb-2">Convidar Novo Parceiro Comercial</h3>
            <p className="text-xs text-muted-foreground mb-4">Insira o e-mail do integrador. O sistema gerará um link exclusivo de aceitação e assinatura do termo de parceria.</p>
            <form onSubmit={criarConvite} className="flex gap-2 max-w-lg">
              <Input type="email" required placeholder="E-mail do parceiro" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
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
                  <thead className="suns-table-header text-left">
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

      {/* ===== ABA 3: TERMOS ASSINADOS ===== */}
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
                  <thead className="suns-table-header text-left">
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

      {/* ===== DRAWER: DETALHES DO PARCEIRO ===== */}
      <Dialog open={!!parceiroSel} onOpenChange={(o) => { if (!o) setParceiroSel(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {parceiroSel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <div className="text-navy font-bold">{parceiroSel.nome || parceiroSel.email}</div>
                    <div className="text-xs text-muted-foreground font-normal">Consultor Parceiro</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Status + Comissão */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={parceiroSel.ativo ? "default" : "secondary"}>
                    {parceiroSel.ativo ? "✅ Ativo" : "⛔ Inativo"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Comissão: <strong className="text-navy">{parceiroSel.comissao_percent || 0}%</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggle(parceiroSel.id, parceiroSel.ativo)}
                    className={parceiroSel.ativo ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}
                  >
                    {parceiroSel.ativo ? <><XCircle className="w-3.5 h-3.5 mr-1" />Desativar</> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Ativar</>}
                  </Button>
                </div>

                {/* Dados pessoais */}
                <Card className="p-4 border bg-slate-50/50">
                  <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{parceiroSel.email || "—"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{parceiroSel.telefone || "—"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{parceiroSel.cidade || "—"}/{parceiroSel.estado || "—"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="w-3.5 h-3.5" />CPF: {parceiroSel.cpf_cnpj || "Não informado"}</div>
                  </div>
                  {parceiroSel.bio && (
                    <p className="mt-3 text-xs text-muted-foreground italic border-t pt-3">{parceiroSel.bio}</p>
                  )}
                </Card>

                {/* KPIs do parceiro */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Clientes", value: parceiroSel.total, color: "text-navy" },
                    { label: "Fechados", value: parceiroSel.fechados, color: "text-emerald-700" },
                    { label: "Conversão", value: `${(parceiroSel.conversao || 0).toFixed(0)}%`, color: "text-blue-700" },
                    { label: "Comissão Total", value: BRL(parceiroSel.comissaoTotal || 0), color: "text-amber-700" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white border rounded-xl p-3 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase">{k.label}</div>
                      <div className={`font-bold text-base mt-0.5 ${k.color}`}>{k.value}</div>
                    </div>
                  ))}
                </div>

                {/* Dados bancários */}
                <Card className="p-4 border">
                  <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" /> Dados para Pagamento de Comissões
                  </h3>
                  {parceiroSel.pix_chave ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-navy">Pix ({parceiroSel.pix_tipo || "—"}): </span>
                        <span className="font-mono text-sm">{parceiroSel.pix_chave}</span>
                      </div>
                      {parceiroSel.pix_tipo === "cpf" && parceiroSel.cpf_cnpj && (
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Chave no CPF cadastrado — Pagamento liberado
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Nenhuma chave Pix cadastrada. Solicite ao parceiro que complete seu perfil.
                    </div>
                  )}
                  {parceiroSel.banco_nome && (
                    <div className="mt-3 pt-3 border-t text-sm space-y-1">
                      <div className="font-semibold text-navy">{parceiroSel.banco_nome}</div>
                      <div className="text-muted-foreground text-xs">
                        Ag: {parceiroSel.banco_agencia || "—"} · Conta: {parceiroSel.banco_conta || "—"}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Contratos assinados */}
                <Card className="p-4 border">
                  <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-navy" /> Termos de Parceria Assinados
                  </h3>
                  {loadingDrawer ? (
                    <p className="text-xs text-muted-foreground">Carregando contratos…</p>
                  ) : contratosParceiro.length === 0 ? (
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Nenhum termo assinado pelo parceiro ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contratosParceiro.map((ct) => (
                        <div key={ct.id} className="space-y-2 bg-slate-50 border rounded-xl p-3">
                          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <div>
                                <div className="text-xs font-bold text-navy">{ct.nome_completo} — Versão {ct.versao}</div>
                                <div className="text-[10px] text-muted-foreground">CPF: {ct.cpf}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                                <Calendar className="w-3 h-3" />
                                {new Date(ct.assinado_em).toLocaleDateString("pt-BR")}
                              </div>
                              {ct.ip_assinatura && (
                                <div className="text-[9px] text-muted-foreground font-mono">{ct.ip_assinatura}</div>
                              )}
                            </div>
                          </div>

                          {/* Seção de Documentos & Selfie do Contrato */}
                          {ct.selfie_url && (
                            <div className="mt-2 p-2.5 bg-white border border-slate-200/50 rounded-xl space-y-2.5">
                              <div className="text-[9px] text-navy font-bold uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Identificação e Validade Jurídica
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[8px] text-slate-500 font-bold block">Selfie com Doc</span>
                                  <a 
                                    href={supabase.storage.from("parceiros").getPublicUrl(ct.selfie_url).data.publicUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <img 
                                      src={supabase.storage.from("parceiros").getPublicUrl(ct.selfie_url).data.publicUrl} 
                                      alt="Selfie" 
                                      className="w-full h-12 object-cover rounded-lg border hover:scale-105 transition-transform shadow-sm"
                                    />
                                  </a>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] text-slate-500 font-bold block">Doc (Frente)</span>
                                  <a 
                                    href={supabase.storage.from("parceiros").getPublicUrl(ct.documento_frente_url).data.publicUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <img 
                                      src={supabase.storage.from("parceiros").getPublicUrl(ct.documento_frente_url).data.publicUrl} 
                                      alt="Doc Frente" 
                                      className="w-full h-12 object-cover rounded-lg border hover:scale-105 transition-transform shadow-sm"
                                    />
                                  </a>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] text-slate-500 font-bold block">Doc (Verso)</span>
                                  <a 
                                    href={supabase.storage.from("parceiros").getPublicUrl(ct.documento_verso_url).data.publicUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <img 
                                      src={supabase.storage.from("parceiros").getPublicUrl(ct.documento_verso_url).data.publicUrl} 
                                      alt="Doc Verso" 
                                      className="w-full h-12 object-cover rounded-lg border hover:scale-105 transition-transform shadow-sm"
                                    />
                                  </a>
                                </div>
                              </div>
                              
                              <div className="text-[8px] text-slate-500 font-mono space-y-0.5 border-t pt-2 leading-relaxed">
                                <div className="truncate"><strong>Hash SHA-256:</strong> <span className="bg-slate-100 px-1 py-0.5 rounded text-navy select-all">{ct.hash_conteudo_contrato || "Legado"}</span></div>
                                <div><strong>E-mail Verificado:</strong> {ct.codigo_verificacao_email || "—"}</div>
                                <div className="truncate"><strong>User Agent:</strong> {ct.user_agent || "—"}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground font-semibold">Ajustar % de Comissão</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.1"
                        defaultValue={parceiroSel.comissao_percent}
                        className="h-9 w-28 text-sm"
                        id="input-comissao-parceiro"
                      />
                      <Button
                        size="sm"
                        className="bg-navy text-white"
                        onClick={() => {
                          const el = document.getElementById("input-comissao-parceiro") as HTMLInputElement;
                          if (el) { setComissao(parceiroSel.id, el.value); toast.success("Comissão salva!"); }
                        }}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
