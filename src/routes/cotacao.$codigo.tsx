import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, MessageCircle, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

export const Route = createFileRoute("/cotacao/$codigo")({
  head: () => ({ meta: [{ title: "Sua cotação — ESOL Energy" }] }),
  component: CotacaoPublica,
});

function CotacaoPublica() {
  const { codigo } = Route.useParams();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.rpc as any)("get_cotacao_publica", { _codigo: codigo });
      setD(data);
      setLoading(false);
    })();
  }, [codigo]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!d) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-xl text-navy font-bold">Cotação não encontrada</h1></div>;
  if (d.expirada) return <div className="min-h-screen flex items-center justify-center p-6 text-center"><div><h1 className="text-xl text-navy font-bold mb-2">Cotação expirada</h1><p className="text-muted-foreground">Solicite uma nova ao consultor.</p></div></div>;

  const { cotacao, kit, parceiro, cliente } = d;
  const total = Number(cotacao.preco_total);
  const tel = (parceiro?.telefone || "").replace(/\D/g, "");
  const wa = `https://wa.me/55${tel}?text=${encodeURIComponent(`Olá ${parceiro?.nome}, vi a cotação ${kit?.nome} e quero saber mais!`)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy text-white py-6 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl"><Sun className="text-sun" /> ESOL Energy</div>
          <Badge className="bg-sun text-navy">Cotação válida</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6 -mt-4">
        <Card className="p-6 shadow-xl">
          <p className="text-sm text-muted-foreground mb-1">Olá <strong className="text-navy">{cliente?.nome}</strong>,</p>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Sua cotação personalizada</h1>
          <p className="text-muted-foreground text-sm">Preparada por {parceiro?.nome} — ESOL Energy</p>
        </Card>

        <Card className="overflow-hidden shadow-xl">
          {kit?.imagem_url ? (
            <img src={kit.imagem_url} alt={kit.nome} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-sun/30 to-sun-deep/20 flex items-center justify-center">
              <Sun className="w-24 h-24 text-sun-deep" />
            </div>
          )}
          <div className="p-6">
            <Badge className="bg-sun text-navy mb-3">{kit?.potencia_kwp} kWp</Badge>
            <h2 className="text-2xl font-bold text-navy mb-4">{kit?.nome}</h2>

            <div className="grid md:grid-cols-2 gap-3 mb-6 text-sm">
              <Item label="Módulos" v={`${kit?.quantidade_modulos}x ${kit?.fabricante_modulos || ""} ${kit?.potencia_modulo_w}W`} />
              <Item label="Inversor" v={kit?.inversor} />
              <Item label="Tecnologia" v={kit?.tecnologia_modulo} />
              <Item label="Eficiência" v={`${kit?.eficiencia_modulo}%`} />
              <Item label="Garantia módulos" v={`${kit?.garantia_modulos_anos} anos`} />
              <Item label="Garantia inversor" v={`${kit?.garantia_inversor_anos} anos`} />
            </div>

            <div className="bg-gradient-to-r from-sun/20 to-sun-deep/10 rounded-xl p-6 text-center mb-4">
              <div className="text-sm text-muted-foreground">Investimento total</div>
              <div className="text-4xl font-extrabold text-navy">{BRL(total)}</div>
              <div className="text-xs text-muted-foreground mt-1">{cotacao.quantidade}x · {BRL(Number(cotacao.preco_unit))} cada</div>
            </div>

            {cotacao.observacoes && (
              <div className="text-sm text-muted-foreground mb-4 p-3 bg-slate-50 rounded-lg whitespace-pre-wrap">{cotacao.observacoes}</div>
            )}

            <a href={wa} target="_blank" rel="noreferrer">
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-base h-14">
                <MessageCircle className="w-5 h-5 mr-2" /> Quero saber mais (WhatsApp)
              </Button>
            </a>

            <Button onClick={() => window.print()} variant="outline" className="w-full mt-2">
              Imprimir / Salvar PDF
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
          <Selo icon={ShieldCheck} text="Equipamentos Tier 1" />
          <Selo icon={Clock} text="Instalação rápida" />
          <Selo icon={CheckCircle} text="Garantia completa" />
        </div>

        <p className="text-center text-xs text-muted-foreground py-4">
          Cotação preparada por {parceiro?.nome} • Válida até {new Date(cotacao.expires_at).toLocaleDateString("pt-BR")}
        </p>
      </main>
    </div>
  );
}

function Item({ label, v }: any) { return (<div className="flex justify-between border-b border-dashed py-1"><span className="text-muted-foreground">{label}</span><span className="font-medium text-navy text-right">{v || "—"}</span></div>); }
function Selo({ icon: I, text }: any) { return (<div className="bg-white rounded-lg p-3 shadow-sm"><I className="w-5 h-5 mx-auto mb-1 text-sun-deep" /><div>{text}</div></div>); }
