# 🎼 Manual de Identidade Visual & Diretrizes de Marca (ESOL Energy)

Este é o documento de referência absoluta para a aplicação da marca **ESOL Energy**. Ele rege a identidade visual do ecossistema digital (aplicativo, dashboard, website) e materiais físicos (impressos, vestuário, engenharia de campo), garantindo a solidez e a sofisticação visual de nível internacional.

---

## 🎨 1. A Paleta de Cores Oficiais (Modo Escuro Premium / Neo-Glassmorphism)

O ecossistema digital da ESOL Energy adota o **Modo Escuro Premium** por padrão, baseado no conceito de **Neo-Glassmorphism**. As cores de fundo e superfícies criam um visual moderno, de alta tecnologia e grande impacto estético.

| Nome da Cor | Hexadecimal / RGBA | RGB | Aplicação Principal |
| :--- | :--- | :--- | :--- |
| 🌌 **Background Deep Space**| `#090d16` | `9, 13, 22` | Fundo principal da interface (100% sólido). |
| 🔵 **Navy Blue Glass** | `rgba(17, 24, 39, 0.8)` | `17, 24, 39` | Superfície de Cards Bento com `backdrop-blur-md`. |
| 🔵 **Navy Royal** | `#00246B` | `0, 36, 107` | Cor institucional primária da marca. |
| 🟢 **Glow Emerald** | `#10b981` | `16, 185, 129` | Indicadores de energia ativa e saldos positivos. |
| 🟡 **Solar Gold** | `#fbbf24` | `251, 191, 36` | Destaque solar, royalties e níveis MMN. |
| 🔘 **Slate Gray** | `#555555` | `85, 85, 85` | Textos secundários, legendas e descrições. |
| ⚪ **Silver Gray** | `#E5E7EB` | `229, 231, 235` | Textos principais, números e títulos. |

> [!IMPORTANT]
> **Regra de Fundo Digital:** A cor de fundo padrão de qualquer tela operacional é o **Deep Space (`#090d16`)**. Os cards são formados por painéis de vidro translúcido **Navy Blue Glass** com desfoque de fundo (`backdrop-blur-md`). As divisórias e contornos de cards devem utilizar uma borda sólida finíssima de `1px` em branco translúcido (`rgba(255, 255, 255, 0.08)`).

---

## 📐 2. Grid e Estrutura de Espaçamento (Bento System)

Para transmitir solidez e exatidão, a interface deve seguir uma lógica matemática rígida de alinhamento com base na unidade de **8 pixels** (Grid de 8px):

*   **Bordas e Cantos (Border Radius):**
    *   *Cards de Dashboard e Painéis:* Arredondamento elegante e moderno de **12px** a **16px** no máximo.
    *   *Inputs, Tags e Botões:* Arredondamento padrão de **8px**.
*   **Bordas Táteis:**
    *   Cards de dashboard devem utilizar bordas sólidas finas de `1px` com cor de divisão suave `#E5E7EB` com 8% de opacidade para delimitar e dar profundidade física sem poluir a interface.
*   **Sombras e Brilhos (Glow Effects):**
    *   Permite-se o uso controlado de efeitos de brilho néon suave em elementos ativos e comissões pendentes:
        *   `box-shadow: 0 0 15px rgba(16, 185, 129, 0.15)` (para elementos ativos verdes).
        *   `box-shadow: 0 0 15px rgba(251, 191, 36, 0.15)` (para destaque ouro).

---

## ✍️ 3. Tipografia Institucional (Hierarquia Visual)

A tipografia deve garantir legibilidade impecável para auditorias financeiras e rapidez de escaneamento em campo.

1.  **Títulos e Headings (Marca e Telas):** Fonte **Outfit** (Google Fonts)
    *   Utilizar peso *Medium* (500) ou *Semi-Bold* (600) na cor Silver Gray (`#E5E7EB`).
2.  **Corpo de Texto, Dados e Tabelas:** Fonte **Inter** (Google Fonts)
    *   Utilizar peso *Regular* (400) na cor Slate Gray (`#555555`) para textos gerais e *Medium* (500) na cor Silver Gray (`#E5E7EB`) para números e dados.

---

## 🚫 4. Práticas Proibidas (Brand Integrity)

1.  **Não Deformar:** Nunca redimensione ou distorça o logotipo fora de sua proporção original.
2.  **Não utilizar degradês complexos no fundo:** O fundo do aplicativo deve ser o tom sólido Deep Space (`#090d16`).
3.  **Não alterar as cores do sol:** O círculo solar dourado deve sempre permanecer amarelo/ouro `#FFB300` ou `#fbbf24`.
4.  **Não utilizar fontes decorativas:** É terminantemente proibido o uso de fontes de fantasia ou caligráficas na interface operacional.
5.  **Não exagerar nos brilhos:** Os efeitos de brilho nas bordas devem ser extremamente discretos e aplicados apenas a elementos ativos do sistema.
