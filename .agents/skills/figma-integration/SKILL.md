---
name: figma-integration
description: Habilidade para ler, interpretar e traduzir designs do Figma (estruturas de nós, estilos e layouts) em código React + Tailwind CSS de altíssima fidelidade.
---

# 🎨 Figma-to-Code Translation Protocol (V6 Premium)

Esta skill orienta o agente na conversão direta de especificações de design do Figma em layouts limpos e responsivos no React.

---

## 📐 1. Mapeamento de Layout (Figma Autolayout vs. Tailwind CSS)

Ao traduzir estruturas de frames com Auto Layout do Figma para classes utilitárias do Tailwind:

*   **Direction (Horizontal/Vertical):**
    *   `Horizontal` -> `flex flex-row` ou `grid grid-cols-N`
    *   `Vertical` -> `flex flex-col`
*   **Gap (Espaçamento entre itens):**
    *   Mapeie o valor de `itemSpacing` em pixel diretamente para a escala de `gap-X` do Tailwind (ex: `gap-4` para 16px, `gap-6` para 24px).
*   **Padding (Preenchimento interno):**
    *   `horizontalPadding` -> `px-X`
    *   `verticalPadding` -> `py-X`
*   **Alignment (Alinhamento de nós):**
    *   `MIN` (Left/Top) -> `items-start` ou `justify-start`
    *   `CENTER` -> `items-center` ou `justify-center`
    *   `MAX` (Right/Bottom) -> `items-end` ou `justify-end`
    *   `SPACE_BETWEEN` -> `justify-between`

---

## 🎨 2. Tokens de Design e CSS Variables

Sempre conecte as cores do Figma à paleta de marca existente no arquivo `styles.css`:

*   Fills sólidos de Navy Deep do design -> `--navy-deep` ou `bg-navy-deep`
*   Fills de destaque solar -> `--sun` ou `text-sun`
*   Efeitos de Glassmorphism do Figma -> combinando `bg-white/[value] border border-white/[value] backdrop-blur-xl`

---

## 📱 3. Responsividade e Mobile-First

Desenhos do Figma geralmente representam telas específicas (Desktop 1440px ou Mobile 375px). Aplique a adaptação fluida:
*   Mantenha a base móvel (`flex-col`, texto menor, espaçamento justo).
*   Use modificadores de breakpoint do Tailwind (`md:`, `lg:`) para expandir para colunas e textos maiores no desktop.
