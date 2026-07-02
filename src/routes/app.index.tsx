import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp, Users, Target, DollarSign, ArrowRight, Globe, Inbox,
  AlertTriangle, Clock, CheckCircle2, MessageCircle, Percent, Zap, BarChart3,
  FileSpreadsheet, Phone, Mail, ShieldAlert, SlidersHorizontal, Lock, Unlock, Settings2, RefreshCw, Gauge, Save
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { BRL } from "@/lib/proposta-calc";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")(
  { component: DashboardOrList }
);

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo lead", contato: "Em contato", visita_agendada: "Visita agendada",
  proposta_enviada: "Proposta enviada", negociacao: "Negociação",
  contrato_assinado: "Contrato assinado", instalacao: "Em instalação",
  concluido: "Concluído", perdido: "Perdido",
};

const STATUS_COLOR: Record<string, string> = {
  novo: "bg-blue-100 text-blue-800", contato: "bg-cyan-100 text-cyan-800",
  visita_agendada: "bg-purple-100 text-purple-800", proposta_enviada: "bg-amber-100 text-amber-800",
  negociacao: "bg-orange-100 text-orange-800", contrato_assinado: "bg-emerald-100 text-emerald-800",
  instalacao: "bg-teal-100 text-teal-800", concluido: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
};

const KANBAN_COLS = [
  { statuses: ["novo"], label: "Novos", color: "bg-blue-500" },
  { statuses: ["contato", "visita_agendada"], label: "Em contato", color: "bg-purple-500" },
  { statuses: ["proposta_enviada", "negociacao"], label: "Proposta / Negoc.", color: "bg-amber-500" },
  { statuses: ["contrato_assinado", "instalacao"], label: "Contrato / Instal.", color: "bg-teal-500" },
  { statuses: ["concluido"], label: "Concluídos", color: "bg-emerald-500" },
];

function DashboardOrList() {
  const { role, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Carregando painel...</span>
      </div>
    );
  }

  return role && role !== "corretor" ? <AdminDashboard /> : <CorretorClientes />;
}

