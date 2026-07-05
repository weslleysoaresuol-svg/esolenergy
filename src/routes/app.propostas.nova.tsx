import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { calcularProposta, type Parametros, type TipoInstalacao, BRL, NUM, regiaoFromEstado } from "@/lib/proposta-calc";
import { KITS_FALLBACK, FINANCEIRAS_FALLBACK } from "@/lib/kits-fallback";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Sun, Zap, Wallet } from "lucide-react";
import { CidadeEstadoInput } from "@/components/CidadeEstadoInput";

export const Route = createFileRoute("/app/propostas/nova")({ 
  validateSearch: (search: Record<string, unknown>) => ({
    cliente: (search.cliente as string) ?? "",
    modo: (search.modo as string) ?? "proposta",
    consumo: (search.consumo as number | string | undefined),
    cotacao: (search.cotacao as string | undefined),
  }),
  component: NovaProposta 
});

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

async function insertPropostaWithFallback(payload: any) {
  const { data, error } = await supabase.from("propostas").insert(payload as any).select().single();
  if (!error) return { data, error: null };

  console.warn("Falha na gravação inicial. Tentando salvar em formato de compatibilidade...", error);
  const cleanPayload = { ...payload };
    
    // Removendo campos de Kit
    delete (cleanPayload as any).kit_id;
    delete (cleanPayload as any).kit_nome;
    delete (cleanPayload as any).kit_inversor;
    delete (cleanPayload as any).kit_fabricante_modulos;
    delete (cleanPayload as any).kit_imagem_url;
    delete (cleanPayload as any).kit_tecnologia_modulo;
    delete (cleanPayload as any).kit_garantia_modulos_anos;
    delete (cleanPayload as any).kit_garantia_inversor_anos;

    // Removendo indicadores do motor
    delete (cleanPayload as any).economia_ajustada_mensal;
    delete (cleanPayload as any).economia_ajustada_anual;
    delete (cleanPayload as any).economia_ajustada_25_anos;
    delete (cleanPayload as any).payback_ajustado_meses;
    delete (cleanPayload as any).tir_anual_pct;
    delete (cleanPayload as any).vpl_brl;
    delete (cleanPayload as any).custo_disponibilidade_mensal;
    delete (cleanPayload as any).ajuste_fio_b_mensal;

    // Removendo campos financeiros/espelho
    delete (cleanPayload as any).fornecedor;
    delete (cleanPayload as any).custo_equipamentos;
    delete (cleanPayload as any).custo_instalacao;
    delete (cleanPayload as any).custo_frete;
    delete (cleanPayload as any).custo_impostos_compra;
    delete (cleanPayload as any).custo_comissao;
    delete (cleanPayload as any).custo_tributacao_empresa;
    delete (cleanPayload as any).custo_marketing;
    delete (cleanPayload as any).custo_engenharia_fixo;
    delete (cleanPayload as any).custo_overhead;
    delete (cleanPayload as any).custo_garantia;
    delete (cleanPayload as any).custos_operacionais_totais;
    delete (cleanPayload as any).lucro_liquido_real;
    delete (cleanPayload as any).lucro_liquido_pct;
    delete (cleanPayload as any).margem_bruta;

    // Removendo campos do motor reverso v3
    delete (cleanPayload as any).tipo_telhado;
    delete (cleanPayload as any).eh_admin_proposta;
    delete (cleanPayload as any).distribuidora_id;

    return await supabase.from("propostas").insert(cleanPayload as any).select().single();
}

