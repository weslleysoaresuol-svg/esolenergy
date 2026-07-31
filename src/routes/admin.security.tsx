import { createFileRoute } from "@tanstack/react-router";
import { AdminSecurityAuditingPanel } from "@/pages/admin/AdminSecurityAuditingPanel";

export const Route = createFileRoute("/admin/security")({
  head: () => ({ meta: [{ title: "Auditoria de Segurança — ESOL Energy" }] }),
  component: AdminSecurityAuditingPanel,
});
