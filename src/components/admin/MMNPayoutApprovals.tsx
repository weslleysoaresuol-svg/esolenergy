import * as React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Send,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileText,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface PayoutRequest {
  id: string;
  consultor: string;
  graduacao: string;
  chavePix: string;
  tipoChave: "CPF" | "CNPJ" | "E-mail" | "Chave Aleatória";
  valorBruto: number;
  impostosRetidos: number; // IRRF/INSS
  valorLiquido: number;
  solicitadoEm: string;
  status: "pendente" | "processando_baas" | "pago_pix" | "bloqueado_auditoria";
}

const MOCK_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: "pix-8801",
    consultor: "Ana Beatriz Rocha",
    graduacao: "Diretor Diamante",
    chavePix: "123.456.789-00",
    tipoChave: "CPF",
    valorBruto: 4850.0,
    impostosRetidos: 533.5,
    valorLiquido: 4316.5,
    solicitadoEm: "Há 12 minutos",
    status: "pendente",
  },
  {
    id: "pix-8802",
    consultor: "Felipe Mendonça",
    graduacao: "Gerente Ouro",
    chavePix: "felipe.mendonca@gmail.com",
    tipoChave: "E-mail",
    valorBruto: 2100.0,
    impostosRetidos: 231.0,
    valorLiquido: 1869.0,
    solicitadoEm: "Há 35 minutos",
    status: "pendente",
  },
  {
    id: "pix-8803",
    consultor: "Roberto Fonseca",
    graduacao: "Gerente Ouro",
    chavePix: "44.120.940/0001-92",
    tipoChave: "CNPJ",
    valorBruto: 7200.0,
    impostosRetidos: 0.0, // MEI / PJ sem retenção de IRRF pessoa física
    valorLiquido: 7200.0,
    solicitadoEm: "Há 1 hora",
    status: "pago_pix",
  },
  {
    id: "pix-8804",
    consultor: "Lucas Ribeiro",
    graduacao: "Consultor Bronze",
    chavePix: "a8f9-42b1-89c0-e41b",
    tipoChave: "Chave Aleatória",
    valorBruto: 15400.0,
    impostosRetidos: 1694.0,
    valorLiquido: 13706.0,
    solicitadoEm: "Há 2 horas",
    status: "bloqueado_auditoria",
  },
];

export function MMNPayoutApprovals() {
  const [requests, setRequests] = React.useState<PayoutRequest[]>(MOCK_PAYOUT_REQUESTS);
  const [searchTerm, setSearchTerm] = React.useState("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "pago_pix" } : r))
    );
  };

  const handleBlock = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "bloqueado_auditoria" } : r))
    );
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.consultor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.chavePix.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: PayoutRequest["status"]) => {
    switch (status) {
      case "pago_pix":
        return <Badge variant="emerald" className="text-[10px]">🟢 PIX ENVIADO BAAS</Badge>;
      case "pendente":
        return <Badge variant="sun" className="text-[10px]">🟡 PENDENTE APROVAÇÃO</Badge>;
      case "processando_baas":
        return <Badge variant="cyan" className="text-[10px]">🔵 PROCESSANDO BANCO BAAS</Badge>;
      case "bloqueado_auditoria":
        return <Badge variant="rose" className="text-[10px]">🔴 BLOQUEADO AUDITORIA FISCAL</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-xl backdrop-blur-xl dark:bg-slate-950/90 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <span>Cockpit de Aprovação de Saques PIX & Repasses MMN</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Liberação financeira de comissões Unilevel via gateway BaaS com cálculo de impostos
          </CardDescription>
        </div>

        <Badge variant="emerald" className="gap-1 text-[10px]">
          <ShieldCheck className="h-3 w-3" />
          PIX BAAS API ATIVO
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por consultor, chave PIX ou ID do saque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
          />
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.map((item) => (
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
                  {getStatusBadge(item.status)}
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">{item.solicitadoEm}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-mono">
                    Chave PIX ({item.tipoChave}): <strong className="text-foreground">{item.chavePix}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Valor Bruto: {formatCurrency(item.valorBruto)} | Deduções Impostos: ({formatCurrency(item.impostosRetidos)})
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Valor Líquido PIX</span>
                    <strong className="text-emerald-500 font-extrabold text-sm font-mono">
                      {formatCurrency(item.valorLiquido)}
                    </strong>
                  </div>

                  {item.status === "pendente" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlock(item.id)}
                        className="h-8 text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                      >
                        Bloquear
                      </Button>

                      <Button
                        variant="sun"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="h-8 text-xs font-bold text-slate-950 gap-1.5 shadow-sm glow-amber"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Aprovar PIX</span>
                      </Button>
                    </div>
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
