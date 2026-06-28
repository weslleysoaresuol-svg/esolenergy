import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  MessageCircle, ArrowLeft, Trash2, FileSpreadsheet, Star, Gift, AlertTriangle,
  Inbox, Calendar, FileText, FileSignature, Wrench, Zap, CheckCircle2, RefreshCw,
  Upload, Check, ShieldAlert, Sparkles, Building, Landmark, Printer, FileDown, Clock
} from "lucide-react";

export const Route = createFileRoute("/app/cliente/$id")({
  head: () => ({ meta: [{ title: "Ficha do Cliente — ESOL Energy" }] }),
  component: ClienteDetail,
});

const STATUSES = ["novo","contato","visita_agendada","proposta_enviada","negociacao","contrato_assinado","instalacao","concluido","perdido"];
const STATUS_LABEL: Record<string,string> = {
  novo:"Novo lead",contato:"Em contato",visita_agendada:"Visita agendada",proposta_enviada:"Proposta enviada",
  negociacao:"Negociação",contrato_assinado:"Contrato assinado",instalacao:"Em instalação",concluido:"Concluído",perdido:"Perdido",
};

const MOTIVO_PERDA_OPTIONS = [
  { value: "preco", label: "💰 Preço alto" },
  { value: "concorrente", label: "🏢 Escolheu concorrente" },
  { value: "prazo", label: "⏱️ Prazo de entrega" },
  { value: "financiamento_reprovado", label: "🏦 Financiamento reprovado" },
  { value: "desistiu", label: "🚫 Desistiu do projeto" },
  { value: "nao_atendeu", label: "📵 Não atendeu / sumiu" },
  { value: "outro", label: "📝 Outro motivo" },
];

