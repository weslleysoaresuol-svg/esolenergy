import { createFileRoute } from "@tanstack/react-router";
import { ConsultantAcademyVideoPlayer } from "@/pages/consultant/ConsultantAcademyVideoPlayer";

export const Route = createFileRoute("/consultant/academy/video")({
  head: () => ({ meta: [{ title: "Video Player — Esol Academy" }] }),
  component: ConsultantAcademyVideoPlayer,
});
