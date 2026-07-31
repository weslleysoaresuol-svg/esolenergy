import { createFileRoute } from "@tanstack/react-router";
import { ConsultantDownlinesManager } from "@/pages/consultant/ConsultantDownlinesManager";

export const Route = createFileRoute("/consultant/downlines")({
  head: () => ({ meta: [{ title: "Gestão de Downlines — ESOL Energy" }] }),
  component: ConsultantDownlinesManager,
});
