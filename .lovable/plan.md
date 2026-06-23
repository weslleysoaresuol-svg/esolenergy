## Visão geral

Construir um sistema completo de CRM solar com dois perfis de acesso (Administrador e Corretor Parceiro), autenticação via Google + email/senha, e gestão de clientes/leads ao longo do funil de vendas. Referências: pipeline estilo Pipedrive/HubSpot + dashboards de Enphase/SunPower + UX simplificada para corretores em campo (mobile-first).

## 1. Autenticação e acesso

- Botão **"Acesso"** no header (canto superior direito) ao lado do CTA atual, levando para `/auth`.
- Lovable Cloud habilitado com:
  - Login Google (OAuth gerenciado)
  - Login Email/Senha
- Tabela `profiles` (criada automaticamente via trigger no signup) com: nome, telefone, foto, CPF/CNPJ, CRECI, cidade, bio, % comissão.
- Tabela `user_roles` separada com enum `app_role` = `admin` | `corretor`.
- Função `has_role()` security definer para evitar recursão RLS.
- Primeiro usuário cadastrado vira admin automaticamente; demais entram como `corretor` (pendentes de aprovação).
- Página `/perfil` para o corretor editar seus dados após cadastro (passo a passo: dados pessoais → dados profissionais → dados bancários/comissão → foto).

## 2. Modelo de dados (clientes/leads)

Tabela `clientes`:
- Dados pessoais: nome, email, telefone (WhatsApp), CPF/CNPJ, data nascimento, endereço completo
- Dados do imóvel: tipo (residencial/comercial/industrial/rural), área, tipo de telhado
- Dados de consumo: concessionária, consumo médio kWh, valor médio fatura, número da UC
- Dados do projeto: potência sugerida (kWp), valor estimado, payback estimado, forma de pagamento
- **Status do funil** (enum): `novo` → `contato` → `visita_agendada` → `proposta_enviada` → `negociacao` → `contrato_assinado` → `instalacao` → `concluido` / `perdido`
- Origem do lead, observações, anexos (conta de luz, RG, contrato)
- `corretor_id` (FK para o corretor responsável)
- `created_at`, `updated_at`

Tabela `interacoes` (timeline): tipo (ligação, email, WhatsApp, visita, proposta), data, descrição, anexo, `cliente_id`, `autor_id`.

Tabela `propostas`: cliente_id, potência, equipamentos, valor total, condições, PDF gerado, status.

### RLS
- Admin: acesso total a tudo
- Corretor: vê/edita SOMENTE os clientes onde `corretor_id = auth.uid()`

## 3. Painel do Administrador (`/admin`)

Visão de comando completo:
- **Dashboard**: KPIs (leads novos, em negociação, fechados no mês, faturamento, comissões a pagar, conversão por etapa do funil), gráficos de evolução, top corretores.
- **Clientes**: tabela com filtros (status, corretor, cidade, período), busca, edição, reatribuição de corretor, exportação CSV.
- **Funil Kanban**: visão arrastar-e-soltar de todos os clientes por etapa.
- **Corretores**: listar, aprovar cadastros pendentes, editar % comissão, ativar/desativar, ver desempenho individual.
- **Propostas**: todas as propostas geradas, status.
- **Configurações**: preços base por kWp, equipamentos disponíveis, modelos de proposta, integrações.

## 4. Painel do Corretor (`/corretor`)

Foco: simples, mobile-first, voltado ao processo de venda.
- **Meus clientes** (cards/kanban por etapa do funil) — apenas os seus.
- **Novo cliente** (wizard em etapas): Dados pessoais → Imóvel → Consumo → Foto da conta de luz → Status inicial.
- **Detalhe do cliente**: ficha completa + timeline de interações + botão WhatsApp direto + botão "Gerar proposta" + upload de documentos + avançar status no funil.
- **Minhas comissões**: clientes fechados, valores, status de pagamento.
- **Meu perfil**: editar dados pessoais, profissionais, foto, senha.

## 5. Fluxo público → captação

O formulário do site (já existente) cria lead automaticamente na tabela `clientes` com status `novo` e `corretor_id = null`, aparecendo no painel do admin para distribuição.

## Detalhes técnicos

- Stack: TanStack Start + Lovable Cloud (Supabase) + shadcn/ui + Tailwind.
- Rotas: `/auth`, `/_authenticated/admin/*`, `/_authenticated/corretor/*`, `/_authenticated/perfil`.
- Layout autenticado com sidebar adaptativa por role.
- Drag-and-drop kanban: `@dnd-kit/core`.
- Componentes principais: `LeadCard`, `KanbanBoard`, `ClienteWizard`, `Timeline`, `StatCard`, `DataTable` (com TanStack Table).
- Validação: Zod em todos os formulários.
- Server functions com `requireSupabaseAuth` para todas as operações; admin opera com cliente autenticado + checagem `has_role('admin')`.
- Header do site ganha botão "Acesso" → `/auth`; após login, redireciona para `/admin` ou `/corretor` conforme role.

## Escopo desta primeira entrega

Para não estourar uma única iteração gigante, proponho dividir:

**Fase 1 (esta)**: Cloud + Auth (Google + email) + roles + profiles + botão no header + páginas `/auth`, `/admin` (dashboard + clientes + corretores), `/corretor` (meus clientes + novo cliente wizard + detalhe) + tabela `clientes` + RLS + wizard de perfil do corretor.

**Fase 2**: Kanban drag-and-drop, propostas com PDF, comissões, timeline rica, integração do formulário público com a tabela de leads, dashboards avançados.

Posso seguir com a Fase 1 completa?
