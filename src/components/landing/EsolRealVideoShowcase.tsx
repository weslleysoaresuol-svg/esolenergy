import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ShieldCheck, 
  Sun, 
  CheckCircle2, 
  Maximize2, 
  ArrowRight, 
  Building2, 
  Home, 
  Car, 
  Wrench,
  Users,
  Zap,
  Layers
} from 'lucide-react';

export interface EsolRealVideoShowcaseProps {
  className?: string;
}

const REAL_PROJECTS = [
  {
    id: 'drone-roof',
    category: 'Residencial Alto Padrão',
    tag: '01. GERAÇÃO NO TELHADO',
    title: 'Residência Solar Alphaville • 14.8 kWp',
    location: 'São Paulo, SP',
    image: '/images/esol_real_drone_rooftop_installation.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-solar-panels-on-a-roof-42456-large.mp4',
    icon: Home,
    metrics: {
      power: '14.8 kWp',
      savings: 'R$ 1.680/mês',
      panels: '24 Módulos N-Type',
      payback: '2.8 anos'
    },
    description: 'Instalação residencial de alta densidade no telhado com integração estética arquitetônica, fixação sem perfuração destrutiva e zero cabos aparentes.'
  },
  {
    id: 'panel-texture',
    category: 'Hardware & Eficiência',
    tag: '02. MÓDULOS N-TYPE',
    title: 'Células Monocristalinas N-Type Bifaciais',
    location: 'Tecnologia Tier-1',
    image: '/images/esol_real_panel_closeup_texture.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-solar-panels-in-a-field-under-the-sun-42455-large.mp4',
    icon: Layers,
    metrics: {
      efficiency: '22.8% Eficiência',
      warranty: '25 Anos Linear',
      bifacial: '+15% Geração Traseira',
      glass: 'Vidro Temperado 3.2mm'
    },
    description: 'Módulos fotovoltaicos com revestimento antirreflexo, tolerância positiva e máxima absorção de radiação mesmo em dias nublados.'
  },
  {
    id: 'installer-crea',
    category: 'Engenharia & Segurança',
    tag: '03. INSTALAÇÃO HOMOLOGADA',
    title: 'Equipe Técnica Própria & ART CREA',
    location: 'Atendimento Nacional',
    image: '/images/esol_real_installer_technician.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-technician-checking-the-wiring-of-a-solar-panel-42459-large.mp4',
    icon: Wrench,
    metrics: {
      team: 'Engenheiros CREA',
      safety: 'Norma NR-10 & NR-35',
      approval: '100% Concessionária',
      warranty: 'Suporte Vitalício'
    },
    description: 'Engenheiros e técnicos uniformizados e credenciados realizando testes de isolamento, termografia e conexão à rede elétrica.'
  },
  {
    id: 'garage-bess',
    category: 'Baterias & Mobilidade',
    tag: '04. BESS & VE CHARGE',
    title: 'Garagem com Baterias BESS & Wallbox VE',
    location: 'Curitiba, PR',
    image: '/images/esol_real_garage_bess_powerwall.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-charging-an-electric-car-with-solar-energy-42458-large.mp4',
    icon: Car,
    metrics: {
      storage: '15 kWh LFP',
      backup: 'Nobreak 10ms',
      charger: '22 kW AC Wallbox',
      grid: 'Zero Custo de Ponta'
    },
    description: 'Sistema de armazenamento residencial com baterias de fosfato de ferro-lítio (LiFePO4) e estação de recarga veicular rápida.'
  },
  {
    id: 'happy-clients',
    category: 'Família & Autonomia',
    tag: '05. CASOS REAIS',
    title: 'Economia Real e Conforto para a Família',
    location: 'Campinas, SP',
    image: '/images/esol_real_happy_homeowners_garden.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-happy-family-in-their-house-garden-42460-large.mp4',
    icon: Users,
    metrics: {
      satisfaction: '100% Satisfeitos',
      billReduction: '-92% na Conta',
      peaceOfMind: 'Ar-condicionado Livre',
      monitoring: 'App no Smartphone'
    },
    description: 'Clientes reais desfrutando de conforto térmico total e economia financeira garantida sem surpresas na fatura de energia.'
  },
  {
    id: 'commercial-plant',
    category: 'Corporativo & Indústria',
    tag: '06. USINAS COMERCIAIS',
    title: 'Complexo Empresarial • 380 kWp',
    location: 'Belo Horizonte, MG',
    image: '/images/esol_real_commercial_solar_roof.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-solar-energy-park-42457-large.mp4',
    icon: Building2,
    metrics: {
      power: '380 kWp',
      savings: 'R$ 42.000/mês',
      co2: '185 ton CO₂/ano',
      roi: '34% ao ano'
    },
    description: 'Grande usina corporativa instalada sobre laje técnica, gerando previsibilidade de custos e sustentabilidade comprovada para a empresa.'
  }
];

