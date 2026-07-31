import { createFileRoute } from "@tanstack/react-router";
import { ConsultantAcademyQuizModal } from "@/pages/consultant/ConsultantAcademyQuizModal";

export const Route = createFileRoute("/consultant/academy/quiz")({
  head: () => ({ meta: [{ title: "Quiz — Esol Academy" }] }),
  component: ConsultantAcademyQuizModal,
});
