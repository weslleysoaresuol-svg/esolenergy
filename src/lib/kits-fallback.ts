// Cadastro estático de fallback de kits reais e financeiras
// Garante que o app funcione perfeitamente mesmo que as migrações SQL ainda não tenham sido aplicadas no Supabase

export interface KitSolar {
  id: string;
  faixa: string;
  nome: string;
  potencia_kwp: number;
  quantidade_modulos: number;
  fabricante_modulos: string;
  inversor: string;
  potencia_modulo_w: number;
  tecnologia_modulo: string;
  eficiencia_modulo: number;
  tipo_inversor: string;
  garantia_modulos_anos: number;
  garantia_inversor_anos: number;
  preco: number;
  destaque: boolean;
  consumo_kwh_min: number;
  consumo_kwh_max: number;
  imagem_kit_url: string;
  ativo: boolean;
}

export const KITS_FALLBACK: KitSolar[] = [
  {
    id: "kit-aldo-165",
    faixa: "residencial_pequeno",
    nome: "Kit Aldo Solar 1.65 kWp | 3x Jinko 550W | Deye Microinversor 1.6kW",
    potencia_kwp: 1.65,
    quantidade_modulos: 3,
    fabricante_modulos: "Jinko Solar Tiger Neo N-type 550W",
    inversor: "Deye SUN1600G3-US-220 (Microinversor)",
    potencia_modulo_w: 550,
    tecnologia_modulo: "Monocristalino N-Type TOPCon",
    eficiencia_modulo: 22.5,
    tipo_inversor: "Microinversor",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 12,
    preco: 6900.00,
    destaque: false,
    consumo_kwh_min: 80,
    consumo_kwh_max: 160,
    imagem_kit_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-aldo-220",
    faixa: "residencial_pequeno",
    nome: "Kit Aldo Solar 2.20 kWp | 4x Canadian 550W | Deye On-Grid 2kW",
    potencia_kwp: 2.20,
    quantidade_modulos: 4,
    fabricante_modulos: "Canadian Solar HiKu6 Mono 550W",
    inversor: "Deye SUN-2K-G04-P",
    potencia_modulo_w: 550,
    tecnologia_modulo: "Monocristalino PERC",
    eficiencia_modulo: 21.8,
    tipo_inversor: "String On-Grid",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 9100.00,
    destaque: false,
    consumo_kwh_min: 150,
    consumo_kwh_max: 240,
    imagem_kit_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-aldo-330",
    faixa: "residencial_pequeno",
    nome: "Kit Aldo Solar 3.30 kWp | 6x Jinko 550W | Deye On-Grid 3kW ★",
    potencia_kwp: 3.30,
    quantidade_modulos: 6,
    fabricante_modulos: "Jinko Solar Tiger Neo N-type 550W",
    inversor: "Deye SUN-3K-G04-P",
    potencia_modulo_w: 550,
    tecnologia_modulo: "Monocristalino N-Type TOPCon",
    eficiencia_modulo: 22.5,
    tipo_inversor: "String On-Grid",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 12300.00,
    destaque: true,
    consumo_kwh_min: 220,
    consumo_kwh_max: 350,
    imagem_kit_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-aldo-550",
    faixa: "residencial_grande",
    nome: "Kit Aldo Solar 5.50 kWp | 10x Canadian 550W | Deye On-Grid 5kW ★",
    potencia_kwp: 5.50,
    quantidade_modulos: 10,
    fabricante_modulos: "Canadian Solar HiKu6 Mono 550W",
    inversor: "Deye SUN-5K-G04-P",
    potencia_modulo_w: 550,
    tecnologia_modulo: "Monocristalino PERC",
    eficiencia_modulo: 21.8,
    tipo_inversor: "String On-Grid",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 18900.00,
    destaque: true,
    consumo_kwh_min: 400,
    consumo_kwh_max: 580,
    imagem_kit_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-aldo-880",
    faixa: "residencial_grande",
    nome: "Kit Aldo Solar 8.80 kWp | 16x Jinko 550W | Deye On-Grid 8kW ★",
    potencia_kwp: 8.80,
    quantidade_modulos: 16,
    fabricante_modulos: "Jinko Solar Tiger Neo N-type 550W",
    inversor: "Deye SUN-8K-G04-P",
    potencia_modulo_w: 550,
    tecnologia_modulo: "Monocristalino N-Type TOPCon",
    eficiencia_modulo: 22.5,
    tipo_inversor: "String On-Grid",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 28700.00,
    destaque: true,
    consumo_kwh_min: 650,
    consumo_kwh_max: 920,
    imagem_kit_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-sou-500",
    faixa: "residencial_grande",
    nome: "Kit Sou Energy 5.00 kWp | 9x Astronergy 555W | Solis On-Grid 5kW ★",
    potencia_kwp: 5.00,
    quantidade_modulos: 9,
    fabricante_modulos: "Astronergy Astro 5s Mono 555W",
    inversor: "Solis S6-GR1P5K",
    potencia_modulo_w: 555,
    tecnologia_modulo: "Monocristalino TOPCon",
    eficiencia_modulo: 22.1,
    tipo_inversor: "String On-Grid",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 17350.00,
    destaque: true,
    consumo_kwh_min: 380,
    consumo_kwh_max: 550,
    imagem_kit_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-sou-2220",
    faixa: "comercial_pequeno",
    nome: "Kit Sou Energy Comercial 22.20 kWp | 40x Astronergy 555W | Sungrow 20kW ★",
    potencia_kwp: 22.20,
    quantidade_modulos: 40,
    fabricante_modulos: "Astronergy Astro 5s Mono 555W",
    inversor: "Sungrow SG20RT Trifásico",
    potencia_modulo_w: 555,
    tecnologia_modulo: "Monocristalino TOPCon",
    eficiencia_modulo: 22.1,
    tipo_inversor: "String On-Grid Trifásico",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 67900.00,
    destaque: true,
    consumo_kwh_min: 1500,
    consumo_kwh_max: 2300,
    imagem_kit_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    ativo: true
  },
  {
    id: "kit-aldo-4950",
    faixa: "comercial_grande",
    nome: "Kit Aldo Solar Comercial 49.50 kWp | 90x Jinko 550W | Sungrow 40kW ★",
    potencia_kwp: 49.50,
    quantidade_modulos: 90,
    fabricante_modulos: "Jinko Solar Tiger Neo N-type 550W",
    inversor: "Sungrow SG40CX Trifásico",
    potencia_modulo_w: 550,
    tecnologia_modulo: "Monocristalino N-Type TOPCon",
    eficiencia_modulo: 22.5,
    tipo_inversor: "String On-Grid Trifásico",
    garantia_modulos_anos: 25,
    garantia_inversor_anos: 10,
    preco: 148000.00,
    destaque: true,
    consumo_kwh_min: 3800,
    consumo_kwh_max: 5400,
    imagem_kit_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    ativo: true
  }
];

export const FINANCEIRAS_FALLBACK = [
  { id: "fin-solfacil", nome: "Solfácil", taxa_juros_mes: 0.99, prazo_maximo_meses: 84, taxa_aprovacao_media: 88, ativo: true },
  { id: "fin-bv", nome: "BV Financeira Solar", taxa_juros_mes: 1.19, prazo_maximo_meses: 60, taxa_aprovacao_media: 75, ativo: true },
  { id: "fin-santander", nome: "Santander Solar", taxa_juros_mes: 1.35, prazo_maximo_meses: 72, taxa_aprovacao_media: 70, ativo: true },
  { id: "fin-sicredi", nome: "Sicredi Energia Verde", taxa_juros_mes: 0.89, prazo_maximo_meses: 84, taxa_aprovacao_media: 80, ativo: true }
];
