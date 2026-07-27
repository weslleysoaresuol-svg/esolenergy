import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FolderLock,
  Download,
  Eye,
  Search,
  ShieldCheck,
  BookOpen,
  Scale,
  Award,
  X,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface GovernanceDocument {
  id: string;
  titulo: string;
  categoria: "sop" | "contratos" | "aneel" | "soc2";
  tamanho: string;
  versao: string;
  atualizadoEm: string;
  descricao: string;
  tags: string[];
}

const MOCK_DOCUMENTS: GovernanceDocument[] = [
  {
    id: "doc-1",
    titulo: "SOP-01: Manual de Engenharia & Comissionamento EPC",
    categoria: "sop",
    tamanho: "4.2 MB",
    versao: "v3.1/2026",
    atualizadoEm: "12/06/2026",
    descricao: "Procedimentos operacionais padrão para montagem de usinas fotovoltaicas e comissionamento.",
    tags: ["Engenharia", "SOP", "Tier-1"],
  },
  {
    id: "doc-2",
    titulo: "Contrato Modelo de Prestação de Serviços MMN",
    categoria: "contratos",
    tamanho: "1.8 MB",
    versao: "v2.0/2026",
    atualizadoEm: "01/07/2026",
    descricao: "Minuta contratual padronizada com regras de repasse Unilevel e cláusulas de arbitragem.",
    tags: ["Jurídico", "MMN", "e-CPF"],
  },
  {
    id: "doc-3",
    titulo: "Compêndio Regulatório ANEEL REN 1.000/2021 & Lei 14.300",
    categoria: "aneel",
    tamanho: "8.5 MB",
    versao: "v1.4/2026",
    atualizadoEm: "15/05/2026",
    descricao: "Compilado de regras sobre o Fio B progressivo e direitos de parecer de acesso GD.",
    tags: ["ANEEL", "Fio B", "Regulatório"],
  },
  {
    id: "doc-4",
    titulo: "Relatório de Auditoria SOC 2 Type II & Ledger SHA-256",
    categoria: "soc2",
    tamanho: "3.1 MB",
    versao: "v2026.1",
    atualizadoEm: "20/07/2026",
    descricao: "Certificado de segurança cibernética, integridade contábil e auditoria criptográfica.",
    tags: ["Segurança", "SOC 2", "Ledger"],
  },
];

export function DataRoomGovernance() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<"all" | "sop" | "contratos" | "aneel" | "soc2">("all");
  const [selectedDoc, setSelectedDoc] = React.useState<GovernanceDocument | null>(null);

  const filteredDocs = MOCK_DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeCategory === "all" || doc.categoria === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Data Room de Governança V2 & Acervo Legal</span>
              <Badge variant="emerald" className="text-[10px]">
                REPOSITÓRIO AUDITADO
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Manuais SOP, normativas ANEEL, minutas contratuais e relatórios SOC 2.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="sun" className="gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              CONFORMIDADE LGPD & CVM
            </Badge>
          </div>
        </div>

        {/* Category Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-background/80 rounded-xl border border-border/60 text-xs font-semibold overflow-x-auto w-full sm:w-auto scrollbar-none">
            {(["all", "sop", "contratos", "aneel", "soc2"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm glow-amber"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {cat === "all" ? "Todos os Documentos" : cat === "sop" ? "Manuais SOP" : cat === "contratos" ? "Contratos Modelo" : cat === "aneel" ? "Regulatório ANEEL" : "Auditoria SOC 2"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar documento ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/50 focus-visible:ring-amber-400"
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border border-border/80 bg-card/85 shadow-lg backdrop-blur-xl hover:border-amber-400/50 transition-all duration-300 dark:bg-slate-950/90 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="truncate">{doc.titulo}</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                        {doc.descricao}
                      </CardDescription>
                    </div>

                    <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                      {doc.versao}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-accent/60 text-[10px] text-muted-foreground font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {doc.tamanho} • Atualizado {doc.atualizadoEm}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDoc(doc)}
                        className="h-8 text-xs gap-1.5 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5 text-amber-500" />
                        <span>Visualizar PDF</span>
                      </Button>

                      <Button
                        variant="sun"
                        size="sm"
                        className="h-8 text-xs font-bold text-slate-950 gap-1.5 rounded-xl shadow-sm glow-amber"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* PDF Modal Viewer */}
        <AnimatePresence>
          {selectedDoc && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDoc(null)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-10 z-50 bg-card rounded-2xl border border-border/80 shadow-2xl backdrop-blur-2xl flex flex-col dark:bg-slate-950/95 dark:border-slate-800"
              >
                <div className="p-4 border-b border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{selectedDoc.titulo}</h3>
                      <p className="text-[10px] text-muted-foreground">Visualizador Legal Esol Energy Data Room</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDoc(null)}
                    className="h-8 w-8 rounded-lg hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/40">
                  <div className="max-w-3xl mx-auto p-8 bg-card rounded-xl border border-border/60 shadow-lg space-y-4 font-serif text-sm leading-relaxed dark:bg-slate-900">
                    <div className="text-center space-y-1 border-b border-border/40 pb-4">
                      <h2 className="font-bold text-lg font-sans text-foreground">{selectedDoc.titulo}</h2>
                      <p className="text-xs font-mono text-muted-foreground">{selectedDoc.versao} — Data Room de Governança</p>
                    </div>

                    <p className="text-muted-foreground">
                      ESTE DOCUMENTO É DE PROPRIEDADE DA ESOL ENERGY & TECNOLOGIA S/A. O ACESSO É RESTRITO A USUÁRIOS AUTORIZADOS VIA RBAC 7 NÍVEIS.
                    </p>

                    <div className="p-4 rounded-xl bg-accent/40 border border-border/40 font-mono text-xs text-foreground space-y-2">
                      <p>● Status do Documento: <strong>HOMOLOGADO E AUDITADO</strong></p>
                      <p>● Hash SHA-256 do Arquivo: <strong>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934c</strong></p>
                      <p>● Assinatura ICP-Brasil: <strong>CARIMBO DE TEMPO ATIVO</strong></p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">{selectedDoc.tamanho}</span>
                  <Button variant="sun" size="sm" className="gap-2 rounded-xl text-slate-950 font-bold">
                    <Download className="h-3.5 w-3.5" />
                    <span>Baixar PDF Assinado</span>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
```

Let's write `src/pages/admin/DataRoomGovernance.tsx`.    call:default_api:write_to_file{CodeContent:
