import { createFileRoute } from "@tanstack/react-router";
import { CorporateExpansionHub } from "@/components/admin/CorporateExpansionHub";

function AdminExpansionRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expansão Global & Estrutura Multimoeda</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Internacionalização de operações, conversão cambial e matriz corporativa global.</p>
      </div>
      <CorporateExpansionHub />
    </div>
  );
}

export const Route = createFileRoute("/admin/expansion")({
  head: () => ({ meta: [{ title: "Expansão Global — ESOL Energy" }] }),
  component: AdminExpansionRouteComponent,
});
