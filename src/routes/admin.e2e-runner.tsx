import { createFileRoute } from "@tanstack/react-router";
import { AdminE2ETestSuiteRunner } from "@/pages/admin/AdminE2ETestSuiteRunner";

export const Route = createFileRoute("/admin/e2e-runner")({
  head: () => ({ meta: [{ title: "E2E Test Suite — ESOL Energy" }] }),
  component: AdminE2ETestSuiteRunner,
});
