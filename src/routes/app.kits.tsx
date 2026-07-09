import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Sun, Zap, Star, ToggleLeft, ToggleRight, X, Check,
  Upload, RefreshCw, Link2, FileSpreadsheet, Eye, HelpCircle, ChevronDown, ChevronUp, Boxes,
  LayoutGrid, List
} from "lucide-react";
import { BRL } from "@/lib/proposta-calc";
import { KITS_FALLBACK, obterComponentesKit } from "@/lib/kits-fallback";

export const Route = createFileRoute("/app/kits")({ component: AdminKits });

const FAIXAS: Record<string, { label: string; color: string; emoji: string }> = {
  residencial_pequeno: { label: "Residencial Pequeno", color: "bg-blue-100 text-blue-800", emoji: "🏠" },
  residencial_grande: { label: "Residencial Grande", color: "bg-indigo-100 text-indigo-800", emoji: "🏡" },
  comercial_pequeno: { label: "Comercial Pequeno", color: "bg-amber-100 text-amber-800", emoji: "🏢" },
  comercial_grande: { label: "Comercial Grande", color: "bg-orange-100 text-orange-800", emoji: "🏬" },
  industrial: { label: "Industrial", color: "bg-red-100 text-red-800", emoji: "🏭" },
  rural: { label: "Rural / Agro", color: "bg-emerald-100 text-emerald-800", emoji: "🌾" },
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
  fornecedor: "Aldo Solar",
  url_fornecedor: "",
};

