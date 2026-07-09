# Manual de Identidade Visual — ESOL Energy

**Versão 2.0 — Julho/2026**
Guia oficial de aplicação da marca ESOL Energy. Este manual é a fonte única de verdade — qualquer material impresso, digital ou audiovisual deve obedecê‑lo.

---

## 1. Filosofia da Marca

**Tagline oficial:** *"Deixe o sol trabalhar por você."*

A ESOL Energy é uma marca de energia solar que combina **confiança institucional** (o azul-marinho) com a **promessa de retorno concreto** (o sol dourado). O glifo do "O" solar é o coração da identidade: um círculo cortado por um raio diagonal — o sol em movimento, energia em curso.

---

## 2. A Assinatura Principal

A assinatura oficial é composta por **três elementos travados**:

1. **Wordmark ESOL** — lettering custom desenhado sob medida para a marca. **Não é uma fonte comercial e não deve ser reproduzido em outra tipografia.** Sempre use o arquivo vetorial fornecido.
2. **Glifo solar** — o "O" dourado com corte diagonal, que substitui a letra "O" de ESOL.
3. **Wordmark ENERGY + tagline** — em cinza slate, alinhados abaixo do ESOL.

> ⚠️ **Wordmark é arte-final travada.** Como o lettering é exclusivo, ele nunca deve ser redesenhado, redigitado em outra fonte ou "reconstituído". Trate os SVGs desta pasta como o único original.

---

## 3. Paleta Oficial

Cores extraídas diretamente do vetor oficial. **Use estes valores exatos** — não aproxime.

| Cor | HEX | RGB | CMYK | Pantone (referência) | Uso |
|---|---|---|---|---|---|
| **Navy Royal** | `#00246B` | `0, 36, 107` | `100, 85, 14, 3` | PMS 287 C | Wordmark ESOL, textos institucionais, fundos escuros |
| **Solar Gold** | `#FFB300` | `255, 179, 0` | `0, 32, 100, 0` | PMS 123 C | Glifo solar, destaques, CTAs |
| **Slate Gray** | `#555555` | `85, 85, 85` | `0, 0, 0, 80` | PMS Cool Gray 10 C | Wordmark ENERGY, tagline, textos secundários |
| **Silver Gray** | `#E5E7EB` | `229, 231, 235` | `10, 6, 6, 0` | PMS Cool Gray 1 C | Versão negativa da marca sobre fundos escuros |
| **Paper** | `#FDFBF6` | `253, 251, 246` | `0, 1, 3, 1` | — | Fundo claro premium (evita branco puro cansativo) |

**Regra de ouro:** o **Solar Gold nunca muda de cor**. Ele é a assinatura visual do sol e não pode ser substituído por laranja, amarelo neon ou dourado metálico.

---

## 4. Tipografia de Apoio

O **wordmark é lettering exclusivo** — não é reproduzível em fonte. Para todos os outros textos (site, app, apresentações, documentos), usamos duas fontes de apoio que já são padrão do produto digital:

| Uso | Fonte | Peso | Onde |
|---|---|---|---|
| **Display / Títulos** | **Sora** | 600, 700 | Headers, chamadas, números grandes |
| **Corpo / UI** | **Inter** | 400, 500, 600 | Parágrafos, botões, formulários, tabelas |

**Fallback impresso:** quando Sora/Inter não estiverem disponíveis (Word, PowerPoint em máquina sem instalação), use **Calibri** para corpo e **Calibri Bold** para títulos. Nunca substitua por Times, Comic Sans ou fontes decorativas.

---

## 5. Variações Oficiais da Logo

Todas as variantes vivem em `public/brand-kit/1. Web-SVG/` (vetorial) e `public/brand-kit/2. Imagens-PNG/` (raster com fundo transparente).

### 5.1 Horizontal (assinatura primária)
| Arquivo | Uso |
|---|---|
| `esol-logo-horizontal.svg` | **Padrão.** Cabeçalhos, propostas, documentos, sites com fundo claro. |
| `esol-logo-horizontal-negative.svg` | Fundos escuros (navy, preto), hero images escuras, rodapés escuros. |

### 5.2 Vertical / Empilhada
| Arquivo | Uso |
|---|---|
| `esol-logo-stacked.svg` | Formatos quadrados: capas de proposta, cover de e‑books, banners quadrados de Instagram. |
| `esol-logo-stacked-negative.svg` | Mesma finalidade, sobre fundos escuros. |

### 5.3 Brandmark (glifo solar isolado)
| Arquivo | Uso |
|---|---|
| `esol-logo-brandmark.svg` | Favicon, avatar de redes sociais, app icon, loading spinner, watermark discreto. |
| `esol-logo-brandmark-white.svg` | Brandmark negativo para camisetas escuras, brindes escuros, apps em dark mode. |

### 5.4 Outline (monocromática)
| Arquivo | Uso |
|---|---|
| `esol-logo-outline.svg` | Gravação a laser, bordado, serigrafia de uma cor, marca d'água discreta, carimbo. |

---

## 6. Ícone da Marca — Decisão Oficial

Após avaliação, a decisão oficial é **manter o glifo "O" (Sol Solar) como ícone único da marca**. Motivos:

