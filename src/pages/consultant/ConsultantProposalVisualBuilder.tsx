import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Palette,
  User,
  Building,
  MapPin,
  Phone,
  MessageSquare,
  ArrowRight,
  Sun,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export interface ProposalTheme {
  id: "dark" | "light" | "green";
  title: string;
  description: string;
  previewClass: string;
  badge: string;
}

const MOCK_THEMES: ProposalTheme[] = [
  {
    id: "dark",
    title: "Dark Premium Executive",
    description: "Fundo escuro sofisticado com destaques em dourado e fontes de alto contraste.",
    previewClass: "bg-slate-950 border-amber-400/50 text-amber-400",
    badge: "MAIS POPULAR",
  },
  {
    id: "light",
    title: "Clean Light Corporate",
    description: "Design corporativo clean, minimalista e ideal para clientes empresariais.",
    previewClass: "bg-slate-100 border-slate-300 text-slate-900",
    badge: "CORPORATIVO",
  },
  {
    id: "green",
    title: "Eco Energy Green",
    description: "Estilo sustentável com degradê verde focado em sustentabilidade e meio ambiente.",
    previewClass: "bg-emerald-950 border-emerald-400/50 text-emerald-400",
    badge: "SUSTENTÁVEL",
  },
];

export function ConsultantProposalVisualBuilder() {
  const [selectedTheme, setSelectedTheme] = React.useState<"dark" | "light" | "green">("dark");
  const [clientName, setClientName] = React.useState("Supermercado Nova Era");
  const [clientDocument, setClientDocument] = React.useState("12.345.678/0001-90");
  const [clientCity, setClientCity] = React.useState("Campinas / SP");
  const [clientPhone, setClientPhone] = React.useState("(19) 98765-4321");
  const [welcomeNote, setWelcomeNote] = React.useState(
    "Prezado cliente, apresentamos nossa proposta comercial customizada para redução imediata dos seus custos de energia elétrica."
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <FileText className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">GERADOR DE PROPOSTAS</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Criador Visual</h1>
          <p className="text-xs text-slate-400">Passo 1 de 2: Tema Visual & Dados do Cliente</p>
        </div>

        {/* Main Card Container */}
        <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* Theme Selector Section */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-amber-400" /> Selecione o Tema da Proposta
              </Label>

              <div className="space-y-2">
                {MOCK_THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                        isSelected
                          ? "border-amber-400 bg-slate-950 shadow-lg glow-amber"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn("h-8 w-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0", theme.previewClass)}>
                          Aa
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-xs text-white">{theme.title}</h3>
                            <Badge variant="outline" className="text-[8px] border-slate-800 text-slate-400 font-mono">
                              {theme.badge}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{theme.description}</p>
                        </div>
                      </div>

                      <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0", isSelected ? "border-amber-400 bg-amber-400" : "border-slate-700")}>
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-slate-950" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Data Form */}
            <div className="space-y-3 pt-1">
              <Label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-amber-400" /> Dados do Cliente Final
              </Label>

              {/* Name */}
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Nome / Razão Social</Label>
                <Input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-slate-950/80 border-slate-800 focus-visible:ring-amber-400"
                />
              </div>

              {/* Document & City Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400">CPF / CNPJ</Label>
                  <Input
                    type="text"
                    value={clientDocument}
                    onChange={(e) => setClientDocument(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-slate-950/80 border-slate-800 font-mono focus-visible:ring-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-400">Cidade / UF</Label>
                  <Input
                    type="text"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-slate-950/80 border-slate-800 focus-visible:ring-amber-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">WhatsApp de Contato</Label>
                <Input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-slate-950/80 border-slate-800 font-mono focus-visible:ring-amber-400"
                />
              </div>

              {/* Custom Welcome Note */}
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Mensagem de Apresentação</Label>
                <Textarea
                  value={welcomeNote}
                  onChange={(e) => setWelcomeNote(e.target.value)}
                  className="text-xs rounded-xl bg-slate-950/80 border-slate-800 min-h-[60px] focus-visible:ring-amber-400"
                />
              </div>
            </div>

            {/* Action Button */}
            <Button variant="sun" className="w-full h-11 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer">
              <span>Avançar para Personalização Co-Branding</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
