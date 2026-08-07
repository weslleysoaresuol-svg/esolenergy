import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut, Layers, Sparkles, X, CheckCircle2, ShieldCheck, Cpu, Zap, Sun, Car, Smartphone } from 'lucide-react';

export interface EsolProduct3DViewerProps {
  productId: 'sol' | 'modulos' | 'inversor' | 'bateria' | 'app';
  onClose?: () => void;
}

const PRODUCT_DATA = {
  sol: {
    name: 'Gerador Fotônico Solar Core',
    subtitle: 'Radiação Infinita Fotônica',
    category: 'FONTE DE ENERGIA',
    specs: [
      'Irradiância Global Horizontal: 5.6 kWh/m²/dia',
      'Temperatura Coronal Simulada: 5.778 K',
      'Espectro Amplo AM 1.5 Global Direct',
      'Emissão Constante Zero Carbono'
    ],
    details: 'Fonte primordial de energia do nosso ecossistema. O sol emite fótons que viajam 150 milhões de quilômetros até atingirem os módulos bifaciais Esol.'
  },
  modulos: {
    name: 'Módulo Fotovoltaico N-Type Bifacial Tier-1',
    subtitle: 'Painel Monocristalino Safira',
    category: 'CAPTAÇÃO & CONVERSÃO',
    specs: [
      'Potência Máxima: 600W+ por Módulo',
      'Eficiência da Célula N-Type TOPCon: > 22.8%',
      'Vidro Duplo Templado Anti-Reflexo 3.2mm',
      'Garantia de Desempenho Linear: 25 Anos (87.4%)'
    ],
    details: 'Equipado com tecnologia bifacial que capta radiação solar direta na parte frontal e albedo refletido do solo na parte traseira, gerando até 30% a mais de energia.'
  },
  inversor: {
    name: 'Inversor Central Inteligente Esol Hybrid',
    subtitle: 'Gerenciador com Inteligência Artificial',
    category: 'CONVERSÃO CA/CC & REDE',
    specs: [
      'Eficiência Máxima de Conversão: 98.6%',
      'Proteção Ativa AFCI Arc-Fault com IA',
      'Grau de Proteção IP66 Ultra-Resistente',
      'Sincronismo Automático com a Concessionária ANEEL'
    ],
    details: 'O cérebro do sistema solar. Transforma a corrente contínua dos módulos em corrente alternada pura para o seu imóvel com monitoramento térmico ativo.'
  },
  bateria: {
    name: 'Estação Esol Charge VE & Smart Energy',
    subtitle: 'Carregamento VE & Autoconsumo',
    category: 'ALIMENTAÇÃO & MOBILIDADE',
    specs: [
      'Potência de Carregamento: 22 kW AC Ultrarrápido',
      'Protocolo Universal de Recarga Tipo 2 (IEC 62196)',
      'Sincronia com Excedente de Geração Solar',
      'Invólucro Blindado NEMA 4X / IK10'
    ],
    details: 'Carregador inteligente para veículos elétricos e híbridos com balanceamento automático de carga para evitar sobrecarga no quadro geral do imóvel.'
  },
  app: {
    name: 'Aplicativo de Telemetria Esol Mobile',
    subtitle: 'Centro de Comando em Tempo Real',
    category: 'GESTÃO & MONITORAMENTO',
    specs: [
      'Telemetria via Satélite & IoT a cada 60s',
      'Gráficos de Economia Acumulada em R$',
      'Relatórios Regulatórios ANEEL em PDF',
      'Alertas Preditivos de Limpeza e Performance'
    ],
    details: 'Acompanhe na palma da sua mão a produção diária em kWh, a redução exata no seu boleto e a pegada de carbono evitada.'
  }
};

