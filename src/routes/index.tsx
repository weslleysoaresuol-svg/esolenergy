import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolSolarCanvas } from "@/components/brand/EsolSolarCanvas";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolSunsHero } from "@/components/brand/EsolSunsHero";
import { EsolSimuladorCockpit } from "@/components/brand/EsolSimuladorCockpit";
import { EsolSunsProductShowcase } from "@/components/brand/EsolSunsProductShowcase";
import { EsolSunsBenefitsAccordion } from "@/components/brand/EsolSunsBenefitsAccordion";
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* 0. Canvas Fotônico Interativo de Fundo */}
      <EsolSolarCanvas />

      {/* 1. Header & Navbar Executiva */}
      <EsolPublicNavbar />

      <main className="relative z-10 space-y-24 pb-20">
        {/* 2. Hero Section Cinemático estilo SUNS Energy */}
        <EsolSunsHero onSimulateClick={scrollToSimulador} onWhatsAppClick={openWhatsApp} />

        {/* Container Central com Largura Máxima */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-28">
          {/* 3. Cockpit do Simulador Fintech 3-em-1 (Encaixe Perfeito na Narrativa) */}
          <EsolSimuladorCockpit />

          {/* 4. Vitrine Full-Bleed de Produtos Tier-1 (Estilo SUNS Hardware Showcase) */}
          <EsolSunsProductShowcase />

          {/* 5. Seção de Benefícios Accordion (Estilo SUNS Benefits) */}
          <EsolSunsBenefitsAccordion />

          {/* 6. Matriz Comparativa SaaS de Superioridade vs. Concessionárias */}
          <EsolCompetitorComparison />

          {/* 7. Central dos 6 Perfis de Atuação ESOL */}
          <EsolUserProfilesShowcase />

          {/* 8. Portal de Transparência e Rastreamento de Usina por CPF/CNPJ */}
          <EsolProjectStatusTracker />
        </div>
      </main>

      {/* 9. Rodapé Corporativo Internacional */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
