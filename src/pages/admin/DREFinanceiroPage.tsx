import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DREFinanceiroChart } from "@/components/admin/DREFinanceiroChart";

export function DREFinanceiroPage() {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Demonstração do Resultado do Exercício (DRE)</span>
              <Badge variant="emerald" className="text-[10px]">
                ESCRITURAÇÃO LEDGER SHA-256
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Relatório financeiro consolidado com verificação de Trava de Margem Piso (20%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Exportar CSV</span>
            </Button>

            <Button variant="sun" size="sm" className="gap-2 rounded-xl text-xs text-slate-950 font-bold">
              <Download className="h-3.5 w-3.5" />
              <span>Relatório PDF</span>
            </Button>
          </div>
        </div>

        {/* Recharts Glow Chart */}
        <DREFinanceiroChart />

        {/* Detailed DRE Table */}
        <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-amber-500" />
              <span>Detalhamento da Escrituração Contábil (DRE 2026)</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Linha da DRE</th>
                  <th className="py-3 px-4 text-right">Valor Acumulado (R$)</th>
                  <th className="py-3 px-4 text-right">% Receita Bruta</th>
                  <th className="py-3 px-4 text-center">Status Criptográfico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                <tr className="hover:bg-accent/40">
                  <td className="py-3 px-4 font-bold text-foreground">1. Receita Operacional Bruta (Vendas EPC + GD)</td>
                  <td className="py-3 px-4 text-right text-amber-500 font-bold">{formatCurrency(14850200)}</td>
                  <td className="py-3 px-4 text-right">100,0%</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="emerald" className="text-[9px]">CONFIRMADO</Badge>
                  </td>
                </tr>

                <tr className="hover:bg-accent/40 text-muted-foreground">
                  <td className="py-3 px-4 pl-8">(-) Deduções Fiscais eNotas (ISS / PIS / COFINS)</td>
                  <td className="py-3 px-4 text-right text-rose-400">({formatCurrency(1782024)})</td>
                  <td className="py-3 px-4 text-right">12,0%</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="text-[9px]">eNotas SEFAZ</Badge>
                  </td>
                </tr>

                <tr className="hover:bg-accent/40 font-semibold bg-background/30">
                  <td className="py-3 px-4 font-bold text-foreground">2. Receita Operacional Líquida</td>
                  <td className="py-3 px-4 text-right text-foreground font-bold">{formatCurrency(13068176)}</td>
                  <td className="py-3 px-4 text-right font-bold">88,0%</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="emerald" className="text-[9px]">CONFIRMADO</Badge>
                  </td>
                </tr>

                <tr className="hover:bg-accent/40 text-muted-foreground">
                  <td className="py-3 px-4 pl-8">(-) Custos de Hardware Solar (BOM Tier-1 Painéis/Inversores)</td>
                  <td className="py-3 px-4 text-right text-rose-400">({formatCurrency(5940080)})</td>
                  <td className="py-3 px-4 text-right">40,0%</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="text-[9px]">Semáforo EPC</Badge>
                  </td>
                </tr>

                <tr className="hover:bg-accent/40 text-muted-foreground">
                  <td className="py-3 px-4 pl-8">(-) Repasses e Comissões da Rede MMN (Unilevel 7 Níveis)</td>
                  <td className="py-3 px-4 text-right text-rose-400">({formatCurrency(2970040)})</td>
                  <td className="py-3 px-4 text-right">20,0%</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="text-[9px]">Split BaaS</Badge>
                  </td>
                </tr>

                <tr className="hover:bg-accent/40 font-bold bg-amber-400/10 text-amber-500">
                  <td className="py-3.5 px-4 font-extrabold flex items-center gap-2">
                    <span>3. LUCRO LÍQUIDO OPERACIONAL (EBIT)</span>
                    <Badge variant="sun" className="text-[9px]">PISO 20% ATINGIDO</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-base">{formatCurrency(4158056)}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-base">28,0%</td>
                  <td className="py-3.5 px-4 text-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
