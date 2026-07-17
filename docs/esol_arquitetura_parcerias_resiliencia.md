# 🛡️ Esol Energy — Arquitetura de Parcerias, APIs e Resiliência (Independência de Fornecedor)

Para garantir que a Esol nunca fique "refém" de uma única comercializadora ou empresa de GD, o sistema deve ser desenhado sob o princípio de **Desacoplamento Total**. O cliente é da Esol, os dados são da Esol, e a tecnologia deve permitir trocar de parceiro por trás dos panos com um clique.

Abaixo está o plano técnico e estratégico de excelência para estruturar essa proteção.

---

## 1. O PRINCÍPIO DO "CUSTOMER OWNERSHIP" (Propriedade dos Dados)

A Esol nunca enviará o cliente direto para o sistema da parceira sem antes registrar tudo em sua própria infraestrutura.

```
FLUXO DE DADOS BLINDADO:

  [Consultor no App]
          │
          ▼ (Cadastro do Lead + Foto da Conta)
  ┌───────────────────────────────────────────────────────────┐
  │ 💾 BANCO DE DADOS CORE ESOL (Proprietário)                │
  │ • Cadastro completo criptografado                         │
  │ • Histórico de consumo e faturas salvas no AWS S3/GCS      │
  │ • Controle de vigência de contrato e datas-chave          │
  └───────────────────────────┬───────────────────────────────┘
                              │
                              ▼ (Roteador de Leads)
  ┌───────────────────────────────────────────────────────────┐
  │ 🔌 CAMADA DE ABSTRAÇÃO DE APIs (Esol Gateway)             │
  │ Controla para qual parceiro o lead será enviado           │
  └───────┬───────────────────┼───────────────────┬───────────┘
          │ (Regra A)         │ (Regra B)         │ (Regra C)
          ▼                   ▼                   ▼
     [API ÓRIGO]        [API REVERDE]       [API CLARKE]
```

### Por que fazer assim?
1. **Roteamento Dinâmico:** Se a Órigo suspender as operações em Minas Gerais ou atrasar repasses, a Esol altera a regra no Panel Administrativo e todos os novos leads daquela região são enviados automaticamente para a Reverde ou Cemig Sim, sem precisar atualizar o aplicativo dos consultores.
2. **Histórico Preservado:** Se precisarmos trocar de parceira, temos o histórico completo de consumo do cliente para refazer a simulação e propor a migração contratual para outra empresa de forma automática.

---

## 2. MATRIZ DE APIS E INTEGRAÇÃO DAS PARCEIRAS

As principais empresas de tecnologia em energia no Brasil já expõem APIs modernas (REST/JSON) para parceiros integrados.

### 🌐 Tabela de Integrações Reais (GD e Mercado Livre)

| Parceira | Mercado | Disponibilidade de API | Tipo de Integração | Resiliência de Troca |
| :--- | :--- | :--- | :--- | :--- |
| **Órigo Energia** | GD | **Disponível (REST)** | Cadastro de leads, envio de documentos e webhook de status de ativação. | **Alta:** Formato de payload padrão (JSON). |
| **Reverde** | GD | **Disponível (REST)** | API-first. Fluxo de onboarding 100% digital via API. | **Altíssima:** Interface muito moderna e rápida de integrar. |
| **Clarke Energia** | Mercado Livre | **Disponível (REST)** | Envio de faturas, consumo histórico e acompanhamento dos 3 gatilhos de comissão. | **Alta:** Retorna o status de cada fase do funil via Webhook. |
| **Desperta Energia** | GD | **Parcial (Portal/API)** | Integração de prospecção via portal com APIs de envio. | **Média:** Exige validação de layout de conta. |
| **Enel Comercializadora** | Mercado Livre | **Média (Web Services/SFTP)** | Envio lote/Web Service para grandes parceiros. | **Média:** Processo mais tradicional/burocrático. |

---

## 3. GESTÃO TEMPORAL E REGRAS CONTRATUAIS (Prevenindo Perdas)

