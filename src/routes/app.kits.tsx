import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sun, Zap, Star, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import { BRL } from "@/lib/proposta-calc";

export const Route = createFileRoute("/app/kits")({ component: AdminKits });

const FAIXAS: Record<string, { label: string; color: string; emoji: string }> = {
  residencial_pequeno: { label: "Residencial Pequeno", color: "bg-blue-100 text-blue-800", emoji: "🏠" },
  residencial_grande:  { label: "Residencial Grande",  color: "bg-indigo-100 text-indigo-800", emoji: "🏡" },
  comercial_pequeno:   { label: "Comercial Pequeno",   color: "bg-amber-100 text-amber-800", emoji: "🏢" },
  comercial_grande:    { label: "Comercial Grande",    color: "bg-orange-100 text-orange-800", emoji: "🏬" },
  industrial:          { label: "Industrial",          color: "bg-red-100 text-red-800", emoji: "🏭" },
  rural:               { label: "Rural / Agro",        color: "bg-emerald-100 text-emerald-800", emoji: "🌾" },
};

const EMPTY_KIT = {
  id: "",
  faixa: "residencial_pequeno",
  nome: "",
  potencia_kwp: "",
  quantidade_modulos: "",
  fabricante_modulos: "",
  potencia_modulo_w: "",
  tecnologia_modulo: "Monocristalino N-Type TOPCon",
  eficiencia_modulo: "22.0",
  inversor: "",
  tipo_inversor: "String On-Grid",
  garantia_modulos_anos: "25",
  garantia_inversor_anos: "10",
  preco: "",
  consumo_kwh_min: "",
  consumo_kwh_max: "",
  destaque: false,
  ativo: true,
};

