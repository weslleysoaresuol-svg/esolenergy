import { createFileRoute } from "@tanstack/react-router";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { AdminAuditLogFeed } from "@/components/admin/AdminAuditLogFeed";

function AdminCrmRouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM & Leads Routing Inteligente</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Distribuição automatizada de leads por geolocalização e histórico de interações.</p>
      </div>
      <AdminNotificationCenter />
      <AdminAuditLogFeed />
    </div>
  );
}

export const Route = createFileRoute("/admin/crm")({
  head: () => ({ meta: [{ title: "CRM & Leads Routing — ESOL Energy" }] }),
  component: AdminCrmRouteComponent,
});