export const EsolRealVideoShowcase: React.FC<EsolRealVideoShowcaseProps> = ({ className = '' }) => {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const activeProject = REAL_PROJECTS[activeProjectIndex];

  return (
    <section className={`py-24 bg-[#080E21] text-white relative overflow-hidden ${className}`} id="obras-reais">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 size-[650px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        
        {/* Header da Seção Estilo Enphase (Limpo, Autêntico e Confiante) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-800/80">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Obras & Instalações Reais • Padrão Enphase Energy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Tecnologia Solar em Aplicação Real
            </h2>
          </div>

          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            Fotografias autênticas e registros em vídeo de usinas solares residenciais, garagens BESS e usinas comerciais entregues em todo o Brasil.
          </p>
        </div>

        {/* NAVEGAÇÃO POR ABAS NO PADRÃO ENPHASE */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {REAL_PROJECTS.map((proj, idx) => {
            const isSelected = activeProjectIndex === idx;
            const Icon = proj.icon;

            return (
              <button
                key={proj.id}
                onClick={() => {
                  setActiveProjectIndex(idx);
                  setIsPlayingVideo(false);
                }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`size-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>{proj.tag}</span>
              </button>
            );
          })}
        </div>

        {/* STAGE PRINCIPAL DE VÍDEO & FOTOGRAFIA REAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LADO ESQUERDO: PLAYER DE VÍDEO / FOTOGRAFIA DINÂMICA (8 Colunas) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group aspect-[16/10] sm:aspect-[16/9]">
              
              {/* VÍDEO OU FOTO REAL */}
              {isPlayingVideo ? (
                <video
                  src={activeProject.videoUrl}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="w-full h-full object-cover object-center filter brightness-105 contrast-105 transition-transform duration-700 group-hover:scale-105"
                />
              )}

              {/* Gradient Vignette Sutil */}
              {!isPlayingVideo && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#080E21]/95 via-transparent to-black/40 pointer-events-none" />
              )}

              {/* Badge de Localização no Topo */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-xs font-mono">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300">{activeProject.location}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">{activeProject.category}</span>
              </div>

              {/* Botão de Play de Vídeo Flutuante */}
              {!isPlayingVideo && (
                <button
                  onClick={() => setIsPlayingVideo(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 sm:size-20 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all transform hover:scale-110 cursor-pointer z-20 group"
                  title="Assistir Vídeo Real da Obra"
                >
                  <Play className="size-7 sm:size-8 ml-1 fill-slate-950" />
                </button>
              )}

              {/* Informações da Obra no Rodapé da Imagem */}
              {!isPlayingVideo && (
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-lg sm:text-2xl font-black text-white">{activeProject.title}</div>
                    <div className="text-xs text-slate-300 max-w-lg leading-relaxed">{activeProject.description}</div>
                  </div>

                  <button
                    onClick={() => setIsPlayingVideo(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Play className="size-3.5 text-emerald-400" />
                    <span>Ver Vídeo da Instalação</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* LADO DIREITO: CARD DE ESPECIFICAÇÕES TÉCNICAS REAIS DO PROJETO (4 Colunas) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-6">
              
              <div className="space-y-1.5 pb-4 border-b border-slate-800">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  Telemetria & Especificações
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeProject.title}
                </h3>
              </div>

              {/* Grid de Métricas de Engenharia */}
              <div className="grid grid-cols-2 gap-3.5">
                {Object.entries(activeProject.metrics).map(([key, val], i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block capitalize">
                      {key}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Hardware Tier-1 com garantia de 25 anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-cyan-400 shrink-0" />
                  <span>Homologação e projeto aprovado pela concessionária</span>
                </div>
              </div>

              <a
                href="#simulador"
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                <span>Simular Projeto com Esta Tecnologia</span>
                <ArrowRight className="size-4" />
              </a>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default EsolRealVideoShowcase;
