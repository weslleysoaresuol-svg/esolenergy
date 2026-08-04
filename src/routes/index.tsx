import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolFreshHero } from "@/components/brand/EsolFreshHero";
import { EsolComparisonCards } from "@/components/brand/EsolComparisonCards";
import { EsolFreshSimulator } from "@/components/brand/EsolFreshSimulator";
import { EsolHowItWorks } from "@/components/brand/EsolHowItWorks";
import { EsolUserProfilesShowcase } from "@/components/brand/EsolUserProfilesShowcase";
import { EsolCompetitorComparison } from "@/components/brand/EsolCompetitorComparison";
import { EsolFAQSection } from "@/components/brand/EsolFAQSection";
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* 1. Header Executiva Clean */}
      <EsolPublicNavbar />

      <main className="space-y-16 pb-20">
        {/* 2. Hero Section Aspiracional Clean */}
        <EsolFreshHero onSimulateClick={scrollToSimulador} onWhatsAppClick={openWhatsApp} />

        {/* 3. Comparativo "Antes e Depois" (Concessionária vs. ESOL) */}
        <EsolComparisonCards />

        {/* Container Central com Largura Máxima */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24">
          {/* 4. Simulador Solar 3-em-1 Fintech Clean */}
          <EsolFreshSimulator />

          {/* 5. Como Funciona em 4 Passos Simples */}
          <EsolHowItWorks />

          {/* 6. Central dos 6 Perfis de Atuação ESOL */}
          <EsolUserProfilesShowcase />

          {/* 7. Quadro Comparativo de Superioridade vs. Concessionárias */}
          <EsolCompetitorComparison />

          {/* 8. Perguntas Frequentes (FAQ) */}
          <EsolFAQSection />

          {/* 9. Portal de Rastreamento de Usinas por CPF/CNPJ */}
          <EsolProjectStatusTracker />
        </div>
      </main>

      {/* 10. Rodapé Corporativo Internacional */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
