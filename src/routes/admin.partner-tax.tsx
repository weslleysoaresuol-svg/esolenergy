import { createFileRoute } from "@tanstack/react-router";
import { PartnerTaxInvoicing } from "@/components/admin/PartnerTaxInvoicing";

function AdminPartnerTaxRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auto-Faturamento & RPA Consultor</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Emissão de RPA (Recibo de Pagamento a Autônomo) e validação de NF de Parceiro PJ.</p>
      </div>
      <PartnerTaxInvoicing />
    </div>
  );
}

export const Route = createFileRoute("/admin/partner-tax")({
  head: () => ({ meta: [{ title: "Auto-Faturamento & RPA Consultor — ESOL Energy" }] }),
  component: AdminPartnerTaxRouteComponent,
});
