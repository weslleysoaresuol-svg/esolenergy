import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Activity,
  Receipt,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface FiscalInvoiceRecord {
  id: string;
  numeroNota: string;
  cliente: string;
  docCliente: string;
  tipoNota: "NFe_Hardware" | "NFSe_Servico";
  valorTotal: number;
  impostosRetidos: number;
  ufSefaz: string;
  statusSefaz: "autorizada" | "contingencia" | "cancelada" | "processando";
  emitoEm: string;
}

const MOCK_FISCAL_RECORDS: FiscalInvoiceRecord[] = [
  {
    id: "enota-501",
    numeroNota: "NFe-004128",
    cliente: "Usina Solar Fazenda Boa Vista",
    docCliente: "12.345.678/0001-99",
    tipoNota: "NFe_Hardware",
    valorTotal: 85000.0,
    impostosRetidos: 9350.0,
    ufSefaz: "SP",
    statusSefaz: "autorizada",
    emitoEm: "26/07/2026 18:40",
  },
  {
    id: "enota-502",
    numeroNota: "NFSe-008912",
    cliente: "Ana Beatriz Rocha",
    docCliente: "123.456.789-00",
    tipoNota: "NFSe_Servico",
    valorTotal: 4850.0,
    impostosRetidos: 533.5,
    ufSefaz: "MG",
    statusSefaz: "autorizada",
    emitoEm: "26/07/2026 19:15",
  },
  {
    id: "enota-503",
    numeroNota: "NFe-004129",
    cliente: "Indústria Solar Paranaense LTDA",
    docCliente: "88.777.666/0001-11",
    tipoNota: "NFe_Hardware",
    valorTotal: 124000.0,
    impostosRetidos: 13640.0,
    ufSefaz: "PR",
    statusSefaz: "contingencia",
    emitoEm: "26/07/2026 21:02",
  },
];

export function FiscalAuditPanel() {
  const [records, setRecords] = React.useState<FiscalInvoiceRecord[]>(MOCK_FISCAL_RECORDS);
  const [searchTerm, setSearchTerm] = React.useState("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleRetransmit = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, statusSefaz: "autorizada" } : r))
    );
  };

  const filteredRecords = records.filter(
    (r) =>
      r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.numeroNota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.docCliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: FiscalInvoiceRecord["statusSefaz"]) => {
    switch (status) {
      case "autorizada":
        return <Badge variant="emerald" className="text-[10px]">🟢 AUTORIZADA SEFAZ</Badge>;
      case "contingencia":
        return <Badge variant="sun" className="text-[10px]">🟡 CONTINGÊNCIA RE-TRANSMISSÃO</Badge>;
      case "cancelada":
        return <Badge variant="rose" className="text-[10px]">🔴 CANCELADA</Badge>;
      case "processando":
        return <Badge variant="cyan" className="text-[10px]">🔵 PROCESSANDO ENOTAS</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            <span>Painel de Auditoria Fiscal eNotas & Monitor SEFAZ</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Emissão automatizada de NFe/NFS-e e status de disponibilidade dos servidores estaduais
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <Activity className="h-3 w-3" />
          ENOTAS API CONECTADO
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* SEFAZ Server Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-accent/30 p-3 rounded-2xl border border-border/50">
          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-mono block">SEFAZ-SP</span>
            <span className="text-xs font-bold text-emerald-500">🟢 Operacional</span>
          </div>

          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-mono block">SEFAZ-MG</span>
            <span className="text-xs font-bold text-emerald-500">🟢 Operacional</span>
          </div>

          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-mono block">SEFAZ-PR</span>
            <span className="text-xs font-bold text-emerald-500">🟢 Operacional</span>
          </div>

          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-mono block">SEFAZ-BA</span>
            <span className="text-xs font-bold text-amber-500">🟡 Instabilidade</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por número da nota, cliente ou CNPJ/CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Invoice Records List */}
        <div className="space-y-3">
          {filteredRecords.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-3 dark:bg-slate-900/60 dark:border-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-500">{item.numeroNota}</span>
                  <span className="font-bold text-xs text-foreground">{item.cliente}</span>
                  <Badge variant="outline" className="text-[10px]">
                    UF: {item.ufSefaz}
                  </Badge>
                  {getStatusBadge(item.statusSefaz)}
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">{item.emitoEm}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-mono">
                    CNPJ/CPF: <strong className="text-foreground">{item.docCliente}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Valor Total: {formatCurrency(item.valorTotal)} | Impostos Retidos: ({formatCurrency(item.impostosRetidos)})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.statusSefaz === "contingencia" ? (
                    <Button
                      variant="sun"
                      size="sm"
                      onClick={() => handleRetransmit(item.id)}
                      className="h-8 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Re-transmitir SEFAZ</span>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-xl">
                      <Download className="h-3.5 w-3.5 text-amber-500" />
                      <span>XML / DANFE</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
