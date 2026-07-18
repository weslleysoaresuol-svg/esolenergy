# 🎼 Manual de Identidade Visual & Diretrizes de Marca (ESOL Energy)

Este é o documento de referência absoluta para a aplicação da marca **ESOL Energy**. Ele rege a identidade visual do ecossistema digital (aplicativo, dashboard, website) e materiais físicos (impressos, vestuário, engenharia de campo), garantindo a solidez institucional e a consistência estética de uma grande corporação multinacional.

---

## 🎨 1. A Paleta de Cores Institucionais

A paleta de cores da ESOL Energy representa a união da sobriedade corporativa com a energia solar ativa. A cor de fundo principal dos sistemas digitais deve basear-se nos tons oficiais de Navy Royal, eliminando decorações galácticas ou texturas artificiais.

| Nome da Cor | Hexadecimal | RGB | CMYK | Pantone (Coated) | Aplicação Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🔵 **Navy Royal** | `#00246B` | `0, 36, 107` | `100, 85, 14, 3` | PMS 287 C | Cor da marca, botões primários e identidade. |
| 🌌 **Dark Navy** | `#001236` | `0, 18, 54` | `100, 90, 35, 30` | PMS 295 C | **Fundo sólido** de dashboards e interfaces. |
| 🟡 **Solar Gold** | `#FFB300` | `255, 179, 0` | `0, 32, 100, 0` | PMS 123 C | Destaque solar, royalties e níveis MMN. |
| 🔘 **Slate Gray** | `#555555` | `85, 85, 85` | `0, 0, 0, 80` | PMS Cool Gray 10 C | Textos secundários, legendas e descrições. |
| ⚪ **Silver Gray** | `#E5E7EB` | `229, 231, 235` | `10, 6, 6, 0` | PMS Cool Gray 1 C | Textos principais, fundos claros e bordas. |

> [!IMPORTANT]
> **Regra de Fundo Digital:** A cor de fundo padrão de qualquer tela operacional escura do sistema (desktop ou mobile) é o **Dark Navy (`#001236`)** em estado sólido. É estritamente proibido o uso de degradês espaciais com estrelas, nebulosas ou brilhos coloridos secundários que comprometam a sobriedade empresarial.

---

## 📐 2. Grid e Estrutura de Espaçamento (Bento System)

Para transmitir solidez, a interface deve seguir uma lógica matemática rígida de alinhamento com base na unidade de **8 pixels** (Grid de 8px):

```
┌────────────────────────────────────────────────────────┐
│  Margem Externa: 24px (Desktop) / 16px (Mobile)        │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │ Card Bento (1/2)       │   │ Card Bento (1/2)       │ │
│  │ GAP interno: 16px     │   │                       │ │
│  └───────────────────────┘   └───────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

*   **Bordas e Cantos (Border Radius):**
    *   *Cards de Dashboard e Painéis:* Arredondamento elegante e discreto de **8px** a **12px** no máximo.
    *   *Inputs, Tags e Botões:* Arredondamento padrão de **6px**.
    *   **Proibição:** É vetado o uso de botões totalmente circulares (completamente arredondados) para elementos de ação corporativa.
*   **Bordas Táteis:**
    *   Cards de dashboard devem utilizar bordas sólidas finas de `1px` com cor `#E5E7EB` e opacidade reduzida a 8% (RGBA: `229, 231, 235, 0.08`) sobre o fundo Dark Navy.
*   **Sombras e Profundidade:**
    *   Evitar sombras coloridas ("neon glows"). Utilizar sombras neutras e suaves para criar relevo físico real:
        *   `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`

---

## ✍️ 3. Tipografia Institucional (Hierarquia Visual)

A tipografia deve garantir legibilidade impecável para auditorias financeiras e rapidez de escaneamento em campo.

1.  **Títulos e Headings (Marca e Telas):** Fonte **Outfit** (Google Fonts)
    *   Utilizar peso *Medium* (500) ou *Semi-Bold* (600) para cabeçalhos e títulos de seção.
2.  **Corpo de Texto, Dados e Tabelas:** Fonte **Inter** (Google Fonts)
    *   Utilizar peso *Regular* (400) para textos gerais e *Medium* (500) para números e rótulos de dados.

### 📋 Escala de Fontes do Sistema:

| Nível | Família | Tamanho (px) | Altura de Linha (Line-Height) | Peso | Caso de Uso |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **H1** | Outfit | 32px | 1.25 | Semi-Bold (600) | Título principal de telas |
| **H2** | Outfit | 24px | 1.30 | Medium (500) | Cabeçalho de Cards Bento |
| **H3** | Outfit | 18px | 1.35 | Medium (500) | Rótulo de seções menores |
| **Body** | Inter | 14px | 1.50 | Regular (400) | Textos, parágrafos e termos |
| **Data** | Inter | 16px | 1.40 | Medium (500) | Exibição de valores (R$) e dados |
| **Caption** | Inter | 12px | 1.40 | Regular (400) | Legendas e metadados de ledger |

---

## 🛡️ 4. Zona de Exclusão e Aplicação do Logotipo

Para preservar a legibilidade e a força da marca, o logotipo da ESOL Energy deve sempre manter uma área livre de interferências ao redor (Zona de Exclusão), equivalente a **1/3 da altura do símbolo do sol (X)**:

```
    ┌───────────────────────────────────────────┐
    │                 ZONA EXCLUSÃO             │
    │      ┌─────────────────────────────┐      │
    │      │    [SOL DOURADO] ESOL       │      │
    │      └─────────────────────────────┘      │
    │                                           │
    └───────────────────────────────────────────┘
```

*   **Navbar Superior Clara (Header):** Usar [`esol-logo-horizontal.svg`](file:///d:/Projetos%20Lovable/Esol%20Energy/esolenergy/brand-kit/1. Web-SVG/esol-logo-horizontal.svg) (azul Navy Royal corporativo com sol dourado).
*   **Navbar Superior Escura (Dashboard):** Usar [`esol-logo-horizontal-negative.svg`](file:///d:/Projetos%20Lovable/Esol%20Energy/esolenergy/brand-kit/1. Web-SVG/esol-logo-horizontal-negative.svg) (letras brancas em Silver Gray com sol dourado).

---

## 🚫 5. Práticas Proibidas (Brand Integrity)

1.  **Não Deformar:** Nunca redimensione ou distorça o logotipo fora de sua proporção original.
2.  **Não Utilizar degradês no fundo:** O fundo do aplicativo deve ser o tom sólido Dark Navy (`#001236`), mantendo a sobriedade.
3.  **Não alterar as cores do sol:** O círculo solar dourado deve sempre permanecer amarelo/ouro `#FFB300`.
4.  **Não utilizar fontes decorativas:** É terminantemente proibido o uso de fontes de fantasia ou caligráficas na interface operacional.
5.  **Não utilizar sombras neon:** Sombras brilhantes coloridas nas bordas dos componentes descaracterizam o aspecto profissional e corporativo do produto.
