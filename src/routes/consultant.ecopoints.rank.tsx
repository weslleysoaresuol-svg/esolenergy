import { createFileRoute } from "@tanstack/react-router";
import { ConsultantEcoPointsRank } from "@/pages/consultant/ConsultantEcoPointsRank";

export const Route = createFileRoute("/consultant/ecopoints/rank")({
  head: () => ({ meta: [{ title: "Ranking EcoPoints — ESOL Energy" }] }),
  component: ConsultantEcoPointsRank,
});
