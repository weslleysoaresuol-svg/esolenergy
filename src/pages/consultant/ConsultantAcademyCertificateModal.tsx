import * as React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sun,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EsolBrandmarkGliph } from "@/components/brand/EsolBrandmarkGliph";
import { EsolLogoPrimary } from "@/components/brand/EsolLogoPrimary";

export interface CertificateData {
  consultantName: string;
  courseTitle: string;
  hours: number;
  issuedDate: string;
  validationHash: string;
}

const MOCK_CERTIFICATE: CertificateData = {
  consultantName: "Roberto Fonseca",
  courseTitle: "Fundamentos de Engenharia Solar & Regulatório ANEEL Lei 14.300",
  hours: 12,
  issuedDate: "27 de Julho de 2026",
  validationHash: "SHA256-ESOL-8F3A9E1D2C4B5A6E7F8A9B0C1D2E3F4A",
};

export function ConsultantAcademyCertificateModal() {
  const [copied, setCopied] = React.useState(false);
  const cert = MOCK_CERTIFICATE;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(cert.validationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <EsolLogoPrimary width={180} height={45} showTagline={false} />
          <h1 className="text-xl font-black tracking-tight text-white mt-1">Certificado de Conclusão</h1>
          <p className="text-xs text-slate-400">Chancela Oficial de Capacitação Comercial</p>
        </div>

        {/* Certificate Golden Border Card Frame */}
        <Card className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl backdrop-blur-xl overflow-hidden relative">
          {/* Inner Golden Line Frame */}
          <div className="absolute inset-2 border border-amber-400/30 rounded-2xl pointer-events-none" />

          <CardContent className="p-6 space-y-5 text-center relative z-10">
            {/* Watermark Monogram Gliph eS */}
            <div className="flex justify-center">
              <EsolBrandmarkGliph size={56} badgeColor="amber" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">CERTIFICADO DE EXCELÊNCIA</span>
              <h2 className="text-lg font-black text-white tracking-tight">{cert.consultantName}</h2>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Concluiu com êxito a trilha de capacitação de <strong className="text-amber-300">{cert.hours} horas</strong> do curso:
              </p>
              <p className="text-xs font-bold text-amber-400 font-sans pt-1">"{cert.courseTitle}"</p>
            </div>

            {/* Certificate Hash & Validation Badge */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono space-y-1.5 text-left">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> ICP-BRASIL VERIFIED
                </span>
                <span>{cert.issuedDate}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <span className="truncate text-slate-400">{cert.validationHash}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-amber-400 hover:text-amber-300 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                <span>Baixar Certificado em PDF</span>
              </Button>

              <Button variant="outline" className="w-full h-11 text-xs border-slate-800 rounded-xl gap-2 cursor-pointer">
                <Share2 className="h-4 w-4" />
                <span>Compartilhar no LinkedIn / WhatsApp</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
