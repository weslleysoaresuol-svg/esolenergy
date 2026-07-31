import { createFileRoute } from "@tanstack/react-router";
import { ConsultantSolarVsFreeMarket } from "@/pages/consultant/ConsultantSolarVsFreeMarket";

export const Route = createFileRoute("/consultant/solar-vs-ml")({
  head: () => ({ meta: [{ title: "Solar vs Mercado Livre — ESOL Energy" }] }),
  component: ConsultantSolarVsFreeMarket,
});
