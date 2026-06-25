
# Sistema de Propostas Solares Esol Energy

Vou implementar um motor completo de propostas baseado em inteligência comercial do mercado solar brasileiro (Sun Brasil, Solfácil, Portal Solar, EDP, Aldo Solar).

## 1. Inteligência Comercial (parâmetros base do mercado BR 2025)

**Dimensionamento (HSP - Horas de Sol Pico por região):**
- Norte: 4,8 / Nordeste: 5,5 / Centro-Oeste: 5,3 / Sudeste: 5,0 / Sul: 4,6
- Fórmula: `kWp = (consumo_kWh_mês ÷ 30 ÷ HSP) ÷ 0,80` (perdas)
- Área: ~6 m²/kWp (módulos 550W bifaciais)

**Preços de referência (R$/Wp - média mercado BR):**
- Residencial até 5 kWp: R$ 4,50/Wp
- Residencial 5-10 kWp: R$ 4,10/Wp
- Comercial 10-30 kWp: R$ 3,70/Wp
- Comercial 30-75 kWp: R$ 3,30/Wp
- Industrial 75+ kWp: R$ 2,90/Wp

**Economia/Payback:**
- Geração mensal estimada: `kWp × HSP × 30 × 0,80`
- Economia mensal: `geração × tarifa_kWh` (default R$ 0,95)
- Payback: `investimento ÷ (economia × 12)`
- Vida útil: 25 anos / Garantia inversor: 10 anos / Módulos: 12 anos defeito + 25 performance

**Estrutura de custos (motor admin):**
- Equipamentos (módulos + inversor + estrutura + cabos): ~60% do custo
- Mão de obra/instalação: ~12%
- Frete: ~3% (variável por região)
- Impostos (Simples ~6%, projeto ART): ~8%
- Equipe comercial/comissão parceiro: ~7%
- Margem alvo: ~14%

## 2. Banco de Dados (nova migration)

**Tabelas novas:**
- `propostas`: id, codigo_publico (token), parceiro_id, cliente_id (FK), titulo, status (rascunho/enviada/aceita/recusada/expirada), consumo_kwh, tarifa_kwh, estado, tipo_instalacao (residencial/comercial/industrial), kwp_sistema, geracao_mensal, economia_mensal, economia_25_anos, payback_meses, area_necessaria, qtd_modulos, potencia_modulo, qtd_inversores, potencia_inversor, preco_total, preco_por_wp, validade_dias, observacoes, aceita_em, recusada_em, visualizada_em, expires_at
- `proposta_clientes`: associação N-N (proposta pode ir para múltiplos clientes)
- `parametros_comerciais`: linha única editável pelo admin (HSP por região, R$/Wp por faixa, % custos, margem alvo, tarifa default)
- `proposta_eventos`: log de visualização, aceite, recusa (com IP/user-agent)

**Grants + RLS:** parceiros veem só suas propostas; admin vê todas e edita; clientes acessam via token público (sem auth).

## 3. Rotas e Fluxo

**Parceiro/Admin (autenticado):**
- `/app/propostas` — lista de propostas com filtros (status, cliente, período)
- `/app/propostas/nova` — wizard de 4 passos:
  1. Selecionar cliente(s) já cadastrado(s) ou criar novo
  2. Consumo (kWh/mês), estado, tarifa, tipo instalação
  3. **Cálculo automático** (parceiro) ou **editável** (admin): kWp, equipamentos, preço
  4. Revisão + observações + gerar link
- `/app/propostas/$id` — detalhes, status, link público, botões WhatsApp/Email/PDF
- `/app/metricas` (admin only) — dashboard com: propostas geradas/aceitas/conversão, ticket médio, custos vs. margem real, projeção mensal, breakdown por parceiro
- `/app/parametros` (admin only) — editar tabela R$/Wp, HSP, % custos, margem alvo

**Cliente (público, sem login):**
- `/proposta/$codigo` — página branded de alta conversão com:
  - Hero co-branded (logo Esol + foto/nome do consultor)
  - Cliente nome em destaque
  - Resumo do sistema (kWp, módulos, área, geração)
  - **Economia visual** (gráfico 25 anos, payback)
  - Equipamentos detalhados
  - Investimento + condições
  - Botões grandes: ✅ Aceitar | ❌ Recusar | 📄 Baixar PDF | 💬 Falar com consultor (wa.me)
  - Selos de confiança, garantias, FAQ
  - Registra visualização ao abrir

## 4. PDF e Compartilhamento

- PDF gerado client-side com `jspdf` + `html2canvas` (renderiza a própria página da proposta)
- Botão **WhatsApp**: `wa.me/55<telefone>?text=` com mensagem pronta + link
- Botão **Email**: abre cliente de email padrão (`mailto:`) por enquanto
- Copiar link para área de transferência

## 5. Dashboard de Métricas (Admin)

Cards e gráficos:
- Total propostas (mês/ano) + taxa de conversão
- Receita projetada vs. realizada
- Ticket médio por tipo (residencial/comercial)
- Margem real por proposta (preço − custos parametrizados)
- Top parceiros por conversão
- Análise de capacidade: kWp vendidos vs. capacidade instaladores
- Custos consolidados (frete, impostos, equipe) configuráveis

## Detalhes técnicos

- Tudo em `createServerFn` autenticado para CRUD de propostas
- Rota pública `/proposta/$codigo` consulta via server fn pública usando cliente publishable + RLS `TO anon` em `propostas` (só colunas seguras, filtrado por `codigo_publico` e `expires_at > now()`)
- Componente `PropostaPublica` reutilizado para visualização autenticada e pública
- Token: `gen_random_uuid()` no insert
- Validade default: 15 dias (expires_at)
- PDF gerado on-demand no clique (sem armazenamento)
- Branding: cores Esol + foto do parceiro do `profiles.avatar_url`

## Arquivos a criar/editar

**Criar:**
- `supabase/migrations/<ts>_propostas_system.sql`
- `src/lib/proposta-calc.ts` (motor de cálculo)
- `src/lib/propostas.functions.ts` (server fns)
- `src/components/PropostaView.tsx` (visualização reutilizável)
- `src/components/PropostaPDF.tsx` (export PDF)
- `src/routes/app.propostas.tsx` (lista)
- `src/routes/app.propostas.nova.tsx` (wizard)
- `src/routes/app.propostas.$id.tsx` (detalhe)
- `src/routes/app.metricas.tsx` (admin)
- `src/routes/app.parametros.tsx` (admin)
- `src/routes/proposta.$codigo.tsx` (público)

**Editar:**
- `src/routes/app.tsx` — adicionar menus Propostas, Métricas, Parâmetros
- `package.json` — adicionar `jspdf`, `html2canvas`, `recharts` (já pode estar)

Após aprovação, executo tudo em sequência: migration → libs de cálculo → server fns → componentes → rotas → integração no menu.
