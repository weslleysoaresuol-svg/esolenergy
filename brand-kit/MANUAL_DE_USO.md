# 🎼 Manual de Identidade Visual & Diretrizes de Marca (ESOL Energy)

Este é o documento de referência absoluta para a aplicação da marca **ESOL Energy**. Ele rege a identidade visual do ecossistema digital (aplicativo, dashboard, website) e materiais físicos (impressos, vestuário, engenharia de campo), garantindo a solidez de grande empresa multinacional.

---

## 🎨 1. A Paleta de Cores Oficiais (Tema Claro Corporativo)

Para transmitir o visual corporativo limpo e de altíssima legibilidade das maiores empresas globais de energia e fintech (estilo Solarz e Solfácil), o ecossistema digital da ESOL Energy adota o **Tema Claro Premium** por padrão.

| Nome da Cor | Hexadecimal | RGB | CMYK | Pantone (Coated) | Aplicação Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ⚪ **Background Clean** | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | - | Fundo principal da interface (100% sólido). |
| 🔘 **Silver Gray** | `#F3F4F6` | `243, 244, 246` | `5, 3, 3, 0` | PMS Cool Gray 1 C | Fundo de Cards Bento, tabelas e inputs. |
| 🔵 **Navy Royal** | `#00246B` | `0, 36, 107` | `100, 85, 14, 3` | PMS 287 C | Cor da marca, títulos, cabeçalhos e botões primários. |
| 🟡 **Solar Gold** | `#FFB300` | `255, 179, 0` | `0, 32, 100, 0` | PMS 123 C | Destaque solar, royalties e níveis MMN. |
| ⬛ **Slate Gray** | `#555555` | `85, 85, 85` | `0, 0, 0, 80` | PMS Cool Gray 10 C | Textos secundários, legendas e descrições. |

> [!IMPORTANT]
> **Regra de Fundo Digital:** A cor de fundo padrão de qualquer tela operacional é o **Branco Puro (`#FFFFFF`)** sólido. Cards, painéis e elementos do Bento Grid utilizam a cor **Silver Gray (`#F3F4F6`)** para criar contraste físico limpo. É proibido o uso de tons escuros pesados como fundo geral do aplicativo.

---

## 📐 2. Grid e Estrutura de Espaçamento (Bento System)

Para transmitir solidez e exatidão, a interface deve seguir uma lógica matemática rígida de alinhamento com base na unidade de **8 pixels** (Grid de 8px):

*   **Bordas e Cantos (Border Radius):**
    *   *Cards de Dashboard e Painéis:* Arredondamento elegante e discreto de **8px** a **12px** no máximo.
    *   *Inputs, Tags e Botões:* Arredondamento padrão de **6px**.
*   **Bordas Táteis:**
    *   Cards de dashboard devem utilizar bordas sólidas finas de `1px` com cor de divisão suave `#E5E7EB` para delimitar e dar profundidade física sem poluir a interface.
*   **Sombras e Profundidade:**
    *   Utilizar sombras neutras e muito suaves para criar relevo físico real sobre o fundo branco:
        *   `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`

---

## ✍️ 3. Tipografia Institucional (Hierarquia Visual)

A tipografia deve garantir legibilidade impecável para auditorias financeiras e rapidez de escaneamento em campo.

1.  **Títulos e Headings (Marca e Telas):** Fonte **Outfit** (Google Fonts)
    *   Utilizar peso *Medium* (500) ou *Semi-Bold* (600) na cor Navy Royal (`#00246B`).
2.  **Corpo de Texto, Dados e Tabelas:** Fonte **Inter** (Google Fonts)
    *   Utilizar peso *Regular* (400) na cor Slate Gray (`#555555`) para textos gerais e *Medium* (500) na cor Navy Royal (`#00246B`) para números e dados.

---

## 🚫 4. Práticas Proibidas (Brand Integrity)

1.  **Não Deformar:** Nunca redimensione ou distorça o logotipo fora de sua proporção original.
2.  **Não Utilizar degradês no fundo:** O fundo do aplicativo deve ser o tom sólido branco, mantendo a sobriedade.
3.  **Não alterar as cores do sol:** O círculo solar dourado deve sempre permanecer amarelo/ouro `#FFB300`.
4.  **Não utilizar fontes decorativas:** É terminantemente proibido o uso de fontes de fantasia ou caligráficas na interface operacional.
5.  **Não utilizar fundos escuros pesados:** Manter a interface 100% clara e limpa, facilitando o uso sob a luz do sol no campo.
