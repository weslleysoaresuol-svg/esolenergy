import { createFileRoute } from "@tanstack/react-router";
import { ConsultantDashboardHome } from "@/pages/consultant/ConsultantDashboardHome";

export const Route = createFileRoute("/consultant")({
  head: () => ({ meta: [{ title: "Painel Consultor — ESOL Energy" }] }),
  component: ConsultantDashboardHome,
});
