import { createFileRoute } from "@tanstack/react-router";
import { ConsultantTermsAcceptance } from "@/pages/consultant/ConsultantTermsAcceptance";

export const Route = createFileRoute("/consultant/terms")({
  head: () => ({ meta: [{ title: "Termos de Aceite — ESOL Energy" }] }),
  component: ConsultantTermsAcceptance,
});
