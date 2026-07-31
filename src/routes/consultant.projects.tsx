import { createFileRoute } from "@tanstack/react-router";
import { ConsultantProjectKanban } from "@/pages/consultant/ConsultantProjectKanban";

export const Route = createFileRoute("/consultant/projects")({
  head: () => ({ meta: [{ title: "Kanban de Projetos — ESOL Energy" }] }),
  component: ConsultantProjectKanban,
});
