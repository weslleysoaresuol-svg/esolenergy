import { createFileRoute } from "@tanstack/react-router";
import { ConsultantStatementExportModal } from "@/pages/consultant/ConsultantStatementExportModal";

export const Route = createFileRoute("/consultant/wallet/statement")({
  head: () => ({ meta: [{ title: "Extrato Financeiro — ESOL Energy" }] }),
  component: ConsultantStatementExportModal,
});
