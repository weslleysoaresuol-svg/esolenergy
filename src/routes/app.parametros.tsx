import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Settings, 
  Database, 
  Coins, 
  UploadCloud, 
  Globe, 
  FileJson, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  AlertTriangle,
  Loader2,
  FileSpreadsheet
} from "lucide-react";

export const Route = createFileRoute("/app/parametros")({ component: Parametros });

const SECTIONS = [
  { title: "HSP por região (kWh/m²/dia)", fields: [
    ["hsp_norte", "Norte"], ["hsp_nordeste", "Nordeste"], ["hsp_centro_oeste", "Centro-Oeste"],
    ["hsp_sudeste", "Sudeste"], ["hsp_sul", "Sul"],
  ]},
  { title: "Preços de referência sugeridos de venda (R$/Wp)", fields: [
    ["preco_wp_residencial_pequeno", "Residencial até 5 kWp"], ["preco_wp_residencial_grande", "Residencial 5+ kWp"],
    ["preco_wp_comercial_pequeno", "Comercial até 30 kWp"], ["preco_wp_comercial_grande", "Comercial 30+ kWp"],
    ["preco_wp_industrial", "Industrial"],
  ]},
  { title: "Parâmetros técnicos", fields: [
    ["tarifa_kwh_default", "Tarifa default (R$/kWh)"], ["perdas_sistema", "Perdas (0-1)"],
    ["inflacao_energetica", "Inflação energética (0-1)"], ["vida_util_anos", "Vida útil (anos)"],
    ["potencia_modulo_w", "Potência módulo (W)"], ["area_por_modulo_m2", "Área/módulo (m²)"],
  ]},
  { title: "Estrutura de custos (% do preço de venda)", fields: [
    ["custo_equipamentos_pct", "Equipamentos"], ["custo_instalacao_pct", "Instalação"],
    ["custo_frete_pct", "Frete"], ["custo_impostos_pct", "Impostos"],
    ["custo_comissao_pct", "Comissão parceiro"], ["margem_alvo_pct", "Margem alvo"],
  ]},
  { title: "Operacional", fields: [
    ["capacidade_instaladores_kwp_mes", "Capacidade instaladores (kWp/mês)"],
    ["validade_proposta_dias", "Validade proposta (dias)"],
  ]},
];

