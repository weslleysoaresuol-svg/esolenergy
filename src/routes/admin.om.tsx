import { createFileRoute } from "@tanstack/react-router";
import { SolarInspectionManager } from "@/components/admin/SolarInspectionManager";
import { ANEELAccessStatusManager } from "@/components/admin/ANEELAccessStatusManager";

function AdminOmRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pós-Vendas & O&M Usinas Solar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Inspeções técnicas de vistoria, parecer de acesso ANEEL e monitoramento de geração.</p>
      </div>
      <SolarInspectionManager />
      <ANEELAccessStatusManager />
    </div>
  );
}

export const Route = createFileRoute("/admin/om")({
  head: () => ({ meta: [{ title: "Pós-Vendas & O&M Usinas — ESOL Energy" }] }),
  component: AdminOmRouteComponent,
});
