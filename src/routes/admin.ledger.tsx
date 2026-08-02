import { createFileRoute } from "@tanstack/react-router";
import { LedgerConciliation } from "@/components/admin/LedgerConciliation";
import { AdminCashFlowSafetyDashboard } from "@/components/admin/AdminCashFlowSafetyDashboard";

function AdminLedgerRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Escrituração & Ledger Contábil SHA-256</h1>
        <p className="text-sm text-slate-5-00 dark:text-slate-400">Auditoria financeira inalterável de faturas pagas e reconciliação com o Razão Cash-Basis.</p>
      </div>
      <LedgerConciliation />
      <AdminCashFlowSafetyDashboard />
    </div>
  );
}

export const Route = createFileRoute("/admin/ledger")({
  head: () => ({ meta: [{ title: "Ledger Contábil SHA-256 — ESOL Energy" }] }),
  component: AdminLedgerRouteComponent,
});
