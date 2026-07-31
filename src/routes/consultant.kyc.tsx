import { createFileRoute } from "@tanstack/react-router";
import { ConsultantDocumentUploadKYC } from "@/pages/consultant/ConsultantDocumentUploadKYC";

export const Route = createFileRoute("/consultant/kyc")({
  head: () => ({ meta: [{ title: "Upload KYC — ESOL Energy" }] }),
  component: ConsultantDocumentUploadKYC,
});
