import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Copy,
  Check,
  Terminal,
  Filter,
  RefreshCw,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  acao: string;
  modulo: string;
  operador: string;
  ipOrigem: string;
  hashSHA256: string;
  severidade: "info" | "warning" | "critical";
  detalhes: string;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-07-26 22:30:14 UTC",
    acao: "AUTH_LOGIN_SUCCESS",
    modulo: "RBAC Identidade",
    operador: "admin@esolenergy.com",
    ipOrigem: "177.138.42.10",
    hashSHA256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    severidade: "info",
    detalhes: "Sessão iniciada com sucesso via MFA AAL2.",
  },
  {
    id: "log-2",
    timestamp: "2026-07-26 22:15:02 UTC",
    acao: "LEDGER_TRANSACTION_SIGN",
    modulo: "Ledger Contábil",
    operador: "sistema.ledger",
    ipOrigem: "10.0.4.12 (Internal)",
    hashSHA256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    severidade: "info",
    detalhes: "Escrituração de partida dobrada gravada no cofre SHA-256.",
  },
  {
    id: "log-3",
    timestamp: "2026-07-26 21:44:20 UTC",
    acao: "RBAC_ROLE_CHANGE_ATTEMPT",
    modulo: "Identidade & Permissões",
    operador: "consultor_id_942",
    ipOrigem: "189.40.12.9",
    hashSHA256: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    severidade: "critical",
    detalhes: "Tentativa não autorizada de alteração de privilégios bloqueada pelo RLS.",
  },
  {
    id: "log-4",
    timestamp: "2026-07-26 20:10:55 UTC",
    acao: "ENOTAS_NFE_EMISSION",
    modulo: "Motor Fiscal eNotas",
    operador: "sistema.rpa",
    ipOrigem: "10.0.2.88 (Internal)",
    hashSHA256: "7d0d0879685e13307da8547432f83196c342f10b77e8a9463e26fb4c4d51cb32",
    severidade: "warning",
    detalhes: "Emissão de NFS-e #4092 autorizada pela SEFAZ SP.",
  },
];

export function AdminAuditLogFeed() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<"all" | "info" | "warning" | "critical">("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hashSHA256.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "all" || log.severidade === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severidade: AuditLogEntry["severidade"]) => {
    switch (severidade) {
      case "info":
        return <Badge variant="cyan" className="text-[10px]">INFO</Badge>;
      case "warning":
        return <Badge variant="sun" className="text-[10px]">WARNING</Badge>;
      case "critical":
        return <Badge variant="rose" className="text-[10px]">CRITICAL</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Terminal className="h-5 w-5 text-amber-500" />
            <span>Feed de Auditoria & Eventos de Segurança SHA-256</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Logs Criptográficos Imutáveis da Tabela <code className="font-mono text-amber-500">security_audit_vault</code>
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            Hash Check Status: OK
          </Badge>

          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Atualizar</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filtrar por ação, operador, IP ou hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto scrollbar-none">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
            {(["all", "info", "warning", "critical"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap",
                  severityFilter === sev
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm glow-amber"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Items */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Nenhum registro de auditoria corresponde aos filtros aplicados.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-card/90 transition-all duration-200 space-y-3 dark:bg-slate-900/60 dark:border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(log.severidade)}
                    <span className="font-mono font-bold text-xs text-foreground tracking-wide">
                      {log.acao}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-accent/60 px-2 py-0.5 rounded-md">
                      {log.modulo}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">{log.timestamp}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{log.detalhes}</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-mono">
                  <div className="flex items-center gap-3">
                    <span>Op: <strong className="text-foreground">{log.operador}</strong></span>
                    <span>IP: <strong className="text-foreground">{log.ipOrigem}</strong></span>
                  </div>

                  {/* Hash SHA-256 Box */}
                  <div className="flex items-center gap-1.5 bg-accent/40 px-2.5 py-1 rounded-lg border border-border/40 text-[10px]">
                    <FileCode className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[240px] text-muted-foreground">
                      {log.hashSHA256}
                    </span>
                    <button
                      onClick={() => handleCopyHash(log.hashSHA256, log.id)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Copiar Hash SHA-256"
                    >
                      {copiedId === log.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

Let's write `src/components/admin/AdminAuditLogFeed.tsx`.HINSTANCE    call:default_api:write_to_file{CodeContent:
