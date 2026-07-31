import { createFileRoute } from "@tanstack/react-router";
import { ConsultantEcoPointsBalance } from "@/pages/consultant/ConsultantEcoPointsBalance";

export const Route = createFileRoute("/consultant/ecopoints")({
  head: () => ({ meta: [{ title: "EcoPoints — ESOL Energy" }] }),
  component: ConsultantEcoPointsBalance,
});
