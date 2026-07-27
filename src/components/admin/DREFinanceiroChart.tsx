import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DREDataPoint {
  mes: string;
  receitaBruta: number;
  impostosDeducoes: number;
  comissoesMMN: number;
  lucroLiquido: number;
}

const MOCK_DRE_MONTHLY: DREDataPoint[] = [
  { mes: "Jan", receitaBruta: 980000, impostosDeducoes: 117600, comissoesMMN: 196000, lucroLiquido: 294000 },
  { mes: "Fev", receitaBruta: 1120000, impostosDeducoes: 134400, comissoesMMN: 224000, lucroLiquido: 336000 },
  { mes: "Mar", receitaBruta: 1250000, impostosDeducoes: 150000, comissoesMMN: 250000, lucroLiquido: 375000 },
  { mes: "Abr", receitaBruta: 1380000, impostosDeducoes: 165600, comissoesMMN: 276000, lucroLiquido: 414000 },
  { mes: "Mai", receitaBruta: 1510000, impostosDeducoes: 181200, comissoesMMN: 302000, lucroLiquido: 453000 },
  { mes: "Jun", receitaBruta: 1690000, impostosDeducoes: 202800, comissoesMMN: 338000, lucroLiquido: 507000 },
  { mes: "Jul", receitaBruta: 1850000, impostosDeducoes: 222000, comissoesMMN: 370000, lucroLiquido: 555000 },
];

export function DREFinanceiroChart() {
  const [viewMode, setViewMode] = React.useState<"mensal" | "trimestral">("mensal");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Evolução Contábil & Demonstração de Resultados (DRE)</span>
            <Badge variant="emerald" className="text-[10px]">
              MARGEM PISO 20% ATIVA
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Curvas gradientes de receita bruta, impostos eNotas, comissões MMN e lucro líquido
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 p-1 bg-background/80 rounded-xl border border-border/60 text-xs font-semibold">
          <button
            onClick={() => setViewMode("mensal")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all cursor-pointer",
              viewMode === "mensal"
                ? "bg-amber-400 text-slate-950 font-bold shadow-sm glow-amber"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Mensal
          </button>
          <button
            onClick={() => setViewMode("trimestral")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all cursor-pointer",
              viewMode === "trimestral"
                ? "bg-amber-400 text-slate-950 font-bold shadow-sm glow-amber"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Trimestral
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DRE_MONTHLY} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                {/* Receita Gradient */}
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc107" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ffc107" stopOpacity={0.0} />
                </linearGradient>

                {/* Comissões Gradient */}
                <linearGradient id="colorComissoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>

                {/* Lucro Gradient */}
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-1.5 dark:bg-slate-900/95">
                      <p className="font-bold text-foreground border-b border-border/40 pb-1">{label}</p>
                      {payload.map((item: any) => (
                        <div key={item.name} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}:
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }} />
              
              <Area
                type="monotone"
                dataKey="receitaBruta"
                name="Receita Bruta"
                stroke="#ffc107"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReceita)"
              />
              <Area
                type="monotone"
                dataKey="comissoesMMN"
                name="Comissões MMN"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorComissoes)"
              />
              <Area
                type="monotone"
                dataKey="lucroLiquido"
                name="Lucro Líquido"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLucro)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

Let's write `src/components/admin/DREFinanceiroChart.tsx`.HINSTANCE    call:default_api:write_to_file{CodeContent:
