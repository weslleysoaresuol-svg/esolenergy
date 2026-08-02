import { createFileRoute } from "@tanstack/react-router";
import { SolarEPCProjectsPage } from "@/pages/admin/SolarEPCProjectsPage";
import { SolarHardwarePricingSemaphore } from "@/components/admin/SolarHardwarePricingSemaphore";

function AdminSolarEpcRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <SolarEPCProjectsPage />
      <SolarHardwarePricingSemaphore />
    </div>
  );
}

export const Route = createFileRoute("/admin/solar-epc")({
  head: () => ({ meta: [{ title: "Engenharia EPC & Logística — ESOL Energy" }] }),
  component: AdminSolarEpcRouteComponent,
});
