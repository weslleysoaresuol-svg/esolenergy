import { createFileRoute } from "@tanstack/react-router";
import { ConsultantCareerGoalWidget } from "@/pages/consultant/ConsultantCareerGoalWidget";

export const Route = createFileRoute("/consultant/career")({
  head: () => ({ meta: [{ title: "Plano de Carreira — ESOL Energy" }] }),
  component: ConsultantCareerGoalWidget,
});
