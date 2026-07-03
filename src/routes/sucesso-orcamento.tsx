import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, ArrowLeft, Sun, ShieldCheck, Sparkles, Clock, Calendar, Check, Loader2 } from "lucide-react";
import logo from "@/assets/esol-logo.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/sucesso-orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento Recebido! — ESOL Energy" },
      { name: "description", content: "Pedido de orçamento recebido com sucesso. Agende sua reunião técnica ou fale no WhatsApp." }
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
const DIAS_NOMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
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

  // Carrega configurações e agendamentos ocupados
  useEffect(() => {
    (async () => {
      setLoadingAgenda(true);
      try {
        let configs: any[] = [];
        let agends: any[] = [];
        
        try {
          // 1. Carrega configuração da agenda
          const { data: configData, error: errConfig } = await supabase
            .from("configuracao_agenda" as any)
            .select("*")
            .eq("ativo", true);
          
          if (errConfig) throw errConfig;
          configs = configData || [];
        } catch (eConfig) {
          console.warn("Tabela configuracao_agenda ausente no banco remoto. Usando fallback padrão.");
          // Fallback padrão: Segunda a Sexta ativa
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

        // 3. Gera os próximos 5 dias úteis (Segunda a Sexta)
        const days: Date[] = [];
        let cur = new Date();
        // Começa a partir de amanhã
        cur.setDate(cur.getDate() + 1);
        
        while (days.length < 5) {
          const dayOfWeek = cur.getDay();
          // Verifica se o dia de semana está ativo nas configurações da agenda
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

  // Gera slots horários livres para o dia selecionado
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
      
      // Valida se esse slot de horário já está ocupado por outro cliente na mesma data
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

  // Função para salvar o agendamento
  const handleConfirmarAgendamento = async () => {
    if (!id) {
      toast.error("Erro técnico: ID do cliente não encontrado. Recarregue a página.");
      return;
    }
    if (!diaSelecionado || !horarioSelecionado) {
      toast.error("Selecione um dia e horário para prosseguir.");
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
            observacoes: "Agendamento autônomo efetuado pelo cliente na página de sucesso do site."
          })
          .select("*")
          .maybeSingle();
        data = resInsert.data;
        error = resInsert.error;
      } catch (e) {
        error = e;
      }

      // Se a tabela não existe no banco de dados remoto
      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        console.warn("Tabela agendamentos ausente no banco remoto. Registrando localmente...");
        const novoAg = {
          id: Math.random().toString(36).substring(2, 9),
          cliente_id: id,
          data_hora: scheduledDateTime.toISOString(),
          status: "pendente",
          observacoes: "Agendamento autônomo efetuado pelo cliente na página de sucesso do site (demonstração local)."
        };
        const local = localStorage.getItem("esol_fallback_agendamentos");
        let list = [];
        if (local) {
          try { list = JSON.parse(local); } catch {}
        }
        list.push(novoAg);
        localStorage.setItem("esol_fallback_agendamentos", JSON.stringify(list));
        
        toast.success("Reunião agendada com sucesso (modo de simulação local)!");
        setAgendamentoConfirmado(novoAg);
        setSavingAgendamento(false);
        return;
      }

      if (error) throw error;

      toast.success("Reunião agendada com sucesso!");
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
    ? `Olá! Meu nome é ${nome}. Acabei de solicitar um orçamento no site da ESOL Energy e gostaria de furar a fila para receber a análise do meu telhado!`
    : "Olá! Solicitei um orçamento no site da ESOL Energy e gostaria de furar a fila para receber a análise do meu telhado!";

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
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex justify-center sm:justify-start items-center">
        <Link to="/" className="transition hover:opacity-90">
          <img src={logo} alt="ESOL Energy" className="h-9 w-auto" />
        </Link>
      </header>

      {/* Conteúdo Central */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
          
          {/* Card Principal */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-10 shadow-deep relative overflow-hidden space-y-6">
            
            {/* Ícone de Sucesso */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 animate-pulse">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[1.5]" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-[#E2B714] animate-bounce" />
                </div>
              </div>
            </div>

            {/* Mensagem Principal */}
            <div className="space-y-3">
              <span className="inline-block text-[#E2B714] font-extrabold tracking-[0.2em] text-[9px] uppercase bg-[#E2B714]/10 px-3 py-1 rounded-full border border-[#E2B714]/20">
                Orçamento Solicitado!
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-navy">
                {nome ? `Obrigado, ${nome.split(" ")[0]}!` : "Estudo Fotovoltaico Solicitado!"}
              </h1>
              <p className="text-xs text-slate-650 leading-relaxed max-w-md mx-auto">
                Seu orçamento foi recebido com sucesso no CRM da ESOL Energy. Nossos engenheiros já iniciaram os cálculos de dimensionamento.
              </p>
            </div>

            {/* Caixa de Agendamento Dinâmico */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              {agendamentoConfirmado ? (
                /* Ticket de Reunião Confirmada */
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-navy uppercase tracking-wider text-[10px]">Apresentação Reservada!</h3>
                    <p className="text-xs font-bold text-emerald-600">
                      {formattedDate(new Date(agendamentoConfirmado.data_hora))} às {String(new Date(agendamentoConfirmado.data_hora).getHours()).padStart(2, "0")}:{String(new Date(agendamentoConfirmado.data_hora).getMinutes()).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Reservamos o consultor para apresentar o estudo do seu telhado nesta data. As informações de acesso foram enviadas no seu WhatsApp!
                  </p>
                </div>
              ) : (
                /* Formulário de Seleção de Dia e Horário */
                <div className="space-y-4 text-left bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#E2B714]" /> Agende a Apresentação do seu Estudo Técnico (Grátis)
                  </h3>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                    Escolha o melhor horário para fazermos uma chamada de 10 minutos para detalhar o dimensionamento dos painéis, prazos de instalação e economias reais.
                  </p>

                  {loadingAgenda ? (
                    <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#E2B714]" /> Carregando dias livres...
                    </div>
                  ) : diasDisponiveis.length === 0 ? (
                    <p className="text-xs text-center py-4 text-slate-400 font-medium">Nenhum dia de atendimento configurado na agenda.</p>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {/* Dias */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-black text-slate-400">1. Escolha o dia</label>
                        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                          {diasDisponiveis.map((d) => {
                            const isSelected = diaSelecionado && diaSelecionado.getDate() === d.getDate();
                            return (
                              <button
                                key={d.toISOString()}
                                type="button"
                                onClick={() => setDiaSelecionado(d)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold text-center shrink-0 transition cursor-pointer border ${
                                  isSelected 
                                    ? "bg-[#001F5C] border-[#001F5C] text-white font-black" 
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <div className="text-[9px] opacity-70">{DIAS_NOMES[d.getDay()].slice(0, 3)}</div>
                                <div className="text-sm mt-0.5">{d.getDate()}</div>
                                <div className="text-[8.5px] opacity-60 mt-0.5">{MESES_NOMES[d.getMonth()]}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Horários */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest font-black text-slate-400">2. Escolha o horário</label>
                        {slotsHorarios.length === 0 ? (
                          <p className="text-[10px] text-amber-600 font-bold py-1">Todos os horários deste dia já foram ocupados. Escolha outra data.</p>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {slotsHorarios.map((t) => {
                              const isSelected = horarioSelecionado === t;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setHorarioSelecionado(t)}
                                  className={`py-2 px-1 rounded-lg text-xs font-bold text-center transition cursor-pointer border ${
                                    isSelected
                                      ? "bg-[#E2B714] border-[#E2B714] text-navy font-black shadow-sm"
                                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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
                        className="w-full py-3 px-4 mt-2 bg-[#001F5C] hover:bg-[#00153F] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {savingAgendamento ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                        Confirmar Reunião Técnica Gratuita
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divisor de Destaque */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 py-0.5 text-[8.5px] font-bold text-slate-500 tracking-widest rounded">Quer acelerar?</span>
              </div>
            </div>

            {/* Seção WhatsApp - Furar a Fila */}
            <div className="space-y-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 ${
                  pulsing ? "scale-[1.02]" : "scale-100"
                }`}
              >
                <MessageCircle className="w-4.5 h-4.5 fill-current" />
                Furar a fila e falar agora no WhatsApp ⚡
              </a>
              <p className="text-[9px] text-slate-400 font-medium">
                Caso prefira antecipar o contato, converse diretamente com o especialista comercial de plantão.
              </p>
            </div>

          </div>

          {/* Botão de Retorno ao Início */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o site
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 border-t border-slate-200/60 text-center text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
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
