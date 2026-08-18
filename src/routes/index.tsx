import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolTeslaHero } from "@/components/landing/EsolTeslaHero";
import { EsolTier1Partners } from "@/components/landing/EsolTier1Partners";
import { EsolHomeEnergyFlow } from "@/components/landing/EsolHomeEnergyFlow";
import { EsolRealVideoShowcase } from "@/components/landing/EsolRealVideoShowcase";
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
    <div className="relative min-h-screen bg-[#080E21] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      {/* 1. Header Fixo Justo no padrão de Startup Tech */}
      <EsolPublicNavbar />

      <main className="space-y-0 pb-20 pt-16">
        {/* 2. Hero Section com Efeito Typewriter e Fotografia Arquitetônica */}
        <EsolTeslaHero />

        {/* 3. Faixa de Fabricantes Globais Tier-1 */}
        <EsolTier1Partners />

        {/* 4. Diagrama Interativo do Fluxo de Energia 3D da Casa Real */}
        <EsolHomeEnergyFlow />

        {/* 5. Showcase de Imagens & Vídeos Reais de Instalações (Padrão Enphase) */}
        <EsolRealVideoShowcase />

        {/* 6. Simulador Solar Guiado de Retorno Financeiro */}
        <EsolGuidedConfigurator />

        {/* 7. Maquete do App Esol com Telemetria em Tempo Real */}
        <EsolAppPreviewSection />

        {/* Container Central para Seções Institucionais */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 pt-20">
          {/* Como Funciona em 4 Passos sem Burocracia */}
          <div id="como-funciona">
            <EsolHowItWorks />
          </div>

          {/* Rastreamento de Usinas por CPF/CNPJ */}
          <EsolProjectStatusTracker />

          {/* Perguntas Frequentes (FAQ) */}
          <div id="faq">
            <EsolFAQSection />
          </div>
        </div>
      </main>

      {/* Rodapé Justo e Minimalista Estilo Startup Tech */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
