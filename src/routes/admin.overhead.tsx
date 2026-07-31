import { createFileRoute } from "@tanstack/react-router";
import { OverheadHealthDashboard } from "@/pages/admin/OverheadHealthDashboard";

export const Route = createFileRoute("/admin/overhead")({
  head: () => ({ meta: [{ title: "Overhead Health — ESOL Energy" }] }),
  component: OverheadHealthDashboard,
});
