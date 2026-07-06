import { useState, useMemo, useEffect } from "react";
import { BRL, NUM, calcularProposta } from "@/lib/proposta-calc";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sun, Zap, TrendingDown, Leaf, ShieldCheck, Clock, Home, Award, Phone, Mail, MapPin,
  AlertTriangle, TreePine, Car, Smartphone, ChevronDown
} from "lucide-react";
import logo from "@/assets/esol-logo.png";
import heroHouse from "@/assets/hero-house.jpg";
import { obterComponentesKit } from "@/lib/kits-fallback";

export interface PropostaViewProps {
  proposta: any;
  parceiro?: { nome?: string; email?: string; telefone?: string; avatar_url?: string };
  cliente?: { nome?: string; cidade?: string; estado?: string };
  publico?: boolean;
  onAceitar?: () => void;
  onRecusar?: () => void;
}

const FINANCEIRAS = {
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

  const FINANCEIRAS_ESTIMADO = useMemo(() => {
    const base = { ...FINANCEIRAS };
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

  const condText = p.condicoes_pagamento || "";
  
  const docCotacao = condText.includes("[DOC:COTACAO]");
  const docFinAguardando = condText.includes("[DOC:FIN_AGUARDANDO]");
  const docFinAprovado = condText.includes("[DOC:FIN_APROVADO:");
  
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
  
  const matchFin = condText.match(/\[FOCO:FINANCIAMENTO:([a-z]+)\]/);
  const finForcada = dadosAprovados 
    ? dadosAprovados.banco 
    : (matchFin && FINANCEIRAS_ESTIMADO[matchFin[1] as keyof typeof FINANCEIRAS_ESTIMADO] ? matchFin[1] : "solfacil");

  const [selectedFin, setSelectedFin] = useState<keyof typeof FINANCEIRAS_ESTIMADO>(
    finForcada as keyof typeof FINANCEIRAS_ESTIMADO
  );
  const [selectedPrazo, setSelectedPrazo] = useState<number>(
    dadosAprovados ? dadosAprovados.prazo : 60
  );
  const [savingsView, setSavingsView] = useState<"anual" | "acumulado">("anual");

  const simFinanceiro = useMemo(() => {
    const valorOriginal = Number(p.preco_total);
    const valorVista = valorOriginal * 0.95; 
    
    const valorCartaoTotal = valorOriginal;
    const valorCartaoParcela = Math.round(valorOriginal / 10);
    
    const fin = FINANCEIRAS_ESTIMADO[selectedFin] || FINANCEIRAS.solfacil;
    
    const n = dadosAprovados ? dadosAprovados.prazo : selectedPrazo;
    const rate = dadosAprovados ? dadosAprovados.taxa : fin.cetMensal;
    const pmtCalculada = (valorOriginal * (rate / 100) * Math.pow(1 + (rate / 100), n)) / (Math.pow(1 + (rate / 100), n) - 1);
    const valorParcela = dadosAprovados ? dadosAprovados.pmt : Math.round(pmtCalculada);
    
    const custoTotalFinanciado = valorParcela * n;
    const jurosTotais = custoTotalFinanciado - valorOriginal;
    
    const economiaMensal = Number(p.economia_mensal) || 350;
    const saldoMensal = economiaMensal - valorParcela;
    
    const economiaAnual = Number(p.economia_anual) || (economiaMensal * 12);
    const paybackFinanciadoAnos = economiaAnual > 0 ? (custoTotalFinanciado / economiaAnual) : 0;
    
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
  }, [p.preco_total, p.economia_mensal, p.economia_anual, selectedFin, selectedPrazo, dadosAprovados, FINANCEIRAS_ESTIMADO]);

  const custoInercia25Anos = useMemo(() => {
    let soma = 0;
    const faturaMensalAtual = (Number(p.consumo_kwh) * Number(p.tarifa_kwh)) + 22; 
    for (let i = 0; i < 25; i++) {
      soma += faturaMensalAtual * 12 * Math.pow(1 + 0.08, i);
    }
    return Math.round(soma);
  }, [p.consumo_kwh, p.tarifa_kwh]);

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
        ligacao: p.kwp_sistema > 15 ? "tri" : "mono", 
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
      const custoOM = ano >= 2 ? +(Number(p.preco_total) * 0.005) : 0;
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
      <div className="bg-[#000512] min-h-screen text-white flex flex-col justify-between font-sans relative overflow-hidden">
        {/* Glowing Coronas */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-sun/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-[#0a2d6e]/20 to-transparent blur-[110px] pointer-events-none animate-sun-pulse" />

        <header className="bg-white/[0.01] border-b border-white/[0.06] backdrop-blur-md py-6 px-6 md:px-12 relative z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <img src={logo} alt="ESOL Energy" className="h-10 w-auto brightness-0 invert" />
            <Badge className="bg-sun/10 text-sun border border-sun/20 font-black uppercase tracking-widest text-[9px] px-3 py-1">Ficha de Crédito em Análise</Badge>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-sun/10 text-sun flex items-center justify-center rounded-3xl mx-auto text-4xl shadow-glow border border-sun/20 animate-pulse">
            🏦
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white md:text-5xl leading-tight font-display">
              Sua Ficha de Crédito está sob Análise!
            </h1>
            <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed font-medium">
              Olá, <strong>{cliente?.nome || "cliente"}</strong>. Nossa mesa de crédito já está negociando as melhores taxas e prazos nas principais operadoras solares do país (Solfácil, BV, Santander e Sicredi).
            </p>
          </div>

          {/* Cronômetro Regressivo de Análise de Crédito */}
          <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 shadow-deep max-w-md mx-auto space-y-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/50 block">Tempo Estimado para Retorno</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <div className="text-3xl font-black text-white font-mono">72</div>
                <div className="text-[9px] text-white/40 uppercase font-black">Horas</div>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <div className="text-3xl font-black text-white font-mono">00</div>
                <div className="text-[9px] text-white/40 uppercase font-black">Minutos</div>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <div className="text-3xl font-black text-white font-mono">00</div>
                <div className="text-[9px] text-white/40 uppercase font-black">Segundos</div>
              </div>
            </div>
            <p className="text-[10px] text-emerald-400 font-bold">
              ⚡ Nossa equipe jurídica costuma aprovar o crédito em menos de 24 horas úteis!
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 text-left max-w-xl mx-auto space-y-4">
            <h3 className="font-black text-sm text-sun uppercase tracking-wider flex items-center gap-2">
              📋 Dados do Estudo Fotovoltaico
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <span className="text-white/40 font-bold block text-[9px] uppercase">Potência do Sistema</span>
                <strong className="text-white text-sm font-black">{NUM(Number(p.kwp_sistema), 2)} kWp</strong>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <span className="text-white/40 font-bold block text-[9px] uppercase">Geração Mensal Esperada</span>
                <strong className="text-white text-sm font-black">{NUM(Number(p.geracao_mensal_kwh))} kWh</strong>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <span className="text-white/40 font-bold block text-[9px] uppercase">Economia Mensal Estimada</span>
                <strong className="text-emerald-400 text-sm font-black">{BRL(Number(p.economia_mensal))}</strong>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                <span className="text-white/40 font-bold block text-[9px] uppercase">Redução de Emissões CO₂</span>
                <strong className="text-white text-sm font-black">{NUM(Number(p.co2_evitado_ton), 1)} t/ano</strong>
              </div>
            </div>
          </div>

          {parceiro && (
            <div className="text-white/50 text-xs font-medium">
              Dúvidas sobre o cadastro? Fale com seu consultor <strong>{parceiro.nome}</strong> no telefone <strong>{parceiro.telefone}</strong>.
            </div>
          )}
        </main>

        <footer className="py-6 border-t border-white/5 text-center text-xs text-white/40 bg-black">
          ESOL Energy © {new Date().getFullYear()} · Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  if (docCotacao) {
    return (
      <div className="bg-[#000512] text-white font-sans min-h-screen flex flex-col justify-between relative overflow-hidden">
        {/* Glowing Coronas */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-sun/10 to-transparent blur-[120px] pointer-events-none" />
        
        <header className="bg-white/[0.01] border-b border-white/[0.06] backdrop-blur-md py-8 px-6 md:px-12 relative z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <img src={logo} alt="ESOL Energy" className="h-10 w-auto brightness-0 invert" />
            <div className="text-right text-xs">
              <span className="text-white/40 text-[9px] uppercase tracking-widest font-black">Cotação Solar</span>
              <div className="font-mono font-black text-sun tracking-wider">#{String(p.id || "").slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10 md:py-16 space-y-10 flex-1 w-full relative z-10">
          <div className="space-y-2 animate-fade-up">
            <h1 className="text-3xl font-black text-white tracking-tight md:text-5xl font-display">
              Cotação Comercial de Energia Solar
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-medium">
              Preparamos este orçamento rápido sob medida para o consumo estimado de <strong>{NUM(Number(p.consumo_kwh))} kWh/mês</strong> em <strong>{p.cidade || "sua localidade"}/{p.estado}</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Dados do Estudo */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 rounded-2xl">
                  <span className="text-white/40 font-bold block text-[9px] uppercase tracking-wider">Potência Sugerida</span>
                  <div className="text-2xl font-black text-white mt-1 font-mono">{NUM(Number(p.kwp_sistema), 2)} kWp</div>
                  <span className="text-[10px] text-white/50 block mt-1 font-medium">Área estimada: {NUM(Number(p.area_necessaria_m2 || p.kwp_sistema * 6), 1)} m²</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 rounded-2xl">
                  <span className="text-white/40 font-bold block text-[9px] uppercase tracking-wider">Economia Mensal</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{BRL(Number(p.economia_mensal))}</div>
                  <span className="text-[10px] text-white/50 block mt-1 font-medium">Economia anual de {BRL(Number(p.economia_anual))}</span>
                </div>
              </div>

              {/* Detalhes do Kit Selecionado */}
              {p.kit_nome && (
                <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 space-y-3 font-sans">
                  <span className="text-[10px] uppercase font-black tracking-widest text-sun block">Equipamento Selecionado</span>
                  <strong className="text-white text-sm font-black block">{p.kit_nome}</strong>
                  <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-white/5 pt-3 font-semibold">
                    <div>
                      <span className="text-white/40 font-bold block text-[9px] uppercase">Garantia Painéis</span>
                      <strong className="text-white font-bold">{p.kit_garantia_modulos_anos || 25} anos</strong>
                    </div>
                    <div>
                      <span className="text-white/40 font-bold block text-[9px] uppercase">Garantia Inversor</span>
                      <strong className="text-white font-bold">{p.kit_garantia_inversor_anos || 10} anos</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Preços */}
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-sm text-sun uppercase tracking-wider">Opções de Aquisição</h3>
                <div className="divide-y divide-white/5 text-xs font-semibold">
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <strong className="text-white text-sm font-bold block">💰 Pagamento À Vista</strong>
                      <span className="text-[10px] text-white/50 font-medium">Desconto de 5% de tabela já aplicado</span>
                    </div>
                    <span className="text-xl font-black text-emerald-400 font-mono">{BRL(simFinanceiro.valorVista)}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <strong className="text-white text-sm font-bold block">💳 Cartão de Crédito em 10x</strong>
                      <span className="text-[10px] text-white/50 font-medium">Parcelado sem juros nas bandeiras tradicionais</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white font-mono">{BRL(simFinanceiro.valorCartaoParcela)}/mês</span>
                      <span className="text-[9px] text-white/40 block mt-0.5 font-mono">Total: {BRL(simFinanceiro.valorCartaoTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Lateral: Contato e Ações */}
            <div className="space-y-4">
              {parceiro && (
                <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-5 shadow-sm space-y-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Consultor Responsável</span>
                    <h4 className="font-black text-white text-sm mt-1">{parceiro.nome}</h4>
                    {parceiro.telefone && <p className="text-xs text-white/60 mt-0.5">{parceiro.telefone}</p>}
                  </div>
                  <a
                    href={`https://wa.me/55${parceiro.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${parceiro.nome}! Recebi minha Cotação Solar nº ${String(p.id).slice(0, 8).toUpperCase()} e gostaria de fechar.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-black text-xs h-10 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    💬 Aceitar & Chamar no WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-white/5 text-center text-xs text-white/40 bg-black">
          ESOL Energy © {new Date().getFullYear()} · Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  const docFinAprovadoFlag = docFinAprovado && dadosAprovados;

  return (
    <div className="bg-[#000512] text-white font-sans min-h-screen relative overflow-hidden" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}>
      
      {/* Global Glowing Coronas */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-sun/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#0a2d6e]/20 to-transparent blur-[100px] pointer-events-none animate-sun-pulse" />
      <div className="absolute bottom-[10%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-sun/5 to-transparent blur-[110px] pointer-events-none" />

      {docFinAprovadoFlag && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white py-3.5 px-6 text-center font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 animate-fade-in relative z-50 print:hidden">
          <ShieldCheck className="w-4 h-4 animate-bounce" /> CRÉDITO SOLAR PRÉ-APROVADO: Financiamento liberado via {FINANCEIRAS_ESTIMADO[dadosAprovados.banco as keyof typeof FINANCEIRAS_ESTIMADO]?.nome || dadosAprovados.banco.toUpperCase()} em {dadosAprovados.prazo}x de {BRL(dadosAprovados.pmt)} (Taxa de {dadosAprovados.taxa}% a.m.)!
        </div>
      )}

      {/* ========================================================
          PÁGINA 1: CAPA (HERO CINEMÁTICO)
          ======================================================== */}
      <section className="relative px-6 md:px-12 py-16 md:py-28 min-h-[90vh] md:min-h-screen flex flex-col justify-between print:page-break-after-always print:min-h-[95vh] print:py-10">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between gap-12">
          
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-lg border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-[1.03]">
              <img src={logo} alt="ESOL Energy" className="h-7 md:h-9 w-auto object-contain" />
            </div>
            <div className="text-right">
              <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Estudo Técnico-Comercial</span>
              <div className="font-mono text-xs font-black text-sun tracking-wider mt-0.5">
                Nº {String(p.id || "").slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Main Hero Grid */}
          <div className="grid md:grid-cols-12 gap-8 items-center my-auto">
            {/* Texto de Abertura */}
            <div className="md:col-span-7 space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-sun/10 text-sun px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-sun/20">
                <Sun className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "20s" }} /> ENERGIA SOLAR FOTOVOLTAICA
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.08] tracking-tight">
                Olá, <span className="bg-gradient-to-r from-sun to-amber-400 bg-clip-text text-transparent">
                  {cliente?.nome 
                    ? cliente.nome.split(" ")[0].charAt(0).toUpperCase() + cliente.nome.split(" ")[0].slice(1).toLowerCase()
                    : "Cliente"}
                </span>
                <br />Deixe o sol trabalhar por você.
              </h1>
              
              <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
                Preparamos uma projeção exclusiva baseada no seu consumo mensal de <strong className="text-white font-bold">{NUM(Number(p.consumo_kwh))} kWh</strong> em {p.cidade || "sua localidade"}/{p.estado}. Reduza sua fatura e conquiste independência da concessionária.
              </p>
            </div>

            {/* Imagem Cover Premium */}
            <div className="md:col-span-5 relative group print:hidden">
              <div className="absolute -inset-1 bg-gradient-to-tr from-sun/30 to-[#2E44B8]/30 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 shadow-glow" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] shadow-deep">
                <img 
                  src={heroHouse} 
                  alt="Instalação Fotovoltaica ESOL" 
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] uppercase font-black text-sun tracking-widest">Projeto Exclusivo</span>
                  <p className="text-[11px] text-white/80 font-medium">Usinas residenciais premium integradas à arquitetura.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Consultor / Footer do Hero */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-white/10">
            {parceiro ? (
              <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-md rounded-2xl p-4 w-full md:w-auto">
                {parceiro.avatar_url ? (
                  <img src={parceiro.avatar_url} alt={parceiro.nome} className="w-12 h-12 rounded-full object-cover border border-sun" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sun/10 text-sun font-black flex items-center justify-center text-lg border border-sun/20">
                    {parceiro.nome?.[0]?.toUpperCase() || "E"}
                  </div>
                )}
                <div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest font-black">Consultor Responsável</div>
                  <strong className="text-sm font-black text-white">{parceiro.nome || "Consultor ESOL"}</strong>
                  <div className="flex gap-3 text-xs text-white/70 mt-0.5">
                    {parceiro.telefone && <span className="flex items-center gap-1 font-semibold"><Phone className="w-3 h-3 text-sun" />{parceiro.telefone}</span>}
                    {parceiro.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-sun" />{parceiro.email}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/40">
                ESOL Energy · CNPJ 60.129.009/0001-29 · Todos os direitos reservados.
              </div>
            )}
            
            <div className="text-left md:text-right text-xs text-white/60 font-medium animate-fade-in">
              Válido por {validadeDias} dias · {expiraEm ? `Expira em: ${expiraEm.toLocaleDateString("pt-BR")}` : ""}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          PÁGINA 2: O ESTUDO FOTOVOLTAICO & ECOLOGIA
          ======================================================== */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto w-full print:page-break-after-always print:py-10" style={{ breakBefore: "page", pageBreakBefore: "always" }}>
        <div className="space-y-12 animate-fade-up">
          
          {/* Section Header */}
          <div className="space-y-2 border-b border-white/10 pb-6">
            <span className="text-sun font-black text-xs uppercase tracking-widest">Dimensionamento Operacional</span>
            <h2 className="text-3xl md:text-5xl font-black">01. O Estudo Fotovoltaico</h2>
          </div>

          {/* Grid de Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon={Zap} label="Potência do Sistema" value={`${NUM(Number(p.kwp_sistema), 2)} kWp`} highlight />
            <Stat icon={TrendingDown} label="Economia Estimada/mês" value={BRL(calc.economia_ajustada_mensal)} highlight />
            <Stat icon={Clock} label="Payback Estimado" value={`${(calc.payback_ajustado_meses / 12).toFixed(1)} anos`} />
            <Stat icon={Leaf} label="Carbono Evitado" value={`${NUM(Number(p.co2_evitado_ton), 1)} t/ano`} />
          </div>

          {/* Análise Faturamento Atual vs Pós-Solar */}
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Tabela de Faturamento */}
            <div className="md:col-span-7 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-sun">Comparativo de Faturamento</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-white/50 font-bold border-b border-white/5 pb-2">
                  <span>Métrica Comercial</span>
                  <div className="flex gap-16 text-right">
                    <span>Sem Solar</span>
                    <span className="text-sun">Com Solar</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                  <span className="font-semibold">Consumo Considerado</span>
                  <div className="flex gap-16 text-right font-bold">
                    <span>{NUM(Number(p.consumo_kwh))} kWh</span>
                    <span className="text-sun">{NUM(Number(p.consumo_kwh))} kWh</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                  <span className="font-semibold text-rose-400">Tarifa Média Concessionária</span>
                  <div className="flex gap-16 text-right font-bold font-mono">
                    <span>{BRL(Number(p.tarifa_kwh))} /kWh</span>
                    <span>-</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                  <span className="font-semibold">Custo de Disponibilidade (Tributado)</span>
                  <div className="flex gap-16 text-right font-bold">
                    <span>-</span>
                    <span className="text-sun">{BRL(calc.custo_disponibilidade_mensal)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                  <span className="font-semibold">Encargos de Fio B (Lei 14.300)</span>
                  <div className="flex gap-16 text-right font-bold">
                    <span>-</span>
                    <span className="text-sun">{BRL(calc.ajuste_fio_b_mensal)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-base font-black pt-2">
                  <span>Fatura Média Estimada</span>
                  <div className="flex gap-16 text-right text-lg">
                    <span className="text-rose-400">{BRL((Number(p.consumo_kwh) * Number(p.tarifa_kwh)) + 22)}</span>
                    <span className="text-emerald-400 font-black">{BRL(calc.custo_disponibilidade_mensal + calc.ajuste_fio_b_mensal + 22)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pegada Ecológica Detalhada */}
            <div className="md:col-span-5 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Leaf className="w-5 h-5" /> Impacto Ambiental Real
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Produzir sua própria energia limpa equivale a um plantio em massa de árvores e redução direta de gases estufa do planeta:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-white">{p.arvores_equivalentes || 25} mudas</strong>
                    <div className="text-[10px] text-white/40 font-medium">Árvores plantadas equivalentes por ano</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-white">{(Number(p.kwp_sistema) * 1400).toFixed(0)} km</strong>
                    <div className="text-[10px] text-white/40 font-medium">Rodados em veículos elétricos sem emitir CO₂</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-white">{(Number(p.kwp_sistema) * 125000).toLocaleString("pt-BR")}</strong>
                    <div className="text-[10px] text-white/40 font-medium">Recargas de bateria de celular evitadas da rede</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          PÁGINA 3: ENGENHARIA & TECNOLOGIA (FLUXOGRAMA SVG ANIMADO)
          ======================================================== */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto w-full print:page-break-after-always print:py-10" style={{ breakBefore: "page", pageBreakBefore: "always" }}>
        <div className="space-y-12">
          
          {/* Section Header */}
          <div className="space-y-2 border-b border-white/10 pb-6">
            <span className="text-sun font-black text-xs uppercase tracking-widest">Tecnologia Aplicada</span>
            <h2 className="text-3xl md:text-5xl font-black">02. Engenharia & Fluxo On-Grid</h2>
          </div>

          {/* Diagrama SVG Animado do Fluxo de Energia */}
          <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-deep">
            <span className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-4">Fluxo de Conversão e Injeção On-Grid</span>
            
            <div className="w-full max-w-2xl aspect-[16/7] relative">
              <svg viewBox="0 0 800 350" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Definições de Gradients e Efeitos */}
                <defs>
                  <linearGradient id="solarGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </linearGradient>
                  <linearGradient id="gridGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Linha de Conexão: Painéis -> Inversor */}
                <path d="M 150 175 L 400 175" stroke="url(#solarGlow)" strokeWidth="4" strokeDasharray="10 12" className="animate-flow-dash" style={{ strokeDashoffset: 100, animation: "marquee 6s linear infinite" }} />
                
                {/* Linha de Conexão: Inversor -> Quadro/Rede */}
                <path d="M 400 175 L 650 175" stroke="url(#gridGlow)" strokeWidth="4" strokeDasharray="10 12" className="animate-flow-dash" style={{ strokeDashoffset: 100, animation: "marquee 4s linear infinite" }} />

                {/* Node 1: Módulos Fotovoltaicos */}
                <g transform="translate(150, 175)" filter="url(#glowEffect)">
                  <circle r="45" fill="#000e2b" stroke="#FFD700" strokeWidth="3" />
                  <path d="M -15 -15 H 15 V 15 H -15 Z" fill="none" stroke="#FFD700" strokeWidth="2" />
                  <path d="M -15 0 H 15 M 0 -15 V 15" stroke="#FFD700" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="4" fill="#FFC107" />
                  <text y="65" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" className="uppercase tracking-wider">Módulos</text>
                  <text y="78" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Corrente Contínua</text>
                </g>

                {/* Node 2: Inversor Inteligente */}
                <g transform="translate(400, 175)" filter="url(#glowEffect)">
                  <circle r="48" fill="#000e2b" stroke="#FF8C00" strokeWidth="3" />
                  <rect x="-18" y="-18" width="36" height="36" rx="4" fill="none" stroke="#FF8C00" strokeWidth="2.5" />
                  <path d="M -10 10 L 10 -10 M -10 -5 L -5 -10 M 5 10 L 10 5" stroke="#FF8C00" strokeWidth="2" />
                  <text y="68" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" className="uppercase tracking-wider">Inversor</text>
                  <text y="81" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Conversão CC para CA</text>
                </g>

                {/* Node 3: Quadro de Distribuição / Rede */}
                <g transform="translate(650, 175)" filter="url(#glowEffect)">
                  <circle r="45" fill="#000e2b" stroke="#10B981" strokeWidth="3" />
                  <path d="M -12 -15 L 12 -15 L 12 15 L -12 15 Z" fill="none" stroke="#10B981" strokeWidth="2" />
                  <path d="M -6 -5 L 0 -12 L 6 -5 M 0 -12 V 10" stroke="#10B981" strokeWidth="2" />
                  <text y="65" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" className="uppercase tracking-wider">Rede & Consumo</text>
                  <text y="78" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Consumo e Excedente</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Componentes do Gerador (BOM) */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Lista Detalhada do Kit */}
            <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-sun">Lista de Equipamentos</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{p.kit_nome || "Kit Fotovoltaico Residencial"}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">Estruturas Premium Alumínio</span>
                  </div>
                  <Badge className="bg-sun/10 text-sun border border-sun/20 font-bold uppercase tracking-wider text-[9px]">Principal</Badge>
                </div>
                
                {componentesKit[0] && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{componentesKit[0].split(" de ")[0]}</span>
                      <span className="text-xs text-white/50">Módulos Fotovoltaicos de Alta Performance</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white/40">Garantia: {p.kit_garantia_modulos_anos || 25} Anos</span>
                  </div>
                )}

                {componentesKit[1] && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{componentesKit[1].split(" (")[0]}</span>
                      <span className="text-xs text-white/50">Inversor Interligado à Rede (CA/CC)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white/40">Garantia: {p.kit_garantia_inversor_anos || 10} Anos</span>
                  </div>
                )}

                {componentesKit[2] && (
                  <div className="flex justify-between items-center pb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">Estrutura e Cabeamento</span>
                      <span className="text-xs text-white/50">Estrutura de alumínio e {componentesKit[3]?.split(" de ")[0] || "cabos"}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white/40">Inclusos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ficha Técnica de Engenharia */}
            <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-sun">Ficha Técnica e Homologação</h3>
              <div className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider block font-bold">Tipo de Telhado</span>
                    <strong className="text-white text-xs font-bold block mt-0.5">{p.tipo_instalacao?.toUpperCase() || "RESIDENCIAL"}</strong>
                  </div>
                  <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider block font-bold">Carga Estática Adicional</span>
                    <strong className="text-white text-xs font-bold block mt-0.5">&lt; 15 kg/m² (Super Leve)</strong>
                  </div>
                  <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider block font-bold">HSP Média da Região</span>
                    <strong className="text-white text-xs font-bold block mt-0.5">{NUM(5.12, 2)} kWh/m²/dia</strong>
                  </div>
                  <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider block font-bold">Homologação da Usina</span>
                    <strong className="text-emerald-400 text-xs font-black block mt-0.5">INCLUSA (100% Homologado)</strong>
                  </div>
                </div>

                <div className="text-[10px] text-white/50 bg-white/[0.01] border border-white/[0.05] p-3.5 rounded-2xl leading-relaxed">
                  ⚡ <strong>Engenharia ESOL:</strong> Todas as nossas usinas acompanham ART (Anotação de Responsabilidade Técnica) do engenheiro eletricista responsável e homologação completa na concessionária local inclusa sem custos.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          PÁGINA 4: ATRATIVIDADE FINANCEIRA & CUSTO DA INÉRCIA
          ======================================================== */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto w-full print:page-break-after-always print:py-10" style={{ breakBefore: "page", pageBreakBefore: "always" }}>
        <div className="space-y-12 animate-fade-up">
          
          {/* Section Header */}
          <div className="space-y-2 border-b border-white/10 pb-6">
            <span className="text-sun font-black text-xs uppercase tracking-widest">Viabilidade Econômica</span>
            <h2 className="text-3xl md:text-5xl font-black">03. Atratividade & Viabilidade Financeira</h2>
          </div>

          {/* Comparativo ROI Solar vs Mercado Tradicional */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 rounded-2xl text-center">
              <span className="text-white/40 text-[9px] uppercase tracking-widest font-black">TIR (Retorno Solar ESOL)</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">+{calc.tir_anual_pct > 0 ? calc.tir_anual_pct.toFixed(2) : "22.4"}% <span className="text-xs">a.a.</span></div>
              <span className="text-[9px] text-white/50 block mt-1">Supera qualquer aplicação conservadora de mercado</span>
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 rounded-2xl text-center">
              <span className="text-white/40 text-[9px] uppercase tracking-widest font-black">CDI (Renda Fixa Líquida)</span>
              <div className="text-3xl font-black text-white/70 mt-1 font-mono">~8.5% <span className="text-xs">a.a.</span></div>
              <span className="text-[9px] text-white/50 block mt-1">Cenário de CDI bruto a 10.75% ao ano</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 rounded-2xl text-center">
              <span className="text-white/40 text-[9px] uppercase tracking-widest font-black">Poupança Oficial</span>
              <div className="text-3xl font-black text-white/40 mt-1 font-mono">~6.17% <span className="text-xs">a.a.</span></div>
              <span className="text-[9px] text-white/50 block mt-1">Rendimento oficial do Banco Central</span>
            </div>
          </div>

          {/* Gráfico de Economia de Energia */}
          <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-sun">Projeção de Economia em 25 anos</h3>
                <p className="text-xs text-white/50">Previsão baseada na inflação energética histórica de 8% ao ano.</p>
              </div>
              
              {/* Seletor Anual/Acumulado */}
              <div className="flex bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 font-bold text-[10px] uppercase tracking-wider print:hidden">
                <button 
                  onClick={() => setSavingsView("anual")} 
                  className={`px-3 py-1.5 rounded-lg transition-all ${savingsView === "anual" ? "bg-sun text-navy font-black shadow" : "text-white/60 hover:text-white"}`}
                >
                  Economia Anual
                </button>
                <button 
                  onClick={() => setSavingsView("acumulado")} 
                  className={`px-3 py-1.5 rounded-lg transition-all ${savingsView === "acumulado" ? "bg-sun text-navy font-black shadow" : "text-white/60 hover:text-white"}`}
                >
                  Patrimônio Acumulado
                </button>
              </div>
            </div>

            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barSolarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="ano" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => `R$ ${Math.round(v/1000)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(10, 20, 40, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(8px)" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", fontWeight: "bold" }}
                    itemStyle={{ color: "#FFC107" }}
                    formatter={(value: any) => [BRL(Number(value)), savingsView === "anual" ? "Economia no Ano" : "Acumulado"]}
                  />
                  <Bar dataKey="economia" fill="url(#barSolarGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* O Custo da Inércia (Alerta de Urgência) */}
          <div className="bg-gradient-to-br from-rose-950/40 via-red-950/20 to-transparent border border-rose-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-glow" style={{ shadowColor: "rgba(239, 68, 68, 0.1)" } as any}>
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-2xl text-2xl font-bold shrink-0 border border-rose-500/20 animate-pulse">
              ⚠️
            </div>
            <div className="space-y-2">
              <span className="text-rose-400 font-black text-[10px] uppercase tracking-widest">O Custo do não fazer nada (Inércia)</span>
              <h4 className="text-lg font-black text-white">
                Se você não agir hoje, gastará cerca de <span className="text-rose-400">{BRL(custoInercia25Anos)}</span> nos próximos 25 anos com a concessionária.
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Este montante é perdido integralmente sem gerar nenhum patrimônio para a sua residência. Com o sistema fotovoltaico instalado, você converte essa despesa obrigatória em um gerador de riqueza e valorização patrimonial imediata.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          PÁGINA 5: PROPOSTA COMERCIAL, SIMULAÇÃO & FECHAMENTO
          ======================================================== */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto w-full print:py-10" style={{ breakBefore: "page", pageBreakBefore: "always" }}>
        <div className="space-y-12">
          
          {/* Section Header */}
          <div className="space-y-2 border-b border-white/10 pb-6">
            <span className="text-sun font-black text-xs uppercase tracking-widest">Condições de Aquisição</span>
            <h2 className="text-3xl md:text-5xl font-black">04. Proposta Comercial & Fechamento</h2>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Preços e Opções de Pagamento */}
            <div className="md:col-span-7 space-y-6">
              
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-deep">
                <span className="text-[10px] uppercase font-black text-sun tracking-widest block">Valores do Investimento</span>
                
                <div className="divide-y divide-white/5">
                  <div className="py-4 flex justify-between items-center font-medium">
                    <div>
                      <strong className="text-white text-base font-black block">💰 Pagamento à Vista (Pix/TED)</strong>
                      <span className="text-[10px] text-white/50 font-medium">Desconto de 5% de tabela já aplicado</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{BRL(simFinanceiro.valorVista)}</span>
                  </div>

                  <div className="py-4 flex justify-between items-center font-medium">
                    <div>
                      <strong className="text-white text-base font-black block">💳 Cartão de Crédito em 10x</strong>
                      <span className="text-[10px] text-white/50">Sem juros nas bandeiras tradicionais</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono">{BRL(simFinanceiro.valorCartaoParcela)}/mês</span>
                      <span className="text-[10px] text-white/40 block mt-0.5 font-mono">Total: {BRL(simFinanceiro.valorCartaoTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulador de Financiamento Solar */}
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black uppercase tracking-wider text-sun flex items-center gap-2">
                    🏦 Financiamento Solar Customizado
                  </h3>
                  {docFinAprovado && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase text-[8px] tracking-widest">Pré-Aprovado</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                    <span className="text-white/40 block">Banco Operador</span>
                    <Select 
                      disabled={!!dadosAprovados} 
                      value={selectedFin} 
                      onValueChange={(val: any) => setSelectedFin(val)}
                    >
                      <SelectTrigger className="bg-transparent border-0 p-0 text-white font-black text-xs focus:ring-0 select-none cursor-pointer">
                        <SelectValue placeholder="Selecione o Banco" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#000512] border-white/10 text-white text-xs">
                        {Object.entries(FINANCEIRAS_ESTIMADO).map(([k, v]: any) => (
                          <SelectItem key={k} value={k} className="hover:bg-white/5 cursor-pointer">{v.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] p-3 rounded-2xl">
                    <span className="text-white/40 block">Prazo Parcelamento</span>
                    <Select 
                      disabled={!!dadosAprovados} 
                      value={String(selectedPrazo)} 
                      onValueChange={(val: any) => setSelectedPrazo(Number(val))}
                    >
                      <SelectTrigger className="bg-transparent border-0 p-0 text-white font-black text-xs focus:ring-0 select-none cursor-pointer">
                        <SelectValue placeholder="Prazo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#000512] border-white/10 text-white text-xs">
                        {[24, 36, 48, 60, 72, 84].map((p) => (
                          <SelectItem key={p} value={String(p)} className="hover:bg-white/5 cursor-pointer">{p} meses</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Exibição da Parcela do Financiamento */}
                <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-xs text-white/50 font-bold block uppercase tracking-wider">Valor da Parcela Estimada</span>
                    <span className="text-2xl font-black text-sun font-mono">{BRL(simFinanceiro.valorParcela)}/mês</span>
                  </div>
                  <div className="text-right text-[10px] text-white/50 font-bold font-mono leading-normal">
                    <span>Taxa Ref: {simFinanceiro.finInfo.cetMensal}% a.m.</span>
                    <span className="block mt-0.5 font-mono">Total Financiado: {BRL(simFinanceiro.custoTotalFinanciado)}</span>
                  </div>
                </div>

                <p className={`text-xs p-3.5 rounded-2xl font-bold leading-relaxed border ${
                  simFinanceiro.nivelViabilidade === "alta" 
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                    : simFinanceiro.nivelViabilidade === "media"
                    ? "bg-amber-500/5 border-amber-500/10 text-amber-400"
                    : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                }`}>
                  📈 {simFinanceiro.descViabilidade}
                </p>
              </div>

            </div>

            {/* Ações, FAQs e Objeções */}
            <div className="md:col-span-5 space-y-6">
              
              {/* FAQs integrados para quebra de objeções */}
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-sun">Dúvidas Frequentes</h3>
                <div className="space-y-2.5 animate-fade-in">
                  <ObjectionItem 
                    question="Como funciona em dias nublados ou chuvosos?" 
                    answer="O sistema solar continua funcionando mesmo sob chuva ou nuvens, aproveitando a radiação solar difusa. Nesses períodos, a geração é inferior, mas você utiliza o acúmulo de créditos injetados durante os dias ensolarados na concessionária." 
                  />
                  <ObjectionItem 
                    question="O que diz a Lei 14.300 sobre cobranças?" 
                    answer="A Lei 14.300 regulamentou o pagamento do Fio B de forma escalonada sobre a energia injetada na rede. Nossos cálculos reativos já consideram essa regulamentação, garantindo a fidelidade dos paybacks apresentados." 
                  />
                  <ObjectionItem 
                    question="Qual a manutenção necessária nos painéis?" 
                    answer="A única manutenção necessária é a lavagem periódica com água corrente das placas para remoção de poeira e detritos (duas vezes ao ano são recomendadas), garantindo que a captação permaneça em eficiência máxima." 
                  />
                </div>
              </div>

              {/* Botões de Ações de Fechamento */}
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-4 shadow-deep">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Confirmar Contratação</h3>
                
                {publico ? (
                  <div className="space-y-3">
                    <button 
                      onClick={onAceitar} 
                      className="w-full bg-gradient-to-r from-sun to-amber-500 hover:from-sun-deep hover:to-amber-600 text-navy font-black text-xs uppercase tracking-widest h-12 rounded-2xl shadow-glow transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 cta-halo cursor-pointer"
                      style={{ animationDuration: "2.6s" } as any}
                    >
                      ✓ Aceitar & Assinar Proposta
                    </button>
                    
                    <button 
                      onClick={() => window.print()} 
                      className="w-full border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-widest h-12 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      🖨️ Imprimir / Salvar PDF
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 print:hidden">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={onAceitar} 
                        className="bg-gradient-to-r from-sun to-amber-500 text-navy font-black text-[10px] uppercase tracking-wider h-11 rounded-xl shadow-glow transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ✓ Aceitar
                      </button>
                      <button 
                        onClick={onRecusar} 
                        className="border border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-bold text-[10px] uppercase tracking-wider h-11 rounded-xl transition-all cursor-pointer"
                      >
                        Recusar
                      </button>
                    </div>

                    <button 
                      onClick={() => window.print()} 
                      className="w-full border border-white/5 bg-white/[0.01] hover:bg-white/5 text-white font-bold text-xs uppercase tracking-widest h-11 rounded-xl transition-all cursor-pointer"
                    >
                      🖨️ Imprimir / Salvar PDF
                    </button>
                  </div>
                )}
                
                {parceiro?.telefone && (
                  <a
                    href={`https://wa.me/55${parceiro.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${parceiro.nome}, recebi a proposta solar Nº ${String(p.id).slice(0, 8).toUpperCase()} e gostaria de tirar algumas dúvidas.`)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-black text-xs uppercase tracking-widest h-12 rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-md print:hidden"
                  >
                    💬 Falar com o Consultor
                  </a>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          RODAPÉ GERAL DE TRUST E AGILIDADE
          ======================================================== */}
      <section className="bg-black/40 border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center animate-fade-in">
          <Trust icon={ShieldCheck} title="25 anos" subtitle="Garantia dos módulos" />
          <Trust icon={Award} title="Certificada" subtitle="Equipe especializada" />
          <Trust icon={Home} title="Homologação" subtitle="Concessionária local" />
          <Trust icon={Leaf} title={`${p.arvores_equivalentes || 25} árvores`} subtitle="Equivalente plantadas" />
        </div>
      </section>

      {/* Footer Final */}
      <footer className="bg-black py-10 px-6 text-center text-xs text-white/40 border-t border-white/5">
        <img src={logo} alt="ESOL" className="h-9 w-auto brightness-0 invert mx-auto mb-3" />
        <div>ESOL Energy · CNPJ 60.129.009/0001-29</div>
        <div className="text-white/30 mt-1 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3 text-sun" /> Deixe o sol trabalhar por você
        </div>
      </footer>

    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }: any) {
  const iconColorClass = highlight 
    ? "bg-sun/10 text-sun border-sun/20" 
    : "bg-white/5 text-white/80 border-white/10";

  return (
    <div className={`rounded-2xl p-6 border text-center transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
      highlight 
        ? "bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-sun/30 shadow-[0_8px_30px_rgb(245,158,11,0.06)]" 
        : "bg-gradient-to-b from-white/[0.02] to-white/[0.00] border-white/10 shadow-sm"
    }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border backdrop-blur-sm ${iconColorClass}`}>
        <Icon className={`w-5 h-5 ${highlight ? "animate-pulse" : ""}`} />
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{label}</div>
      <div className="font-display font-black text-xl md:text-2xl text-white mt-1.5 leading-none">{value}</div>
    </div>
  );
}
function SpecCard({ title, children }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-sun font-black mb-3">{title}</div>
      <div className="space-y-2.5 text-xs text-slate-300 font-medium">{children}</div>
    </div>
  );
}
function Row({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between gap-2 border-b border-dashed border-white/10 last:border-0 pb-2.5 last:pb-0 text-xs font-semibold">
      <span className="text-white/60">{label}</span>
      <span className={`font-black ${highlight ? "text-sun" : "text-white"}`}>{value}</span>
    </div>
  );
}
function Bullet({ children }: any) {
  return (
    <div className="flex gap-2 text-xs font-medium leading-relaxed">
      <span className="text-sun font-black">✓</span>
      <span className="text-slate-300">{children}</span>
    </div>
  );
}
function Trust({ icon: Icon, title, subtitle }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Icon className="w-8 h-8 text-sun animate-float-soft" />
      <div className="font-display font-black text-sm text-white uppercase tracking-wider">{title}</div>
      <div className="text-[10px] text-white/40 font-medium">{subtitle}</div>
    </div>
  );
}

function ObjectionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06] rounded-2xl p-4.5 space-y-2 transition-all text-left hover:bg-white/[0.01]">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center font-bold text-white text-xs text-left uppercase tracking-wider gap-2 focus:outline-none cursor-pointer"
      >
        <span>{question}</span>
        <ChevronDown className={`w-4 h-4 text-sun transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <p className="text-[11px] text-slate-300 leading-relaxed pt-3 border-t border-white/[0.06] animate-fade-in font-medium">
          {answer}
        </p>
      )}
    </div>
  );
}
