import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolTeslaHero } from "@/components/landing/EsolTeslaHero";
import { EsolHomeEnergyFlow } from "@/components/landing/EsolHomeEnergyFlow";
import { EsolGuidedConfigurator } from "@/components/landing/EsolGuidedConfigurator";
import { EsolComparisonCards } from "@/components/brand/EsolComparisonCards";
import { EsolTier1Partners } from "@/components/landing/EsolTier1Partners";
import { EsolArchitecturalGallery } from "@/components/landing/EsolArchitecturalGallery";
import { EsolAppPreviewSection } from "@/components/landing/EsolAppPreviewSection";
import { EsolSocialProofSection } from "@/components/landing/EsolSocialProofSection";
import { EsolHowItWorks } from "@/components/brand/EsolHowItWorks";
import { EsolFAQSection } from "@/components/brand/EsolFAQSection";
import { EsolProjectStatusTracker } from "@/components/brand/EsolProjectStatusTracker";
import { EsolPublicFooter } from "@/components/brand/EsolPublicFooter";

export const Route = createFileRoute("/")({
  component: IndexLandingPage,
});

function IndexLandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      {/* 1. Header Tesla Tier Glassmorphism com Marca Oficial esol energy. */}
      <EsolPublicNavbar />

      <main className="space-y-0 pb-20">
        {/* 2. Hero Section Cinematográfico Full-Bleed Padrão Tesla Solar (Foto limpa e nítida à direita) */}
        <EsolTeslaHero />

        {/* 3. Faixa de Fabricantes Globais Tier-1 (Homologação & Confiança) */}
        <EsolTier1Partners />

        {/* 4. Diagrama Interativo do Fluxo de Energia Padrão Enphase (Home Energy Flow) */}
        <EsolHomeEnergyFlow />

        {/* 5. Simulador Solar Guiado em 3 Passos (Com digitação direta e escolha entre as 3 modalidades) */}
        <EsolGuidedConfigurator />

        {/* 6. Comparativo Antes vs Depois (Concessionária vs Esol Energy) */}
        <EsolComparisonCards />

        {/* 7. Galeria Arquitetônica de Projetos Reais Entregues */}
        <EsolArchitecturalGallery />

        {/* 8. Maquete 3D do App Esol com Telemetria em Tempo Real */}
        <EsolAppPreviewSection />

        {/* 9. Métricas de Impacto, Prova Social & Selos de Engenharia CREA/ANEEL */}
        <EsolSocialProofSection />

        {/* Container Central para Seções Institucionais */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 pt-20">
          {/* Como Funciona em 4 Passos sem Burocracia */}
          <EsolHowItWorks />

          {/* Rastreamento de Usinas por CPF/CNPJ */}
          <EsolProjectStatusTracker />

          {/* Perguntas Frequentes (FAQ) */}
          <EsolFAQSection />
        </div>
      </main>

      {/* Rodapé Corporativo com Selo 100% Energia Limpa */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
