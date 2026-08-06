import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { EsolPublicNavbar } from "@/components/brand/EsolPublicNavbar";
import { EsolHeroSection } from "@/components/landing/EsolHeroSection";
import { EsolEcosystemSection } from "@/components/landing/EsolEcosystemSection";
import { EsolSocialProofSection } from "@/components/landing/EsolSocialProofSection";
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
      {/* 1. Header Energitech Glassmorphism com Marca Oficial esol energy. */}
      <EsolPublicNavbar />

      <main className="space-y-0 pb-20">
        {/* ATO 1: O Despertar — Hero Section Energitech com Simulador Fintech 3-em-1 Integrado */}
        <EsolHeroSection />

        {/* ATO 2: A Tecnologia — Ecossistema Esol (Fotovoltaico 70%, Assinatura, Esol Charge, Esol Club) */}
        <EsolEcosystemSection />

        {/* ATO 3: A Prova de Fogo — Prova Social, Usinas Reais, Métricas de MW & Selos CREA/ANEEL */}
        <EsolSocialProofSection />

        {/* ATO 4: A Experiência App — Maquete 3D do Smartphone com Telemetria em Tempo Real */}
        <EsolAppPreviewSection />

        {/* Container Central com Largura Máxima para Seções de Apoio */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 pt-20">
          {/* ATO 5: A Jornada Simples — Como Funciona em 4 Passos sem Burocracia */}
          <EsolHowItWorks />

          {/* Rastreamento de Usinas por CPF/CNPJ */}
          <EsolProjectStatusTracker />

          {/* ATO 6: Perguntas Frequentes (FAQ) & Quebra de Objeções */}
          <EsolFAQSection />
        </div>
      </main>

      {/* Rodapé Corporativo com Selo 100% Energia Limpa */}
      <EsolPublicFooter />
    </div>
  );
}

export default IndexLandingPage;
