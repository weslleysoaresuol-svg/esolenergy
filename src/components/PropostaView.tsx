import { useState, useMemo } from "react";
import { BRL, NUM } from "@/lib/proposta-calc";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sun, Zap, TrendingDown, Leaf, ShieldCheck, Clock, Home, Award, Phone, Mail, MapPin,
  Scale, Coins, Info, Percent, PiggyBank, ThumbsUp, AlertTriangle
} from "lucide-react";
import logo from "@/assets/esol-logo.png";
import { obterComponentesKit } from "@/lib/kits-fallback";

export interface PropostaViewProps {
  proposta: any;
  parceiro?: { nome?: string; email?: string; telefone?: string; avatar_url?: string };
  cliente?: { nome?: string; cidade?: string; estado?: string };
  publico?: boolean;
  onAceitar?: () => void;
  onRecusar?: () => void;
}

export function PropostaView({ proposta: p, parceiro, cliente, publico, onAceitar, onRecusar }: PropostaViewProps) {
  const componentesKit = useMemo(() => {
    return obterComponentesKit({
      quantidade_modulos: p.qtd_modulos,
      potencia_kwp: p.kwp_sistema,
      fabricante_modulos: p.kit_fabricante_modulos,
      inversor: p.kit_inversor,
      tecnologia_modulo: p.kit_tecnologia_modulo,
      garantia_inversor_anos: p.kit_garantia_inversor_anos,
      tipo_inversor: p.kit_tipo_inversor
    });
  }, [p]);

  const FINANCEIRAS = {
    solfacil: {
      nome: "Solfácil",
      taxaNominal: 1.19,
      cetMensal: 1.29,
      cetAnual: 16.62,
      label: "Solfácil Solar",
      info: "Fintech especialista em energia solar. Sem taxa de abertura de crédito (TAC)."
    },
    bv: {
      nome: "BV Financeira",
      taxaNominal: 1.29,
      cetMensal: 1.39,
      cetAnual: 18.02,
      label: "Banco BV",
      info: "Crédito ágil com carência de até 120 dias para o primeiro pagamento."
    },
    santander: {
      nome: "Santander",
      taxaNominal: 1.35,
      cetMensal: 1.45,
      cetAnual: 18.86,
      label: "Santander",
      info: "Financiamento tradicional em boleto ou débito direto."
    },
    sicredi: {
      nome: "Sicredi",
      taxaNominal: 1.15,
      cetMensal: 1.24,
      cetAnual: 15.94,
      label: "Sicredi (Cooperativa)",
      info: "Condições diferenciadas exclusivas para associados da cooperativa."
    }
  };

  // Extração das tags de faturamento da proposta
  const condText = p.condicoes_pagamento || "";
  
  // Detecção do Tipo de Documento
  const docCotacao = condText.includes("[DOC:COTACAO]");
  const docFinAguardando = condText.includes("[DOC:FIN_AGUARDANDO]");
  const docFinAprovado = condText.includes("[DOC:FIN_APROVADO:");
  
  // Mapeamento dos dados de aprovação de financiamento
  const matchAprovado = condText.match(/\[DOC:FIN_APROVADO:([a-z]+):([0-9]+):([0-9.]+):([0-9.]+)\]/);
  const dadosAprovados = matchAprovado ? {
    banco: matchAprovado[1],
    prazo: Number(matchAprovado[2]),
    taxa: Number(matchAprovado[3]),
    pmt: Number(matchAprovado[4])
  } : null;

  const focoVista = condText.includes("[FOCO:VISTA]");
  const focoFinanciado = condText.includes("[FOCO:FINANCIAMENTO:") || docFinAprovado;
  const focoCartao = condText.includes("[FOCO:CARTAO]");
  
  // Encontra qual banco foi pré-selecionado se houver (ex: [FOCO:FINANCIAMENTO:bv])
  const matchFin = condText.match(/\[FOCO:FINANCIAMENTO:([a-z]+)\]/);
  const finForcada = dadosAprovados 
    ? dadosAprovados.banco 
    : (matchFin && FINANCEIRAS[matchFin[1] as keyof typeof FINANCEIRAS] ? matchFin[1] : "solfacil");

  const [pagModo, setPagModo] = useState<"vista" | "financiado" | "cartao">(
    focoFinanciado ? "financiado" : focoCartao ? "cartao" : "vista"
  );
  const [selectedFin, setSelectedFin] = useState<keyof typeof FINANCEIRAS>(
    finForcada as keyof typeof FINANCEIRAS
  );
  const [selectedPrazo, setSelectedPrazo] = useState<number>(
    dadosAprovados ? dadosAprovados.prazo : 60
  );

  const simFinanceiro = useMemo(() => {
    const valorOriginal = Number(p.preco_total);
    const valorVista = valorOriginal * 0.95; // 5% de desconto à vista
    
    // Cálculo do Cartão de Crédito 10x sem juros (valor de tabela dividido em 10 parcelas)
    const valorCartaoTotal = valorOriginal;
    const valorCartaoParcela = Math.round(valorOriginal / 10);
    
    const fin = FINANCEIRAS[selectedFin];
    
    // Cálculo PMT (Price) ou Override Aprovado
    const n = dadosAprovados ? dadosAprovados.prazo : selectedPrazo;
    const rate = dadosAprovados ? dadosAprovados.taxa : fin.cetMensal;
    const pmtCalculada = (valorOriginal * (rate / 100) * Math.pow(1 + (rate / 100), n)) / (Math.pow(1 + (rate / 100), n) - 1);
    const valorParcela = dadosAprovados ? dadosAprovados.pmt : Math.round(pmtCalculada);
    
    const custoTotalFinanciado = valorParcela * n;
    const jurosTotais = custoTotalFinanciado - valorOriginal;
    
    // Análise de Viabilidade
    const economiaMensal = Number(p.economia_mensal) || 350;
    const saldoMensal = economiaMensal - valorParcela;
    
    // Payback Financiado = Custo Total Financiado / Economia Anual
    const economiaAnual = Number(p.economia_anual) || (economiaMensal * 12);
    const paybackFinanciadoAnos = economiaAnual > 0 ? (custoTotalFinanciado / economiaAnual) : 0;
    
    // Nível de Viabilidade
    let nivelViabilidade: "alta" | "media" | "alerta" = "media";
    let descViabilidade = "";
    
    if (saldoMensal > 0) {
      nivelViabilidade = "alta";
      descViabilidade = `Excelente! A economia gerada na fatura de energia (R$ ${Math.round(economiaMensal).toLocaleString("pt-BR")}) cobre 100% da parcela do banco (R$ ${valorParcela.toLocaleString("pt-BR")}) e ainda sobra R$ ${Math.round(saldoMensal).toLocaleString("pt-BR")}/mês de lucro líquido imediato. O sistema se auto-paga!`;
    } else if (Math.abs(saldoMensal) <= economiaMensal * 0.3) {
      nivelViabilidade = "media";
      descViabilidade = `Viável! A parcela é de R$ ${valorParcela.toLocaleString("pt-BR")}, superando a economia de R$ ${Math.round(economiaMensal).toLocaleString("pt-BR")} em apenas R$ ${Math.round(Math.abs(saldoMensal)).toLocaleString("pt-BR")}/mês. Após quitação em ${n} meses, você terá eletricidade gratuita por mais de 20 anos.`;
    } else {
      nivelViabilidade = "alerta";
      descViabilidade = `Atenção: O prazo de ${n}x gerou juros acumulados de R$ ${Math.round(jurosTotais).toLocaleString("pt-BR")}. A parcela mensal de R$ ${valorParcela.toLocaleString("pt-BR")} supera a economia imediata de R$ ${Math.round(economiaMensal).toLocaleString("pt-BR")}. Recomendamos diminuir o prazo para reduzir o custo final!`;
    }
    
    return {
      valorOriginal,
      valorVista,
      valorCartaoTotal,
      valorCartaoParcela,
      valorParcela,
      custoTotalFinanciado,
      jurosTotais,
      saldoMensal,
      paybackFinanciadoAnos,
      nivelViabilidade,
      descViabilidade,
      finInfo: fin
    };
  }, [p.preco_total, p.economia_mensal, p.economia_anual, selectedFin, selectedPrazo, dadosAprovados]);

  const inflacao = 0.08;
  const chartData = Array.from({ length: 25 }, (_, i) => ({
    ano: `${i + 1}`,
    economia: Math.round(Number(p.economia_anual) * Math.pow(1 + inflacao, i)),
  }));

  const validadeDias = p.validade_dias || 15;
  const expiraEm = p.expires_at ? new Date(p.expires_at) : null;

  if (docFinAguardando) {
    return (
      <div className="bg-slate-50 min-h-screen text-navy flex flex-col justify-between font-sans">
        <header className="bg-gradient-to-r from-navy via-navy-deep to-slate-900 text-white py-6 px-6 md:px-12 shadow-sm">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <img src={logo} alt="ESOL Energy" className="h-10 w-auto brightness-0 invert" />
            <Badge className="bg-sun text-navy font-bold">Ficha de Crédito em Análise</Badge>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center space-y-8">
          <div className="w-20 h-20 bg-amber-50 text-sun flex items-center justify-center rounded-full mx-auto text-4xl shadow-md border-2 border-sun animate-pulse">
            🏦
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-navy md:text-4xl leading-tight">
              Sua Ficha de Crédito está sob Análise!
            </h1>
            <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              Olá, <strong>{cliente?.nome || "cliente"}</strong>. Nossa mesa de crédito já está negociando as melhores taxas e prazos nas principais operadoras solares do país (Solfácil, BV, Santander e Sicredi).
            </p>
          </div>

          {/* Cronômetro Regressivo de Análise de Crédito */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-lg max-w-md mx-auto space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Tempo Estimado para Retorno</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border">
                <div className="text-3xl font-black text-navy">72</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">Horas</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border">
                <div className="text-3xl font-black text-navy">00</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">Minutos</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border">
                <div className="text-3xl font-black text-navy">00</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">Segundos</div>
              </div>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold">
              ⚡ Nossa equipe jurídica costuma aprovar o crédito em menos de 24 horas úteis!
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm text-left max-w-xl mx-auto space-y-4">
            <h3 className="font-extrabold text-sm text-navy flex items-center gap-2">
              📋 Dados do Estudo Fotovoltaico
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-slate-400 font-bold block text-[9px] uppercase">Potência do Sistema</span>
                <strong className="text-navy text-sm font-black">{NUM(Number(p.kwp_sistema), 2)} kWp</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-slate-400 font-bold block text-[9px] uppercase">Geração Mensal Esperada</span>
                <strong className="text-navy text-sm font-black">{NUM(Number(p.geracao_mensal_kwh))} kWh</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-slate-400 font-bold block text-[9px] uppercase">Economia Mensal Estimada</span>
                <strong className="text-emerald-700 text-sm font-black">{BRL(Number(p.economia_mensal))}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-slate-400 font-bold block text-[9px] uppercase">Redução de Emissões CO₂</span>
                <strong className="text-navy text-sm font-black">{NUM(Number(p.co2_evitado_ton), 1)} t/ano</strong>
              </div>
            </div>
          </div>

          {parceiro && (
            <div className="text-slate-500 text-xs">
              Dúvidas sobre o cadastro? Fale com seu consultor <strong>{parceiro.nome}</strong> no telefone <strong>{parceiro.telefone}</strong>.
            </div>
          )}
        </main>

        <footer className="py-6 border-t border-slate-200 text-center text-xs text-muted-foreground bg-white">
          ESOL Energy © {new Date().getFullYear()} · Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  if (docCotacao) {
    return (
      <div className="bg-white text-navy font-sans min-h-screen flex flex-col justify-between">
        <header className="bg-gradient-to-r from-navy via-[#0a2d6e] to-slate-900 text-white py-8 px-6 md:px-12 relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-sun/10 rounded-full blur-2xl" />
          <div className="max-w-5xl mx-auto flex justify-between items-center relative z-10">
            <img src={logo} alt="ESOL Energy" className="h-10 w-auto brightness-0 invert" />
            <div className="text-right text-xs">
              <span className="text-white/60">Cotação Solar</span>
              <div className="font-mono font-bold">#{String(p.id || "").slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10 md:py-12 space-y-8 flex-1 w-full">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-navy tracking-tight md:text-4xl">
              Cotação Comercial de Energia Solar
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
              Preparamos este orçamento rápido sob medida para o consumo estimado de <strong>{NUM(Number(p.consumo_kwh))} kWh/mês</strong> em <strong>{p.cidade || "sua localidade"}/{p.estado}</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Dados do Estudo */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Potência Sugerida</span>
                  <div className="text-2xl font-black text-navy mt-1">{NUM(Number(p.kwp_sistema), 2)} kWp</div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Área estimada: {NUM(Number(p.area_necessaria_m2 || p.kwp_sistema * 6), 1)} m²</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Economia Mensal</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{BRL(Number(p.economia_mensal))}</div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Economia anual de {BRL(Number(p.economia_anual))}</span>
                </div>
              </div>

              {/* Detalhes do Kit Selecionado */}
              {p.kit_nome && (
                <div className="bg-slate-50 border rounded-3xl p-5 shadow-sm space-y-3 font-sans">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-sun-deep block">Equipamento Selecionado</span>
                  <strong className="text-navy text-sm font-extrabold block">{p.kit_nome}</strong>
                  <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t pt-3">
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">Garantia Painéis</span>
                      <strong className="text-navy font-bold">{p.kit_garantia_modulos_anos || 25} anos</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">Garantia Inversor</span>
                      <strong className="text-navy font-bold">{p.kit_garantia_inversor_anos || 10} anos</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Preços */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-navy uppercase tracking-wider">Opções de Aquisição</h3>
                <div className="divide-y text-xs">
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <strong className="text-navy text-sm font-bold block">💰 Pagamento À Vista</strong>
                      <span className="text-[10px] text-muted-foreground">Desconto de 5% de tabela já aplicado</span>
                    </div>
                    <span className="text-lg font-black text-emerald-700">{BRL(simFinanceiro.valorVista)}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <strong className="text-navy text-sm font-bold block">💳 Cartão de Crédito em 10x</strong>
                      <span className="text-[10px] text-muted-foreground">Parcelado sem juros nas bandeiras tradicionais</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-navy">{BRL(simFinanceiro.valorCartaoParcela)}/mês</span>
                      <span className="text-[9px] text-slate-400 block">Total: {BRL(simFinanceiro.valorCartaoTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Lateral: Contato e Ações */}
            <div className="space-y-4">
              {parceiro && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Consultor Responsável</span>
                    <h4 className="font-extrabold text-navy text-sm mt-1">{parceiro.nome}</h4>
                    {parceiro.telefone && <p className="text-xs text-muted-foreground mt-0.5">{parceiro.telefone}</p>}
                  </div>
                  <a
                    href={`https://wa.me/55${parceiro.telefone?.replace(/\D/g, "")}?text=Olá%20${(parceiro.nome || "ESOL").split(" ")[0]}!%20Recebi%20minha%20Cotação%20Solar%20nº%20${String(p.id).slice(0,8).toUpperCase()}%20e%20gostaria%20de%20fechar.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold text-xs h-10 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    💬 Aceitar & Chamar no WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-200 text-center text-xs text-muted-foreground bg-white">
          ESOL Energy © {new Date().getFullYear()} · Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-white text-ink font-sans" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}>
      {docFinAprovado && dadosAprovados && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 text-center font-bold text-xs tracking-wider shadow-md flex items-center justify-center gap-2 animate-fade-in relative z-20">
          🎉 CRÉDITO SOLAR PRÉ-APROVADO: Financiamento liberado via {FINANCEIRAS[dadosAprovados.banco as keyof typeof FINANCEIRAS]?.nome || dadosAprovados.banco.toUpperCase()} em {dadosAprovados.prazo}x de {BRL(dadosAprovados.pmt)} (Taxa de {dadosAprovados.taxa}% a.m.)!
        </div>
      )}
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

      {/* DETALHES DO KIT FOTOVOLTAICO SELECIONADO */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Imagem do Kit */}
            <div className="relative rounded-2xl overflow-hidden shadow-md bg-white p-3 border">
              <img
                src={
                  p.kit_imagem_url || 
                  (p.tipo_instalacao === "rural" 
                    ? "/kits/kit-rural.png" 
                    : Number(p.kwp_sistema) <= 4.0 
                      ? "/kits/kit-residencial-pequeno.png" 
                      : Number(p.kwp_sistema) <= 10.0 
                        ? "/kits/kit-residencial-grande.png" 
                        : "/kits/kit-comercial-industrial.png")
                }
                alt={p.kit_nome || "Kit Solar"}
                className="w-full h-64 md:h-72 object-contain mx-auto"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-navy text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm">
                🎁 KIT OFICIAL
              </div>
            </div>

            {/* Descrição do Kit */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-sun-deep">Equipamentos & Tecnologia</span>
                <h3 className="font-display text-2xl font-bold text-navy mt-1">
                  {p.kit_nome || "Dimensionamento Técnico Customizado"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Gerador fotovoltaico completo montado com equipamentos homologados pelo Inmetro e em total conformidade com a regulação da concessionária.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <div className="text-[10px] text-muted-foreground font-semibold">Garantia Painéis</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">{p.kit_garantia_modulos_anos || 25} anos</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <div className="text-[10px] text-muted-foreground font-semibold">Garantia Inversor</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">{p.kit_garantia_inversor_anos || 10} anos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Itens Detalhada (BOM) */}
          <div className="space-y-3">
            <div className="text-xs uppercase font-extrabold tracking-wider text-navy/70">Composição Detalhada do Gerador Solar</div>
            <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-navy/70 border-b">
                  <tr>
                    <th className="p-3">Componente</th>
                    <th className="p-3">Descrição / Especificação Técnica</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">Garantia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Módulos (Placas)</td>
                    <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      {componentesKit[0]}
                    </td>
                    <td className="p-3 text-center font-bold text-navy">{p.qtd_modulos}</td>
                    <td className="p-3 text-right text-emerald-700">{p.kit_garantia_modulos_anos || 25} anos</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Inversor Solar</td>
                    <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      {componentesKit[1]}
                    </td>
                    <td className="p-3 text-center font-bold text-navy">{p.qtd_inversores || 1}</td>
                    <td className="p-3 text-right text-emerald-700">{p.kit_garantia_inversor_anos || 10} anos</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Estrutura de Fixação</td>
                    <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      {componentesKit[2]}
                    </td>
                    <td className="p-3 text-center font-bold text-navy">1 Kit</td>
                    <td className="p-3 text-right text-emerald-700">15 anos</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Cabeamento Solar</td>
                    <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      {componentesKit[3]}
                    </td>
                    <td className="p-3 text-center font-bold text-navy">1 Kit</td>
                    <td className="p-3 text-right text-emerald-700">10 anos</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy text-[11px] md:text-xs">String Box e Conectores</td>
                    <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">
                      {componentesKit[5]} · Acompanha {componentesKit[4]}
                    </td>
                    <td className="p-3 text-center font-bold text-navy">1 Kit</td>
                    <td className="p-3 text-right text-emerald-700">5 anos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
          
          {p.observacoes && (
            <div className="mt-6 bg-slate-100/60 border border-slate-200/60 rounded-2xl p-6 text-sm">
              <div className="text-xs uppercase tracking-wider text-navy/70 font-bold mb-3">Especificações & Observações Técnicas</div>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{p.observacoes}</div>
            </div>
          )}
        </div>
      </section>

      {/* SIMULADOR FINANCEIRO E ANÁLISE DE VIABILIDADE OU CARD SIMPLIFICADO */}
      {!docFinAprovado ? (
        <section className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12 border-t border-slate-100 font-sans">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sun-deep block">Investimento Comercial</span>
              <h2 className="text-3xl font-black text-navy">{BRL(simFinanceiro.valorVista)}</h2>
              <p className="text-xs text-muted-foreground">Preço com desconto à vista (5% de desconto de tabela já aplicado).</p>
              
              {p.condicoes_pagamento && (
                <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <strong>Condições de Pagamento:</strong> {p.condicoes_pagamento.replace(/\[FOCO:[A-Z:]+\]\n?/g, "").replace(/\[DOC:[A-Z_]+\]\n?/g, "")}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 space-y-3 w-full md:w-auto">
              <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
                <span className="text-[10px] text-muted-foreground block font-bold">Validade da Proposta</span>
                <strong className="text-navy text-sm font-extrabold">{p.validade_dias || 15} dias</strong>
              </div>
              {parceiro && (
                <a
                  href={`https://wa.me/55${parceiro.telefone?.replace(/\D/g, "")}?text=Olá%20${(parceiro.nome || "ESOL").split(" ")[0]}!%20Gostaria%20de%20fechar%20a%20proposta%20solar%20nº%20${String(p.id).slice(0, 8).toUpperCase()}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold text-xs h-10 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  💬 Chamar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-10 border-t border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-sun/10 text-sun-deep px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Coins className="w-3.5 h-3.5" /> PLANEJAMENTO FINANCEIRO INTELIGENTE
            </div>
            <h2 className="font-display text-3xl font-bold text-navy">
              Simulador de Pagamento & Viabilidade
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">Compare as vantagens de pagar à vista ou trocar a sua conta de luz pela parcela do banco.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Coluna 1 e 2: O Simulador */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200/50 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-navy flex items-center gap-1.5 font-sans">
                    <Scale className="w-4 h-4 text-sun-deep" /> Condição Comercial
                  </span>
                  
                  <Badge className="bg-sun text-navy font-extrabold uppercase text-[10px] tracking-wider">
                    🔒 Financiamento via {FINANCEIRAS[finForcada as keyof typeof FINANCEIRAS]?.nome || finForcada.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-5 py-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-navy font-bold">Instituição Financeira Parceira</Label>
                      <Select disabled={true} value={selectedFin} onValueChange={(v: any) => setSelectedFin(v)}>
                        <SelectTrigger className="h-9 bg-white border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solfacil">🏦 Solfácil (CET 1,29% a.m.)</SelectItem>
                          <SelectItem value="bv">🏢 Banco BV Solar (CET 1,39% a.m.)</SelectItem>
                          <SelectItem value="santander">🏛️ Santander Financiamentos (CET 1,45% a.m.)</SelectItem>
                          <SelectItem value="sicredi">🤝 Sicredi Cooperativa (CET 1,24% a.m.)</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-muted-foreground block">{simFinanceiro.finInfo.info}</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-navy font-bold">Prazo de Pagamento</Label>
                      <Select disabled={true} value={String(selectedPrazo)} onValueChange={(v) => setSelectedPrazo(Number(v))}>
                        <SelectTrigger className="h-9 bg-white border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 meses</SelectItem>
                          <SelectItem value="36">36 meses</SelectItem>
                          <SelectItem value="48">48 meses</SelectItem>
                          <SelectItem value="60">60 meses (Padrão)</SelectItem>
                          <SelectItem value="72">72 meses</SelectItem>
                          <SelectItem value="84">84 meses</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-muted-foreground block">Carência para início sob aprovação do cadastro.</span>
                    </div>
                  </div>

                  {/* Detalhamento de Custo Efetivo Total (CET) */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <div className="text-[10px] uppercase font-extrabold tracking-wider text-navy/70">Taxas e Detalhamento do Banco (CET)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">Taxa Nominal</div>
                        <div className="text-sm font-extrabold text-navy mt-0.5">{simFinanceiro.finInfo.taxaNominal}% a.m.</div>
                      </div>
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">CET Mensal</div>
                        <div className="text-sm font-extrabold text-navy mt-0.5">{simFinanceiro.finInfo.cetMensal}% a.m.</div>
                      </div>
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">CET Anual</div>
                        <div className="text-sm font-extrabold text-navy mt-0.5">{simFinanceiro.finInfo.cetAnual}% a.a.</div>
                      </div>
                      <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">Juros Totais</div>
                        <div className="text-sm font-extrabold text-red-600 mt-0.5">{BRL(simFinanceiro.jurosTotais)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t border-slate-100">
                      <span>Custo Total Financiado (Equipamentos + Juros):</span>
                      <span className="font-bold text-navy">{BRL(simFinanceiro.custoTotalFinanciado)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico Inteligente de Viabilidade */}
              <div className={`mt-4 p-4 rounded-2xl border flex gap-3 items-start bg-emerald-50/40 border-emerald-200 text-emerald-800`}>
                <ThumbsUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider block">
                    ⚡ Viabilidade Máxima: O sistema se paga!
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">{simFinanceiro.descViabilidade}</p>
                </div>
              </div>
            </div>

            {/* Coluna 3: Indicadores de Retorno Dinâmicos */}
            <div className="bg-navy text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-sun/10 blur-2xl" />
              
              <div className="space-y-4">
                <span className="text-[10px] text-sun uppercase font-bold tracking-widest block">Resumo do Retorno</span>
                
                <div className="space-y-1 border-b border-white/10 pb-4">
                  <span className="text-[10px] text-white/50 block font-semibold uppercase">Economia Mensal Média</span>
                  <div className="text-2xl font-extrabold text-sun">
                    {BRL(Number(p.economia_mensal))}
                  </div>
                  <span className="text-[10px] text-white/40 block">Redução imediata de até 95% na conta.</span>
                </div>

                <div className="space-y-1 border-b border-white/10 pb-4">
                  <span className="text-[10px] text-white/50 block font-semibold uppercase">Prestação Mensal ({selectedPrazo}x)</span>
                  <div className="text-2xl font-extrabold text-white">
                    {BRL(simFinanceiro.valorParcela)}/mês
                  </div>
                  <span className="text-[10px] text-white/40 block">Taxas calculadas via tabela Price.</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 block font-semibold uppercase">Payback Financiado Ajustado</span>
                  <div className="text-3xl font-extrabold text-white flex items-baseline gap-1">
                    {simFinanceiro.paybackFinanciadoAnos.toFixed(1)} <span className="text-xs text-white/60 font-medium">anos</span>
                  </div>
                  <span className="text-[10px] text-white/40 block">Retorno real considerando os juros cobrados.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[9px] text-white/40 leading-relaxed">
                * Simulação aproximada de crédito. Sujeita a análise de perfil, score e alterações sem aviso prévio pelas financeiras.
              </div>
            </div>
          </div>
        </section>
      )}

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
                <div className="mt-4 text-sm text-white/80 bg-white/10 rounded-lg p-3 border border-white/15 whitespace-pre-line">
                  <strong className="text-sun">Condições:</strong>{"\n"}{p.condicoes_pagamento}
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

