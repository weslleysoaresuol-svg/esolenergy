import * as React from "react";
import { motion } from "framer-motion";
import {
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Search,
  RefreshCw,
  ArrowRightLeft,
  Lock,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface LedgerEntry {
  id: string;
  timestamp: string;
  contaDebito: string;
  contaCredito: string;
  valor: number;
  hashSha256: string;
  hashAnterior: string;
  status: "integro" | "auditado" | "pendente";
}

const MOCK_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "tx-7001",
    timestamp: "26/07/2026 23:45:10 NTP",
    contaDebito: "1.1.01 — Caixa/Bancos BaaS",
    contaCredito: "4.1.01 — Receita Vendas EPC Solar",
    valor: 45000.0,
    hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    hashAnterior: "8f4b1029c78201a941e3d09214b78912e091428b812049182390192841920391",
    status: "integro",
  },
  {
    id: "tx-7002",
    timestamp: "26/07/2026 23:48:22 NTP",
    contaDebito: "2.1.03 — Provisão Comissões MMN Unilevel",
    contaCredito: "1.1.01 — Caixa/Bancos BaaS",
    valor: 3600.0,
    hashSha256: "5d41402abc4b2a76b9719d911017c592b2d6a540508b082199b519e917d291ef",
    hashAnterior: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "integro",
  },
  {
    id: "tx-7003",
    timestamp: "26/07/2026 23:50:05 NTP",
    contaDebito: "1.1.01 — Caixa/Bancos BaaS",
    contaCredito: "2.1.05 — Impostos Retidos eNotas (IRRF)",
    valor: 495.0,
    hashSha256: "7d793037a0760186574b0282f2f435e7b1e7377489a79e49129d291e02910294",
    hashAnterior: "5d41402abc4b2a76b9719d911017c592b2d6a540508b082199b519e917d291ef",
    status: "auditado",
  },
];

export function LedgerConciliation() {
  const [entries, setEntries] = React.useState<LedgerEntry[]>(MOCK_LEDGER_ENTRIES);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.contaDebito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.contaCredito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hashSha256.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-500" />
            <span>Conciliação Contábil Ledger & SHA-256 Chain</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Escrituração contábil de partida dobrada com cadeia de blocos imutável
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <ShieldCheck className="h-3 w-3" />
          CADEIA SHA-256 ÍNTEGRA
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por ID, conta de débito/crédito ou hash SHA-256..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Ledger Entries List */}
        <div className="space-y-3">
          {filteredEntries.map((item) => (
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
                  <Badge variant="emerald" className="text-[10px]">
                    🟢 SHA-256 OK
                  </Badge>
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">{item.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-accent/20 p-2.5 rounded-lg">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Débito:</span>
                  <strong className="text-foreground">{item.contaDebito}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Crédito:</span>
                  <strong className="text-foreground">{item.contaCredito}</strong>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 font-mono text-[11px] truncate max-w-md">
                  <p className="text-muted-foreground truncate">
                    Hash Bloco: <strong className="text-amber-400">{item.hashSha256.substring(0, 24)}...</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <strong className="text-emerald-500 font-extrabold text-sm font-mono">
                    {formatCurrency(item.valor)}
                  </strong>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyHash(item.hashSha256)}
                    className="h-8 text-xs gap-1 rounded-lg"
                  >
                    <Copy className="h-3.5 w-3.5 text-amber-500" />
                    <span>{copiedHash === item.hashSha256 ? "Copiado!" : "Copiar Hash"}</span>
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
