import { createFileRoute } from "@tanstack/react-router";
import { DREFinanceiroPage } from "@/pages/admin/DREFinanceiroPage";

export const Route = createFileRoute("/admin/dre")({
  head: () => ({ meta: [{ title: "DRE Financeiro — ESOL Energy" }] }),
  component: DREFinanceiroPage,
});
