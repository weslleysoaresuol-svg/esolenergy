import { createFileRoute } from "@tanstack/react-router";
import { FiscalAuditPanel } from "@/components/admin/FiscalAuditPanel";

function AdminFiscalRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auditoria Fiscal & eNotas API</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Emissão automatizada de NF-e/NFS-e, compliance tributário e conciliação de impostos.</p>
      </div>
      <FiscalAuditPanel />
    </div>
  );
}

export const Route = createFileRoute("/admin/fiscal")({
  head: () => ({ meta: [{ title: "Auditoria Fiscal & eNotas API — ESOL Energy" }] }),
  component: AdminFiscalRouteComponent,
});
