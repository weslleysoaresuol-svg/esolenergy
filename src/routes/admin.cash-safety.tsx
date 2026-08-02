import { createFileRoute } from "@tanstack/react-router";
import { AdminCashFlowSafetyDashboard } from "@/components/admin/AdminCashFlowSafetyDashboard";
import { AdminMarginFloorMonitor } from "@/components/admin/AdminMarginFloorMonitor";

function AdminCashSafetyRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <AdminCashFlowSafetyDashboard />
      <AdminMarginFloorMonitor />
    </div>
  );
}

export const Route = createFileRoute("/admin/cash-safety")({
  head: () => ({ meta: [{ title: "Segurança Financeira & Caixa Real V14.0 — ESOL Energy" }] }),
  component: AdminCashSafetyRouteComponent,
});
