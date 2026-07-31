import { createFileRoute } from "@tanstack/react-router";
import { ConsultantEsolSignContract } from "@/pages/consultant/ConsultantEsolSignContract";

export const Route = createFileRoute("/consultant/contract")({
  head: () => ({ meta: [{ title: "Assinatura Digital — ESOL Energy" }] }),
  component: ConsultantEsolSignContract,
});
