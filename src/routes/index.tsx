import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolTeslaHero } from "@/components/landing/EsolTeslaHero";
import { EsolTier1Partners } from "@/components/landing/EsolTier1Partners";
import { EsolHomeEnergyFlow } from "@/components/landing/EsolHomeEnergyFlow";
import { EsolGuidedConfigurator } from "@/components/landing/EsolGuidedConfigurator";
import { EsolAppPreviewSection } from "@/components/landing/EsolAppPreviewSection";
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
      {/* 1. Header Translúcido Fixo (Fixed Top-0) com Títulos de 1 Palavra */}
      <EsolPublicNavbar />

      <main className="space-y-0 pb-20 pt-20">
        {/* 2. Hero Section Cinematográfico Full-Bleed (Foto nítida à direita) */}
        <EsolTeslaHero />

        {/* 3. Faixa de Fabricantes Globais Tier-1 */}
        <EsolTier1Partners />

        {/* 4. Diagrama Interativo do Fluxo de Energia 3D (Home Energy Flow) */}
        <EsolHomeEnergyFlow />

        {/* 5. Simulador Solar Guiado em 3 Passos (Exclusivo via Slider Deslizante Ultra-Fluido) */}
        <EsolGuidedConfigurator />

        {/* 6. Maquete 3D do App Esol com Telemetria */}
        <EsolAppPreviewSection />

        {/* Container Central para Seções Institucionais */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 pt-20">
          {/* Como Funciona em 4 Passos sem Burocracia */}
          <EsolHowItWorks />

          {/* Rastreamento de Usinas por CPF/CNPJ */}
          <EsolProjectStatusTracker />

          {/* Perguntas Frequentes (FAQ) */}
          <div id="faq">
            <EsolFAQSection />
          </div>
        </div>
      </main>

      {/* Rodapé Corporativo com Novo Selo Oficial */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
