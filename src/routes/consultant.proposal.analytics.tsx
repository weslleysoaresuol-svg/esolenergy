import { createFileRoute } from "@tanstack/react-router";
import { ConsultantProposalAnalytics } from "@/pages/consultant/ConsultantProposalAnalytics";

export const Route = createFileRoute("/consultant/proposal/analytics")({
  head: () => ({ meta: [{ title: "Analytics de Proposta — ESOL Energy" }] }),
  component: ConsultantProposalAnalytics,
});
