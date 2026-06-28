## Escopo

Três frentes integradas, mantendo o schema atual intacto e adicionando o que falta.

### 1. Banco de dados — documentação + tabelas novas

**Documentação (`docs/SCHEMA.md`)** — para o time GitHub/Antigravity:
- Diagrama textual de tabelas, FKs, enums
- Convenções RLS (admin via `has_role`, parceiro via `auth.uid()`)
- Como rodar migrations locais
- Mapa de rotas ↔ tabelas

**Tabelas novas (migration única):**
- `kits_produtos` — catálogo de kits (potência kWp, módulos, inversor, marca, preço, foto, ativo). Editável pelo admin.
- `cotacoes` — cotação rápida de produto. Campos: cliente_id (FK), parceiro_id, kit_id (FK), codigo_publico (uuid), quantidade, preco_unit, preco_total, observacoes, status (rascunho/enviada/convertida_proposta/convertida_pedido/cancelada), pdf_url, expires_at.
- `pedidos` — controle de vendas fechadas. Campos: cliente_id, parceiro_id, origem_id (uuid — cotacao_id ou proposta_id), origem_tipo (cotacao/proposta), numero (serial humano: `PED-2026-0001`), valor_total, status (novo/em_separacao/faturado/expedido/entregue/instalado/concluido/cancelado), forma_pagamento, observacoes.
- `financiamentos` — esteira de aprovação. Campos: pedido_id (FK opcional), proposta_id (FK opcional), cliente_id, parceiro_id, banco, financeira, valor_solicitado, valor_aprovado, parcelas, taxa_juros_am, parcela_mensal, carencia_dias, status (aguardando_documentos/em_analise/pre_aprovado/aprovado/recusado/contrato_assinado/liberado), observacoes_internas, observacoes_cliente, codigo_publico.
- `financiamento_eventos` — log de mudanças de status (quem alterou, quando, nota).
- `timeline_cliente` — feed unificado do cliente: tipo (cotacao/proposta/pedido/financiamento/interacao/contrato), referencia_id, titulo, descricao, criado_por.

Todas com RLS: admin tudo; parceiro só seus registros; `service_role` ALL.

### 2. Cotações rápidas (estilo Sunsbrasil)

**Rota `/app/cotacoes`** — lista com filtros (parceiro, status, cliente).

**Rota `/app/cotacoes/nova`** — modal/página enxuta:
1. Seleciona cliente (existente ou cria inline)
2. Seleciona kit do catálogo (grid de cards: foto + kWp + preço)
3. Quantidade + observações
4. Botão único **Gerar Cotação**

**Página de resultado `/app/cotacoes/$id`** mostra:
- Card do kit (igual Sunsbrasil): foto, especificações, componentes, preço
- 3 botões de ação:
  - 📄 **Baixar PDF** (gera client-side com jsPDF + html2canvas)
  - 🚀 **Gerar Proposta Completa** (cria proposta pré-preenchida no fluxo atual)
  - 🛒 **Gerar Pedido** (cria registro em `pedidos` com origem=cotacao)
- 💬 Compartilhar WhatsApp/Email do link público

**Rota pública `/cotacao/$codigo`** — visualização branded para o cliente baixar PDF.

Toda criação registra evento em `timeline_cliente`.

### 3. Pedidos (novo módulo)

**Rota `/app/pedidos`** — kanban + lista com colunas por status. Admin vê tudo, parceiro só seus.
**Rota `/app/pedidos/$id`** — detalhe com:
- Resumo do produto/proposta de origem
- Mudança de status (admin/parceiro), com log
- Vincular financiamento (botão "Solicitar financiamento")
- Anexos (NF, comprovantes)

### 4. Financiamento (esteira Sunsbrasil)

**Rota `/app/financiamentos`** — lista admin/parceiro com filtros por status.

**Rota `/app/financiamentos/novo`** — vincula a pedido ou proposta existente. Campos iniciais: valor solicitado, banco proposto, parcelas desejadas.

**Rota `/app/financiamentos/$id`** — painel interno (admin/parceiro):
- Form para preencher o que o banco liberou: banco, financeira, valor aprovado, parcelas, taxa de juros, parcela mensal, carência
- Mudança de status com observações
- Botão "Publicar para cliente" → gera link público

**Rota pública `/financiamento/$codigo`** — tela visual de espera/status estilo Sunsbrasil:
- Timeline vertical com etapas (Documentos → Análise → Pré-aprovado → Aprovado → Contrato → Liberado)
- Cards com banco, financeira, parcelas, juros, valor aprovado, parcela mensal
- Animação de "em análise" pulsante quando status = em_analise
- Botão WhatsApp para falar com consultor

Mudanças registram em `financiamento_eventos` + `timeline_cliente`.

### 5. Timeline do cliente

Adiciona aba "Histórico" em `/app/cliente/$id` que lê `timeline_cliente` ordenado por data. Cada evento com ícone/cor por tipo.

## Implementação técnica

- **Migration única** com todos os GRANTs + RLS + triggers de `updated_at`
- **Server fns** em `src/lib/cotacoes.functions.ts`, `pedidos.functions.ts`, `financiamentos.functions.ts` usando `requireSupabaseAuth`
- **RPCs públicas**: `get_cotacao_publica(_codigo)`, `get_financiamento_publico(_codigo)` (security definer, retornam dados sanitizados)
- **Helper** `registrar_timeline(...)` chamado nas server fns
- **Menu lateral** em `src/routes/app.tsx` ganha: Cotações, Pedidos, Financiamentos, Kits (admin)
- **Catálogo de kits**: rota admin `/app/kits` (já existe `app.kits.tsx` — verificar e estender)
- **PDF**: reutiliza jspdf+html2canvas já no projeto
- **Docs**: `docs/SCHEMA.md` + `docs/CONTRIBUTING.md` (workflow GitHub)

## Ordem de execução

1. Migration (cria tudo + RLS + grants + RPCs públicas)
2. Docs no `/docs/`
3. Server functions
4. Rotas admin/parceiro (cotações → pedidos → financiamentos)
5. Rotas públicas (`/cotacao/$codigo`, `/financiamento/$codigo`)
6. Aba timeline no cliente
7. Menu lateral + ícones