A migração de energia envolve prazos legais regulados pela ANEEL. A Esol deve rastrear três variáveis temporais críticas no banco de dados para evitar multas ao cliente e garantir a comissão da rede.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ LINHA DO TEMPO DO CONTRATO DO CLIENTE                                    │
│                                                                          │
│  Mês 0          Mês 18 (Janela de Aviso)         Mês 24 (Fim do Contrato)│
│  ├──────────────┼────────────────────────────────┼──────────────────────┤│
│  ▲              ▲                                ▲                      │
│  Contrato       Início da análise de renovação   Janela de migração     │
│  iniciado       ou troca de parceira             sem multa              │
│                                                                          │
│  ⚠️ Regra de Ouro Esol: O sistema emite alerta automático no Mês 18.       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 📅 As 3 Regras Temporais de Segurança:

#### **1. O Aviso Prévio da Distribuidora (Denúncia de Contrato - Mercado Livre)**
*   **A regra:** Para sair da distribuidora (Enel, CPFL) e ir para o Mercado Livre, a lei exige que o cliente envie uma carta de denúncia com **180 dias de antecedência**.
*   **O risco:** Se o cliente assinar com o Mercado Livre e a comercializadora parceira esquecer de protocolar a denúncia na distribuidora, o cliente pode ser cobrado em duplicidade ou ter atraso no início do desconto.
*   **A solução no sistema Esol:** O banco de dados terá um campo `data_protocolo_denuncia`. Se o status não for atualizado em até 15 dias após a assinatura, o sistema gera um alerta vermelho para o backoffice da Esol cobrar a comercializadora.

#### **2. Período de Fidelidade (Lock-in) do Cliente**
*   **A regra:** Contratos de Mercado Livre duram de **24 a 60 meses**. Contratos de GD por assinatura costumam durar **12 meses** com renovação automática. Romper antes gera multa (geralmente uma porcentagem da economia estimada restante).
*   **A resiliência Esol:** O sistema registrará a `data_fim_fidelidade`. Se a Esol decidir romper com a comercializadora parceira X por problemas de pagamento, os clientes atuais dessa parceira continuam nela até o final do contrato para evitar multas. Novas vendas vão para a parceira Y. 6 meses antes de vencer o contrato do cliente antigo, o app alerta o consultor para iniciar a portabilidade do cliente para a parceira Y.

#### **3. A Carência de Repasse da Comissão**
*   **A regra:** As geradoras de GD só pagam a comissão recorrente após a concessionária local homologar os créditos (prazo médio de 60 a 90 dias após a assinatura).
*   **A resiliência Esol:** O Motor de Comissões da Esol só ativa a recorrência do consultor quando o webhook da parceira enviar a confirmação de `primeira_fatura_compensada`. Isso evita que a Esol pague comissões adiantadas de contratos que venham a ser cancelados no meio do processo de homologação.

---

## 4. O SISTEMA DE PORTABILIDADE AUTOMÁTICA (O trunfo da Esol)

Se a Esol precisar migrar uma carteira de clientes de uma comercializadora para outra (por quebra de contrato do parceiro ou oferta melhor), o banco de dados Core da Esol executa o seguinte fluxo automático:

```
[Decisão de Troca de Fornecedor]
               │
               ▼
[Rastreador de Contratos Core Esol] ── Filtra clientes próximos ao fim da fidelidade
               │
               ▼
[Geração Automática de Proposta de Portabilidade] ── Usando dados de consumo salvos no DB
               │
               ▼
[Disparo de Notificação para o Cliente] 
"Seu contrato de energia está vencendo. A Esol encontrou uma tarifa ainda menor com energia 100% renovável. Clique para aceitar a nova proposta com desconto de 15%."
               │
               ▼
[Assinatura Eletrônica (Esol Sign)]
               │
               ▼
[Disparo do Lead via API para o Novo Parceiro]
```

Dessa forma, o cliente percebe a troca apenas como um benefício (mais desconto ou melhor atendimento), o consultor mantém sua recorrência garantida e a Esol consolida sua posição de força no mercado.
