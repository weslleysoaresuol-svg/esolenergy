import { createFileRoute } from "@tanstack/react-router";
import { ConsultantOnboardingPage } from "@/pages/consultant/ConsultantOnboardingPage";

export const Route = createFileRoute("/consultant/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — ESOL Energy" }] }),
  component: ConsultantOnboardingPage,
});
