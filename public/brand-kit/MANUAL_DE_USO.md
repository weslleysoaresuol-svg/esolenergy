# 🎼 Manual de Identidade Visual & Uso do Brand Kit (ESOL Energy)

Bem-vindo ao **Brand Kit da ESOL Energy**. Este manual orienta desenvolvedores, designers e agências gráficas sobre a aplicação correta e consistente do logotipo e da identidade de marca.

---

## 🎨 1. Tabela de Cores Oficiais (Brand Colors)

| Cor | Hexadecimal (Web/App) | RGB (Telas) | CMYK (Impressos/Gráfica) | Pantone (Referência) |
|---|---|---|---|---|
| **Navy Royal** (Primária) | `#00246B` | `0, 36, 107` | `100, 85, 14, 3` | PMS 287 C |
| **Solar Gold** (Destaque) | `#FFB300` | `255, 179, 0` | `0, 32, 100, 0` | PMS 123 C |
| **Slate Gray** (Textos) | `#555555` | `85, 85, 85` | `0, 0, 0, 80` | PMS Cool Gray 10 C |
| **Silver Gray** (Negativo) | `#E5E7EB` | `229, 231, 235` | `10, 6, 6, 0` | PMS Cool Gray 1 C |

---

## 📐 2. Diretrizes de Uso dos Arquivos

O Brand Kit está estruturado de forma a atender a todas as necessidades digitais e físicas da empresa:

```text
public/brand-kit/
  ├── 1. Web-SVG/       <- Usar em Sites, Aplicativos e animações (Vetor escalável)
  └── 2. Imagens-PNG/   <- Usar no Canva, PowerPoint, Redes Sociais (Fundo transparente)
```

### 📋 Mapeamento de Casos de Uso:

#### A. Para o Site, App e Desenvolvimento Web:
*   **Navbar Superior Clara (Header):** Usar `esol-logo-horizontal.svg` (cor original, largura compacta que valoriza o nome).
*   **Navbar Superior Escura / Proposta V6:** Usar `esol-logo-horizontal-negative.svg` (letras brancas + sol dourado ativo).
*   **Favicon e Loader de Página:** Usar `esol-logo-brandmark.svg`.

#### B. Para Redes Sociais, Canva e Office:
*   **Foto de Perfil (Instagram, LinkedIn, WhatsApp):** Usar `esol-logo-brandmark.png` (sol centrado no tamanho ideal de avatar).
*   **Posts, Banners e Flyers Digitais:** Usar os arquivos da pasta `2. Imagens-PNG/` conforme o contraste do fundo (colorida para fundos claros, negative para fundos escuros).

#### C. Para Gráficas e Impressos (Folders, Panfletos, Cartões de Visita):
*   **Importante:** Os arquivos na pasta `1. Web-SVG/` são vetores matemáticos puros. Eles podem ser importados diretamente para o **Illustrator, Photoshop, CorelDraw ou Canva Pro** e exportados em PDF de alta qualidade para impressão.
*   Ao enviar para a gráfica, informe a tabela de cores **CMYK** (descrita no item 1 deste manual) para garantir fidelidade de cor perfeita.

---

## 🚫 3. Práticas Proibidas (Brand Integrity)
1.  **Não deformar:** Nunca estique ou comprima o logotipo desproporcionalmente.
2.  **Não alterar as fontes:** Não substitua as fontes do logotipo por outras semelhantes.
3.  **Não inverter a cor do sol:** O círculo solar dourado deve sempre permanecer amarelo/ouro `#FFB300` (exceto na versão monocromática branca de marca d'água).
