import { BRL, NUM } from "@/lib/proposta-calc";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Sun, Zap, TrendingDown, Leaf, ShieldCheck, Clock, Home, Award, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/esol-logo.png";

export interface PropostaViewProps {
  proposta: any;
  parceiro?: { nome?: string; email?: string; telefone?: string; avatar_url?: string };
  cliente?: { nome?: string; cidade?: string; estado?: string };
  publico?: boolean;
  onAceitar?: () => void;
  onRecusar?: () => void;
}

export function PropostaView({ proposta: p, parceiro, cliente, publico, onAceitar, onRecusar }: PropostaViewProps) {
  const inflacao = 0.08;
  const chartData = Array.from({ length: 25 }, (_, i) => ({
    ano: `${i + 1}`,
    economia: Math.round(Number(p.economia_anual) * Math.pow(1 + inflacao, i)),
  }));

  const validadeDias = p.validade_dias || 15;
  const expiraEm = p.expires_at ? new Date(p.expires_at) : null;

  return (
    <div className="bg-white text-ink">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#001F5C] via-[#0a2d6e] to-[#001533] text-white px-6 md:px-12 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-sun/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-sun/10 blur-3xl" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <img src={logo} alt="ESOL Energy" className="h-12 w-auto brightness-0 invert" />
            <div className="text-right text-sm">
              <div className="text-white/60">Proposta nº</div>
              <div className="font-mono font-bold">{String(p.id || "").slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div>
              <div className="inline-flex items-center gap-2 bg-sun/20 text-sun px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <Sun className="w-3.5 h-3.5" /> PROPOSTA DE ENERGIA SOLAR
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-3">
                Olá <span className="text-sun">{cliente?.nome?.split(" ")[0] || "cliente"}</span>,
                <br />pronto para economizar até <span className="text-sun">95%</span> na conta de luz?
              </h1>
              <p className="text-white/70 text-lg">
                Sistema solar fotovoltaico dimensionado exclusivamente para o seu consumo de <strong className="text-white">{NUM(Number(p.consumo_kwh))} kWh/mês</strong>.
              </p>
            </div>

            {parceiro && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/15">
                <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Seu consultor</div>
                <div className="flex items-center gap-3">
                  {parceiro.avatar_url ? (
                    <img src={parceiro.avatar_url} alt={parceiro.nome} className="w-14 h-14 rounded-full object-cover border-2 border-sun" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-sun text-navy font-bold flex items-center justify-center text-lg">
                      {parceiro.nome?.[0]?.toUpperCase() || "E"}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{parceiro.nome || "Consultor ESOL"}</div>
                    {parceiro.telefone && <div className="text-sm text-white/70 flex items-center gap-1"><Phone className="w-3 h-3" />{parceiro.telefone}</div>}
                    {parceiro.email && <div className="text-xs text-white/60 flex items-center gap-1"><Mail className="w-3 h-3" />{parceiro.email}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={Zap} label="Sistema" value={`${NUM(Number(p.kwp_sistema), 2)} kWp`} />
          <Stat icon={TrendingDown} label="Economia/mês" value={BRL(Number(p.economia_mensal))} highlight />
          <Stat icon={Clock} label="Payback" value={`${(Number(p.payback_meses) / 12).toFixed(1)} anos`} />
          <Stat icon={Leaf} label="CO₂ evitado" value={`${NUM(Number(p.co2_evitado_ton), 1)} t`} />
        </div>
      </section>

      {/* ECONOMIA 25 ANOS */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-widest text-sun-deep font-bold mb-2">A grande virada</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">
            Você vai economizar <span className="text-sun-deep">{BRL(Number(p.economia_25_anos))}</span>
          </h2>
          <p className="text-muted-foreground mt-2">Em 25 anos com inflação energética projetada de 8% ao ano</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 md:p-6 border shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => BRL(Number(v))} labelFormatter={(l) => `Ano ${l}`} />
              <Bar dataKey="economia" fill="hsl(48, 95%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SISTEMA TÉCNICO */}
      <section className="bg-slate-50 py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-6">Seu sistema dimensionado</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <SpecCard title="Geração & Consumo">
              <Row label="Consumo informado" value={`${NUM(Number(p.consumo_kwh))} kWh/mês`} />
              <Row label="Geração estimada" value={`${NUM(Number(p.geracao_mensal_kwh))} kWh/mês`} highlight />
              <Row label="Tarifa considerada" value={BRL(Number(p.tarifa_kwh)) + "/kWh"} />
              <Row label="HSP da região" value={`${Number(p.hsp).toFixed(1)} h`} />
            </SpecCard>
            <SpecCard title="Equipamentos">
              <Row label="Potência total" value={`${NUM(Number(p.kwp_sistema), 2)} kWp`} highlight />
              <Row label="Painéis solares" value={`${p.qtd_modulos} × ${p.potencia_modulo_w}W`} />
              <Row label="Inversor(es)" value={`${p.qtd_inversores} × ${Number(p.potencia_inversor_kw || 0).toFixed(1)} kW`} />
              <Row label="Área necessária" value={`~${NUM(Number(p.area_necessaria_m2), 1)} m²`} />
            </SpecCard>
            <SpecCard title="Retorno do investimento">
              <Row label="Economia/mês" value={BRL(Number(p.economia_mensal))} />
              <Row label="Economia/ano" value={BRL(Number(p.economia_anual))} />
              <Row label="Payback" value={`${(Number(p.payback_meses) / 12).toFixed(1)} anos`} highlight />
              <Row label="Economia em 25 anos" value={BRL(Number(p.economia_25_anos))} />
            </SpecCard>
          </div>
        </div>
      </section>

      {/* INVESTIMENTO */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="bg-gradient-to-br from-navy to-[#001533] text-white rounded-3xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-sun/20 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-sm uppercase tracking-widest text-sun font-bold mb-2">Investimento total</div>
              <div className="font-display text-5xl md:text-6xl font-bold mb-2">{BRL(Number(p.preco_total))}</div>
              <div className="text-white/70">
                Equivale a <strong className="text-white">{BRL(Number(p.preco_por_wp))}/Wp</strong> instalado
              </div>
              {p.condicoes_pagamento && (
                <div className="mt-4 text-sm text-white/80 bg-white/10 rounded-lg p-3 border border-white/15">
                  <strong className="text-sun">Condições:</strong> {p.condicoes_pagamento}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <Bullet>Sistema completo: módulos, inversor, estrutura, cabeamento e conectores</Bullet>
              <Bullet>Projeto técnico e ART (Anotação de Responsabilidade Técnica)</Bullet>
              <Bullet>Homologação na concessionária local</Bullet>
              <Bullet>Instalação por equipe certificada</Bullet>
              <Bullet>Monitoramento via aplicativo</Bullet>
              <Bullet>Garantia de 25 anos nos módulos / 10 anos no inversor</Bullet>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / AÇÕES */}
      {publico && (
        <section className="max-w-5xl mx-auto px-6 md:px-12 pb-14">
          <div className="bg-white border-2 border-sun rounded-3xl p-8 text-center shadow-xl">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-navy mb-2">Pronto para começar a economizar?</h3>
            <p className="text-muted-foreground mb-6">Proposta válida por {validadeDias} dias{expiraEm ? ` (até ${expiraEm.toLocaleDateString("pt-BR")})` : ""}.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onAceitar} className="bg-sun hover:bg-sun-deep text-navy font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg hover:scale-105">
                ✅ Aceitar proposta
              </button>
              <button onClick={() => window.print()} className="bg-navy hover:bg-navy-deep text-white font-semibold px-6 py-4 rounded-xl transition">
                📄 Baixar PDF
              </button>
              <button onClick={onRecusar} className="border border-muted-foreground/30 text-muted-foreground hover:bg-slate-50 px-6 py-4 rounded-xl transition">
                Não tenho interesse
              </button>
            </div>
            {parceiro?.telefone && (
              <a
                href={`https://wa.me/55${parceiro.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${parceiro.nome}, recebi a proposta e gostaria de tirar uma dúvida.`)}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-navy hover:underline"
              >
                💬 Falar com {parceiro.nome?.split(" ")[0]} no WhatsApp
              </a>
            )}
          </div>
        </section>
      )}

      {/* GARANTIAS / CONFIANÇA */}
      <section className="bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Trust icon={ShieldCheck} title="25 anos" subtitle="Garantia dos módulos" />
          <Trust icon={Award} title="Certificada" subtitle="Equipe especializada" />
          <Trust icon={Home} title="Homologação" subtitle="Concessionária local" />
          <Trust icon={Leaf} title={`${p.arvores_equivalentes} árvores`} subtitle="Equivalente plantadas" />
        </div>
      </section>

      <footer className="bg-navy text-white/80 py-8 px-6 text-center text-sm">
        <img src={logo} alt="ESOL" className="h-8 w-auto brightness-0 invert mx-auto mb-3" />
        <div>ESOL Energy · CNPJ 60.129.009/0001-29</div>
        <div className="text-xs text-white/50 mt-1 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" /> Deixe o sol trabalhar por você
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-sun text-navy shadow-lg" : "bg-white border shadow"} text-center`}>
      <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-bold text-lg leading-tight">{value}</div>
    </div>
  );
}
function SpecCard({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm">
      <div className="text-xs uppercase tracking-wider text-sun-deep font-bold mb-3">{title}</div>
      <div className="space-y-2.5 text-sm">{children}</div>
    </div>
  );
}
function Row({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between gap-2 border-b border-dashed last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? "text-sun-deep" : "text-navy"}`}>{value}</span>
    </div>
  );
}
function Bullet({ children }: any) {
  return <div className="flex gap-2"><span className="text-sun">✓</span><span className="text-white/90">{children}</span></div>;
}
function Trust({ icon: Icon, title, subtitle }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="w-7 h-7 text-sun-deep" />
      <div className="font-bold text-navy">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
