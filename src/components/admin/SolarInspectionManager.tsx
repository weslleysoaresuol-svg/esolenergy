import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckSquare,
  Zap,
  Calendar,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface InspectionRecord {
  id: string;
  projetoId: string;
  cliente: string;
  concessionaria: string;
  potenciaKwp: number;
  dataVistoria: string;
  numeroSerieMedidor?: string;
  status: "vistoria_agendada" | "vistoria_aprovada" | "medidor_instalado" | "pendencia_padrao";
  checklist: {
    aterramentoOk: boolean;
    antiIlhamentoOk: boolean;
    sinalizacaoPadraoOk: boolean;
    diagramaUnifilarLocalOk: boolean;
  };
}

const MOCK_INSPECTIONS: InspectionRecord[] = [
  {
    id: "insp-1",
    projetoId: "EPC-1046",
    cliente: "Centro Logístico Mega",
    concessionaria: "Enel SP",
    potenciaKwp: 850.0,
    dataVistoria: "02/08/2026",
    numeroSerieMedidor: "BID-889420-SP",
    status: "medidor_instalado",
    checklist: {
      aterramentoOk: true,
      antiIlhamentoOk: true,
      sinalizacaoPadraoOk: true,
      diagramaUnifilarLocalOk: true,
    },
  },
  {
    id: "insp-2",
    projetoId: "EPC-1043",
    cliente: "Fazenda Sol Radiante",
    concessionaria: "Cemig MG",
    potenciaKwp: 1200.0,
    dataVistoria: "05/08/2026",
    numeroSerieMedidor: "BID-991044-MG",
    status: "vistoria_aprovada",
    checklist: {
      aterramentoOk: true,
      antiIlhamentoOk: true,
      sinalizacaoPadraoOk: true,
      diagramaUnifilarLocalOk: false,
    },
  },
  {
    id: "insp-3",
    projetoId: "EPC-1042",
    cliente: "Industria Solar S/A",
    concessionaria: "Enel SP",
    potenciaKwp: 450.5,
    dataVistoria: "12/08/2026",
    status: "vistoria_agendada",
    checklist: {
      aterramentoOk: true,
      antiIlhamentoOk: true,
      sinalizacaoPadraoOk: false,
      diagramaUnifilarLocalOk: false,
    },
  },
];

export function SolarInspectionManager() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredInspections = MOCK_INSPECTIONS.filter(
    (item) =>
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projetoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.numeroSerieMedidor && item.numeroSerieMedidor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: InspectionRecord["status"]) => {
    switch (status) {
      case "medidor_instalado":
        return <Badge variant="emerald" className="text-[10px]">🟢 MEDIDOR BIDIRECIONAL INSTALADO & ENERGIZADO</Badge>;
      case "vistoria_aprovada":
        return <Badge variant="sun" className="text-[10px]">🟡 VISTORIA APROVADA (AGUARDANDO TROCA MEDIDOR)</Badge>;
      case "vistoria_agendada":
        return <Badge variant="cyan" className="text-[10px]">🔵 VISTORIA AGENDADA</Badge>;
      case "pendencia_padrao":
        return <Badge variant="rose" className="text-[10px]">🔴 PENDÊNCIA TÉCNICA PADRÃO</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Gauge className="h-5 w-5 text-amber-500" />
            <span>Central de Vistorias & Medidores Bidirecionais GD</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Comissionamento elétrico de campo, protocolo de ligação final e número de série do medidor
          </CardDescription>
        </div>

        <Badge variant="sun" className="gap-1 text-[10px]">
          <Zap className="h-3 w-3" />
          GERAÇÃO DISTRIBUÍDA ATIVA
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filtrar por projeto, cliente ou número de série do medidor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Inspections List */}
        <div className="space-y-4">
          {filteredInspections.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-3 dark:bg-slate-900/60 dark:border-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-500">{item.projetoId}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.concessionaria}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>Data Vistoria: <strong>{item.dataVistoria}</strong></span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{item.cliente}</h4>
                  <p className="text-muted-foreground font-mono">
                    Nº de Série Medidor BID:{" "}
                    <strong className="text-emerald-500">
                      {item.numeroSerieMedidor || "Aguardando Instalação"}
                    </strong>
                  </p>
                </div>

                {/* Electrical Checklist Items */}
                <div className="flex flex-wrap items-center gap-3 bg-accent/40 p-2.5 rounded-xl border border-border/40 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Checkbox checked={item.checklist.aterramentoOk} id={`at-${item.id}`} />
                    <label htmlFor={`at-${item.id}`} className="cursor-pointer text-muted-foreground">
                      Aterramento NBR
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox checked={item.checklist.antiIlhamentoOk} id={`ai-${item.id}`} />
                    <label htmlFor={`ai-${item.id}`} className="cursor-pointer text-muted-foreground">
                      Anti-Ilhamento
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox checked={item.checklist.sinalizacaoPadraoOk} id={`sp-${item.id}`} />
                    <label htmlFor={`sp-${item.id}`} className="cursor-pointer text-muted-foreground">
                      Sinalização Padrão
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
