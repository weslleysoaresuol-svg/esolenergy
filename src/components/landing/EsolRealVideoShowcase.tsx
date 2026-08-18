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
  Zap
} from 'lucide-react';

export interface EsolRealVideoShowcaseProps {
  className?: string;
}

const REAL_PROJECTS = [
  {
    id: 'drone-roof',
    category: 'Residencial Alto Padrão',
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
    description: 'Instalação residencial de alta densidade no telhado com integração estética arquitetônica e zero cabos aparentes.'
  },
  {
    id: 'installer-crea',
    category: 'Engenharia & Homologação',
    title: 'Equipe Técnica Certificada & ART CREA',
    location: 'Atendimento Nacional',
    image: '/images/esol_real_installer_technician.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-technician-checking-the-wiring-of-a-solar-panel-42459-large.mp4',
    icon: Wrench,
    metrics: {
      team: 'Engenheiros CREA',
      safety: 'Norma NR-10 & NR-35',
      approval: '100% Concessionária',
      warranty: '25 Anos'
    },
    description: 'Nossa equipe própria de engenheiros e eletrotécnicos realiza vistorias rigorosas e testes com multímetro e termografia.'
  },
  {
    id: 'garage-bess',
    category: 'Baterias & Mobilidade Elétrica',
    title: 'Garagem Inteligente com BESS & Wallbox VE',
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
    description: 'Sistema de armazenamento de energia com baterias de lítio LFP acoplado à estação de recarga rápida de veículos elétricos.'
  },
  {
    id: 'commercial-plant',
    category: 'Comercial & Corporativo',
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
    description: 'Grande usina solar corporativa sobre laje técnica, gerando economia expressiva no custo operacional da empresa.'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        
        {/* Header da Seção Estilo Enphase (Limpo, Autêntico e Confiante) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-800/80">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Instalações Reais em Operação • Padrão Enphase</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Engenharia Real Entregue em Todo o Brasil
            </h2>
          </div>

          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            Confira fotografias e registros em vídeo das nossas usinas solares residenciais, garagens BESS e usinas corporativas homologadas.
          </p>
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#080E21]/90 via-transparent to-black/30 pointer-events-none" />
              )}

              {/* Badge de Localização e Categoria no Topo */}
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

            {/* SELETOR RÁPIDO DE PROJETOS REAIS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-2 overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] scale-[1.02]'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`size-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {isSelected && <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />}
                    </div>

                    <div>
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {proj.category.split('&')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{proj.location}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LADO DIREITO: CARD DE ESPECIFICAÇÕES TÉCNICAS REAIS DO PROJETO (4 Colunas) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-6">
              
              <div className="space-y-2 pb-4 border-b border-slate-800">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  Telemetria da Instalação
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeProject.title}
                </h3>
              </div>

              {/* Grid de Métricas de Engenharia */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(activeProject.metrics).map(([key, val], i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block capitalize">
                      {key}
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Equipamentos Tier-1 com garantia de 25 anos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="size-4 text-cyan-400 shrink-0" />
                  <span>Homologação Concessionária sem retrabalho</span>
                </div>
              </div>

              <a
                href="#simulador"
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                <span>Quero Uma Usina Igual a Esta</span>
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
