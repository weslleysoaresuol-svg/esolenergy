import * as React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Building,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Landmark,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function CorporateExpansionHub() {
  const ptaxRate = 5.45; // 1 USD = 5.45 BRL

  const entities = [
    {
      country: "Brasil",
      flag: "🇧🇷",
      name: "Esol Energy & Tecnologia S/A",
      doc: "CNPJ 48.912.304/0001-88",
      regime: "Lucro Real (SN 2026)",
      location: "São Paulo - SP, Brasil",
      status: "Ativa - Matriz Operacional",
      badge: "emerald",
    },
    {
      country: "Estados Unidos",
      flag: "🇺🇸",
      name: "Esol Energy Global LLC",
      doc: "EIN 98-0412891 (Delaware File #710492)",
      regime: "Pass-through Entity (DE/USA)",
      location: "Wilmington - DE, USA",
      status: "Ativa - Holding Internacional",
      badge: "cyan",
    },
  ];

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-500" />
            <span>Central de Expansão Corporativa Internacional (EUA & Brasil)</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Gestão multinacional de entidades jurídicas, consolidação PTAX e patentes globais
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="sun" className="gap-1 text-[10px] font-mono">
            <TrendingUp className="h-3 w-3" />1 USD = R$ {ptaxRate.toFixed(2)} (PTAX BANBAC)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Corporate Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-3 dark:bg-slate-900/60 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.flag}</span>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">{item.name}</h3>
                    <p className="text-[10px] font-mono text-muted-foreground">{item.doc}</p>
                  </div>
                </div>
                <Badge variant={item.badge as any} className="text-[9px]">
                  {item.status}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/40 font-mono">
                <p>● Regime Tributário: <strong className="text-foreground">{item.regime}</strong></p>
                <p>● Sede Registrada: <strong className="text-foreground">{item.location}</strong></p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 rounded-lg">
                  <FileText className="h-3 w-3 text-amber-500" />
                  <span>Ver Atos Constitutivos</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* IP & Patent Protection Summary */}
        <div className="p-4 rounded-2xl bg-accent/30 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Proteção de Propriedade Intelectual & Marcas Globais</span>
            </h4>
            <Badge variant="emerald" className="text-[10px]">
              USPTO & INPI REGISTRADOS
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground block font-mono">INPI Brasil (Marca & Software)</span>
              <strong className="text-foreground block font-bold">Esol Energy® — Reg. 941028391</strong>
              <span className="text-[10px] text-emerald-500 font-mono">Concessão Deferida 2026</span>
            </div>

            <div className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground block font-mono">USPTO Estados Unidos (Patent Pending)</span>
              <strong className="text-foreground block font-bold">Esol Sign Multi-Split™ Algorithmic Ledger</strong>
              <span className="text-[10px] text-cyan-500 font-mono">App. #18/940,210 USPTO</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="sun" size="sm" className="h-8 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber">
            <Landmark className="h-3.5 w-3.5" />
            <span>Gerar DRE Internacional Consolidado (USD/BRL)</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
