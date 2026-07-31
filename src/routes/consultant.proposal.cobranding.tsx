import { createFileRoute } from "@tanstack/react-router";
import { ConsultantProposalCoBrandingEditor } from "@/pages/consultant/ConsultantProposalCoBrandingEditor";

export const Route = createFileRoute("/consultant/proposal/cobranding")({
  head: () => ({ meta: [{ title: "Co-Branding Editor — ESOL Energy" }] }),
  component: ConsultantProposalCoBrandingEditor,
});
