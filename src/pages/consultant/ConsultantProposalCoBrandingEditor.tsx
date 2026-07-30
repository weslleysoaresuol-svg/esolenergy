import * as React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Image,
  Upload,
  CheckCircle2,
  Eye,
  Sun,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  QrCode,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export interface AccentColor {
  id: string;
  name: string;
  hex: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
}

const ACCENT_COLORS: AccentColor[] = [
  {
    id: "gold",
    name: "Dourado Solar",
    hex: "#F59E0B",
    borderClass: "border-amber-400",
    bgClass: "bg-amber-400/20",
    textClass: "text-amber-400",
  },
  {
    id: "blue",
    name: "Azul Tecnológico",
    hex: "#3B82F6",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-500",
  },
  {
    id: "emerald",
    name: "Esmeralda Eco",
    hex: "#10B981",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-500/20",
    textClass: "text-emerald-500",
  },
  {
    id: "purple",
    name: "Roxo Executive",
    hex: "#8B5CF6",
    borderClass: "border-purple-500",
    bgClass: "bg-purple-500/20",
    textClass: "text-purple-500",
  },
];

export function ConsultantProposalCoBrandingEditor() {
  const [selectedColor, setSelectedColor] = React.useState<AccentColor>(ACCENT_COLORS[0]);
  const [showPhoto, setShowPhoto] = React.useState(true);
  const [showPhone, setShowPhone] = React.useState(true);
  const [showQrCode, setShowQrCode] = React.useState(true);
  const [customLogoUploaded, setCustomLogoUploaded] = React.useState(false);

  const handleUploadLogo = () => {
    setCustomLogoUploaded(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Palette className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">EDITOR CO-BRANDING</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Marca & Cores</h1>
          <p className="text-xs text-slate-400">Passo 2 de 2: Personalização Gráfica da Proposta</p>
        </div>

        {/* Live Proposal Cover Preview Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="sun" className="text-[9px]">
                PREVIEW DA CAPA DA PROPOSTA
              </Badge>
              <Eye className="h-4 w-4 text-slate-400" />
            </div>

            {/* Mock Cover Preview Box */}
            <div className={cn("p-4 rounded-2xl bg-slate-950 border text-center space-y-3 relative transition-all", selectedColor.borderClass)}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sun className={cn("h-4 w-4", selectedColor.textClass)} />
                  <span>ESOL ENERGY</span>
                </div>
                {customLogoUploaded && (
                  <Badge variant="outline" className="text-[8px] border-slate-700 text-slate-300 font-mono">
                    PARCEIRO CO-BRANDED
                  </Badge>
                )}
              </div>

              <div className="space-y-1 py-1">
                <span className="text-[9px] font-mono uppercase text-slate-400">PROPOSTA COMERCIAL SOLAR EPC</span>
                <h3 className="font-black text-sm text-white">Supermercado Nova Era</h3>
                <span className={cn("text-xs font-bold font-mono block", selectedColor.textClass)}>
                  Sistema Solar 6.8 kWp • R$ 785/mês Economia
                </span>
              </div>

              {/* Consultant Footer Bar in Preview */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  {showPhoto && (
                    <div className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[9px]">
                      RF
                    </div>
                  )}
                  <span>Roberto Fonseca</span>
                </div>

                {showQrCode && <QrCode className="h-4 w-4 text-slate-400" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customization Options Card */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Logo Upload Section */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Image className="h-4 w-4 text-amber-400" /> Logotipo Co-Branded
              </Label>

              <Button
                type="button"
                variant={customLogoUploaded ? "emerald" : "outline"}
                size="sm"
                onClick={handleUploadLogo}
                className="w-full h-10 text-xs rounded-xl gap-2 cursor-pointer"
              >
                {customLogoUploaded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Logo Parceiro Anexado com Sucesso</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload de Logo do Consultor / Região</span>
                  </>
                )}
              </Button>
            </div>

            {/* Accent Color Palette Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-amber-400" /> Cor de Destaque da Marca
              </Label>

              <div className="grid grid-cols-4 gap-2">
                {ACCENT_COLORS.map((color) => {
                  const isSelected = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer",
                        isSelected
                          ? "border-amber-400 bg-slate-950 shadow-md"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      )}
                    >
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="h-6 w-6 rounded-full border border-white/20 shadow-inner"
                      />
                      <span className="text-[9px] font-bold text-slate-300 truncate max-w-full">{color.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-1 border-t border-slate-800">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">Exibição de Contatos na Capa</Label>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Foto de Perfil do Consultor
                </span>
                <Switch checked={showPhoto} onCheckedChange={setShowPhoto} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> WhatsApp Direto
                </span>
                <Switch checked={showPhone} onCheckedChange={setShowPhone} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-slate-400" /> QR Code da Proposta
                </span>
                <Switch checked={showQrCode} onCheckedChange={setShowQrCode} />
              </div>
            </div>

            {/* Action Button */}
            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Finalizar & Gerar Link de Compartilhamento</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