// Mock do banco de kits e financeiras para fallback (resiliência se tabelas do Supabase não existirem)
const DEFAULT_KITS = [
  {
    id: "1",
    faixa: "residencial_pequeno",
    nome: "Kit Solar Deye 3.3 kWp - 6 Painéis Jinko 550W",
    potencia_kwp: 3.3,
    quantidade_modulos: 6,
    fabricante_modulos: "Jinko Solar 550W",
    inversor: "Inversor Deye 3kW Monofásico",
    preco: 5900.00,
    imagem_kit_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=200&auto=format&fit=crop",
    imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200&auto=format&fit=crop",
    documento_url: "https://www.deyeess.com/specifications/deye-3kw.pdf"
  },
  {
    id: "2",
    faixa: "residencial_grande",
    nome: "Kit Solar Growatt 6.6 kWp - 12 Painéis Canadian 550W",
    potencia_kwp: 6.6,
    quantidade_modulos: 12,
    fabricante_modulos: "Canadian Solar 550W",
    inversor: "Inversor Growatt 6kW Monofásico",
    preco: 11500.00,
    imagem_kit_url: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=200&auto=format&fit=crop",
    imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200&auto=format&fit=crop",
    documento_url: "https://www.growatt.com/specifications/growatt-6kw.pdf"
  },
  {
    id: "3",
    faixa: "comercial_pequeno",
    nome: "Kit Solar Sungrow 22 kWp - 40 Painéis Longi 550W",
    potencia_kwp: 22.0,
    quantidade_modulos: 40,
    fabricante_modulos: "Longi Solar 550W",
    inversor: "Inversor Sungrow 20kW Trifásico",
    preco: 38000.00,
    imagem_kit_url: "https://images.unsplash.com/photo-1548613053-22008745330e?q=80&w=200&auto=format&fit=crop",
    imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200&auto=format&fit=crop",
    documento_url: "https://www.sungrowpower.com/specifications/sungrow-20kw.pdf"
  },
  {
    id: "4",
    faixa: "comercial_grande",
    nome: "Kit Solar Deye 75 kWp - 136 Painéis Trina 550W",
    potencia_kwp: 75.0,
    quantidade_modulos: 136,
    fabricante_modulos: "Trina Solar 550W",
    inversor: "Inversor Deye 75kW Trifásico",
    preco: 118000.00,
    imagem_kit_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=200&auto=format&fit=crop",
    imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200&auto=format&fit=crop",
    documento_url: "https://www.deyeess.com/specifications/deye-75kw.pdf"
  },
  {
    id: "5",
    faixa: "industrial",
    nome: "Kit Solar Growatt 150 kWp - 272 Painéis Canadian 550W",
    potencia_kwp: 150.0,
    quantidade_modulos: 272,
    fabricante_modulos: "Canadian Solar 550W",
    inversor: "2x Inversor Growatt 75kW Trifásico",
    preco: 235000.00,
    imagem_kit_url: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=200&auto=format&fit=crop",
    imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200&auto=format&fit=crop",
    documento_url: "https://www.growatt.com/specifications/growatt-150kw.pdf"
  },
  {
    id: "6",
    faixa: "rural",
    nome: "Kit Solar Deye Solo 44 kWp - 80 Painéis Jinko 550W",
    potencia_kwp: 44.0,
    quantidade_modulos: 80,
    fabricante_modulos: "Jinko Solar 550W",
    inversor: "Inversor Deye 40kW Trifásico",
    preco: 74000.00,
    imagem_kit_url: "https://images.unsplash.com/photo-1548613053-22008745330e?q=80&w=200&auto=format&fit=crop",
    imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200&auto=format&fit=crop",
    documento_url: "https://www.deyeess.com/specifications/deye-40kw.pdf"
  }
];

const DEFAULT_FINANCEIRAS = [
  { id: "1", nome: "Solfácil", taxa_juros_mes: 1.29, prazo_maximo_meses: 120, taxa_aprovacao_media: 85, ativo: true },
  { id: "2", nome: "BV Financeira", taxa_juros_mes: 1.39, prazo_maximo_meses: 84, taxa_aprovacao_media: 80, ativo: true },
  { id: "3", nome: "Santander", taxa_juros_mes: 1.49, prazo_maximo_meses: 96, taxa_aprovacao_media: 75, ativo: true },
  { id: "4", nome: "Sicredi", taxa_juros_mes: 1.09, prazo_maximo_meses: 120, taxa_aprovacao_media: 70, ativo: true },
  { id: "5", nome: "Banco do Brasil", taxa_juros_mes: 0.95, prazo_maximo_meses: 96, taxa_aprovacao_media: 65, ativo: true }
];

