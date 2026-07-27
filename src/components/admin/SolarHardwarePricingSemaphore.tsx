import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Cpu,
  Layers,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface HardwareItem {
  id: string;
  fornecedor: string;
  categoria: "Painel TOPCon" | "Inversor Híbrido" | "Estrutura Solo/Telhado" | "String Box";
  modelo: string;
  potenciaUnit: string;
  precoUnitario: number;
  custoPorWp: number; // R$/Wp
  statusSemaforo: "verde" | "amarelo" | "vermelho";
  estoqueDisponivel: number;
}

const MOCK_HARDWARE_CATALOG: HardwareItem[] = [
  {
    id: "hw-1",
    fornecedor: "Canadian Solar Tier-1",
    categoria: "Painel TOPCon",
    modelo: "CS6W-575T N-Type Glass-Glass",
    potenciaUnit: "575 Wp",
    precoUnitario: 890.0,
    custoPorWp: 1.54,
    statusSemaforo: "verde",
    estoqueDisponivel: 1420,
  },
  {
    id: "hw-2",
    fornecedor: "JA Solar Tier-1",
    categoria: "Painel TOPCon",
    modelo: "JAM72S30-555/MR 555W",
    potenciaUnit: "555 Wp",
    precoUnitario: 943.5,
    custoPorWp: 1.70,
    statusSemaforo: "verde",
    estoqueDisponivel: 850,
  },
  {
    id: "hw-3",
    fornecedor: "Sungrow Heavy Duty",
    categoria: "Inversor Híbrido",
    modelo: "SG110CX Trifásico 380V",
    potenciaUnit: "110 kW",
    precoUnitario: 34500.0,
    custoPorWp: 1.95,
    statusSemaforo: "amarelo",
    estoqueDisponivel: 45,
  },
  {
    id: "hw-4",
    fornecedor: "Deye Hybrid Systems",
    categoria: "Inversor Híbrido",
    modelo: "SUN-50K-SG01HP3 Trifásico High Volt",
    potenciaUnit: "50 kW",
    precoUnitario: 18900.0,
    custoPorWp: 2.25,
    statusSemaforo: "vermelho",
    estoqueDisponivel: 12,
  },
];

export function SolarHardwarePricingSemaphore() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const filteredHardware = MOCK_HARDWARE_CATALOG.filter(
    (item) =>
      item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSemaphoreBadge = (status: HardwareItem["statusSemaforo"]) => {
    switch (status) {
      case "verde":
        return <Badge variant="emerald" className="text-[10px]">🟢 MARGEM SEGURA (&gt;25%)</Badge>;
      case "amarelo":
        return <Badge variant="sun" className="text-[10px]">🟡 ATENÇÃO (20% - 25%)</Badge>;
      case "vermelho":
        return <Badge variant="rose" className="text-[10px]">🔴 ALERTA MARGEM PISO (&lt;20%)</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span>Semáforo de Preços & Cotação Hardware Solar Tier-1</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Proteção da Trava de Margem Piso (20%) com cálculo automático de R$/Wp
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/60 text-xs font-mono">
            <span className="text-muted-foreground">USD/BRL PTAX:</span>
            <strong className="text-emerald-500 font-bold">R$ 5,42</strong>
          </div>

          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Cotação API</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar fornecedor, modelo ou categoria de insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Hardware Catalog Table */}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Fornecedor Tier-1</th>
                <th className="py-3 px-4">Categoria / Modelo</th>
                <th className="py-3 px-4 text-center">Especificação</th>
                <th className="py-3 px-4 text-right">Preço Unitário</th>
                <th className="py-3 px-4 text-right">Custo R$/Wp</th>
                <th className="py-3 px-4 text-center">Status Semáforo Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredHardware.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{item.fornecedor}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{item.modelo}</div>
                    <div className="text-[10px] text-muted-foreground">{item.categoria}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-foreground">
                    {item.potenciaUnit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                    {formatCurrency(item.precoUnitario)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-500">
                    R$ {item.custoPorWp.toFixed(2)}/Wp
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getSemaphoreBadge(item.statusSemaforo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
