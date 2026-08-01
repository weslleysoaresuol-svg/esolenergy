import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Users,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: "Nivel_1_SuperAdmin" | "Nivel_3_Financeiro" | "Nivel_5_VendasAdmin";
  actorName: string;
  actionType: "LEITURA_LEDGER" | "SOLICITACAO_AJUSTE_PONTOS" | "CO_APROVACAO_FINANCEIRO";
  targetConsultantName: string;
  details: string;
  status: "APROVADO" | "PENDENTE_CO_APROVACAO" | "REJEITADO";
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-501",
    timestamp: "01/08/2026 14:10",
    actorRole: "Nivel_5_VendasAdmin",
    actorName: "Marcio Vendas (Nível 5)",
    actionType: "SOLICITACAO_AJUSTE_PONTOS",
    targetConsultantName: "Gabriel Medeiros",
    details: "Solicitação de inclusão manual de 500 EP devido a problema na API externa eNotas.",
    status: "PENDENTE_CO_APROVACAO",
  },
  {
    id: "log-502",
    timestamp: "01/08/2026 13:45",
    actorRole: "Nivel_3_Financeiro",
    actorName: "Ana Paula (Nível 3)",
    actionType: "CO_APROVACAO_FINANCEIRO",
    targetConsultantName: "Juliana Paes",
    details: "Co-aprovação de ajuste de +250 PTS referente a comissão retroativa do mês 06/2026.",
    status: "APROVADO",
  },
  {
    id: "log-503",
    timestamp: "01/08/2026 12:30",
    actorRole: "Nivel_5_VendasAdmin",
    actorName: "Marcio Vendas (Nível 5)",
    actionType: "LEITURA_LEDGER",
    targetConsultantName: "Todos Consultores",
    details: "Consulta read-only ao extrato do ledger de pontos da perna A.",
    status: "APROVADO",
  },
];

export function AdminAuditLogFeed() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [userRole] = React.useState<"Nivel_5_VendasAdmin" | "Nivel_3_Financeiro">("Nivel_5_VendasAdmin");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [justification, setJustification] = React.useState("");
  const [targetConsultant, setTargetConsultant] = React.useState("");
  const [pointsAmount, setPointsAmount] = React.useState("");

  const handleRequestAdjustment = () => {
    if (justification.length < 20) {
      alert("A justificativa deve conter no mínimo 20 caracteres para fins de compliance RBAC.");
      return;
    }

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("pt-BR"),
      actorRole: userRole,
      actorName: "Você (Admin Nível 5 - Read-Only)",
      actionType: "SOLICITACAO_AJUSTE_PONTOS",
      targetConsultantName: targetConsultant || "Consultor Selecionado",
      details: `Solicitação de ${pointsAmount} PTS: ${justification}`,
      status: "PENDENTE_CO_APROVACAO",
    };

    setLogs((prev) => [newLog, ...prev]);
    setIsModalOpen(false);
    setJustification("");
    setTargetConsultant("");
    setPointsAmount("");
  };

  return (
    <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden font-sans">
      <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-mono font-bold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>BLINDAGEM RBAC & AUDIT LOG V12.0</span>
            </div>
            <CardTitle className="text-lg font-black text-white tracking-tight">
              Feed de Auditoria & Modificações do Ledger
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Nível 5 Read-Only • Qualquer alteração manual exige co-aprovação do Financeiro (Nível 3)
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs gap-2 rounded-2xl cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Solicitar Ajuste Manual (Requer Nível 3)</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Modal form for adjustment */}
        {isModalOpen && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Solicitação de Ajuste de Pontos (Sujeito a Co-Aprovação)
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="Nome/CPF do Consultor"
                value={targetConsultant}
                onChange={(e) => setTargetConsultant(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white"
              />
              <Input
                type="number"
                placeholder="Quantidade de Pontos (ex: 500)"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white"
              />
            </div>

            <Input
              type="text"
              placeholder="Justificativa obrigatória para auditoria (mínimo 20 caracteres)..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="bg-slate-900 border-slate-800 text-xs text-white"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRequestAdjustment}
                className="bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Enviar para Co-Aprovação do Nível 3
              </Button>
            </div>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 text-[10px]">{log.timestamp}</span>
                  <strong className="text-white font-bold">{log.actorName}</strong>
                  <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-700">
                    {log.actionType}
                  </Badge>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{log.details}</p>
                <span className="text-[10px] text-slate-500 font-mono block">Alvo: {log.targetConsultantName}</span>
              </div>

              <div>
                {log.status === "APROVADO" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Aprovado
                  </Badge>
                )}
                {log.status === "PENDENTE_CO_APROVACAO" && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] gap-1 animate-pulse">
                    <Clock className="h-3 w-3" /> Aguardando Co-Aprovação N3
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