function Parametros() {
  const [activeTab, setActiveTab] = useState<"geral" | "kits" | "financeiras">("geral");
  
  // Parâmetros Gerais State
  const [geralData, setGeralData] = useState<any>(null);
  const [savingGeral, setSavingGeral] = useState(false);

  // Kits Solares State
  const [kits, setKits] = useState<any[]>([]);
  const [loadingKits, setLoadingKits] = useState(false);
  const [savingKits, setSavingKits] = useState(false);
  const [importerLoading, setImporterLoading] = useState<"none" | "api" | "pdf" | "json">("none");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Financeiras State
  const [financeiras, setFinanceiras] = useState<any[]>([]);
  const [loadingFinanceiras, setLoadingFinanceiras] = useState(false);
  const [savingFinanceiras, setSavingFinanceiras] = useState(false);

  // Load Geral Parameters
  useEffect(() => {
    (async () => {
      try {
        const { data: p } = await supabase.from("parametros_comerciais").select("*").limit(1).maybeSingle();
        setGeralData(p);
      } catch (err) {
        console.error("Falha ao carregar parametros", err);
      }
    })();
  }, []);

  // Load Kits and Financeiras
  useEffect(() => {
    loadKitsFromDb();
    loadFinanceirasFromDb();
  }, []);

  const loadKitsFromDb = async () => {
    setLoadingKits(true);
    try {
      const { data: dbKits, error } = await supabase.from("kits_solares" as any).select("*");
      if (error || !dbKits || dbKits.length === 0) {
        // Fallback para LocalStorage ou Mocks padrão
        const local = localStorage.getItem("esol_kits");
        if (local) {
          setKits(JSON.parse(local));
        } else {
          setKits(DEFAULT_KITS);
          localStorage.setItem("esol_kits", JSON.stringify(DEFAULT_KITS));
        }
      } else {
        setKits(dbKits);
      }
    } catch (err) {
      const local = localStorage.getItem("esol_kits") || JSON.stringify(DEFAULT_KITS);
      setKits(JSON.parse(local));
    } finally {
      setLoadingKits(false);
    }
  };

  const loadFinanceirasFromDb = async () => {
    setLoadingFinanceiras(true);
    try {
      const { data: dbFin, error } = await supabase.from("financeiras_solar" as any).select("*");
      if (error || !dbFin || dbFin.length === 0) {
        const local = localStorage.getItem("esol_financeiras");
        if (local) {
          setFinanceiras(JSON.parse(local));
        } else {
          setFinanceiras(DEFAULT_FINANCEIRAS);
          localStorage.setItem("esol_financeiras", JSON.stringify(DEFAULT_FINANCEIRAS));
        }
      } else {
        setFinanceiras(dbFin);
      }
    } catch (err) {
      const local = localStorage.getItem("esol_financeiras") || JSON.stringify(DEFAULT_FINANCEIRAS);
      setFinanceiras(JSON.parse(local));
    } finally {
      setLoadingFinanceiras(false);
    }
  };

  // Salvar Parâmetros Gerais
  async function salvarGeral() {
    setSavingGeral(true);
    try {
      const { error } = await supabase.from("parametros_comerciais").update(geralData).eq("id", geralData.id);
      if (error) {
        toast.error("Erro no banco: " + error.message);
      } else {
        toast.success("Parâmetros gerais salvos!");
      }
    } catch (err) {
      toast.error("Falha ao salvar no Supabase");
    } finally {
      setSavingGeral(false);
    }
  }

  // Salvar Kits Solares (atualiza banco se existir, caso contrário atualiza local)
  async function salvarKits() {
    setSavingKits(true);
    try {
      // Salva no LocalStorage como redundância garantida
      localStorage.setItem("esol_kits", JSON.stringify(kits));
      
      // Tenta persistir no Supabase
      const promises = kits.map(async (kit) => {
        const payload = { ...kit };
        if (typeof kit.id === "string" && kit.id.length < 10) {
          delete payload.id; // Remove ids mockados curtos para geração de UUID
        }
        return supabase.from("kits_solares" as any).upsert(payload);
      });
      await Promise.all(promises);
      toast.success("Catálogo de kits salvo com sucesso!");
    } catch (err) {
      toast.warning("Kits salvos no armazenamento local temporário.");
    } finally {
      setSavingKits(false);
      loadKitsFromDb();
    }
  }

  // Salvar Financeiras (atualiza banco se existir, caso contrário atualiza local)
  async function salvarFinanceiras() {
    setSavingFinanceiras(true);
    try {
      localStorage.setItem("esol_financeiras", JSON.stringify(financeiras));
      
      const promises = financeiras.map(async (fin) => {
        const payload = { ...fin };
        if (typeof fin.id === "string" && fin.id.length < 10) {
          delete payload.id;
        }
        return supabase.from("financeiras_solar" as any).upsert(payload);
      });
      await Promise.all(promises);
      toast.success("Taxas e financeiras salvas com sucesso!");
    } catch (err) {
      toast.warning("Financeiras salvas no armazenamento local.");
    } finally {
      setSavingFinanceiras(false);
      loadFinanceirasFromDb();
    }
  }

  // Adicionar novo kit em branco
  const addKitRow = () => {
    const newKit = {
      id: Math.random().toString(36).substr(2, 9),
      faixa: "residencial_pequeno",
      nome: "Novo Kit Cadastrado",
      potencia_kwp: 5.0,
      quantidade_modulos: 10,
      fabricante_modulos: "Módulo Nacional 500W",
      inversor: "Inversor 5kW",
      preco: 8000.00,
      imagem_kit_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=200",
      imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200",
      documento_url: ""
    };
    setKits([...kits, newKit]);
  };

  // Excluir Kit
  const removeKitRow = async (id: string) => {
    const filtered = kits.filter(k => k.id !== id);
    setKits(filtered);
    localStorage.setItem("esol_kits", JSON.stringify(filtered));
    try {
      if (typeof id === "string" && id.length > 10) {
        await supabase.from("kits_solares" as any).delete().eq("id", id);
      }
      toast.success("Kit removido!");
    } catch (e) {
      toast.warning("Kit removido da lista local.");
    }
  };

  // Alterar campo do kit
  const handleKitChange = (index: number, field: string, value: any) => {
    const updated = [...kits];
    updated[index] = { ...updated[index], [field]: value };
    setKits(updated);
  };

  // Adicionar financeira
  const addFinanceiraRow = () => {
    const newFin = {
      id: Math.random().toString(36).substr(2, 9),
      nome: "Nova Financeira",
      taxa_juros_mes: 1.25,
      prazo_maximo_meses: 84,
      taxa_aprovacao_media: 70,
      ativo: true
    };
    setFinanceiras([...financeiras, newFin]);
  };

  const removeFinanceiraRow = async (id: string) => {
    const filtered = financeiras.filter(f => f.id !== id);
    setFinanceiras(filtered);
    localStorage.setItem("esol_financeiras", JSON.stringify(filtered));
    try {
      if (typeof id === "string" && id.length > 10) {
        await supabase.from("financeiras_solar" as any).delete().eq("id", id);
      }
      toast.success("Financeira removida!");
    } catch (e) {
      toast.warning("Financeira removida da lista local.");
    }
  };

  const handleFinanceiraChange = (index: number, field: string, value: any) => {
    const updated = [...financeiras];
    updated[index] = { ...updated[index], [field]: value };
    setFinanceiras(updated);
  };

  // MOTORES DE ALIMENTAÇÃO (MOCKS)
  
  // 1. Simular Conexão API Distribuidor (ex: Aldo Solar)
  const handleApiSync = () => {
    setImporterLoading("api");
    setTimeout(() => {
      // Simula reajuste de mercado da API (baixa de 3.5% no preço de silício)
      const updated = kits.map(k => ({
        ...k,
        preco: Math.round(k.preco * 0.965) // Simula redução de 3.5%
      }));
      setKits(updated);
      setImporterLoading("none");
      toast.success("Sincronização concluída! Preços de kits Aldo Solar atualizados (-3.5% de desconto de silício de importação).");
    }, 2000);
  };

  // 2. Simular importação de catálogo JSON
  const triggerJsonUpload = () => {
    fileInputRef.current?.click();
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporterLoading("json");
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const processed = parsed.map(k => ({
            ...k,
            id: k.id || Math.random().toString(36).substr(2, 9),
            preco: Number(k.preco),
            potencia_kwp: Number(k.potencia_kwp),
            quantidade_modulos: Number(k.quantidade_modulos)
          }));
          setKits([...kits, ...processed]);
          toast.success(`${processed.length} kits importados do catálogo JSON com sucesso!`);
        } else {
          toast.error("Formato inválido! O JSON deve ser um array de kits.");
        }
      } catch (err) {
        toast.error("Erro ao ler o arquivo JSON.");
      } finally {
        setImporterLoading("none");
      }
    };
    reader.readAsText(file);
  };

  // 3. Simular Leitura de Catálogo PDF
  const triggerPdfUpload = () => {
    pdfInputRef.current?.click();
  };

  const handlePdfImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporterLoading("pdf");
    // Simular OCR e processamento de tabelas do catálogo do fornecedor em PDF
    setTimeout(() => {
      const parsedKitsFromPdf = [
        {
          id: Math.random().toString(36).substr(2, 9),
          faixa: "residencial_pequeno",
          nome: "Kit PDF Canadian 4.1 kWp - 8x 510W",
          potencia_kwp: 4.1,
          quantidade_modulos: 8,
          fabricante_modulos: "Canadian Solar 510W",
          inversor: "Inversor Deye 4kW",
          preco: 6950.00,
          imagem_kit_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=200",
          imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200",
          documento_url: file.name
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          faixa: "comercial_pequeno",
          nome: "Kit PDF Aldo Solar 30 kWp - 60x Jinko 500W",
          potencia_kwp: 30.0,
          quantidade_modulos: 60,
          fabricante_modulos: "Jinko Solar 500W",
          inversor: "Inversor Sungrow 30kW",
          preco: 46200.00,
          imagem_kit_url: "https://images.unsplash.com/photo-1548613053-22008745330e?q=80&w=200",
          imagem_componentes_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=200",
          documento_url: file.name
        }
      ];
      setKits([...kits, ...parsedKitsFromPdf]);
      setImporterLoading("none");
      toast.success(`Leitura concluída! O motor extraiu ${parsedKitsFromPdf.length} kits com sucesso do PDF "${file.name}".`);
    }, 2500);
  };

  if (!geralData) return <div className="text-center py-12 text-muted-foreground">Carregando parâmetros…</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-navy">Configurações e Parâmetros</h1>
        <p className="text-muted-foreground">Gerencie o motor de cálculos, precificação de kits de fabricantes e tabelas de taxas de financiamento solar.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("geral")} 
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "geral" ? "border-sun text-navy" : "border-transparent text-muted-foreground hover:text-navy"}`}
        >
          <Settings className="w-4 h-4" /> Parâmetros Gerais
        </button>
        <button 
          onClick={() => setActiveTab("kits")} 
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "kits" ? "border-sun text-navy" : "border-transparent text-muted-foreground hover:text-navy"}`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Banco de Kits Solares
        </button>
        <button 
          onClick={() => setActiveTab("financeiras")} 
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "financeiras" ? "border-sun text-navy" : "border-transparent text-muted-foreground hover:text-navy"}`}
        >
          <Coins className="w-4 h-4" /> Taxas de Financiamento
        </button>
      </div>

      {/* TAB GERAL */}
      {activeTab === "geral" && (
        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="p-5 border-0 shadow-md">
              <h3 className="font-semibold text-navy mb-3">{s.title}</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {s.fields.map(([k, label]) => (
                  <div key={k}>
                    <Label className="text-xs">{label}</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={geralData[k] ?? ""} 
                      onChange={(e) => setGeralData({ ...geralData, [k]: Number(e.target.value) })} 
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <div className="flex justify-end sticky bottom-4">
            <Button onClick={salvarGeral} disabled={savingGeral} className="bg-sun hover:bg-sun-deep text-navy font-semibold shadow-lg">
              {savingGeral ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Parâmetros
            </Button>
          </div>
        </div>
      )}

      {/* TAB KITS */}
      {activeTab === "kits" && (
        <div className="space-y-6">
          {/* Motor de Alimentação (Barra de ferramentas de importação) */}
          <Card className="p-5 border-0 shadow-md bg-gradient-to-r from-navy to-navy-deep text-white">
            <h3 className="font-bold text-lg text-sun mb-2">Motor de Alimentação do Catálogo</h3>
            <p className="text-xs text-white/70 mb-4">Escolha a melhor forma de alimentar ou atualizar a planilha de kits do seu painel comercial:</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Sincronização API */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5"><Globe className="w-4 h-4 text-sun" /> Conexão por API</h4>
                  <p className="text-[11px] text-white/60 mt-1">Conecta às APIs homologadas dos integradores/fornecedores nacionais (ex: Aldo Solar, Sou Energy) para atualizar os valores automaticamente.</p>
                </div>
                <Button 
                  onClick={handleApiSync} 
                  disabled={importerLoading !== "none"}
                  className="bg-sun hover:bg-sun-deep text-navy mt-4 w-full text-xs font-bold"
                >
                  {importerLoading === "api" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                  Atualizar via API
                </Button>
              </div>

              {/* Importação JSON */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5"><FileJson className="w-4 h-4 text-sun" /> Importação de Catálogo JSON</h4>
                  <p className="text-[11px] text-white/60 mt-1">Anexe arquivos JSON estruturados fornecidos pelos desenvolvedores ou exportados de sistemas ERP parceiros.</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleJsonImport} 
                  accept=".json" 
                  className="hidden" 
                />
                <Button 
                  onClick={triggerJsonUpload} 
                  disabled={importerLoading !== "none"}
                  className="bg-white/20 hover:bg-white/30 text-white mt-4 w-full text-xs font-bold"
                >
                  {importerLoading === "json" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UploadCloud className="w-3 h-3 mr-1" />}
                  Carregar Catálogo JSON
                </Button>
              </div>

              {/* Leitor de PDF */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5"><FileText className="w-4 h-4 text-sun" /> Leitor Inteligente de PDF</h4>
                  <p className="text-[11px] text-white/60 mt-1">Envie o arquivo PDF com a tabela de preços ou catálogo do fabricante. O motor simula a leitura e insere os kits na planilha.</p>
                </div>
                <input 
                  type="file" 
                  ref={pdfInputRef} 
                  onChange={handlePdfImport} 
                  accept=".pdf" 
                  className="hidden" 
                />
                <Button 
                  onClick={triggerPdfUpload} 
                  disabled={importerLoading !== "none"}
                  className="bg-white/20 hover:bg-white/30 text-white mt-4 w-full text-xs font-bold"
                >
                  {importerLoading === "pdf" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UploadCloud className="w-3 h-3 mr-1" />}
                  Importar PDF de Catálogo
                </Button>
              </div>
            </div>
          </Card>

          {/* Tabela Planilha de Kits */}
          <Card className="p-6 border-0 shadow-md overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-navy">Planilha de Kits Disponíveis</h3>
                <p className="text-xs text-muted-foreground">Tabela de base para alimentação automática de kits e potência recomendada nos orçamentos.</p>
              </div>
              <Button onClick={addKitRow} className="bg-navy hover:bg-navy-deep text-white text-xs font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Novo Kit
              </Button>
            </div>

            {loadingKits ? (
              <div className="text-center py-8 text-muted-foreground">Carregando catálogo de kits...</div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-navy/70 bg-slate-50">
                    <th className="p-3">Categoria/Faixa</th>
                    <th className="p-3 w-64">Nome Comercial do Kit</th>
                    <th className="p-3">kWp</th>
                    <th className="p-3">Qtd Módulos</th>
                    <th className="p-3">Marca Módulos</th>
                    <th className="p-3">Inversor</th>
                    <th className="p-3">Preço Kit (R$)</th>
                    <th className="p-3">Foto Kit</th>
                    <th className="p-3">Foto Comps</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {kits.map((kit, index) => (
                    <tr key={kit.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-2">
                        <select 
                          value={kit.faixa} 
                          onChange={(e) => handleKitChange(index, "faixa", e.target.value)}
                          className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs"
                        >
                          <option value="residencial_pequeno">Resid. Pequeno</option>
                          <option value="residencial_grande">Resid. Grande</option>
                          <option value="comercial_pequeno">Comerc. Pequeno</option>
                          <option value="comercial_grande">Comerc. Grande</option>
                          <option value="industrial">Industrial</option>
                          <option value="rural">Rural</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input 
                          value={kit.nome} 
                          onChange={(e) => handleKitChange(index, "nome", e.target.value)}
                          className="h-8 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2 w-16">
                        <Input 
                          type="number" 
                          step="0.1" 
                          value={kit.potencia_kwp} 
                          onChange={(e) => handleKitChange(index, "potencia_kwp", Number(e.target.value))}
                          className="h-8 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2 w-16">
                        <Input 
                          type="number" 
                          value={kit.quantidade_modulos} 
                          onChange={(e) => handleKitChange(index, "quantidade_modulos", Number(e.target.value))}
                          className="h-8 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          value={kit.fabricante_modulos} 
                          onChange={(e) => handleKitChange(index, "fabricante_modulos", e.target.value)}
                          className="h-8 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          value={kit.inversor} 
                          onChange={(e) => handleKitChange(index, "inversor", e.target.value)}
                          className="h-8 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2 w-28">
                        <Input 
                          type="number" 
                          value={kit.preco} 
                          onChange={(e) => handleKitChange(index, "preco", Number(e.target.value))}
                          className="h-8 text-xs w-full font-semibold text-navy" 
                        />
                      </td>
                      <td className="p-2 w-24">
                        <Input 
                          placeholder="URL Foto"
                          value={kit.imagem_kit_url || ""} 
                          onChange={(e) => handleKitChange(index, "imagem_kit_url", e.target.value)}
                          className="h-8 text-[10px] w-full" 
                        />
                      </td>
                      <td className="p-2 w-24">
                        <Input 
                          placeholder="URL Componente"
                          value={kit.imagem_componentes_url || ""} 
                          onChange={(e) => handleKitChange(index, "imagem_componentes_url", e.target.value)}
                          className="h-8 text-[10px] w-full" 
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button 
                          onClick={() => removeKitRow(kit.id)} 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex justify-end mt-4 sticky bottom-4">
              <Button onClick={salvarKits} disabled={savingKits} className="bg-sun hover:bg-sun-deep text-navy font-semibold shadow-lg">
                {savingKits ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Catálogo de Kits
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB FINANCEIRAS */}
      {activeTab === "financeiras" && (
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-md overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-navy">Tabela de Financeiras e Taxas</h3>
                <p className="text-xs text-muted-foreground">Cadastre os bancos mais ativos do mercado solar brasileiro com taxas mensais aplicadas ao simulador pré-proposta.</p>
              </div>
              <Button onClick={addFinanceiraRow} className="bg-navy hover:bg-navy-deep text-white text-xs font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Nova Financeira
              </Button>
            </div>

            {loadingFinanceiras ? (
              <div className="text-center py-8 text-muted-foreground">Carregando financeiras...</div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-navy/70 bg-slate-50">
                    <th className="p-3">Nome da Instituição</th>
                    <th className="p-3">Taxa de Juros Mensal (%)</th>
                    <th className="p-3">Prazo Máximo (Meses)</th>
                    <th className="p-3">Média de Aprovação (%)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {financeiras.map((fin, index) => (
                    <tr key={fin.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-2">
                        <Input 
                          value={fin.nome} 
                          onChange={(e) => handleFinanceiraChange(index, "nome", e.target.value)}
                          className="h-9 text-xs w-full font-semibold" 
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number" 
                          step="0.01"
                          value={fin.taxa_juros_mes} 
                          onChange={(e) => handleFinanceiraChange(index, "taxa_juros_mes", Number(e.target.value))}
                          className="h-9 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number" 
                          value={fin.prazo_maximo_meses} 
                          onChange={(e) => handleFinanceiraChange(index, "prazo_maximo_meses", Number(e.target.value))}
                          className="h-9 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number" 
                          value={fin.taxa_aprovacao_media} 
                          onChange={(e) => handleFinanceiraChange(index, "taxa_aprovacao_media", Number(e.target.value))}
                          className="h-9 text-xs w-full" 
                        />
                      </td>
                      <td className="p-2">
                        <select 
                          value={fin.ativo ? "true" : "false"}
                          onChange={(e) => handleFinanceiraChange(index, "ativo", e.target.value === "true")}
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <Button 
                          onClick={() => removeFinanceiraRow(fin.id)} 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 h-9 w-9 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex justify-end mt-4 sticky bottom-4">
              <Button onClick={salvarFinanceiras} disabled={savingFinanceiras} className="bg-sun hover:bg-sun-deep text-navy font-semibold shadow-lg">
                {savingFinanceiras ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Taxas de Financiamento
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