1. **Estratégia de marcas globais.** Airbnb (Bélo), Slack (hashtag), Nike (swoosh), Chase (octógono) usam **um único símbolo derivado da assinatura principal** — não criam um segundo ícone. Isso concentra reconhecimento.
2. **Legibilidade em qualquer escala.** O glifo funciona de 16px (favicon) até 6 metros (outdoor) sem perda de identidade.
3. **Coerência semântica.** O corte diagonal do "O" representa o raio solar em movimento — narrativa direta do produto.
4. **Economia de sistema.** Um único brandmark = uma única regra de aplicação, um único ativo para manter, uma única memória visual para o cliente construir.

> **Conclusão:** não criaremos um ícone secundário. O glifo do "O" **é** o ícone da ESOL.

---

## 7. Área de Respiro (Safe Area)

Reserve ao redor da logo um espaço mínimo igual à **altura da letra "E"** do wordmark ESOL. Nenhum elemento (texto, imagem, borda, botão) pode invadir essa área.

```
┌─────────────────────────┐
│   [E]                   │  ← altura E = margem mínima
│   [E]  E · S · O · L    │
│   [E]  ENERGY           │
│   [E]                   │
└─────────────────────────┘
```

---

## 8. Tamanho Mínimo

Para preservar legibilidade do wordmark:

| Aplicação | Tamanho mínimo |
|---|---|
| **Horizontal** (digital) | 120 px de largura |
| **Horizontal** (impresso) | 30 mm de largura |
| **Stacked** (digital) | 96 px de largura |
| **Brandmark** (digital) | 16 px (favicon) |
| **Brandmark** (impresso) | 8 mm |

Abaixo desses tamanhos, use apenas o **brandmark** (glifo O).

---

## 9. Regras por Contexto

### 9.1 Web & App
| Local | Arquivo | Altura recomendada |
|---|---|---|
| Header (fundo claro) | `esol-logo-horizontal.svg` | 40–56 px |
| Header (fundo escuro / hero) | `esol-logo-horizontal-negative.svg` | 48–64 px |
| Proposta (header dark) | `esol-logo-horizontal-negative.svg` | 44–56 px |
| Rodapé | `esol-logo-horizontal-negative.svg` | 40 px |
| Loader / Splash | `esol-logo-brandmark.svg` | 96 px |
| Favicon | `favicon.svg` (glifo) | escalável |

### 9.2 Redes Sociais
| Local | Arquivo |
|---|---|
| Avatar (Instagram, LinkedIn, WhatsApp, Google Business) | `esol-logo-brandmark.png` |
| Capa / banner fundo claro | `esol-logo-horizontal.svg` |
| Post fundo escuro | `esol-logo-horizontal-negative.svg` |
| Story quadrado / carrossel | `esol-logo-stacked.svg` |

### 9.3 Documentos e Impressos
- **Proposta comercial (PDF):** horizontal colorida no cabeçalho, brandmark no rodapé.
- **Cartão de visita:** brandmark grande no verso; assinatura horizontal na frente.
- **Camiseta / uniforme:** brandmark bordado no peito esquerdo; horizontal negativa nas costas.
- **Envelope / papel timbrado:** horizontal no topo, brandmark discreto como marca d'água.
- **Gráfica offset:** exportar SVG → PDF/X-1a e informar as cores **CMYK** e **Pantone** desta tabela.

---

## 10. Práticas Proibidas

Absolutamente proibido:

1. **Distorcer** — nunca esticar, comprimir ou rotacionar a logo.
2. **Redigitar o wordmark** — não é uma fonte, é lettering. Nunca refaça em Arial, Montserrat, etc.
3. **Trocar a cor do sol** — permanece `#FFB300`. Exceção única: o brandmark-white monocromático autorizado.
4. **Sombras, contornos, gradientes** que não sejam os oficiais deste kit.
5. **Aplicar a versão colorida sobre fundos escuros** — sempre usar a versão negativa.
6. **Cortar, mascarar ou "estilizar"** a logo com fotos, texturas ou molduras.
7. **Trocar a proporção** entre glifo e wordmark.
8. **Colocar texto dentro da área de respiro**.
9. **Usar sobre fundo fotográfico "sujo"** sem um retângulo/blur de proteção.
10. **Salvar em JPG com fundo branco** quando o material exigir fundo transparente — sempre use SVG ou PNG.

---

## 11. Estrutura de Arquivos

```
public/brand-kit/
  ├── MANUAL_DE_USO.md              ← este documento (fonte de verdade)
  ├── MANUAL_DE_MARCA.pdf           ← versão apresentável para clientes/gráficas
  ├── 1. Web-SVG/                   ← vetor escalável (web, app, gráfica offset)
  │   ├── esol-logo-horizontal.svg
  │   ├── esol-logo-horizontal-negative.svg
  │   ├── esol-logo-stacked.svg
  │   ├── esol-logo-stacked-negative.svg
  │   ├── esol-logo-brandmark.svg
  │   ├── esol-logo-brandmark-white.svg
  │   └── esol-logo-outline.svg
  └── 2. Imagens-PNG/               ← raster transparente (Canva, PowerPoint, redes)
      ├── esol-logo-horizontal.png
      ├── esol-logo-horizontal-negative.png
      ├── esol-logo-stacked.png
      ├── esol-logo-stacked-negative.png
      ├── esol-logo-brandmark.png
      ├── esol-logo-brandmark-white.png
      └── esol-logo-outline.png
```

---

## 12. Contato da Marca

Qualquer aplicação fora dos casos previstos neste manual deve ser aprovada pela liderança da ESOL Energy antes da veiculação. Em caso de dúvida, **use sempre a assinatura horizontal colorida sobre fundo claro** — é a aplicação segura por padrão.
