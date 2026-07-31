import { createFileRoute } from "@tanstack/react-router";
import { SolarEPCProjectsPage } from "@/pages/admin/SolarEPCProjectsPage";

export const Route = createFileRoute("/admin/solar-epc")({
  head: () => ({ meta: [{ title: "Projetos Solar EPC — ESOL Energy" }] }),
  component: SolarEPCProjectsPage,
});
