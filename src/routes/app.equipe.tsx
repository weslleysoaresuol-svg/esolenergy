import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  TrendingUp, Users, Target, Link2, FileText, ClipboardCopy, Send,
  Search, Mail, MapPin, ShieldCheck, AlertTriangle, CheckCircle2,
  ChevronRight, Calendar, UserCog, UserCheck, Briefcase, Check, MessageCircle
} from "lucide-react";

export const Route = createFileRoute("/app/equipe")({
  head: () => ({ meta: [{ title: "Equipe & Controle de Acessos — ESOL Energy" }] }),
  component: AdminEquipe,
});

const ROLE_BADGES: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  auxiliar: "bg-blue-50 text-blue-700 border-blue-200",
  atendente: "bg-indigo-50 text-indigo-700 border-indigo-200",
  vendedor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  engenheiro: "bg-purple-50 text-purple-700 border-purple-200",
  pos_vendas: "bg-orange-50 text-orange-700 border-orange-200",
  financeiro: "bg-amber-50 text-amber-700 border-amber-200",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  auxiliar: "Auxiliar Admin",
  atendente: "Atendente",
  vendedor: "Vendedor Interno",
  engenheiro: "Engenheiro / Projetista",
  pos_vendas: "Pós-Vendas & Logística",
  financeiro: "Financeiro / Contábil",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Acesso total e irrestrito ao sistema.",
  auxiliar: "Suporte administrativo: gerencia kits, pedidos e leads. Sem relatórios financeiros.",
  atendente: "Atendimento comercial: registro de leads, cotações rápidas e propostas básicas.",
  vendedor: "Vendas internas: prospecta leads, elabora propostas completas e gera pedidos.",
  engenheiro: "Área de engenharia e projetos: homologação, relatórios de potência e kits.",
  pos_vendas: "Acompanhamento pós-venda: logística, cronograma de instalação e entrega.",
  financeiro: "Contabilidade e faturamento: controle financeiro, comissões de parceiros e caixa.",
};