function NovaProposta() {
  const navigate = useNavigate();
  const { user, role, profile } = useCurrentUser();
  const { cliente: clienteIdPreSel, modo, consumo: consumoPreSel, cotacao: cotacaoIdPreSel } = Route.useSearch();
  const [step, setStep] = useState(1);
  const [params, setParams] = useState<Parametros | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoInstalacao>("residencial");
  const [consumo, setConsumo] = useState<number>(500);
  const [tarifa, setTarifa] = useState<number>(0.95);
  const [estado, setEstado] = useState("SP");
  const [cidade, setCidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [condicoes, setCondicoes] = useState("À vista 5% desconto · Financiamento via parceiros bancários");
  const [overrides, setOverrides] = useState<Partial<ReturnType<typeof calcularProposta>>>({});
  const [saving, setSaving] = useState(false);

  // Novos estados para enriquecimento cadastral
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [valorFatura, setValorFatura] = useState("");

  const handleCepChange = async (cepValue: string) => {
    setCep(cepValue);
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
          setEndereco(data.logradouro ? `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ""}` : "");
          toast.success("CEP localizado!");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleConsumoChange = (val: number) => {
    setConsumo(val);
    const faturaCalculada = Math.round(val * tarifa) || 0;
    setValorFatura(String(faturaCalculada));
  };

  const handleFaturaChange = (val: string) => {
    setValorFatura(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setConsumo(Math.round(num / tarifa) || 0);
    }
  };

  // Novos estados para integração de Kits e Financeiras
  const [kits, setKits] = useState<any[]>([]);
  const [financeiras, setFinanceiras] = useState<any[]>([]);
  const [tipoConexao, setTipoConexao] = useState<"monofasico" | "bifasico" | "trifasico">("bifasico");
  const [tipoTelhado, setTipoTelhado] = useState("ceramico");
  const [selectedKitId, setSelectedKitId] = useState<string>("");
  const [selectedCotacaoKitId, setSelectedCotacaoKitId] = useState<string>("");
  const [usuarioAlterouKit, setUsuarioAlterouKit] = useState(false);
  const [selectedFinanceirasIds, setSelectedFinanceirasIds] = useState<string[]>([]);
  const selectedKit = useMemo(() => kits.find((k) => k.id === selectedKitId), [kits, selectedKitId]);

  const [perfilCliente, setPerfilCliente] = useState<"completo" | "cotacao" | "financiamento">("completo");

  // Estados do Roteiro de Vendas & Foco da Proposta
  const [preferenciaFoco, setPreferenciaFoco] = useState<"ambos" | "vista" | "financiado" | "cartao">(
    modo === "financiamento" ? "financiado" : "ambos"
  );
  const [bancoPreSelecionado, setBancoPreSelecionado] = useState<string>("solfacil");
  const [selectedPrazo, setSelectedPrazo] = useState(60);
  const [usarScriptVendas, setUsarScriptVendas] = useState(false);
  const [scriptStep, setScriptStep] = useState(1);

  // Novos campos de simulação de financiamento (Suns Brasil / BV Solar style)
  const [finCpf, setFinCpf] = useState("");
  const [finNasc, setFinNasc] = useState("");
  const [finRenda, setFinRenda] = useState("");
  const [finProfissao, setFinProfissao] = useState("");
  const [finEstadoCivil, setFinEstadoCivil] = useState("solteiro");
  const [finUc, setFinUc] = useState("");
  const [finConcessionaria, setFinConcessionaria] = useState("");
  const [finStep, setFinStep] = useState(1);
  
  // Dados do lead durante conversa (se for cliente novo)
  const [scriptName, setScriptName] = useState("");
  const [scriptPhone, setScriptPhone] = useState("");
  const [scriptInputMode, setScriptInputMode] = useState<"fatura" | "kwh">("fatura");
  const [scriptBill, setScriptBill] = useState("");
  const [scriptKwh, setScriptKwh] = useState("");
  const [scriptCidade, setScriptCidade] = useState("");
  const [scriptEstado, setScriptEstado] = useState("");

  useEffect(() => {
    if (modo === "cotacao" || modo === "financiamento" || modo === "completo") {
      setPerfilCliente(modo as any);
    }
  }, [modo]);

  useEffect(() => {
    (async () => {
      // 1. Parâmetros Comerciais
      try {
        const { data: pr } = await (supabase.rpc as any)("get_parametros_publicos");
        if (pr) {
          setParams(pr as any);
          setTarifa(Number((pr as any).tarifa_kwh_default));
        }
      } catch (err) {
        console.warn("Erro ao buscar parâmetros comerciais:", err);
      }

      // 2. Clientes
      let loadedClientes: any[] = [];
      try {
      // Clientes: mais recente no topo (created_at DESC)
      const { data: cs } = await supabase.from("clientes").select("id, nome, telefone, email, cidade, estado, consumo_kwh, valor_fatura").order("created_at", { ascending: false });
      if (cs) {
        setClientes(cs);
        loadedClientes = cs;
      }
      } catch (err) {
        console.warn("Erro ao buscar clientes:", err);
      }

      // 3. Kits Solares
      try {
        const { data: ks, error } = await supabase.from("kits_produtos" as any).select("*");
        if (error || !ks || ks.length === 0) {
          console.warn("Tabela kits_produtos vazia. Usando fallback estático...");
          setKits([...KITS_FALLBACK].sort((a, b) => a.potencia_kwp - b.potencia_kwp));
        } else {
          setKits([...ks].sort((a: any, b: any) => Number(a.potencia_kwp) - Number(b.potencia_kwp)));
        }
      } catch (err) {
        console.warn("Falha de conexão com kits_produtos. Usando fallback estático...", err);
        setKits(KITS_FALLBACK);
      }

      // 4. Financeiras
      try {
        const { data: fs, error } = await supabase.from("financeiras_solar" as any).select("*").eq("ativo", true);
        if (error || !fs || fs.length === 0) {
          console.warn("Tabela financeiras_solar vazia ou inacessível. Usando fallback estático...");
          setFinanceiras(FINANCEIRAS_FALLBACK);
        } else {
          setFinanceiras(fs);
        }
      } catch (err) {
        console.warn("Falha de conexão com financeiras_solar. Usando fallback estático...", err);
        setFinanceiras(FINANCEIRAS_FALLBACK);
      }

      // Pré-seleciona cliente vindo da ficha
      if (clienteIdPreSel && loadedClientes.length > 0) {
        const found = loadedClientes.find((c: any) => c.id === clienteIdPreSel);
        if (found) {
          setSelecionados([found.id]);
          if (found.consumo_kwh) setConsumo(Number(found.consumo_kwh));
          if (found.estado) setEstado(found.estado);
          if (found.cidade) setCidade(found.cidade);
          setTitulo(`Proposta solar - ${found.nome}`);
        }
      }

      // Se vier consumo ou cotação pré-selecionados (ex: ao converter cotação rápida)
      if (consumoPreSel) {
        setConsumo(Number(consumoPreSel));
      }
      if (cotacaoIdPreSel) {
        setObservacoes(`Proposta gerada a partir da cotação rápida de ID: ${cotacaoIdPreSel}`);
        setCondicoes(`À vista 5% desconto · Vínculo com cotação anterior`);
      }
    })();
  }, []);

  // Quando o consumo ou outros parâmetros do dimensionamento mudam, permitimos nova sugestão automática
  useEffect(() => {
    setUsuarioAlterouKit(false);
  }, [consumo, estado, tipo, tarifa]);

  // Seleção automática do melhor kit com base no consumo inserido
  useEffect(() => {
    if (usuarioAlterouKit) return;
    if (params && kits.length > 0) {
      const baseResult = calcularProposta({ consumo_kwh: consumo, tarifa_kwh: tarifa, estado, tipo }, params);
      const kwpIdeal = baseResult.kwp_sistema;
      const kitsAtivos = kits.filter((k) => k.ativo);

      if (kitsAtivos.length > 0) {
        let melhorKit = kitsAtivos[0];
        let menorDiferenca = Math.abs(Number(melhorKit.potencia_kwp) - kwpIdeal);

        for (const kit of kitsAtivos) {
          const diferenca = Math.abs(Number(kit.potencia_kwp) - kwpIdeal);
          if (diferenca < menorDiferenca) {
            menorDiferenca = diferenca;
            melhorKit = kit;
          }
        }
        setSelectedKitId(melhorKit.id);
      }
    }
  }, [params, kits, consumo, estado, tipo, tarifa, usuarioAlterouKit]);

  // Preenche dados do primeiro cliente selecionado
  useEffect(() => {
    if (selecionados.length === 1) {
      const c = clientes.find((x) => x.id === selecionados[0]);
      if (c) {
        if (c.cep) setCep(c.cep);
        if (c.endereco) setEndereco(c.endereco);
        if (c.valor_fatura) {
          setValorFatura(String(c.valor_fatura));
          if (!c.consumo_kwh) {
            setConsumo(Math.round(Number(c.valor_fatura) / tarifa) || 500);
          }
        }
        if (c.consumo_kwh) {
          setConsumo(Number(c.consumo_kwh));
          if (!c.valor_fatura) {
            setValorFatura(String(Math.round(Number(c.consumo_kwh) * tarifa) || 0));
          }
        }
        if (c.estado) setEstado(c.estado);
        if (c.cidade) setCidade(c.cidade);
        if (!titulo) setTitulo(`Proposta solar - ${c.nome}`);
      }
    }
  }, [selecionados, clientes, tarifa]);

  const kitRecomendadoId = useMemo(() => {
    if (params && kits.length > 0) {
      const baseResult = calcularProposta({ consumo_kwh: consumo, tarifa_kwh: tarifa, estado, tipo }, params);
      const kwpIdeal = baseResult.kwp_sistema;
      const kitsAtivos = kits.filter((k) => k.ativo);

      if (kitsAtivos.length > 0) {
        let melhorKit = kitsAtivos[0];
        let menorDiferenca = Math.abs(Number(melhorKit.potencia_kwp) - kwpIdeal);

        for (const kit of kitsAtivos) {
          const diferenca = Math.abs(Number(kit.potencia_kwp) - kwpIdeal);
          if (diferenca < menorDiferenca) {
            menorDiferenca = diferenca;
            melhorKit = kit;
          }
        }
        return melhorKit.id;
      }
    }
  }, [params, kits, consumo, estado, tipo, tarifa]);

  const sortedKits = useMemo(() => {
    if (!kitRecomendadoId) return kits;
    return [...kits].sort((a, b) => {
      if (a.id === kitRecomendadoId) return -1;
      if (b.id === kitRecomendadoId) return 1;
      return 0;
    });
  }, [kits, kitRecomendadoId]);

  const sortedClientes = useMemo(() => {
    return [...clientes].sort((a, b) => {
      // 1. Clientes selecionados primeiro
      const aSel = selecionados.includes(a.id) ? 1 : 0;
      const bSel = selecionados.includes(b.id) ? 1 : 0;
      if (aSel !== bSel) return bSel - aSel;

      // 2. Cliente pre-selecionado (via URL/Search) em seguida
      if (clienteIdPreSel) {
        const aPre = a.id === clienteIdPreSel ? 1 : 0;
        const bPre = b.id === clienteIdPreSel ? 1 : 0;
        if (aPre !== bPre) return bPre - aPre;
      }

      return 0;
    });
  }, [clientes, selecionados, clienteIdPreSel]);

  const getPrecoVendaKit = (kit: any) => {
    if (!params) return Number(kit.preco);
    const p = params as any;
    const comissao_pct = profile?.comissao_percent !== null && profile?.comissao_percent !== undefined
      ? Number(profile.comissao_percent) / 100
      : (p.custo_comissao_pct ?? p.comissao_padrao_pct ?? 0.08);
    const impostos_compra_pct = p.custo_impostos_compra_pct ?? p.custo_impostos_pct ?? 0.03;
    const instalacao_pct = p.custo_instalacao_pct ?? 0.15;
    const frete_pct = p.custo_frete_pct ?? 0.05;
    const margem_pct = p.margem_alvo_pct ?? p.lucro_alvo_pct ?? 0.15;
    const equipamentos_pct = p.custo_equipamentos_pct ?? 0.5;
    const divisor = 1 - (instalacao_pct + frete_pct + impostos_compra_pct + comissao_pct + margem_pct);
    return Number(kit.preco) / (divisor > 0.1 ? divisor : equipamentos_pct);
  };

  // Sincroniza o consumo com base nas entradas do script de vendas (cotacao rapida ou financiamento)
  useEffect(() => {
    const tarifaKwh = params?.tarifa_kwh_default || 0.95;
    if (scriptInputMode === "fatura" && scriptBill) {
      const billVal = Number(scriptBill);
      if (!isNaN(billVal) && billVal > 0) {
        setConsumo(Math.round(billVal / tarifaKwh));
      }
    } else if (scriptInputMode === "kwh" && scriptKwh) {
      const val = Number(scriptKwh);
      if (!isNaN(val) && val > 0) {
        setConsumo(val);
      }
    }
  }, [scriptInputMode, scriptBill, scriptKwh, params]);

  const calculo = useMemo(() => {
    if (!params) return null;
    
    const kitOverrides = selectedKit ? {
      custo_equipamentos_override: Number(selectedKit.preco),
      kwp_override: Number(selectedKit.potencia_kwp),
      qtd_modulos_override: Number(selectedKit.quantidade_modulos),
      distribuidora_id: selectedKit.fornecedor || "Aldo Solar",
    } : {};

    const base = calcularProposta({ 
      consumo_kwh: consumo, 
      tarifa_kwh: tarifa, 
      estado, 
      tipo,
      tipo_telhado: tipoTelhado as any,
      ligacao: tipoConexao === "trifasico" ? "tri" : "mono",
      // Regra de comissão: admin/sócio não tem comissão (lucro é da empresa)
      eh_admin: role === "admin",
      comissao_percent_override: role !== "admin" && profile?.comissao_percent !== null && profile?.comissao_percent !== undefined 
        ? Number(profile.comissao_percent) 
        : undefined,
      ...kitOverrides
    }, params);
    
    if (selectedKit && selectedKit.fabricante_modulos) {
      base.potencia_modulo_w = Number(selectedKit.fabricante_modulos.replace(/\D/g, "")) || params.potencia_modulo_w;
    }
    
    return { ...base, ...overrides };
  }, [params, consumo, tarifa, estado, tipo, tipoTelhado, overrides, selectedKit, tipoConexao, profile, role]);

  const setOverride = (k: string, v: number) => setOverrides((o) => ({ ...o, [k]: v }));

  async function salvar(enviar: boolean) {
    if (!user || !calculo || !params) {
      toast.error("Não foi possível carregar os dados para gerar a proposta");
      return;
    }
    if (selecionados.length === 0) { toast.error("Selecione ao menos um cliente"); return; }
    setSaving(true);
    try {
      // Atualiza a ficha cadastral do cliente selecionado no banco
      await supabase
        .from("clientes")
        .update({
          cep: cep.trim() || null,
          endereco: endereco.trim() || null,
          cidade: cidade.trim() || null,
          estado: estado.trim() || null,
          consumo_kwh: consumo ? Number(consumo) : null,
          valor_fatura: valorFatura ? Number(valorFatura) : null
        })
        .in("id", selecionados);

      const validadeDias = Number(params.validade_proposta_dias || 15);
      
      let finalObservacoes = observacoes;
      if (selectedKit) {
        finalObservacoes = `Kit Selecionado: ${selectedKit.nome}\n` +
          `Módulos: ${selectedKit.quantidade_modulos}x ${selectedKit.fabricante_modulos}\n` +
          `Inversor: ${selectedKit.inversor}\n` +
          `Estrutura do Telhado: ${tipoTelhado.toUpperCase()}\n` +
          `Tipo de Conexão: ${tipoConexao.toUpperCase()}\n\n` +
          observacoes;
      }

      let finalCondicoes = condicoes;
      
      // Injeta tags ocultas para o frontend da PropostaView ler
      const tagDoc = perfilCliente === "cotacao" 
        ? "[DOC:COTACAO]" 
        : perfilCliente === "financiamento" 
          ? "[DOC:FIN_AGUARDANDO]" 
          : "[DOC:PROPOSTA]";
      
      const tagFoco = preferenciaFoco === "vista" 
        ? "[FOCO:VISTA]" 
        : preferenciaFoco === "financiado" 
          ? `[FOCO:FINANCIAMENTO:${bancoPreSelecionado}]` 
          : preferenciaFoco === "cartao"
            ? "[FOCO:CARTAO]"
            : "[FOCO:AMBOS]";
      
      finalCondicoes = `${tagDoc}\n${tagFoco}\n` + finalCondicoes;

      const chosenFinanceiras = financeiras.filter((f) => selectedFinanceirasIds.includes(f.id));
      if (chosenFinanceiras.length > 0) {
        const financingTexts = chosenFinanceiras.map((fin) => {
          const taxaUsada = Number(fin.taxa_cet_mes || fin.taxa_juros_mes);
          const rate = taxaUsada / 100;
          const n = Math.min(60, fin.prazo_maximo_meses);
          const pmt = (calculo.preco_total * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
          return `· ${fin.nome}: ${n}x de ${BRL(Math.round(pmt))}/mês (Taxa CET: ${taxaUsada}% a.m.)`;
        });
        finalCondicoes = `À vista (5% desc.): ${BRL(calculo.preco_total * 0.95)}\n` +
          `Financiamento Sugerido:\n` +
          financingTexts.join("\n") + `\n\n` + condicoes;
      }

      const payload = {
        parceiro_id: user.id,
        titulo: titulo || `Proposta solar`,
        status: (enviar ? "enviada" : "rascunho") as "enviada" | "rascunho",
        tipo_instalacao: tipo,
        consumo_kwh: consumo,
        tarifa_kwh: tarifa,
        estado, cidade, regiao: regiaoFromEstado(estado),
        hsp: calculo.hsp,
        kwp_sistema: calculo.kwp_sistema,
        qtd_modulos: calculo.qtd_modulos,
        potencia_modulo_w: calculo.potencia_modulo_w,
        qtd_inversores: calculo.qtd_inversores,
        potencia_inversor_kw: calculo.potencia_inversor_kw,
        area_necessaria_m2: calculo.area_necessaria_m2,
        geracao_mensal_kwh: calculo.geracao_mensal_kwh,
        economia_mensal: calculo.economia_mensal,
        economia_anual: calculo.economia_anual,
        economia_25_anos: calculo.economia_25_anos,
        payback_meses: calculo.payback_meses,
        co2_evitado_ton: calculo.co2_evitado_ton,
        arvores_equivalentes: calculo.arvores_equivalentes,
        
        // Novos KPIs regulatórios e de atratividade financeira
        economia_ajustada_mensal: calculo.economia_ajustada_mensal,
        economia_ajustada_anual: calculo.economia_ajustada_anual,
        economia_ajustada_25_anos: calculo.economia_ajustada_25_anos,
        payback_ajustado_meses: calculo.payback_ajustado_meses,
        tir_anual_pct: calculo.tir_anual_pct,
        vpl_brl: calculo.vpl_brl,
        custo_disponibilidade_mensal: calculo.custo_disponibilidade_mensal,
        ajuste_fio_b_mensal: calculo.ajuste_fio_b_mensal,

        preco_total: calculo.preco_total,
        preco_por_wp: calculo.preco_por_wp,
        observacoes: finalObservacoes,
        condicoes_pagamento: finalCondicoes,
        validade_dias: validadeDias,
        editada_pelo_admin: role === "admin" && Object.keys(overrides).length > 0,
        enviada_em: enviar ? new Date().toISOString() : null,
        expires_at: new Date(Date.now() + validadeDias * 24 * 3600 * 1000).toISOString(),
        
        // Novos campos vinculados ao kit
        kit_id: selectedKitId || null,
        kit_nome: selectedKit ? selectedKit.nome : null,
        kit_inversor: selectedKit ? selectedKit.inversor : null,
        kit_fabricante_modulos: selectedKit ? selectedKit.fabricante_modulos : null,
        kit_imagem_url: selectedKit ? (selectedKit.imagem_kit_url || selectedKit.imagem_componentes_url) : null,
        kit_tecnologia_modulo: selectedKit ? selectedKit.tecnologia_modulo : null,
        kit_garantia_modulos_anos: selectedKit ? Number(selectedKit.garantia_modulos_anos) : null,
        kit_garantia_inversor_anos: selectedKit ? Number(selectedKit.garantia_inversor_anos) : null,

        // Espelho financeiro gravado no ato da geração
        fornecedor: selectedKit ? (selectedKit.fornecedor || "Aldo Solar") : null,
        custo_equipamentos: calculo.custo_equipamentos,
        custo_instalacao: calculo.custo_instalacao,
        custo_frete: calculo.custo_frete,
        custo_impostos_compra: calculo.custo_impostos_compra,
        custo_comissao: calculo.custo_comissao,
        custo_tributacao_empresa: calculo.custo_tributacao_empresa,
        custo_marketing: calculo.custo_marketing,
        custo_engenharia_fixo: calculo.custo_engenharia_fixo,
        custo_overhead: calculo.custo_overhead,
        custo_garantia: calculo.custo_garantia,
        custos_operacionais_totais: calculo.custos_operacionais_totais,
        lucro_liquido_real: calculo.lucro_liquido_real,
        lucro_liquido_pct: calculo.lucro_liquido_pct,
        margem_bruta: calculo.margem_bruta,
        // Novos campos do motor reverso v3
        tipo_telhado: tipoTelhado,
        eh_admin_proposta: role === "admin",
        distribuidora_id: selectedKit ? (selectedKit.fornecedor || "Aldo Solar") : null,
      };
      let prop: any = null;
      try {
        const { data, error } = await insertPropostaWithFallback(payload);
        if (error) throw error;
        prop = data;
      } catch (insertErr: any) {
        throw new Error(insertErr.message || "Falha ao gravar proposta no banco de dados.");
      }

      // associa clientes
      const assoc = selecionados.map((cid) => ({ proposta_id: prop.id, cliente_id: cid }));
      const { error: assocError } = await supabase.from("proposta_clientes").insert(assoc);
      if (assocError) throw assocError;
      // Atualiza status dos clientes para "proposta_enviada" automaticamente
      if (enviar) {
        await supabase
          .from("clientes")
          .update({ status: "proposta_enviada" as any })
          .in("id", selecionados)
          .in("status", ["novo", "contato", "visita_agendada"] as any);
      }
      toast.success(enviar ? "Proposta gerada! Status dos clientes atualizado." : "Rascunho salvo");
      navigate({ to: "/app/propostas/$id", params: { id: prop.id } });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar a proposta");
    } finally { setSaving(false); }
  }

  const salvarViaScript = async () => {
    if (!user || !params) {
      toast.error("Parâmetros comerciais não carregados.");
      return;
    }
    if (!scriptName || !scriptPhone || !scriptCidade || !scriptEstado) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    setSaving(true);
    try {
      const tarifaKwh = params.tarifa_kwh_default || 0.95;
      let billVal = 0;
      let consumoEstimado = 0;
      if (scriptInputMode === "fatura") {
        billVal = Number(scriptBill) || 0;
        consumoEstimado = billVal > 0 ? Math.round(billVal / tarifaKwh) : 500;
      } else {
        consumoEstimado = Number(scriptKwh) || 500;
        billVal = Math.round(consumoEstimado * tarifaKwh);
      }
      
      // 1. Cadastra o cliente
      const { data: newClient, error: errClient } = await supabase.from("clientes").insert({
        nome: scriptName.trim(),
        telefone: scriptPhone.trim(),
        valor_fatura: billVal > 0 ? billVal : null,
        consumo_kwh: consumoEstimado,
        imovel_tipo: tipo,
        status: "novo",
        origem: "manual",
        cidade: scriptCidade.trim(),
        estado: scriptEstado.trim().toUpperCase(),
        corretor_id: user.id
      }).select().single();

      if (errClient) {
        toast.error("Erro ao salvar cliente: " + errClient.message);
        setSaving(false);
        return;
      }

      // 2. Roda cálculo de dimensionamento
      const baseResultDummy = calcularProposta({ 
        consumo_kwh: consumoEstimado, 
        tarifa_kwh: tarifaKwh, 
        estado: scriptEstado.trim().toUpperCase(), 
        tipo 
      }, params);

      // Encontra melhor kit ou usa o selecionado manualmente na cotação
      let loadedKits = kits.length > 0 ? kits : KITS_FALLBACK;
      const manualKit = perfilCliente === "cotacao" && selectedCotacaoKitId 
        ? loadedKits.find(k => k.id === selectedCotacaoKitId) 
        : null;

      const kitRecomendado = manualKit || (
        loadedKits.filter((k) => k.potencia_kwp >= baseResultDummy.kwp_sistema).length > 0
          ? loadedKits.filter((k) => k.potencia_kwp >= baseResultDummy.kwp_sistema).sort((a, b) => a.preco - b.preco)[0]
          : [...loadedKits].sort((a, b) => b.potencia_kwp - a.potencia_kwp)[0]
      );

      const kitCusto = kitRecomendado ? Number(kitRecomendado.preco) : undefined;
      const kwp = kitRecomendado ? Number(kitRecomendado.potencia_kwp) : baseResultDummy.kwp_sistema;
      const qtdModulos = kitRecomendado ? Number(kitRecomendado.quantidade_modulos) : baseResultDummy.qtd_modulos;
      
      const finalCalculo = calcularProposta({
        consumo_kwh: consumoEstimado,
        tarifa_kwh: tarifaKwh,
        estado: scriptEstado.trim().toUpperCase(),
        tipo,
        ligacao: tipoConexao === "trifasico" ? "tri" : "mono",
        custo_equipamentos_override: kitCusto,
        kwp_override: kwp,
        qtd_modulos_override: qtdModulos,
        comissao_percent_override: profile?.comissao_percent !== null && profile?.comissao_percent !== undefined ? Number(profile.comissao_percent) : undefined,
      }, params);

      const precoTotal = finalCalculo.preco_total;

      // Juros e condições
      const tagDoc = perfilCliente === "cotacao" 
        ? "[DOC:COTACAO]" 
        : perfilCliente === "financiamento" 
          ? "[DOC:FIN_AGUARDANDO]" 
          : "[DOC:PROPOSTA]";
      
      const tagFoco = preferenciaFoco === "vista" 
        ? "[FOCO:VISTA]" 
        : preferenciaFoco === "financiado" 
          ? `[FOCO:FINANCIAMENTO:${bancoPreSelecionado}]` 
          : preferenciaFoco === "cartao"
            ? "[FOCO:CARTAO]"
            : "[FOCO:AMBOS]";
      
      const finalCondicoes = `${tagDoc}\n${tagFoco}\nÀ vista (5% desc.): ${BRL(precoTotal * 0.95)}\nFinanciamento Solar no banco pré-selecionado.`;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (params.validade_proposta_dias || 15));

      // 3. Cadastra Proposta
      const payload = {
        titulo: `Proposta Solar ${tipo === "residencial" ? "Residencial" : tipo === "comercial" ? "Comercial" : tipo === "industrial" ? "Industrial" : "Rural"} - ${newClient.nome}`,
        parceiro_id: user.id,
        kwp_sistema: kwp,
        preco_total: precoTotal,
        codigo_publico: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 10)).join("-"),
        expires_at: expDate.toISOString(),
        status: "enviada",
        kit_id: kitRecomendado?.id || null,
        tipo_instalacao: tipo,
        consumo_kwh: consumoEstimado,
        tarifa_kwh: tarifaKwh,
        estado: scriptEstado.trim().toUpperCase(),
        cidade: scriptCidade.trim(),
        regiao: finalCalculo.regiao,
        hsp: finalCalculo.hsp,
        qtd_modulos: qtdModulos,
        potencia_modulo_w: finalCalculo.potencia_modulo_w,
        qtd_inversores: finalCalculo.qtd_inversores,
        potencia_inversor_kw: finalCalculo.potencia_inversor_kw,
        area_necessaria_m2: finalCalculo.area_necessaria_m2,
        geracao_mensal_kwh: finalCalculo.geracao_mensal_kwh,
        economia_mensal: finalCalculo.economia_mensal,
        economia_anual: finalCalculo.economia_anual,
        economia_25_anos: finalCalculo.economia_25_anos,
        payback_meses: finalCalculo.payback_meses,
        co2_evitado_ton: finalCalculo.co2_evitado_ton,
        arvores_equivalentes: finalCalculo.arvores_equivalentes,
        preco_por_wp: +(precoTotal / (kwp * 1000)).toFixed(2),
        validade_dias: params.validade_proposta_dias || 15,
        condicoes_pagamento: finalCondicoes,
        observacoes: "Gerada pelo Roteiro Guiado de Fechamento de Elite",
        fornecedor: kitRecomendado ? (kitRecomendado.fornecedor || "Aldo Solar") : null,
        custo_equipamentos: finalCalculo.custo_equipamentos,
        custo_instalacao: finalCalculo.custo_instalacao,
        custo_frete: finalCalculo.custo_frete,
        custo_impostos_compra: finalCalculo.custo_impostos_compra,
        custo_comissao: finalCalculo.custo_comissao,
        custo_tributacao_empresa: finalCalculo.custo_tributacao_empresa,
        custo_marketing: finalCalculo.custo_marketing,
        custo_engenharia_fixo: finalCalculo.custo_engenharia_fixo,
        custo_overhead: finalCalculo.custo_overhead,
        custo_garantia: finalCalculo.custo_garantia,
        custos_operacionais_totais: finalCalculo.custos_operacionais_totais,
        lucro_liquido_real: finalCalculo.lucro_liquido_real,
        lucro_liquido_pct: finalCalculo.lucro_liquido_pct,
        margem_bruta: finalCalculo.margem_bruta
      };

      const { data: prop, error: errProp } = await insertPropostaWithFallback(payload);

      if (errProp) {
        console.error("Erro ao criar proposta do script:", errProp);
        navigate({ to: "/app/cliente/$id", params: { id: newClient.id } });
      } else {
        await supabase.from("proposta_clientes").insert({
          proposta_id: prop.id,
          cliente_id: newClient.id
        });
        
        toast.success("Cliente e Proposta gerados com sucesso!");
        navigate({ to: "/app/propostas/$id", params: { id: prop.id } });
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar proposta do roteiro");
    } finally {
      setSaving(false);
    }
  };

  const salvarFinanciamento = async () => {
    if (!params) {
      toast.error("Parâmetros comerciais não carregados.");
      return;
    }
    if (!scriptName || !scriptPhone || !finCpf || !scriptKwh || !scriptCidade || !scriptEstado) {
      toast.error("Por favor, preencha todos os campos obrigatórios (Nome, Celular, CPF, Consumo e Localidade).");
      return;
    }
    
    setSaving(true);
    try {
      // 1. Cria ou atualiza cliente com a ficha de crédito
      const { data: newClient, error: errC } = await supabase
        .from("clientes")
        .insert({
          nome: scriptName,
          telefone: scriptPhone,
          cidade: scriptCidade,
          estado: scriptEstado,
          tipo: tipo || "residencial",
          status: "visita_agendada" as any, // Ficha em análise
          cpf_cnpj: finCpf,
          numero_uc: finUc,
          concessionaria: finConcessionaria,
          forma_pagamento: "financiamento"
        } as any)
        .select()
        .single();
        
      if (errC) throw errC;

      // 2. Dimensiona sistema solar
      const kwh = Number(scriptKwh) || 300;
      const baseResultDummy = calcularProposta({
        consumo_kwh: kwh,
        tarifa_kwh: tarifa || params.tarifa_kwh_default || 0.95,
        estado: scriptEstado.trim().toUpperCase(),
        tipo,
      }, params);

      // Encontra melhor kit comercial
      let loadedKits = kits.length > 0 ? kits : KITS_FALLBACK;
      const adequados = loadedKits.filter((k) => k.potencia_kwp >= baseResultDummy.kwp_sistema);
      const kitRecomendado = adequados.length > 0 
        ? adequados.sort((a, b) => a.preco - b.preco)[0]
        : [...loadedKits].sort((a, b) => b.potencia_kwp - a.potencia_kwp)[0];

      const kitCusto = kitRecomendado ? Number(kitRecomendado.preco) : undefined;
      const kwp = kitRecomendado ? Number(kitRecomendado.potencia_kwp) : baseResultDummy.kwp_sistema;
      const qtdModulos = kitRecomendado ? Number(kitRecomendado.quantidade_modulos) : baseResultDummy.qtd_modulos;

      const finalCalculo = calcularProposta({
        consumo_kwh: kwh,
        tarifa_kwh: tarifa || params.tarifa_kwh_default || 0.95,
        estado: scriptEstado.trim().toUpperCase(),
        tipo,
        ligacao: tipoConexao === "trifasico" ? "tri" : "mono",
        custo_equipamentos_override: kitCusto,
        kwp_override: kwp,
        qtd_modulos_override: qtdModulos,
        comissao_percent_override: profile?.comissao_percent !== null && profile?.comissao_percent !== undefined ? Number(profile.comissao_percent) : undefined,
      }, params);

      const precoTotal = finalCalculo.preco_total;

      // 3. Monta condições de pagamento
      const tagDoc = "[DOC:FIN_AGUARDANDO]";
      const tagFoco = `[FOCO:FINANCIAMENTO:${bancoPreSelecionado}]`;
      const finalCondicoes = `${tagDoc}\n${tagFoco}\nÀ vista (5% desc.): ${BRL(precoTotal * 0.95)}\nFinanciamento Solar no banco pré-selecionado.\nCPF do Proponente: ${finCpf}\nProfissão: ${finProfissao}\nEstado Civil: ${finEstadoCivil}\nRenda Declarada: R$ ${finRenda}`;

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (params.validade_proposta_dias || 15));

      // 4. Cria Proposta
      const payload = {
        titulo: `Simulação de Crédito Solar — ${scriptName.split(" ")[0]}`,
        status: "enviada",
        kwp_sistema: kwp,
        qtd_modulos: qtdModulos,
        preco_total: precoTotal,
        economia_mensal: finalCalculo.economia_mensal,
        economia_anual: finalCalculo.economia_anual,
        payback_meses: finalCalculo.payback_meses,
        geracao_mensal_kwh: finalCalculo.geracao_mensal_kwh,
        co2_evitado_ton: finalCalculo.co2_evitado_ton,
        arvores_equivalentes: finalCalculo.arvores_equivalentes || 5,
        area_necessaria_m2: finalCalculo.area_necessaria_m2,
        condicoes_pagamento: finalCondicoes,
        expires_at: expDate.toISOString(),
        parceiro_id: user?.id,
        tipo_instalacao: tipo || "residencial",
        consumo_kwh: kwh,
        tarifa_kwh: tarifa || 0.85,
        estado: scriptEstado.trim().toUpperCase(),
        cidade: scriptCidade.trim(),
        codigo_publico: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 10)).join("-"),
        validade_dias: params.validade_proposta_dias || 15,
        preco_por_wp: +(precoTotal / (kwp * 1000)).toFixed(2),
        fornecedor: kitRecomendado ? (kitRecomendado.fornecedor || "Aldo Solar") : null,
        custo_equipamentos: finalCalculo.custo_equipamentos,
        custo_instalacao: finalCalculo.custo_instalacao,
        custo_frete: finalCalculo.custo_frete,
        custo_impostos_compra: finalCalculo.custo_impostos_compra,
        custo_comissao: finalCalculo.custo_comissao,
        custo_tributacao_empresa: finalCalculo.custo_tributacao_empresa,
        custo_marketing: finalCalculo.custo_marketing,
        custo_engenharia_fixo: finalCalculo.custo_engenharia_fixo,
        custo_overhead: finalCalculo.custo_overhead,
        custo_garantia: finalCalculo.custo_garantia,
        custos_operacionais_totais: finalCalculo.custos_operacionais_totais,
        lucro_liquido_real: finalCalculo.lucro_liquido_real,
        lucro_liquido_pct: finalCalculo.lucro_liquido_pct,
        margem_bruta: finalCalculo.margem_bruta
      };

      const { data: prop, error: errProp } = await insertPropostaWithFallback(payload);
      if (errProp) throw errProp;

      // 5. Vincula
      await supabase.from("proposta_clientes").insert({
        proposta_id: prop.id,
        cliente_id: newClient.id
      });

      // 6. Insere Interação Inicial
      await supabase.from("interacoes").insert({
        cliente_id: newClient.id,
        autor_id: user?.id,
        tipo: "nota",
        descricao: `Solicitação de crédito cadastrada e enviada para análise nas operadoras. CPF do cliente: ${finCpf}.`
      });

      toast.success("Ficha de financiamento cadastrada! Aguardando retorno da mesa de crédito.");
      navigate({ to: "/app/propostas/$id", params: { id: prop.id } });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar solicitação de financiamento.");
    } finally {
      setSaving(false);
    }
  };

  if (!params) return <div className="text-center py-12 text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Link to="/app/propostas"><Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button></Link>
          <div>
            <h1 className="text-xl font-extrabold text-navy leading-tight">Nova Proposta Comercial</h1>
            <p className="text-[10px] text-muted-foreground">Wizard estruturado para dimensionamento técnico e comercial solar</p>
          </div>
        </div>
      </div>

      {perfilCliente === "cotacao" && (
        <Card className="p-6 border-0 shadow-md space-y-6 bg-white">
          <div className="border-b pb-3">
            <h2 className="font-extrabold text-navy text-sm flex items-center gap-2">
              ⚡ Cotação Rápida (Lead Expresso)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Gere uma estimativa rápida de investimento solar com o menor atrito de informação possível.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Nome do Lead *</Label>
              <Input placeholder="Ex: Maria Souza" value={scriptName} onChange={(e) => setScriptName(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Telefone / WhatsApp *</Label>
              <Input placeholder="Ex: (11) 98888-8888" value={scriptPhone} onChange={(e) => setScriptPhone(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Cidade de Instalação *</Label>
              <Input placeholder="Ex: Sorocaba" value={scriptCidade} onChange={(e) => setScriptCidade(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Estado (UF) *</Label>
              <Select value={scriptEstado} onValueChange={setScriptEstado}>
                <SelectTrigger className="h-9"><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {UFS.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tipo de Imóvel</Label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border w-full">
                {(["residencial", "comercial", "industrial", "rural"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`flex-1 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all ${tipo === t ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                  >
                    {t === "residencial" ? "🏡 Res." : t === "comercial" ? "🏢 Com." : t === "industrial" ? "🏭 Ind." : "🌾 Rural"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Consumo Mensal Médio (kWh) *</Label>
              <Input type="number" placeholder="Ex: 400" value={scriptKwh} onChange={(e) => setScriptKwh(e.target.value)} className="h-9 text-xs font-bold text-navy" />
            </div>
          </div>

          {/* SELEÇÃO DO KIT SOLAR NA COTAÇÃO */}
          <div className="space-y-3 pt-3 border-t">
            <Label className="text-xs font-extrabold text-navy block">Escolha o Kit Solar para a Cotação *</Label>
            <div className="grid sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
              {sortedKits.map((kit) => {
                const isSelected = selectedCotacaoKitId === kit.id;
                const isRecommended = kit.id === kitRecomendadoId;
                return (
                  <label key={kit.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 transition cursor-pointer ${isSelected ? "border-navy bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="cotacaoKit" checked={isSelected} onChange={() => setSelectedCotacaoKitId(kit.id)} className="mt-1 accent-navy" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-navy leading-snug">{kit.nome}</span>
                        {isRecommended && <span className="bg-sun text-navy text-[8px] font-extrabold px-1 rounded">Recomendado</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Potência: <strong>{kit.potencia_kwp} kWp</strong> · {kit.quantidade_modulos}x painéis</div>
                      <div className="text-xs font-extrabold text-emerald-700 mt-1">{BRL(getPrecoVendaKit(kit))}</div>
                    </div>
                    {kit.imagem_kit_url && (
                      <img src={kit.imagem_kit_url} className="size-10 rounded object-cover border" alt="Kit" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t mt-4">
            <div className="text-xs text-muted-foreground self-center">
              * Selecione o kit e todos os campos obrigatórios.
            </div>
            <Button disabled={saving || !scriptName || !scriptPhone || !scriptCidade || !scriptEstado || !scriptKwh || !selectedCotacaoKitId} onClick={salvarViaScript} className="bg-sun hover:bg-sun-deep text-navy font-extrabold text-xs h-9 px-8 rounded-xl shadow-md transition-all flex items-center gap-1">
              {saving ? <span className="animate-spin mr-1">⌛</span> : "Gerar Cotação Expresso 🚀"}
            </Button>
          </div>
        </Card>
      )}

      {perfilCliente === "financiamento" && (
        <div className="space-y-6 animate-fade-in">
          {/* Timeline da Ficha */}
          <div className="flex items-center gap-2 text-xs flex-wrap bg-slate-50 p-3 rounded-2xl border">
            {[
              { n: 1, label: "Dados do Proponente" },
              { n: 2, label: "Localidade & Consumo" },
              { n: 3, label: "Documentação & Envio" }
            ].map((stepObj) => (
              <div key={stepObj.n} className={`flex items-center gap-2 ${stepObj.n <= finStep ? "text-navy font-bold" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${stepObj.n <= finStep ? "bg-sun text-navy font-extrabold" : "bg-slate-200"}`}>{stepObj.n}</div>
                <span>{stepObj.label}</span>
                {stepObj.n < 3 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <Card className="p-6 border-0 shadow-md space-y-6 bg-white font-sans">
            {finStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-navy text-sm">1. Dados do Proponente</h3>
                  <span className="text-[10px] text-muted-foreground">Etapa 1 de 3</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Nome Completo *</Label>
                    <Input placeholder="Ex: João da Silva" value={scriptName} onChange={(e) => setScriptName(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">CPF do Proponente *</Label>
                    <Input placeholder="000.000.000-00" value={finCpf} onChange={(e) => setFinCpf(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Data de Nascimento *</Label>
                    <Input type="date" value={finNasc} onChange={(e) => setFinNasc(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Telefone / WhatsApp *</Label>
                    <Input placeholder="(00) 00000-0000" value={scriptPhone} onChange={(e) => setScriptPhone(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Profissão / Ocupação</Label>
                    <Input placeholder="Ex: Engenheiro" value={finProfissao} onChange={(e) => setFinProfissao(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Renda Mensal Declarada (R$)</Label>
                    <Input type="number" placeholder="Ex: 5000" value={finRenda} onChange={(e) => setFinRenda(e.target.value)} className="h-9 text-xs font-bold text-navy" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Estado Civil</Label>
                    <Select value={finEstadoCivil} onValueChange={setFinEstadoCivil}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <Button disabled={!scriptName || !scriptPhone || !finCpf || !finNasc} onClick={() => setFinStep(2)} className="bg-navy text-white text-xs h-9 font-bold px-6 rounded-xl shadow-sm">Continuar ➔</Button>
                </div>
              </div>
            )}

            {finStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-navy text-sm">2. Localidade & Informações de Consumo</h3>
                  <span className="text-[10px] text-muted-foreground">Etapa 2 de 3</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Cidade de Instalação *</Label>
                    <Input placeholder="Ex: Sorocaba" value={scriptCidade} onChange={(e) => setScriptCidade(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Estado (UF) *</Label>
                    <Select value={scriptEstado} onValueChange={setScriptEstado}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {UFS.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Tipo de Imóvel</Label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border w-full">
                      {(["residencial", "comercial", "industrial", "rural"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTipo(t)}
                          className={`flex-1 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all ${tipo === t ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                        >
                          {t === "residencial" ? "🏡 Res." : t === "comercial" ? "🏢 Com." : t === "industrial" ? "🏭 Ind." : "🌾 Rural"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Consumo Mensal Médio (kWh) *</Label>
                    <Input type="number" placeholder="Ex: 450" value={scriptKwh} onChange={(e) => setScriptKwh(e.target.value)} className="h-9 text-xs font-bold text-navy" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Número da UC (Unidade Consumidora)</Label>
                    <Input placeholder="Ex: 12345678" value={finUc} onChange={(e) => setFinUc(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Concessionária de Energia</Label>
                    <Input placeholder="Ex: CPFL Paulista" value={finConcessionaria} onChange={(e) => setFinConcessionaria(e.target.value)} className="h-9 text-xs" />
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <Button variant="ghost" onClick={() => setFinStep(1)} className="text-xs">← Voltar</Button>
                  <Button disabled={!scriptCidade || !scriptEstado || !scriptKwh} onClick={() => setFinStep(3)} className="bg-navy text-white text-xs h-9 font-bold px-6 rounded-xl shadow-sm">Continuar ➔</Button>
                </div>
              </div>
            )}

            {finStep === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-navy text-sm">3. Documentação & Configuração Bancária</h3>
                  <span className="text-[10px] text-muted-foreground">Etapa 3 de 3</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 border rounded-2xl">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Banco de Preferência</Label>
                    <Select value={bancoPreSelecionado} onValueChange={setBancoPreSelecionado}>
                      <SelectTrigger className="h-9 bg-white border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solfacil">🏦 Solfácil</SelectItem>
                        <SelectItem value="bv">🏢 Banco BV Solar</SelectItem>
                        <SelectItem value="santander">🏛️ Santander Financiamentos</SelectItem>
                        <SelectItem value="sicredi">🤝 Sicredi Cooperativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Prazo de Parcelamento</Label>
                    <Select value={String(selectedPrazo)} onValueChange={(v) => setSelectedPrazo(Number(v))}>
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
                </div>

                {/* Uploads Simulados */}
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-bold text-slate-700 block">Envio de Documentos Cadastrais (Simulado)</Label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="border border-dashed p-4 rounded-xl text-center space-y-1.5 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">RG / CNH *</span>
                      <Button size="sm" variant="outline" type="button" className="h-7 text-[10px] bg-white border">📎 Anexar Documento</Button>
                    </div>
                    <div className="border border-dashed p-4 rounded-xl text-center space-y-1.5 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Comprovante de Residência *</span>
                      <Button size="sm" variant="outline" type="button" className="h-7 text-[10px] bg-white border">📎 Anexar Comprovante</Button>
                    </div>
                    <div className="border border-dashed p-4 rounded-xl text-center space-y-1.5 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Última Conta de Luz *</span>
                      <Button size="sm" variant="outline" type="button" className="h-7 text-[10px] bg-white border">📎 Anexar Conta</Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t mt-4">
                  <Button variant="ghost" onClick={() => setFinStep(2)} className="text-xs">← Voltar</Button>
                  <Button disabled={saving} onClick={salvarFinanciamento} className="bg-gradient-to-r from-sun to-amber-500 hover:from-sun-deep hover:to-amber-600 text-navy font-extrabold text-xs h-9 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5">
                    {saving ? <span className="animate-spin mr-1">⌛</span> : "Enviar Ficha de Financiamento para Análise 🏦"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {perfilCliente === "completo" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className={`flex items-center gap-2 ${n <= step ? "text-navy font-semibold" : "text-muted-foreground"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${n <= step ? "bg-sun text-navy" : "bg-slate-200"}`}>{n}</div>
                {n === 1 && "Cliente"}{n === 2 && "Dados"}{n === 3 && "Escolha do Kit"}{n === 4 && "Financiamento"}{n === 5 && "Revisão"}
                {n < 5 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

      {step === 1 && (
        <Card className="p-6 border-0 shadow-md space-y-4">
          <h2 className="font-semibold text-lg text-navy">Selecione os clientes</h2>
          <p className="text-sm text-muted-foreground">A mesma proposta pode ser enviada para um ou mais clientes.</p>
          {clientes.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">Você ainda não tem clientes cadastrados.</p>
              <Link to="/app/novo"><Button className="bg-sun text-navy">Cadastrar cliente</Button></Link>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y border rounded-lg">
              {sortedClientes.map((c) => (
                <label key={c.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                  <Checkbox checked={selecionados.includes(c.id)} onCheckedChange={(v) => setSelecionados((s) => v ? [...s, c.id] : s.filter((id) => id !== c.id))} />
                  <div className="flex-1">
                    <div className="font-semibold text-navy">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">{c.telefone} · {c.cidade || "—"}/{c.estado || "—"} {c.consumo_kwh ? `· ${c.consumo_kwh} kWh/mês` : ""}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button disabled={selecionados.length === 0} onClick={() => setStep(2)} className="bg-navy text-white">Próximo <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 border-0 shadow-md space-y-4">
          <h2 className="font-semibold text-lg text-navy">Dados de consumo e instalação</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Título da proposta</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Proposta residencial 6kWp" /></div>
            <div>
              <Label>Tipo de instalação</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoInstalacao)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>CEP (Opcional)</Label>
                <Input
                  placeholder="Ex: 01001-000"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Endereço (Opcional)</Label>
                <Input
                  placeholder="Ex: Av. Paulista, 1000"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Cidade</Label>
                <CidadeEstadoInput
                  cidade={cidade}
                  estado={estado}
                  onChange={(cit, uf) => {
                    setCidade(cit);
                    if (uf) setEstado(uf);
                  }}
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input value={estado} readOnly className="bg-slate-50 cursor-not-allowed font-bold text-navy" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Valor da Fatura (R$/mês)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 450"
                  value={valorFatura}
                  onChange={(e) => handleFaturaChange(e.target.value)}
                />
              </div>
              <div>
                <Label>Consumo médio (kWh/mês)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 500"
                  value={consumo}
                  onChange={(e) => handleConsumoChange(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Tarifa de energia (R$/kWh)</Label><Input type="number" step="0.01" value={tarifa} onChange={(e) => setTarifa(Number(e.target.value))} /></div>
              <div>
                <Label>Padrão de Ligação</Label>
                <Select value={tipoConexao} onValueChange={(v: any) => setTipoConexao(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monofasico">Monofásico (Fase + Neutro)</SelectItem>
                    <SelectItem value="bifasico">Bifásico (2 Fases + Neutro)</SelectItem>
                    <SelectItem value="trifasico">Trifásico (3 Fases + Neutro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estrutura do Telhado</Label>
                <Select value={tipoTelhado} onValueChange={setTipoTelhado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceramico">Telha Cerâmica / Colonial</SelectItem>
                    <SelectItem value="metalico">Telha Metálica / Ondulada</SelectItem>
                    <SelectItem value="fibrocimento">Telha Fibrocimento / Brasilit</SelectItem>
                    <SelectItem value="laje">Laje de Concreto</SelectItem>
                    <SelectItem value="solo">Estrutura de Solo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <Button onClick={() => setStep(3)} className="bg-navy text-white">Calcular <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </Card>
      )}

      {step === 3 && calculo && (
        <Card className="p-6 border-0 shadow-md space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-lg text-navy flex items-center gap-2"><Sun className="text-sun" />Escolha do Kit Fotovoltaico</h2>
            {usuarioAlterouKit && (
              <Button variant="outline" size="sm" onClick={() => setUsuarioAlterouKit(false)} className="text-xs text-navy border-navy/20 hover:bg-navy/5">
                Restaurar Sugestão Automática
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            O sistema pré-selecionou o kit mais adequado para a potência calculada de <strong>{NUM(calculo.kwp_sistema, 2)} kWp</strong>. Você pode alterar para outro kit ou escolher o dimensionamento customizado.
          </p>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 transition cursor-pointer ${selectedKitId === "" ? "border-navy bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="kitSelect" checked={selectedKitId === ""} onChange={() => { setSelectedKitId(""); setUsuarioAlterouKit(true); }} className="mt-1 accent-navy" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-navy text-sm">Dimensionamento Customizado (Algoritmo Comercial)</div>
                  {kitRecomendadoId === null && <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Sugestão do Sistema</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Calcula o preço médio sugerido por Wp sem vincular a um kit específico.</div>
                <div className="text-sm font-bold text-navy mt-2">{BRL(calculo.preco_total)}</div>
              </div>
            </label>

            {sortedKits.map((kit) => {
              const isRecommended = kit.id === kitRecomendadoId;
              const isSelected = selectedKitId === kit.id;
              
              return (
                <label key={kit.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition cursor-pointer ${isSelected ? "border-navy bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="kitSelect" checked={isSelected} onChange={() => { setSelectedKitId(kit.id); setUsuarioAlterouKit(true); }} className="mt-1 accent-navy" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy text-sm">{kit.nome}</span>
                      {isRecommended && <span className="bg-sun text-navy text-[9px] font-extrabold px-1.5 py-0.5 rounded">Sugestão do Sistema</span>}
                      {kit.destaque && <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Destaque</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Potência: <strong>{kit.potencia_kwp} kWp</strong> · Módulos: <strong>{kit.quantidade_modulos}x {kit.fabricante_modulos}</strong> · Inversor: <strong>{kit.inversor}</strong>
                    </div>
                    {kit.faixa && <div className="text-[10px] text-ink/40 font-bold uppercase mt-1">Faixa: {kit.faixa.replace("_", " ")}</div>}
                    <div className="text-sm font-bold text-navy mt-2">{BRL(getPrecoVendaKit(kit))}</div>
                  </div>
                  {kit.imagem_kit_url && (
                    <img src={kit.imagem_kit_url} className="size-14 rounded-lg object-cover border" alt="Componentes do kit" />
                  )}
                </label>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <Button onClick={() => setStep(4)} className="bg-navy text-white">Avançar <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </Card>
      )}

      {step === 4 && calculo && (
        <Card className="p-6 border-0 shadow-md space-y-5">
          <h2 className="font-semibold text-lg text-navy flex items-center gap-2"><Wallet className="text-sun" />Opções de Financiamento Solar</h2>
          <p className="text-xs text-muted-foreground">Marque quais opções de financiamento você quer embutir na proposta do cliente.</p>
          
          <div className="grid sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
            {financeiras.map((fin) => {
              const rate = Number(fin.taxa_juros_mes) / 100;
              const n = Math.min(60, fin.prazo_maximo_meses);
              const pmt = (calculo.preco_total * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
              const isChecked = selectedFinanceirasIds.includes(fin.id);
              
              return (
                <label key={fin.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition cursor-pointer ${isChecked ? "border-navy bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <Checkbox checked={isChecked} onCheckedChange={(v) => setSelectedFinanceirasIds((prev) => v ? [...prev, fin.id] : prev.filter((id) => id !== fin.id))} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-bold text-navy text-sm">{fin.nome}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Taxa: <strong>{fin.taxa_juros_mes}% a.m.</strong> · Prazo: <strong>{n} meses</strong></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Aprovação: <strong>{fin.taxa_aprovacao_media}%</strong></div>
                    <div className="text-base font-extrabold text-emerald-700 mt-2">{BRL(Math.round(pmt))}/mês</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <Button onClick={() => setStep(5)} className="bg-navy text-white">Avançar <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </Card>
      )}

      {step === 5 && calculo && (
        <Card className="p-6 border-0 shadow-md space-y-4">
          <h2 className="font-semibold text-lg text-navy">Revisão e finalização</h2>
          
          <div className="grid md:grid-cols-3 gap-3">
            <Stat icon={Zap} label="Potência" value={`${NUM(calculo.kwp_sistema, 2)} kWp`} />
            <Stat icon={Sun} label="Geração/mês" value={`${NUM(calculo.geracao_mensal_kwh)} kWh`} />
            <Stat icon={Wallet} label="Investimento" value={BRL(calculo.preco_total)} highlight />
          </div>

          {role === "admin" ? (
            <div className="space-y-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-xs font-bold text-amber-800 uppercase">Modo administrador — espelho financeiro completo</div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label className="text-xs">kWp</Label><Input type="number" step="0.01" value={calculo.kwp_sistema} onChange={(e) => setOverride("kwp_sistema", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Qtd módulos</Label><Input type="number" value={calculo.qtd_modulos} onChange={(e) => setOverride("qtd_modulos", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Preço total (R$)</Label><Input type="number" step="0.01" value={calculo.preco_total} onChange={(e) => { const v = Number(e.target.value); setOverride("preco_total", v); setOverride("preco_por_wp", +(v/(calculo.kwp_sistema*1000)).toFixed(2)); }} /></div>
                <div><Label className="text-xs">R$/Wp</Label><Input type="number" step="0.01" value={calculo.preco_por_wp} onChange={(e) => { const v = Number(e.target.value); setOverride("preco_por_wp", v); setOverride("preco_total", +(v*calculo.kwp_sistema*1000).toFixed(2)); }} /></div>
                <div><Label className="text-xs">Economia/mês</Label><Input type="number" step="0.01" value={calculo.economia_mensal} onChange={(e) => setOverride("economia_mensal", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Payback (meses)</Label><Input type="number" step="0.1" value={calculo.payback_meses} onChange={(e) => setOverride("payback_meses", Number(e.target.value))} /></div>
              </div>

              <details className="mt-3" open>
                <summary className="text-xs font-bold text-amber-800 cursor-pointer">Espelho Detalhado da Operação (Exclusivo Admin)</summary>
                <div className="mt-3 space-y-3 text-xs">
                  <div className="bg-white rounded p-3 border border-amber-200">
                    <span className="font-semibold text-slate-500 block uppercase text-[9px] mb-1">Fornecedor / Distribuidor</span>
                    <strong className="text-navy text-sm font-black">{selectedKit?.fornecedor || "Aldo Solar"}</strong>
                  </div>
                  
                  <div>
                    <span className="font-bold text-slate-600 block uppercase text-[9.5px] mb-1">Custos Diretos (Brutos)</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <CostRow label="Equipamentos" value={calculo.custo_equipamentos} />
                      <CostRow label="Instalação" value={calculo.custo_instalacao} />
                      <CostRow label="Frete" value={calculo.custo_frete} />
                      <CostRow label="Impostos Compra" value={calculo.custo_impostos_compra} />
                      <CostRow label="Comissão" value={calculo.custo_comissao} />
                      <CostRow label="Custos Totais Diretos" value={calculo.custos_totais} bold />
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-600 block uppercase text-[9.5px] mb-1">Custos Operacionais Reais (ESOL)</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <CostRow label="Tributação ESOL" value={calculo.custo_tributacao_empresa} />
                      <CostRow label="CAC / Marketing" value={calculo.custo_marketing} />
                      <CostRow label="Engenharia Fixo" value={calculo.custo_engenharia_fixo} />
                      <CostRow label="Overhead / Adm" value={calculo.custo_overhead} />
                      <CostRow label="Provisão Garantia" value={calculo.custo_garantia} />
                      <CostRow label="Despesas Op. Totais" value={calculo.custos_operacionais_totais} bold />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white rounded p-2.5 flex justify-between items-center border border-slate-300">
                      <span className="font-semibold text-slate-700">Margem Bruta</span>
                      <span className="font-bold text-slate-700">{BRL(calculo.margem_bruta)} ({(calculo.margem_bruta_pct * 100).toFixed(1)}%)</span>
                    </div>
                    <div className={`rounded p-2.5 flex justify-between items-center border ${calculo.lucro_liquido_real >= 0 ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
                      <span className="font-bold">★ LUCRO LÍQUIDO REAL</span>
                      <span className="font-black text-sm">{BRL(calculo.lucro_liquido_real)} ({(calculo.lucro_liquido_pct * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-3 shadow-inner">
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-semibold">{calculo.qtd_modulos} módulos × {calculo.potencia_modulo_w}W</span><span className="font-extrabold text-navy">{NUM(calculo.kwp_sistema, 2)} kWp</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Área necessária</span><span className="font-semibold">{NUM(calculo.area_necessaria_m2, 1)} m²</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Economia mensal (ajustada)</span><span className="font-semibold text-[#2E44B8]">{BRL(calculo.economia_ajustada_mensal)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Payback real ajustado</span><span className="font-semibold text-[#2E44B8]">{(calculo.payback_ajustado_meses / 12).toFixed(1)} anos ({calculo.payback_ajustado_meses} meses)</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">TIR Anual / VPL</span><span className="font-semibold text-emerald-600">{calculo.tir_anual_pct}% a.a. / {BRL(calculo.vpl_brl)}</span></div>
              <div className="flex justify-between text-base border-b pb-2 pt-1"><span className="font-bold text-navy">Investimento da Venda</span><span className="font-black text-navy">{BRL(calculo.preco_total)}</span></div>
              
              {/* Espelho exclusivo do Parceiro com comissão */}
              <div className="bg-sun/15 border border-sun/50 rounded-xl p-3 flex justify-between items-center text-navy-deep">
                <div>
                  <strong className="block text-xs font-bold uppercase tracking-wider">Sua Comissão Estimada</strong>
                  <span className="text-[10px] text-navy/70">Taxa individual: {profile?.comissao_percent !== null && profile?.comissao_percent !== undefined ? `${profile.comissao_percent}%` : `${((calculo.custo_comissao / calculo.preco_total) * 100).toFixed(0)}%`}</span>
                </div>
                <strong className="text-lg font-black text-navy">{BRL(calculo.custo_comissao)}</strong>
              </div>
            </div>
          )}

          <div><Label>Condições de pagamento</Label><Input value={condicoes} onChange={(e) => setCondicoes(e.target.value)} /></div>
          <div><Label>Observações (opcional)</Label><Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} /></div>
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <strong className="text-navy">{selecionados.length} cliente(s)</strong> · {NUM(calculo.kwp_sistema, 2)} kWp · {BRL(calculo.preco_total)} · Validade {params?.validade_proposta_dias || 15} dias
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(4)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <div className="flex gap-2">
              <Button variant="outline" disabled={saving} onClick={() => salvar(false)}>Salvar rascunho</Button>
              <Button disabled={saving} onClick={() => salvar(true)} className="bg-sun hover:bg-sun-deep text-navy font-bold rounded-xl px-6">{saving ? "Gerando…" : "Gerar Proposta Técnica Completa 🚀"}</Button>
            </div>
          </div>
        </Card>
      )}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-sun text-navy" : "bg-slate-50"} text-center`}>
      <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
function CostRow({ label, value, bold }: any) {
  return (
    <div className={`bg-white rounded p-2 flex justify-between ${bold ? "font-bold text-navy" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{BRL(value)}</span>
    </div>
  );
}
