# Árvore de Arquivos do Software

> Estrutura proposta para o frontend e para as camadas de suporte do sistema. Os nomes ainda podem ser ajustados durante a implementação, mas a separação de responsabilidades deve ser preservada.

```text
petbsi-srum/
├── app/                              # Configuração e execução do projeto Next.js
│   ├── (auth)/                       # Rotas públicas e autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── conectar-google/
│   │       └── page.tsx
│   ├── (dashboard)/                  # Área autenticada do projeto
│   │   ├── layout.tsx                # Shell, navegação e proteção da área
│   │   ├── page.tsx                  # Visão geral do projeto
│   │   ├── backlog/
│   │   │   ├── page.tsx              # Product Backlog
│   │   │   └── novo/page.tsx
│   │   ├── sprint/
│   │   │   ├── page.tsx              # Sprint atual
│   │   │   └── [sprintId]/page.tsx
│   │   ├── fluxo/
│   │   │   └── page.tsx              # Quadro Kanban e WIP
│   │   ├── itens/
│   │   │   └── [itemId]/page.tsx     # Detalhes, bloqueios e anexos
│   │   ├── frentes/
│   │   │   ├── page.tsx
│   │   │   └── [frontId]/page.tsx
│   │   ├── entregas/
│   │   │   └── page.tsx              # Entregas e histórico
│   │   ├── arquivos/
│   │   │   └── page.tsx              # Vínculos com o Google Drive
│   │   ├── notificacoes/
│   │   │   └── page.tsx              # Composição e histórico de e-mails
│   │   ├── agenda/
│   │   │   └── page.tsx              # Reuniões, prazos e Calendar opcional
│   │   ├── pessoas/
│   │   │   └── page.tsx              # Membros, duplas e responsabilidades
│   │   └── configuracoes/
│   │       ├── page.tsx
│   │       └── integracoes/page.tsx  # Drive, Gmail e Calendar
│   ├── api/                          # Entradas HTTP do servidor
│   │   ├── auth/
│   │   ├── backlog/
│   │   ├── sprints/
│   │   ├── workflow/
│   │   ├── attachments/
│   │   ├── notifications/
│   │   ├── calendar/
│   │   └── integrations/google/
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
│
├── src/
│   ├── components/                   # Componentes visuais reutilizáveis
│   │   ├── ui/                       # Botões, campos, modais, tabelas e feedback
│   │   ├── layout/                   # Sidebar, header e navegação
│   │   ├── overview/                 # Widgets da visão geral
│   │   ├── backlog/                  # Lista e formulário de backlog
│   │   ├── workflow/                 # Quadro, coluna, cartão e WIP
│   │   ├── sprint/                   # Meta, itens e progresso da Sprint
│   │   ├── attachments/              # Upload e lista de arquivos
│   │   ├── notifications/            # Editor, prévia e status de envio
│   │   └── calendar/                 # Agenda interna e sincronização
│   │
│   ├── hooks/                        # Hooks de tela e interação
│   │   ├── use-project-overview.ts
│   │   ├── use-backlog.ts
│   │   ├── use-workflow-board.ts
│   │   ├── use-attachment-upload.ts
│   │   └── use-notification.ts
│   │
│   ├── lib/                          # Utilitários sem regra de domínio
│   │   ├── api-client.ts
│   │   ├── auth-client.ts
│   │   ├── date.ts
│   │   ├── formatters.ts
│   │   └── validation.ts
│   │
│   ├── domain/                       # Regras puras do domínio
│   │   ├── project/
│   │   │   ├── project.ts
│   │   │   ├── product-goal.ts
│   │   │   └── project-membership.ts
│   │   ├── people/
│   │   │   ├── person.ts
│   │   │   └── pair.ts
│   │   ├── backlog/
│   │   │   ├── backlog-item.ts
│   │   │   ├── sprint-item.ts
│   │   │   └── backlog-policy.ts
│   │   ├── workflow/
│   │   │   ├── workflow-column.ts
│   │   │   ├── work-item-state-change.ts
│   │   │   └── wip-policy.ts
│   │   ├── sprint/
│   │   │   └── sprint.ts
│   │   ├── delivery/
│   │   │   └── delivery.ts
│   │   ├── blocker/
│   │   │   └── blocker.ts
│   │   ├── integration/
│   │   │   ├── attachment.ts
│   │   │   ├── notification.ts
│   │   │   └── calendar-event.ts
│   │   └── shared/
│   │       ├── project-role.ts
│   │       ├── work-item-status.ts
│   │       └── sync-status.ts
│   │
│   ├── application/                  # Casos de uso e contratos internos
│   │   ├── overview/
│   │   │   └── get-project-overview.ts
│   │   ├── backlog/
│   │   │   ├── create-backlog-item.ts
│   │   │   └── move-backlog-item.ts
│   │   ├── sprint/
│   │   │   └── manage-sprint.ts
│   │   ├── attachments/
│   │   │   └── upload-attachment.ts
│   │   ├── notifications/
│   │   │   └── send-notification.ts
│   │   ├── calendar/
│   │   │   └── sync-calendar-event.ts
│   │   └── ports/
│   │       ├── repositories.ts
│   │       ├── file-storage-gateway.ts
│   │       ├── email-gateway.ts
│   │       ├── calendar-gateway.ts
│   │       └── auth-gateway.ts
│   │
│   ├── adapters/                     # Implementações que conectam o sistema externo
│   │   ├── http/
│   │   │   ├── request-context.ts
│   │   │   └── error-handler.ts
│   │   ├── repositories/
│   │   │   ├── project-repository.ts
│   │   │   ├── backlog-repository.ts
│   │   │   ├── sprint-repository.ts
│   │   │   └── integration-repository.ts
│   │   └── google/
│   │       ├── google-auth-adapter.ts
│   │       ├── google-drive-gateway.ts
│   │       ├── gmail-gateway.ts
│   │       └── google-calendar-gateway.ts
│   │
│   └── server/                       # Código exclusivo do servidor
│       ├── authorization/
│       │   ├── require-session.ts
│       │   └── require-project-permission.ts
│       ├── integrations/
│       │   ├── google-client.ts
│       │   ├── token-store.ts
│       │   └── retry-policy.ts
│       └── env.ts                    # Validação de variáveis de ambiente
│
├── db/
│   ├── migrations/                   # Migrações versionadas do Neon/PostgreSQL
│   ├── schema/                       # Definição das tabelas e índices
│   ├── seeds/                        # Dados iniciais das quatro frentes
│   └── client.ts                     # Conexão usada exclusivamente no servidor
│
├── public/
│   ├── icons/
│   └── images/
│
├── tests/
│   ├── unit/                         # Domínio e políticas Scrum/Kanban
│   ├── application/                  # Casos de uso com fakes
│   ├── integration/                 # Banco e gateways Google controlados
│   └── e2e/                          # Fluxos críticos do frontend
│
├── .env.example                      # Apenas nomes de variáveis, sem segredos
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── docs/
	├── especificao-de-software/
	│   ├── 01-visao-produto.md
	│   ├── 02-requisitos.md
	│   ├── 03-casos-de-uso.md
	│   ├── 04-modelo-de-dominio.md
	│   ├── 05-modelo-de-dados.md
	│   ├── 06-diagrama-de-estados.md
	│   ├── 07-boundary-control-entity.md
	│   ├── 08-diagramas-de-sequencia.md
	│   ├── 09-diagramas-de-atividade.md
	│   ├── 10-diagrama-de-componentes.md
	│   ├── 11-ddd-clean-architecture.md
	│   └── 12-plano-de-testes.md
	├── arquitetura/
	│   └── arquitetura.md
	├── backlog/
	│   └── backlog.md
	├── requisitos/
	│   └── requisitos.md
	├── fase-1-exploracao-ideias.md
	├── especificacao-tecnica.md
	├── proposta.md
	├── roteiro.md
	├── sources/
	│   ├── guiaKanban.pdf
	│   └── guiaScrum.pdf
	└── tree.md
```

## Princípios da árvore

### Frontend e servidor

As páginas e componentes em `app/` e `src/components/` cuidam da apresentação. O frontend chama a aplicação por rotas ou Server Actions, mas não acessa diretamente o Neon nem as APIs Google.

### Domínio independente

`src/domain/` não deve importar React, Next.js, ORM, driver PostgreSQL ou SDK Google. As regras de Sprint, fluxo, WIP, bloqueios e permissões de negócio devem poder ser testadas sem navegador ou infraestrutura.

### Integrações protegidas

`src/server/` e `src/adapters/google/` são executados somente no servidor. Tokens OAuth, chaves, `folder_id` do Drive e demais configurações sensíveis não devem aparecer em componentes client-side.

### Banco de dados

`db/` concentra migrações, schema, seeds e conexão com o Neon. Repositórios traduzem dados persistidos para entidades do domínio; páginas e componentes não devem conhecer tabelas.

### Documentação

`docs/tree.md` mostra a organização planejada. A árvore poderá crescer durante a implementação, mas novas pastas devem manter a separação entre apresentação, casos de uso, domínio e infraestrutura.
