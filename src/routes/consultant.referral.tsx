import { createFileRoute } from "@tanstack/react-router";
import { ConsultantReferralLinkModal } from "@/pages/consultant/ConsultantReferralLinkModal";

export const Route = createFileRoute("/consultant/referral")({
  head: () => ({ meta: [{ title: "Link de Indicação — ESOL Energy" }] }),
  component: ConsultantReferralLinkModal,
});
