import { createFileRoute } from "@tanstack/react-router";
import { ConsultantAcademyCourses } from "@/pages/consultant/ConsultantAcademyCourses";

export const Route = createFileRoute("/consultant/academy")({
  head: () => ({ meta: [{ title: "Esol Academy — ESOL Energy" }] }),
  component: ConsultantAcademyCourses,
});
