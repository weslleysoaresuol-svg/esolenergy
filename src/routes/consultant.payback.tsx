import { createFileRoute } from "@tanstack/react-router";
import { ConsultantPaybackEngine } from "@/pages/consultant/ConsultantPaybackEngine";

export const Route = createFileRoute("/consultant/payback")({
  head: () => ({ meta: [{ title: "Motor de Payback — ESOL Energy" }] }),
  component: ConsultantPaybackEngine,
});
