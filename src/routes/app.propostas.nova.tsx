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

export const Route = createFileRoute("/app/propostas/nova")({ 
  validateSearch: (search: Record<string, unknown>) => ({
    cliente: (search.cliente as string) ?? "",
  }),
  component: NovaProposta 
});

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function NovaProposta() {
  const navigate = useNavigate();
  const { user, role } = useCurrentUser();
  const { cliente: clienteIdPreSel } = Route.useSearch();
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

  // Novos estados para integração de Kits e Financeiras
  const [kits, setKits] = useState<any[]>([]);
  const [financeiras, setFinanceiras] = useState<any[]>([]);
  const [tipoConexao, setTipoConexao] = useState<"monofasico" | "bifasico" | "trifasico">("bifasico");
  const [tipoTelhado, setTipoTelhado] = useState("ceramico");
  const [selectedKitId, setSelectedKitId] = useState<string>("");
  const [selectedFinanceirasIds, setSelectedFinanceirasIds] = useState<string[]>([]);
  const [usuarioAlterouKit, setUsuarioAlterouKit] = useState(false);

  // Estados do Roteiro de Vendas & Foco da Proposta
  const [preferenciaFoco, setPreferenciaFoco] = useState<"ambos" | "vista" | "financiado">("ambos");
  const [bancoPreSelecionado, setBancoPreSelecionado] = useState<string>("solfacil");
  const [usarScriptVendas, setUsarScriptVendas] = useState(false);
  const [scriptStep, setScriptStep] = useState(1);
  
  // Dados do lead durante conversa (se for cliente novo)
  const [scriptName, setScriptName] = useState("");
  const [scriptPhone, setScriptPhone] = useState("");
  const [scriptInputMode, setScriptInputMode] = useState<"fatura" | "kwh">("fatura");
  const [scriptBill, setScriptBill] = useState("");
  const [scriptKwh, setScriptKwh] = useState("");
  const [scriptCidade, setScriptCidade] = useState("");
  const [scriptEstado, setScriptEstado] = useState("");

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
        const { data: cs } = await supabase.from("clientes").select("id, nome, telefone, email, cidade, estado, consumo_kwh, valor_fatura").order("nome");
        if (cs) {
          setClientes(cs);
          loadedClientes = cs;
        }
      } catch (err) {
        console.warn("Erro ao buscar clientes:", err);
      }

      // 3. Kits Solares
      try {
        const { data: ks, error } = await supabase.from("kits_solares" as any).select("*");
        if (error || !ks || ks.length === 0) {
          console.warn("Tabela kits_solares vazia ou inacessível. Usando fallback estático...");
          setKits(KITS_FALLBACK);
        } else {
          setKits(ks);
        }
      } catch (err) {
        console.warn("Falha de conexão com kits_solares. Usando fallback estático...", err);
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
        if (c.consumo_kwh) setConsumo(Number(c.consumo_kwh));
        if (c.estado) setEstado(c.estado);
        if (c.cidade) setCidade(c.cidade);
        if (!titulo) setTitulo(`Proposta solar - ${c.nome}`);
      }
    }
  }, [selecionados, clientes]);

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
    return null;
  }, [params, kits, consumo, estado, tipo, tarifa]);

  const calculo = useMemo(() => {
    if (!params) return null;
    const base = calcularProposta({ consumo_kwh: consumo, tarifa_kwh: tarifa, estado, tipo }, params);
    
    const selectedKit = kits.find((k) => k.id === selectedKitId);
    if (selectedKit) {
      const kwp = Number(selectedKit.potencia_kwp);
      const modulos = Number(selectedKit.quantidade_modulos);
      const preco = Number(selectedKit.preco);
      
      const hsp = base.hsp;
      const eficiencia = 1 - params.perdas_sistema;
      
      const geracao = +(kwp * hsp * 30 * eficiencia).toFixed(0);
      const econMensal = +(Math.min(geracao, consumo) * tarifa).toFixed(2);
      const econAnual = +(econMensal * 12).toFixed(2);
      
      let acumulado = 0;
      for (let ano = 0; ano < params.vida_util_anos; ano++) {
        acumulado += econAnual * Math.pow(1 + params.inflacao_energetica, ano);
      }
      const econ25 = +acumulado.toFixed(2);
      
      const payback = econMensal > 0 ? +(preco / econMensal).toFixed(1) : 0;
      const area = +(modulos * params.area_por_modulo_m2).toFixed(1);
      const precoWp = +(preco / (kwp * 1000)).toFixed(2);
      const co2 = +(geracao * 12 * params.vida_util_anos * 0.084 / 1000).toFixed(2);
      
      const custoEquip = +(preco * params.custo_equipamentos_pct).toFixed(2);
      const custoInstal = +(preco * params.custo_instalacao_pct).toFixed(2);
      const custoFrete = +(preco * params.custo_frete_pct).toFixed(2);
      const custoImp = +(preco * params.custo_impostos_pct).toFixed(2);
      const custoComis = +(preco * params.custo_comissao_pct).toFixed(2);
      const custosTotais = custoEquip + custoInstal + custoFrete + custoImp + custoComis;
      const margemReal = +(preco - custosTotais).toFixed(2);
      const margemPct = +(margemReal / preco).toFixed(4);

      base.kwp_sistema = kwp;
      base.qtd_modulos = modulos;
      base.preco_total = preco;
      base.preco_por_wp = precoWp;
      base.geracao_mensal_kwh = geracao;
      base.economia_mensal = econMensal;
      base.economia_anual = econAnual;
      base.economia_25_anos = econ25;
      base.payback_meses = payback;
      base.area_necessaria_m2 = area;
      base.co2_evitado_ton = co2;
      base.arvores_equivalentes = Math.round(co2 * 7);
      base.custo_equipamentos = custoEquip;
      base.custo_instalacao = custoInstal;
      base.custo_frete = custoFrete;
      base.custo_impostos = custoImp;
      base.custo_comissao = custoComis;
      base.custos_totais = custosTotais;
      base.margem_real = margemReal;
      base.margem_pct = margemPct;
      
      // Se houver fabricante e inversor, sobrescrever para exibição
      if (selectedKit.fabricante_modulos) {
        base.potencia_modulo_w = Number(selectedKit.fabricante_modulos.replace(/\D/g, "")) || params.potencia_modulo_w;
      }
    }
    
    return { ...base, ...overrides };
  }, [params, consumo, tarifa, estado, tipo, overrides, selectedKitId, kits]);

  const setOverride = (k: string, v: number) => setOverrides((o) => ({ ...o, [k]: v }));

  async function salvar(enviar: boolean) {
    if (!user || !calculo || !params) {
      toast.error("Não foi possível carregar os dados para gerar a proposta");
      return;
    }
    if (selecionados.length === 0) { toast.error("Selecione ao menos um cliente"); return; }
    setSaving(true);
    try {
      const validadeDias = Number(params.validade_proposta_dias || 15);
      
      const selectedKit = kits.find((k) => k.id === selectedKitId);
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
      const tagFoco = preferenciaFoco === "vista" 
        ? "[FOCO:VISTA]" 
        : preferenciaFoco === "financiado" 
          ? `[FOCO:FINANCIAMENTO:${bancoPreSelecionado}]` 
          : "[FOCO:AMBOS]";
      
      finalCondicoes = `${tagFoco}\n` + finalCondicoes;

      const chosenFinanceiras = financeiras.filter((f) => selectedFinanceirasIds.includes(f.id));
      if (chosenFinanceiras.length > 0) {
        const financingTexts = chosenFinanceiras.map((fin) => {
          const rate = Number(fin.taxa_juros_mes) / 100;
          const n = Math.min(60, fin.prazo_maximo_meses);
          const pmt = (calculo.preco_total * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
          return `· ${fin.nome}: ${n}x de ${BRL(Math.round(pmt))}/mês (Taxa: ${fin.taxa_juros_mes}% a.m.)`;
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
      };
      let prop: any = null;
      try {
        const { data, error } = await supabase.from("propostas").insert(payload as any).select().single();
        if (error) {
          // Código 42703: coluna não existe (indica que a migração SQL de kit ainda não rodou no Supabase remoto)
          if (error.code === "42703" || error.message?.includes("column")) {
            console.warn("Tabela 'propostas' não possui colunas de kit. Salvando sem detalhes do kit...");
            const cleanPayload = { ...payload };
            delete (cleanPayload as any).kit_id;
            delete (cleanPayload as any).kit_nome;
            delete (cleanPayload as any).kit_inversor;
            delete (cleanPayload as any).kit_fabricante_modulos;
            delete (cleanPayload as any).kit_imagem_url;
            delete (cleanPayload as any).kit_tecnologia_modulo;
            delete (cleanPayload as any).kit_garantia_modulos_anos;
            delete (cleanPayload as any).kit_garantia_inversor_anos;

            const { data: retryData, error: retryError } = await supabase.from("propostas").insert(cleanPayload as any).select().single();
            if (retryError) throw retryError;
            prop = retryData;
          } else {
            throw error;
          }
        } else {
          prop = data;
        }
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
      const baseResult = calcularProposta({ 
        consumo_kwh: consumoEstimado, 
        tarifa_kwh: tarifaKwh, 
        estado: scriptEstado.trim().toUpperCase(), 
        tipo 
      }, params);

      // Encontra melhor kit
      let loadedKits = kits.length > 0 ? kits : KITS_FALLBACK;
      const adequados = loadedKits.filter((k) => k.potencia_kwp >= baseResult.kwp_sistema);
      const kitRecomendado = adequados.length > 0 
        ? adequados.sort((a, b) => a.preco - b.preco)[0]
        : [...loadedKits].sort((a, b) => b.potencia_kwp - a.potencia_kwp)[0];

      const precoTotal = kitRecomendado ? Number(kitRecomendado.preco) : baseResult.preco_total;
      const kwp = kitRecomendado ? Number(kitRecomendado.potencia_kwp) : baseResult.kwp_sistema;
      
      // Juros e condições
      const tagFoco = preferenciaFoco === "vista" 
        ? "[FOCO:VISTA]" 
        : preferenciaFoco === "financiado" 
          ? `[FOCO:FINANCIAMENTO:${bancoPreSelecionado}]` 
          : "[FOCO:AMBOS]";
      
      const finalCondicoes = `${tagFoco}\nÀ vista (5% desc.): ${BRL(precoTotal * 0.95)}\nFinanciamento Solar no banco pré-selecionado.`;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (params.validade_proposta_dias || 15));

      // 3. Cadastra Proposta
      const { data: prop, error: errProp } = await supabase.from("propostas").insert({
        titulo: `Proposta Solar ${tipo === "residencial" ? "Residencial" : tipo === "comercial" ? "Comercial" : tipo === "industrial" ? "Industrial" : "Rural"} - ${newClient.nome}`,
        parceiro_id: user.id,
        kwp_sistema: kwp,
        preco_total: precoTotal,
        custos_totais: baseResult.custos_totais,
        comissao_parceiro: baseResult.custo_comissao,
        margem_estimada: baseResult.margem_real,
        codigo_publico: crypto.randomUUID().slice(0, 8),
        expires_at: expDate.toISOString(),
        status: "enviada",
        kit_id: kitRecomendado?.id || null,
        tipo_conexao: "bifasico",
        tipo_telhado: "ceramico",
        tipo_instalacao: tipo,
        consumo_kwh: consumoEstimado,
        tarifa_kwh: tarifaKwh,
        estado: scriptEstado.trim().toUpperCase(),
        cidade: scriptCidade.trim(),
        condicoes_pagamento: finalCondicoes,
        observacoes: "Gerada pelo Roteiro Guiado de Fechamento de Elite"
      }).select().single();

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

  if (!params) return <div className="text-center py-12 text-muted-foreground">Carregando…</div>;

  return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link to="/app/propostas"><Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button></Link>
          <h1 className="text-2xl font-extrabold text-navy">Nova Proposta</h1>
        </div>

        {/* Alternador do Roteiro de Elite */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setUsarScriptVendas(false)}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${!usarScriptVendas ? "bg-white text-navy shadow-sm border border-slate-200/40" : "text-slate-500 hover:text-navy"}`}
          >
            📋 Formulário Clássico
          </button>
          <button
            type="button"
            onClick={() => {
              setUsarScriptVendas(true);
              setScriptStep(1);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${usarScriptVendas ? "bg-gradient-to-r from-sun to-amber-500 text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
          >
            ⚡ Roteiro Guiado de Elite
          </button>
        </div>
      </div>

      {usarScriptVendas ? (
        <div className="space-y-6 animate-fade-in">
          {/* Timeline do Roteiro */}
          <div className="flex items-center gap-2 text-xs flex-wrap bg-slate-50 p-3 rounded-2xl border">
            {[
              { n: 1, label: "Olá & Contato" },
              { n: 2, label: "Imóvel & Cidade" },
              { n: 3, label: "Consumo de Luz" },
              { n: 4, label: "Faturamento Focado" },
              { n: 5, label: "Finalização" }
            ].map((stepObj) => (
              <div key={stepObj.n} className={`flex items-center gap-2 ${stepObj.n <= scriptStep ? "text-navy font-bold" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${stepObj.n <= scriptStep ? "bg-sun text-navy font-extrabold" : "bg-slate-200"}`}>{stepObj.n}</div>
                <span>{stepObj.label}</span>
                {stepObj.n < 5 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* Balão de Script de Conversa (O que o Corretor de Elite fala) */}
          <div className="bg-gradient-to-r from-navy via-navy-deep to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md border-l-4 border-l-sun-deep relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sun/10 blur-xl" />
            <div className="flex gap-3 items-start relative z-10 font-sans">
              <div className="w-9 h-9 rounded-full bg-sun flex items-center justify-center text-navy text-lg font-bold flex-shrink-0">
                🎙️
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sun">Script de Atendimento Ativo</span>
                <p className="text-sm italic font-medium leading-relaxed text-slate-100">
                  {scriptStep === 1 && `"Olá! Tudo bem? Aqui é o consultor de fechamentos da ESOL Energy. Estou montando o estudo de viabilidade para reduzir em até 95% sua conta de luz. Para eu iniciar a personalização aqui, qual é o seu nome completo e o seu WhatsApp com DDD?"`}
                  {scriptStep === 2 && `"Excelente, ${scriptName ? scriptName.split(" ")[0] : "cliente"}! Onde será instalado esse gerador? Qual a cidade e o estado? E se trata de um imóvel residencial, comercial, industrial ou é uma área rural?"`}
                  {scriptStep === 3 && `"Compreendi. Para dimensionarmos o tamanho do sistema de placas solares adequado para suprir o seu consumo, qual é o valor médio da sua conta de luz hoje (R$) ou a média de kWh consumido por mês?"`}
                  {scriptStep === 4 && `"Entendido. Nós temos dois modelos de contratação hoje: a compra à vista com 5% de desconto de tabela, ou a nossa modalidade mais procurada que é a troca de boleto — você financia sem nenhuma entrada e a parcela do banco fica menor ou igual à sua conta de luz atual. Qual das duas opções atende melhor seu planejamento hoje?"`}
                  {scriptStep === 5 && `"Perfeito, ${scriptName ? scriptName.split(" ")[0] : "cliente"}! Registrei tudo aqui. Estou gerando agora a sua proposta oficial focada exatamente no que conversamos. Em menos de 5 segundos ela estará pronta no seu WhatsApp!"`}
                </p>
              </div>
            </div>
          </div>

          {/* Card com os inputs do passo do Script */}
          <Card className="p-6 border-0 shadow-md space-y-5 bg-white font-sans">
            {scriptStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="font-extrabold text-navy text-sm">Informações de Contato</h3>
                  <Select onValueChange={(cid) => {
                    const c = clientes.find(x => x.id === cid);
                    if (c) {
                      setScriptName(c.nome || "");
                      setScriptPhone(c.telefone || "");
                      setScriptCidade(c.cidade || "");
                      setScriptEstado(c.estado || "");
                      if (c.consumo_kwh) setScriptKwh(String(c.consumo_kwh));
                      setSelecionados([c.id]);
                      toast.success(`Dados de ${c.nome} importados!`);
                    }
                  }}>
                    <SelectTrigger className="h-8 text-[11px] w-64 bg-slate-50 border"><SelectValue placeholder="Ou busque um cliente já cadastrado" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Nome Completo *</Label>
                    <Input placeholder="Ex: João da Silva" value={scriptName} onChange={(e) => setScriptName(e.target.value)} className="h-9 text-xs mt-1" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Telefone / WhatsApp *</Label>
                    <Input placeholder="Ex: (11) 99999-9999" value={scriptPhone} onChange={(e) => setScriptPhone(e.target.value)} className="h-9 text-xs mt-1" />
                  </div>
                </div>
                <div className="flex justify-end pt-3">
                  <Button disabled={!scriptName || !scriptPhone} onClick={() => setScriptStep(2)} className="bg-navy text-white text-xs h-9 font-bold px-6">Continuar Script ➔</Button>
                </div>
              </div>
            )}

            {scriptStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-navy text-sm">Classificação do Imóvel & Localidade</h3>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Tipo de Imóvel</Label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border w-full sm:w-fit">
                    {(["residencial", "comercial", "industrial", "rural"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase transition-all ${tipo === t ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                      >
                        {t === "residencial" ? "🏡 Residencial" : t === "comercial" ? "🏢 Comercial" : t === "industrial" ? "🏭 Industrial" : "🌾 Rural"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Cidade de Instalação *</Label>
                    <Input placeholder="Ex: Campinas" value={scriptCidade} onChange={(e) => setScriptCidade(e.target.value)} className="h-9 text-xs mt-1" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Estado (UF) *</Label>
                    <Select value={scriptEstado} onValueChange={setScriptEstado}>
                      <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {UFS.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <Button variant="ghost" onClick={() => setScriptStep(1)} className="text-xs">← Voltar</Button>
                  <Button disabled={!scriptCidade || !scriptEstado} onClick={() => setScriptStep(3)} className="bg-navy text-white text-xs h-9 font-bold px-6">Continuar Script ➔</Button>
                </div>
              </div>
            )}

            {scriptStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-navy text-sm">Dados de Consumo</h3>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Preencher consumo por</Label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border w-full sm:w-64">
                    <button
                      type="button"
                      onClick={() => setScriptInputMode("fatura")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${scriptInputMode === "fatura" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                    >
                      💰 Fatura (R$)
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptInputMode("kwh")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${scriptInputMode === "kwh" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                    >
                      ⚡ Consumo (kWh)
                    </button>
                  </div>
                </div>

                <div className="max-w-md pt-2">
                  {scriptInputMode === "fatura" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Valor Médio da Fatura (R$) *</Label>
                      <Input type="number" placeholder="Ex: 450" value={scriptBill} onChange={(e) => setScriptBill(e.target.value)} className="h-9 text-xs font-bold text-navy" />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Consumo Mensal Médio (kWh) *</Label>
                      <Input type="number" placeholder="Ex: 500" value={scriptKwh} onChange={(e) => setScriptKwh(e.target.value)} className="h-9 text-xs font-bold text-navy" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <Button variant="ghost" onClick={() => setScriptStep(2)} className="text-xs">← Voltar</Button>
                  <Button disabled={scriptInputMode === "fatura" ? !scriptBill : !scriptKwh} onClick={() => setScriptStep(4)} className="bg-navy text-white text-xs h-9 font-bold px-6">Continuar Script ➔</Button>
                </div>
              </div>
            )}

            {scriptStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-navy text-sm font-bold">Qualificação Financeira & Foco da Proposta</h3>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Preferencia de Foco (A Proposta exibirá APENAS isso ao cliente)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                    {[
                      { key: "ambos", label: "⚖️ Ambos (Comparativo completo)" },
                      { key: "vista", label: "💰 Apenas À Vista (Esconder juros)" },
                      { key: "financiado", label: "🏦 Apenas Financiamento (Foco na Parcela)" }
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setPreferenciaFoco(f.key as any)}
                        className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all ${preferenciaFoco === f.key ? "border-navy bg-slate-50 text-navy" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {preferenciaFoco === "financiado" && (
                  <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 border rounded-2xl animate-fade-in mt-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Financeira Recomendada</Label>
                      <Select value={bancoPreSelecionado} onValueChange={setBancoPreSelecionado}>
                        <SelectTrigger className="h-9 bg-white border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solfacil">🏦 Solfácil (1,29% a.m.)</SelectItem>
                          <SelectItem value="bv">🏢 Banco BV Solar (1,39% a.m.)</SelectItem>
                          <SelectItem value="santander">🏛️ Santander Financiamentos (1,45% a.m.)</SelectItem>
                          <SelectItem value="sicredi">🤝 Sicredi Cooperativa (1,24% a.m.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Prazo Estimado de Parcelamento</Label>
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
                )}

                <div className="flex justify-between pt-3 border-t">
                  <Button variant="ghost" onClick={() => setScriptStep(3)} className="text-xs">← Voltar</Button>
                  <Button onClick={() => setScriptStep(5)} className="bg-navy text-white text-xs h-9 font-bold px-6">Continuar Script ➔</Button>
                </div>
              </div>
            )}

            {scriptStep === 5 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-sun-deep flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✨
                </div>
                <h3 className="font-extrabold text-navy text-base">Roteiro Concluído! Tudo pronto para gerar</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  O sistema irá processar o dimensionamento técnico automático do kit fotovoltaico ideal para o consumo informado e travar a proposta conforme a preferência de faturamento selecionada.
                </p>

                <div className="flex justify-between pt-6 border-t mt-4">
                  <Button variant="ghost" onClick={() => setScriptStep(4)} className="text-xs">← Voltar</Button>
                  <Button disabled={saving} onClick={salvarViaScript} className="bg-gradient-to-r from-sun to-amber-500 hover:from-sun-deep hover:to-amber-600 text-navy font-extrabold text-xs h-9 px-8 rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-1.5">
                    {saving ? <span className="animate-spin mr-1">⌛</span> : "Gerar Proposta Focada 🚀"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
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
              {clientes.map((c) => (
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
            <div><Label>Consumo médio (kWh/mês)</Label><Input type="number" value={consumo} onChange={(e) => setConsumo(Number(e.target.value))} /></div>
            <div><Label>Tarifa de energia (R$/kWh)</Label><Input type="number" step="0.01" value={tarifa} onChange={(e) => setTarifa(Number(e.target.value))} /></div>
            <div>
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Cidade</Label><Input value={cidade} onChange={(e) => setCidade(e.target.value)} /></div>
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

            {kits.map((kit) => {
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
                    <div className="text-sm font-bold text-navy mt-2">{BRL(Number(kit.preco))}</div>
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
              <div className="text-xs font-bold text-amber-800 uppercase">Modo administrador — edite qualquer valor</div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label className="text-xs">kWp</Label><Input type="number" step="0.01" value={calculo.kwp_sistema} onChange={(e) => setOverride("kwp_sistema", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Qtd módulos</Label><Input type="number" value={calculo.qtd_modulos} onChange={(e) => setOverride("qtd_modulos", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Preço total (R$)</Label><Input type="number" step="0.01" value={calculo.preco_total} onChange={(e) => { const v = Number(e.target.value); setOverride("preco_total", v); setOverride("preco_por_wp", +(v/(calculo.kwp_sistema*1000)).toFixed(2)); }} /></div>
                <div><Label className="text-xs">R$/Wp</Label><Input type="number" step="0.01" value={calculo.preco_por_wp} onChange={(e) => { const v = Number(e.target.value); setOverride("preco_por_wp", v); setOverride("preco_total", +(v*calculo.kwp_sistema*1000).toFixed(2)); }} /></div>
                <div><Label className="text-xs">Economia/mês</Label><Input type="number" step="0.01" value={calculo.economia_mensal} onChange={(e) => setOverride("economia_mensal", Number(e.target.value))} /></div>
                <div><Label className="text-xs">Payback (meses)</Label><Input type="number" step="0.1" value={calculo.payback_meses} onChange={(e) => setOverride("payback_meses", Number(e.target.value))} /></div>
              </div>

              <details className="mt-3">
                <summary className="text-xs font-bold text-amber-800 cursor-pointer">Análise de custos e margem</summary>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <CostRow label="Equipamentos" value={calculo.custo_equipamentos} />
                  <CostRow label="Instalação" value={calculo.custo_instalacao} />
                  <CostRow label="Frete" value={calculo.custo_frete} />
                  <CostRow label="Impostos" value={calculo.custo_impostos} />
                  <CostRow label="Comissão" value={calculo.custo_comissao} />
                  <CostRow label="Custos totais" value={calculo.custos_totais} bold />
                  <div className="col-span-full bg-white rounded p-3 mt-1 flex justify-between items-center border border-emerald-300">
                    <span className="font-semibold text-emerald-800">Margem real estimada</span>
                    <span className="font-bold text-emerald-700">{BRL(calculo.margem_real)} ({(calculo.margem_pct * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </details>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">{calculo.qtd_modulos} módulos × {calculo.potencia_modulo_w}W</span><span className="font-semibold">{NUM(calculo.kwp_sistema, 2)} kWp</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Área necessária</span><span className="font-semibold">{NUM(calculo.area_necessaria_m2, 1)} m²</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Economia mensal</span><span className="font-semibold text-emerald-700">{BRL(calculo.economia_mensal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payback estimado</span><span className="font-semibold">{(calculo.payback_meses / 12).toFixed(1)} anos</span></div>
              <div className="flex justify-between text-base pt-2 border-t"><span className="font-semibold text-navy">Investimento</span><span className="font-bold text-navy">{BRL(calculo.preco_total)}</span></div>
            </div>
          )}

          <div><Label>Condições de pagamento</Label><Input value={condicoes} onChange={(e) => setCondicoes(e.target.value)} /></div>
          <div><Label>Observações (opcional)</Label><Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} /></div>
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <strong className="text-navy">{selecionados.length} cliente(s)</strong> · {NUM(calculo.kwp_sistema, 2)} kWp · {BRL(calculo.preco_total)} · Validade {params.validade_proposta_dias} dias
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(4)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <div className="flex gap-2">
              <Button variant="outline" disabled={saving} onClick={() => salvar(false)}>Salvar rascunho</Button>
              <Button disabled={saving} onClick={() => salvar(true)} className="bg-sun hover:bg-sun-deep text-navy font-semibold">{saving ? "Gerando…" : "Gerar e enviar"}</Button>
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
