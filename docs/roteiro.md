# Roteiro do Projeto

Guia resumido para localizar os documentos e entender a ordem inicial do projeto.

## 1. O que está sendo criado

Uma aplicação web para acompanhar um projeto acadêmico multidisciplinar com oito pessoas, quatro duplas e quatro frentes de trabalho.

O sistema usa:

- **Scrum** para metas, Sprints, Product Backlog e Sprint Backlog;
- **Kanban** para visualizar fluxo, WIP, bloqueios e entregas;
- **Next.js** no frontend;
- **Neon/PostgreSQL** para persistência;
- **Google Drive** para arquivos;
- **Gmail** para notificações;
- **Google Calendar** como integração opcional de agenda.

## 2. Ordem recomendada de leitura

1. [README do projeto](../README.md) — resumo geral.
2. [01 — Visão do Produto](especificao-de-software/01-visao-produto.md) — problema, objetivo e escopo.
3. [02 — Requisitos](especificao-de-software/02-requisitos.md) — funcionalidades e restrições.
4. [03 — Casos de Uso](especificao-de-software/03-casos-de-uso.md) — interações dos usuários.
5. [04 — Modelo de Domínio](especificao-de-software/04-modelo-de-dominio.md) — entidades e agregados.
6. [05 — Modelo de Dados](especificao-de-software/05-modelo-de-dados.md) — banco e relacionamentos.
7. [06 — Diagramas de Estados](especificao-de-software/06-diagrama-de-estados.md) — ciclos de vida.
8. [07 — Boundary, Control e Entity](especificao-de-software/07-boundary-control-entity.md) — responsabilidades.
9. [08 — Diagramas de Sequência](especificao-de-software/08-diagramas-de-sequencia.md) — ordem das operações.
10. [09 — Diagramas de Atividade](especificao-de-software/09-diagramas-de-atividade.md) — fluxos completos.
11. [10 — Diagrama de Componentes](especificao-de-software/10-diagrama-de-componentes.md) — estrutura técnica.
12. [11 — DDD e Clean Architecture](especificao-de-software/11-ddd-clean-architecture.md) — orientação de implementação.
13. [12 — Plano de Testes](especificao-de-software/12-plano-de-testes.md) — validação e qualidade.

## 3. Organização das pastas

```text
árvore do projeto
├── .agents/                    orientações e skills do agente
├── docs/
│   ├── especificao-de-software/ documentação principal numerada
│   ├── arquitetura/            arquitetura de apoio
│   ├── backlog/                backlog produtivo e técnico
│   ├── requisitos/             requisitos detalhados de apoio
│   ├── sources/                guias Kanban e Scrum
│   ├── fase-1-exploracao-ideias.md
│   ├── especificacao-tecnica.md
│   ├── proposta.md
│   ├── tree.md
│   ├── roteiro.md
│   └── backlog/backlog.md
└── README.md                   entrada principal do projeto
```

## 4. Documentos de apoio

- [Exploração da Fase 1](fase-1-exploracao-ideias.md): decisões conceituais e escopo inicial.
- [Especificação técnica](especificacao-tecnica.md): frontend, banco e integrações Google.
- [Proposta](proposta.md): proposta comercial e de escopo.
- [Árvore de arquivos](tree.md): estrutura planejada do software.
- [Arquitetura de apoio](arquitetura/arquitetura.md): camadas e dependências.
- [Requisitos detalhados de apoio](requisitos/requisitos.md): versão complementar dos requisitos.
- [Backlog inicial](backlog/backlog.md): itens produtivos, técnicos, prioridades e critérios de aceitação.
- [Guias de referência](sources/): materiais de Scrum e Kanban usados no projeto.

## 5. Situação atual

A documentação inicial está estruturada até o plano de testes. Ainda não existe implementação do software neste repositório.

As principais decisões pendentes são:

- composição final das duplas e papéis (Scrum Master/Scrum Master Assistente, Coordenador/Product Owner);
- Product Owner (exercido por um coordenador por vez);
- duração das Sprints;
- fluxo real e limites de WIP;
- autenticação;
- conta Google, pasta do Drive e calendário;
- escopos OAuth;
- seleção dos itens da primeira Sprint a partir do backlog.

## 6. Próximo passo

Validar os requisitos, os papéis, o fluxo de trabalho e as integrações com a equipe. Em seguida, selecionar e detalhar os itens P0 do backlog e iniciar a implementação pelo domínio, casos de uso e testes, antes das telas e integrações concretas.
