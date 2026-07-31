import { createFileRoute } from "@tanstack/react-router";
import { AdminCloudflareAccountSetup } from "@/pages/admin/AdminCloudflareAccountSetup";

export const Route = createFileRoute("/admin/cloudflare")({
  head: () => ({ meta: [{ title: "Cloudflare Account Setup — ESOL Energy" }] }),
  component: AdminCloudflareAccountSetup,
});
