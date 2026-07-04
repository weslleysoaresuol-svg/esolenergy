import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, ArrowLeft, Sun, ShieldCheck, Sparkles, Clock, Calendar, Check, Loader2 } from "lucide-react";
import logo from "@/assets/esol-logo.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/sucesso-orcamento")({
  head: () => ({
    meta: [
      { title: "OrÃ§amento Recebido! â€” ESOL Energy" },
      { name: "description", content: "Pedido de orÃ§amento recebido com sucesso. Agende sua reuniÃ£o tÃ©cnica ou fale no WhatsApp." }
    ]
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      nome: (search.nome as string) || "",
      id: (search.id as string) || "",
    };
  },
  component: SucessoOrcamento,
});

// Helper para traduzir dia da semana
const DIAS_NOMES = ["Domingo", "Segunda", "TerÃ§a", "Quarta", "Quinta", "Sexta", "SÃ¡bado"];
const MESES_NOMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function SucessoOrcamento() {
  const { nome, id } = Route.useSearch();
  const [pulsing, setPulsing] = useState(true);

  // Estados do Agendamento
  const [diasDisponiveis, setDiasDisponiveis] = useState<Date[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [slotsHorarios, setSlotsHorarios] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  
  const [agendamentosExistentes, setAgendamentosExistentes] = useState<any[]>([]);
  const [configAgenda, setConfigAgenda] = useState<any[]>([]);
  
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [savingAgendamento, setSavingAgendamento] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Carrega configuraÃ§Ãµes e agendamentos ocupados
  useEffect(() => {
    (async () => {
      setLoadingAgenda(true);
      try {
        let configs: any[] = [];
        let agends: any[] = [];
        
        try {
          // 1. Carrega configuraÃ§Ã£o da agenda
          const { data: configData, error: errConfig } = await supabase
            .from("configuracao_agenda" as any)
            .select("*")
            .eq("ativo", true);
          
          if (errConfig) throw errConfig;
          configs = configData || [];
        } catch (eConfig) {
          console.warn("Tabela configuracao_agenda ausente no banco remoto. Usando fallback padrÃ£o.");
          // Fallback padrÃ£o: Segunda a Sexta ativa
          configs = [
            { dia_semana: 1, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60 },
            { dia_semana: 2, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60 },
            { dia_semana: 3, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60 },
            { dia_semana: 4, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60 },
            { dia_semana: 5, hora_inicio: "09:00:00", hora_fim: "18:00:00", intervalo_minutos: 60 }
          ];
        }

        try {
          // 2. Carrega agendamentos futuros
          const limitDate = new Date();
          limitDate.setDate(limitDate.getDate() + 10);
          const { data: agendsData, error: errAgends } = await supabase
            .from("agendamentos" as any)
            .select("data_hora")
            .gte("data_hora", new Date().toISOString())
            .lte("data_hora", limitDate.toISOString())
            .neq("status", "cancelado");

          if (errAgends) throw errAgends;
          agends = agendsData || [];
        } catch (eAgends) {
          console.warn("Tabela agendamentos ausente no banco remoto. Usando fallback local.");
          const local = localStorage.getItem("esol_fallback_agendamentos");
          if (local) {
            try {
              const parsed = JSON.parse(local);
              agends = parsed.map((a: any) => ({ data_hora: a.data_hora }));
            } catch {}
          }
        }

        setConfigAgenda(configs);
        setAgendamentosExistentes(agends);

        // 3. Gera os prÃ³ximos 5 dias Ãºteis (Segunda a Sexta)
        const days: Date[] = [];
        let cur = new Date();
        // ComeÃ§a a partir de amanhÃ£
        cur.setDate(cur.getDate() + 1);
        
        while (days.length < 5) {
          const dayOfWeek = cur.getDay();
          // Verifica se o dia de semana estÃ¡ ativo nas configuraÃ§Ãµes da agenda
          const configParaDia = configs.find((c: any) => c.dia_semana === dayOfWeek);
          
          if (configParaDia) {
            days.push(new Date(cur));
          }
          cur.setDate(cur.getDate() + 1);
        }
        
        setDiasDisponiveis(days);
        if (days.length > 0) {
          setDiaSelecionado(days[0]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da agenda:", err);
      } finally {
        setLoadingAgenda(false);
      }
    })();
  }, []);

  // Gera slots horÃ¡rios livres para o dia selecionado
  useEffect(() => {
    if (!diaSelecionado) return;

    const dayOfWeek = diaSelecionado.getDay();
    const configParaDia = configAgenda.find((c: any) => c.dia_semana === dayOfWeek);

    if (!configParaDia) {
      setSlotsHorarios([]);
      return;
    }

    const startStr = configParaDia.hora_inicio; // ex: '09:00:00'
    const endStr = configParaDia.hora_fim;     // ex: '18:00:00'
    const interval = configParaDia.intervalo_minutos || 60;

    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots: string[] = [];
    for (let m = startMinutes; m < endMinutes; m += interval) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      
      // Valida se esse slot de horÃ¡rio jÃ¡ estÃ¡ ocupado por outro cliente na mesma data
      const isOcupado = agendamentosExistentes.some((a: any) => {
        const agDate = new Date(a.data_hora);
        const isMesmoDia = agDate.getDate() === diaSelecionado.getDate() &&
                           agDate.getMonth() === diaSelecionado.getMonth() &&
                           agDate.getFullYear() === diaSelecionado.getFullYear();
        
        const agTimeStr = `${String(agDate.getHours()).padStart(2, "0")}:${String(agDate.getMinutes()).padStart(2, "0")}`;
        return isMesmoDia && agTimeStr === timeStr;
      });

      if (!isOcupado) {
        slots.push(timeStr);
      }
    }

    setSlotsHorarios(slots);
    setHorarioSelecionado(slots.length > 0 ? slots[0] : null);
  }, [diaSelecionado, configAgenda, agendamentosExistentes]);

  // FunÃ§Ã£o para salvar o agendamento
  const handleConfirmarAgendamento = async () => {
    if (!id) {
      toast.error("Erro tÃ©cnico: ID do cliente nÃ£o encontrado. Recarregue a pÃ¡gina.");
      return;
    }
    if (!diaSelecionado || !horarioSelecionado) {
      toast.error("Selecione um dia e horÃ¡rio para prosseguir.");
      return;
    }

    setSavingAgendamento(true);
    try {
      const [h, m] = horarioSelecionado.split(":").map(Number);
      const scheduledDateTime = new Date(diaSelecionado);
      scheduledDateTime.setHours(h, m, 0, 0);

      let data: any = null;
      let error: any = null;

      try {
        const resInsert = await supabase
          .from("agendamentos" as any)
          .insert({
            cliente_id: id,
            data_hora: scheduledDateTime.toISOString(),
            status: "pendente",
            observacoes: "Agendamento autÃ´nomo efetuado pelo cliente na pÃ¡gina de sucesso do site."
          })
          .select("*")
          .maybeSingle();
        data = resInsert.data;
        error = resInsert.error;
      } catch (e) {
        error = e;
      }

      // Se a tabela nÃ£o existe no banco de dados remoto
      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        console.warn("Tabela agendamentos ausente no banco remoto. Registrando localmente...");
        const novoAg = {
          id: Math.random().toString(36).substring(2, 9),
          cliente_id: id,
          data_hora: scheduledDateTime.toISOString(),
          status: "pendente",
          observacoes: "Agendamento autÃ´nomo efetuado pelo cliente na pÃ¡gina de sucesso do site (demonstraÃ§Ã£o local)."
        };
        const local = localStorage.getItem("esol_fallback_agendamentos");
        let list = [];
        if (local) {
          try { list = JSON.parse(local); } catch {}
        }
        list.push(novoAg);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(list));
        
        toast.success("ReuniÃ£o agendada com sucesso (modo de simulaÃ§Ã£o local)!");
        setAgendamentoConfirmado(novoAg);
        setSavingAgendamento(false);
        return;
      }

      if (error) throw error;

      toast.success("ReuniÃ£o agendada com sucesso!");
      setAgendamentoConfirmado(data);
    } catch (err: any) {
      console.error("Erro ao salvar agendamento:", err);
      toast.error(`Erro ao efetuar agendamento: ${err.message}`);
    } finally {
      setSavingAgendamento(false);
    }
  };

  const formattedDate = (d: Date) => {
    return `${DIAS_NOMES[d.getDay()]}, ${d.getDate()} de ${MESES_NOMES[d.getMonth()]}`;
  };

  const whatsappMessage = nome
    ? `OlÃ¡! Meu nome Ã© ${nome}. Acabei de solicitar um orÃ§amento no site da ESOL Energy e gostaria de furar a fila para receber a anÃ¡lise do meu telhado!`
    : "OlÃ¡! Solicitei um orÃ§amento no site da ESOL Energy e gostaria de furar a fila para receber a anÃ¡lise do meu telhado!";

  const whatsappLink = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex flex-col justify-between relative overflow-x-hidden">
      {/* Elementos de background decorativos (Sol e brilhos) */}
      <div className="pointer-events-none absolute -top-32 -right-40 w-[640px] h-[640px] rounded-full bg-sun/20 blur-3xl animate-sun-pulse" />
      <div className="pointer-events-none absolute top-40 -left-20 w-[420px] h-[420px] rounded-full bg-navy/5 blur-3xl" />
          ];
        }

        try {
          // 2. Carrega agendamentos futuros
          const limitDate = new Date();
          limitDate.setDate(limitDate.getDate() + 10);
          const { data: agendsData, error: errAgends } = await supabase
            .from("agendamentos" as any)
            .select("data_hora")
            .gte("data_hora", new Date().toISOString())
            .lte("data_hora", limitDate.toISOString())
            .neq("status", "cancelado");

          if (errAgends) throw errAgends;
          agends = agendsData || [];
        } catch (eAgends) {
          console.warn("Tabela agendamentos ausente no banco remoto. Usando fallback local.");
          const local = localStorage.getItem("esol_fallback_agendamentos");
          if (local) {
            try {
              const parsed = JSON.parse(local);
              agends = parsed.map((a: any) => ({ data_hora: a.data_hora }));
            } catch {}
          }
        }

        setConfigAgenda(configs);
        setAgendamentosExistentes(agends);

        // 3. Gera os prÃ³ximos 5 dias Ãºteis (Segunda a Sexta)
        const days: Date[] = [];
        let cur = new Date();
        // ComeÃ§a a partir de amanhÃ£
        cur.setDate(cur.getDate() + 1);
        
        while (days.length < 5) {
          const dayOfWeek = cur.getDay();
          // Verifica se o dia de semana estÃ¡ ativo nas configuraÃ§Ãµes da agenda
          const configParaDia = configs.find((c: any) => c.dia_semana === dayOfWeek);
          
          if (configParaDia) {
            days.push(new Date(cur));
          }
          cur.setDate(cur.getDate() + 1);
        }
        
        setDiasDisponiveis(days);
        if (days.length > 0) {
          setDiaSelecionado(days[0]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da agenda:", err);
      } finally {
        setLoadingAgenda(false);
      }
    })();
  }, []);

  // Gera slots horÃ¡rios livres para o dia selecionado
  useEffect(() => {
    if (!diaSelecionado) return;

    const dayOfWeek = diaSelecionado.getDay();
    const configParaDia = configAgenda.find((c: any) => c.dia_semana === dayOfWeek);

    if (!configParaDia) {
      setSlotsHorarios([]);
      return;
    }

    const startStr = configParaDia.hora_inicio; // ex: '09:00:00'
    const endStr = configParaDia.hora_fim;     // ex: '18:00:00'
    const interval = configParaDia.intervalo_minutos || 60;

    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots: string[] = [];
    for (let m = startMinutes; m < endMinutes; m += interval) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      
      // Valida se esse slot de horÃ¡rio jÃ¡ estÃ¡ ocupado por outro cliente na mesma data
      const isOcupado = agendamentosExistentes.some((a: any) => {
        const agDate = new Date(a.data_hora);
        const isMesmoDia = agDate.getDate() === diaSelecionado.getDate() &&
                           agDate.getMonth() === diaSelecionado.getMonth() &&
                           agDate.getFullYear() === diaSelecionado.getFullYear();
        
        const agTimeStr = `${String(agDate.getHours()).padStart(2, "0")}:${String(agDate.getMinutes()).padStart(2, "0")}`;
        return isMesmoDia && agTimeStr === timeStr;
      });

      if (!isOcupado) {
        slots.push(timeStr);
      }
    }

    setSlotsHorarios(slots);
    setHorarioSelecionado(slots.length > 0 ? slots[0] : null);
  }, [diaSelecionado, configAgenda, agendamentosExistentes]);

  // FunÃ§Ã£o para salvar o agendamento
  const handleConfirmarAgendamento = async () => {
    if (!id) {
      toast.error("Erro tÃ©cnico: ID do cliente nÃ£o encontrado. Recarregue a pÃ¡gina.");
      return;
    }
    if (!diaSelecionado || !horarioSelecionado) {
      toast.error("Selecione um dia e horÃ¡rio para prosseguir.");
      return;
    }

    setSavingAgendamento(true);
    try {
      const [h, m] = horarioSelecionado.split(":").map(Number);
      const scheduledDateTime = new Date(diaSelecionado);
      scheduledDateTime.setHours(h, m, 0, 0);

      let data: any = null;
      let error: any = null;

      try {
        const resInsert = await supabase
          .from("agendamentos" as any)
          .insert({
            cliente_id: id,
            data_hora: scheduledDateTime.toISOString(),
            status: "pendente",
            observacoes: "Agendamento autÃ´nomo efetuado pelo cliente na pÃ¡gina de sucesso do site."
          })
          .select("*")
          .maybeSingle();
        data = resInsert.data;
        error = resInsert.error;
      } catch (e) {
        error = e;
      }

      // Se a tabela nÃ£o existe no banco de dados remoto
      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        console.warn("Tabela agendamentos ausente no banco remoto. Registrando localmente...");
        const novoAg = {
          id: Math.random().toString(36).substring(2, 9),
          cliente_id: id,
          data_hora: scheduledDateTime.toISOString(),
          status: "pendente",
          observacoes: "Agendamento autÃ´nomo efetuado pelo cliente na pÃ¡gina de sucesso do site (demonstraÃ§Ã£o local)."
        };
        const local = localStorage.getItem("esol_fallback_agendamentos");
        let list = [];
        if (local) {
          try { list = JSON.parse(local); } catch {}
        }
        list.push(novoAg);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(list));
        
        toast.success("ReuniÃ£o agendada com sucesso (modo de simulaÃ§Ã£o local)!");
        setAgendamentoConfirmado(novoAg);
        setSavingAgendamento(false);
        return;
      }

      if (error) throw error;

      toast.success("ReuniÃ£o agendada com sucesso!");
      setAgendamentoConfirmado(data);
    } catch (err: any) {
      console.error("Erro ao salvar agendamento:", err);
      toast.error(`Erro ao efetuar agendamento: ${err.message}`);
    } finally {
      setSavingAgendamento(false);
    }
  };

  const formattedDate = (d: Date) => {
    return `${DIAS_NOMES[d.getDay()]}, ${d.getDate()} de ${MESES_NOMES[d.getMonth()]}`;
  };

  const whatsappMessage = nome
    ? `OlÃ¡! Meu nome Ã© ${nome}. Acabei de solicitar um orÃ§amento no site da ESOL Energy e gostaria de furar a fila para receber a anÃ¡lise do meu telhado!`
    : "OlÃ¡! Solicitei um orÃ§amento no site da ESOL Energy e gostaria de furar a fila para receber a anÃ¡lise do meu telhado!";

  const whatsappLink = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex flex-col justify-between relative overflow-x-hidden">
      {/* Elementos de background decorativos (Sol e brilhos) */}
      <div className="pointer-events-none absolute -top-32 -right-40 w-[640px] h-[640px] rounded-full bg-sun/20 blur-3xl animate-sun-pulse" />
      <div className="pointer-events-none absolute top-40 -left-20 w-[420px] h-[420px] rounded-full bg-navy/5 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />

      {/* Header com Logotipo */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 flex justify-center sm:justify-start items-center">
        <Link to="/" className="transition hover:opacity-90">
          <img src={logo} alt="ESOL Energy" className="h-8 w-auto" />
        </Link>
      </header>

      {/* Conteúdo Central */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4">
        <div className="max-w-lg w-full text-center space-y-4 animate-fade-in">
          
          {/* Card Principal */}
          <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-deep relative overflow-hidden space-y-3">
            
            {/* Ícone de Sucesso */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 animate-pulse">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[1.5]" />
                </div>
                <div className="absolute -top-0.5 -right-0.5">
                  <Sparkles className="w-3 h-3 text-[#E2B714] animate-bounce" />
                </div>
              </div>
            </div>

            {/* Mensagem Principal */}
            <div className="space-y-1">
              <span className="inline-block text-[#E2B714] font-extrabold tracking-[0.2em] text-[8px] uppercase bg-[#E2B714]/10 px-2 py-0.5 rounded-full border border-[#E2B714]/20">
                Orçamento Solicitado!
              </span>
              <h1 className="text-md sm:text-lg font-black tracking-tight leading-tight text-navy">
                {nome ? `Obrigado, ${nome.split(" ")[0]}!` : "Estudo Fotovoltaico Solicitado!"}
              </h1>
              <p className="text-[10px] text-slate-650 leading-relaxed max-w-xs mx-auto">
                Seu orçamento foi recebido com sucesso no CRM da ESOL Energy. Nossos engenheiros já iniciaram os cálculos de dimensionamento.
              </p>
            </div>

            {/* Caixa de Agendamento Dinâmico */}
            <div className="border-t border-border pt-3 space-y-3">
              {agendamentoConfirmado ? (
                /* Ticket de Reunião Confirmada */
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center space-y-2 animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-[9px] font-black text-navy uppercase tracking-wider">Apresentação Reservada!</h3>
                    <p className="text-[11px] font-bold text-emerald-600">
                      {formattedDate(new Date(agendamentoConfirmado.data_hora))} às {String(new Date(agendamentoConfirmado.data_hora).getHours()).padStart(2, "0")}:{String(new Date(agendamentoConfirmado.data_hora).getMinutes()).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Reservamos o consultor para apresentar o estudo do seu telhado. Informações de acesso enviadas no WhatsApp!
                  </p>
                </div>
              ) : (
                /* Formulário de Seleção de Dia e Horário */
                <div className="space-y-2 text-left bg-secondary p-3 rounded-xl border border-border">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-navy flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#E2B714]" /> Agende a Apresentação (Grátis)
                  </h3>
                  
                  {loadingAgenda ? (
                    <div className="py-3 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-[#E2B714]" /> Carregando dias livres...
                    </div>
                  ) : diasDisponiveis.length === 0 ? (
                    <p className="text-[10px] text-center py-2 text-slate-400 font-medium">Agenda indisponível no momento.</p>
                  ) : (
                    <div className="space-y-2 pt-0.5">
                      {/* Dias */}
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-widest font-black text-slate-400">1. Dia</label>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                          {diasDisponiveis.map((d) => {
                            const isSelected = diaSelecionado && diaSelecionado.getDate() === d.getDate();
                            return (
                              <button
                                key={d.toISOString()}
                                type="button"
                                onClick={() => setDiaSelecionado(d)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-center shrink-0 transition cursor-pointer border ${
                                  isSelected 
                                    ? "bg-navy border-navy text-white font-black" 
                                    : "bg-white border-border text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {DIAS_NOMES[d.getDay()].slice(0, 3)} {d.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Horários */}
                      <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-widest font-black text-slate-400">2. Horário</label>
                        {slotsHorarios.length === 0 ? (
                           <p className="text-[9px] text-amber-600 font-bold">Sem horários disponíveis.</p>
                        ) : (
                          <div className="grid grid-cols-5 gap-1">
                            {slotsHorarios.map((t) => {
                              const isSelected = horarioSelecionado === t;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setHorarioSelecionado(t)}
                                  className={`py-1 rounded-md text-[10px] font-bold text-center transition cursor-pointer border ${
                                    isSelected
                                      ? "bg-[#E2B714] border-[#E2B714] text-navy font-black"
                                      : "bg-white border-border text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Botão de Confirmação */}
                      <button
                        type="button"
                        onClick={handleConfirmarAgendamento}
                        disabled={savingAgendamento || !horarioSelecionado}
                        className="w-full py-2 px-3 mt-1 bg-[#001F5C] hover:bg-[#00153F] text-white font-black text-[10px] rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {savingAgendamento ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                        Confirmar Reunião
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divisor de Destaque */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-[7px] font-bold text-slate-400 uppercase tracking-widest">Ou</span>
              </div>
            </div>

            {/* Seção WhatsApp */}
            <div className="space-y-1">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                Falar agora no WhatsApp
              </a>
            </div>

          </div>

          {/* Botão de Retorno ao Início */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-navy font-bold transition-all"
            >
              <ArrowLeft className="w-3 h-3" /> Voltar para o site
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 border-t border-slate-200/60 text-center text-[9px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          © {new Date().getFullYear()} ESOL Energy. Todos os direitos reservados.
        </div>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-navy">Termos de Uso</Link>
          <Link to="/" className="hover:text-navy">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}
