import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolHeroSection } from "@/components/brand/EsolHeroSection";
import { EsolSimulator3in1 } from "@/components/brand/EsolSimulator3in1";
import { EsolGrid6CardsWidget } from "@/components/brand/EsolGrid6CardsWidget";
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
    window.open("https://wa.me/5531999999999?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20da%20ESOL%20Energy.", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header Executivo Idêntico ao Mockup */}
      <EsolPublicNavbar />

      <main className="space-y-16 pb-12">
        {/* 2. Hero Section com Cockpit Solar 3D Idêntico ao Mockup */}
        <EsolHeroSection onSimulateClick={scrollToSimulador} onSpecialistClick={openWhatsApp} />

        {/* 3. Container da Grade Inferior Idêntica ao Mockup (Calculadora 3-em-1 à Esquerda + 6 Cards Neon à Direita) */}
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna Esquerda: Calculadora 3-em-1 (Turnkey, Subscription, Free Energy) */}
            <div className="lg:col-span-5">
              <EsolSimulator3in1 />
            </div>

            {/* Coluna Direita: Grid dos 6 Cards Glassmorphic Neon */}
            <div className="lg:col-span-7">
              <EsolGrid6CardsWidget />
            </div>
          </div>

          {/* 4. Vitrine de Equipamentos Tier-1 */}
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