function AdminKits() {
  const { role } = useCurrentUser();
  const [kits, setKits] = useState<any[]>([]);
  const [filterFaixa, setFilterFaixa] = useState("todas");
  const [filterAtivo, setFilterAtivo] = useState("todos");
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("kits_solares" as any).select("*").order("potencia_kwp");
    setKits(data || []);
  };

  useEffect(() => { load(); }, []);

  if (role !== "admin") return <div className="text-center py-12 text-muted-foreground">Acesso restrito ao administrador.</div>;

  const filtered = kits.filter((k) => {
    const matchFaixa = filterFaixa === "todas" || k.faixa === filterFaixa;
    const matchAtivo = filterAtivo === "todos" || (filterAtivo === "ativo" ? k.ativo : !k.ativo);
    const matchQ = !q || k.nome.toLowerCase().includes(q.toLowerCase()) || k.fabricante_modulos?.toLowerCase().includes(q.toLowerCase()) || k.inversor?.toLowerCase().includes(q.toLowerCase());
    return matchFaixa && matchAtivo && matchQ;
  });

  const save = async () => {
    if (!editando) return;
    setSaving(true);
    try {
      const payload = {
        faixa: editando.faixa,
        nome: editando.nome,
        potencia_kwp: Number(editando.potencia_kwp),
        quantidade_modulos: Number(editando.quantidade_modulos),
        fabricante_modulos: editando.fabricante_modulos,
        potencia_modulo_w: editando.potencia_modulo_w ? Number(editando.potencia_modulo_w) : null,
        tecnologia_modulo: editando.tecnologia_modulo,
        eficiencia_modulo: editando.eficiencia_modulo ? Number(editando.eficiencia_modulo) : null,
        inversor: editando.inversor,
        tipo_inversor: editando.tipo_inversor,
        garantia_modulos_anos: Number(editando.garantia_modulos_anos),
        garantia_inversor_anos: Number(editando.garantia_inversor_anos),
        preco: Number(editando.preco),
        consumo_kwh_min: editando.consumo_kwh_min ? Number(editando.consumo_kwh_min) : null,
        consumo_kwh_max: editando.consumo_kwh_max ? Number(editando.consumo_kwh_max) : null,
        destaque: editando.destaque,
        ativo: editando.ativo,
      };

      if (editando.id) {
        await supabase.from("kits_solares" as any).update(payload).eq("id", editando.id);
        toast.success("Kit atualizado!");
      } else {
        await supabase.from("kits_solares" as any).insert(payload);
        toast.success("Kit cadastrado!");
      }
      setEditando(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAtivo = async (kit: any) => {
    await supabase.from("kits_solares" as any).update({ ativo: !kit.ativo }).eq("id", kit.id);
    toast.success(kit.ativo ? "Kit desativado" : "Kit ativado");
    load();
  };

  const toggleDestaque = async (kit: any) => {
    await supabase.from("kits_solares" as any).update({ destaque: !kit.destaque }).eq("id", kit.id);
    load();
  };

  const excluir = async (id: string) => {
    await supabase.from("kits_solares" as any).delete().eq("id", id);
    toast.success("Kit excluído");
    setConfirmDelete(null);
    load();
  };

  const F = (field: string) => (e: any) => setEditando((prev: any) => ({ ...prev, [field]: e.target.value }));

  const stats = {
    total: kits.length,
    ativos: kits.filter((k) => k.ativo).length,
    destaques: kits.filter((k) => k.destaque).length,
    faixas: Object.keys(FAIXAS).filter((f) => kits.some((k) => k.faixa === f)).length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2"><Sun className="text-sun-deep" />Kits Fotovoltaicos</h1>
          <p className="text-muted-foreground">{stats.ativos} kits ativos · {stats.destaques} em destaque · {stats.faixas} faixas</p>
        </div>
        <Button onClick={() => setEditando({ ...EMPTY_KIT })} className="bg-sun hover:bg-sun-deep text-navy font-semibold">
          <Plus className="w-4 h-4 mr-1" />Novo kit
        </Button>
      </div>

      {/* KPIs por faixa */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(FAIXAS).map(([k, v]) => {
          const count = kits.filter((kit) => kit.faixa === k && kit.ativo).length;
          return (
            <button
              key={k}
              onClick={() => setFilterFaixa(filterFaixa === k ? "todas" : k)}
              className={`p-3 rounded-xl text-center border-2 transition ${filterFaixa === k ? "border-navy bg-navy/5" : "border-transparent bg-white shadow-sm hover:border-navy/20"}`}
            >
              <div className="text-xl">{v.emoji}</div>
              <div className="text-lg font-extrabold text-navy">{count}</div>
              <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">{v.label}</div>
            </button>
          );
        })}
      </div>

      {/* Barra de filtros */}
      <Card className="p-4 border-0 shadow-sm flex flex-wrap gap-3">
        <Input placeholder="Buscar por nome, módulo ou inversor…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={filterFaixa} onValueChange={setFilterFaixa}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todas as faixas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as faixas</SelectItem>
            {Object.entries(FAIXAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAtivo} onValueChange={setFilterAtivo}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
        {(filterFaixa !== "todas" || filterAtivo !== "todos" || q) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterFaixa("todas"); setFilterAtivo("todos"); setQ(""); }} className="text-muted-foreground">
            Limpar
          </Button>
        )}
        <span className="ml-auto self-center text-sm text-muted-foreground">{filtered.length} kit(s)</span>
      </Card>

      {/* Tabela de kits */}
      <Card className="border-0 shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Kit</th>
              <th className="p-3">kWp</th>
              <th className="p-3">Módulos</th>
              <th className="p-3">Inversor</th>
              <th className="p-3">Consumo alvo</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Nenhum kit encontrado.</td></tr>
            )}
            {filtered.map((kit) => {
              const f = FAIXAS[kit.faixa] || FAIXAS.residencial_pequeno;
              return (
                <tr key={kit.id} className={`border-t ${!kit.ativo ? "opacity-50" : ""} hover:bg-slate-50`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {kit.destaque && <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" />}
                      <div>
                        <div className="font-semibold text-navy text-xs leading-snug">{kit.nome}</div>
                        <Badge className={`${f.color} text-[9px] mt-0.5`}>{f.emoji} {f.label}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-navy">{Number(kit.potencia_kwp).toFixed(2)} kWp</td>
                  <td className="p-3">
                    <div className="text-xs">{kit.quantidade_modulos}× {kit.potencia_modulo_w}W</div>
                    <div className="text-[10px] text-muted-foreground">{kit.fabricante_modulos?.split(" ").slice(0, 2).join(" ")}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs">{kit.inversor?.split(" ").slice(0, 3).join(" ")}</div>
                    <div className="text-[10px] text-muted-foreground">{kit.tipo_inversor}</div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {kit.consumo_kwh_min && kit.consumo_kwh_max
                      ? `${kit.consumo_kwh_min}–${kit.consumo_kwh_max} kWh`
                      : "—"}
                  </td>
                  <td className="p-3 font-bold text-navy">{BRL(Number(kit.preco))}</td>
                  <td className="p-3">
                    <button onClick={() => toggleAtivo(kit)} title={kit.ativo ? "Desativar" : "Ativar"}>
                      {kit.ativo
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleDestaque(kit)} title={kit.destaque ? "Remover destaque" : "Destacar"} className={kit.destaque ? "text-amber-500" : "text-muted-foreground hover:text-amber-400"}>
                        <Star className="w-4 h-4" fill={kit.destaque ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => setEditando({ ...kit })} className="text-navy hover:text-sun-deep">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {confirmDelete === kit.id ? (
                        <span className="flex gap-1">
                          <button onClick={() => excluir(kit.id)} className="text-red-600"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDelete(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmDelete(kit.id)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 pb-6 overflow-y-auto">
          <Card className="w-full max-w-2xl mx-4 p-6 border-0 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <Sun className="text-sun-deep" />{editando.id ? "Editar kit" : "Novo kit fotovoltaico"}
              </h2>
              <button onClick={() => setEditando(null)} className="text-muted-foreground hover:text-navy"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Faixa */}
              <div className="md:col-span-2">
                <Label>Faixa de mercado</Label>
                <Select value={editando.faixa} onValueChange={(v) => setEditando((p: any) => ({ ...p, faixa: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(FAIXAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="md:col-span-2">
                <Label>Nome do kit</Label>
                <Input value={editando.nome} onChange={F("nome")} placeholder="Kit Solar 5 kWp | 9×555W Trina | Deye 5K" />
              </div>

              {/* Potência e módulos */}
              <div>
                <Label>Potência total (kWp)</Label>
                <Input type="number" step="0.01" value={editando.potencia_kwp} onChange={F("potencia_kwp")} />
              </div>
              <div>
                <Label>Qtd. de módulos</Label>
                <Input type="number" value={editando.quantidade_modulos} onChange={F("quantidade_modulos")} />
              </div>
              <div>
                <Label>Fabricante e modelo dos módulos</Label>
                <Input value={editando.fabricante_modulos} onChange={F("fabricante_modulos")} placeholder="Jinko Solar JKM550N-72HL4" />
              </div>
              <div>
                <Label>Potência do módulo (W)</Label>
                <Input type="number" value={editando.potencia_modulo_w} onChange={F("potencia_modulo_w")} placeholder="555" />
              </div>
              <div>
                <Label>Tecnologia</Label>
                <Select value={editando.tecnologia_modulo} onValueChange={(v) => setEditando((p: any) => ({ ...p, tecnologia_modulo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monocristalino N-Type TOPCon">Mono N-Type TOPCon</SelectItem>
                    <SelectItem value="Monocristalino PERC">Mono PERC</SelectItem>
                    <SelectItem value="Monocristalino PERC Bifacial">Mono PERC Bifacial</SelectItem>
                    <SelectItem value="Monocristalino TOPCon">Mono TOPCon</SelectItem>
                    <SelectItem value="Monocristalino Bifacial TOPCon">Mono Bifacial TOPCon</SelectItem>
                    <SelectItem value="Monocristalino N-Type Bifacial">Mono N-Type Bifacial</SelectItem>
                    <SelectItem value="HJT Heterojunção">HJT Heterojunção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Eficiência módulo (%)</Label>
                <Input type="number" step="0.1" value={editando.eficiencia_modulo} onChange={F("eficiencia_modulo")} />
              </div>

              {/* Inversor */}
              <div className="md:col-span-2">
                <Label>Inversor (marca e modelo)</Label>
                <Input value={editando.inversor} onChange={F("inversor")} placeholder="Deye SUN5000G05" />
              </div>
              <div>
                <Label>Tipo de inversor</Label>
                <Select value={editando.tipo_inversor} onValueChange={(v) => setEditando((p: any) => ({ ...p, tipo_inversor: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="String On-Grid">String On-Grid</SelectItem>
                    <SelectItem value="String On-Grid Trifásico">String On-Grid Trifásico</SelectItem>
                    <SelectItem value="Híbrido com Armazenamento">Híbrido com Armazenamento</SelectItem>
                    <SelectItem value="Microinversor">Microinversor</SelectItem>
                    <SelectItem value="Central Inverter On-Grid">Central Inverter On-Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div />

              {/* Garantias */}
              <div>
                <Label>Garantia módulos (anos)</Label>
                <Input type="number" value={editando.garantia_modulos_anos} onChange={F("garantia_modulos_anos")} />
              </div>
              <div>
                <Label>Garantia inversor (anos)</Label>
                <Input type="number" value={editando.garantia_inversor_anos} onChange={F("garantia_inversor_anos")} />
              </div>

              {/* Consumo alvo */}
              <div>
                <Label>Consumo mín. (kWh/mês)</Label>
                <Input type="number" value={editando.consumo_kwh_min} onChange={F("consumo_kwh_min")} placeholder="300" />
              </div>
              <div>
                <Label>Consumo máx. (kWh/mês)</Label>
                <Input type="number" value={editando.consumo_kwh_max} onChange={F("consumo_kwh_max")} placeholder="500" />
              </div>

              {/* Preço */}
              <div>
                <Label>Preço do kit (R$)</Label>
                <Input type="number" step="100" value={editando.preco} onChange={F("preco")} placeholder="23500" />
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editando.destaque} onChange={(e) => setEditando((p: any) => ({ ...p, destaque: e.target.checked }))} className="accent-amber-500" />
                  <span className="text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> Destaque na seleção</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editando.ativo} onChange={(e) => setEditando((p: any) => ({ ...p, ativo: e.target.checked }))} className="accent-emerald-500" />
                  <span className="text-sm">Ativo (aparece nas propostas)</span>
                </label>
              </div>
            </div>

            {/* Preview do preço por Wp */}
            {editando.preco && editando.potencia_kwp && (
              <div className="mt-4 bg-slate-50 rounded-lg p-3 text-sm text-navy">
                <strong>Preço por Wp:</strong> R$ {(Number(editando.preco) / (Number(editando.potencia_kwp) * 1000)).toFixed(2)}/Wp
                {editando.consumo_kwh_min && editando.consumo_kwh_max && (
                  <span className="ml-4"><strong>Consumo alvo:</strong> {editando.consumo_kwh_min}–{editando.consumo_kwh_max} kWh/mês</span>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button disabled={saving || !editando.nome || !editando.preco} onClick={save} className="bg-sun hover:bg-sun-deep text-navy font-semibold">
                {saving ? "Salvando…" : editando.id ? "Salvar alterações" : "Cadastrar kit"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
