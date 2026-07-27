import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface ANEELProtocol {
  id: string;
  protocolo: string;
  projetoId: string;
  cliente: string;
  concessionaria: "Enel SP" | "CPFL Paulista" | "Cemig MG" | "Light RJ" | "Neoenergia";
  potenciaKwp: number;
  dataSubmissao: string;
  slaPrazoDias: number; // Dias restantes no prazo REN 1000/2021
  status: "em_analise" | "aprovado_sem_obras" | "aprovado_com_obras" | "exigencia_tecnica" | "indeferido";
  pdfUrl?: string;
  observacao: string;
}

const MOCK_ANEEL_PROTOCOLS: ANEELProtocol[] = [
  {
    id: "prot-1",
    protocolo: "PA-2026-88401",
    projetoId: "EPC-1042",
    cliente: "Industria Solar S/A",
    concessionaria: "Enel SP",
    potenciaKwp: 450.5,
    dataSubmissao: "10/07/2026",
    slaPrazoDias: 4,
    status: "aprovado_sem_obras",
    pdfUrl: "https://example.com/parecer-1042.pdf",
    observacao: "Parecer emitido sem necessidade de reforço de rede.",
  },
  {
    id: "prot-2",
    protocolo: "PA-2026-90124",
    projetoId: "EPC-1043",
    cliente: "Fazenda Sol Radiante",
    potenciaKwp: 1200.0,
    concessionaria: "Cemig MG",
    dataSubmissao: "14/07/2026",
    slaPrazoDias: 8,
    status: "aprovado_com_obras",
    pdfUrl: "https://example.com/parecer-1043.pdf",
    observacao: "Adequação de trafo de 500kVA requerida em até 60 dias.",
  },
  {
    id: "prot-3",
    protocolo: "PA-2026-91400",
    projetoId: "EPC-1044",
    cliente: "Supermercado EcoVida",
    concessionaria: "CPFL Paulista",
    potenciaKwp: 180.0,
    dataSubmissao: "22/07/2026",
    slaPrazoDias: 16,
    status: "em_analise",
    observacao: "Aguardando vistoria técnica de subestação.",
  },
  {
    id: "prot-4",
    protocolo: "PA-2026-92010",
    projetoId: "EPC-1045",
    cliente: "Condomínio Horizon",
    concessionaria: "Light RJ",
    potenciaKwp: 95.4,
    dataSubmissao: "25/07/2026",
    slaPrazoDias: 20,
    status: "exigencia_tecnica",
    observacao: "Pendente reenvio do diagrama unifilar assinado por responsável técnico ART.",
  },
];

export function ANEELAccessStatusManager() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredProtocols = MOCK_ANEEL_PROTOCOLS.filter(
    (p) =>
      p.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.concessionaria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ANEELProtocol["status"]) => {
    switch (status) {
      case "aprovado_sem_obras":
        return <Badge variant="emerald" className="text-[10px]">🟢 APROVADO SEM OBRAS</Badge>;
      case "aprovado_com_obras":
        return <Badge variant="sun" className="text-[10px]">🟡 APROVADO COM OBRAS</Badge>;
      case "em_analise":
        return <Badge variant="cyan" className="text-[10px]">🔵 EM ANÁLISE (SLA REN 1000)</Badge>;
      case "exigencia_tecnica":
        return <Badge variant="rose" className="text-[10px]">🟠 EXIGÊNCIA TÉCNICA</Badge>;
      case "indeferido":
        return <Badge variant="rose" className="text-[10px]">🔴 INDEFERIDO</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            <span>Gestão de Pareceres de Acesso ANEEL & Concessionárias</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Conformidade com a Resolução Normativa ANEEL 1.000/2021 e SLA de distribuidoras
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <ShieldCheck className="h-3 w-3" />
          REN 1.000/2021 VIGENTE
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filtrar por número de protocolo, cliente ou concessionária..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Protocol List */}
        <div className="space-y-3">
          {filteredProtocols.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-3 dark:bg-slate-900/60 dark:border-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-500">{item.protocolo}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.concessionaria}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>SLA ANEEL: <strong>{item.slaPrazoDias} dias restantes</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-foreground">{item.cliente} ({item.projetoId})</h4>
                  <p className="text-muted-foreground mt-0.5">{item.observacao}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-emerald-500">{item.potenciaKwp} kWp</span>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 rounded-lg">
                    <FileText className="h-3 w-3 text-amber-500" />
                    <span>Parecer PDF</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
