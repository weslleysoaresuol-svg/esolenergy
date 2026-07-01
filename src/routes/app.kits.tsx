import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
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
  fornecedor: "Aldo Solar",
  url_fornecedor: "",
};

function AdminKits() {
  const { role } = useCurrentUser();
  const [kits, setKits] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  // Estados de Integração
  const [isPopulating, setIsPopulating] = useState(false);

  // Estados de Importação CSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState({
    nome: "0",
    potencia_kwp: "1",
    quantidade_modulos: "2",
    fabricante_modulos: "3",
    inversor: "4",
    preco: "5",
    faixa: "6"
  });
  const [fileLoaded, setFileLoaded] = useState(false);

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

  // Processamento de CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) {
        toast.error("O arquivo está vazio.");
        return;
      }

      // Tenta detectar separador (vírgula ou ponto e vírgula)
      const firstLine = lines[0];
      const sep = firstLine.includes(";") ? ";" : ",";
      
      const headers = firstLine.split(sep).map(h => h.trim().replace(/^["']|["']$/g, ""));
      const rows = lines.slice(1).map(line => {
        return line.split(sep).map(val => val.trim().replace(/^["']|["']$/g, ""));
      });

      setCsvHeaders(headers);
      setCsvRows(rows);
      setFileLoaded(true);
      toast.success(`${rows.length} linhas carregadas para mapeamento.`);

      // Mapeamento automático rudimentar
      const autoMap: any = { ...mapping };
      headers.forEach((h, index) => {
        const lower = h.toLowerCase();
        const idxStr = String(index);
        if (lower.includes("nome") || lower.includes("descri")) autoMap.nome = idxStr;
        else if (lower.includes("potencia") || lower.includes("kwp")) autoMap.potencia_kwp = idxStr;
        else if (lower.includes("modulo") || lower.includes("quantidade") || lower.includes("qtd")) autoMap.quantidade_modulos = idxStr;
        else if (lower.includes("fabricante") || lower.includes("marca")) autoMap.fabricante_modulos = idxStr;
        else if (lower.includes("inversor")) autoMap.inversor = idxStr;
        else if (lower.includes("preco") || lower.includes("valor") || lower.includes("custo")) autoMap.preco = idxStr;
        else if (lower.includes("faixa") || lower.includes("tipo")) autoMap.faixa = idxStr;
      });
      setMapping(autoMap);
    };
    reader.readAsText(file, "UTF-8");
  };

  const processImport = async () => {
    if (csvRows.length === 0) return;
    setSaving(true);
    let importados = 0;
    let erros = 0;

    const parseNumber = (val: string) => {
      if (!val) return 0;
      // remove R$, pontos de milhar e troca vírgula por ponto
      const clean = val.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
      return Number(clean) || 0;
    };

    const determineFaixa = (pot: number, customFaixa?: string): string => {
      if (customFaixa) {
        const clean = customFaixa.toLowerCase().replace(/[\s_]/g, "");
        if (clean.includes("residencialpequeno") || clean.includes("respeq")) return "residencial_pequeno";
        if (clean.includes("residencialgrande") || clean.includes("resgra")) return "residencial_grande";
        if (clean.includes("comercialpequeno") || clean.includes("compeq")) return "comercial_pequeno";
        if (clean.includes("comercialgrande") || clean.includes("comgra")) return "comercial_grande";
        if (clean.includes("industrial")) return "industrial";
        if (clean.includes("rural") || clean.includes("agro")) return "rural";
      }
      
      // Fallback automático por potência kWp
      if (pot < 4) return "residencial_pequeno";
      if (pot < 10) return "residencial_grande";
      if (pot < 30) return "comercial_pequeno";
      if (pot < 80) return "comercial_grande";
      return "industrial";
    };

    try {
      const listToInsert = csvRows.map(row => {
        const nome = row[Number(mapping.nome)] || "Kit Importado";
        const potencia_kwp = parseNumber(row[Number(mapping.potencia_kwp)]);
        const quantidade_modulos = Math.max(1, parseInt(row[Number(mapping.quantidade_modulos)]) || 4);
        const fabricante_modulos = row[Number(mapping.fabricante_modulos)] || "Fabricante Padrão";
        const inversor = row[Number(mapping.inversor)] || "Inversor Padrão";
        const preco = parseNumber(row[Number(mapping.preco)]);
        const customFaixa = row[Number(mapping.faixa)];
        
        const faixa = determineFaixa(potencia_kwp, customFaixa);

        return {
          faixa,
          nome,
          potencia_kwp,
          quantidade_modulos,
          fabricante_modulos,
          inversor,
          preco,
          potencia_modulo_w: 550,
          tecnologia_modulo: "Monocristalino TOPCon",
          tipo_inversor: "String On-Grid",
          garantia_modulos_anos: 25,
          garantia_inversor_anos: 10,
          ativo: true,
          destaque: false,
        };
      }).filter(k => k.preco > 0 && k.potencia_kwp > 0);

      if (listToInsert.length === 0) {
        toast.error("Nenhum kit válido com preço e potência maior que zero foi detectado.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("kits_produtos" as any).insert(listToInsert);
      if (error) throw error;

      toast.success(`${listToInsert.length} kits solares reais importados com sucesso!`);
      setFileLoaded(false);
      setCsvRows([]);
      setCsvHeaders([]);
      load();
      setActiveTab("catalogo");
    } catch (e: any) {
      toast.error("Erro na importação: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Sincronização via API / WebService do Distribuidor
  // Popula banco de dados com os kits padrão
  const popularBancoKits = async () => {
    setIsPopulating(true);
    try {
      const { data: existing, error: errExist } = await supabase.from("kits_produtos" as any).select("codigo");
      if (errExist) throw errExist;

      const existingCodes = new Set((existing || []).map((k: any) => k.codigo));
      const missing = KITS_FALLBACK.filter((k) => !existingCodes.has(k.id));

      if (missing.length === 0) {
        toast.info("Todos os 50 kits fotovoltaicos padrão já estão cadastrados no banco!");
        return;
      }

      const mapped = missing.map((m) => ({
        codigo: m.id,
        faixa: m.faixa,
        nome: m.nome,
        potencia_kwp: Number(m.potencia_kwp),
        quantidade_modulos: Number(m.quantidade_modulos),
        fabricante_modulos: m.fabricante_modulos,
        potencia_modulo_w: Number(m.potencia_modulo_w),
        tecnologia_modulo: m.tecnologia_modulo,
        eficiencia_modulo: Number(m.eficiencia_modulo),
        inversor: m.inversor,
        tipo_inversor: m.tipo_inversor,
        garantia_modulos_anos: Number(m.garantia_modulos_anos),
        garantia_inversor_anos: Number(m.garantia_inversor_anos),
        preco: Number(m.preco),
        consumo_kwh_min: m.consumo_kwh_min ? Number(m.consumo_kwh_min) : null,
        consumo_kwh_max: m.consumo_kwh_max ? Number(m.consumo_kwh_max) : null,
        destaque: m.destaque,
        ativo: m.ativo,
        fornecedor: m.fornecedor || "Aldo Solar",
        url_fornecedor: m.url_fornecedor || null,
        componentes: m.componentes || null
      }));

      const { error: errInsert } = await supabase.from("kits_produtos" as any).insert(mapped);
      if (errInsert) throw errInsert;

      toast.success(`${mapped.length} novos kits padrão cadastrados no banco com sucesso!`);
      load();
    } catch (e: any) {
      toast.error("Erro ao popular banco: " + e.message);
    } finally {
      setIsPopulating(false);
    }
  };

  const F = (field: string) => (e: any) => setEditando((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2"><Sun className="text-sun-deep" />Kits Fotovoltaicos</h1>
          <p className="text-muted-foreground">Cadastre, importe planilhas de fornecedores ou integre APIs em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditando({ ...EMPTY_KIT })} className="bg-sun hover:bg-sun-deep text-navy font-semibold">
            <Plus className="w-4 h-4 mr-1" />Novo kit manual
          </Button>
        </div>
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

          {/* Visualização em Cards ou Tabela */}
          {viewMode === "cards" ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground bg-white rounded-3xl border shadow-sm">
                  <Boxes className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold">Nenhum kit solar encontrado com os filtros ativos.</p>
                </div>
              )}
              {filtered.map((kit) => {
                const f = FAIXAS[kit.faixa] || FAIXAS.residencial_pequeno;
                const imagePath = kit.imagem_kit_url || (
                  kit.faixa === "rural" 
                    ? "/kits/kit-rural.png" 
                    : Number(kit.potencia_kwp) <= 4.4 
                      ? "/kits/kit-residencial-pequeno.png" 
                      : Number(kit.potencia_kwp) <= 12.1 
                        ? "/kits/kit-residencial-grande.png" 
                        : "/kits/kit-comercial-industrial.png"
                );

                 return (
                  <Card 
                    key={kit.id} 
                    className={`overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col bg-white rounded-3xl cursor-pointer hover:border-navy/30 hover:-translate-y-0.5 ${!kit.ativo ? "opacity-60" : ""}`}
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
                            onClick={() => setSelectedKitDetails(kit)}
                            className="bg-navy hover:bg-navy/90 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm"
                          >
                            Detalhes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditando({ ...kit });
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-navy font-bold text-[10px] px-2.5 py-1.5 rounded-lg border"
                          >
                            Editar
                          </button>
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
                    return (
                      <React.Fragment key={kit.id}>
                        <tr className={`border-t ${!kit.ativo ? "opacity-50" : ""} hover:bg-slate-50`}>
                          <td className="p-3">
                            <button
                              onClick={() => setExpandedKitId(isExpanded ? null : kit.id)}
                              className="text-muted-foreground hover:text-navy transition-colors p-1"
                              title="Ver componentes inclusos"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
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

      {/* Ferramentas Avançadas / Importação */}
      <div className="pt-6 border-t border-slate-200 mt-6 max-w-7xl mx-auto px-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-500 hover:text-navy font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          {showAdvanced ? "▼ Ocultar Ferramentas de Importação & Carga" : "▶ Mostrar Ferramentas de Importação & Carga"}
        </button>
        
        {showAdvanced && (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Importador Planilha */}
            <Card className="p-6 border-0 shadow-md space-y-4">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-600 w-5 h-5" /> Importar Planilha de Preços (CSV)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exportou uma planilha de kits do portal da Aldo, Sou Energy ou de outro distribuidor? 
                Você pode fazer o upload do arquivo CSV diretamente para o sistema mapear e carregar.
              </p>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <div className="text-sm font-semibold text-navy">Arraste ou clique para selecionar o arquivo CSV</div>
                <div className="text-xs text-muted-foreground mt-1">UTF-8 CSV (separado por vírgula ou ponto-e-vírgula)</div>
              </div>

              {fileLoaded && csvHeaders.length > 0 && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-navy uppercase">Mapeamento de Colunas da Planilha</div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-[10px]">Nome / Descrição</Label>
                      <select
                        value={mapping.nome}
                        onChange={(e) => setMapping(p => ({ ...p, nome: e.target.value }))}
                        className="w-full bg-white border rounded px-2 py-1 font-semibold text-xs animate-none outline-none"
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Potência total (kWp)</Label>
                      <select
                        value={mapping.potencia_kwp}
                        onChange={(e) => setMapping(p => ({ ...p, potencia_kwp: e.target.value }))}
                        className="w-full bg-white border rounded px-2 py-1 font-semibold text-xs animate-none outline-none"
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Quantidade Módulos</Label>
                      <select
                        value={mapping.quantidade_modulos}
                        onChange={(e) => setMapping(p => ({ ...p, quantidade_modulos: e.target.value }))}
                        className="w-full bg-white border rounded px-2 py-1 font-semibold text-xs animate-none outline-none"
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Marca dos Painéis</Label>
                      <select
                        value={mapping.fabricante_modulos}
                        onChange={(e) => setMapping(p => ({ ...p, fabricante_modulos: e.target.value }))}
                        className="w-full bg-white border rounded px-2 py-1 font-semibold text-xs animate-none outline-none"
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Inversor</Label>
                      <select
                        value={mapping.inversor}
                        onChange={(e) => setMapping(p => ({ ...p, inversor: e.target.value }))}
                        className="w-full bg-white border rounded px-2 py-1 font-semibold text-xs animate-none outline-none"
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Preço do Kit (R$)</Label>
                      <select
                        value={mapping.preco}
                        onChange={(e) => setMapping(p => ({ ...p, preco: e.target.value }))}
                        className="w-full bg-white border rounded px-2 py-1 font-semibold text-xs animate-none outline-none"
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setFileLoaded(false)}>Cancelar</Button>
                    <Button size="sm" onClick={processImport} disabled={saving} className="bg-[#2E44B8] hover:bg-[#1F3095] text-white font-semibold">
                      {saving ? "Processando..." : "Confirmar e Importar"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Carga Inicial / Popular Banco de Dados */}
            <Card className="p-6 border-0 shadow-md space-y-4">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <Boxes className="text-sun-deep w-5 h-5" /> Base de Dados Padrão (50 Kits)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Carregue a listagem padrão de 50 kits fotovoltaicos reais da Esol Energy diretamente na tabela de banco de dados do seu Supabase em nuvem. Isso evita carregar kits estáticos locais em modo de desenvolvimento.
              </p>

              <div className="pt-2">
                <Button
                  onClick={popularBancoKits}
                  disabled={isPopulating}
                  className="w-full bg-[#2E44B8] hover:bg-[#1F3095] text-white font-semibold flex items-center justify-center gap-2 border-0 cursor-pointer py-2.5 rounded-lg text-xs font-bold"
                >
                  <RefreshCw className={`w-4 h-4 ${isPopulating ? "animate-spin" : ""}`} />
                  {isPopulating ? "Gravando no Banco..." : "Cadastrar Kits Padrão no Supabase"}
                </Button>
              </div>
            </Card>
          </div>
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
      {selectedKitDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border-0">
            {/* Header */}
            <div className="bg-navy text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sun" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-sun">Ficha Detalhada do Gerador</h3>
                  <p className="text-[10px] text-slate-300 font-medium">Informações de Distribuição & Componentes</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedKitDetails(null)}
                className="text-slate-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Imagem do Kit */}
                <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[200px]">
                  <img 
                    src={
                      selectedKitDetails.imagem_kit_url || (
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
                    className="max-h-48 object-contain"
                  />
                  <Badge className="absolute top-3 left-3 bg-navy text-white text-[10px] font-black">
                    {Number(selectedKitDetails.potencia_kwp).toFixed(2)} kWp
                  </Badge>
                </div>

                {/* Resumo Comercial */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-extrabold text-sun-deep uppercase tracking-wider block">Nome do Gerador</span>
                    <h4 className="font-black text-navy text-base leading-tight mt-0.5">{selectedKitDetails.nome}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Marca Módulos</span>
                      <strong className="text-navy font-bold">{selectedKitDetails.fabricante_modulos}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Modelo Inversor</span>
                      <strong className="text-navy font-bold">{selectedKitDetails.inversor}</strong>
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-emerald-800 font-bold block uppercase">Valor de Tabela B2B</span>
                      <strong className="text-xl font-black text-emerald-700">{BRL(Number(selectedKitDetails.preco))}</strong>
                    </div>
                    {selectedKitDetails.url_fornecedor && (
                      <a 
                        href={selectedKitDetails.url_fornecedor} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1 transition"
                      >
                        Comprar B2B 🛒
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações da Fonte */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                <h5 className="text-xs font-extrabold text-navy uppercase tracking-wider">Fonte da Informação e Distribuição</h5>
                <div className="grid sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Distribuidora PJ</span>
                    <strong className="text-navy">{selectedKitDetails.fornecedor || "Aldo Solar"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Origem do Material</span>
                    <span className="text-slate-700 font-medium">
                      {selectedKitDetails.fornecedor === "Sou Energy" 
                        ? "Tabela Comercial B2B Sou Energy (PDF / Região Nordeste)" 
                        : "Tabela Comercial B2B Aldo Solar (XLSX / Distribuição Nacional)"}
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-dashed mt-1 space-y-2">
                    <a 
                      href="/tabela-referencia-kits.csv" 
                      download="tabela-referencia-kits.csv"
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-1 hover:underline bg-emerald-50 p-2 rounded-xl border border-emerald-100"
                    >
                      📥 Baixar Planilha Consolidada de Origem (.CSV)
                    </a>
                    <a 
                      href={selectedKitDetails.fornecedor === "Sou Energy" ? "https://parceiro.souenergy.com.br" : "https://www.aldo.com.br/login"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1 hover:underline pl-2"
                    >
                      Ir para Login do Distribuidor B2B 🔑
                    </a>
                  </div>
                </div>
              </div>

              {/* Manuais Técnicos Oficiais */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                <h5 className="text-xs font-extrabold text-navy uppercase tracking-wider">Fichas Técnicas do Fabricante (PDF Oficial)</h5>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedKitDetails.fabricante_modulos?.toLowerCase().includes("jinko") ? (
                    <a 
                      href="https://www.jinkosolar.com/uploads/Tiger%20Neo%2072HL4-(V)-A3-EN.pdf" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-white hover:bg-slate-100 border p-2 rounded-xl flex items-center gap-1.5 transition text-slate-700 font-medium hover:border-navy/20 shadow-sm"
                    >
                      📄 Datasheet Jinko Solar 550W
                    </a>
                  ) : (
                    <a 
                      href="https://www.canadiansolar.com/wp-content/uploads/2020/09/Canadian_Solar-Datasheet-CS6W-MS_EN.pdf" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-white hover:bg-slate-100 border p-2 rounded-xl flex items-center gap-1.5 transition text-slate-700 font-medium hover:border-navy/20 shadow-sm"
                    >
                      📄 Datasheet Canadian Solar 550W
                    </a>
                  )}
                  <a 
                    href={selectedKitDetails.inversor?.toLowerCase().includes("deye") ? "https://www.deyeinverter.com/deyeinverter/doc/SUN-1.6K-3K-G-en.pdf" : "https://www.ginverter.com/upload/file/MIC_750-3000TL-X_Datasheet_EN_202008.pdf"}
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-white hover:bg-slate-100 border p-2 rounded-xl flex items-center gap-1.5 transition text-slate-700 font-medium hover:border-navy/20 shadow-sm"
                  >
                    📄 Datasheet Inversor {selectedKitDetails.inversor?.toLowerCase().includes("deye") ? "Deye" : "Growatt"}
                  </a>
                </div>
              </div>

              {/* Componentes Detalhados */}
              <div className="space-y-3">
                <h5 className="text-xs font-extrabold text-navy uppercase tracking-wider border-b pb-1">Itens e Componentes Inclusos no Kit</h5>
                <div className="grid sm:grid-cols-2 gap-3">
                  {obterComponentesKit(selectedKitDetails).map((comp: string, idx: number) => {
                    let icon = "⚡";
                    if (idx === 0) icon = "☀️"; // placas
                    if (idx === 1) icon = "📟"; // inversor
                    if (idx === 2) icon = "🛠️"; // estrutura
                    if (idx === 3) icon = "🔌"; // cabos
                    if (idx === 4) icon = "🔗"; // mc4
                    if (idx === 5) icon = "🛡️"; // string box

                    return (
                      <div key={idx} className="flex gap-2.5 items-start bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700">
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
                          <span className="leading-normal font-medium">{comp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t p-4 flex justify-between">
              <div className="flex gap-2">
                <Button 
                  onClick={() => { setEditando({ ...selectedKitDetails }); setSelectedKitDetails(null); }}
                  className="bg-slate-200 text-navy hover:bg-slate-300 font-extrabold text-xs px-4 h-9 rounded-xl"
                >
                  Editar Cadastro ✏️
                </Button>
              </div>
              <Button 
                onClick={() => setSelectedKitDetails(null)}
                className="bg-navy hover:bg-navy-deep text-white font-extrabold text-xs px-6 h-9 rounded-xl"
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
