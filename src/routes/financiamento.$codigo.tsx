import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, MessageCircle, FileCheck, Clock, ShieldCheck, CheckCircle2, XCircle, Loader2, Landmark } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

export const Route = createFileRoute("/financiamento/$codigo")({
  head: () => ({ meta: [{ title: "Status do seu financiamento — ESOL Energy" }] }),
  component: FinPublica,
});

const ETAPAS = [
  { k: "aguardando_documentos", label: "Documentos enviados", icon: FileCheck },
  { k: "em_analise", label: "Em análise pelo banco", icon: Loader2 },
  { k: "pre_aprovado", label: "Pré-aprovado", icon: ShieldCheck },
  { k: "aprovado", label: "Aprovado", icon: CheckCircle2 },
  { k: "contrato_assinado", label: "Contrato assinado", icon: FileCheck },
  { k: "liberado", label: "Crédito liberado", icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
  aguardando_documentos: 0, em_analise: 1, pre_aprovado: 2,
  aprovado: 3, contrato_assinado: 4, liberado: 5,
};

function FinPublica() {
  const { codigo } = Route.useParams();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.rpc as any)("get_financiamento_publico", { _codigo: codigo });
      setD(data);
      setLoading(false);
    })();
  }, [codigo]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!d) return <div className="min-h-screen flex items-center justify-center p-6 text-center"><div><h1 className="text-xl text-navy font-bold mb-2">Status indisponível</h1><p className="text-muted-foreground">Fale com seu consultor.</p></div></div>;

  const { financiamento: f, parceiro, cliente } = d;
  const recusado = f.status === "recusado";
  const cancelado = f.status === "cancelado";
  const stepAtual = STATUS_ORDER[f.status] ?? 0;
  const tel = (parceiro?.telefone || "").replace(/\D/g, "");
  const wa = `https://wa.me/55${tel}?text=${encodeURIComponent(`Olá ${parceiro?.nome}, sobre meu financiamento solar…`)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy text-white py-6 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl"><Sun className="text-sun" /> ESOL Energy</div>
          <Badge className="bg-blue-500 text-white"><Landmark className="w-3 h-3 mr-1" /> Financiamento</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-5 -mt-4">
        <Card className="p-6 shadow-xl">
          <p className="text-sm text-muted-foreground">Olá <strong className="text-navy">{cliente?.nome}</strong></p>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mt-1">
            {recusado ? "Análise concluída" : cancelado ? "Solicitação cancelada" : "Acompanhe seu financiamento"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Solicitado em {new Date(f.created_at).toLocaleDateString("pt-BR")}
            {f.banco && ` • ${f.banco}`}
            {f.financeira && ` (${f.financeira})`}
          </p>
        </Card>

        {recusado ? (
          <Card className="p-6 border-2 border-rose-200 bg-rose-50 text-center">
            <XCircle className="w-14 h-14 mx-auto text-rose-500 mb-3" />
            <h2 className="text-xl font-bold text-rose-900 mb-2">Análise não aprovada</h2>
            <p className="text-sm text-rose-800 mb-4">{f.observacoes_cliente || "Infelizmente o crédito não foi aprovado neste momento. Vamos tentar outras opções."}</p>
            <a href={wa} target="_blank" rel="noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700"><MessageCircle className="w-4 h-4 mr-2" /> Falar com {parceiro?.nome}</Button>
            </a>
          </Card>
        ) : (
          <Card className="p-6 shadow-xl">
            <h2 className="font-bold text-navy mb-5">Status da análise</h2>
            <div className="space-y-4">
              {ETAPAS.map((etapa, i) => {
                const concluido = i < stepAtual;
                const atual = i === stepAtual;
                const Icon = etapa.icon;
                return (
                  <div key={etapa.k} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${concluido ? "bg-emerald-500 text-white" : atual ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                      <Icon className={`w-5 h-5 ${atual && etapa.k === "em_analise" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className={`font-semibold ${concluido || atual ? "text-navy" : "text-slate-400"}`}>{etapa.label}</div>
                      {atual && <div className="text-xs text-blue-600 mt-0.5">⏳ Etapa atual</div>}
                    </div>
                    {i < ETAPAS.length - 1 && (
                      <div className={`absolute ml-5 mt-10 h-6 w-0.5 ${concluido ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {!recusado && (f.valor_aprovado || f.parcelas) && (
          <Card className="p-6 shadow-xl bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
            <h2 className="font-bold text-navy mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-600" /> Condições liberadas</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {f.valor_aprovado && <Box label="Valor aprovado" v={BRL(Number(f.valor_aprovado))} />}
              {f.parcelas && <Box label="Parcelas" v={`${f.parcelas}x`} />}
              {f.parcela_mensal && <Box label="Parcela mensal" v={BRL(Number(f.parcela_mensal))} />}
              {f.taxa_juros_am && <Box label="Taxa de juros" v={`${Number(f.taxa_juros_am).toFixed(2)}% a.m.`} />}
              {f.carencia_dias != null && f.carencia_dias > 0 && <Box label="Carência" v={`${f.carencia_dias} dias`} />}
              {f.banco && <Box label="Banco" v={f.banco} />}
            </div>
          </Card>
        )}

        {f.observacoes_cliente && !recusado && (
          <Card className="p-5 bg-amber-50 border-amber-200">
            <div className="text-sm font-semibold text-amber-900 mb-1">📝 Mensagem do consultor</div>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{f.observacoes_cliente}</p>
          </Card>
        )}

        <Card className="p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">Dúvidas? Fale direto com {parceiro?.nome}</p>
          <a href={wa} target="_blank" rel="noreferrer">
            <Button className="bg-emerald-600 hover:bg-emerald-700"><MessageCircle className="w-4 h-4 mr-2" /> Abrir WhatsApp</Button>
          </a>
        </Card>

        <p className="text-center text-xs text-muted-foreground py-4">ESOL Energy — atualizado em {new Date(f.updated_at).toLocaleString("pt-BR")}</p>
      </main>
    </div>
  );
}

function Box({ label, v }: { label: string; v: string }) {
  return (<div className="bg-white rounded-lg p-3 shadow-sm"><div className="text-xs text-muted-foreground">{label}</div><div className="font-bold text-navy text-lg">{v}</div></div>);
}
