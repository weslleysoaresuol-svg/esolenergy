import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "@/pages/admin/AdminLogin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin — ESOL Energy" }] }),
  component: AdminLogin,
});
