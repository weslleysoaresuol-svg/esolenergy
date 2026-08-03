import * as React from "react";
import { motion } from "framer-motion";
import {
  Building,
  UserCheck,
  Receipt,
  CheckCircle2,
  FileText,
  Search,
  Send,
  Calculator,
  Download,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface PartnerTaxInvoiceRecord {
  id: string;
  consultor: string;
  doc: string;
  regime: "PJ_MEI" | "PJ_Simples" | "PF_RPA" | "PJ_LucroPresumido" | "PJ_LucroReal";
  valorBruto: number;
  inssRetido: number;
  irrfRetido: number;
  valorLiquido: number;
  status: "autorizado" | "pendente" | "rpa_gerado";
}

const MOCK_PARTNER_TAX_RECORDS: PartnerTaxInvoiceRecord[] = [
  {
    id: "tax-301",
    consultor: "Roberto Fonseca Consultoria Solar",
    doc: "44.120.940/0001-92",
    regime: "PJ_MEI",
    valorBruto: 7200.0,
    inssRetido: 0.0,
    irrfRetido: 0.0,
    valorLiquido: 7200.0,
    status: "autorizado",
  },
  {
    id: "tax-302",
    consultor: "Ana Beatriz Rocha",
    doc: "123.456.789-00",
    regime: "PF_RPA",
    valorBruto: 4850.0,
    inssRetido: 533.5,
    irrfRetido: 341.2,
    valorLiquido: 3975.3,
    status: "pendente",
  },
  {
    id: "tax-303",
    consultor: "Felipe Mendonça",
    doc: "987.654.321-11",
    regime: "PF_RPA",
    valorBruto: 2100.0,
    inssRetido: 231.0,
    irrfRetido: 0.0, // Isento de IRRF por tabela progressiva
    valorLiquido: 1869.0,
    status: "rpa_gerado",
  },
];

export function PartnerTaxInvoicing() {
  const [records, setRecords] = React.useState<PartnerTaxInvoiceRecord[]>(MOCK_PARTNER_TAX_RECORDS);
  const [activeTab, setActiveTab] = React.useState<"all" | "pj" | "pf">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleApprove = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "autorizado" } : r))
    );
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.consultor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.doc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pj" && r.regime.startsWith("PJ")) ||
      (activeTab === "pf" && r.regime === "PF_RPA");

    return matchesSearch && matchesTab;
  });

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-500" />
            <span>Gestão de Auto-Faturamento PJ & Repasses RPA PF</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Cálculo automatizado de retenções de IRRF/INSS para autônomos e auto-faturamento eNotas PJ
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <Receipt className="h-3 w-3" />
          MOTOR FISCAL ENOTAS ATIVO
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-background/80 rounded-xl border border-border/60 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeTab === "all" ? "bg-amber-400 text-slate-950 font-bold glow-amber" : "text-muted-foreground"
              )}
            >
              Todos os Consultores
            </button>
            <button
              onClick={() => setActiveTab("pj")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeTab === "pj" ? "bg-amber-400 text-slate-950 font-bold glow-amber" : "text-muted-foreground"
              )}
            >
              Parceiros PJ (Auto-Faturamento)
            </button>
            <button
              onClick={() => setActiveTab("pf")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap",
                activeTab === "pf" ? "bg-amber-400 text-slate-950 font-bold glow-amber" : "text-muted-foreground"
              )}
            >
              Parceiros PF (Emissão RPA)
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por consultor ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
            />
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-3">
          {filteredRecords.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-3 dark:bg-slate-900/60 dark:border-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-500">{item.id}</span>
                  <span className="font-bold text-xs text-foreground">{item.consultor}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.regime === "PF_RPA" ? "PF — RPA Auto" : "PJ — MEI/Simples"}
                  </Badge>
                  {item.status === "autorizado" ? (
                    <Badge variant="emerald" className="text-[10px]">🟢 AUTORIZADO ENOTAS</Badge>
                  ) : item.status === "rpa_gerado" ? (
                    <Badge variant="cyan" className="text-[10px]">🔵 GUIA RPA EMITIDA</Badge>
                  ) : (
                    <Badge variant="sun" className="text-[10px]">🟡 PENDENTE APURAÇÃO</Badge>
                  )}
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">CNPJ/CPF: {item.doc}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Valor Bruto: {formatCurrency(item.valorBruto)} | INSS: ({formatCurrency(item.inssRetido)}) | IRRF: ({formatCurrency(item.irrfRetido)})
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Valor Líquido</span>
                    <strong className="text-emerald-500 font-extrabold text-sm font-mono">
                      {formatCurrency(item.valorLiquido)}
                    </strong>
                  </div>

                  {item.status === "pendente" && (
                    <Button
                      variant="sun"
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="h-8 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{item.regime === "PF_RPA" ? "Emitir Guia RPA" : "Aprovar Auto-Faturamento"}</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
