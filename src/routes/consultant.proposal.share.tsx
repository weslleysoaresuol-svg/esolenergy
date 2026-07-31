import { createFileRoute } from "@tanstack/react-router";
import { ConsultantProposalShareModal } from "@/pages/consultant/ConsultantProposalShareModal";

export const Route = createFileRoute("/consultant/proposal/share")({
  head: () => ({ meta: [{ title: "Compartilhar Proposta — ESOL Energy" }] }),
  component: ConsultantProposalShareModal,
});
