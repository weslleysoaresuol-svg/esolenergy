import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { MessageCircle, ArrowLeft, Trash2, FileSpreadsheet, Star, Gift, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/cliente/$id")({
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

  const load = async () => {
    const { data, error } = await supabase.from("clientes").select("*, profiles:corretor_id(nome,email)").eq("id", id).maybeSingle();
    if (error) {
      console.error("Erro ao carregar detalhes do cliente (tentando fallback):", error);
      const { data: fallbackData } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
      setCliente(fallbackData);
      setEdit(fallbackData || {});
    } else {
      setCliente(data);
      setEdit(data || {});
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

  if (loading) return <div className="text-muted-foreground">Carregando…</div>;
  if (!cliente) return <div>Cliente não encontrado. <Link to="/app" className="text-sun-deep">Voltar</Link></div>;

  const whatsapp = cliente.telefone ? `https://wa.me/${cliente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${cliente.nome?.split(" ")[0]}, tudo bem? Aqui é da ESOL Energy. Quero conversar sobre energia solar para você! 🌞`)}` : null;

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

      {/* Card de Pós-Venda (apenas concluídos) */}
      {cliente.status === "concluido" && (
        <Card className="p-5 border-0 shadow-md border-l-4 border-l-emerald-500 bg-emerald-50/30">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-800">Pós-venda — Instalação concluída!</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* NPS */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2">
                {cliente.nps_score != null ? `NPS registrado: ${cliente.nps_score}/10 ⭐` : "Como foi a experiência? (NPS 0-10)"}
              </p>
              {cliente.nps_score == null ? (
                <div className="space-y-3">
                  <div className="flex gap-1 flex-wrap">
                    {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNpsScore(n)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition ${npsScore === n ? "bg-navy text-white border-navy" : "border-slate-200 hover:border-navy"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>😞 Péssimo</span><span>😍 Excelente</span>
                  </div>
                  <Button size="sm" onClick={saveNps} disabled={npsScore === null} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar NPS</Button>
                </div>
              ) : (
                <div className={`text-3xl font-extrabold ${cliente.nps_score >= 9 ? "text-emerald-600" : cliente.nps_score >= 7 ? "text-amber-500" : "text-red-500"}`}>
                  {cliente.nps_score}/10
                </div>
              )}
            </div>
            {/* Indicação */}
            <div>
              <p className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-500" />
                Pedir indicação
              </p>
              <p className="text-xs text-muted-foreground mb-3">Envie uma mensagem personalizada pelo WhatsApp pedindo indicação de amigos e familiares.</p>
              {whatsapp && (
                <a
                  href={`https://wa.me/${cliente.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${cliente.nome?.split(" ")[0]}! Esperamos que seu sistema solar esteja gerando muita economia! 🌞⚡\n\nVocê conhece alguém que também gostaria de economizar na conta de luz? Adoraríamos ajudar! Pode nos indicar? Qualquer dúvida estou à disposição. 😊`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-600"
                >
                  <MessageCircle className="w-4 h-4" />Pedir indicação via WhatsApp
                </a>
              )}
            </div>
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
