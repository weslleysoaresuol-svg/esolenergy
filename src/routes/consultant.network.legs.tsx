import { createFileRoute } from "@tanstack/react-router";
import { ConsultantNetworkLegFilter } from "@/pages/consultant/ConsultantNetworkLegFilter";

export const Route = createFileRoute("/consultant/network/legs")({
  head: () => ({ meta: [{ title: "Filtro de Pernas — ESOL Energy" }] }),
  component: ConsultantNetworkLegFilter,
});
