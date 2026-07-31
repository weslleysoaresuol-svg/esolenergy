import { createFileRoute } from "@tanstack/react-router";
import { DataRoomGovernance } from "@/pages/admin/DataRoomGovernance";

export const Route = createFileRoute("/admin/data-room")({
  head: () => ({ meta: [{ title: "Data Room & Governance — ESOL Energy" }] }),
  component: DataRoomGovernance,
});