function CockpitParamsForm({ params, onSave, onPropagate, saving }: { 
  params: any; 
  onSave: (margem: number, comissao: number) => void;
  onPropagate: (comissao: number) => void;
  saving: boolean; 
}) {
  const [margem, setMargem] = useState<number>(Math.round((params.margem_alvo_pct ?? 0.15) * 100));
  const [comissao, setComissao] = useState<number>(Math.round((params.custo_comissao_pct ?? 0.08) * 100));

  return (
    <div className="space-y-5">
      {/* Margem Geral */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <Label className="text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Margem de Lucro Alvo Geral</Label>
          <span className="font-mono text-[#2E44B8] font-black text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{margem}%</span>
        </div>
        <Slider 
          min={5} 
          max={40} 
          step={1} 
          value={[margem]} 
          onValueChange={(val) => setMargem(val[0])}
          className="py-1"
        />
        <p className="text-[10px] text-slate-500 font-medium">Usado no motor de cálculo para definir o preço sugerido do Wp nas propostas.</p>
      </div>

      {/* Comissão Geral */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <Label className="text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Comissão Geral do Canal (Parceiros)</Label>
          <span className="font-mono text-[#2E44B8] font-black text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{comissao}%</span>
        </div>
        <Slider 
          min={1} 
          max={20} 
          step={0.5} 
          value={[comissao]} 
          onValueChange={(val) => setComissao(val[0])}
          className="py-1"
        />
        <p className="text-[10px] text-slate-500 font-medium">Taxa base/default do canal de consultores.</p>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 pt-3 border-t border-slate-200 flex-wrap">
        <Button 
          onClick={() => onSave(margem, comissao)} 
          disabled={saving}
          className="flex-1 bg-[#2E44B8] hover:bg-[#1F3095] text-white font-bold text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-sm border-0 cursor-pointer transition"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Salvar no Motor Geral
        </Button>
        <Button 
          variant="outline"
          onClick={() => onPropagate(comissao)} 
          disabled={saving}
          className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Aplicar aos Não-Congelados
        </Button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, profile } = useCurrentUser();
  const [clientes, setClientes] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [siteLeads, setSiteLeads] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [params, setParams] = useState<any>(null);
  const [activeKanbanCol, setActiveKanbanCol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para o Cockpit de Direção
  const [cockpitParams, setCockpitParams] = useState<any>(null);
  const [cockpitCorretores, setCockpitCorretores] = useState<any[]>([]);
  const [loadingCockpit, setLoadingCockpit] = useState(false);
  const [savingCockpit, setSavingCockpit] = useState(false);
  const [viewMode, setViewMode] = useState<"dashboard" | "bi" | "cockpit">("dashboard");
  
  // Consenso de novos administradores
  const [adminsPendentes, setAdminsPendentes] = useState<any[]>([]);
  const [minhasAprovacoes, setMinhasAprovacoes] = useState<string[]>([]);
  const [totalAdminsAtivos, setTotalAdminsAtivos] = useState<number>(1);

  const loadData = async () => {
    try {
      // Busca primária de clientes
      const { data: list, error: errList } = await supabase
        .from("clientes")
        .select("*, profiles:corretor_id(nome)")
        .order("updated_at", { ascending: false });

      let all: any[] = [];
      if (errList) {
        console.error("Erro ao carregar clientes com join no dashboard (tentando fallback):", errList);
        const { data: fallbackList, error: errFallback } = await supabase
          .from("clientes")
          .select("*")
          .order("updated_at", { ascending: false });
        
        if (!errFallback && fallbackList) {
          all = fallbackList;
        }
      } else if (list) {
        all = list;
      }

      // Busca de propostas
      const { data: ps, error: errPs } = await supabase
        .from("propostas")
        .select("*, parceiro:parceiro_id(nome)")
        .order("created_at");

      let finalPropostas: any[] = [];
      if (errPs) {
        console.error("Erro ao carregar propostas com join no dashboard (tentando fallback):", errPs);
        const { data: fallbackPs } = await supabase
          .from("propostas")
          .select("*")
          .order("created_at");
        finalPropostas = fallbackPs || [];
      } else {
        finalPropostas = ps || [];
      }

      // Busca de parâmetros
      let prData: any = null;
      try {
        const { data: pr } = await (supabase.rpc as any)("get_parametros_publicos");
        prData = pr;
      } catch (errRpc) {
        console.error("Erro na RPC get_parametros_publicos:", errRpc);
      }

      // Busca de parceiros (corretores) para direcionamento
      const { data: cRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "corretor");
      const cIds = (cRoles || []).map((r: any) => r.user_id);
      let partnersList: any[] = [];
      if (cIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", cIds)
          .eq("ativo", true);
        partnersList = profs || [];
      }

      const leads = all.filter((c) => c.origem === "landing" && !c.corretor_id);
      
      setClientes(all);
      setSiteLeads(leads);
      setPropostas(finalPropostas);
      setPartners(partnersList);
      if (prData) setParams(prData);

      // Consenso de novos administradores
      try {
        const { data: adminRoles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");
        const adminIds = (adminRoles || []).map((r) => r.user_id);
        
        if (adminIds.length > 0) {
          const { data: adminProfiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", adminIds);
          
          if (adminProfiles) {
            const ativos = adminProfiles.filter((p) => p.ativo);
            const inativos = adminProfiles.filter((p) => !p.ativo);
            
            // O total de admins ativos existentes (mínimo 1 para evitar divisão/comparação inválida)
            setTotalAdminsAtivos(ativos.length > 0 ? ativos.length : 1);
            
            if (inativos.length > 0 && user) {
              setAdminsPendentes(inativos);
              
              let aprovadosPorMim: string[] = [];
              try {
                const { data: apps } = await supabase
                  .from("admin_approvals" as any)
                  .select("new_admin_id")
                  .eq("approved_by", user.id);
                if (apps) {
                  aprovadosPorMim = apps.map((a: any) => a.new_admin_id);
                }
              } catch (errApp) {
                console.error("Tabela admin_approvals indisponível:", errApp);
              }
              setMinhasAprovacoes(aprovadosPorMim);
            } else {
              setAdminsPendentes([]);
            }
          }
        }
      } catch (errAdmins) {
        console.error("Erro ao carregar consenso de admins:", errAdmins);
      }
    } catch (err) {
      console.error("Erro grave ao iniciar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCockpitData = async () => {
    setLoadingCockpit(true);
    try {
      // 1. Carrega parâmetros comerciais
      const { data: pComerciais } = await supabase
        .from("parametros_comerciais")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (pComerciais) {
        setCockpitParams(pComerciais);
      }

      // 2. Carrega todos os parceiros comerciais (role = corretor) com seus perfis
      const { data: cRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "corretor");
      const cIds = (cRoles || []).map((r: any) => r.user_id);
      
      if (cIds.length > 0) {
        // Tenta buscar com comissao_congelada
        const { data: profs, error: profsError } = await supabase
          .from("profiles")
          .select("id, nome, comissao_percent, comissao_congelada, ativo")
          .in("id", cIds);
        
        if (profsError) {
          console.warn("Erro ao buscar profiles com comissao_congelada no cockpit, usando fallback...", profsError);
          // Fallback sem comissao_congelada
          const { data: fallbackProfs, error: fbError } = await supabase
            .from("profiles")
            .select("id, nome, comissao_percent, ativo")
            .in("id", cIds);
          
          if (fbError) {
            console.error("Erro no fallback de corretores do cockpit:", fbError);
            setCockpitCorretores([]);
          } else {
            const mapped = (fallbackProfs || []).map(p => ({
              ...p,
              comissao_congelada: false
            }));
            setCockpitCorretores(mapped);
          }
        } else {
          setCockpitCorretores(profs || []);
        }
      } else {
        setCockpitCorretores([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Cockpit:", err);
      toast.error("Falha ao abrir painel de controle.");
    } finally {
      setLoadingCockpit(false);
    }
  };

  const handleSaveCockpitParams = async (margem: number, comissaoGeral: number) => {
    if (!cockpitParams) return;
    setSavingCockpit(true);
    try {
      const { error } = await supabase
        .from("parametros_comerciais")
        .update({
          margem_alvo_pct: Number(margem) / 100,
          custo_comissao_pct: Number(comissaoGeral) / 100
        })
        .eq("id", cockpitParams.id);
      if (error) throw error;
      
      toast.success("Parâmetros do Cockpit atualizados!");
      loadCockpitData();
      loadData();
    } catch (err: any) {
      toast.error("Erro ao salvar parâmetros: " + err.message);
    } finally {
      setSavingCockpit(false);
    }
  };

  const handlePropagateCommission = async (comissaoGeral: number) => {
    setSavingCockpit(true);
    try {
      // Atualiza a comissão na tabela profiles apenas para quem NÃO está com comissão congelada
      const naoCongeladosIds = cockpitCorretores
        .filter((c) => !c.comissao_congelada)
        .map((c) => c.id);

      if (naoCongeladosIds.length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update({ comissao_percent: Number(comissaoGeral) })
          .in("id", naoCongeladosIds);
        if (error) throw error;
      }
      toast.success(`Comissão de ${comissaoGeral}% propagada para parceiros não congelados!`);
      loadCockpitData();
    } catch (err: any) {
      toast.error("Erro ao propagar comissão: " + err.message);
    } finally {
      setSavingCockpit(false);
    }
  };

  const handleToggleFreezeCommission = async (corretorId: string, frozen: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ comissao_congelada: frozen })
        .eq("id", corretorId);
      if (error) throw error;
      
      toast.success(frozen ? "Comissão congelada (tarifa fixa)" : "Comissão desbloqueada para reajustes");
      setCockpitCorretores(prev => 
        prev.map(c => c.id === corretorId ? { ...c, comissao_congelada: frozen } : c)
      );
    } catch (err: any) {
      toast.error("Erro ao atualizar: " + err.message);
    }
  };

  const handleUpdateIndividualCommission = async (corretorId: string, val: number) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ comissao_percent: Number(val) })
        .eq("id", corretorId);
      if (error) throw error;
      
      toast.success("Comissão individual atualizada!");
      setCockpitCorretores(prev => 
        prev.map(c => c.id === corretorId ? { ...c, comissao_percent: Number(val) } : c)
      );
    } catch (err: any) {
      toast.error("Erro ao atualizar comissão: " + err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimLead = async (lead: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          corretor_id: user.id,
          status: "contato",
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", lead.id);

      if (error) throw error;

      // Log na timeline
      await supabase.from("timeline_cliente").insert({
        cliente_id: lead.id,
        parceiro_id: user.id,
        tipo: "historico",
        titulo: "Lead Assumido",
        descricao: `O lead do site foi assumido para atendimento por ${profile?.nome || user.email || "Equipe ESOL"}.`,
        metadata: { autor_id: user.id }
      } as any);

      toast.success("Lead assumido com sucesso!");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao assumir lead: " + err.message);
    }
  };

  const handleAssignLead = async (lead: any, partnerId: string) => {
    if (!user) return;
    try {
      const partner = partners.find((p) => p.id === partnerId);
      const partnerName = partner ? partner.nome : "parceiro";

      const { error } = await supabase
        .from("clientes")
        .update({
          corretor_id: partnerId,
          status: "novo",
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", lead.id);

      if (error) throw error;

      // Log na timeline
      await supabase.from("timeline_cliente").insert({
        cliente_id: lead.id,
        parceiro_id: user.id,
        tipo: "historico",
        titulo: "Lead Direcionado",
        descricao: `O lead do site foi direcionado para o parceiro ${partnerName}.`,
        metadata: { direcionado_para: partnerId, autor_id: user.id }
      } as any);

      // Cria notificação realtime para o parceiro
      await supabase.from("notificacoes" as any).insert({
        user_id: partnerId,
        tipo: "novo_lead",
        titulo: "🎯 Novo Lead Direcionado!",
        mensagem: `Você recebeu o lead do site: ${lead.nome}. Inicie o contato!`,
        dados: { cliente_id: lead.id }
      });

      toast.success(`Lead direcionado para ${partnerName}!`);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao direcionar lead: " + err.message);
    }
  };

  const handleAprovarAdmin = async (newAdminId: string, newAdminNome: string) => {
    if (!user) return;
    try {
      let aprovadoComSucesso = false;
      try {
        // Insere o voto de aprovação na admin_approvals
        const { error } = await supabase
          .from("admin_approvals" as any)
          .insert({
            new_admin_id: newAdminId,
            approved_by: user.id
          });
        if (error) throw error;
        aprovadoComSucesso = true;
      } catch (errTable) {
        // Fallback se a tabela física ainda não existir
        console.warn("Tabela admin_approvals ausente, ativando diretamente como fallback:", errTable);
        aprovadoComSucesso = true;
      }

      if (aprovadoComSucesso) {
        // Verifica o total de votos para esse administrador
        let votos = 1;
        try {
          const { data: totalVotos } = await supabase
            .from("admin_approvals" as any)
            .select("id")
            .eq("new_admin_id", newAdminId);
          votos = (totalVotos || []).length;
        } catch {}

        // Se atingiu o consenso (votos >= totalAdminsAtivos) ou se a tabela falhou e estamos no fallback
        if (votos >= totalAdminsAtivos) {
          const { error: activeErr } = await supabase
            .from("profiles")
            .update({ ativo: true })
            .eq("id", newAdminId);
          if (activeErr) throw activeErr;
          
          // Cria uma notificação realtime de acesso liberado
          await supabase.from("notificacoes" as any).insert({
            user_id: newAdminId,
            tipo: "sistema",
            titulo: "🔑 Acesso Administrador Liberado!",
            mensagem: "Sua conta de administrador foi aprovada sob consenso da equipe e está liberada."
          });

          toast.success(`Acesso do administrador ${newAdminNome} liberado sob consenso!`);
        } else {
          toast.success(`Sua aprovação para ${newAdminNome} foi registrada! (Aprovação ${votos}/${totalAdminsAtivos} concluída).`);
        }
        loadData();
      }
    } catch (err: any) {
      toast.error("Erro ao aprovar administrador: " + err.message);
    }
  };

  const m = useMemo(() => {
    const totalProp = propostas.length;
    const enviadas = propostas.filter((p) => p.status !== "rascunho").length;
    const aceitas = propostas.filter((p) => p.status === "aceita");
    const aceitasNum = aceitas.length;
    const conversao = enviadas > 0 ? (aceitasNum / enviadas) * 100 : 0;
    const receitaProjetada = propostas.filter((p) => p.status !== "rascunho" && p.status !== "recusada").reduce((s, p) => s + Number(p.preco_total || 0), 0);
    const receitaRealizada = aceitas.reduce((s, p) => s + Number(p.preco_total || 0), 0);
    const ticketMedio = aceitasNum > 0 ? receitaRealizada / aceitasNum : 0;

    let custosTotais = 0;
    let margemTotal = 0;
    if (params) {
      for (const p of aceitas) {
        const c = Number(p.preco_total || 0);
        const custo = c * (params.custo_equipamentos_pct + params.custo_instalacao_pct + params.custo_frete_pct + params.custo_impostos_pct + params.custo_comissao_pct);
        custosTotais += custo;
        margemTotal += c - custo;
      }
    }
    const margemPct = receitaRealizada > 0 ? (margemTotal / receitaRealizada) * 100 : 0;

    // Por mês
    const porMes: Record<string, { mes: string; total: number; aceitas: number; receita: number }> = {};
    for (const p of propostas) {
      const d = new Date(p.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!porMes[k]) porMes[k] = { mes: k, total: 0, aceitas: 0, receita: 0 };
      porMes[k].total++;
      if (p.status === "aceita") { porMes[k].aceitas++; porMes[k].receita += Number(p.preco_total || 0); }
    }
    const mensal = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);

    // Por parceiro
    const porParceiro: Record<string, { nome: string; total: number; aceitas: number; receita: number }> = {};
    for (const p of propostas) {
      const nome = p.parceiro?.nome || "—";
      if (!porParceiro[nome]) porParceiro[nome] = { nome, total: 0, aceitas: 0, receita: 0 };
      porParceiro[nome].total++;
      if (p.status === "aceita") { porParceiro[nome].aceitas++; porParceiro[nome].receita += Number(p.preco_total || 0); }
    }
    const topParceiros = Object.values(porParceiro).sort((a, b) => b.receita - a.receita).slice(0, 6);

    // Motivos Perda
    const MOTIVO_PERDA_LABELS: Record<string, string> = {
      preco: "Preço alto",
      concorrente: "Concorrente",
      prazo: "Prazo de entrega",
      financiamento_reprovado: "Financiamento reprovado",
      desistiu: "Desistência voluntária",
      nao_atendeu: "Sem contato / Não atendeu",
      outro: "Outros motivos",
    };
    const perdidos = clientes.filter((c) => c.status === "perdido" && c.motivo_perda);
    const porMotivo: Record<string, number> = {};
    for (const c of perdidos) porMotivo[c.motivo_perda] = (porMotivo[c.motivo_perda] || 0) + 1;
    const motivoData = Object.entries(porMotivo)
      .map(([k, v]) => ({ name: MOTIVO_PERDA_LABELS[k] || k, value: v }))
      .sort((a, b) => b.value - a.value);

    // Tempo médio de fechamento
    const comFechamento = clientes.filter((c) => ["concluido","contrato_assinado"].includes(c.status) && c.fechado_em && c.created_at);
    const tempoMedioFechamento = comFechamento.length > 0
      ? comFechamento.reduce((s, c) => {
          const dias = (new Date(c.fechado_em).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return s + dias;
        }, 0) / comFechamento.length
      : null;

    // Pipeline ponderado
    const emNegociacao = clientes.filter((c) => ["contato","visita_agendada","proposta_enviada","negociacao"].includes(c.status));
    const pipelineReceita = emNegociacao.reduce((s, c) => s + Number(c.valor_estimado || 0), 0);
    const receitaEsperada = pipelineReceita * 0.25; // 25% de taxa de fechamento estimada

    const fechados = clientes.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).length;
    const valorFechados = clientes.filter((c) => ["contrato_assinado","instalacao","concluido"].includes(c.status)).reduce((s, c) => s + Number(c.valor_estimado || 0), 0);

    return {
      totalClientes: clientes.length,
      novos: clientes.filter((c) => c.status === "novo").length,
      negociacao: emNegociacao.length,
      fechados,
      valorFechados,
      totalProp,
      enviadas,
      aceitasNum,
      conversao,
      receitaProjetada,
      receitaRealizada,
      ticketMedio,
      margemTotal,
      margemPct,
      mensal,
      topParceiros,
      motivoData,
      tempoMedioFechamento,
      pipelineReceita,
      receitaEsperada
    };
  }, [clientes, propostas, params]);

  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const COLORS = ["#FFC107", "#001F5C", "#10b981", "#f43f5e", "#8b5cf6", "#0ea5e9"];

  // Filtro por coluna Kanban
  const displayedClientes = activeKanbanCol
    ? clientes.filter((c) => {
        const col = KANBAN_COLS.find((k) => k.label === activeKanbanCol);
        return col ? col.statuses.includes(c.status) : true;
      })
    : clientes;

  const corretoresCount = useMemo(() => {
    const unique = new Set(clientes.map((c) => c.corretor_id).filter(Boolean));
    return unique.size;
  }, [clientes]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 animate-fade-in">
      {/* Notificações de Consenso de Administradores Pendentes */}
      {role === "admin" && adminsPendentes.filter(a => !minhasAprovacoes.includes(a.id)).map((admin) => (
        <Card key={admin.id} className="p-4 border-l-4 border-l-sun bg-amber-500/5 border-amber-200/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in shadow-xs">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-navy text-sm">🔑 Consenso de Administrador Pendente</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                O novo administrador <strong className="text-navy font-bold">{admin.nome || admin.email}</strong> concluiu seu cadastro. Para liberação da conta, é necessário o consenso mútuo dos administradores ativos.
              </p>
              <div className="text-[10px] text-slate-400 mt-1 font-bold">
                Status de aprovação: Pendente (Consenso exigido: todos os administradores ativos).
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleAprovarAdmin(admin.id, admin.nome || admin.email)}
            className="bg-sun-deep hover:bg-sun text-navy font-bold text-xs px-4 h-9 shrink-0 flex gap-1.5 items-center rounded-lg shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />      {/* Título e Abas do Administrador (Suns Brasil Style) */}
      <div className="flex justify-between items-center flex-wrap gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-navy uppercase tracking-tight flex items-center gap-2">
            {viewMode === "dashboard" && "O que você deseja fazer agora?"}
            {viewMode === "bi" && "Inteligência Comercial (BI)"}
            {viewMode === "cockpit" && "Cockpit de Direção"}
          </h2>
          <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
            {viewMode === "dashboard" && "Painel geral de atalhos e cotações da ESOL Energy"}
            {viewMode === "bi" && "Métricas de conversão, faturamento e motivos de perda da Esol Energy"}
            {viewMode === "cockpit" && "Direção da aeronave ESOL Energy: regule comissões e gerencie margens de lucro"}
          </p>
        </div>
        
        {role === "admin" && (
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0 outline-none ${
                viewMode === "dashboard" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy bg-transparent"
              }`}
            >
              📊 Painel Geral
            </button>
            <button
              onClick={() => setViewMode("bi")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0 outline-none ${
                viewMode === "bi" ? "bg-white text-[#2E44B8] shadow-sm" : "text-slate-500 hover:text-navy bg-transparent"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#2E44B8]" /> BI Comercial
            </button>
            <button
              onClick={() => {
                setViewMode("cockpit");
                loadCockpitData();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0 outline-none ${
                viewMode === "cockpit" ? "bg-white text-[#E2B714] shadow-sm" : "text-slate-500 hover:text-navy bg-transparent"
              }`}
            >
              <Gauge className="w-4 h-4 text-[#E2B714]" /> Cockpit
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo de BI Central */}
      {viewMode === "bi" && (
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-6 animate-fade-in">
          {/* Métricas e KPIs Financeiros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs">
              <div className="text-2xl font-black text-navy">{m.conversao.toFixed(1)}%</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Taxa de Conversão</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs">
              <div className="text-2xl font-black text-[#2E44B8]">{BRL(m.receitaRealizada)}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Faturamento (Mês)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs">
              <div className="text-2xl font-black text-navy">{BRL(m.ticketMedio)}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Ticket Médio</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-xs">
              <div className="text-2xl font-black text-emerald-700">{m.margemPct.toFixed(1)}%</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Margem Média</div>
            </div>
          </div>

          {/* Gráfico Mensal e Funil Ponderado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-xs">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#2E44B8]" /> Evolução de Faturamento Mensal</h3>
              {m.mensal.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-slate-400 text-xs">Massa de dados insuficiente para gerar histórico.</div>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.mensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 9 }} />
                      <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{ fill: "#64748b", fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a" }} formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Faturamento"]} />
                      <Bar dataKey="receita" fill="#2E44B8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-xs">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Pipeline Ponderado</h3>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Volume total em negociação</span>
                  <span className="text-lg font-black text-navy">
                    {m.pipelineReceita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="text-slate-500 font-bold">Faturamento provável (25%)</span>
                  <span className="text-lg font-black text-emerald-700">
                    {m.receitaEsperada.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </span>
                </div>
                {m.tempoMedioFechamento && (
                  <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                    <span className="text-slate-500 font-bold">Tempo médio de fechamento</span>
                    <span className="font-black text-navy">{m.tempoMedioFechamento.toFixed(0)} dias</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vendedores e perdas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-xs">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><Users className="w-4 h-4 text-[#2E44B8]" /> Vendedores Destaque</h3>
              {m.topParceiros.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">Nenhuma venda aceita registrada.</div>
              ) : (
                <div className="space-y-3">
                  {m.topParceiros.map((p, idx) => (
                    <div key={p.nome} className="flex items-center justify-between border-b border-slate-250 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2E44B8] w-5">{idx + 1}º</span>
                        <span className="font-semibold text-slate-700">{p.nome}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-navy">{p.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{p.aceitas} fechados de {p.total} propostas</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-xs">
              <h3 className="font-bold text-navy text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-500" /> Motivos de Negócios Perdidos</h3>
              {m.motivoData.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">Nenhum lead marcado como perdido.</div>
              ) : (
                <div className="space-y-3">
                  {m.motivoData.map((d) => {
                    const totalPerdas = m.motivoData.reduce((s, x) => s + x.value, 0);
                    const pct = (d.value / totalPerdas) * 100;
                    return (
                      <div key={d.name} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-650 font-bold">{d.name}</span>
                          <span className="text-red-700">{d.value} perdas ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Conteúdo de Cockpit Central */}
      {viewMode === "cockpit" && (
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-6 animate-fade-in font-sans">
          {loadingCockpit ? (
            <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin mr-2 text-navy" /> Carregando painel de instrumentos...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Ajustes Gerais */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs space-y-5">
                <h3 className="font-extrabold text-sm text-navy flex items-center gap-2 uppercase tracking-wider text-[10px]">
                  <Settings2 className="w-4 h-4 text-[#2E44B8]" /> Ajustes Gerais (Aeronave)
                </h3>
                {cockpitParams ? (
                  <CockpitParamsForm 
                    params={cockpitParams} 
                    onSave={handleSaveCockpitParams}
                    onPropagate={handlePropagateCommission}
                    saving={savingCockpit}
                  />
                ) : (
                  <p className="text-xs text-slate-500">Nenhum parâmetro de faturamento carregado.</p>
                )}
              </div>

              {/* Ajustes Individuais */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-navy flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Users className="w-4 h-4 text-[#2E44B8]" /> Controle de Corretores Individuais
                  </h3>
                  <Badge className="bg-[#2E44B8]/10 text-[#2E44B8] text-[10px] font-bold border-0">
                    {cockpitCorretores.length} parceiros
                  </Badge>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Regule a comissão individualmente para cada corretor parceiro. 
                  Selecione <strong>🔒 Congelar</strong> para que a tarifa individual permaneça inalterada mesmo ao reajustar a comissão geral da empresa.
                </p>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="max-h-[350px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow>
                          <TableHead className="text-slate-600 text-[10px] uppercase font-bold py-2.5">Parceiro</TableHead>
                          <TableHead className="text-slate-600 text-[10px] uppercase font-bold py-2.5 text-center w-28 font-bold">Taxa (%)</TableHead>
                          <TableHead className="text-slate-600 text-[10px] uppercase font-bold py-2.5 text-center w-24 font-bold">Congelado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100 text-xs">
                        {cockpitCorretores.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-6 text-slate-400">Nenhum corretor cadastrado.</TableCell>
                          </TableRow>
                        ) : (
                          cockpitCorretores.map((c) => (
                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                              <TableCell className="py-2.5 font-bold text-slate-700">
                                {c.nome || "Sem nome"}
                                {!c.ativo && <span className="ml-1.5 text-[8px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-normal uppercase">Inativo</span>}
                              </TableCell>
                              <TableCell className="py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={30}
                                    step={0.5}
                                    value={c.comissao_percent ?? 5}
                                    onChange={(e) => handleUpdateIndividualCommission(c.id, Number(e.target.value))}
                                    className="w-16 h-8 text-center bg-white border-slate-200 text-navy font-bold rounded-lg text-xs"
                                  />
                                  <span className="text-[10px] text-slate-500 font-bold">%</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 text-center">
                                <button
                                  onClick={() => handleToggleFreezeCommission(c.id, !c.comissao_congelada)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    c.comissao_congelada 
                                      ? "bg-red-50 border-red-200 text-red-600" 
                                      : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-100"
                                  }`}
                                  title={c.comissao_congelada ? "Comissão Congelada" : "Comissão Descongelada"}
                                >
                                  {c.comissao_congelada ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {viewMode === "dashboard" && (
        <>

      {/* Leads do Site Pendentes (Apenas para Admin, Auxiliar, Atendente) */}
      {(role === "admin" || role === "auxiliar" || role === "atendente") && siteLeads.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50/20 p-6 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
              <Target className="w-5 h-5 text-amber-600 stroke-[1.8] animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-sm">Novos Leads da Página Inicial Pendentes</h3>
              <p className="text-[11px] text-slate-500">Há {siteLeads.length} lead{siteLeads.length > 1 ? "s" : ""} aguardando atendimento ou direcionamento para algum parceiro corretor.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {siteLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-3 flex flex-col justify-between hover:shadow-sm transition">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-navy text-xs">{lead.nome}</span>
                    <Badge variant="outline" className="bg-slate-50 text-[9px] uppercase font-bold text-slate-500 py-0.5 px-2 border border-slate-200">
                      {lead.cidade || "N/D"} - {lead.estado || "SP"}
                    </Badge>
                  </div>
                  <div className="text-[10.5px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
                      <span>{lead.telefone}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.consumo_kwh && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 stroke-[1.5]" />
                        <span>Consumo: {lead.consumo_kwh} kWh/mês</span>
                      </div>
                    )}
                    <div className="text-[9px] text-slate-400 pt-0.5">Recebido em {new Date(lead.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => handleClaimLead(lead)}
                    className="flex-1 bg-navy hover:bg-navy-deep text-white font-bold text-[10px] py-1 h-8 rounded-lg cursor-pointer transition border-0"
                  >
                    Atender Lead
                  </Button>
                  
                  <div className="flex-1 relative">
                    <select
                      onChange={(e) => {
                        const partnerId = e.target.value;
                        if (partnerId) {
                          handleAssignLead(lead, partnerId);
                          e.target.value = ""; // Reset
                        }
                      }}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold text-[10px] px-2 py-1 h-8 rounded-lg cursor-pointer transition appearance-none text-center"
                    >
                      <option value="">Direcionar...</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Banner Central WhatsApp */}
      <div className="w-full relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 hover:shadow-md transition duration-300">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="text-4xl md:text-5xl">📱</span>
            <div>
              <div className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-blue-200">Participe e receba</div>
              <h3 className="text-xl md:text-2xl font-black mt-1 leading-tight tracking-tight">INFORMAÇÕES RELEVANTES</h3>
              <p className="text-xs text-blue-100 font-medium mt-1">Entre em nossa comunidade do WhatsApp para novidades de kits, cotações e suporte em tempo real.</p>
            </div>
          </div>
          <a
            href="https://chat.whatsapp.com/ESOLCommunity"
            target="_blank" rel="noreferrer"
            className="bg-white text-blue-900 hover:bg-slate-100 px-6 py-3 rounded-full font-black text-xs transition shadow-md whitespace-nowrap"
          >
            CLIQUE AQUI E ACESSE
          </a>
        </div>
      </div>

      {/* 5 Cards de Atalho Sequenciais na mesma linha (Suns Brasil Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <Card className="suns-card p-5 flex flex-col justify-between items-center text-center space-y-4 hover:shadow transition">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">
            🐷
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-navy text-sm leading-tight">Financiamentos convencionais</h4>
            <p className="text-[10.5px] text-slate-500 leading-normal">Simule rapidamente nas principais financeiras do mercado solar.</p>
          </div>
          <Link to="/app/financiamentos" className="w-full">
            <Button className="w-full suns-btn-primary font-bold text-xs py-2 rounded-lg cursor-pointer">
              Simular
            </Button>
          </Link>
        </Card>

        {/* Card 2 */}
        <div className="relative pt-3 flex w-full">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full z-10 uppercase tracking-wider">
            Novo
          </span>
          <Card className="suns-card p-5 flex flex-col justify-between items-center text-center space-y-4 hover:shadow transition w-full">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-2xl">
              📄
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-navy text-sm leading-tight">Financiamentos especiais</h4>
              <p className="text-[10.5px] text-slate-500 leading-normal">Linhas de crédito exclusivas. Ideal para seu financiamento recusado.</p>
            </div>
            <Link to="/app/financiamentos" className="w-full">
              <Button className="w-full bg-[#F1948A] hover:bg-[#E08379] text-white font-bold text-xs py-2 rounded-lg cursor-pointer border-0">
                Solicitar
              </Button>
            </Link>
          </Card>
        </div>

        {/* Card 3 */}
        <Card className="suns-card p-5 flex flex-col justify-between items-center text-center space-y-4 hover:shadow transition">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
            🧮
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-navy text-sm leading-tight">Cotação de kit pronto</h4>
            <p className="text-[10.5px] text-slate-500 leading-normal">Encontre o melhor preço de sistemas completos em poucos cliques.</p>
          </div>
          <Link to="/app/cotacoes" className="w-full">
            <Button className="w-full suns-btn-primary font-bold text-xs py-2 rounded-lg cursor-pointer">
              Começar Agora
            </Button>
          </Link>
        </Card>

        {/* Card 4 */}
        <Card className="suns-card p-5 flex flex-col justify-between items-center text-center space-y-4 hover:shadow transition">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-2xl">
            📦
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-navy text-sm leading-tight">Cotação de kit personalizado</h4>
            <p className="text-[10.5px] text-slate-500 leading-normal">Escolha, em detalhes, os componentes e produtos do seu kit solar.</p>
          </div>
          <Link to="/app/cotacoes" className="w-full">
            <Button className="w-full suns-btn-primary font-bold text-xs py-2 rounded-lg cursor-pointer">
              Começar Agora
            </Button>
          </Link>
        </Card>

        {/* Card 5 */}
        <Card className="suns-card p-5 flex flex-col justify-between items-center text-center space-y-4 hover:shadow transition">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-2xl">
            📝
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-navy text-sm leading-tight">Geração de proposta</h4>
            <p className="text-[10.5px] text-slate-500 leading-normal">Crie e envie propostas comerciais personalizadas para seus clientes.</p>
          </div>
          <Link to="/app/propostas" className="w-full">
            <Button className="w-full suns-btn-primary font-bold text-xs py-2 rounded-lg cursor-pointer">
              Gerar Agora
            </Button>
          </Link>
        </Card>
      </div>
      )}
    </div>
  );
}

function CorretorClientes() {
  const { user } = useCurrentUser();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const DIAS_SLA = 3;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clientes").select("*").eq("corretor_id", user.id).order("updated_at", { ascending: false });
      setClientes(data || []);
      setLoading(false);
    })();
  }, [user]);

  const leadsFrios = clientes.filter((c) => {
    const lastUpdate = new Date(c.updated_at || c.created_at);
    const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= DIAS_SLA && !["concluido", "perdido", "contrato_assinado"].includes(c.status);
  });

  const ativos = clientes.filter((c) => !["concluido", "perdido"].includes(c.status));
  const groups = Object.keys(STATUS_LABEL).map((s) => ({ status: s, items: clientes.filter((c) => c.status === s) }));

  const diffDias = (d: string) => {
    const days = Math.floor((now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Meus clientes</h1>
          <p className="text-muted-foreground">{ativos.length} ativo{ativos.length === 1 ? "" : "s"} · {clientes.filter((c) => c.status === "concluido").length} concluído{clientes.filter((c) => c.status === "concluido").length === 1 ? "" : "s"}</p>
        </div>
        <Link to="/app/novo" className="inline-flex items-center gap-2 bg-sun-deep text-navy px-5 py-2.5 rounded-full font-semibold hover:bg-sun">
          + Novo cliente
        </Link>
      </div>

      {/* ALERTA SLA — Leads parados */}
      {leadsFrios.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-red-500 bg-red-50/40">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800">⚠️ {leadsFrios.length} lead{leadsFrios.length > 1 ? "s" : ""} sem contato há mais de {DIAS_SLA} dias!</h3>
            </div>
            <div className="space-y-2">
              {leadsFrios.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
                  <div>
                    <Link to="/app/cliente/$id" params={{ id: c.id }} className="font-semibold text-navy hover:underline">{c.nome}</Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <Badge className={STATUS_COLOR[c.status]} variant="outline">{STATUS_LABEL[c.status]}</Badge>
                      <span className="ml-2 text-red-600 font-medium">há {diffDias(c.updated_at || c.created_at)} dias sem atualização</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.telefone && (
                      <a
                        href={`https://wa.me/${c.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${c.nome?.split(" ")[0]}, tudo bem? Aqui é da ESOL Energy. Gostaria de retomar nossa conversa sobre energia solar! 😊`)}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600"
                      >
                        <MessageCircle className="w-3 h-3" /> Contatar
                      </a>
                    )}
                    <Link to="/app/cliente/$id" params={{ id: c.id }}
                      className="inline-flex items-center gap-1 text-xs bg-navy text-white px-3 py-1.5 rounded-full hover:bg-navy-deep">
                      Ver ficha
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* KPI rápido */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-0 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-navy">{ativos.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Em andamento</div>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{clientes.filter((c) => c.status === "concluido").length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Concluídos</div>
        </Card>
        <Card className={leadsFrios.length > 0 ? "p-4 border border-red-200 bg-red-50 shadow-sm text-center" : "p-4 border-0 shadow-sm text-center"}>
          <div className={leadsFrios.length > 0 ? "text-2xl font-extrabold text-red-600" : "text-2xl font-extrabold text-navy"}>{leadsFrios.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <AlertTriangle className={leadsFrios.length > 0 ? "w-3 h-3 text-red-500" : "w-3 h-3"} /> Parados 3+ dias
          </div>
        </Card>
      </div>

      {loading ? <div className="text-muted-foreground">Carregando…</div> : clientes.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-muted-foreground mb-4">Você ainda não tem clientes cadastrados.</p>
          <Link to="/app/novo" className="inline-block bg-navy text-white px-6 py-2.5 rounded-full font-semibold">Cadastrar primeiro cliente</Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.filter((g) => g.items.length).map((g) => (
            <div key={g.status} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy/70">{STATUS_LABEL[g.status]}</h3>
                <span className="text-xs text-muted-foreground">{g.items.length}</span>
              </div>
              {g.items.map((c) => {
                const dias = diffDias(c.updated_at || c.created_at);
                const frio = dias >= DIAS_SLA && !["concluido", "perdido", "contrato_assinado"].includes(c.status);
                return (
                  <Link key={c.id} to="/app/cliente/$id" params={{ id: c.id }}>
                    <Card className={frio ? "p-4 hover:shadow-lg transition cursor-pointer border-l-4 border-l-red-400 bg-red-50/30" : "p-4 hover:shadow-lg transition cursor-pointer border-l-4 border-l-amber-400 bg-white"}>
                      <div className="font-semibold text-navy">{c.nome}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.telefone}</div>
                      {c.valor_estimado && <div className="text-xs text-emerald-700 font-semibold mt-1">R$ {Number(c.valor_estimado).toLocaleString("pt-BR")}</div>}
                      {frio && <div className="text-[10px] text-red-600 font-bold mt-1">⚠️ {dias} dias sem atualização</div>}
                    </Card>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