function ClienteDetail() {
  const { id } = Route.useParams();
  const { user, role } = useCurrentUser();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [interacoes, setInteracoes] = useState<any[]>([]);
  const [novaInt, setNovaInt] = useState({ tipo: "ligacao", descricao: "" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState<any>({});
  
  // Modal de motivo de perda
  const [showMotivoPerda, setShowMotivoPerda] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [motivoDescricao, setMotivoDescricao] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  
  // NPS
  const [npsScore, setNpsScore] = useState<number | null>(null);

  // ESTADOS DA ABA DE CONTRATO & FINANCIAMENTO
  const [contratoTab, setContratoTab] = useState<"dados" | "financiamento" | "documentos" | "minuta">("dados");
  const [contratoTipo, setContratoTipo] = useState<"pf" | "pj">("pf");
  
  // Dados do Contratante
  const [docCpf, setDocCpf] = useState("");
  const [docRg, setDocRg] = useState("");
  const [docNasc, setDocNasc] = useState("");
  const [docEstadoCivil, setDocEstadoCivil] = useState("solteiro");
  const [docProfissao, setDocProfissao] = useState("");
  const [docCnpj, setDocCnpj] = useState("");
  const [docRazao, setDocRazao] = useState("");
  const [docIe, setDocIe] = useState("");
  const [docRepresentante, setDocRepresentante] = useState("");
  
  // Dados da Unidade Consumidora (UC)
  const [docUc, setDocUc] = useState("");
  const [docTitular, setDocTitular] = useState("");
  const [docConcessionaria, setDocConcessionaria] = useState("");
  
  // Financiamento Solar
  const [finFormaPagamento, setFinFormaPagamento] = useState("financiamento");
  const [finBanco, setFinBanco] = useState("solfacil");
  const [finValor, setFinValor] = useState("");
  const [finPrazo, setFinPrazo] = useState("60");
  const [finStatus, setFinStatus] = useState<"pendente" | "simulado" | "analise" | "aprovado" | "reprovado">("pendente");

  // Upload de Documentos (simulação visual com progresso)
  const [docFiles, setDocFiles] = useState<Record<string, { name: string; progress: number; done: boolean }>>({});
  const [showMinutaModal, setShowMinutaModal] = useState(false);

  // Propostas vinculadas
  const [propostas, setPropostas] = useState<any[]>([]);
  
  // Estados para Lançamento do Financiamento Aprovado
  const [aprovBanco, setAprovBanco] = useState("solfacil");
  const [aprovPrazo, setAprovPrazo] = useState("60");
  const [aprovTaxa, setAprovTaxa] = useState("1.29");
  const [aprovPmt, setAprovPmt] = useState("");
  const [savingAprov, setSavingAprov] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("clientes").select("*, profiles:corretor_id(nome,email)").eq("id", id).maybeSingle();
    if (error) {
      console.error("Erro ao carregar detalhes do cliente (tentando fallback):", error);
      const { data: fallbackData } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
      setCliente(fallbackData);
      setEdit(fallbackData || {});
      
      // Carrega campos do contrato do fallback se existirem
      if (fallbackData) {
        setDocUc(fallbackData.numero_uc || "");
        setDocConcessionaria(fallbackData.concessionaria || "");
        setFinValor(fallbackData.valor_estimado ? String(fallbackData.valor_estimado) : "");
        setFinFormaPagamento(fallbackData.forma_pagamento || "financiamento");
      }
    } else {
      setCliente(data);
      setEdit(data || {});
      
      // Preenche estados locais
      if (data) {
        setDocUc(data.numero_uc || "");
        setDocConcessionaria(data.concessionaria || "");
        setFinValor(data.valor_estimado ? String(data.valor_estimado) : "");
        setFinFormaPagamento(data.forma_pagamento || "financiamento");
      }
    }

    // Carrega propostas associadas
    try {
      const { data: propAssocs } = await supabase
        .from("proposta_clientes")
        .select("proposta_id, propostas(*)")
        .eq("cliente_id", id);
      
      if (propAssocs) {
        const list = propAssocs.map((pa: any) => pa.propostas).filter(Boolean);
        setPropostas(list);
      }
    } catch (e) {
      console.warn("Erro ao buscar propostas do cliente:", e);
    }

    const { data: ints } = await supabase.from("interacoes").select("*").eq("cliente_id", id).order("created_at", { ascending: false });
    setInteracoes(ints || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    if (status === "perdido") {
      setPendingStatus(status);
      setShowMotivoPerda(true);
      return;
    }
    await _doUpdateStatus(status, null, null);
  };

  const _doUpdateStatus = async (status: string, motivo: string | null, descMotivo: string | null) => {
    const extraFields: any = { status };
    if (status === "perdido") {
      extraFields.motivo_perda = motivo;
      extraFields.perdido_em = new Date().toISOString();
    }
    if (status === "contrato_assinado" || status === "concluido") {
      extraFields.fechado_em = extraFields.fechado_em || new Date().toISOString();
    }
    await supabase.from("clientes").update(extraFields as any).eq("id", id);
    
    // Registra interação automática
    if (user) {
      const descAuto = status === "perdido" && motivo
        ? `Status alterado para: ${STATUS_LABEL[status]}. Motivo: ${MOTIVO_PERDA_OPTIONS.find(o => o.value === motivo)?.label}${descMotivo ? ` — ${descMotivo}` : ""}`
        : `Status alterado para: ${STATUS_LABEL[status]}`;
      await supabase.from("interacoes").insert({ cliente_id: id, autor_id: user.id, tipo: "nota", descricao: descAuto });
    }
    toast.success("Status atualizado");
    load();
  };

  const confirmarMotivoPerda = async () => {
    if (!motivoPerda) { toast.error("Selecione um motivo de perda"); return; }
    setShowMotivoPerda(false);
    await _doUpdateStatus("perdido", motivoPerda, motivoDescricao);
    setMotivoPerda("");
    setMotivoDescricao("");
    setPendingStatus(null);
  };

  const lancarAprovacaoFinanciamento = async () => {
    const propAguardando = propostas.find((p) => p.condicoes_pagamento?.includes("[DOC:FIN_AGUARDANDO]"));
    if (!propAguardando) {
      toast.error("Nenhuma proposta aguardando análise de financiamento foi encontrada.");
      return;
    }
    if (!aprovPmt) {
      toast.error("Por favor, informe o valor aprovado da parcela (R$).");
      return;
    }
    
    setSavingAprov(true);
    try {
      const novaTag = `[DOC:FIN_APROVADO:${aprovBanco}:${aprovPrazo}:${aprovTaxa}:${aprovPmt}]`;
      const antigasCondicoes = propAguardando.condicoes_pagamento || "";
      const novasCondicoes = antigasCondicoes.replace("[DOC:FIN_AGUARDANDO]", novaTag);

      // 1. Atualiza proposta com a liberação
      const { error: errProp } = await supabase
        .from("propostas")
        .update({ condicoes_pagamento: novasCondicoes })
        .eq("id", propAguardando.id);
      
      if (errProp) throw errProp;

      // 2. Atualiza status do cliente
      const { error: errClient } = await supabase
        .from("clientes")
        .update({ 
          status: "contrato_assinado" as any,
          forma_pagamento: "financiamento",
          valor_estimado: propAguardando.preco_total
        })
        .eq("id", id);
      
      if (errClient) throw errClient;

      // 3. Registra Interação
      if (user) {
        await supabase.from("interacoes").insert({
          cliente_id: id,
          autor_id: user.id,
          tipo: "nota",
          descricao: `Financiamento APROVADO via ${aprovBanco.toUpperCase()} em ${aprovPrazo}x de R$ ${aprovPmt} (Taxa: ${aprovTaxa}% a.m.). Status atualizado para Contrato Assinado.`
        });
      }

      toast.success("Resultado do financiamento solar registrado com sucesso!");
      load();
    } catch (e: any) {
      toast.error("Erro ao registrar aprovação: " + e.message);
    } finally {
      setSavingAprov(false);
    }
  };

  const addInteracao = async () => {
    if (!user || !novaInt.descricao) return;
    await supabase.from("interacoes").insert({ cliente_id: id, autor_id: user.id, ...novaInt });
    setNovaInt({ tipo: "ligacao", descricao: "" });
    load();
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("clientes").update({
      nome: edit.nome, telefone: edit.telefone, email: edit.email,
      cidade: edit.cidade, endereco: edit.endereco,
      consumo_kwh: edit.consumo_kwh ? Number(edit.consumo_kwh) : null,
      valor_fatura: edit.valor_fatura ? Number(edit.valor_fatura) : null,
      potencia_kwp: edit.potencia_kwp ? Number(edit.potencia_kwp) : null,
      valor_estimado: edit.valor_estimado ? Number(edit.valor_estimado) : null,
      observacoes: edit.observacoes,
    }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Cliente atualizado"); setEditing(false); load(); }
  };

  const saveNps = async () => {
    if (npsScore === null) return;
    await supabase.from("clientes").update({ nps_score: npsScore, nps_enviado_em: new Date().toISOString() } as any).eq("id", id);
    toast.success("NPS registrado! Obrigado pelo feedback.");
    load();
  };

  const remove = async () => {
    if (!confirm("Excluir cliente? Esta ação não pode ser desfeita.")) return;
    await supabase.from("clientes").delete().eq("id", id);
    toast.success("Cliente excluído");
    navigate({ to: "/app" });
  };

  // FUNÇÕES DO WORKFLOW DE CONTRATO
  const simularUpload = (tipoDoc: string, fileName: string) => {
    setDocFiles((prev) => ({
      ...prev,
      [tipoDoc]: { name: fileName, progress: 0, done: false }
    }));
    
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setDocFiles((prev) => {
        if (!prev[tipoDoc]) return prev;
        return {
          ...prev,
          [tipoDoc]: { ...prev[tipoDoc], progress: p, done: p >= 100 }
        };
      });
      if (p >= 100) {
        clearInterval(interval);
        toast.success(`Documento "${fileName}" enviado com sucesso!`);
      }
    }, 250);
  };

  const simularAnaliseCredito = () => {
    if (!finValor) {
      toast.error("Insira o valor do projeto para análise.");
      return;
    }
    setFinStatus("analise");
    toast.info("Enviando solicitação de crédito para a financeira...");
    setTimeout(() => {
      setFinStatus("aprovado");
      toast.success("🎉 Crédito Aprovado! Aguardando assinatura biométrica facial do cliente.");
      if (user) {
        supabase.from("interacoes").insert({
          cliente_id: id,
          autor_id: user.id,
          tipo: "nota",
          descricao: `Financiamento simulado na ${finBanco.toUpperCase()} de R$ ${Number(finValor).toLocaleString("pt-BR")} em ${finPrazo}x. Crédito pré-aprovado com sucesso.`
        });
      }
    }, 2500);
  };

  const salvarDadosContrato = async () => {
    // Persiste dados no Supabase para manter o cliente atualizado
    const { error } = await supabase.from("clientes").update({
      numero_uc: docUc,
      concessionaria: docConcessionaria,
      forma_pagamento: finFormaPagamento
    } as any).eq("id", id);

    if (error) {
      toast.error("Erro ao salvar dados: " + error.message);
    } else {
      toast.success("Dados cadastrais do contrato salvos com sucesso!");
      load();
    }
  };

  // Cálculo da parcela aproximada do financiamento
  const parcelaEstimada = useMemo(() => {
    if (!finValor || isNaN(Number(finValor))) return 0;
    const taxaMes = 0.0125; // Taxa de juros simulada de 1.25% a.m.
    const meses = Number(finPrazo);
    const v = Number(finValor);
    
    // Fórmula de amortização Price PMT
    const pmt = (v * taxaMes * Math.pow(1 + taxaMes, meses)) / (Math.pow(1 + taxaMes, meses) - 1);
    return Math.round(pmt);
  }, [finValor, finPrazo]);

  if (loading) return <div className="text-muted-foreground py-12 text-center">Carregando…</div>;
  if (!cliente) return <div>Cliente não encontrado. <Link to="/app" className="text-sun-deep">Voltar</Link></div>;

  const whatsapp = cliente.telefone ? `https://wa.me/${cliente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${cliente.nome?.split(" ")[0]}, tudo bem? Aqui é da ESOL Energy. Quero conversar sobre energia solar para você! 🌞`)}` : null;

  // Renderização condicional da aba do contrato
  const exibirFluxoContrato = ["contrato_assinado", "instalacao", "concluido"].includes(cliente.status);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Modal Motivo de Perda */}
      {showMotivoPerda && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-navy">Registrar perda</h3>
                <p className="text-xs text-muted-foreground">Qual o principal motivo da perda deste lead?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOTIVO_PERDA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMotivoPerda(opt.value)}
                  className={`p-3 rounded-xl text-sm text-left border-2 transition font-medium ${motivoPerda === opt.value ? "border-red-500 bg-red-50 text-red-800" : "border-slate-200 hover:border-slate-300"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Observação adicional (opcional)…"
              value={motivoDescricao}
              onChange={(e) => setMotivoDescricao(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setShowMotivoPerda(false); setPendingStatus(null); }}>Cancelar</Button>
              <Button onClick={confirmarMotivoPerda} className="bg-red-600 hover:bg-red-700 text-white">Registrar perda</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRIMÍVEL DE MINUTA CONTRATUAL */}
      {showMinutaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl p-8 print:shadow-none print:rounded-none space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileSignature className="w-6 h-6 text-sun-deep" />
                <h2 className="text-xl font-extrabold text-navy">Minuta de Contrato de Venda Solar</h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="bg-slate-50 border"><Printer className="w-4 h-4 mr-1" /> Imprimir Contrato</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowMinutaModal(false)}>Fechar</Button>
              </div>
            </div>

            {/* Corpo do Contrato formatado */}
            <div className="text-slate-800 text-xs space-y-4 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 print:max-h-none print:overflow-visible font-sans">
              <div className="text-center space-y-1 pb-4 border-b">
                <h1 className="text-base font-extrabold uppercase text-navy">CONTRATO DE COMPRA E VENDA DE GERADOR FOTOVOLTAICO</h1>
                <p className="text-[10px] text-muted-foreground">ESOL ENERGY · ENERGIA INTELIGENTE E SUSTENTÁVEL</p>
              </div>

              <p>
                Pelo presente instrumento particular, as partes qualificadas a seguir firmam o presente contrato de fornecimento e prestação de serviços técnicos:
              </p>

              <div>
                <strong className="text-navy uppercase">1. CONTRATANTE (CLIENTE)</strong>
                <p className="pl-4 mt-1">
                  Nome/Razão Social: <strong>{cliente.nome}</strong><br />
                  CPF/CNPJ: <strong>{contratoTipo === "pf" ? docCpf || cliente.cpf_cnpj || "—" : docCnpj || cliente.cpf_cnpj || "—"}</strong><br />
                  Endereço de Instalação: <strong>{cliente.endereco || "—"}</strong>, Cidade: <strong>{cliente.cidade || "—"} - {cliente.estado || "SP"}</strong><br />
                  Telefone/WhatsApp: <strong>{cliente.telefone}</strong>
                </p>
              </div>

              <div>
                <strong className="text-navy uppercase">2. CONTRATADA (FORNECEDOR)</strong>
                <p className="pl-4 mt-1">
                  Razão Social: <strong>ESOL ENERGY LIMITADA</strong><br />
                  CNPJ: <strong>44.555.666/0001-99</strong><br />
                  Endereço: <strong>Av. Paulista, 1000 - Bela Vista, São Paulo - SP</strong>
                </p>
              </div>

              <div>
                <strong className="text-navy uppercase">3. OBJETO DO CONTRATO</strong>
                <p className="pl-4 mt-1">
                  Constitui objeto deste instrumento o fornecimento de Gerador de Energia Solar Fotovoltaico com potência nominal estimada de <strong>{cliente.potencia_kwp || "5.4"} kWp</strong>, dimensionado para o local indicado, composto pelos módulos (painéis) e inversor homologados descritos na proposta comercial técnica correspondente.
                </p>
              </div>

              <div>
                <strong className="text-navy uppercase">4. VALORES E CONDIÇÕES DE PAGAMENTO</strong>
                <p className="pl-4 mt-1">
                  O valor de investimento total contratado para fornecimento e homologação é de <strong>R$ {Number(cliente.valor_estimado || 18500).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>.<br />
                  Modalidade de Pagamento contratada: <strong>{finFormaPagamento === "financiamento" ? `Financiamento Solar via ${finBanco.toUpperCase()}` : finFormaPagamento === "vista" ? "À Vista com 5% de desconto" : "Boleto/Cartão de Crédito"}</strong>.
                </p>
              </div>

              <div>
                <strong className="text-navy uppercase">5. PRAZOS E EXECUÇÃO</strong>
                <p className="pl-4 mt-1">
                  O prazo estimado para a entrega dos equipamentos do gerador e finalização da vistoria técnica da concessionária é de <strong>30 a 45 dias úteis</strong> a contar da assinatura digital deste termo e aprovação de crédito pelas instituições financeiras envolvidas.
                </p>
              </div>

              <p className="pt-6">
                E, por estarem justos e contratados, assinam eletronicamente o presente instrumento na data de assinatura gerada pelo portal de fechamentos.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-10 text-center border-t">
                <div className="space-y-1">
                  <div className="h-10 border-b border-slate-300 mx-auto w-48" />
                  <p className="font-bold text-[10px] uppercase">{cliente.nome}</p>
                  <p className="text-[9px] text-muted-foreground">CONTRATANTE</p>
                </div>
                <div className="space-y-1">
                  <div className="h-10 border-b border-slate-300 mx-auto w-48" />
                  <p className="font-bold text-[10px] uppercase">ESOL ENERGY LTDA</p>
                  <p className="text-[9px] text-muted-foreground">CONTRATADA</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t print:hidden">
              <Button variant="ghost" onClick={() => setShowMinutaModal(false)}>Fechar Janela</Button>
              <Button onClick={() => window.print()} className="bg-navy hover:bg-navy-deep text-white"><Printer className="w-4 h-4 mr-1" /> Imprimir Contrato</Button>
            </div>
          </div>
        </div>
      )}

      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy"><ArrowLeft className="w-4 h-4" />Voltar</Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">{cliente.nome}</h1>
          <p className="text-muted-foreground">{cliente.telefone} {cliente.email && `· ${cliente.email}`}</p>
          {role === "admin" && cliente.profiles && <p className="text-xs text-muted-foreground mt-1">Parceiro: {cliente.profiles.nome}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-600">
              <MessageCircle className="w-4 h-4" />WhatsApp
            </a>
          )}
          <Link
            to="/app/propostas/nova"
            search={{ cliente: id } as any}
            className="inline-flex items-center gap-2 bg-sun text-navy px-4 py-2 rounded-full text-sm font-semibold hover:bg-sun-deep"
          >
            <FileSpreadsheet className="w-4 h-4" />Gerar proposta
          </Link>
          <Button variant="outline" onClick={() => setEditing(!editing)}>{editing ? "Cancelar" : "Editar"}</Button>
          {role === "admin" && <Button variant="ghost" onClick={remove} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>}
        </div>
      </div>

      {/* CARD DE LANÇAMENTO DE CRÉDITO APROVADO (Aparece se houver financiamento aguardando) */}
      {propostas.some((p) => p.condicoes_pagamento?.includes("[DOC:FIN_AGUARDANDO]")) && (
        <Card className="p-6 border-2 border-amber-300 bg-amber-50/50 shadow-md space-y-4 animate-fade-in font-sans">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sun text-navy flex items-center justify-center text-xl animate-pulse">
              🏦
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-sm">Ficha de Crédito Solar em Análise (3 dias úteis)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Preencha o resultado liberado pela financeira para atualizar a proposta pública do cliente.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 pt-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Financeira Parceira</Label>
              <Select value={aprovBanco} onValueChange={setAprovBanco}>
                <SelectTrigger className="h-9 bg-white border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solfacil">🏦 Solfácil</SelectItem>
                  <SelectItem value="bv">🏢 Banco BV Solar</SelectItem>
                  <SelectItem value="santander">🏛️ Santander</SelectItem>
                  <SelectItem value="sicredi">🤝 Sicredi Cooperativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Prazo Aprovado</Label>
              <Select value={aprovPrazo} onValueChange={setAprovPrazo}>
                <SelectTrigger className="h-9 bg-white border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 parcelas</SelectItem>
                  <SelectItem value="36">36 parcelas</SelectItem>
                  <SelectItem value="48">48 parcelas</SelectItem>
                  <SelectItem value="60">60 parcelas</SelectItem>
                  <SelectItem value="72">72 parcelas</SelectItem>
                  <SelectItem value="84">84 parcelas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Taxa Liberada (% a.m.)</Label>
              <Input type="number" step="0.01" value={aprovTaxa} onChange={(e) => setAprovTaxa(e.target.value)} className="h-9 bg-white text-xs font-bold text-navy" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Valor da Parcela Aprovada (R$) *</Label>
              <Input type="number" placeholder="Ex: 389" value={aprovPmt} onChange={(e) => setAprovPmt(e.target.value)} className="h-9 bg-white text-xs font-black text-emerald-700" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button disabled={savingAprov || !aprovPmt} onClick={lancarAprovacaoFinanciamento} className="bg-sun hover:bg-sun-deep text-navy font-extrabold text-xs h-9 px-6 rounded-xl shadow-sm flex items-center gap-1.5">
              {savingAprov ? <span className="animate-spin mr-1">⌛</span> : "Aprovar e Liberar Crédito no App 🚀"}
            </Button>
          </div>
        </Card>
      )}

      {/* TIMELINE DE PROCESSO COMERCIAL SOLAR */}
      <Card className="p-5 border-0 shadow-md bg-white overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-navy text-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sun-deep" /> Jornada do Cliente Solar
          </h3>
          {cliente.status === "perdido" ? (
            <Badge className="bg-red-100 text-red-800 border-red-200">Lead Perdido</Badge>
          ) : (
            <Badge className="bg-blue-50 text-navy border-blue-100">Em Andamento</Badge>
          )}
        </div>

        {cliente.status === "perdido" ? (
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
            <div className="space-y-1">
              <span className="text-xs text-red-800 font-bold block">🚨 Lead Marcado como Perdido</span>
              <p className="text-[11px] text-slate-600">
                Motivo: <strong className="text-red-700">{MOTIVO_PERDA_OPTIONS.find(o => o.value === cliente.motivo_perda)?.label || cliente.motivo_perda}</strong>
                {cliente.observacao_perda && ` — "${cliente.observacao_perda}"`}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => updateStatus("novo")}
              className="bg-navy hover:bg-navy-deep text-white font-semibold flex items-center gap-1 h-8 text-xs px-4"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reativar Lead
            </Button>
          </div>
        ) : (
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2 pt-2 pb-2">
            {/* Linha conectora de fundo */}
            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 md:left-4 md:right-4 md:top-1/2 md:bottom-auto md:w-auto md:h-1 bg-slate-100 -translate-y-1/2 z-0 hidden md:block" />
            
            {/* Lista de passos da Timeline */}
            {[
              { idx: 1, label: "Lead / Prospecção", status: "novo", active: ["novo", "contato"], completed: ["proposta_enviada", "negociacao", "contrato_assinado", "visita_agendada", "instalacao", "concluido"], icon: Inbox },
              { idx: 2, label: "Proposta Comercial", status: "proposta_enviada", active: ["proposta_enviada", "negociacao"], completed: ["contrato_assinado", "visita_agendada", "instalacao", "concluido"], icon: FileText },
              { idx: 3, label: "Contrato Assinado", status: "contrato_assinado", active: ["contrato_assinado"], completed: ["visita_agendada", "instalacao", "concluido"], icon: FileSignature },
              { idx: 4, label: "Vistoria & Engenharia", status: "instalacao", active: ["visita_agendada", "instalacao"], completed: ["concluido"], icon: Wrench },
              { idx: 5, label: "Ativação & Ligação", status: "concluido", active: ["concluido"], completed: [], icon: Zap },
            ].map((step) => {
              const isCompleted = step.completed.includes(cliente.status);
              const isActive = step.active.includes(cliente.status);
              
              let colorClasses = "bg-slate-50 border-slate-200 text-slate-400";
              let labelClasses = "text-slate-400 font-semibold";
              
              if (isCompleted) {
                colorClasses = "bg-emerald-500 border-emerald-500 text-white shadow-sm";
                labelClasses = "text-emerald-700 font-bold";
              } else if (isActive) {
                colorClasses = "bg-sun border-sun text-navy font-bold shadow-md scale-110 z-10 ring-4 ring-sun/20";
                labelClasses = "text-navy font-extrabold";
              }

              const Icon = step.icon;

              return (
                <button
                  key={step.idx}
                  onClick={() => updateStatus(step.status)}
                  className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 w-full text-left md:text-center z-10 group cursor-pointer focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${colorClasses} group-hover:opacity-90`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-[9px] uppercase tracking-wider block font-bold text-navy/40`}>Etapa {step.idx}</span>
                    <span className={`text-xs block ${labelClasses} truncate max-w-[130px]`}>{step.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5 border-0 shadow-md">
        <Label>Status do funil</Label>
        <Select value={cliente.status} onValueChange={updateStatus}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
        </Select>
        {cliente.motivo_perda && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Motivo de perda:</strong> {MOTIVO_PERDA_OPTIONS.find(o => o.value === cliente.motivo_perda)?.label || cliente.motivo_perda}</span>
          </div>
        )}
      </Card>

      {/* WORKFLOW DE FECHAMENTO DE CONTRATO & CRÉDITO FINANCEIRO (Condicional) */}
      {exibirFluxoContrato && (
        <Card className="border-0 shadow-md overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-navy via-navy-deep to-slate-900 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-sun animate-pulse" />
              <div>
                <h3 className="font-extrabold text-sm">Fechamento de Venda: Contrato & Financiamento</h3>
                <p className="text-[10px] text-slate-300">Coleta de documentação, simulação de parcelas e geração da minuta legal.</p>
              </div>
            </div>
            <Badge className="bg-sun text-navy font-extrabold text-[10px] tracking-wider uppercase">Fase do Contrato</Badge>
          </div>

          {/* Abas internas do Fechamento */}
          <div className="flex border-b text-xs font-bold text-slate-500 bg-slate-50">
            <button
              onClick={() => setContratoTab("dados")}
              className={`flex-1 py-3 text-center border-b-2 transition ${contratoTab === "dados" ? "border-navy text-navy bg-white" : "border-transparent hover:text-navy"}`}
            >
              1. Faturamento & UC
            </button>
            <button
              onClick={() => setContratoTab("financiamento")}
              className={`flex-1 py-3 text-center border-b-2 transition ${contratoTab === "financiamento" ? "border-navy text-navy bg-white" : "border-transparent hover:text-navy"}`}
            >
              2. Forma de Pagamento / Crédito
            </button>
            <button
              onClick={() => setContratoTab("documentos")}
              className={`flex-1 py-3 text-center border-b-2 transition ${contratoTab === "documentos" ? "border-navy text-navy bg-white" : "border-transparent hover:text-navy"}`}
            >
              3. Envio de Documentos
            </button>
            <button
              onClick={() => setContratoTab("minuta")}
              className={`flex-1 py-3 text-center border-b-2 transition ${contratoTab === "minuta" ? "border-navy text-navy bg-white" : "border-transparent hover:text-navy"}`}
            >
              4. Minuta de Contrato
            </button>
          </div>

          <div className="p-6">
            {/* TAB 1: DADOS DO CONTRATO (PF / PJ) */}
            {contratoTab === "dados" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center flex-wrap gap-2 border-b pb-3">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Building className="w-4 h-4" /> Qualificação do Contratante</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border">
                    <button
                      onClick={() => setContratoTipo("pf")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${contratoTipo === "pf" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}
                    >
                      Pessoa Física
                    </button>
                    <button
                      onClick={() => setContratoTipo("pj")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${contratoTipo === "pj" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}
                    >
                      Pessoa Jurídica
                    </button>
                  </div>
                </div>

                {contratoTipo === "pf" ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">CPF *</Label>
                      <Input placeholder="Ex: 000.000.000-00" value={docCpf} onChange={(e) => setDocCpf(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">RG *</Label>
                      <Input placeholder="Ex: 12.345.678-9" value={docRg} onChange={(e) => setDocRg(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Data de Nascimento *</Label>
                      <Input type="date" value={docNasc} onChange={(e) => setDocNasc(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Profissão</Label>
                      <Input placeholder="Ex: Engenheiro" value={docProfissao} onChange={(e) => setDocProfissao(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">CNPJ *</Label>
                      <Input placeholder="Ex: 00.000.000/0001-00" value={docCnpj} onChange={(e) => setDocCnpj(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Razão Social *</Label>
                      <Input placeholder="Ex: Comercial Solar LTDA" value={docRazao} onChange={(e) => setDocRazao(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Inscrição Estadual (IE)</Label>
                      <Input placeholder="Ex: Isento ou 123.456.789" value={docIe} onChange={(e) => setDocIe(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Representante Legal (Nome) *</Label>
                      <Input placeholder="Ex: José Santos" value={docRepresentante} onChange={(e) => setDocRepresentante(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4 space-y-4">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Dados Técnicos da Unidade Consumidora (UC)</span>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Número da UC *</Label>
                      <Input placeholder="Ex: 123456789" value={docUc} onChange={(e) => setDocUc(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Titular da Conta de Luz *</Label>
                      <Input placeholder="Caso seja diferente do contratante" value={docTitular} onChange={(e) => setDocTitular(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Concessionária de Energia *</Label>
                      <Input placeholder="Ex: Enel, CPFL, Cemig" value={docConcessionaria} onChange={(e) => setDocConcessionaria(e.target.value)} className="h-9 text-xs mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button onClick={salvarDadosContrato} className="bg-navy hover:bg-navy-deep text-white text-xs h-9 font-bold px-6">Salvar Dados Cadastrais</Button>
                </div>
              </div>
            )}

            {/* TAB 2: FINANCEIRAS & CRÉDITO */}
            {contratoTab === "financiamento" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center flex-wrap gap-2 border-b pb-3">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Landmark className="w-4 h-4" /> Forma de Pagamento Preferencial</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border">
                    <button
                      onClick={() => setFinFormaPagamento("financiamento")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${finFormaPagamento === "financiamento" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}
                    >
                      🏦 Financiamento
                    </button>
                    <button
                      onClick={() => setFinFormaPagamento("vista")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${finFormaPagamento === "vista" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}
                    >
                      💰 À Vista (5% Desc)
                    </button>
                    <button
                      onClick={() => setFinFormaPagamento("outro")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${finFormaPagamento === "outro" ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}
                    >
                      💳 Outro
                    </button>
                  </div>
                </div>

                {finFormaPagamento === "financiamento" ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Instituição Financeira</Label>
                        <Select value={finBanco} onValueChange={setFinBanco}>
                          <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solfacil">🏦 Solfácil (Juros HSL)</SelectItem>
                            <SelectItem value="bv">🏢 BV Financeira Solar</SelectItem>
                            <SelectItem value="santander">🏛️ Santander Financiamentos</SelectItem>
                            <SelectItem value="sicredi">🤝 Cooperativa Sicredi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Valor do Financiamento (R$)</Label>
                        <Input type="number" value={finValor} onChange={(e) => setFinValor(e.target.value)} className="h-9 text-xs mt-1 font-bold text-navy" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Prazo (Parcelas)</Label>
                        <Select value={finPrazo} onValueChange={setFinPrazo}>
                          <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                            <SelectItem value="48">48 meses</SelectItem>
                            <SelectItem value="60">60 meses</SelectItem>
                            <SelectItem value="72">72 meses</SelectItem>
                            <SelectItem value="84">84 meses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Botão de Enviar Análise */}
                      <Button
                        onClick={simularAnaliseCredito}
                        disabled={finStatus === "analise"}
                        className="bg-sun hover:bg-sun-deep text-navy font-extrabold h-9 text-xs shadow-sm flex items-center justify-center gap-1 w-full"
                      >
                        {finStatus === "analise" ? "Processando..." : "Solicitar Análise 🚀"}
                      </Button>
                    </div>

                    {/* Status do Financiamento e Parcela */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 p-4 rounded-xl border flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground">Prestação Mensal Estimada (Tabela Price)</span>
                        <div className="text-2xl font-extrabold text-navy mt-1">
                          R$ {parcelaEstimada.toLocaleString("pt-BR")}/mês
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">* Taxa simulada de 1.25% a.m.</span>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-xl border bg-slate-50">
                        {finStatus === "pendente" && (
                          <>
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-700">Crédito Pendente</div>
                              <p className="text-[10px] text-muted-foreground">Clique em "Solicitar Análise" para enviar os dados bancários.</p>
                            </div>
                          </>
                        )}
                        {finStatus === "analise" && (
                          <>
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><RefreshCw className="w-5 h-5 animate-spin" /></div>
                            <div>
                              <div className="text-xs font-bold text-blue-800">Em Análise Técnica</div>
                              <p className="text-[10px] text-muted-foreground">Consultando órgãos de crédito e score do cliente...</p>
                            </div>
                          </>
                        )}
                        {finStatus === "aprovado" && (
                          <>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="w-5 h-5" /></div>
                            <div>
                              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">Crédito Aprovado! <Sparkles className="w-3.5 h-3.5 text-sun-deep" /></div>
                              <p className="text-[10px] text-muted-foreground">Assinatura facial liberada no WhatsApp do cliente.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600">
                    {finFormaPagamento === "vista" ? (
                      <p>📋 O faturamento será processado à vista via Pix ou transferência. Um desconto comercial de <strong>5%</strong> foi aplicado sobre o investimento solar do cliente.</p>
                    ) : (
                      <p>O faturamento será processado através de boleto parcelado ou cartão de crédito embutido conforme acordado na proposta.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DOCUMENTOS PARA UPLOAD */}
            {contratoTab === "documentos" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Upload className="w-4 h-4" /> Documentação do Faturamento</span>
                  <span className="text-[10px] text-muted-foreground">Requisitos essenciais exigidos pelas financeiras</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { key: "identidade", label: "Documento de Identificação", sub: "CNH ou RG (Frente/Verso)", required: true },
                    { key: "residencia", label: "Comprovante de Residência", sub: "Conta de água, luz ou telefone", required: true },
                    { key: "fatura", label: "Fatura de Energia Completa", sub: "Todas as páginas recentes", required: true },
                    { key: "renda", label: "Comprovante de Renda", sub: "Contracheques ou IR (Opcional)", required: false },
                    { key: "selfie", label: "Selfie com Documento", sub: "Para biometria das financeiras", required: false },
                  ].map((doc) => {
                    const file = docFiles[doc.key];
                    return (
                      <div key={doc.key} className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] bg-slate-50/50 hover:bg-white transition relative">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-navy leading-tight">{doc.label} {doc.required && <span className="text-red-500">*</span>}</span>
                            {file?.done && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground block">{doc.sub}</span>
                        </div>

                        <div className="mt-4">
                          {file ? (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-600 truncate max-w-[120px] font-semibold">{file.name}</span>
                                <span className="font-bold text-navy">{file.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${file.progress}%` }} />
                              </div>
                              {file.done && (
                                <button
                                  type="button"
                                  onClick={() => setDocFiles(prev => { const copy = { ...prev }; delete copy[doc.key]; return copy; })}
                                  className="text-[9px] text-red-500 font-bold uppercase hover:underline mt-1 block"
                                >
                                  Remover arquivo
                                </button>
                              )}
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-navy hover:bg-navy/5 transition-all text-center">
                              <Input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const name = e.target.files?.[0]?.name;
                                  if (name) simularUpload(doc.key, name);
                                }}
                              />
                              <Upload className="w-4 h-4 text-slate-400 mb-1" />
                              <span className="text-[9px] font-extrabold uppercase text-slate-600">Selecionar</span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: MINUTA CONTRATUAL */}
            {contratoTab === "minuta" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSignature className="w-5 h-5 text-sun-deep" />
                  <h3 className="font-bold text-navy text-sm">Geração de Minuta Contratual</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gerencie e emita o documento jurídico final contendo as cláusulas e o dimensionamento para entrega e homologação do sistema solar de <strong>{cliente.potencia_kwp || "5.4"} kWp</strong>.
                </p>
                <div className="bg-slate-50 p-4 border rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-xs font-bold text-navy block">Status de Documentação do Contrato</span>
                    <span className="text-[10px] text-muted-foreground">Qualificação legal e dados UC preenchidos.</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowMinutaModal(true)}
                      className="bg-navy hover:bg-navy-deep text-white font-semibold text-xs h-9 flex items-center gap-1 shadow-sm"
                    >
                      <Printer className="w-4 h-4" /> Visualizar Minuta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {editing ? (
        <Card className="p-6 border-0 shadow-md space-y-4">
          <h2 className="font-bold text-navy">Editar dados</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nome</Label><Input value={edit.nome || ""} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} /></div>
            <div><Label>Telefone</Label><Input value={edit.telefone || ""} onChange={(e) => setEdit({ ...edit, telefone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={edit.email || ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
            <div><Label>Cidade</Label><Input value={edit.cidade || ""} onChange={(e) => setEdit({ ...edit, cidade: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Endereço</Label><Input value={edit.endereco || ""} onChange={(e) => setEdit({ ...edit, endereco: e.target.value })} /></div>
            <div><Label>Consumo (kWh)</Label><Input type="number" value={edit.consumo_kwh || ""} onChange={(e) => setEdit({ ...edit, consumo_kwh: e.target.value })} /></div>
            <div><Label>Valor fatura</Label><Input type="number" value={edit.valor_fatura || ""} onChange={(e) => setEdit({ ...edit, valor_fatura: e.target.value })} /></div>
            <div><Label>Potência (kWp)</Label><Input type="number" value={edit.potencia_kwp || ""} onChange={(e) => setEdit({ ...edit, potencia_kwp: e.target.value })} /></div>
            <div><Label>Valor estimado</Label><Input type="number" value={edit.valor_estimado || ""} onChange={(e) => setEdit({ ...edit, valor_estimado: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Observações</Label><Textarea value={edit.observacoes || ""} onChange={(e) => setEdit({ ...edit, observacoes: e.target.value })} /></div>
          </div>
          <Button onClick={saveEdit} className="bg-navy hover:bg-navy-deep">Salvar</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 border-0 shadow-md">
            <h3 className="font-bold text-navy mb-3">Imóvel & Consumo</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Tipo" value={cliente.imovel_tipo} />
              <Row label="Endereço" value={cliente.endereco} />
              <Row label="Cidade" value={`${cliente.cidade || "—"} ${cliente.estado || ""}`} />
              <Row label="Concessionária" value={cliente.concessionaria} />
              <Row label="Consumo" value={cliente.consumo_kwh ? `${cliente.consumo_kwh} kWh/mês` : null} />
              <Row label="Fatura média" value={cliente.valor_fatura ? `R$ ${Number(cliente.valor_fatura).toLocaleString("pt-BR")}` : null} />
            </dl>
          </Card>
          <Card className="p-5 border-0 shadow-md">
            <h3 className="font-bold text-navy mb-3">Projeto</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Potência" value={cliente.potencia_kwp ? `${cliente.potencia_kwp} kWp` : null} />
              <Row label="Valor estimado" value={cliente.valor_estimado ? `R$ ${Number(cliente.valor_estimado).toLocaleString("pt-BR")}` : null} />
              <Row label="Pagamento" value={cliente.forma_pagamento} />
              <Row label="Payback" value={cliente.payback_anos ? `${cliente.payback_anos} anos` : null} />
            </dl>
            {cliente.observacoes && <div className="mt-4 p-3 bg-amber-50 rounded text-sm">{cliente.observacoes}</div>}
          </Card>
        </div>
      )}

      <Card className="p-5 border-0 shadow-md">
        <h3 className="font-bold text-navy mb-3">Timeline de interações</h3>
        <div className="space-y-3 mb-4">
          <Select value={novaInt.tipo} onValueChange={(v) => setNovaInt({ ...novaInt, tipo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ligacao">📞 Ligação</SelectItem>
              <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
              <SelectItem value="email">✉️ Email</SelectItem>
              <SelectItem value="visita">🏠 Visita</SelectItem>
              <SelectItem value="proposta">📄 Proposta</SelectItem>
              <SelectItem value="nota">📝 Nota</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="Descreva a interação…" value={novaInt.descricao} onChange={(e) => setNovaInt({ ...novaInt, descricao: e.target.value })} />
          <Button onClick={addInteracao} disabled={!novaInt.descricao} className="bg-sun-deep text-navy hover:bg-sun">Registrar</Button>
        </div>
        <div className="space-y-3 border-t pt-4">
          {interacoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma interação registrada ainda.</p>}
          {interacoes.map((i) => (
            <div key={i.id} className={`border-l-2 pl-3 py-1 ${i.tipo === "nota" && i.descricao?.startsWith("Status alterado") ? "border-blue-400 bg-blue-50/50 rounded-r-lg" : "border-sun"}`}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{i.tipo}</Badge>
                {new Date(i.created_at).toLocaleString("pt-BR")}
              </div>
              <p className="text-sm mt-1">{i.descricao}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed pb-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-navy text-right">{value || "—"}</dd>
    </div>
  );
}
