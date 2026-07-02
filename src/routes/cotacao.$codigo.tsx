import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, MessageCircle, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { obterComponentesKit } from "@/lib/kits-fallback";

export const Route = createFileRoute("/cotacao/$codigo")({
  head: () => ({
    meta: [
      { title: "Sua cotação — ESOL Energy" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
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
  const kitData = kit || cotacao.kit_snapshot;
  const total = Number(cotacao.preco_total);
  const tel = (parceiro?.telefone || "").replace(/\D/g, "");
  const wa = `https://wa.me/55${tel}?text=${encodeURIComponent(`Olá ${parceiro?.nome}, vi a cotação ${kitData?.nome} e quero saber mais!`)}`;

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
          <div className="h-64 bg-slate-50 border-b flex items-center justify-center p-4">
            <img 
              src={
                kitData?.imagem_url || (
                  kitData?.faixa === "rural" 
                    ? "/kits/kit-rural.png" 
                    : Number(kitData?.potencia_kwp) <= 4.4 
                      ? "/kits/kit-residencial-pequeno.png" 
                      : Number(kitData?.potencia_kwp) <= 12.1 
                        ? "/kits/kit-residencial-grande.png" 
                        : "/kits/kit-comercial-industrial.png"
                )
              } 
              alt={kitData?.nome} 
              className="max-h-full max-w-full object-contain mx-auto"
              onError={(e) => {
                (e.target as any).src = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80";
              }}
            />
          </div>
          <div className="p-6">
            <Badge className="bg-sun text-navy mb-3">{kitData?.potencia_kwp} kWp</Badge>
            <h2 className="text-2xl font-bold text-navy mb-4">{kitData?.nome}</h2>

            <div className="grid md:grid-cols-2 gap-3 mb-6 text-sm">
              <Item label="Módulos" v={`${kitData?.quantidade_modulos}x ${kitData?.fabricante_modulos || ""} ${kitData?.potencia_modulo_w}W`} />
              <Item label="Inversor" v={kitData?.inversor} />
              <Item label="Tecnologia" v={kitData?.tecnologia_modulo} />
              <Item label="Distribuidora / CD" v={kitData?.fornecedor || "Aldo Solar"} />
              <Item label="Garantia módulos" v={`${kitData?.garantia_modulos_anos} anos`} />
              <Item label="Garantia inversor" v={`${kitData?.garantia_inversor_anos} anos`} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-6 font-sans">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">💰 À Vista (PIX / TED)</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{BRL(total * 0.95)}</div>
                <span className="text-[9px] text-emerald-600 block mt-0.5">5% de desconto já aplicado (De: {BRL(total)})</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <div className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">💳 Cartão de Crédito</div>
                <div className="text-2xl font-black text-navy mt-1">10x de {BRL(total / 10)}</div>
                <span className="text-[9px] text-blue-600 block mt-0.5">Sem juros no cartão (Total: {BRL(total)})</span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground mb-4">
              Quantidade solicitada: {cotacao.quantidade}x • Preço unitário de tabela: {BRL(Number(cotacao.preco_unit))}
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

        {/* Componentes inclusos */}
        <Card className="p-6 shadow-xl space-y-4 bg-white print-no-break">
          <h3 className="font-bold text-navy text-base flex items-center gap-2 border-b pb-2">
            📦 Componentes e Acessórios Inclusos no Gerador
          </h3>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {obterComponentesKit(kitData).map((item: string, idx: number) => {
              let icon = "⚡";
              if (idx === 0) icon = "☀️"; // placas
              if (idx === 1) icon = "📟"; // inversor
              if (idx === 2) icon = "🛠️"; // estrutura
              if (idx === 3) icon = "🔌"; // cabos
              if (idx === 4) icon = "🔗"; // mc4
              if (idx === 5) icon = "🛡️"; // string box

              return (
                <div key={idx} className="flex gap-2.5 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <span className="text-base shrink-0 mt-0.5">{icon}</span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-navy block text-[10px] uppercase text-slate-400">
                      {idx === 0 && "Módulos Fotovoltaicos"}
                      {idx === 1 && "Inversor / Conversor"}
                      {idx === 2 && "Estrutura de Fixação"}
                      {idx === 3 && "Cabeamento de Descida"}
                      {idx === 4 && "Conectores Rápidos"}
                      {idx === 5 && "Proteções String Box"}
                    </span>
                    <span className="leading-normal font-medium">{item}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 border-t pt-2 leading-relaxed">
            * Nota: A Esol Energy fornece apenas marcas líderes de mercado. Cabos, conectores e acessórios elétricos são certificados e dimensionados em conformidade com as normas NBR 5410 e NBR 16690.
          </p>
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
