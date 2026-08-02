import { createFileRoute } from "@tanstack/react-router";
import { GovernanceTrustCenter } from "@/components/admin/GovernanceTrustCenter";
import { AdminEcoPointsCostManager } from "@/components/admin/AdminEcoPointsCostManager";

function AdminFeatureFlagsRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Control Center & Feature Flags</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ativação granular de módulos, precificação de EcoPoints e governança do sistema.</p>
      </div>
      <GovernanceTrustCenter />
      <AdminEcoPointsCostManager />
    </div>
  );
}

export const Route = createFileRoute("/admin/feature-flags")({
  head: () => ({ meta: [{ title: "Control Center & Feature Flags — ESOL Energy" }] }),
  component: AdminFeatureFlagsRouteComponent,
});
