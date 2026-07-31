import { createFileRoute } from "@tanstack/react-router";
import { MMNNetworkTreePage } from "@/pages/admin/MMNNetworkTreePage";

export const Route = createFileRoute("/admin/mmn-tree")({
  head: () => ({ meta: [{ title: "Árvore MMN — ESOL Energy" }] }),
  component: MMNNetworkTreePage,
});
