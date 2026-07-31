import { createFileRoute } from "@tanstack/react-router";
import { ConsultantWalletBalance } from "@/pages/consultant/ConsultantWalletBalance";

export const Route = createFileRoute("/consultant/wallet")({
  head: () => ({ meta: [{ title: "Carteira Digital — ESOL Energy" }] }),
  component: ConsultantWalletBalance,
});
