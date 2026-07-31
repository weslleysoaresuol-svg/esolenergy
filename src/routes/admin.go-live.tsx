import { createFileRoute } from "@tanstack/react-router";
import { AdminGoLiveCertifier } from "@/pages/admin/AdminGoLiveCertifier";

export const Route = createFileRoute("/admin/go-live")({
  head: () => ({ meta: [{ title: "Go-Live Certifier — ESOL Energy" }] }),
  component: AdminGoLiveCertifier,
});
