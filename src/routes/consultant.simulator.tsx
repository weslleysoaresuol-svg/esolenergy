import { createFileRoute } from "@tanstack/react-router";
import { ConsultantSolarSimulatorInput } from "@/pages/consultant/ConsultantSolarSimulatorInput";

export const Route = createFileRoute("/consultant/simulator")({
  head: () => ({ meta: [{ title: "Simulador Solar — ESOL Energy" }] }),
  component: ConsultantSolarSimulatorInput,
});
