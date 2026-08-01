import * as React from "react";
import { motion } from "framer-motion";
import {
  Gift,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Save,
  Plus,
  Info,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface BenefitCostItem {
  id: string;
  title: string;
  pointsRequired: number; // ex: 500 EP
  equivalentValueBr: number; // ex: R$ 50,00 (1 EP = R$ 0,10)
  realCostUnit: number; // ex: R$ 50,00 para combustível (Zero Margem) vs R$ 0,00 para Mentoria C-Level
  category: string;
}

const INITIAL_BENEFITS: BenefitCostItem[] = [
  {
    id: "ben-1",
    title: "Voucher R$ 50 Combustivel / Uber",
    pointsRequired: 500,
    equivalentValueBr: 50.0,
    realCostUnit: 50.0, // Cost 1:1 -> Zero Margem
    category: "Custo no Campo",
  },
  {
    id: "ben-2",
    title: "Voucher R$ 100 Tag Pedagio / Sem Parar",
    pointsRequired: 1000,
    equivalentValueBr: 100.0,
    realCostUnit: 100.0,
    category: "Custo no Campo",
  },
  {
    id: "ben-3",
    title: "Chip 5G Corporativo 10GB de Dados",
    pointsRequired: 1500,
    equivalentValueBr: 150.0,
    realCostUnit: 35.0, // Margem Positiva
    category: "Custo no Campo",
  },
  {
    id: "ben-4",
    title: "Kit Marca Esol (Polo, Bone, Squeeze, Cracha)",
    pointsRequired: 1000,
    equivalentValueBr: 100.0,
    realCostUnit: 42.0,
    category: "Kit Marca",
  },
  {
    id: "ben-5",
    title: "Planner & Agenda Solar Executivo 2026",
    pointsRequired: 1200,
    equivalentValueBr: 120.0,
    realCostUnit: 28.0,
    category: "Kit Marca",
  },
  {
    id: "ben-6",
    title: "Mochila Impermeavel Executiva Esol",
    pointsRequired: 2000,
    equivalentValueBr: 200.0,
    realCostUnit: 85.0,
    category: "Kit Marca",
  },
  {
    id: "ben-7",
    title: "Cupom R$ 250 Esol Hardware Store",
    pointsRequired: 2500,
    equivalentValueBr: 250.0,
    realCostUnit: 190.0,
    category: "Alavancagem",
  },
  {
    id: "ben-8",
    title: "Destaque Consultor Recomendado da Regiao",
    pointsRequired: 3000,
    equivalentValueBr: 300.0,
    realCostUnit: 0.0, // Custo Zero!
    category: "Alavancagem",
  },
  {
    id: "ben-9",
    title: "500 Cartoes de Visita NFC com QR Code",
    pointsRequired: 3500,
    equivalentValueBr: 350.0,
    realCostUnit: 110.0,
    category: "Alavancagem",
  },
  {
    id: "ben-10",
    title: "Curso Avancado Vendas B2B de Usinas",
    pointsRequired: 1500,
    equivalentValueBr: 150.0,
    realCostUnit: 0.0, // Custo Zero (Esol Academy)
    category: "Capacitacao VIP",
  },
  {
    id: "ben-11",
    title: "Mentoria 1-on-1 de 45 min com Diretor C-Level",
    pointsRequired: 8000,
    equivalentValueBr: 800.0,
    realCostUnit: 0.0, // Custo Zero (Interno)
    category: "Capacitacao VIP",
  },
  {
    id: "ben-12",
    title: "Ingresso VIP Convencao Nacional Esol Energy",
    pointsRequired: 10000,
    equivalentValueBr: 1000.0,
    realCostUnit: 350.0,
    category: "Capacitacao VIP",
  },
];

export function AdminEcoPointsCostManager() {
  const [benefits, setBenefits] = React.useState<BenefitCostItem[]>(INITIAL_BENEFITS);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [tempCost, setTempCost] = React.useState<number>(0);

  const handleStartEdit = (item: BenefitCostItem) => {
    setEditingId(item.id);
    setTempCost(item.realCostUnit);
  };

  const handleSaveEdit = (id: string) => {
    setBenefits((prev) =>
      prev.map((b) => (b.id === id ? { ...b, realCostUnit: tempCost } : b))
    );
    setEditingId(null);
  };

  return (
    <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden font-sans">
      <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-mono font-bold">
              <Gift className="h-3.5 w-3.5" />
              <span>GESTAO DE CUSTO REAL ECOPOINTS V12.0</span>
            </div>
            <CardTitle className="text-lg font-black text-white tracking-tight">
              Tabela de Custo Real dos 12 Benefícios EcoPoints
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Controle contábil para evitar passivo desproporcional no resgate de prêmios
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-3">Benefício</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Custo EP</th>
                <th className="py-3 px-3 text-right">Valor EP (R$)</th>
                <th className="py-3 px-3 text-right">Custo Real (R$)</th>
                <th className="py-3 px-3 text-center">Status Margem</th>
                <th className="py-3 px-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {benefits.map((item) => {
                const isLoss = item.realCostUnit > item.equivalentValueBr;
                const isZeroMargin = item.realCostUnit === item.equivalentValueBr;
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{item.title}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{item.category}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                      {item.pointsRequired.toLocaleString()} EP
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      R$ {item.equivalentValueBr.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={tempCost}
                          onChange={(e) => setTempCost(parseFloat(e.target.value) || 0)}
                          className="w-24 h-7 text-xs font-mono text-right bg-slate-950 border-amber-400 text-amber-400 rounded-lg inline-block"
                        />
                      ) : (
                        <strong className="text-white">R$ {item.realCostUnit.toFixed(2)}</strong>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {isLoss ? (
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] gap-1">
                          <AlertTriangle className="h-3 w-3" /> Prejuízo
                        </Badge>
                      ) : isZeroMargin ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
                          Margem Zero 1:1
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                          Lucrativo
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-2 rounded-lg cursor-pointer"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(item)}
                          className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800 px-2 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
