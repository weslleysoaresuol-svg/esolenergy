import * as React from "react";
import {
  PieChart,
  PieChart as PieIcon,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingDown,
  Building2,
  Users,
  ShieldCheck,
  Award,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface OPEXDepartment {
  name: string;
  value: number;
  color: string;
}

const MOCK_OPEX_DEPARTMENTS: OPEXDepartment[] = [
  { name: "TI & Engenharia Solar", value: 145000, color: "#ffc107" },
  { name: "Marketing SMM & CAPI", value: 85000, color: "#06b6d4" },
  { name: "Jurídico & Compliance", value: 42000, color: "#10b981" },
  { name: "Infraestrutura Cloud & SaaS", value: 38000, color: "#8b5cf6" },
  { name: "Overhead Administrativo", value: 65000, color: "#f43f5e" },
];

export interface CapTableEntry {
  socio: string;
  categoria: "Founder" | "Investidor" | "ESOP Pool";
  equity: number;
  vestingStatus: string;
  dividendosAno: number;
}

const MOCK_CAP_TABLE: CapTableEntry[] = [
  { socio: "Founders Holding LTDA", categoria: "Founder", equity: 65.0, vestingStatus: "100% Adquirido", dividendosAno: 1250000 },
  { socio: "Solar Venture Fund I", categoria: "Investidor", equity: 20.0, vestingStatus: "100% Adquirido", dividendosAno: 384000 },
  { socio: "Angel Investor Syndicate", categoria: "Investidor", equity: 8.0, vestingStatus: "100% Adquirido", dividendosAno: 153600 },
  { socio: "ESOP Executivo Pool", categoria: "ESOP Pool", equity: 7.0, vestingStatus: "48 Meses (Cliff 12M)", dividendosAno: 134400 },
];

export function OverheadHealthDashboard() {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Saúde do Overhead & Cap Table Governance</span>
              <Badge variant="sun" className="text-[10px]">
                OPEX SALUDABLE
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitoramento de custos operacionais, distribuição acionária e projeção de Runway.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald" className="gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              SOC 2 Compliant
            </Badge>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                OPEX Mensal Total
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-500 font-bold glow-amber">
                <Wallet className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-extrabold text-foreground">{formatCurrency(375000)}</div>
              <p className="text-[11px] text-muted-foreground">Custos fixos e folha equity</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Caixa & Runway
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 font-bold glow-emerald">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-extrabold text-emerald-500">38 Meses</div>
              <p className="text-[11px] text-muted-foreground">Com base na margem líquida atual</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Equity Founders Share
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-500 font-bold glow-cyan">
                <Building2 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-extrabold text-foreground">65,0%</div>
              <p className="text-[11px] text-muted-foreground">Controle majoritário absoluto</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                ESOP Pool Reservado
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 font-bold">
                <Award className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-extrabold text-foreground">7,0%</div>
              <p className="text-[11px] text-muted-foreground">Retenção de talentos chave</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Cap Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart OPEX */}
          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800 lg:col-span-1">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-amber-500" />
                <span>Divisão de OPEX por Departamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_OPEX_DEPARTMENTS}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {MOCK_OPEX_DEPARTMENTS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0];
                        return (
                          <div className="rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl p-2.5 shadow-2xl text-xs space-y-1 dark:bg-slate-900/95">
                            <p className="font-bold text-foreground">{data.name}</p>
                            <p className="font-mono text-amber-500 font-bold">{formatCurrency(data.value as number)}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cap Table Breakdown */}
          <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800 lg:col-span-2">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-500" />
                <span>Quadro de Sócios & Cap Table Governance</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Sócio / Entidade</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4 text-right">Equity (%)</th>
                    <th className="py-3 px-4">Status Vesting</th>
                    <th className="py-3 px-4 text-right">Dividendos 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {MOCK_CAP_TABLE.map((row) => (
                    <tr key={row.socio} className="hover:bg-accent/40">
                      <td className="py-3.5 px-4 font-bold text-foreground">{row.socio}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={row.categoria === "Founder" ? "sun" : row.categoria === "Investidor" ? "cyan" : "outline"}
                          className="text-[10px]"
                        >
                          {row.categoria}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">{row.equity.toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px] flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{row.vestingStatus}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-500 font-bold">
                        {formatCurrency(row.dividendosAno)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
