import { createFileRoute } from "@tanstack/react-router";
import { AdminBrandKitShowcase } from "@/components/admin/AdminBrandKitShowcase";

export const Route = createFileRoute("/admin/brand-kit")({
  head: () => ({ meta: [{ title: "Brand Kit & Design System — ESOL Energy V13.2" }] }),
  component: AdminBrandKitShowcase,
});
