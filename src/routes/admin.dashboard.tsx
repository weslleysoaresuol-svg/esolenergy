import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverview } from "@/pages/admin/DashboardOverview";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Corporativo — ESOL Energy" }] }),
  component: DashboardOverview,
});
