import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolHeroSection } from "@/components/brand/EsolHeroSection";
import { EsolSimulator3in1 } from "@/components/brand/EsolSimulator3in1";
import { EsolCatalogShowcase } from "@/components/brand/EsolCatalogShowcase";
import { EsolCompetitorComparison } from "@/components/brand/EsolCompetitorComparison";
import { EsolUserProfilesShowcase } from "@/components/brand/EsolUserProfilesShowcase";
import { EsolProjectStatusTracker } from "@/components/brand/EsolProjectStatusTracker";
import { EsolPublicFooter } from "@/components/brand/EsolPublicFooter";

export const Route = createFileRoute("/")({
  component: IndexLandingPage,
});

function IndexLandingPage() {
  const scrollToSimulador = () => {
    const el = document.getElementById("simulador");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20energia%20solar.", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header & Navbar Executiva */}
      <EsolPublicNavbar />

      <main className="space-y-16 pb-12">
        {/* 2. Hero Section Internacional com Cockpit Solar 3D */}
        <EsolHeroSection onSimulateClick={scrollToSimulador} onWhatsAppClick={openWhatsApp} />

        {/* Container Central com Largura Máxima */}
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {/* 3. Simulador Solar 3-em-1 Instantâneo */}
          <EsolSimulator3in1 />

          {/* 4. Vitrine de Equipamentos Fotovoltaicos Tier-1 */}
          <EsolCatalogShowcase />

          {/* 5. Matriz Comparativa de Superioridade vs. Clarke & SolarZ */}
          <EsolCompetitorComparison />

          {/* 6. Central dos 6 Perfis de Atuação ESOL */}
          <EsolUserProfilesShowcase />

          {/* 7. Portal de Transparência e Rastreamento de Usina por CPF/CNPJ */}
          <EsolProjectStatusTracker />
        </div>
      </main>

      {/* 8. Rodapé Corporativo Internacional */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
