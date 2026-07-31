import { createFileRoute } from "@tanstack/react-router";
import { ConsultantPixWithdrawalModal } from "@/pages/consultant/ConsultantPixWithdrawalModal";

export const Route = createFileRoute("/consultant/wallet/withdraw")({
  head: () => ({ meta: [{ title: "Saque PIX — ESOL Energy" }] }),
  component: ConsultantPixWithdrawalModal,
});
