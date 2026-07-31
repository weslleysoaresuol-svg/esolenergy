import { createFileRoute } from "@tanstack/react-router";
import { AdminE2ETestCaseDetails } from "@/pages/admin/AdminE2ETestCaseDetails";

export const Route = createFileRoute("/admin/e2e-details")({
  head: () => ({ meta: [{ title: "E2E Test Details — ESOL Energy" }] }),
  component: AdminE2ETestCaseDetails,
});
