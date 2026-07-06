---
name: svg-mastery
description: Habilidade especializada em projeto, otimização e animação de gráficos vetoriais complexos (SVGs inline) com performance fluida.
---

# 🌀 SVG Mastering & Animation Protocol (V6 Premium)

Esta skill orienta o agente na construção e animação de vetores integrados ao React.

---

## 🧼 1. Limpeza e Otimização de Caminhos (Paths)

*   **Remover Metadados Inúteis:** Limpar atributos como `xmlns:odm`, `xml:space`, metadados de editores (Figma/Illustrator), estilos CSS inline redundantes e tags vazias.
*   **Precisão Numérica:** Arredondar coordenadas muito longas nos atributos `d` (ex: `100.12345678` -> `100.12`).
*   **Viewport Adequada:** Utilize sempre `viewBox="0 0 W H"` bem calibrado em vez de declarar atributos rígidos de `width` e `height` em pixels. Isso garante responsividade nativa.

---

## ⚡ 2. Animações de Traço (Stroke Dash Animations)

Para criar fluxos de energia ou eletricidade dinâmicos e contínuos em diagramas:
*   Utilize o padrão `strokeDasharray` e anime a propriedade `strokeDashoffset` via CSS ou Framer Motion.
*   Padrão CSS para fluxo infinito:
```css
@keyframes marquee {
  to {
    stroke-dashoffset: -100;
  }
}
.animate-flow-dash {
  animation: marquee 5s linear infinite;
}
```

---

## 🌟 3. Filtros SVG Avançados (Glow, Bloom, Shadow)

*   Utilize `<filter>` com `<feGaussianBlur>` e `<feComposite>` para criar efeitos luminosos sem sobrecarregar a GPU.
*   Evite filtros como `<feTurbulence>` em elementos que ocupam grande parte da viewport móvel devido a gargalos de CPU e falta de suporte a opacidade.
