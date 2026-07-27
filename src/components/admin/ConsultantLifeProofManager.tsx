import * as React from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Camera,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface LifeProofAuditRecord {
  id: string;
  consultor: string;
  cpf: string;
  graduacao: string;
  scoreMatchFacial: number; // Ex: 99.4%
  livenessStatus: "pass" | "fail" | "pending";
  statusProvaVida: "aprovado" | "pendente_captura" | "fraude_suspeita";
  dataUltimaVerificacao: string;
}

const MOCK_LIFE_PROOF_RECORDS: LifeProofAuditRecord[] = [
  {
    id: "bio-401",
    consultor: "Ana Beatriz Rocha",
    cpf: "123.456.789-00",
    graduacao: "Diretor Diamante",
    scoreMatchFacial: 99.4,
    livenessStatus: "pass",
    statusProvaVida: "aprovado",
    dataUltimaVerificacao: "15/07/2026 14:32 UTC",
  },
  {
    id: "bio-402",
    consultor: "Felipe Mendonça",
    cpf: "987.654.321-11",
    graduacao: "Gerente Ouro",
    scoreMatchFacial: 98.1,
    livenessStatus: "pass",
    statusProvaVida: "aprovado",
    dataUltimaVerificacao: "20/07/2026 10:15 UTC",
  },
  {
    id: "bio-403",
    consultor: "Roberto Fonseca",
    cpf: "456.789.123-22",
    graduacao: "Gerente Ouro",
    scoreMatchFacial: 0.0,
    livenessStatus: "pending",
    statusProvaVida: "pendente_captura",
    dataUltimaVerificacao: "Aguardando envio",
  },
  {
    id: "bio-404",
    consultor: "Marcos Vinicius Alves",
    cpf: "321.654.987-33",
    graduacao: "Consultor Bronze",
    scoreMatchFacial: 42.5,
    livenessStatus: "fail",
    statusProvaVida: "fraude_suspeita",
    dataUltimaVerificacao: "26/07/2026 21:05 UTC",
  },
];

export function ConsultantLifeProofManager() {
  const [records, setRecords] = React.useState<LifeProofAuditRecord[]>(MOCK_LIFE_PROOF_RECORDS);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleApprove = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, statusProvaVida: "aprovado", livenessStatus: "pass", scoreMatchFacial: 99.0 }
          : r
      )
    );
  };

  const handleResend = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, statusProvaVida: "pendente_captura" } : r
      )
    );
  };

  const filteredRecords = records.filter(
    (r) =>
      r.consultor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: LifeProofAuditRecord["statusProvaVida"]) => {
    switch (status) {
      case "aprovado":
        return <Badge variant="emerald" className="text-[10px]">🟢 BIOMETRIA FACIAL APROVADA</Badge>;
      case "pendente_captura":
        return <Badge variant="cyan" className="text-[10px]">🔵 AGUARDANDO CAPTURA FACIAL</Badge>;
      case "fraude_suspeita":
        return <Badge variant="rose" className="text-[10px]">🔴 SUSPEITA DE FRAUDE / FACE DIVERGENTE</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-amber-500" />
            <span>Módulo de Auditoria Biométrica & Prova de Vida Facial</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Verificação de vivacidade (Liveness Detection) e validação de biometria facial
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <ShieldCheck className="h-3 w-3" />
          KYC FACIAL ENGINE ATIVO
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por consultor, CPF ou ID biométrico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Audit Records List */}
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
                  {getStatusBadge(item.statusProvaVida)}
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">{item.dataUltimaVerificacao}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-mono">
                    CPF: <strong className="text-foreground">{item.cpf}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>Score Match Facial:</span>
                    <strong className={cn(
                      "font-mono font-bold",
                      item.scoreMatchFacial > 90 ? "text-emerald-500" : item.scoreMatchFacial > 50 ? "text-amber-500" : "text-rose-500"
                    )}>
                      {item.scoreMatchFacial.toFixed(1)}%
                    </strong>
                    <span>| Liveness: <strong className="uppercase">{item.livenessStatus}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResend(item.id)}
                    className="h-8 text-xs gap-1 rounded-lg"
                  >
                    <Camera className="h-3.5 w-3.5 text-amber-500" />
                    <span>Reenviar Link</span>
                  </Button>

                  {item.statusProvaVida !== "aprovado" && (
                    <Button
                      variant="sun"
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="h-8 text-xs font-bold text-slate-950 gap-1.5 shadow-sm glow-amber"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Aprovar Biometria</span>
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
