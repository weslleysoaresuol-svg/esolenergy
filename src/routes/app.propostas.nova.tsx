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
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Sun, Zap, Wallet } from "lucide-react";

export const Route = createFileRoute("/app/propostas/nova")({ component: NovaProposta });

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function NovaProposta() {
  const navigate = useNavigate();
  const { user, role } = useCurrentUser();
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
  const [condicoes, setCondicoes] = useState("À vista 5% desconto · Financiamento até 84x via parceiros bancários");
  const [overrides, setOverrides] = useState<Partial<ReturnType<typeof calcularProposta>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: pr }, { data: cs }] = await Promise.all([
        supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle(),
        supabase.from("clientes").select("id, nome, telefone, email, cidade, estado, consumo_kwh, valor_fatura").order("nome"),
      ]);
      if (pr) setParams(pr as any);
      if (cs) setClientes(cs);
      if (pr) setTarifa(Number((pr as any).tarifa_kwh_default));
    })();
  }, []);

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

  const calculo = useMemo(() => {
    if (!params) return null;
    const base = calcularProposta({ consumo_kwh: consumo, tarifa_kwh: tarifa, estado, tipo }, params);
    return { ...base, ...overrides };
  }, [params, consumo, tarifa, estado, tipo, overrides]);

  const setOverride = (k: string, v: number) => setOverrides((o) => ({ ...o, [k]: v }));

  async function salvar(enviar: boolean) {
    if (!user || !calculo || !params) return;
    if (selecionados.length === 0) { toast.error("Selecione ao menos um cliente"); return; }
    setSaving(true);
    try {
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
        observacoes, condicoes_pagamento: condicoes,
        validade_dias: params.validade_proposta_dias,
        editada_pelo_admin: role === "admin" && Object.keys(overrides).length > 0,
        enviada_em: enviar ? new Date().toISOString() : null,
        expires_at: new Date(Date.now() + params.validade_proposta_dias * 24 * 3600 * 1000).toISOString(),
      };
      const { data: prop, error } = await supabase.from("propostas").insert(payload).select().single();
      if (error) throw error;
      // associa clientes
      const assoc = selecionados.map((cid) => ({ proposta_id: prop.id, cliente_id: cid }));
      await supabase.from("proposta_clientes").insert(assoc);
      toast.success(enviar ? "Proposta gerada e pronta para envio!" : "Rascunho salvo");
      navigate({ to: "/app/propostas/$id", params: { id: prop.id } });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally { setSaving(false); }
  }

  if (!params) return <div className="text-center py-12 text-muted-foreground">Carregando…</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/propostas"><Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button></Link>
        <h1 className="text-3xl font-bold text-navy">Nova proposta</h1>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`flex items-center gap-2 ${n <= step ? "text-navy font-semibold" : "text-muted-foreground"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${n <= step ? "bg-sun text-navy" : "bg-slate-200"}`}>{n}</div>
            {n === 1 && "Cliente"}{n === 2 && "Dados"}{n === 3 && "Sistema"}{n === 4 && "Revisão"}
            {n < 4 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
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
          <h2 className="font-semibold text-lg text-navy">Dados de consumo</h2>
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
            <h2 className="font-semibold text-lg text-navy flex items-center gap-2"><Sun className="text-sun" />Sistema dimensionado</h2>
            <div className="text-xs text-muted-foreground">Região: <strong className="text-navy capitalize">{calculo.regiao.replace("_", " ")}</strong> · HSP {calculo.hsp.toFixed(1)}h</div>
          </div>

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

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <Button onClick={() => setStep(4)} className="bg-navy text-white">Revisar <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </Card>
      )}

      {step === 4 && calculo && (
        <Card className="p-6 border-0 shadow-md space-y-4">
          <h2 className="font-semibold text-lg text-navy">Revisão e finalização</h2>
          <div><Label>Condições de pagamento</Label><Input value={condicoes} onChange={(e) => setCondicoes(e.target.value)} /></div>
          <div><Label>Observações (opcional)</Label><Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} /></div>
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <strong className="text-navy">{selecionados.length} cliente(s)</strong> · {NUM(calculo.kwp_sistema, 2)} kWp · {BRL(calculo.preco_total)} · Validade {params.validade_proposta_dias} dias
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>
            <div className="flex gap-2">
              <Button variant="outline" disabled={saving} onClick={() => salvar(false)}>Salvar rascunho</Button>
              <Button disabled={saving} onClick={() => salvar(true)} className="bg-sun hover:bg-sun-deep text-navy font-semibold">{saving ? "Gerando…" : "Gerar e enviar"}</Button>
            </div>
          </div>
        </Card>
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
