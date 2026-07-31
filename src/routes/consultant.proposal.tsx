import { createFileRoute } from "@tanstack/react-router";
import { ConsultantProposalVisualBuilder } from "@/pages/consultant/ConsultantProposalVisualBuilder";

export const Route = createFileRoute("/consultant/proposal")({
  head: () => ({ meta: [{ title: "Construtor de Proposta — ESOL Energy" }] }),
  component: ConsultantProposalVisualBuilder,
});
