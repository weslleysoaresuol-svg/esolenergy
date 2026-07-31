import { createFileRoute } from "@tanstack/react-router";
import { ConsultantSolarSimulatorResult } from "@/pages/consultant/ConsultantSolarSimulatorResult";

export const Route = createFileRoute("/consultant/simulator/result")({
  head: () => ({ meta: [{ title: "Resultado Simulação — ESOL Energy" }] }),
  component: ConsultantSolarSimulatorResult,
});
