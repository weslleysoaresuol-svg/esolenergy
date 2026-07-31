import { createFileRoute } from "@tanstack/react-router";
import { AdminWafLogsPanel } from "@/pages/admin/AdminWafLogsPanel";

export const Route = createFileRoute("/admin/waf")({
  head: () => ({ meta: [{ title: "WAF & Logs de Rede — ESOL Energy" }] }),
  component: AdminWafLogsPanel,
});
