import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileCheck,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Send,
  Lock,
  Unlock,
  Building,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface ConsultantContractRecord {
  id: string;
  consultor: string;
  cpfCnpj: string;
  graduacao: string;
  dataEmissao: string;
  dataVencimento: string;
  diasRestantes: number;
  assinaturaDigitalECPF: boolean;
  statusContrato: "vigente" | "vencendo" | "expirado_trava";
}

const MOCK_CONTRACT_RECORDS: ConsultantContractRecord[] = [
  {
    id: "ctr-901",
    consultor: "Ana Beatriz Rocha",
    cpfCnpj: "123.456.789-00",
    graduacao: "Diretor Diamante",
    dataEmissao: "10/01/2026",
    dataVencimento: "10/01/2027",
    diasRestantes: 167,
    assinaturaDigitalECPF: true,
    statusContrato: "vigente",
  },
  {
    id: "ctr-902",
    consultor: "Felipe Mendonça",
    cpfCnpj: "987.654.321-11",
    graduacao: "Gerente Ouro",
    dataEmissao: "15/08/2025",
    dataVencimento: "15/08/2026",
    diasRestantes: 20,
    assinaturaDigitalECPF: true,
    statusContrato: "vencendo",
  },
  {
    id: "ctr-903",
    consultor: "Lucas Ribeiro",
    cpfCnpj: "321.654.987-33",
    graduacao: "Consultor Bronze",
    dataEmissao: "01/06/2025",
    dataVencimento: "01/06/2026",
    diasRestantes: -55,
    assinaturaDigitalECPF: false,
    statusContrato: "expirado_trava",
  },
];

export function ConsultantContractRenewalManager() {
  const [records, setRecords] = React.useState<ConsultantContractRecord[]>(MOCK_CONTRACT_RECORDS);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSendRenewal = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, statusContrato: "vencendo" } : r
      )
    );
  };

  const filteredRecords = records.filter(
    (r) =>
      r.consultor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpfCnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ConsultantContractRecord["statusContrato"]) => {
    switch (status) {
      case "vigente":
        return <Badge variant="emerald" className="text-[10px]">🟢 CONTRATO VIGENTE (e-CPF OK)</Badge>;
      case "vencendo":
        return <Badge variant="sun" className="text-[10px]">🟡 VENCENDO EM BREVE (&lt;30 DIAS)</Badge>;
      case "expirado_trava":
        return <Badge variant="rose" className="text-[10px]">🔴 EXPIRADO / TRAVA DE REPASSES ATIVA</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-amber-500" />
            <span>Gestão de Contratos de Consultoria & Assinatura e-CPF</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Auditoria de vigência contratual anual e trava de repasses para contratos expirados
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <ShieldCheck className="h-3 w-3" />
          ESOL SIGN ICP-BRASIL
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por consultor, CPF/CNPJ ou número de contrato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Contract Records List */}
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
                  <span className="font-mono font-bold text-xs text-amber-500">{item.id}</span>
                  <span className="font-bold text-xs text-foreground">{item.consultor}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.graduacao}
                  </Badge>
                  {getStatusBadge(item.statusContrato)}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Vencimento: <strong>{item.dataVencimento}</strong></span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-mono">
                    CPF/CNPJ: <strong className="text-foreground">{item.cpfCnpj}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>Assinatura Digital:</span>
                    <strong className={cn(
                      "font-mono font-bold flex items-center gap-1",
                      item.assinaturaDigitalECPF ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {item.assinaturaDigitalECPF ? <CheckCircle2 className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      {item.assinaturaDigitalECPF ? "e-CPF Validado ICP-Brasil" : "Pendente Assinatura"}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 rounded-lg"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                    <span>Contrato PDF</span>
                  </Button>

                  <Button
                    variant="sun"
                    size="sm"
                    onClick={() => handleSendRenewal(item.id)}
                    className="h-8 text-xs font-bold text-slate-950 gap-1.5 shadow-sm glow-amber"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar Renovação</span>
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
