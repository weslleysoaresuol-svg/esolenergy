import { createFileRoute } from "@tanstack/react-router";
import { ConsultantPixMfaModal } from "@/pages/consultant/ConsultantPixMfaModal";

export const Route = createFileRoute("/consultant/wallet/mfa")({
  head: () => ({ meta: [{ title: "MFA PIX — ESOL Energy" }] }),
  component: ConsultantPixMfaModal,
});
