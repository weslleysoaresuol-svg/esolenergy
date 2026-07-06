import { useState, useMemo, useEffect } from "react";
import { BRL, NUM, calcularProposta } from "@/lib/proposta-calc";
import { supabase } from "@/integrations/supabase/client";
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

  const [bancos, setBancos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase as any).from("financeiras_solar").select("*").eq("ativo", true);
        if (data && data.length > 0) {
          setBancos(data);
        }
      } catch (err) {
        console.error("Falha ao carregar financeiras", err);
      }
    })();
  }, []);

  const FINANCEIRAS = useMemo(() => {
    const base = {
      solfacil: {
        id: "solfacil",
        nome: "Solfácil",
        taxaNominal: 1.19,
        cetMensal: 1.39,
        cetAnual: 18.02,
        label: "Solfácil Solar",
        info: "Fintech especialista em energia solar. Sem taxa de abertura de crédito (TAC)."
      },
      bv: {
        id: "bv",
        nome: "Banco BV",
        taxaNominal: 1.29,
        cetMensal: 1.48,
        cetAnual: 19.32,
        label: "Banco BV",
        info: "Crédito ágil com carência de até 120 dias para o primeiro pagamento."
      },
      santander: {
        id: "santander",
        nome: "Santander",
        taxaNominal: 1.39,
        cetMensal: 1.59,
        cetAnual: 20.86,
        label: "Santander",
        info: "Financiamento tradicional em boleto ou débito direto."
      },
      sicredi: {
        id: "sicredi",
        nome: "Sicredi",
        taxaNominal: 0.99,
        cetMensal: 1.15,
        cetAnual: 14.71,
        label: "Sicredi (Cooperativa)",
        info: "Condições diferenciadas exclusivas para associados da cooperativa."
      }
    };

    if (bancos.length === 0) return base;

    const dict: Record<string, any> = { ...base };
    bancos.forEach((b) => {
      const cleanKey = b.nome.toLowerCase()
        .replace(/banco/g, "")
        .replace(/financeira/g, "")
        .replace(/solar/g, "")
        .replace(/green/g, "")
        .replace(/energia/g, "")
        .replace(/verde/g, "")
        .trim()
        .replace(/\s+/g, "");

      const cetM = Number(b.taxa_cet_mes || b.taxa_juros_mes);
      const jurosNom = Number(b.taxa_juros_mes);
      const cetAnualCalculado = +((Math.pow(1 + (cetM / 100), 12) - 1) * 100).toFixed(2);

      const obj = {
        id: b.id,
        nome: b.nome,
        taxaNominal: jurosNom,
        cetMensal: cetM,
        cetAnual: cetAnualCalculado,
        label: b.nome,
        info: `Taxa CET de ${cetM}% a.m. Prazo de até ${b.prazo_maximo_meses} meses.`
      };

      dict[b.id] = obj;
      dict[cleanKey] = obj;
    });

    return dict;
  }, [bancos]);

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
  const [activeTab, setActiveTab] = useState<"projeto" | "engenharia" | "financeiro" | "comercial">("projeto");
  const [savingsView, setSavingsView] = useState<"anual" | "acumulado">("anual");

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

  const custoInercia25Anos = useMemo(() => {
    let soma = 0;
    const faturaMensalAtual = (Number(p.consumo_kwh) * Number(p.tarifa_kwh)) + 22; // fatura com COSIP
    for (let i = 0; i < 25; i++) {
      soma += faturaMensalAtual * 12 * Math.pow(1 + 0.08, i);
    }
    return Math.round(soma);
  }, [p.consumo_kwh, p.tarifa_kwh]);

  // Objeto de cálculo final reativo (com fallback para propostas legadas)
  const calc = useMemo(() => {
    if (p.economia_ajustada_mensal !== undefined && p.economia_ajustada_mensal !== null) {
      return {
        economia_ajustada_mensal: Number(p.economia_ajustada_mensal),
        economia_ajustada_anual: Number(p.economia_ajustada_anual),
        economia_ajustada_25_anos: Number(p.economia_ajustada_25_anos),
        payback_ajustado_meses: Number(p.payback_ajustado_meses),
        tir_anual_pct: Number(p.tir_anual_pct || 0),
        vpl_brl: Number(p.vpl_brl || 0),
        custo_disponibilidade_mensal: Number(p.custo_disponibilidade_mensal || 0),
        ajuste_fio_b_mensal: Number(p.ajuste_fio_b_mensal || 0),
        inflacao_energetica: 0.08
      };
    }

    // Fallback: proposta legada, recalcula reativamente
    try {
      const mockParams = {
        hsp_norte: 4.6, hsp_nordeste: 5.6, hsp_centro_oeste: 5.2, hsp_sudeste: 4.8, hsp_sul: 4.5,
        preco_wp_residencial_pequeno: 3.80, preco_wp_residencial_grande: 3.20, preco_wp_comercial_pequeno: 2.90, preco_wp_comercial_grande: 2.60, preco_wp_industrial: 2.40,
        tarifa_kwh_default: 0.95, perdas_sistema: 0.18, inflacao_energetica: 0.08, vida_util_anos: 25,
        potencia_modulo_w: p.potencia_modulo_w || 555, area_por_modulo_m2: 2.7,
        custo_equipamentos_pct: 0.48, custo_instalacao_pct: 0.12, custo_frete_pct: 0.03, custo_impostos_compra_pct: 0.03, custo_comissao_pct: 0.08, margem_alvo_pct: 0.24,
        tributacao_empresa_pct: 0.10, custo_marketing_pct: 0.03, custo_overhead_pct: 0.05, custo_garantia_pct: 0.008, custo_engenharia_fixo_brl: 900,
        percentual_fio_b: 0.60
      };

      const res = calcularProposta({
        consumo_kwh: Number(p.consumo_kwh),
        tarifa_kwh: Number(p.tarifa_kwh),
        estado: p.estado || "SP",
        tipo: (p.tipo_instalacao || "residencial") as any,
        ligacao: p.kwp_sistema > 15 ? "tri" : "mono", // heurística de ligação
        preco_override: Number(p.preco_total),
        qtd_modulos_override: Number(p.qtd_modulos)
      }, mockParams as any);

      return {
        economia_ajustada_mensal: res.economia_ajustada_mensal,
        economia_ajustada_anual: res.economia_ajustada_anual,
        economia_ajustada_25_anos: res.economia_ajustada_25_anos,
        payback_ajustado_meses: res.payback_ajustado_meses,
        tir_anual_pct: res.tir_anual_pct,
        vpl_brl: res.vpl_brl,
        custo_disponibilidade_mensal: res.custo_disponibilidade_mensal,
        ajuste_fio_b_mensal: res.ajuste_fio_b_mensal,
        inflacao_energetica: 0.08
      };
    } catch (e) {
      console.error("Erro no fallback de recálculo da proposta", e);
      return {
        economia_ajustada_mensal: Number(p.economia_mensal),
        economia_ajustada_anual: Number(p.economia_anual),
        economia_ajustada_25_anos: Number(p.economia_25_anos),
        payback_ajustado_meses: Number(p.payback_meses),
        tir_anual_pct: 0,
        vpl_brl: 0,
        custo_disponibilidade_mensal: 0,
        ajuste_fio_b_mensal: 0,
        inflacao_energetica: 0.08
      };
    }
  }, [p]);

  const chartData = useMemo(() => {
    let acumulado = 0;
    return Array.from({ length: 25 }, (_, i) => {
      const ano = i + 1;
      const economiaAno = calc.economia_ajustada_anual * Math.pow(1 + calc.inflacao_energetica, i);
      // Descontar custos de O&M (0.5% a.a. do preço a partir do ano 2)
      const custoOM = ano >= 2 ? +(Number(p.preco_total) * 0.005) : 0;
      // Descontar troca do inversor (15% no ano 12)
      const custoInversor = ano === 12 ? +(Number(p.preco_total) * 0.15) : 0;
      
      const economiaLiquida = Math.max(0, economiaAno - custoOM - custoInversor);
      acumulado += economiaLiquida;
      
      return {
        ano: `${ano}`,
        economia: Math.round(savingsView === "acumulado" ? acumulado : economiaLiquida),
      };
    });
  }, [calc, p.preco_total, savingsView]);

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
      <section className="max-w-5xl mx-auto px-6 md:px-12 -mt-8 relative z-10 print:mt-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={Zap} label="Sistema" value={`${NUM(Number(p.kwp_sistema), 2)} kWp`} />
          <Stat icon={TrendingDown} label="Economia Real/mês" value={BRL(calc.economia_ajustada_mensal)} highlight />
          <Stat icon={Clock} label="Payback Real" value={`${(calc.payback_ajustado_meses / 12).toFixed(1)} anos`} />
          <Stat icon={Leaf} label="CO₂ evitado" value={`${NUM(Number(p.co2_evitado_ton), 1)} t`} />
        </div>
      </section>

      {/* TABS NAVIGATION */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-slate-200/80 py-3.5 mt-8 print:hidden shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex justify-between gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("projeto")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "projeto"
                ? "bg-[#001F5C] text-white shadow-md shadow-navy/20"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            ☀️ O Projeto
          </button>
          <button
            onClick={() => setActiveTab("engenharia")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "engenharia"
                ? "bg-[#001F5C] text-white shadow-md shadow-navy/20"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            ⚙️ Engenharia
          </button>
          <button
            onClick={() => setActiveTab("financeiro")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "financeiro"
                ? "bg-[#001F5C] text-white shadow-md shadow-navy/20"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            📊 Retorno Financeiro
          </button>
          <button
            onClick={() => setActiveTab("comercial")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "comercial"
                ? "bg-[#001F5C] text-white shadow-md shadow-navy/20"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            💰 Proposta Comercial
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 md:py-10 space-y-12">
        {/* TAB 1: O PROJETO */}
        <div className={activeTab === "projeto" ? "space-y-10 animate-fade-in" : "hidden print:block print:space-y-10"}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="font-extrabold text-sm text-[#001F5C] uppercase tracking-wider">Dimensionamento Inicial</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <SpecCard title="Geração & Consumo">
                    <Row label="Consumo informado" value={`${NUM(Number(p.consumo_kwh))} kWh/mês`} />
                    <Row label="Geração estimada" value={`${NUM(Number(p.geracao_mensal_kwh))} kWh/mês`} highlight />
                    <Row label="Tarifa considerada" value={BRL(Number(p.tarifa_kwh)) + "/kWh"} />
                    <Row label="HSP da região" value={`${Number(p.hsp).toFixed(1)} h`} />
                  </SpecCard>
                  <SpecCard title="Arranjo do Gerador">
                    <Row label="Potência total" value={`${NUM(Number(p.kwp_sistema), 2)} kWp`} highlight />
                    <Row label="Painéis solares" value={`${p.qtd_modulos} × ${p.potencia_modulo_w}W`} />
                    <Row label="Inversor(es)" value={`${p.qtd_inversores} × ${Number(p.potencia_inversor_kw || 0).toFixed(1)} kW`} />
                    <Row label="Área necessária" value={`~${NUM(Number(p.area_necessaria_m2), 1)} m²`} />
                  </SpecCard>
                </div>
              </div>

              {/* Pegada Ecológica Premium */}
              <div className="bg-emerald-50/40 backdrop-blur-sm border border-emerald-200/60 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Leaf className="w-5 h-5" /></span>
                  <div>
                    <h3 className="font-display font-extrabold text-emerald-950 text-sm uppercase tracking-wider">Pegada Ecológica & Impacto Verde</h3>
                    <p className="text-[11px] text-emerald-700/80">O impacto ambiental positivo gerado pelo seu sistema fotovoltaico todo ano</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border text-center shadow-sm space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">CO₂ Evitado</div>
                    <strong className="text-base font-black text-emerald-600 block">{NUM(Number(p.co2_evitado_ton), 1)} t/ano</strong>
                    <span className="text-[9px] text-slate-400 block">Menos queima de carvão</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border text-center shadow-sm space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Carro Elétrico</div>
                    <strong className="text-base font-black text-emerald-600 block">~{NUM(Number(p.co2_evitado_ton) * 5200, 0)} km</strong>
                    <span className="text-[9px] text-slate-400 block">Rodados sem poluição</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border text-center shadow-sm space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Árvores Salvas</div>
                    <strong className="text-base font-black text-emerald-600 block">{p.arvores_equivalentes} árvores</strong>
                    <span className="text-[9px] text-slate-400 block">Equivalentes plantadas</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border text-center shadow-sm space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Celulares Carregados</div>
                    <strong className="text-base font-black text-emerald-600 block">~{NUM(Number(p.co2_evitado_ton) * 85000, 0).toLocaleString("pt-BR")}</strong>
                    <span className="text-[9px] text-slate-400 block">Cargas completas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Faturamento Comparativo Detalhado */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#001F5C]/70">
                Detalhamento Operacional de Faturamento
              </h3>
              <div className="border rounded-2xl overflow-hidden bg-white shadow-md text-xs font-medium">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-bold text-navy/70 border-b">
                    <tr>
                      <th className="p-3 text-[10px] uppercase">Encargo / Parâmetro</th>
                      <th className="p-3 text-[10px] uppercase text-right">Fatura Atual</th>
                      <th className="p-3 text-[10px] uppercase text-right text-emerald-700">Pós-Solar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-navy">Consumo Ativo</td>
                      <td className="p-3 text-right text-muted-foreground">{BRL(Number(p.consumo_kwh) * Number(p.tarifa_kwh))}</td>
                      <td className="p-3 text-right text-emerald-700 font-bold">R$ 0,00</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-navy">Custo de Disponibilidade</td>
                      <td className="p-3 text-right text-slate-400">—</td>
                      <td className="p-3 text-right text-navy font-bold">{BRL(calc.custo_disponibilidade_mensal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-navy">Encargos Lei 14.300</td>
                      <td className="p-3 text-right text-slate-400">—</td>
                      <td className="p-3 text-right text-navy font-bold">{BRL(calc.ajuste_fio_b_mensal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-navy">Iluminação (COSIP)</td>
                      <td className="p-3 text-right text-navy font-bold">{BRL(22)}</td>
                      <td className="p-3 text-right text-navy font-bold">{BRL(22)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t">
                      <td className="p-3 text-navy">Total Estimado</td>
                      <td className="p-3 text-right text-red-600 font-extrabold">{BRL((Number(p.consumo_kwh) * Number(p.tarifa_kwh)) + 22)}</td>
                      <td className="p-3 text-right text-emerald-700 font-extrabold">{BRL(calc.custo_disponibilidade_mensal + calc.ajuste_fio_b_mensal + 22)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 2: ENGENHARIA */}
        <div className={activeTab === "engenharia" ? "space-y-10 animate-fade-in" : "hidden print:block print:space-y-10"}>
          <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Ficha Técnica de Engenharia */}
              <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-navy uppercase text-[10px] tracking-wider">Ficha Técnica de Engenharia</span>
                  <span className="bg-[#001F5C]/5 text-[#001F5C] font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono">Especificações</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="border-b pb-1.5">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Potência do Arranjo</span>
                    <strong className="text-navy text-sm font-black">{NUM(Number(p.kwp_sistema), 2)} kWp</strong>
                  </div>
                  <div className="border-b pb-1.5">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Módulos Sugeridos</span>
                    <strong className="text-navy text-sm font-black">{p.qtd_modulos} unid.</strong>
                  </div>
                  <div className="border-b pb-1.5">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Área Mínima Requerida</span>
                    <strong className="text-navy text-sm font-black">~{NUM(Number(p.area_necessaria_m2 || p.kwp_sistema * 6), 1)} m²</strong>
                  </div>
                  <div className="border-b pb-1.5">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Carga Estática Estimada</span>
                    <strong className="text-navy text-sm font-black">~13.5 kg / m²</strong>
                  </div>
                  <div className="border-b pb-1.5 col-span-2">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Tipo de Fixação & Estrutura</span>
                    <strong className="text-navy text-sm font-black uppercase block">
                      {p.tipo_telhado === "metalico" ? "Metálico (Perfil Alumínio)" : 
                       p.tipo_telhado === "fibrocimento" ? "Fibrocimento / Eternit" : 
                       p.tipo_telhado === "laje" ? "Laje (Estrutura Triângulo)" : 
                       p.tipo_telhado === "solo" ? "Estrutura de Solo" : "Cerâmico (Telha Cerâmica)"}
                    </strong>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-2.5 rounded-xl border flex items-start gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Gerador certificado pelo <strong>INMETRO (Classe A)</strong>. Equipamentos com proteção ativa contra surtos (DPS), disjuntores dedicados e conformidade técnica ANEEL (Lei 14.300).
                  </p>
                </div>
              </div>

              {/* Equipamentos & Tecnologias */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sun-deep">Equipamentos & Tecnologia</span>
                  <h3 className="font-display text-2xl font-bold text-navy mt-1">
                    {p.kit_nome || "Dimensionamento Técnico Customizado"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Gerador fotovoltaico completo montado com equipamentos homologados pelas concessionárias locais de energia elétrica.
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

            {/* Grid Visual de Equipamentos */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {componentesKit.map((item: string, idx: number) => {
                let title = "Equipamento";
                let icon = "⚡";
                if (idx === 0) { title = "Módulos"; icon = "☀️"; }
                if (idx === 1) { title = "Inversor"; icon = "📟"; }
                if (idx === 2) { title = "Estrutura"; icon = "🛠️"; }
                if (idx === 3) { title = "Cabos"; icon = "🔌"; }
                if (idx === 4) { title = "Conectores"; icon = "🔗"; }
                if (idx === 5) { title = "Proteções"; icon = "🛡️"; }

                return (
                  <div key={idx} className="bg-white border rounded-2xl p-3 text-center space-y-1 shadow-sm flex flex-col items-center justify-between">
                    <div className="text-2xl">{icon}</div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-navy uppercase tracking-wider block">{title}</span>
                      <span className="text-[10px] text-muted-foreground font-medium leading-tight line-clamp-2" title={item}>
                        {item}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabela BOM */}
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
                      <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">{componentesKit[0]}</td>
                      <td className="p-3 text-center font-bold text-navy">{p.qtd_modulos}</td>
                      <td className="p-3 text-right text-emerald-700">{p.kit_garantia_modulos_anos || 25} anos</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Inversor Solar</td>
                      <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">{componentesKit[1]}</td>
                      <td className="p-3 text-center font-bold text-navy">{p.qtd_inversores || 1}</td>
                      <td className="p-3 text-right text-emerald-700">{p.kit_garantia_inversor_anos || 10} anos</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Estrutura de Fixação</td>
                      <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">{componentesKit[2]}</td>
                      <td className="p-3 text-center font-bold text-navy">1 Kit</td>
                      <td className="p-3 text-right text-emerald-700">15 anos</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy text-[11px] md:text-xs">Cabeamento Solar</td>
                      <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">{componentesKit[3]}</td>
                      <td className="p-3 text-center font-bold text-navy">1 Kit</td>
                      <td className="p-3 text-right text-emerald-700">10 anos</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy text-[11px] md:text-xs">String Box e Conectores</td>
                      <td className="p-3 text-muted-foreground text-[11px] md:text-xs leading-relaxed">{componentesKit[5]} · Acompanha {componentesKit[4]}</td>
                      <td className="p-3 text-center font-bold text-navy">1 Kit</td>
                      <td className="p-3 text-right text-emerald-700">5 anos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagrama On-Grid Animado em SVG */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-sun/5 blur-2xl pointer-events-none" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-sun">
                <Sun className="w-4 h-4 text-sun animate-spin-slow" /> Fluxo de Operação e Conversão de Energia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative items-stretch">
                <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center space-y-3 flex flex-col justify-between items-center transition-all hover:bg-white/10 hover:border-sun/40">
                  <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">☀️</div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-sun uppercase block tracking-wider">1. Geração Solar</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Os painéis captam a radiação e geram Corrente Contínua (CC).</p>
                  </div>
                </div>
                <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center space-y-3 flex flex-col justify-between items-center transition-all hover:bg-white/10 hover:border-sun/40">
                  <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]">📟</div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-sun uppercase block tracking-wider">2. O Inversor</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Converte a energia CC em Corrente Alternada (CA) compatível com a sua casa.</p>
                  </div>
                </div>
                <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center space-y-3 flex flex-col justify-between items-center transition-all hover:bg-white/10 hover:border-sun/40">
                  <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">⚡</div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-sun uppercase block tracking-wider">3. Consumo Interno</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">A eletricidade é injetada no quadro de luz, alimentando o local imediatamente.</p>
                  </div>
                </div>
                <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center space-y-3 flex flex-col justify-between items-center transition-all hover:bg-white/10 hover:border-sun/40">
                  <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">🔄</div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-sun uppercase block tracking-wider">4. Injeção na Rede</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">O excedente vai para a rede e vira créditos válidos por 5 anos (Lei 14.300).</p>
                  </div>
                </div>
              </div>

              {/* Linha de energia animada */}
              <div className="hidden md:block relative h-6 w-full mt-2">
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 120,10 L 800,10" 
                    stroke="url(#energyGrad)" 
                    strokeWidth="3" 
                    strokeDasharray="6,8" 
                    fill="none" 
                    className="animate-[dash_10s_linear_infinite]" 
                  />
                </svg>
                <style>{`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -100;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 3: RETORNO FINANCEIRO */}
        <div className={activeTab === "financeiro" ? "space-y-10 animate-fade-in" : "hidden print:block print:space-y-10"}>
          {/* Card de Viabilidade e Comparativo de Inércia */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Atratividade Premium */}
            {calc.tir_anual_pct > 0 && (
              <div className="bg-[#001F5C]/5 border border-[#001F5C]/15 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600"><Coins className="w-5 h-5" /></span>
                  <div>
                    <h3 className="font-display font-extrabold text-[#001F5C] text-sm uppercase tracking-wider">Atratividade Financeira</h3>
                    <p className="text-[10px] text-slate-500">Rentabilidade de capital em relação a investimentos tradicionais</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">TIR Solar</span>
                    <strong className="text-xl font-black text-emerald-600 block">{calc.tir_anual_pct}% a.a.</strong>
                    <span className="text-[8px] text-slate-400 block">• Retorno Isento de IR</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border text-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">VPL Gerado</span>
                    <strong className="text-xl font-black text-emerald-600 block">{BRL(calc.vpl_brl)}</strong>
                    <span className="text-[8px] text-slate-400 block">• Acima do CDI de 10%</span>
                  </div>
                </div>

                <div className="bg-white/60 p-3 rounded-2xl border text-xs space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Poupança Média:</span>
                    <span className="font-bold text-slate-700">~6.0% a.a.</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">CDB / CDI Médio:</span>
                    <span className="font-bold text-slate-700">~10.0% a.a.</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-t pt-1.5 font-bold">
                    <span className="text-navy">RETORNO SOLAR ESOL:</span>
                    <span className="text-emerald-600 font-extrabold">{calc.tir_anual_pct}% a.a.</span>
                  </div>
                </div>
              </div>
            )}

            {/* O CUSTO DA INÉRCIA */}
            <div className="bg-red-50/50 border border-red-200/60 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-100 text-red-600 rounded-xl"><AlertTriangle className="w-5 h-5" /></span>
                <div>
                  <h3 className="font-display font-extrabold text-red-950 text-sm uppercase tracking-wider">O Custo de Não Fazer Nada</h3>
                  <p className="text-[11px] text-red-700/80">Projeção do dinheiro perdido pagando faturas de luz com inflação de 8% a.a.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Gasto Total Acumulado (Sem Solar)</span>
                  <strong className="text-2xl font-black text-red-600 block">{BRL(custoInercia25Anos)}</strong>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed bg-white/60 p-3.5 rounded-xl border">
                  Se você decidir adiar o sistema, transferirá cerca de <strong className="text-red-700">{BRL(custoInercia25Anos)}</strong> para a distribuidora local nos próximos 25 anos. O investimento solar representa uma fração desse custo.
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico customizado de Economia 25 anos */}
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div>
                <h3 className="font-display font-bold text-navy text-base">Projeção Acumulada de Economia (25 Anos)</h3>
                <p className="text-[11px] text-muted-foreground">Economia real deduzindo despesas operacionais da planta</p>
              </div>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border print:hidden text-xs">
                <button
                  onClick={() => setSavingsView("anual")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    savingsView === "anual"
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Economia Anual
                </button>
                <button
                  onClick={() => setSavingsView("acumulado")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    savingsView === "acumulado"
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Patrimônio Acumulado 📈
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 md:p-6 border shadow-sm">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barSolarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FF8C00" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="ano" tick={{ fontSize: 10, fill: "hsl(215, 25%, 35%)" }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} 
                    tick={{ fontSize: 10, fill: "hsl(215, 25%, 35%)" }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(255, 255, 255, 0.82)", 
                      backdropFilter: "blur(8px)", 
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "14px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                    }}
                    formatter={(v: any) => [BRL(Number(v)), savingsView === "acumulado" ? "Patrimônio Acumulado" : "Economia Líquida"]} 
                    labelFormatter={(l) => `Ano ${l}`} 
                  />
                  <Bar dataKey="economia" fill="url(#barSolarGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TAB 4: PROPOSTA COMERCIAL */}
        <div className={activeTab === "comercial" ? "space-y-10 animate-fade-in" : "hidden print:block print:space-y-10"}>
          {/* Simulador Financeiro */}
          {!docFinAprovado ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sun-deep block">Investimento Comercial</span>
                <h2 className="text-3xl font-black text-navy">{BRL(simFinanceiro.valorVista)}</h2>
                <p className="text-xs text-muted-foreground">Preço líquido com desconto de 5% de tabela já aplicado à vista.</p>
                
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
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 items-stretch">
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

                  <div className="mt-4 p-4 rounded-2xl border flex gap-3 items-start bg-emerald-50/40 border-emerald-200 text-emerald-800">
                    <ThumbsUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider block">⚡ Viabilidade Máxima: O sistema se paga!</span>
                      <p className="text-[11px] leading-relaxed opacity-90">{simFinanceiro.descViabilidade}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-navy text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-sun/10 blur-2xl" />
                  
                  <div className="space-y-4">
                    <span className="text-[10px] text-sun uppercase font-bold tracking-widest block">Resumo do Retorno</span>
                    <div className="space-y-1 border-b border-white/10 pb-4">
                      <span className="text-[10px] text-white/50 block font-semibold uppercase">Economia Mensal Média</span>
                      <div className="text-2xl font-extrabold text-sun">{BRL(Number(p.economia_mensal))}</div>
                      <span className="text-[10px] text-white/40 block">Redução imediata de até 95% na conta.</span>
                    </div>
                    <div className="space-y-1 border-b border-white/10 pb-4">
                      <span className="text-[10px] text-white/50 block font-semibold uppercase">Prestação Mensal ({selectedPrazo}x)</span>
                      <div className="text-2xl font-extrabold text-white">{BRL(simFinanceiro.valorParcela)}/mês</div>
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
                    * Simulação aproximada de crédito. Sujeita a análise pelas financeiras.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investimento Detalhado */}
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

          {/* FAQ e Objeções */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-navy/70 text-center">
              Mitigação de Riscos & Objeções de Engenharia
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ObjectionItem 
                question="Como a Lei 14.300 afeta meu retorno financeiro?"
                answer="A lei introduziu a cobrança escalonada do Fio B sobre a energia injetada. No entanto, sua fatura ainda cai em até 90%. O payback é apenas alguns meses maior em relação à legislação anterior, mas com o aumento das tarifas de energia tradicionais, a atratividade permanece excelente (TIR superior a 20% a.a.)."
              />
              <ObjectionItem 
                question="O que acontece se a rede da concessionária cair?"
                answer="Por segurança operacional (norma brasileira), o inversor possui proteção contra ilhamento (Anti-Islanding). Se a rede da concessionária cair, o inversor se desliga automaticamente em milissegundos para evitar que o sistema envie energia à rua e coloque em risco técnicos locais."
              />
              <ObjectionItem 
                question="Como o sistema gera em dias de chuva ou nublados?"
                answer="O sistema fotovoltaico funciona através da radiação de luz (luz difusa), e não apenas do calor ou do sol direto. Nos dias chuvosos e nublados a geração diminui (varia entre 10% a 30% da potência nominal), mas essa variação é totalmente compensada no cálculo de média anual do dimensionamento."
              />
              <ObjectionItem 
                question="Qual é o custo e a frequência de manutenção?"
                answer="A manutenção é de baixíssima complexidade devido à ausência de peças móveis. Consiste basicamente em realizar a limpeza (lavagem com água) dos painéis uma a duas vezes ao ano (ou conforme a poeira da região) e monitorar a produção pelo aplicativo."
              />
            </div>
          </div>

          {/* CTA / Ações */}
          {publico && (
            <div className="bg-white border-2 border-sun rounded-3xl p-8 text-center shadow-xl max-w-2xl mx-auto">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-navy mb-2">Pronto para começar a economizar?</h3>
              <p className="text-muted-foreground mb-6 text-sm">Proposta válida por {validadeDias} dias{expiraEm ? ` (até ${expiraEm.toLocaleDateString("pt-BR")})` : ""}.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onAceitar} className="bg-sun hover:bg-sun-deep text-navy font-bold px-8 py-3.5 rounded-xl text-base transition shadow-lg hover:scale-105">
                  ✅ Aceitar proposta
                </button>
                <button onClick={() => window.print()} className="bg-navy hover:bg-navy-deep text-white font-semibold px-6 py-3.5 rounded-xl transition">
                  📄 Baixar PDF
                </button>
                <button onClick={onRecusar} className="border border-muted-foreground/30 text-muted-foreground hover:bg-slate-50 px-6 py-3.5 rounded-xl transition">
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
          )}
        </div>
      </main>

      {/* GARANTIAS / CONFIANÇA */}
      <section className="bg-slate-50 py-10 print:mt-10">
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

function ObjectionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border rounded-xl p-3.5 shadow-sm space-y-1.5 transition-all text-left">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center font-bold text-navy text-[11px] text-left uppercase tracking-wide gap-2"
      >
        <span>{question}</span>
        <span className="text-amber-500 font-extrabold text-sm">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-100 animate-fade-in font-medium">
          {answer}
        </p>
      )}
    </div>
  );
}

