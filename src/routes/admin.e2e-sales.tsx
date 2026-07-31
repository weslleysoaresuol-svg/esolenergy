import { createFileRoute } from "@tanstack/react-router";
import { AdminE2ESalesCommissionRunner } from "@/pages/admin/AdminE2ESalesCommissionRunner";

export const Route = createFileRoute("/admin/e2e-sales")({
  head: () => ({ meta: [{ title: "E2E Sales Commission — ESOL Energy" }] }),
  component: AdminE2ESalesCommissionRunner,
});
