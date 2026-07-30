import * as React from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  Upload,
  Camera,
  CheckCircle2,
  Scan,
  ShieldCheck,
  Sparkles,
  Sun,
  ArrowRight,
  User,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface DocTypeOption {
  id: "cnh" | "rg" | "residence";
  title: string;
  subtitle: string;
  icon: any;
}

const DOC_TYPES: DocTypeOption[] = [
  {
    id: "cnh",
    title: "CNH (Habilitação)",
    subtitle: "Carteira Nacional de Habilitação Aberta ou Digital",
    icon: CreditCard,
  },
  {
    id: "rg",
    title: "RG (Frente & Verso)",
    subtitle: "Registro Geral de Identidade Civil",
    icon: FileText,
  },
  {
    id: "residence",
    title: "Comprovante Residência",
    subtitle: "Conta de Luz, Água ou Telefone recente",
    icon: FileCheck,
  },
];

export function ConsultantDocumentUploadKYC() {
  const [selectedDocType, setSelectedDocType] = React.useState<"cnh" | "rg" | "residence">("cnh");
  const [isUploaded, setIsUploaded] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsUploaded(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <FileCheck className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">KYC DOCUMENTOS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Upload de Documento</h1>
          <p className="text-xs text-slate-400">Validação Automática por Leitor OCR</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Document Type Selector Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Selecione o Documento para Envio
              </span>

              <div className="space-y-2">
                {DOC_TYPES.map((doc) => {
                  const Icon = doc.icon;
                  const isSelected = selectedDocType === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocType(doc.id);
                        setIsUploaded(false);
                      }}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                        isSelected
                          ? "border-amber-400 bg-slate-950 shadow-md glow-amber"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl border flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-amber-400/20 border-amber-400 text-amber-400"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-xs text-white">{doc.title}</h3>
                          <p className="text-[9px] text-slate-400">{doc.subtitle}</p>
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

            {/* Upload Zone */}
            <div className="space-y-2">
              <div
                onClick={handleUpload}
                className={cn(
                  "p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2",
                  isUploaded
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                )}
              >
                {isScanning ? (
                  <div className="space-y-2 py-2">
                    <Scan className="h-8 w-8 mx-auto text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-white block">Escaneando via OCR...</span>
                  </div>
                ) : isUploaded ? (
                  <div className="space-y-1.5 py-1">
                    <CheckCircle2 className="h-7 w-7 mx-auto text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 block">
                      Documento Processado com Sucesso!
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Clique para substituir a imagem
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1 py-1">
                    <Upload className="h-7 w-7 mx-auto text-amber-400" />
                    <span className="text-xs font-bold text-white block">
                      Tirar Foto ou Carregar Arquivo
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Formatos aceitos: JPG, PNG ou PDF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Extracted Data Preview Box */}
            {isUploaded && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <Scan className="h-3 w-3" /> DADOS EXTRAÍDOS POR OCR
                  </span>
                  <Badge variant="emerald" className="text-[8px]">100% MATCH</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block">NOME COMPLETO</span>
                    <strong className="text-white">ROBERTO FONSECA</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">CPF LIDO</span>
                    <strong className="text-amber-400">123.456.789-00</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="sun"
              disabled={!isUploaded}
              className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Avançar para Solicitação de Saque PIX</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
