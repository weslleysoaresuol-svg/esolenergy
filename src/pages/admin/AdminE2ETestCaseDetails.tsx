import * as React from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Code,
  Download,
  Terminal,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Sun,
  Eye,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface TestCaseDetail {
  id: string;
  code: string;
  name: string;
  category: string;
  assertionType: "DOM Element" | "API Response" | "Legal Vault" | "JWT Payload";
  target: string;
  latencyMs: number;
  status: "passed" | "failed";
}

const MOCK_TEST_CASES: TestCaseDetail[] = [
  {
    id: "tc-101",
    code: "TC-01",
    name: "Onboarding Mobile PWA & Captura de PIN",
    category: "Cadastro / Onboarding",
    assertionType: "DOM Element",
    target: "button[type='submit'] - Visible & Clickable",
    latencyMs: 240,
    status: "passed",
  },
  {
    id: "tc-102",
    code: "TC-02",
    name: "Envio de SMS OTP & Validação MFA",
    category: "Autenticação 2FA",
    assertionType: "API Response",
    target: "POST /api/v1/auth/verify -> Status 200 OK",
    latencyMs: 180,
    status: "passed",
  },
  {
    id: "tc-103",
    code: "TC-03",
    name: "Aceite Contratual & Esol Sign SHA-256",
    category: "Legal & Contratos",
    assertionType: "Legal Vault",
    target: "SHA-256 Hash Evidência Gerado",
    latencyMs: 310,
    status: "passed",
  },
  {
    id: "tc-104",
    code: "TC-04",
    name: "Roteamento de Guarda RBAC & Supabase Auth",
    category: "Segurança / RBAC",
    assertionType: "JWT Payload",
    target: "role = 'consultant' & tenant_id Validated",
    latencyMs: 150,
    status: "passed",
  },
];

export function AdminE2ETestCaseDetails() {
  const [selectedTc, setSelectedTc] = React.useState<TestCaseDetail>(MOCK_TEST_CASES[0]);
  const [isExporting, setIsExporting] = React.useState(false);
  const testCases = MOCK_TEST_CASES;

  const handleExportReport = (format: "junit" | "html") => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Solar Ambient Glow Filter */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Terminal className="h-6 w-6" />
            <span className="font-extrabold text-sm tracking-wider uppercase font-mono">E2E TEST INSPECTOR</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Inspeção Detalhada de Testes</h1>
          <p className="text-xs text-slate-400">Análise de Asserções DOM, APIs & Relatórios Oficiais</p>
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test Cases Stream List */}
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-bold text-xs text-white font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Casos de Teste (4/4 Passed)</span>
                <Badge variant="emerald" className="text-[8px]">100% OK</Badge>
              </h2>

              <div className="space-y-2">
                {testCases.map((tc) => {
                  const isSelected = selectedTc.id === tc.id;
                  return (
                    <div
                      key={tc.id}
                      onClick={() => setSelectedTc(tc)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer space-y-1",
                        isSelected
                          ? "border-amber-400 bg-slate-950 shadow-md glow-amber"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{tc.code}</span>
                        <span className="text-[9px] font-mono text-slate-400">{tc.latencyMs}ms</span>
                      </div>
                      <h3 className="font-bold text-xs text-white leading-tight">{tc.name}</h3>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Test Case Inspector Card */}
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1 border-b border-slate-800 pb-2">
                <Badge variant="sun" className="text-[8px]">INSPEÇÃO INDIVIDUAL</Badge>
                <h3 className="font-black text-sm text-white">{selectedTc.code}: {selectedTc.name}</h3>
                <span className="text-[10px] font-mono text-slate-400 block">{selectedTc.category}</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase block">Tipo de Asserção</span>
                  <strong className="text-amber-400">{selectedTc.assertionType}</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase block">Target / Asserção Esperada</span>
                  <strong className="text-emerald-400 text-[10px] block leading-tight">{selectedTc.target}</strong>
                </div>
              </div>

              {/* Report Exporters Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExporting}
                  onClick={() => handleExportReport("junit")}
                  className="w-full h-9 text-[11px] font-bold border-slate-800 text-slate-300 rounded-xl gap-2 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>Baixar Relatório JUnit XML</span>
                </Button>

                <Button
                  variant="sun"
                  size="sm"
                  className="w-full h-10 text-xs font-bold text-slate-950 rounded-xl shadow-lg glow-amber gap-2 cursor-pointer"
                >
                  <span>Avançar para Testes E2E Vendas EPC & Split</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