function AdminEquipe() {
  const { role, loading: loadingUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"lista" | "convites" | "contratos">("lista");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  // Estados dos convites
  const [convites, setConvites] = useState<any[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [novoCargo, setNovoCargo] = useState<string>("auxiliar");
  const [enviandoConvite, setEnviandoConvite] = useState(false);

  // Estados dos termos/contratos
  const [contratos, setContratos] = useState<any[]>([]);

  // Drawer de detalhe do colaborador
  const [membroSel, setMembroSel] = useState<any>(null);
  const [contratosMembro, setContratosMembro] = useState<any[]>([]);
  const [loadingDrawer, setLoadingDrawer] = useState(false);
  const [ultimoConvite, setUltimoConvite] = useState<{ link: string; email: string; cargo: string } | null>(null);

  // Estados de consenso de novos administradores
  const [minhasAprovacoes, setMinhasAprovacoes] = useState<string[]>([]);
  const [contagemAprovacoes, setContagemAprovacoes] = useState<Record<string, number>>({});
  const [totalAdminsAtivos, setTotalAdminsAtivos] = useState<number>(1);

  useEffect(() => {
    if (loadingUser || role !== "admin") return;
    if (activeTab === "lista") loadEquipe();
    if (activeTab === "convites") loadConvites();
    if (activeTab === "contratos") loadContratos();
  }, [activeTab, loadingUser, role]);

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Carregando dados da equipe...</span>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="p-6 text-center text-rose-600 font-semibold">
        Acesso restrito apenas para administradores do sistema.
      </div>
    );
  }

  const loadEquipe = async () => {
    setLoading(true);
    try {
      // 1. Carrega todas as roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");
        
      const roleMap = new Map((rolesData || []).map((r: any) => [r.user_id, r.role]));

      // 2. Carrega todos os perfis
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*");

      if (profiles) {
        const stats = profiles.map((p) => {
          const userRole = roleMap.get(p.id) || "pendente"; // Fica "pendente" se não tiver role
          return {
            ...p,
            role: userRole,
          };
        })
        // Filtra apenas membros de equipe (não corretor)
        .filter((p) => p.role !== "corretor")
        .sort((a, b) => a.nome?.localeCompare(b.nome ?? "") ?? 0);

        setList(stats);
      }

      // Busca dados para aprovações de administradores
      try {
        const { data: adminRoles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");
        const adminIds = (adminRoles || []).map((r) => r.user_id);
        
        if (adminIds.length > 0) {
          const { data: adminProfiles } = await supabase
            .from("profiles")
            .select("id, ativo")
            .in("id", adminIds);
          
          if (adminProfiles) {
            const ativos = adminProfiles.filter((p) => p.ativo);
            setTotalAdminsAtivos(ativos.length > 0 ? ativos.length : 1);
          }
        }

        // Busca minhas aprovações
        const { data: userSession } = await supabase.auth.getSession();
        const currentUserId = userSession.session?.user.id;
        if (currentUserId) {
          let aprovadas: string[] = [];
          try {
            const { data: apps } = await supabase
              .from("admin_approvals" as any)
              .select("new_admin_id")
              .eq("approved_by", currentUserId);
            if (apps) aprovadas = apps.map((a: any) => a.new_admin_id);
          } catch {}
          setMinhasAprovacoes(aprovadas);
        }

        // Busca contagem de aprovações para todos
        let contagem: Record<string, number> = {};
        try {
          const { data: todasApps } = await supabase
            .from("admin_approvals" as any)
            .select("new_admin_id");
          if (todasApps) {
            for (const a of todasApps as unknown as Array<{ new_admin_id: string }>) {
              contagem[a.new_admin_id] = (contagem[a.new_admin_id] || 0) + 1;
            }
          }
        } catch {}
        setContagemAprovacoes(contagem);
      } catch (errAdmins) {
        console.error("Erro ao processar dados de consenso de admins:", errAdmins);
      }
    } catch (err: any) {
      toast.error("Erro ao carregar equipe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConvites = async () => {
    let unificados: any[] = [];

    // 1. Tenta carregar da tabela 'convites'
    try {
      const { data } = await (supabase
        .from("convites" as any)
        .select("*")
        .neq("role_to_assign", "corretor")
        .order("created_at", { ascending: false }) as any);
      if (data) {
        unificados = [...data];
      }
    } catch (err) {
      // Silencia erro caso a tabela não exista
    }

    // 2. Carrega da tabela 'partner_invites' (fallback)
    try {
      const { data: partnersData } = await supabase
        .from("partner_invites")
        .select("*")
        .order("created_at", { ascending: false });
      if (partnersData) {
        // Filtra apenas registros que são de equipe (começam com "Equipe:")
        const equipeInvites = partnersData.filter((x: any) => {
          return x.note?.startsWith("Equipe:") || (x.role_to_assign && x.role_to_assign !== "corretor");
        });

        const mapeados = equipeInvites.map((x: any) => {
          let email = "Convidado";
          let cargo = "auxiliar";
          
          if (x.note) {
            const noteText = x.note;
            if (noteText.includes("| Cargo:")) {
              const parts = noteText.split("| Cargo:");
              email = parts[0].replace("Equipe:", "").trim();
              cargo = parts[1].trim();
            } else {
              email = noteText.replace("Equipe:", "").trim();
            }
          }

          return {
            id: x.id,
            token: x.token,
            email,
            role_to_assign: x.role_to_assign || cargo,
            status: x.used_at ? "aceito" : "pendente",
            created_at: x.created_at,
            used_at: x.used_at
          };
        });
        // Unifica removendo duplicados por token
        const tokensExistentes = new Set(unificados.map(u => u.token));
        mapeados.forEach(m => {
          if (!tokensExistentes.has(m.token)) {
            unificados.push(m);
          }
        });
      }
    } catch (err) {
      // Silencia erro
    }

    setConvites(unificados.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  const loadContratos = async () => {
    // Filtra apenas contratos de membros de equipe
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .neq("role", "corretor");
    const ids = (roles || []).map((r) => r.user_id);
    if (ids.length === 0) { setContratos([]); return; }

    const { data } = await supabase
      .from("contratos_parceria")
      .select("id,nome_completo,cpf,versao,assinado_em,user_id,ip_assinatura")
      .in("user_id", ids)
      .order("assinado_em", { ascending: false });
    setContratos(data || []);
  };

  const toggleStatus = async (id: string, ativo: boolean) => {
    // Busca a role do colaborador correspondente ao ID na lista de perfis para blindagem total
    const membro = list.find((u) => u.id === id);
    const roleDoMembro = membro?.role || (membroSel?.id === id ? membroSel.role : null);

    // Bloqueia desativação ou ativação manual de administradores por segurança
    if (roleDoMembro === "admin") {
      toast.error("🛡️ Acesso negado: Administradores não podem ser ativados ou desativados manualmente pelo painel.");
      return;
    }
    await supabase.from("profiles").update({ ativo: !ativo }).eq("id", id);
    toast.success(!ativo ? "Colaborador ativado" : "Colaborador desativado");
    loadEquipe();
    if (membroSel?.id === id) setMembroSel((p: any) => ({ ...p, ativo: !ativo }));
  };

  const handleAprovarAdmin = async (newAdminId: string, newAdminNome: string) => {
    const { data: userSession } = await supabase.auth.getSession();
    const currentUserId = userSession.session?.user.id;
    if (!currentUserId) return;
    
    try {
      let aprovadoComSucesso = false;
      try {
        // Insere o voto na admin_approvals
        const { error } = await supabase
          .from("admin_approvals" as any)
          .insert({
            new_admin_id: newAdminId,
            approved_by: currentUserId
          });
        if (error) throw error;
        aprovadoComSucesso = true;
      } catch (errTable) {
        console.warn("Tabela admin_approvals indisponível, usando fallback de ativação direta:", errTable);
        aprovadoComSucesso = true;
      }

      if (aprovadoComSucesso) {
        let votos = 1;
        try {
          const { data: totalVotos } = await supabase
            .from("admin_approvals" as any)
            .select("id")
            .eq("new_admin_id", newAdminId);
          votos = (totalVotos || []).length;
        } catch {}

        if (votos >= totalAdminsAtivos) {
          const { error: activeErr } = await supabase
            .from("profiles")
            .update({ ativo: true })
            .eq("id", newAdminId);
          if (activeErr) throw activeErr;
          
          // Cria notificação realtime de acesso liberado
          await supabase.from("notificacoes" as any).insert({
            user_id: newAdminId,
            tipo: "sistema",
            titulo: "🔑 Acesso Administrador Liberado!",
            mensagem: "Sua conta de administrador foi aprovada sob consenso da equipe e está liberada."
          });

          toast.success(`Acesso do administrador ${newAdminNome} liberado sob consenso!`);
          if (membroSel?.id === newAdminId) {
            setMembroSel((prev: any) => ({ ...prev, ativo: true }));
          }
        } else {
          toast.success(`Aprovação de acesso registrada com sucesso! (${votos}/${totalAdminsAtivos} aprovações).`);
        }
        loadEquipe();
      }
    } catch (err: any) {
      toast.error("Erro ao registrar aprovação: " + err.message);
    }
  };

  const criarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail) return;
    setEnviandoConvite(true);
    const token = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 10)).join("-");
    
    let dbError = null;

    // Tenta gravar na tabela convites
    const { error } = await (supabase.from("convites" as any).insert({
      email: novoEmail.trim().toLowerCase(),
      token,
      status: "pendente",
      role_to_assign: novoCargo,
    } as any) as any);
    
    dbError = error;

    // Fallback caso a tabela convites não exista
    if (error && (error.message.includes("schema cache") || error.message.includes("does not exist") || error.code === "P0002" || error.code === "42P01")) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        // Não passamos 'role_to_assign' no insert para evitar erro de schema cache se a coluna física não existir em produção!
        const { error: fallbackError } = await supabase.from("partner_invites").insert({
          token,
          note: `Equipe: ${novoEmail.trim().toLowerCase()} | Cargo: ${novoCargo}`,
          created_by: userData.user!.id,
        });
        dbError = fallbackError;
      } catch (err: any) {
        dbError = err;
      }
    }

    setEnviandoConvite(false);

    if (dbError) {
      toast.error("Erro ao criar convite: " + dbError.message);
    } else {
      const link = `${window.location.origin}/convite/${token}`;
      setUltimoConvite({
        link,
        email: novoEmail.trim().toLowerCase(),
        cargo: novoCargo
      });
      toast.success("Convite de equipe gerado com sucesso!");
      setNovoEmail("");
      loadConvites();
    }
  };

  const copiarLink = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de acesso copiado!");
  };

  const abrirMembro = async (m: any) => {
    setMembroSel(m);
    setLoadingDrawer(true);
    const { data } = await supabase
      .from("contratos_parceria")
      .select("id,nome_completo,cpf,versao,assinado_em,user_id,ip_assinatura,selfie_url,documento_frente_url,documento_verso_url,user_agent,hash_conteudo_contrato,codigo_verificacao_email")
      .eq("user_id", m.id)
      .order("assinado_em", { ascending: false });
    setContratosMembro(data || []);
    setLoadingDrawer(false);
  };

  const listaFiltrada = list.filter((p) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      (p.nome || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (ROLE_LABELS[p.role] || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Topo */}
      <div>
        <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
          <UserCog className="w-8 h-8 text-sun-deep" /> Equipe & Acessos
        </h1>
        <p className="text-muted-foreground">Gerenciamento de acessos corporativos, contratações internas e termos de sigilo (NDA).</p>
      </div>

      {/* Abas */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("lista")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "lista" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <Users className="w-4 h-4" /> Colaboradores
        </button>
        <button
          onClick={() => setActiveTab("convites")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "convites" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <Link2 className="w-4 h-4" /> Convites Emitidos
        </button>
        <button
          onClick={() => setActiveTab("contratos")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "contratos" ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-muted-foreground hover:text-navy"}`}
        >
          <FileText className="w-4 h-4" /> Termos & NDAs
        </button>
      </div>

      {/* ===== ABA 1: LISTA DE COLABORADORES ===== */}
      {activeTab === "lista" && (
        <div className="space-y-5">
          {/* KPIs */}
          {list.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border-0 shadow-md bg-white">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
                <div className="text-xs text-muted-foreground">Total de Colaboradores</div>
                <div className="font-bold text-xl text-navy">{list.length}</div>
                <div className="text-xs text-muted-foreground mt-1">{list.filter(p => p.ativo).length} ativos</div>
              </Card>
              <Card className="p-4 border-0 shadow-md bg-white">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2"><UserCheck className="w-4 h-4" /></div>
                <div className="text-xs text-muted-foreground">NDAs Assinados</div>
                <div className="font-bold text-xl text-navy">
                  {list.filter(p => p.contrato_assinado).length} / {list.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Conformidade e segurança</div>
              </Card>
            </div>
          )}

          {/* Busca */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo, e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground text-sm">Carregando equipe...</div>
          ) : listaFiltrada.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-muted-foreground">Nenhum colaborador encontrado.</p>
              <button onClick={() => setActiveTab("convites")} className="mt-4 bg-navy text-white px-6 py-2.5 rounded-full font-semibold text-sm">
                Convidar Colaborador
              </button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listaFiltrada.map((c) => (
                <Card
                  key={c.id}
                  onClick={() => abrirMembro(c)}
                  className="p-5 border-0 shadow-md flex flex-col justify-between h-full bg-white hover:shadow-lg hover:border-navy/20 border cursor-pointer transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border flex items-center justify-center font-extrabold text-navy text-sm overflow-hidden shrink-0">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            c.nome?.charAt(0).toUpperCase() || "?"
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-navy text-sm line-clamp-1">{c.nome || c.email}</h3>
                          <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wide mt-1 ${ROLE_BADGES[c.role] || "bg-slate-50 text-slate-600"}`}>
                            {ROLE_LABELS[c.role] || c.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant={c.ativo ? "default" : "secondary"} className="text-[10px]">{c.ativo ? "Ativo" : "Inativo"}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-navy transition-colors" />
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 border-t">
                      {ROLE_DESCRIPTIONS[c.role] || "Acesso operacional ao sistema."}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      {c.contrato_assinado ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span className="text-emerald-700 font-bold">Termo de Confidencialidade Assinado</span></>
                      ) : (
                        <><AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /><span className="text-amber-700 font-bold">Pendente de assinatura de Termo</span></>
                      )}
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 mt-4 pt-3 border-t text-center font-bold">
                    VERIFICAR FOTOS & ASSINATURA NDA →
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
            <h3 className="font-bold text-navy text-base mb-2">Convidar Integrante de Equipe</h3>
            <p className="text-xs text-muted-foreground mb-4">Insira o e-mail do colaborador e atribua seu cargo. O sistema irá gerar o link exclusivo com as permissões de acesso corretas.</p>
            <form onSubmit={criarConvite} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <Input type="email" required placeholder="E-mail do colaborador" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} className="flex-1" />
              <select 
                value={novoCargo} 
                onChange={(e) => setNovoCargo(e.target.value)}
                className="h-10 text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-navy uppercase focus:ring-2 focus:ring-sun focus:outline-none cursor-pointer"
              >
                <option value="auxiliar">Auxiliar Admin</option>
                <option value="atendente">Atendente</option>
                <option value="vendedor">Vendedor Interno</option>
                <option value="engenheiro">Engenheiro / Projetista</option>
                <option value="pos_vendas">Pós-Vendas & Logística</option>
                <option value="financeiro">Financeiro / Contábil</option>
                <option value="admin">Administrador</option>
              </select>
              <Button type="submit" disabled={enviandoConvite} className="bg-sun-deep hover:bg-sun text-navy font-bold flex gap-1.5 items-center shrink-0">
                <Send className="w-4 h-4" /> {enviandoConvite ? "Enviando..." : "Enviar Convite"}
              </Button>
            </form>
          </Card>

          {ultimoConvite && (
            <Card className="p-5 border border-emerald-200 bg-emerald-50/20 rounded-2xl shadow-xs space-y-4 animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-navy text-sm">Convite de Acesso Gerado!</h4>
                    <p className="text-[11px] text-slate-500">Compartilhe o link abaixo com o colaborador para cadastro.</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setUltimoConvite(null)} 
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Ocultar
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input readOnly value={ultimoConvite.link} className="text-xs font-mono bg-white flex-1 border-slate-200 h-9" />
                  <Button
                    size="sm"
                    onClick={() => copiarLink(ultimoConvite.link.split('/').pop() || '')}
                    className="bg-navy hover:bg-navy/90 text-white font-bold h-9 text-xs shrink-0 flex gap-1 items-center px-3"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" /> Copiar Link
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      const subject = encodeURIComponent("Convite de Acesso - ESOL Energy");
                      const body = encodeURIComponent(`Olá!\n\nVocê foi convidado para acessar o sistema da ESOL Energy com a permissão de ${ROLE_LABELS[ultimoConvite.cargo] || ultimoConvite.cargo}.\n\nPara concluir seu cadastro e criar sua conta, clique no link de convite oficial abaixo:\n\n${ultimoConvite.link}\n\nAtenciosamente,\nESOL Energy`);
                      window.open(`mailto:${ultimoConvite.email}?subject=${subject}&body=${body}`, "_blank");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 h-8 text-[10px] rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Enviar por E-mail
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      const text = encodeURIComponent(`Olá! Você foi convidado para acessar o sistema da ESOL Energy. Clique no link abaixo para criar sua conta:\n\n${ultimoConvite.link}`);
                      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-[10px] rounded-lg cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Enviar por WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="border-0 shadow-md overflow-hidden bg-white">
            <div className="p-5 border-b font-bold text-navy text-sm">Histórico de Convites de Equipe</div>
            {convites.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Nenhum convite emitido para equipe.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="suns-table-header text-left">
                    <tr>
                      <th className="p-3">Destinatário</th>
                      <th className="p-3">Token</th>
                      <th className="p-3">Cargo Atribuído</th>
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
                          <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wide ${ROLE_BADGES[cv.role_to_assign] || "bg-slate-50 text-slate-600"}`}>
                            {ROLE_LABELS[cv.role_to_assign] || cv.role_to_assign}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={cv.status === "aceito" ? "default" : "secondary"} className="text-[10px]">
                            {cv.status === "aceito" ? "Aceito" : "Pendente"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(cv.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3">
                          <div className="flex gap-1.5 justify-end">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => copiarLink(cv.token)} 
                              className="text-navy hover:text-navy/80 hover:bg-slate-100 p-1.5 h-8 w-8 rounded-lg cursor-pointer"
                              title="Copiar Link"
                            >
                              <ClipboardCopy className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                const subject = encodeURIComponent("Convite de Acesso - ESOL Energy");
                                const body = encodeURIComponent(`Olá!\n\nVocê foi convidado para acessar o sistema da ESOL Energy com a permissão de ${ROLE_LABELS[cv.role_to_assign] || cv.role_to_assign}.\n\nPara concluir seu cadastro e criar sua conta, clique no link de convite oficial abaixo:\n\n${window.location.origin}/convite/${cv.token}\n\nAtenciosamente,\nESOL Energy`);
                                window.open(`mailto:${cv.email}?subject=${subject}&body=${body}`, "_blank");
                              }} 
                              className="text-slate-500 hover:text-navy hover:bg-slate-100 p-1.5 h-8 w-8 rounded-lg cursor-pointer"
                              title="Enviar por E-mail"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                const text = encodeURIComponent(`Olá! Você foi convidado para acessar o sistema da ESOL Energy. Clique no link abaixo para criar sua conta:\n\n${window.location.origin}/convite/${cv.token}`);
                                window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                              }} 
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 h-8 w-8 rounded-lg cursor-pointer"
                              title="Enviar por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
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
            <div className="p-5 border-b font-bold text-navy text-sm">Log de Aceite de Termos de Confidencialidade (NDA)</div>
            {contratos.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Nenhum termo de confidencialidade assinado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="suns-table-header text-left">
                    <tr>
                      <th className="p-3">Colaborador</th>
                      <th className="p-3">CPF</th>
                      <th className="p-3">Versão</th>
                      <th className="p-3">IP de Assinatura</th>
                      <th className="p-3">Assinado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs font-semibold">
                    {contratos.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-navy">{c.nome_completo}</td>
                        <td className="p-3 text-muted-foreground">{c.cpf}</td>
                        <td className="p-3">V. {c.versao}</td>
                        <td className="p-3 font-mono text-xs">{c.ip_assinatura || "—"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(c.assinado_em).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* GAVETA LATERAL (DRAWER) DE DETALHES DO COLABORADOR */}
      <Dialog open={membroSel !== null} onOpenChange={(o) => { if (!o) setMembroSel(null); }}>
        {membroSel && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 border-0 shadow-2xl">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-navy border overflow-hidden">
                    {membroSel.avatar_url ? <img src={membroSel.avatar_url} alt="" className="w-full h-full object-cover" /> : membroSel.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg text-navy">{membroSel.nome || membroSel.email}</h2>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold mt-1 ${ROLE_BADGES[membroSel.role] || "bg-slate-50 text-slate-600"}`}>
                      {ROLE_LABELS[membroSel.role] || membroSel.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={membroSel.ativo ? "default" : "secondary"}>{membroSel.ativo ? "Ativo" : "Inativo"}</Badge>
                  <span className="text-[10px] text-muted-foreground">Cadastrado em {new Date(membroSel.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Infos básicas */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">E-mail Corporativo</span>
                  <div className="text-navy truncate font-bold">{membroSel.email}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Telefone / WhatsApp</span>
                  <div className="text-navy font-bold">{membroSel.telefone || "—"}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">CPF / Documento</span>
                  <div className="text-navy font-bold">{membroSel.cpf_cnpj || "—"}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Cidade / Estado</span>
                  <div className="text-navy font-bold">{membroSel.cidade ? `${membroSel.cidade} - ${membroSel.estado}` : "—"}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Cargo / Papel de Acesso Corporativo</span>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <select
                      value={membroSel.role}
                      disabled={membroSel.role === "admin"}
                      onChange={async (e) => {
                        const novaRole = e.target.value;
                        if (membroSel.role === "admin") {
                          toast.error("🛡️ Acesso negado: Administradores não podem ser rebaixados no painel por motivos de segurança.");
                          return;
                        }
                        try {
                          // 1. Remove qualquer cargo anterior deste usuário
                          await supabase.from("user_roles").delete().eq("user_id", membroSel.id);
                          
                          // 2. Se for diferente de pendente, insere o novo cargo
                          if (novaRole !== "pendente") {
                            const { error } = await supabase.from("user_roles").insert({
                              user_id: membroSel.id,
                              role: novaRole as any
                            });
                            if (error) throw error;

                            // Se promovido a administrador, ativa o perfil e marca o termo como assinado automaticamente
                            if (novaRole === "admin") {
                              await supabase.from("profiles").update({
                                ativo: true,
                                onboarding_completo: true,
                                contrato_assinado: true
                              }).eq("id", membroSel.id);
                              toast.success("Acesso completo de Administrador liberado e termo assinado!");
                            }
                          } else {
                            // Se for suspenso (pendente), desativa o perfil
                            await supabase.from("profiles").update({
                              ativo: false
                            }).eq("id", membroSel.id);
                          }
                          
                          toast.success("Cargo de acesso atualizado com sucesso!");
                          setMembroSel((prev: any) => ({ ...prev, role: novaRole }));
                          loadEquipe();
                        } catch (err: any) {
                          toast.error("Erro ao alterar cargo: " + err.message);
                        }
                      }}
                      className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-navy uppercase cursor-pointer focus:ring-2 focus:ring-sun focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="pendente">Pendente (Acesso Suspenso)</option>
                      <option value="auxiliar">Auxiliar Admin</option>
                      <option value="atendente">Atendente</option>
                      <option value="vendedor">Vendedor Interno</option>
                      <option value="engenheiro">Engenheiro / Projetista</option>
                      <option value="pos_vendas">Pós-Vendas & Logística</option>
                      <option value="financeiro">Financeiro / Contábil</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <span className="text-[10px] text-slate-500 italic">
                      {membroSel.role === "admin" 
                        ? "🛡️ Cargos administrativos são protegidos contra alterações por motivos de segurança corporativa." 
                        : "Selecione o cargo para alterar o nível de permissão corporativa e liberar o acesso deste integrante."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Termos de Confidencialidade Assinados */}
              <Card className="p-4 border">
                <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Auditoria de Termos Assinados (NDA)
                </h3>
                {loadingDrawer ? (
                  <p className="text-xs text-muted-foreground">Carregando termos de auditoria…</p>
                ) : contratosMembro.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    Colaborador ainda não assinou o Termo de Confidencialidade obrigatório.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contratosMembro.map((ct) => (
                      <div key={ct.id} className="space-y-3 bg-slate-50 border rounded-xl p-3">
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

                        {/* Selfie & Identidade uploads */}
                        {ct.selfie_url && (
                          <div className="p-3 bg-white border border-slate-200/50 rounded-xl space-y-3">
                            <div className="text-[9px] text-navy font-bold uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Fotos de Validação Enviadas
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <span className="text-[8px] text-slate-500 font-bold block">Selfie + Doc</span>
                                <a href={supabase.storage.from("parceiros").getPublicUrl(ct.selfie_url).data.publicUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={supabase.storage.from("parceiros").getPublicUrl(ct.selfie_url).data.publicUrl} alt="Selfie" className="w-full h-14 object-cover rounded-lg border hover:scale-105 transition-transform shadow-sm" />
                                </a>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] text-slate-500 font-bold block">Frente Doc</span>
                                <a href={supabase.storage.from("parceiros").getPublicUrl(ct.documento_frente_url).data.publicUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={supabase.storage.from("parceiros").getPublicUrl(ct.documento_frente_url).data.publicUrl} alt="Frente" className="w-full h-14 object-cover rounded-lg border hover:scale-105 transition-transform shadow-sm" />
                                </a>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] text-slate-500 font-bold block">Verso Doc</span>
                                <a href={supabase.storage.from("parceiros").getPublicUrl(ct.documento_verso_url).data.publicUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={supabase.storage.from("parceiros").getPublicUrl(ct.documento_verso_url).data.publicUrl} alt="Verso" className="w-full h-14 object-cover rounded-lg border hover:scale-105 transition-transform shadow-sm" />
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

               {/* Botões de Ações */}
              <div className="space-y-3 pt-4 border-t">
                {membroSel.role === "admin" && !membroSel.ativo ? (
                  <div className="space-y-3">
                    <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <div>
                        <strong>🔑 Consenso de Administrador Exigido</strong>
                        <p className="mt-0.5 font-normal">Aprovação parcial: {contagemAprovacoes[membroSel.id] || 0} de {totalAdminsAtivos} administradores ativos.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAprovarAdmin(membroSel.id, membroSel.nome || membroSel.email)}
                        disabled={minhasAprovacoes.includes(membroSel.id)}
                        className="flex-1 bg-sun-deep hover:bg-sun text-navy font-bold text-xs uppercase h-10"
                      >
                        {minhasAprovacoes.includes(membroSel.id) ? "Aprovado por você" : "Aprovar Acesso (Consenso)"}
                      </Button>
                      <Button
                        onClick={() => setMembroSel(null)}
                        variant="secondary"
                        className="px-6 font-bold text-xs uppercase h-10"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleStatus(membroSel.id, membroSel.ativo)}
                        disabled={membroSel.role === "admin"}
                        variant={membroSel.ativo ? "destructive" : "outline"}
                        className="flex-1 font-bold text-xs uppercase h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {membroSel.role === "admin" 
                          ? "Desativação Bloqueada (Admin)" 
                          : membroSel.ativo ? "Desativar Acesso" : "Ativar Acesso"}
                      </Button>
                      <Button
                        onClick={() => setMembroSel(null)}
                        variant="secondary"
                        className="px-6 font-bold text-xs uppercase h-10"
                      >
                        Fechar
                      </Button>
                    </div>
                    {membroSel.role === "admin" && (
                      <p className="text-[10px] text-rose-500 font-bold text-center">
                        🛡️ Contas administrativas não podem ser desativadas no painel por razões de segurança.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