function AdminKits() {
  const { role, loading } = useCurrentUser();
  const [kits, setKits] = useState<any[]>([]);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [filterFaixa, setFilterFaixa] = useState("todas");
  const [filterAtivo, setFilterAtivo] = useState("todos");
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedKitId, setExpandedKitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedKitDetails, setSelectedKitDetails] = useState<any | null>(null);

  const load = async () => {
    try {
      const { data, error } = await supabase.from("kits_produtos" as any).select("*").order("potencia_kwp");
      if (error) throw error;
      if (!data || data.length === 0) {
        console.warn("Tabela kits_produtos vazia. Usando fallback estático...");
        setKits(KITS_FALLBACK);
      } else {
        setKits(data);
      }
    } catch (err) {
      console.warn("Falha de conexão com kits_produtos. Usando fallback estático...", err);
      setKits(KITS_FALLBACK);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Carregando permissões...</span>
      </div>
    );
  }

  const canViewKits = ["admin", "auxiliar", "engenheiro", "pos_vendas"].includes(role ?? "");
  if (!canViewKits) return <div className="text-center py-12 text-muted-foreground">Acesso restrito ao administrador ou equipe técnica.</div>;

  const canEditKits = ["admin", "auxiliar"].includes(role ?? "");

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
        fornecedor: editando.fornecedor || null,
        url_fornecedor: editando.url_fornecedor || null,
        componentes: editando.componentes || null,
      };

      if (editando.id) {
        await supabase.from("kits_produtos" as any).update(payload).eq("id", editando.id);
        toast.success("Kit atualizado!");
      } else {
        await supabase.from("kits_produtos" as any).insert(payload);
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
    await supabase.from("kits_produtos" as any).update({ ativo: !kit.ativo }).eq("id", kit.id);
    toast.success(kit.ativo ? "Kit desativado" : "Kit ativado");
    load();
  };

  const toggleDestaque = async (kit: any) => {
    await supabase.from("kits_produtos" as any).update({ destaque: !kit.destaque }).eq("id", kit.id);
    load();
  };

  const excluir = async (id: string) => {
    await supabase.from("kits_produtos" as any).delete().eq("id", id);
    toast.success("Kit excluído");
    setConfirmDelete(null);
    load();
  };

  const F = (field: string) => (e: any) => setEditando((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2"><Sun className="text-sun-deep" />Kits Fotovoltaicos</h1>
          <p className="text-muted-foreground">Cadastre, importe planilhas de fornecedores ou integre APIs em tempo real.</p>
        </div>
        {canEditKits && (
          <div className="flex gap-2">
            <Link to="/app/parametros" search={{ tab: "kits" }}>
              <Button variant="outline" className="border-navy/20 hover:bg-navy/5 text-navy font-semibold">
                <Upload className="w-4 h-4 mr-1" />Importar Kits (Parâmetros)
              </Button>
            </Link>
            <Button onClick={() => setEditando({ ...EMPTY_KIT })} className="bg-sun hover:bg-sun-deep text-navy font-semibold">
              <Plus className="w-4 h-4 mr-1" />Novo kit manual
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
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
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-semibold">{filtered.length} kit(s)</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition ${viewMode === "cards" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition ${viewMode === "table" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"}`}
                title="Visualização em Tabela"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Visualização em Cards ou Tabela - Master-Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Coluna Esquerda: Listagem de Kits */}
          <div className={`${selectedKitDetails ? "lg:col-span-2" : "lg:col-span-3"} space-y-6 transition-all duration-300`}>
            {viewMode === "cards" ? (
              <div className={`grid gap-6 ${selectedKitDetails ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
                {filtered.length === 0 && (
                  <div className="col-span-full py-16 text-center text-muted-foreground bg-white rounded-3xl border shadow-sm">
                    <Boxes className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold">Nenhum kit solar encontrado com os filtros ativos.</p>
                  </div>
                )}
                {filtered.map((kit) => {
                  const f = FAIXAS[kit.faixa] || FAIXAS.residencial_pequeno;
                  const imagePath = kit.imagem_url || (
                    kit.faixa === "rural"
                      ? "/kits/kit-rural.png"
                      : Number(kit.potencia_kwp) <= 4.4
                        ? "/kits/kit-residencial-pequeno.png"
                        : Number(kit.potencia_kwp) <= 12.1
                          ? "/kits/kit-residencial-grande.png"
                          : "/kits/kit-comercial-industrial.png"
                  );
                  const isSelected = selectedKitDetails?.id === kit.id;

                  return (
                    <Card
                      key={kit.id}
                      className={`overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300 flex flex-col bg-white rounded-3xl cursor-pointer hover:-translate-y-0.5 ${isSelected ? "border-2 border-[#2E44B8] ring-2 ring-[#2E44B8]/10" : "border-slate-200/60 hover:border-navy/30"} ${!kit.ativo ? "opacity-60" : ""}`}
                      onClick={() => setSelectedKitDetails(kit)}
                    >
                      {/* Header Image */}
                      <div className="relative h-44 bg-slate-50 border-b flex items-center justify-center p-4">
                        <img
                          src={imagePath}
                          alt={kit.nome}
                          className="max-h-full max-w-full object-contain mx-auto transition-transform hover:scale-105 duration-300"
                          onError={(e) => {
                            (e.target as any).src = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80";
                          }}
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <Badge className={`${f.color} text-[9px] font-extrabold px-2 py-0.5 shadow-sm rounded-full`}>
                            {f.emoji} {f.label}
                          </Badge>
                          {kit.destaque && (
                            <Badge className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 shadow-sm rounded-full flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" /> Destaque
                            </Badge>
                          )}
                        </div>
                        <Badge className="absolute bottom-3 right-3 bg-navy/95 text-white text-[10px] font-black px-2 py-0.5 shadow-sm rounded-full">
                          {Number(kit.potencia_kwp).toFixed(2)} kWp
                        </Badge>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-sm text-navy leading-snug line-clamp-2 min-h-[40px]">
                            {kit.nome}
                          </h3>
                          <div className="text-[11px] text-slate-600 space-y-1">
                            <p className="flex items-center gap-1"><span className="text-slate-400">Placas:</span> <strong>{kit.quantidade_modulos}x {kit.fabricante_modulos} ({kit.potencia_modulo_w}W)</strong></p>
                            <p className="flex items-center gap-1"><span className="text-slate-400">Inversor:</span> <strong>{kit.inversor}</strong></p>
                            <p className="flex items-center gap-1"><span className="text-slate-400">Distribuidor:</span> <strong className="text-emerald-700">{kit.fornecedor || "Aldo Solar"}</strong></p>
                          </div>
                        </div>

                        <div className="pt-3 border-t flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Preço Tabela B2B</span>
                            <span className="text-base font-black text-navy">{BRL(Number(kit.preco))}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedKitDetails(kit);
                              }}
                              className="bg-navy hover:bg-navy/90 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                            >
                              Detalhes
                            </button>
                            {canEditKits && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditando({ ...kit });
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-navy font-bold text-[10px] px-2.5 py-1.5 rounded-lg border cursor-pointer"
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="suns-table-header text-left">
                    <tr>
                      <th className="p-3 w-8"></th>
                      <th className="p-3">Kit</th>
                      <th className="p-3">kWp</th>
                      <th className="p-3">Módulos</th>
                      <th className="p-3">Inversor</th>
                      <th className="p-3">Consumo alvo</th>
                      <th className="p-3">Fornecedor</th>
                      <th className="p-3">Preço</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Nenhum kit encontrado.</td></tr>
                    )}
                    {filtered.map((kit) => {
                      const f = FAIXAS[kit.faixa] || FAIXAS.residencial_pequeno;
                      const isExpanded = expandedKitId === kit.id;
                      const isSelected = selectedKitDetails?.id === kit.id;
                      return (
                        <React.Fragment key={kit.id}>
                          <tr className={`border-t ${!kit.ativo ? "opacity-50" : ""} ${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                            <td className="p-3">
                              <button
                                onClick={() => setExpandedKitId(isExpanded ? null : kit.id)}
                                className="text-muted-foreground hover:text-navy transition-colors p-1 cursor-pointer"
                                title="Ver componentes inclusos"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="p-3 cursor-pointer" onClick={() => setSelectedKitDetails(kit)}>
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
                            <td className="p-3 text-xs">
                              {kit.fornecedor ? (
                                <div>
                                  <span className="font-semibold text-navy">{kit.fornecedor}</span>
                                  {kit.url_fornecedor && (
                                    <a href={kit.url_fornecedor} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-600 hover:underline mt-0.5">
                                      🛒 Comprar B2B
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-3 font-bold text-navy">{BRL(Number(kit.preco))}</td>
                            <td className="p-3">
                              {canEditKits ? (
                                <button onClick={() => toggleAtivo(kit)} title={kit.ativo ? "Desativar" : "Ativar"} className="cursor-pointer">
                                  {kit.ativo
                                    ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                                    : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                                </button>
                              ) : (
                                <div>
                                  {kit.ativo
                                    ? <Badge className="bg-emerald-50 text-emerald-700 text-[10px] border-emerald-200">Ativo</Badge>
                                    : <Badge className="bg-slate-50 text-slate-700 text-[10px] border-slate-200">Inativo</Badge>}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                {canEditKits ? (
                                  <>
                                    <button onClick={() => toggleDestaque(kit)} title={kit.destaque ? "Remover destaque" : "Destacar"} className={`cursor-pointer ${kit.destaque ? "text-amber-500" : "text-muted-foreground hover:text-amber-400"}`}>
                                      <Star className="w-4 h-4" fill={kit.destaque ? "currentColor" : "none"} />
                                    </button>
                                    <button onClick={() => setEditando({ ...kit })} className="text-navy hover:text-sun-deep cursor-pointer" title="Editar Kit">
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    {confirmDelete === kit.id ? (
                                      <span className="flex gap-1">
                                        <button onClick={() => excluir(kit.id)} className="text-red-600 cursor-pointer"><Check className="w-4 h-4" /></button>
                                        <button onClick={() => setConfirmDelete(null)} className="text-muted-foreground cursor-pointer"><X className="w-4 h-4" /></button>
                                      </span>
                                    ) : (
                                      <button onClick={() => setConfirmDelete(kit.id)} className="text-muted-foreground hover:text-red-500 cursor-pointer" title="Excluir Kit">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setSelectedKitDetails(kit)}
                                    className="text-navy hover:underline text-[11px] font-bold cursor-pointer"
                                  >
                                    Ver Detalhes
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={10} className="p-3 border-t">
                                <div className="bg-white border rounded-xl p-4 space-y-2 max-w-4xl mx-auto shadow-sm">
                                  <h4 className="font-bold text-navy text-xs uppercase flex items-center gap-1.5 border-b pb-1.5">
                                    <Boxes className="w-4 h-4 text-sun-deep" /> Componentes e Acessórios Reais Inclusos no Kit
                                  </h4>
                                  <div className="grid md:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-700">
                                    {obterComponentesKit(kit).map((comp, idx) => (
                                      <div key={idx} className="flex gap-2 items-start bg-slate-50/40 p-2 rounded border border-slate-100">
                                        <span className="text-sun-deep font-bold shrink-0 mt-0.5">⚡</span>
                                        <span>{comp}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </div>

          {/* Coluna Direita: Painel de Detalhes Inline */}
          {selectedKitDetails && (
            <Card className="lg:col-span-1 border border-slate-200/60 shadow-md bg-white rounded-3xl p-5 sticky top-6 self-start space-y-5 animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3.5">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-[#2E44B8]" />
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Especificações Técnicas</h3>
                    <p className="text-sm font-black text-navy leading-none mt-0.5">Catálogo Oficial B2B</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKitDetails(null)}
                  className="text-slate-400 hover:text-navy transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Imagem do Kit */}
              <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[180px] overflow-hidden">
                <img
                  src={
                    selectedKitDetails.imagem_url || (
                      selectedKitDetails.faixa === "rural"
                        ? "/kits/kit-rural.png"
                        : Number(selectedKitDetails.potencia_kwp) <= 4.4
                          ? "/kits/kit-residencial-pequeno.png"
                          : Number(selectedKitDetails.potencia_kwp) <= 12.1
                            ? "/kits/kit-residencial-grande.png"
                            : "/kits/kit-comercial-industrial.png"
                    )
                  }
                  alt={selectedKitDetails.nome}
                  className="max-h-40 object-contain hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    (e.target as any).src = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80";
                  }}
                />
                <Badge className="absolute top-3 left-3 bg-[#2E44B8] text-white text-[9px] font-black rounded-full px-2 py-0.5 shadow-sm">
                  {Number(selectedKitDetails.potencia_kwp).toFixed(2)} kWp
                </Badge>
              </div>

              {/* Informações Principais */}
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nome Comercial</span>
                  <h4 className="font-extrabold text-navy text-sm leading-snug mt-0.5">{selectedKitDetails.nome}</h4>
                </div>

                <div className="bg-[#EBF1FA] border border-[#D5E2F7] p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-[#2E44B8] font-black block uppercase tracking-wider">Preço Real B2B</span>
                    <strong className="text-lg font-black text-[#1F3095]">{BRL(Number(selectedKitDetails.preco))}</strong>
                  </div>
                  {selectedKitDetails.url_fornecedor && (
                    <a
                      href={selectedKitDetails.url_fornecedor}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1 transition-all"
                    >
                      Comprar B2B 🛒
                    </a>
                  )}
                </div>
              </div>

              {/* Grid Técnico */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Placas Fotovoltaicas</span>
                  <strong className="text-navy font-bold text-[11px] block mt-0.5">{selectedKitDetails.quantidade_modulos}x {selectedKitDetails.fabricante_modulos}</strong>
                  <span className="text-[10px] text-slate-500">{selectedKitDetails.potencia_modulo_w}W · {selectedKitDetails.tecnologia_modulo}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Inversor</span>
                  <strong className="text-navy font-bold text-[11px] block mt-0.5 leading-snug line-clamp-1">{selectedKitDetails.inversor}</strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{selectedKitDetails.tipo_inversor}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Distribuidor B2B</span>
                  <strong className="text-emerald-700 font-bold text-[11px] block mt-0.5">{selectedKitDetails.fornecedor || "Aldo Solar"}</strong>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1 py-0.2 mt-1 inline-block font-extrabold uppercase">
                    {selectedKitDetails.url_fornecedor ? "API Conectado" : "Importado CSV"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Garantias oficiais</span>
                  <strong className="text-navy font-bold text-[11px] block mt-0.5">Placas: {selectedKitDetails.garantia_modulos_anos} anos</strong>
                  <span className="text-[10px] text-slate-500">Inversor: {selectedKitDetails.garantia_inversor_anos} anos</span>
                </div>
              </div>

              {/* Componentes inclusos */}
              <div className="space-y-2 border-t pt-3.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Componentes inclusos de fábrica</span>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {obterComponentesKit(selectedKitDetails).map((comp: string, idx: number) => {
                    let icon = "⚡";
                    if (idx === 0) icon = "☀️"; // placas
                    if (idx === 1) icon = "📟"; // inversor
                    if (idx === 2) icon = "🛠️"; // estrutura
                    if (idx === 3) icon = "🔌"; // cabos
                    if (idx === 4) icon = "🔗"; // mc4
                    if (idx === 5) icon = "🛡️"; // string box

                    return (
                      <div key={idx} className="flex gap-2 items-start bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-xs text-slate-700 leading-snug">
                        <span className="shrink-0 text-xs mt-0.5">{icon}</span>
                        <span className="font-semibold text-[11px]">{comp}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões administrativos */}
              {canEditKits && (
                <div className="pt-2 border-t flex justify-end gap-2">
                  <Button
                    onClick={() => { setEditando({ ...selectedKitDetails }); setSelectedKitDetails(null); }}
                    className="bg-slate-100 hover:bg-slate-200 text-navy border font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                  >
                    Editar Cadastro ✏️
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>



        {/* Modal de edição manual */}
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

                <div className="md:col-span-2">
                  <Label>Fabricante/Marca dos Módulos</Label>
                  <Input value={editando.fabricante_modulos} onChange={F("fabricante_modulos")} placeholder="Jinko Solar, Canadian, etc." />
                </div>

                {/* Inversor */}
                <div className="md:col-span-2">
                  <Label>Inversor (marca e modelo)</Label>
                  <Input value={editando.inversor} onChange={F("inversor")} placeholder="Deye SUN5000G05" />
                </div>

                {/* Preço e Fornecedor */}
                <div>
                  <Label>Preço do kit (R$)</Label>
                  <Input type="number" step="100" value={editando.preco} onChange={F("preco")} placeholder="23500" />
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <Select value={editando.fornecedor || "Aldo Solar"} onValueChange={(v) => setEditando((p: any) => ({ ...p, fornecedor: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aldo Solar">Aldo Solar</SelectItem>
                      <SelectItem value="Sou Energy">Sou Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Detalhes Técnicos Secundários Collapsible */}
                <div className="md:col-span-2 pt-2 border-t mt-2">
                  <button
                    type="button"
                    onClick={() => setShowTechDetails(!showTechDetails)}
                    className="text-xs text-[#2E44B8] hover:underline font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0"
                  >
                    {showTechDetails ? "▼ Ocultar Especificações Técnicas Adicionais" : "▶ Mostrar Especificações Técnicas Adicionais (Garantia, Tecnologia, Componentes...)"}
                  </button>

                  {showTechDetails && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4 animate-fade-in text-xs">
                      <div>
                        <Label>Potência do módulo (W)</Label>
                        <Input type="number" value={editando.potencia_modulo_w} onChange={F("potencia_modulo_w")} placeholder="555" />
                      </div>
                      <div>
                        <Label>Tecnologia do Módulo</Label>
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
                      <div>
                        <Label>Garantia módulos (anos)</Label>
                        <Input type="number" value={editando.garantia_modulos_anos} onChange={F("garantia_modulos_anos")} />
                      </div>
                      <div>
                        <Label>Garantia inversor (anos)</Label>
                        <Input type="number" value={editando.garantia_inversor_anos} onChange={F("garantia_inversor_anos")} />
                      </div>
                      <div>
                        <Label>Consumo mín. (kWh/mês)</Label>
                        <Input type="number" value={editando.consumo_kwh_min} onChange={F("consumo_kwh_min")} placeholder="300" />
                      </div>
                      <div>
                        <Label>Consumo máx. (kWh/mês)</Label>
                        <Input type="number" value={editando.consumo_kwh_max} onChange={F("consumo_kwh_max")} placeholder="500" />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Link do kit no Fornecedor (URL B2B)</Label>
                        <Input value={editando.url_fornecedor || ""} onChange={F("url_fornecedor")} placeholder="https://www.aldosolar.com.br/gerador..." />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Componentes Inclusos (um por linha)</Label>
                        <textarea
                          className="w-full min-h-[100px] p-2.5 border rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-navy"
                          placeholder="Ex:&#10;10x Painéis Solares Jinko 550W&#10;1x Inversor Growatt MIC 5000TL-X"
                          value={Array.isArray(editando.componentes) ? editando.componentes.join("\n") : ""}
                          onChange={(e) => {
                            const lines = e.target.value.split("\n").filter(line => line.trim() !== "");
                            setEditando((p: any) => ({ ...p, componentes: lines.length > 0 ? lines : null }));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 pt-2 md:col-span-2">
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
                  {saving ? "Salvando..." : editando.id ? "Salvar alterações" : "Cadastrar kit"}
                </Button>
              </div>
            </Card>
          </div>
        )}
        {/* Detalhes antigos em modal removidos para exibição em painel lateral inline */}
      </div>
    </div>
  );
}
