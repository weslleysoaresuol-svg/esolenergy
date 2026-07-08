# 🎨 Manual de Identidade Visual — ESOL Energy

Guia oficial de aplicação da marca **ESOL Energy** em ambientes digitais, impressos e sociais. Este manual foi atualizado com a **logo vetorizada de alta fidelidade** (VTracer / spline) para garantir nitidez em qualquer escala.

---

## 1. Assinatura Principal

**Assinatura horizontal completa:** `ESOL` + glifo solar no lugar do "O" + wordmark `ENERGY` + tagline *"Deixe o sol trabalhar por você."*

O **glifo solar** (o "O" amarelo cortado por uma linha diagonal) é o elemento mais reconhecível da marca. Ele representa o sol e o movimento da energia. **Este glifo é o brandmark oficial** — usado como favicon, avatar de redes sociais e ícone do app.

---

## 2. Paleta de Cores Oficiais

| Cor | HEX | RGB | CMYK | Pantone |
|---|---|---|---|---|
| **Navy Royal** (primária) | `#172554` | `23, 37, 84` | `100, 85, 14, 3` | PMS 287 C |
| **Solar Gold** (glifo/destaque) | `#F5A623` | `245, 166, 35` | `0, 32, 100, 0` | PMS 130 C |
| **Slate Gray** (ENERGY / tagline) | `#4B5563` | `75, 85, 99` | `0, 0, 0, 70` | PMS Cool Gray 10 C |
| **Silver Gray** (negativo) | `#E5E7EB` | `229, 231, 235` | `10, 6, 6, 0` | PMS Cool Gray 1 C |
| **White** (negativo puro) | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | — |

> O Solar Gold **nunca** deve mudar de cor — é a assinatura visual do sol.

---

## 3. Arquivos e Estrutura

```
public/brand-kit/
  └── 1. Web-SVG/
      ├── esol-logo-horizontal.svg           ← Assinatura completa colorida (vetor)
      ├── esol-logo-horizontal-negative.svg  ← Assinatura completa em branco (vetor)
      ├── esol-logo-brandmark.svg            ← Glifo do sol (favicon/avatar)
      └── esol-logo-brandmark-white.svg      ← Glifo do sol em branco

src/assets/
  ├── esol-logo.png            ← Raster HD colorido (referência)
  ├── esol-logo-white.png      ← Raster HD versão branca
  ├── esol-logo.svg            ← Vetor colorido usado nos componentes
  └── esol-logo-negative.svg   ← Vetor branco usado em fundos escuros

public/
  ├── favicon.svg              ← Glifo do sol (favicon principal, escalável)
  └── favicon.png              ← Fallback PNG 512×512
```

---

## 4. Regras de Aplicação por Contexto

### 4.1 Site & App (Web)
| Local | Arquivo | Tamanho recomendado |
|---|---|---|
| Header (fundo claro) | `esol-logo.svg` colorido | h-10 a h-12 |
| Header (fundo escuro / hero) | `esol-logo-negative.svg` (branco) | h-12 a h-16 |
| Proposta / Cotação (header dark) | `esol-logo-white.png` | h-11 |
| Rodapé | `esol-logo-negative.svg` | h-10 |
| Loader / Splash | `esol-logo-brandmark.svg` | 96px |
| **Favicon** | `favicon.svg` (glifo O) | escalável |

### 4.2 Redes Sociais / Avatares
| Local | Arquivo |
|---|---|
| Avatar Instagram / LinkedIn / WhatsApp | `esol-logo-brandmark.svg` (glifo) |
| Capas / posts fundo claro | `esol-logo-horizontal.svg` |
| Posts fundo escuro | `esol-logo-horizontal-negative.svg` |

### 4.3 Documentos & Impressos
- **Proposta comercial (PDF):** usar a versão vetorial colorida no cabeçalho e o brandmark no rodapé.
- **Cotação / Orçamento:** logo colorida no topo (h ≈ 40px em papel A4).
- **Cartão de visita:** brandmark no verso, assinatura completa na frente.
- **Gráfica:** exportar SVG → PDF vetorial e informar os valores **CMYK** da tabela acima.

---

## 5. Área de Respiro (Safe Area)
Reserve ao redor da logo um espaço mínimo igual à **altura da letra "E"** do wordmark ESOL. Nada de texto, botões ou imagens dentro dessa área.

---

## 6. Práticas Proibidas 🚫
1. Não distorcer, esticar ou rotacionar a logo.
2. Não trocar a fonte do wordmark.
3. Não alterar a cor do sol (permanece **`#F5A623`**), exceto na versão monocromática branca autorizada.
4. Não aplicar sombras, contornos ou gradientes na assinatura principal.
5. Não usar a versão colorida sobre fundos escuros — nesses casos, usar a versão negativa (branca).
6. Não usar o brandmark separado da assinatura em contextos onde a marca ainda não é reconhecida pelo público.

---

## 7. Nota Técnica — Vetorização
Os SVGs deste kit foram gerados a partir da arte oficial via **VTracer (spline mode)** com filtros de speckle e precisão de curva otimizados, garantindo bordas limpas em qualquer resolução (do favicon 16px a outdoors de 6 metros).
