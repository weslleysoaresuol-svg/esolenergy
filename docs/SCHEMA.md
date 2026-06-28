# ESOL Energy — Schema do Banco de Dados

> Documento mantido manualmente. Atualize quando criar/alterar tabelas.
> Banco: PostgreSQL (Supabase) — schema `public`.

## Como contribuir via GitHub / Antigravity / IDE externa

1. Conecte sua IDE ao repo do GitHub (já sincronizado com Lovable).
2. **Alterações de schema:** crie um arquivo em `supabase/migrations/<timestamp>_descricao.sql`. Sempre inclua `GRANT`s e RLS na mesma migração — Supabase Data API não concede grants padrão.
3. **Tipos TypeScript** (`src/integrations/supabase/types.ts`) são auto-gerados pela Lovable após cada migration aprovada. Não edite à mão.
4. **Push** para a branch principal sincroniza tudo de volta ao Lovable.

## Convenções

- **Chave primária:** `id uuid DEFAULT gen_random_uuid()`
- **Timestamps:** `created_at` + `updated_at timestamptz` com trigger `set_updated_at()`
- **RLS:** ativado em toda tabela `public.*`. Política por role:
  - `admin` (via `has_role(auth.uid(),'admin')`) → tudo
  - `corretor`/`parceiro` (via `auth.uid()`) → só seus registros
  - `service_role` → ALL (edge fns/admin)
  - `anon` → apenas via RPCs públicas (`get_*_publica`)
- **Roles** em `public.user_roles`. Nunca colocar role direto em `profiles`.

## Tabelas

### Identidade
| Tabela | Descrição |
|---|---|
| `profiles` | Espelho de `auth.users` (nome, telefone, cidade, avatar, contrato_assinado, onboarding_completo, comissao_percent). |
| `user_roles` | `(user_id, role)` — enum `app_role`: admin, corretor. |
| `partner_invites` | Tokens de convite para virar parceiro. |
| `contratos_parceria` | Contrato assinado do parceiro. |

### CRM
| Tabela | Descrição |
|---|---|
| `clientes` | Lead/cliente do parceiro (`corretor_id` → `auth.users`). Status no enum `cliente_status`. |
| `interacoes` | Log de contato (ligação, visita, email). |
| `timeline_cliente` | **NOVO** — Feed unificado: cotação/proposta/pedido/financiamento/interação/contrato/observação. |

### Catálogo
| Tabela | Descrição |
|---|---|
| `kits_produtos` | **NOVO** — Catálogo de kits vendáveis (kWp, módulos, inversor, preço, foto). Leitura pública; edição só admin. |

### Comercial
| Tabela | Descrição |
|---|---|
| `propostas` | Proposta solar completa com cálculo de dimensionamento (kWp, geração, payback). Link público `/proposta/$codigo`. |
| `proposta_clientes` | N:N proposta → clientes. |
| `proposta_eventos` | Log de visualização/aceite/recusa. |
| `cotacoes` | **NOVO** — Cotação rápida por kit (produto). Link público `/cotacao/$codigo`. Pode virar proposta ou pedido. |
| `pedidos` | **NOVO** — Venda fechada. `numero` gerado: `PED-YYYY-00001`. Origem: cotacao/proposta/manual. |
| `financiamentos` | **NOVO** — Esteira de aprovação. Cliente vê status visual em `/financiamento/$codigo`. |
| `financiamento_eventos` | Log automático de mudanças de status (trigger). |
| `parametros_comerciais` | Parâmetros de cálculo: HSP, R$/Wp, % custos, margens. Admin edita. |

## Enums

- `app_role`: admin, corretor
- `cliente_status`: novo, contato, visita_agendada, proposta_enviada, negociacao, contrato_assinado, instalacao, concluido, perdido
- `imovel_tipo`: residencial, comercial, industrial, rural
- `tipo_instalacao`: residencial, comercial, industrial, rural
- `proposta_status`: rascunho, enviada, visualizada, aceita, recusada, expirada
- `cotacao_status`: rascunho, enviada, convertida_proposta, convertida_pedido, cancelada
- `pedido_status`: novo, em_separacao, faturado, expedido, entregue, instalado, concluido, cancelado
- `pedido_origem`: cotacao, proposta, manual
- `financiamento_status`: aguardando_documentos, em_analise, pre_aprovado, aprovado, recusado, contrato_assinado, liberado, cancelado
- `timeline_tipo`: cotacao, proposta, pedido, financiamento, interacao, contrato, observacao

## Funções (security definer, search_path fixo)

| Função | Uso |
|---|---|
| `has_role(uuid, app_role)` | Checa role. Usada em todas as policies. |
| `validate_invite(uuid)` | Valida token de convite (anon). |
| `consume_invite(uuid)` | Aceita convite e vira parceiro (authenticated). |
| `get_parametros_publicos()` | Lê parâmetros sanitizados (esconde comissão para não-admin). |
| `get_proposta_publica(uuid)` | Retorna proposta + parceiro + cliente para link público. |
| `get_cotacao_publica(uuid)` | **NOVO** — Retorna cotação + kit + parceiro + cliente. |
| `get_financiamento_publico(uuid)` | **NOVO** — Retorna status do financiamento + timeline de eventos. |
| `proposta_registrar_evento(uuid, text, ...)` | Registra visualização/aceite/recusa. |
| `log_financiamento_status()` | **NOVO** — Trigger: cria evento toda vez que o status muda. |

## Mapa de Rotas ↔ Tabelas

| Rota | Tabelas |
|---|---|
| `/` (landing) | `clientes` (insert lead do formulário) |
| `/app` | dashboard agregando tudo |
| `/app/clientes`, `/app/cliente/$id` | `clientes`, `interacoes`, `timeline_cliente` |
| `/app/propostas`, `/app/propostas/nova`, `/app/propostas/$id` | `propostas`, `proposta_clientes`, `proposta_eventos` |
| `/app/cotacoes`, `/app/cotacoes/$id` | `cotacoes`, `kits_produtos` |
| `/app/pedidos`, `/app/pedidos/$id` | `pedidos` |
| `/app/financiamentos`, `/app/financiamentos/$id` | `financiamentos`, `financiamento_eventos` |
| `/app/kits` | `kits_produtos` (admin) |
| `/app/parametros` | `parametros_comerciais` (admin) |
| `/app/corretores` | `profiles`, `user_roles`, `partner_invites` (admin) |
| `/proposta/$codigo` | RPC `get_proposta_publica` |
| `/cotacao/$codigo` | RPC `get_cotacao_publica` |
| `/financiamento/$codigo` | RPC `get_financiamento_publico` |

## Storage

- Bucket `parceiros` (privado): avatares, contratos assinados, anexos.
