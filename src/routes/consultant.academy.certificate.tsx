import { createFileRoute } from "@tanstack/react-router";
import { ConsultantAcademyCertificateModal } from "@/pages/consultant/ConsultantAcademyCertificateModal";

export const Route = createFileRoute("/consultant/academy/certificate")({
  head: () => ({ meta: [{ title: "Certificado — Esol Academy" }] }),
  component: ConsultantAcademyCertificateModal,
});
