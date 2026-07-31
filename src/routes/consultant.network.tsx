import { createFileRoute } from "@tanstack/react-router";
import { ConsultantNetworkTree } from "@/pages/consultant/ConsultantNetworkTree";

export const Route = createFileRoute("/consultant/network")({
  head: () => ({ meta: [{ title: "Minha Rede — ESOL Energy" }] }),
  component: ConsultantNetworkTree,
});
