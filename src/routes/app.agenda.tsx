import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  MessageCircle, 
  Settings, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Loader2,
  Phone,
  User,
  Shield,
  FileText,
  CalendarDays,
  CalendarRange,
  Users,
  Briefcase
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/app/agenda")({
  component: AgendaComercial,
});

const DIAS_SEMANA = [
  { val: 1, label: "Segunda-feira" },
  { val: 2, label: "Terça-feira" },
  { val: 3, label: "Quarta-feira" },
  { val: 4, label: "Quinta-feira" },
  { val: 5, label: "Sexta-feira" },
  { val: 6, label: "Sábado" },
  { val: 0, label: "Domingo" },
];

function AgendaComercial() {
  const { user, role } = useCurrentUser();
  const [dbNeedsSync, setDbNeedsSync] = useState(false);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [corretores, setCorretores] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [meusClientes, setMeusClientes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"compromissos" | "configuracao">("compromissos");

  // Estados para nova configuração de agenda
  const [novoDia, setNovoDia] = useState<string>("1");
  const [novaHoraInicio, setNovaHoraInicio] = useState<string>("09:00");
  const [novaHoraFim, setNovaHoraFim] = useState<string>("18:00");
  const [novoIntervalo, setNovoIntervalo] = useState<string>("60");
  const [savingConfig, setSavingConfig] = useState(false);

  // Estados para agendamento manual de reuniões
  const [isAgendando, setIsAgendando] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [dataReuniao, setDataReuniao] = useState<string>("");
  const [horaReuniao, setHoraReuniao] = useState<string>("");
  const [obsReuniao, setObsReuniao] = useState<string>("");
  const [savingAgendamento, setSavingAgendamento] = useState(false);

  // Estados para reagendamento (Administrador)
  const [agendamentoParaReagendar, setAgendamentoParaReagendar] = useState<any | null>(null);

  // Filtro de corretor
  const [filtroCorretor, setFiltroCorretor] = useState<string>("todos");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Carrega Agendamentos com dados dos clientes e corretores
      let tempAgendamentos: any[] = [];
      try {
        let agendsQuery = supabase
          .from("agendamentos" as any)
          .select(`
            *,
            clientes:cliente_id (id, nome, telefone, email, cidade, estado),
            profiles:corretor_id (nome, email, telefone)
          ` as any);

        if (role === "corretor") {
          agendsQuery = agendsQuery.eq("corretor_id", user.id);
        }

        const { data: agends, error: errAgends } = await agendsQuery.order("data_hora", { ascending: true });

        if (errAgends) {
          if (
            errAgends.code === "42P01" || 
            errAgends.message?.includes("does not exist") || 
            errAgends.message?.includes("schema cache") ||
            errAgends.message?.includes("Could not find the table")
          ) {
            setDbNeedsSync(true);
          }
          throw errAgends;
        }
        tempAgendamentos = agends || [];
      } catch (e) {
        console.warn("Falha ao carregar agendamentos do banco remoto, usando fallback local.", e);
        const local = localStorage.getItem("esol_fallback_agendamentos");
        if (local) {
          try { tempAgendamentos = JSON.parse(local); } catch {}
        }
      }
      setAgendamentos(tempAgendamentos);

      // 2. Carrega Corretores para Direcionamento
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "corretor");
      
      if (roles && roles.length > 0) {
        const ids = roles.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, email, telefone")
          .in("id", ids)
          .order("nome");
        setCorretores(profiles || []);
      } else {
        setCorretores([]);
      }

      // 3. Carrega Configurações da Agenda
      let tempConfigs: any[] = [];
      try {
        const { data: configData, error: errConfig } = await supabase
          .from("configuracao_agenda" as any)
          .select("*")
          .order("dia_semana", { ascending: true });
        
        if (errConfig) {
          if (
            errConfig.code === "42P01" || 
            errConfig.message?.includes("does not exist") || 
            errConfig.message?.includes("schema cache") ||
            errConfig.message?.includes("Could not find the table")
          ) {
            setDbNeedsSync(true);
          }
          throw errConfig;
        }
        tempConfigs = configData || [];
      } catch (e) {
        console.warn("Falha ao carregar configuracoes da agenda do banco remoto, usando fallback local.", e);
        const local = localStorage.getItem("esol_fallback_configs");
        if (local) {
          try { tempConfigs = JSON.parse(local); } catch {}
        } else {
          // Valores padrão em memória
          tempConfigs = [
            { id: "1", dia_semana: 1, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
            { id: "2", dia_semana: 2, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
            { id: "3", dia_semana: 3, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
            { id: "4", dia_semana: 4, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
            { id: "5", dia_semana: 5, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60, ativo: true },
          ];
        }
      }
      setConfigs(tempConfigs);

      // 4. Carrega Clientes para o agendamento manual
      let clientsQuery = supabase.from("clientes").select("id, nome, cidade, estado, telefone, corretor_id");
      if (role === "corretor") {
        clientsQuery = clientsQuery.eq("corretor_id", user.id);
      }
      const { data: clientsList } = await clientsQuery.order("nome");
      setMeusClientes(clientsList || []);

    } catch (err) {
      console.error("Erro ao carregar dados da agenda comercial:", err);
      toast.error("Erro ao sincronizar informações com o banco.");
    } finally {
      setLoading(false);
    }
  };

  // Alterar Status do Agendamento
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      if (dbNeedsSync) {
        const updated = agendamentos.map((a) => {
          if (a.id === id) return { ...a, status: newStatus };
          return a;
        });
        setAgendamentos(updated);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(updated));
        toast.success(`Status atualizado para '${newStatus}'!`);
        return;
      }

      const { error } = await supabase
        .from("agendamentos" as any)
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Status atualizado para '${newStatus}'!`);
      loadData();
    } catch (err: any) {
      toast.error(`Falha ao alterar status: ${err.message}`);
    }
  };

  // Atribuir/Reencaminhar Consultor Responsável
  const handleAtribuirCorretor = async (agendamentoId: string, clienteId: string, corretorId: string | null) => {
    try {
      if (dbNeedsSync) {
        const corr = corretores.find((c) => c.id === corretorId);
        const updated = agendamentos.map((a) => {
          if (a.id === agendamentoId) {
            return {
              ...a,
              corretor_id: corretorId,
              profiles: corr ? { nome: corr.nome, email: corr.email, telefone: corr.telefone } : null,
            };
          }
          return a;
        });
        setAgendamentos(updated);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(updated));
        toast.success("Reunião direcionada com sucesso!");
        return;
      }

      const { error: errAgend } = await supabase
        .from("agendamentos" as any)
        .update({ corretor_id: corretorId })
        .eq("id", agendamentoId);
      
      if (errAgend) throw errAgend;

      const { error: errClient } = await supabase
        .from("clientes")
        .update({ corretor_id: corretorId, status: "contato" })
        .eq("id", clienteId);

      if (errClient) throw errClient;

      toast.success("Reunião direcionada com sucesso!");
      loadData();
    } catch (err: any) {
      toast.error(`Falha ao atribuir corretor: ${err.message}`);
    }
  };

  // Salvar Agendamento Manual
  const handleSalvarAgendamentoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId) {
      toast.error("Por favor, selecione um cliente.");
      return;
    }
    if (!dataReuniao || !horaReuniao) {
      toast.error("Selecione data e horário para a reunião.");
      return;
    }
    if (!user) {
      toast.error("Sessão expirada. Entre novamente para agendar.");
      return;
    }

    setSavingAgendamento(true);
    try {
      const scheduledDateTime = new Date(`${dataReuniao}T${horaReuniao}`);
      
      // Valida double booking
      const isOcupado = agendamentos.some((a: any) => {
        return new Date(a.data_hora).getTime() === scheduledDateTime.getTime() && a.status !== "cancelado";
      });

      if (isOcupado) {
        toast.error("Conflito: Este horário já possui uma reunião reservada. Escolha outro slot.");
        setSavingAgendamento(false);
        return;
      }

      let finalCorretorId = null;
      if (role === "corretor") {
        finalCorretorId = user.id;
      } else {
        const cl = meusClientes.find(c => c.id === selectedClienteId);
        finalCorretorId = cl?.corretor_id || null;
      }

      if (dbNeedsSync) {
        const cl = meusClientes.find(c => c.id === selectedClienteId);
        const corr = corretores.find(c => c.id === finalCorretorId);
        const novoAgendamento = {
          id: Math.random().toString(36).substring(2, 9),
          cliente_id: selectedClienteId,
          data_hora: scheduledDateTime.toISOString(),
          status: "confirmado",
          corretor_id: finalCorretorId,
          observacoes: obsReuniao.trim() || "Agendamento manual efetuado pelo painel da agenda.",
          clientes: cl ? { id: cl.id, nome: cl.nome, telefone: cl.telefone, cidade: cl.cidade, estado: cl.estado } : null,
          profiles: corr ? { nome: corr.nome, email: corr.email, telefone: corr.telefone } : null,
          created_at: new Date().toISOString()
        };
        const updated = [...agendamentos, novoAgendamento];
        setAgendamentos(updated);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(updated));
        toast.success("Reunião agendada localmente!");
        setIsAgendando(false);
        setSelectedClienteId("");
        setDataReuniao("");
        setHoraReuniao("");
        setObsReuniao("");
        setSavingAgendamento(false);
        return;
      }

      const { error } = await supabase
        .from("agendamentos" as any)
        .insert({
          cliente_id: selectedClienteId,
          data_hora: scheduledDateTime.toISOString(),
          status: "confirmado", // Agendamentos manuais já nascem confirmados
          corretor_id: finalCorretorId,
          observacoes: obsReuniao.trim() || "Agendamento manual efetuado pelo painel da agenda."
        });

      if (error) throw error;

      await supabase
        .from("clientes")
        .update({ status: "contato", corretor_id: finalCorretorId })
        .eq("id", selectedClienteId);

      toast.success("Reunião agendada com sucesso!");
      setIsAgendando(false);
      setSelectedClienteId("");
      setDataReuniao("");
      setHoraReuniao("");
      setObsReuniao("");
      loadData();
    } catch (err: any) {
      toast.error(`Falha ao agendar compromisso: ${err.message}`);
    } finally {
      setSavingAgendamento(false);
    }
  };

  // Reagendar Compromisso Existente
  const handleReagendarCompromisso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendamentoParaReagendar) return;
    if (!dataReuniao || !horaReuniao) {
      toast.error("Selecione data e horário para o reagendamento.");
      return;
    }

    setSavingAgendamento(true);
    try {
      const scheduledDateTime = new Date(`${dataReuniao}T${horaReuniao}`);
      
      // Valida double booking desconsiderando o próprio registro editado
      const isOcupado = agendamentos.some((a: any) => {
        return a.id !== agendamentoParaReagendar.id && 
               new Date(a.data_hora).getTime() === scheduledDateTime.getTime() && 
               a.status !== "cancelado";
      });

      if (isOcupado) {
        toast.error("Conflito: Este horário já possui uma reunião agendada. Escolha outro slot.");
        setSavingAgendamento(false);
        return;
      }

      if (dbNeedsSync) {
        const updated = agendamentos.map((a: any) => {
          if (a.id === agendamentoParaReagendar.id) {
            return {
              ...a,
              data_hora: scheduledDateTime.toISOString(),
              status: "confirmado",
              observacoes: obsReuniao.trim() || agendamentoParaReagendar.observacoes
            };
          }
          return a;
        });
        setAgendamentos(updated);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(updated));
        toast.success("Compromisso reagendado localmente!");
        setAgendamentoParaReagendar(null);
        setDataReuniao("");
        setHoraReuniao("");
        setObsReuniao("");
        setSavingAgendamento(false);
        return;
      }

      const { error } = await supabase
        .from("agendamentos" as any)
        .update({
          data_hora: scheduledDateTime.toISOString(),
          status: "confirmado", // Reagendamentos são marcados como confirmados
          observacoes: obsReuniao.trim() || agendamentoParaReagendar.observacoes
        })
        .eq("id", agendamentoParaReagendar.id);

      if (error) throw error;

      toast.success("Compromisso reagendado com sucesso!");
      setAgendamentoParaReagendar(null);
      setDataReuniao("");
      setHoraReuniao("");
      setObsReuniao("");
      loadData();
    } catch (err: any) {
      toast.error(`Falha ao reagendar: ${err.message}`);
    } finally {
      setSavingAgendamento(false);
    }
  };

  // Carregar dados de reagendamento no form
  const startReagendar = (ag: any) => {
    setAgendamentoParaReagendar(ag);
    setIsAgendando(false);
    
    const d = new Date(ag.data_hora);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setDataReuniao(`${yyyy}-${mm}-${dd}`);
    
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    setHoraReuniao(`${hh}:${min}`);
    setObsReuniao(ag.observacoes || "");
  };

  // Adicionar Configuração de Horário
  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== "admin") {
      toast.error("Apenas administradores podem gerenciar configurações horárias.");
      return;
    }

    setSavingConfig(true);
    try {
      if (dbNeedsSync) {
        const novaRegra = {
          id: Math.random().toString(36).substring(2, 9),
          dia_semana: parseInt(novoDia),
          hora_inicio: `${novaHoraInicio}:00`,
          hora_fim: `${novaHoraFim}:00`,
          intervalo_minutos: parseInt(novoIntervalo),
          ativo: true,
        };
        const updated = [...configs, novaRegra];
        setConfigs(updated);
        localStorage.setItem("esol_fallback_configs", JSON.stringify(updated));
        toast.success("Nova regra horária cadastrada localmente!");
        return;
      }

      const { error } = await supabase
        .from("configuracao_agenda" as any)
        .insert({
          dia_semana: parseInt(novoDia),
          hora_inicio: `${novaHoraInicio}:00`,
          hora_fim: `${novaHoraFim}:00`,
          intervalo_minutos: parseInt(novoIntervalo),
          ativo: true,
        });

      if (error) throw error;
      toast.success("Nova regra horária cadastrada!");
      loadData();
    } catch (err: any) {
      if (
        err.message?.includes("schema cache") || 
        err.message?.includes("Could not find the table") ||
        err.code === "42P01"
      ) {
        setDbNeedsSync(true);
        const novaRegra = {
          id: Math.random().toString(36).substring(2, 9),
          dia_semana: parseInt(novoDia),
          hora_inicio: `${novaHoraInicio}:00`,
          hora_fim: `${novaHoraFim}:00`,
          intervalo_minutos: parseInt(novoIntervalo),
          ativo: true,
        };
        const updated = [...configs, novaRegra];
        setConfigs(updated);
        localStorage.setItem("esol_fallback_configs", JSON.stringify(updated));
        toast.success("Nova regra horária cadastrada localmente (tabela ausente na nuvem)!");
        return;
      }
      toast.error(`Erro ao adicionar regra: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Excluir Configuração de Horário
  const handleDeleteConfig = async (id: string) => {
    if (role !== "admin") {
      toast.error("Acesso negado.");
      return;
    }

    try {
      if (dbNeedsSync) {
        const updated = configs.filter((c) => c.id !== id);
        setConfigs(updated);
        localStorage.setItem("esol_fallback_configs", JSON.stringify(updated));
        toast.success("Regra de horário excluída localmente!");
        return;
      }

      const { error } = await supabase
        .from("configuracao_agenda" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Regra de horário excluída.");
      loadData();
    } catch (err: any) {
      if (
        err.message?.includes("schema cache") || 
        err.message?.includes("Could not find the table") ||
        err.code === "42P01"
      ) {
        setDbNeedsSync(true);
        const updated = configs.filter((c) => c.id !== id);
        setConfigs(updated);
        localStorage.setItem("esol_fallback_configs", JSON.stringify(updated));
        toast.success("Regra de horário excluída localmente!");
        return;
      }
      toast.error(`Falha ao excluir: ${err.message}`);
    }
  };

  // Enviar convite/aviso no WhatsApp do corretor
  const handleNotifyWhatsAppCorretor = (ag: any) => {
    if (!ag.profiles?.telefone) {
      toast.error("Corretor não possui celular cadastrado no perfil.");
      return;
    }
    const dateFormatted = new Date(ag.data_hora).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const msg = `Olá, ${ag.profiles.nome}! Uma nova reunião de apresentação de proposta comercial com o lead *${ag.clientes?.nome || "Cliente"}* foi delegada a você para a data: *${dateFormatted}*. Por favor, acesse o painel da ESOL Energy para ver os detalhes da viabilidade.`;
    
    window.open(`https://wa.me/55${ag.profiles.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Enviar lembrete no WhatsApp do cliente
  const handleNotifyWhatsAppCliente = (ag: any) => {
    if (!ag.clientes?.telefone) {
      toast.error("Cliente não possui celular cadastrado.");
      return;
    }
    const dateFormatted = new Date(ag.data_hora).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const msg = `Olá, ${ag.clientes.nome}! Aqui é da equipe ESOL Energy. Confirmamos a sua apresentação do Estudo Técnico e Orçamento Solar para o dia *${dateFormatted}*. Nosso consultor entrará em contato neste horário. Obrigado!`;
    
    window.open(`https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Estatísticas Dinâmicas de Agendamentos (Diários, Semanais, Mensais)
  const now = new Date();
  
  // Limites Diários (Hoje)
  const hojeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const hojeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  // Limites Semanais (Domingo a Sábado)
  const diffToSun = now.getDay();
  const semanaStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToSun, 0, 0, 0, 0);
  const semanaEnd = new Date(semanaStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  
  // Limites Mensais (Mês corrente)
  const mesStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const mesEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Consideramos apenas agendamentos válidos (não cancelados) para as estatísticas
  const agendamentosValidos = agendamentos.filter(a => a.status !== "cancelado");

  const totalHoje = agendamentosValidos.filter(a => {
    const d = new Date(a.data_hora);
    return d >= hojeStart && d <= hojeEnd;
  }).length;

  const totalSemana = agendamentosValidos.filter(a => {
    const d = new Date(a.data_hora);
    return d >= semanaStart && d <= semanaEnd;
  }).length;

  const totalMes = agendamentosValidos.filter(a => {
    const d = new Date(a.data_hora);
    return d >= mesStart && d <= mesEnd;
  }).length;

  const totalPendentes = agendamentos.filter(a => a.status === "pendente").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase">Confirmado</Badge>;
      case "cancelado":
        return <Badge variant="destructive" className="font-bold text-[10px] uppercase">Cancelado</Badge>;
      case "realizado":
        return <Badge className="bg-blue-500 text-white font-bold text-[10px] uppercase">Realizado</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-500 border-amber-300 font-bold text-[10px] uppercase animate-pulse">Pendente</Badge>;
    }
  };

  // Filtragem da tabela com base no filtro administrativo
  const agendamentosFiltrados = agendamentos.filter(ag => {
    if (role === "corretor") return true; // Já filtrado na query
    if (filtroCorretor === "todos") return true;
    if (filtroCorretor === "unassigned") return !ag.corretor_id;
    return ag.corretor_id === filtroCorretor;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {dbNeedsSync && (
        <Card className="border border-amber-300 bg-amber-50 p-5 rounded-2xl flex items-start gap-4 text-amber-900 shadow-sm print-no-break font-sans">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-2 leading-relaxed">
            <strong className="block font-bold text-sm text-amber-800">⚠️ Sincronização do Banco de Dados Pendente (Modo Offline Ativado)</strong>
            <p>
              As tabelas de agenda (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">configuracao_agenda</code> e <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">agendamentos</code>) ainda não foram criadas ou atualizadas no cache do Supabase remoto.
            </p>
            <p>
              Para ativar o agendamento real integrado ao banco de dados em produção, realize o <strong>commit</strong> e o <strong>push</strong> da migração SQL 
              (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">supabase/migrations/20260702203000_agenda_reunioes.sql</code>) no seu repositório Git e execute as migrações no Supabase.
            </p>
            <div className="bg-amber-100/40 p-2.5 rounded-xl text-[10px] text-amber-800 border border-amber-200/50">
              * Nota: Enquanto a sincronização não ocorre, você pode gerenciar, cadastrar janelas e agendar compromissos localmente neste navegador de forma experimental.
            </div>
          </div>
        </Card>
      )}
      
      {/* Título Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-[#E2B714]" /> {role === "corretor" ? "Minhas Reuniões de Vendas" : "Agenda de Reuniões Técnicas"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === "corretor" 
              ? "Gerencie seus compromissos comerciais agendados e reserve horários de atendimento para seus clientes do CRM."
              : "Gerencie os agendamentos efetuados pelos leads do site, direcione reuniões e defina regras de funcionamento da agenda."}
          </p>
        </div>

        {/* Chaveador de Abas */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("compromissos")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "compromissos"
                ? "bg-white text-navy shadow-sm"
                : "text-slate-600 hover:text-navy"
            }`}
          >
            📋 Reuniões
          </button>
          {role === "admin" && (
            <button
              onClick={() => setActiveTab("configuracao")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "configuracao"
                  ? "bg-white text-navy shadow-sm"
                  : "text-slate-600 hover:text-navy"
              }`}
            >
              ⚙️ Configurar Agenda
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E2B714]" />
          <p className="text-xs text-slate-400 font-medium">Sincronizando compromissos com o banco...</p>
        </div>
      ) : activeTab === "compromissos" ? (
        /* Painel de Reuniões */
        <div className="space-y-6">
          
          {/* CARDS ESTATÍSTICOS (Visível para Admin e Parceiros) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200/60 bg-white p-5 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-100"><Clock className="w-12 h-12 stroke-[1.2]" /></div>
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Reuniões Hoje</span>
              <div className="text-3xl font-black text-navy">{totalHoje}</div>
              <p className="text-[9.5px] text-slate-400">Compromissos agendados para este dia.</p>
            </Card>

            <Card className="border border-slate-200/60 bg-white p-5 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-100"><CalendarDays className="w-12 h-12 stroke-[1.2]" /></div>
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Esta Semana</span>
              <div className="text-3xl font-black text-navy">{totalSemana}</div>
              <p className="text-[9.5px] text-slate-400">Slots agendados nesta semana.</p>
            </Card>

            <Card className="border border-slate-200/60 bg-white p-5 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-100"><CalendarRange className="w-12 h-12 stroke-[1.2]" /></div>
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Este Mês</span>
              <div className="text-3xl font-black text-navy">{totalMes}</div>
              <p className="text-[9.5px] text-slate-400">Total de agendamentos no mês.</p>
            </Card>

            <Card className="border border-slate-200/60 bg-white p-5 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-100"><AlertCircle className="w-12 h-12 stroke-[1.2]" /></div>
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Aguardando Confirmação</span>
              <div className="text-3xl font-black text-[#E2B714]">{totalPendentes}</div>
              <p className="text-[9.5px] text-slate-400">Reuniões pendentes de atendimento.</p>
            </Card>
          </div>

          {/* Seção Form de Reagendamento (Prioridade) */}
          {agendamentoParaReagendar && (
            <Card className="border border-blue-300 bg-blue-50/15 shadow-md rounded-3xl overflow-hidden animate-fade-in">
              <CardHeader className="bg-blue-50/40 border-b border-blue-100 py-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" /> Reagendar Reunião Comercial
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-500 mt-0.5">
                    Alterando o compromisso do cliente <strong>{agendamentoParaReagendar.clientes?.nome}</strong>.
                  </CardDescription>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-650 cursor-pointer"
                  onClick={() => setAgendamentoParaReagendar(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleReagendarCompromisso} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* Data */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">1. Nova Data</label>
                    <Input
                      type="date"
                      value={dataReuniao}
                      onChange={(e) => setDataReuniao(e.target.value)}
                      required
                      className="rounded-lg border-slate-200 text-xs font-bold h-9 bg-white"
                    />
                  </div>

                  {/* Horário */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">2. Novo Horário</label>
                    <Input
                      type="time"
                      value={horaReuniao}
                      onChange={(e) => setHoraReuniao(e.target.value)}
                      required
                      className="rounded-lg border-slate-200 text-xs font-bold h-9 bg-white"
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">3. Anotações / Foco</label>
                    <Input
                      type="text"
                      placeholder="Modifique observações..."
                      value={obsReuniao}
                      onChange={(e) => setObsReuniao(e.target.value)}
                      className="rounded-lg border-slate-200 text-xs font-bold h-9 bg-white"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs font-bold h-9 rounded-lg border-slate-200 cursor-pointer"
                      onClick={() => setAgendamentoParaReagendar(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingAgendamento}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-lg px-6 cursor-pointer"
                    >
                      {savingAgendamento ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Seção Form de Novo Agendamento Manual */}
          {isAgendando && (
            <Card className="border border-[#E2B714]/30 shadow-md rounded-3xl overflow-hidden bg-slate-50/40 border-dashed animate-fade-in">
              <CardHeader className="bg-slate-50/80 border-b border-slate-150 py-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#E2B714]" /> Agendar Nova Reunião Comercial
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-500 mt-0.5">Cadastre um compromisso de viabilidade técnica na agenda.</CardDescription>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-650 cursor-pointer"
                  onClick={() => setIsAgendando(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSalvarAgendamentoManual} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  {/* Cliente */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">1. Selecionar Cliente</label>
                    <select
                      value={selectedClienteId}
                      onChange={(e) => setSelectedClienteId(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white text-xs font-bold px-3 h-9 text-slate-800 outline-none focus:border-[#E2B714]"
                    >
                      <option value="">Selecione o Cliente...</option>
                      {meusClientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} {c.cidade ? `(${c.cidade}-${c.estado})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">2. Data da Reunião</label>
                    <Input
                      type="date"
                      value={dataReuniao}
                      onChange={(e) => setDataReuniao(e.target.value)}
                      required
                      className="rounded-lg border-slate-200 text-xs font-bold h-9 bg-white"
                    />
                  </div>

                  {/* Horário */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">3. Horário</label>
                    <Input
                      type="time"
                      value={horaReuniao}
                      onChange={(e) => setHoraReuniao(e.target.value)}
                      required
                      className="rounded-lg border-slate-200 text-xs font-bold h-9 bg-white"
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">4. Anotações / Foco</label>
                    <Input
                      type="text"
                      placeholder="Ex: Reunião zoom, telhado metálico..."
                      value={obsReuniao}
                      onChange={(e) => setObsReuniao(e.target.value)}
                      className="rounded-lg border-slate-200 text-xs font-bold h-9 bg-white"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs font-bold h-9 rounded-lg border-slate-200 cursor-pointer"
                      onClick={() => setIsAgendando(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingAgendamento}
                      className="suns-btn-primary font-bold text-xs h-9 rounded-lg px-6 cursor-pointer"
                    >
                      {savingAgendamento ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                      Agendar Compromisso
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tabela de Compromissos */}
          <Card className="border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-150 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <CardTitle className="text-sm font-extrabold text-navy">Compromissos Agendados</CardTitle>
                
                {/* FILTRO DE CORRETORES (Apenas Admin) */}
                {role !== "corretor" && corretores.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">Filtrar Agenda:</span>
                    <select
                      value={filtroCorretor}
                      onChange={(e) => setFiltroCorretor(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white text-[10.5px] font-bold px-2 py-1 outline-none text-slate-700"
                    >
                      <option value="todos">👥 Todos os Consultores</option>
                      <option value="unassigned">⚠️ Sem Consultor</option>
                      {corretores.map(c => (
                        <option key={c.id} value={c.id}>👤 {c.nome}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Botão de Agendar */}
              {meusClientes.length === 0 ? (
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border">
                  Cadastre clientes primeiro para agendar
                </span>
              ) : (
                <Button
                  onClick={() => {
                    setIsAgendando(!isAgendando);
                    setAgendamentoParaReagendar(null);
                  }}
                  className="suns-btn-primary font-extrabold text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Agendar Reunião
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {agendamentosFiltrados.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold mt-3">Nenhum agendamento de reunião foi localizado no sistema.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/20 hover:bg-slate-50/20">
                      <TableHead className="font-bold text-navy text-xs">Lead/Cliente</TableHead>
                      <TableHead className="font-bold text-navy text-xs">Data & Horário</TableHead>
                      <TableHead className="font-bold text-navy text-xs">Região (Local)</TableHead>
                      <TableHead className="font-bold text-navy text-xs">Foco / Detalhes</TableHead>
                      {role !== "corretor" && <TableHead className="font-bold text-navy text-xs">Responsável</TableHead>}
                      <TableHead className="font-bold text-navy text-xs">Status</TableHead>
                      <TableHead className="font-bold text-navy text-xs text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendamentosFiltrados.map((ag) => {
                      const dataObj = new Date(ag.data_hora);
                      return (
                        <TableRow key={ag.id} className="hover:bg-slate-50/30">
                          {/* Cliente */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-navy text-xs flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {ag.clientes?.nome || "Cliente Não Localizado"}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-450" />
                                {ag.clientes?.telefone || "Sem telefone"}
                              </div>
                            </div>
                          </TableCell>

                          {/* Data e Hora */}
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-navy flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#E2B714]" />
                                {dataObj.toLocaleDateString("pt-BR")}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-450" />
                                {dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </TableCell>

                          {/* Cidade / Estado */}
                          <TableCell className="text-xs font-bold text-slate-650">
                            {ag.clientes?.cidade ? `${ag.clientes.cidade} - ${ag.clientes.estado}` : "Não informado"}
                          </TableCell>

                          {/* Observações */}
                          <TableCell className="text-xs text-slate-550 max-w-[200px] truncate" title={ag.observacoes}>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ag.observacoes || "-"}</span>
                            </div>
                          </TableCell>

                          {/* Corretor Atribuído / Reencaminhar */}
                          {role !== "corretor" && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={ag.corretor_id || "unassigned"}
                                  onValueChange={(val) => handleAtribuirCorretor(ag.id, ag.cliente_id, val === "unassigned" ? null : val)}
                                >
                                  <SelectTrigger className="w-[180px] h-8 text-[11px] font-bold rounded-lg border-slate-200">
                                    <SelectValue placeholder="Sem consultor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned" className="text-[11px] text-slate-500 font-bold">Sem consultor</SelectItem>
                                    {corretores.map((corr) => (
                                      <SelectItem key={corr.id} value={corr.id} className="text-[11px] font-bold">
                                        👤 {corr.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Botão Notificar WhatsApp */}
                                {ag.corretor_id && (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 rounded-lg border-emerald-250 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                    title="Notificar corretor via WhatsApp"
                                    onClick={() => handleNotifyWhatsAppCorretor(ag)}
                                  >
                                    <MessageCircle className="w-4 h-4 fill-current" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}

                          {/* Status */}
                          <TableCell>{getStatusBadge(ag.status)}</TableCell>

                          {/* Ações */}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Botão WhatsApp Cliente */}
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-lg border-slate-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                title="Enviar lembrete para o cliente"
                                onClick={() => handleNotifyWhatsAppCliente(ag)}
                              >
                                <MessageCircle className="w-4 h-4 fill-current" />
                              </Button>

                              {/* Reagendar (Apenas Admin/Equipe ou Corretor no próprio agendamento) */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] font-bold px-2 rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                                onClick={() => startReagendar(ag)}
                              >
                                Reagendar
                              </Button>

                              {ag.status !== "confirmado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] font-bold px-2 rounded-lg border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 cursor-pointer"
                                  onClick={() => handleUpdateStatus(ag.id, "confirmado")}
                                >
                                  Confirmar
                                </Button>
                              )}
                              {ag.status !== "cancelado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] font-bold px-2 rounded-lg border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                                  onClick={() => handleUpdateStatus(ag.id, "cancelado")}
                                >
                                  Cancelar
                                </Button>
                              )}
                              {ag.status !== "realizado" && ag.status === "confirmado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] font-bold px-2 rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                                  onClick={() => handleUpdateStatus(ag.id, "realizado")}
                                >
                                  Realizado
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Configuração de Horários da Agenda (Apenas para Admin) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulário para Cadastrar Slots */}
          <Card className="border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden bg-white lg:col-span-1">
            <CardHeader className="bg-slate-50/50 border-b border-slate-150 py-5">
              <CardTitle className="text-sm font-extrabold text-navy">Adicionar Janela Ativa</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Defina dias e horários para agendamento no site.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {role !== "admin" ? (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl flex gap-2 text-xs border border-amber-100">
                  <Shield className="w-5 h-5 shrink-0" />
                  <span>Apenas administradores podem gerenciar configurações horárias da agenda.</span>
                </div>
              ) : (
                <form onSubmit={handleAddConfig} className="space-y-4">
                  {/* Dia */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">Dia da Semana</label>
                    <Select value={novoDia} onValueChange={setNovoDia}>
                      <SelectTrigger className="w-full rounded-lg border-slate-200 text-xs font-bold h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS_SEMANA.map((d) => (
                          <SelectItem key={d.val} value={String(d.val)} className="text-xs font-bold">
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Horário Início / Fim */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-slate-500">Início</label>
                      <Input
                        type="time"
                        value={novaHoraInicio}
                        onChange={(e) => setNovaHoraInicio(e.target.value)}
                        required
                        className="rounded-lg border-slate-200 text-xs font-bold h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-slate-500">Fim</label>
                      <Input
                        type="time"
                        value={novaHoraFim}
                        onChange={(e) => setNovaHoraFim(e.target.value)}
                        required
                        className="rounded-lg border-slate-200 text-xs font-bold h-9"
                      />
                    </div>
                  </div>

                  {/* Intervalo */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500">Duração da Reunião (Minutos)</label>
                    <Select value={novoIntervalo} onValueChange={setNovoIntervalo}>
                      <SelectTrigger className="w-full rounded-lg border-slate-200 text-xs font-bold h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30" className="text-xs font-bold">30 minutos</SelectItem>
                        <SelectItem value="45" className="text-xs font-bold">45 minutos</SelectItem>
                        <SelectItem value="60" className="text-xs font-bold">60 minutos (1 hora)</SelectItem>
                        <SelectItem value="90" className="text-xs font-bold">90 minutos (1h 30m)</SelectItem>
                        <SelectItem value="120" className="text-xs font-bold">120 minutos (2 horas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={savingConfig}
                    className="w-full suns-btn-primary font-bold text-xs h-9 cursor-pointer"
                  >
                    {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                    Cadastrar Janela
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Listagem de Horários Cadastrados */}
          <Card className="border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden bg-white lg:col-span-2">
            <CardHeader className="bg-slate-50/50 border-b border-slate-150 py-5">
              <CardTitle className="text-sm font-extrabold text-navy">Horários Ativos da Agenda</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Regras vigentes que determinam os slots disponíveis na Landing Page.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {configs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Settings className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold mt-3">Nenhuma regra horária cadastrada. Leads não poderão agendar no site.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/20 hover:bg-slate-50/20">
                      <TableHead className="font-bold text-navy text-xs">Dia da Semana</TableHead>
                      <TableHead className="font-bold text-navy text-xs">Janela Ativa</TableHead>
                      <TableHead className="font-bold text-navy text-xs">Intervalo / Duração</TableHead>
                      {role === "admin" && <TableHead className="font-bold text-navy text-xs text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((cfg) => (
                      <TableRow key={cfg.id} className="hover:bg-slate-50/30">
                        <TableCell className="text-xs font-bold text-navy">
                          {DIAS_SEMANA.find((d) => d.val === cfg.dia_semana)?.label || "N/D"}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-450" />
                          {cfg.hora_inicio.slice(0, 5)} - {cfg.hora_fim.slice(0, 5)}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-650">
                          {cfg.intervalo_minutos} minutos
                        </TableCell>
                        {role === "admin" && (
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-md border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                              title="Remover horário"
                              onClick={() => handleDeleteConfig(cfg.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
