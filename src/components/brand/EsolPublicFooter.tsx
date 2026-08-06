import React from 'react';
import { EsolLogoPrimary } from '@/components/brand/EsolLogoPrimary';
import { SeloVerdeEsol } from '@/components/brand/SeloVerdeEsol';
import { ShieldCheck, Mail, Phone, MapPin, Lock, FileText } from 'lucide-react';

export interface EsolPublicFooterProps {
  className?: string;
}

/**
 * `<EsolPublicFooter />` — Rodapé Corporativo de Alto Padrão (V13.2)
 */
export const EsolPublicFooter: React.FC<EsolPublicFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-slate-950 text-white border-t border-slate-800 pt-16 pb-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Coluna 1 & 2: Branding & Sede */}
          <div className="lg:col-span-2 space-y-4">
            <EsolLogoPrimary width={220} variant="dark" />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Soluções inteligentes em engenharia solar fotovoltaica, geração distribuída por assinatura e Mercado Livre de Energia ANEEL.
            </p>
            <div className="pt-2">
              <SeloVerdeEsol size="md" />
            </div>
          </div>

          {/* Coluna 3: Soluções */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Soluções Solares</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#simulador" className="hover:text-white transition-colors">Usina Própria Turnkey</a></li>
              <li><a href="#simulador" className="hover:text-white transition-colors">Energia por Assinatura (GD)</a></li>
              <li><a href="#simulador" className="hover:text-white transition-colors">Mercado Livre (MLE ANEEL)</a></li>
              <li><a href="#produtos" className="hover:text-white transition-colors">Hardware Tier-1 & BESS</a></li>
              <li><a href="#rastreamento" className="hover:text-white transition-colors">Rastreamento por CPF/CNPJ</a></li>
            </ul>
          </div>

          {/* Coluna 4: Institucional & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Governança & Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/auth" className="hover:text-white transition-colors">Área do Cliente & Consultor</a></li>
              <li><a href="#diferenciais" className="hover:text-white transition-colors">Selo Verde ESOL Lei 14.300</a></li>
              <li><span className="opacity-70">Política de Privacidade LGPD</span></li>
              <li><span className="opacity-70">Termos de Uso & Contratos</span></li>
              <li><span className="opacity-70">Auditoria Cibernética SOC 2</span></li>
            </ul>
          </div>

          {/* Coluna 5: Contato Corporativo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Atendimento Oficial</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-400 shrink-0" />
                <span>0800 591 8000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-cyan-400 shrink-0" />
                <span>contato@esolenergy.com.br</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Av. Paulista, 1000 • São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Bottom (Copyright & CNPJ) */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <p>© 2026 ESOL Energy do Brasil S.A. • CNPJ: 45.890.123/0001-99 • Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="size-3.5 text-emerald-400" /> ISO 9001</span>
            <span className="flex items-center gap-1"><Lock className="size-3.5 text-cyan-400" /> SSL 256-bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EsolPublicFooter;
