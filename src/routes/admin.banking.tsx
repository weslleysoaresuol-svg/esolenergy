import { createFileRoute } from "@tanstack/react-router";
import { BaaSBankingManagement } from "@/components/admin/BaaSBankingManagement";
import { MMNPayoutApprovals } from "@/components/admin/MMNPayoutApprovals";

function AdminBankingRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">BaaS Banking & Liquidação PIX</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Gestão de contas virtuais BaaS, webhooks de liquidação e aprovação de saques MMN.</p>
      </div>
      <BaaSBankingManagement />
      <MMNPayoutApprovals />
    </div>
  );
}

export const Route = createFileRoute("/admin/banking")({
  head: () => ({ meta: [{ title: "BaaS Banking & Liquidação PIX — ESOL Energy" }] }),
  component: AdminBankingRouteComponent,
});
