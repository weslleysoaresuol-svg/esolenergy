---
name: lighthouse-optimizer
description: Estratégias e padrões de codificação voltados para otimização de performance (Core Web Vitals), acessibilidade e SEO em aplicações web dinâmicas.
---

# ⚡ Protocolo de Otimização de Performance e Core Web Vitals

Esta skill reúne as melhores práticas de carregamento e renderização web para manter a aplicação rápida e com pontuação máxima no Google Lighthouse.

---

## 📈 1. Combate ao CLS (Cumulative Layout Shift)

*   **Dimensões de Imagem:** Nunca use tags `<img>` sem declarar `aspect-ratio` ou classes de altura/largura definidas (ex: `aspect-[4/3] w-full h-full object-cover`), garantindo que o navegador reserve o espaço físico da imagem antes dela carregar.
*   **Fontes do Google:** Use propriedades `font-display: swap` para carregar fontes externas sem bloquear a renderização dos textos.
*   **Conteúdos Condicionais:** Ao expandir cards ou menus dinâmicos, prefira animações com `Framer Motion` controlando a altura de `0` a `auto` de forma suave, em vez de saltos secos de renderização de elemento.

---

## 🚀 2. Otimização de LCP (Largest Contentful Paint)

*   **Carregamento de Imagens Hero:** Marque imagens principais de topo de página com a propriedade de pré-carregamento do navegador para carregar antes de scripts menores.
*   **Minificação de SVGs:** Evite colocar arquivos brutos gigantescos de SVG diretamente no código JSX se não forem animados; converta-os em assets importados para permitir compressão.

---

## 🎨 3. Acessibilidade (a11y) e SEO

*   **Contraste de Cores:** Garanta que textos sobre fundos coloridos tenham taxas de contraste em conformidade com as diretrizes WCAG AA (mínimo de `4.5:1`).
*   **Aria Roles:** Interactive elements sem tags semânticas (como `divs` que servem de botões) devem conter `role="button"` e tratadores de teclado para navegação por tabulação.
