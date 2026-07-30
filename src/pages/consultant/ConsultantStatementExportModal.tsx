import * as React from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Sun,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export interface ExportFormatOption {
  id: "pdf" | "csv" | "ofx";
  title: string;
  subtitle: string;
  icon: any;
  extension: string;
}

const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    id: "pdf",
    title: "PDF Oficial IRRF / RPA",
    subtitle: "Informe de Rendimentos Anual p/ Imposto de Renda",
    icon: FileText,
    extension: ".pdf",
  },
  {
    id: "csv",
    title: "CSV Transacional",
    subtitle: "Arquivo de dados p/ Excel & Google Sheets",
    icon: FileSpreadsheet,
    extension: ".csv",
  },
  {
    id: "ofx",
    title: "OFX Padrão Bancário",
    subtitle: "Extrato para integração com contabilidade PJ",
    icon: Building,
    extension: ".ofx",
  },
];

export function ConsultantStatementExportModal() {
  const [selectedFormat, setSelectedFormat] = React.useState<"pdf" | "csv" | "ofx">("pdf");
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("current_month");
  const [isExporting, setIsExporting] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Download className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">EXPORTADOR FINANCEIRO</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Exportar Extratos & IRRF</h1>
          <p className="text-xs text-slate-400">Comprovantes Oficiais & Arquivos de Conciliação</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Format Selector Section */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                Formato do Arquivo
              </Label>

              <div className="space-y-2">
                {EXPORT_FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                        isSelected
                          ? "border-amber-400 bg-slate-950 shadow-lg glow-amber"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-xl border flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-amber-400/20 border-amber-400 text-amber-400"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-xs text-white leading-snug">{fmt.title}</h3>
                          <p className="text-[10px] text-slate-400">{fmt.subtitle}</p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-amber-400 bg-amber-400" : "border-slate-700"
                        )}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-slate-950" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Period Selector Section */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
                Período de Apuração
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "current_month", label: "Mês Atual (Jul/26)" },
                  { id: "last_3_months", label: "Últimos 3 Meses" },
                  { id: "year_2026", label: "Ano Vigente 2026" },
                  { id: "custom", label: "Personalizado" },
                ].map((period) => (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => setSelectedPeriod(period.id)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border text-center truncate",
                      selectedPeriod === period.id
                        ? "bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-sm"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Download Button */}
            <Button
              variant="sun"
              disabled={isExporting}
              onClick={handleExport}
              className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Gerando Arquivo...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-950" />
                  <span>Download Concluído!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Baixar Relatório Financeiro ({selectedFormat.toUpperCase()})</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
