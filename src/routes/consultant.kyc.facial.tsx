import { createFileRoute } from "@tanstack/react-router";
import { ConsultantFacialLivenessKYC } from "@/pages/consultant/ConsultantFacialLivenessKYC";

export const Route = createFileRoute("/consultant/kyc/facial")({
  head: () => ({ meta: [{ title: "Biometria Facial — ESOL Energy" }] }),
  component: ConsultantFacialLivenessKYC,
});