export const EsolProduct3DViewer: React.FC<EsolProduct3DViewerProps> = ({ productId, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const product = PRODUCT_DATA[productId] || PRODUCT_DATA.modulos;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b132b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x10b981, 2.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    fillLight.position.set(-5, -3, -2);
    scene.add(fillLight);

    // 3. Build Procedural 3D Mesh based on Product ID
    const productGroup = new THREE.Group();

    if (productId === 'sol') {
      // 3D Sun Sphere + Outer Corona Rays
      const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const sunMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        wireframe: wireframe
      });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      productGroup.add(sunMesh);

      // Corona Ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.05, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.5,
        wireframe: wireframe
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      productGroup.add(ringMesh);

    } else if (productId === 'modulos') {
      // 3D Solar Panel Mesh
      const frameGeo = new THREE.BoxGeometry(2.4, 1.4, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.2,
        wireframe: wireframe
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);

      // Glass Cells Surface
      const glassGeo = new THREE.PlaneGeometry(2.3, 1.3);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.1,
        emissive: 0x0284c7,
        emissiveIntensity: 0.2,
        wireframe: wireframe
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.z = 0.045;

      productGroup.add(frameMesh);
      productGroup.add(glassMesh);

    } else if (productId === 'inversor') {
      // 3D Inverter Box
      const boxGeo = new THREE.BoxGeometry(1.6, 2.0, 0.6);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.7,
        roughness: 0.3,
        wireframe: wireframe
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);

      // LCD Screen Panel
      const screenGeo = new THREE.PlaneGeometry(0.8, 0.5);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.6,
        wireframe: wireframe
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0.4, 0.305);

      productGroup.add(boxMesh);
      productGroup.add(screenMesh);

    } else if (productId === 'bateria') {
      // 3D Wallbox Charger
      const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: wireframe
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);

      // Halo Ring Light
      const haloGeo = new THREE.TorusGeometry(0.75, 0.04, 16, 50);
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.9,
        wireframe: wireframe
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;

      productGroup.add(bodyMesh);
      productGroup.add(haloMesh);

    } else {
      // 3D Smartphone Telemetry
      const phoneGeo = new THREE.BoxGeometry(1.1, 2.2, 0.1);
      const phoneMat = new THREE.MeshStandardMaterial({
        color: 0x020617,
        metalness: 0.9,
        roughness: 0.1,
        wireframe: wireframe
      });
      const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);

      // Screen Display
      const screenGeo = new THREE.PlaneGeometry(1.0, 2.0);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x10b981,
        emissiveIntensity: 0.4,
        wireframe: wireframe
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.z = 0.055;

      productGroup.add(phoneMesh);
      productGroup.add(screenMesh);
    }

    scene.add(productGroup);

    // 4. Mouse Drag Orbit Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      productGroup.rotation.y += deltaMove.x * 0.01;
      productGroup.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 5. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        productGroup.rotation.y += 0.008;
      }

      camera.position.z = 5 / zoomLevel;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [productId, wireframe, autoRotate, zoomLevel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="max-w-5xl w-full bg-[#0B132B] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative grid grid-cols-1 lg:grid-cols-12">
        
        {/* Botão de Fechar Modal */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Lado Esquerdo: Canvas WebGL 3D Interativo */}
        <div className="lg:col-span-7 h-[380px] lg:h-[550px] relative bg-slate-950/80 flex items-center justify-center overflow-hidden">
          
          {/* Instrução de Interatividade */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
            <RotateCw className="size-3.5 animate-spin" />
            <span>Arraste para rotacionar 360° em 3D</span>
          </div>

          {/* Canvas Three.js Container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Barra de Ferramentas de Controle 3D */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl shadow-xl">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                autoRotate ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
              title="Alternar Auto-Rotação"
            >
              <RotateCw className="size-4" />
            </button>

            <button
              onClick={() => setWireframe(!wireframe)}
              className={`p-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                wireframe ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
              title="Alternar Modo Malha 3D (Wireframe)"
            >
              <Layers className="size-4" />
            </button>

            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="size-4" />
            </button>

            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Lado Direito: Especificações HUD Técnicas e Detalhes do Produto */}
        <div className="lg:col-span-5 p-8 space-y-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0B132B]">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <ShieldCheck className="size-3.5" />
              <span>{product.category}</span>
            </span>

            <h3 className="text-2xl font-black text-white leading-tight">{product.name}</h3>
            <p className="text-xs text-amber-400 font-mono font-bold">{product.subtitle}</p>

            <p className="text-slate-300 text-xs leading-relaxed border-t border-slate-800/80 pt-4">
              {product.details}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Ficha Técnica Homologada:
              </span>
              {product.specs.map((spec, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">STATUS: RENDERIZADO VIA THREE.JS WEBGL</span>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                Concluir Imersão
              </button>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default EsolProduct3DViewer;
