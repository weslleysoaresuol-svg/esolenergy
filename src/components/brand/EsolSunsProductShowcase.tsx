import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, CheckCircle, ShieldCheck, Zap, Sun, Cpu, BatteryCharging } from 'lucide-react';

export interface EsolSunsProductShowcaseProps {
  className?: string;
}

/**
 * `<EsolSunsProductShowcase />` — Vitrine de Produtos Inspirada na SUNS Energy (V15.0 Maestro)
 * Full-bleed product sections, fotografia em fundo escuro cinemático, dual buttons (Order + Product Sheet PDF).
 */
export const EsolSunsProductShowcase: React.FC<EsolSunsProductShowcaseProps> = ({ className = '' }) => {
  const hardwareList = [
    {
      id: 'topcon-700w',
      title: 'Módulo N-Type TOPCon 700W',
      subtitle: 'Painéis bifaciais Glass-Glass de máxima densidade energética.',
      brand: 'Canadian Solar / Jinko Tier-1',
      output: '700 Wp',
      efficiency: '22.8% PR',
      warranty: '25 Anos de Geração Linear',
      features: [
        'Tecnologia Bifacial Glass-Glass com captura de albedo traseiro',
        'Degradação ultrabaixa: <0.4% ao ano',
        'Resistência extrema a granizo, nevoeiro salino e ventos de até 240km/h',
        'Certificação ANEEL, INMETRO e ISO 9001',
      ],
      image: '/images/esol-topcon-panel.png',
      pdfUrl: '#',
    },
    {
      id: 'hybrid-15kw',
      title: 'Inversor String Híbrido 15kW',
      subtitle: 'Controle bidirecional inteligente preparado para baterias BESS.',
      brand: 'Deye / Sungrow / WEG',
      output: '15 kW AC',
      efficiency: '98.6% Eficiência Máxima',
      warranty: '10 Anos de Garantia de Fábrica',
      features: [
        'Suporte nativo para acoplamento de baterias de lítio',
        '4 MPPTs independentes para otimização de arranjos solares em múltiplos telhados',
        'Tempo de transferência para emergência Off-Grid <10ms',
        'Telemetria IoT 24/7 integrada com o App ESOL',
      ],
      image: '/images/esol-hybrid-inverter.png',
      pdfUrl: '#',
    },
    {
      id: 'bess-10kwh',
      title: 'Armazenamento BESS Lítio 10kWh',
      subtitle: 'Nobreak de alta capacidade com química LiFePO4 de máxima segurança.',
      brand: 'BYD Battery-Box / Deye Lithium',
      output: '10.24 kWh',
      efficiency: '>6.000 Ciclos',
      warranty: '10 Anos de Garantia',
      features: [
        'Baterias de Fosfato de Ferro-Lítio (LiFePO4) com estabilidade térmica superior',
        'Expansão modular simples plug-and-play até 80kWh',
        'Zero manutenção, sem emanação de gases ou necessidade de ventilação especial',
        'Autonomia para manter residências e empresas operando durante apagões',
      ],
      image: '/images/esol-bess-battery.png',
      pdfUrl: '#',
    },
  ];

  const handleOrder = (productTitle: string) => {
    const msg = encodeURIComponent(`Olá! Tenho interesse no equipamento ${productTitle}. Gostaria de receber uma cotação oficial.`);
    window.open(`https://wa.me/5531999999999?text=${msg}`, '_blank');
  };

  return (
    <div className={`space-y-24 ${className}`} id="produtos">
      {/* Header da Seção Estilo SUNS */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-extrabold uppercase tracking-widest">
          EQUIPAMENTOS HOMOLOGADOS TIER-1 ANEEL
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
          Hardware Fotovoltaico de Classe Mundial
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-400 font-light">
          Equipamentos rigorosamente testados pelas maiores engenharias do planeta.
        </p>
      </div>

      {/* Seções de Produtos Verticais Full-Bleed Estilo SUNS */}
      <div className="space-y-16">
        {hardwareList.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden"
          >
            {/* Lado Esquerdo: Imagem do Produto com Brilho Cinemático */}
            <div className={`lg:col-span-6 relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 h-80 sm:h-96 flex items-center justify-center p-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center rounded-xl scale-105 hover:scale-110 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {item.brand}
                </span>
              </div>
            </div>

            {/* Lado Direito: Conteúdo de Especificações Estilo SUNS */}
            <div className={`lg:col-span-6 space-y-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  OUTPUT: {item.output} • {item.efficiency}
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-black text-white uppercase mt-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300 font-light mt-2">{item.subtitle}</p>
              </div>

              <div className="h-px w-full bg-slate-800" />

              {/* Bullets de Vantagens */}
              <ul className="space-y-2.5 text-xs text-slate-300 font-body">
                {item.features.map((feat, fidx) => (
                  <li key={fidx} className="flex items-start gap-2.5">
                    <CheckCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Botões Duplos SUNS Style: Order Now + Product Sheet PDF */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOrder(item.title)}
                  className="px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)] cursor-pointer"
                >
                  Solicitar Cotação
                </motion.button>

                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                >
                  <FileText className="size-4 text-amber-400" />
                  <span>Ficha Técnica (PDF)</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EsolSunsProductShowcase;
