# Sistema Web de Gestão Ágil do Projeto Acadêmico

Aplicação web para tornar transparente o trabalho de um projeto acadêmico multidisciplinar, reunindo em um mesmo espaço objetivos, backlog, Sprints, fluxo de trabalho, bloqueios, entregas e histórico.

O produto utiliza **Scrum como estrutura principal de organização** e o **Método Kanban como complemento para visualização e melhoria do fluxo**. A proposta não é criar apenas um gerenciador de tarefas, mas apoiar o sistema de trabalho real da equipe.

## Visão Geral

O projeto atende uma única equipe acadêmica formada por **8 pessoas**, organizadas em quatro duplas com diferentes frentes e funções, mas atuando em um único projeto e em um único Scrum Team.

Uma das duplas atuará como apoio de **Gestão Ágil e Scrum Master** para os demais membros, apoiando transparência, inspeção, adaptação, facilitação dos eventos e melhoria do fluxo. A responsabilidade formal de Scrum Master é exercida por uma pessoa por vez e alterna entre o **Scrum Master** e o **Scrum Master Assistente** da dupla, ambos com permissões de **Administrador Técnico** (configurações técnicas, integrações e delimitação de permissões). Essa atuação não transforma a dupla em gerente responsável por distribuir tarefas. Os **coordenadores** são superiores de todos os membros, acompanham o andamento, as entregas, os prazos e os resultados do projeto e **atuam como Product Owner**: todos possuem o título de Coordenador e um deles, por vez, exerce o Product Owner, com possibilidade de alternância análoga à do Scrum Master.

As responsabilidades organizacionais, as frentes de trabalho e os papéis Scrum serão representados separadamente no sistema. Todos os membros recebem o título padrão **Membro** e são exibidos como **Visitante** quando não possuem permissão de edição nas frentes a que têm acesso. A composição exata de cada dupla e suas funções ainda deverão ser validadas.

## Frentes do Projeto

O trabalho será acompanhado por quatro frentes temáticas:

- **Ensino e Nivelamento:** tutoria por pares, planejamento didático e materiais de apoio.
- **Pesquisa e Desenvolvimento de IA:** pesquisa em Processamento de Linguagem Natural, Aprendizado de Máquina e desenvolvimento do protótipo de Tutor Virtual.
- **Extensão e Letramento Algorítmico:** relacionamento com a comunidade, materiais e oficinas.
- **Gestão Ágil:** acompanhamento transversal, apoio ao fluxo, entregas e suporte à coordenação.

As frentes são formas de organizar e visualizar o trabalho. Elas não representam Scrum Teams independentes.

## Como Scrum e Kanban Serão Aplicados

### Scrum

Scrum organiza o trabalho por meio de:

- um único Scrum Team;
- Product Owner, Scrum Master e Developers, com apoio operacional da dupla de Gestão Ágil (Scrum Master e Scrum Master Assistente); o Product Owner é exercido por um coordenador por vez;
- Product Backlog;
- Sprints e Meta da Sprint;
- Sprint Backlog;
- Sprint Planning, Daily Scrum, Sprint Review e Sprint Retrospective;
- Incremento e Definição de Pronto.

O Product Backlog representa o trabalho potencial do produto. O Sprint Backlog representa o objetivo e o plano de trabalho da Sprint, não uma lista genérica de pendências.

### Kanban

Kanban complementa Scrum por meio de:

- visualização do fluxo real de trabalho;
- limite de trabalho em progresso (WIP), quando definido;
- sistema puxado e gestão da capacidade;
- políticas explícitas para movimentação dos itens;
- identificação de bloqueios e gargalos;
- ciclos de feedback e melhoria evolucionária;
- observação de métricas como WIP, lead time e taxa de entrega.

As colunas do quadro deverão ser descobertas a partir do fluxo real da equipe. O sistema não assumirá automaticamente um fluxo genérico como “A Fazer”, “Fazendo” e “Feito”.

## Cadência de Reuniões

As reuniões presenciais acontecem duas vezes por semana, exceto em feriados:

| Dia | Horário | Uso principal |
|---|---:|---|
| Terça-feira | 08:00–10:00 | Inspeção do trabalho, alinhamentos e atualização do fluxo |
| Quarta-feira | 08:00–10:00 | Reunião principal de acompanhamento, apresentação de atualizações, andamento dos projetos e adaptações necessárias |

No contexto do projeto, esses são os dias efetivos de trabalho. A Daily Scrum deverá apoiar a inspeção do progresso em direção à Meta da Sprint e a adaptação do Sprint Backlog nesses dias. A reunião de quarta-feira terá maior importância operacional para apresentação e acompanhamento das atualizações, mas não será tratada como um novo evento oficial do Scrum.

## Principais Capacidades do Sistema

O MVP deverá permitir:

- visualizar o estado geral do projeto, suas metas, prazos e entregas;
- consultar e ordenar o Product Backlog;
- planejar e acompanhar a Sprint atual;
- visualizar a Meta da Sprint e o Sprint Backlog;
- acompanhar o fluxo de trabalho por frente;
- registrar estados reais, bloqueios e trabalho em progresso;
- aplicar políticas e limites de WIP quando definidos;
- consultar entregas concluídas e histórico por Sprint, período e frente;
- visualizar participantes, duplas, responsabilidades e coordenação;
- apoiar coordenadores (que atuam como Product Owner) e Scrum Masters no acompanhamento e na preparação de relatórios.

O sistema deverá gerar histórico a partir do trabalho cotidiano, evitando registros burocráticos sem valor operacional.

## Escopo Inicial do MVP

### Incluído

- um projeto acadêmico e um Scrum Team;
- oito membros organizados em quatro duplas;
- quatro frentes de trabalho;
- coordenação e participantes;
- Product Backlog e Sprint Backlog;
- Sprints, metas, entregas, prazos e itens de trabalho;
- quadro de fluxo, WIP e bloqueios;
- histórico para acompanhamento e relatórios.
- integração com Google Drive para arquivos;
- integração com Gmail para notificações;
- agenda interna e integração opcional com Google Calendar.

### Fora do escopo atual

- múltiplos projetos ou organizações;
- múltiplos Scrum Teams;
- plataforma genérica para qualquer workflow;
- editor totalmente configurável de processos;
- curso interno completo sobre Scrum e Kanban;
- inteligência artificial e analytics sofisticado;
- funcionamento offline-first e sincronização local;
- geolocalização, câmera e outras integrações com sensores;
- relatórios institucionais totalmente automatizados.

## Diretrizes Técnicas Já Definidas

As próximas fases deverão considerar:

- **Next.js** como framework principal;
- **Neon** como banco de dados online;
- acesso protegido aos dados pelo lado servidor;
- nenhum segredo de banco exposto no navegador;
- princípios de **Domain-Driven Design**, **Clean Architecture** e **Clean Code**.

Os detalhes de arquitetura concreta, modelo de banco, APIs, autenticação e estrutura de componentes estão registrados na [especificação técnica](docs/especificacao-tecnica.md) e deverão ser refinados durante a implementação.

## Critérios de Sucesso

O projeto será bem-sucedido se conseguir:

1. oferecer uma visão compartilhada do trabalho das quatro frentes;
2. tornar claro o que está planejado, em progresso, bloqueado e concluído;
3. preservar a diferença entre Product Backlog e Sprint Backlog;
4. manter um único Scrum Team apesar das diferentes frentes;
5. apoiar Scrum Masters sem centralizar a distribuição das tarefas;
6. dar aos coordenadores transparência sobre andamento, prazos e entregas;
7. usar Kanban para melhorar o fluxo sem substituir Scrum;
8. produzir histórico útil para acompanhamento e prestação de contas.

## Próximas Etapas

1. Validar a [especificação técnica de frontend, banco e integrações](docs/especificacao-tecnica.md).
2. Validar com a equipe a composição das duplas, os papéis (Scrum Master/Scrum Master Assistente, Coordenador/Product Owner), o fluxo real, os limites de WIP e as políticas de trabalho.
3. Revisar o [backlog inicial](docs/backlog/backlog.md) e selecionar os itens da primeira Sprint.
4. Iniciar a implementação com testes das regras de domínio e dos casos de uso.

## Frontend de Demonstração (Atual)

Existe hoje uma implementação **frontend-only** em Next.js (App Router + TypeScript), sem banco, sem autenticação real e sem integrações Google:

- **Rodar localmente:** `npm install` e `npm run dev` (abrir `http://localhost:3000`).
- **Dados:** os dados de demonstração (4 frentes, 8 pessoas em 4 duplas, Product Backlog, Sprint, Kanban, agenda e notificações) ficam no `localStorage`; o botão **"Reiniciar demonstração"** na tela de login restaura o seed.
- **Telas:** `/login`, visão geral, `/backlog`, `/sprint`, `/fluxo` (Kanban com WIP e drag-and-drop), `/itens/[id]`, `/frentes`, `/entregas`, `/arquivos`, `/notificacoes`, `/agenda`, `/pessoas`, `/configuracoes` e `/configuracoes/integracoes`.
- **Tema:** botão de alternância claro/escuro disponível em todas as telas, incluindo o login; a preferência é salva no navegador e o tema do sistema é usado como padrão.
- **Organização:** `app/` (rotas), `src/components/` (UI e shell), `src/lib/` (tipos de domínio, seed e store client).
- **Limite da fase:** as regras de negócio permanecem simuladas no frontend; banco, servidor, OAuth e as integrações reais (Drive, Gmail, Calendar, Telegram) ficam para as próximas fases, conforme a [especificação técnica](docs/especificacao-tecnica.md).

## Referências do Projeto

- [Documento de encerramento da Fase 1](docs/fase-1-exploracao-ideias.md)
- [Especificação técnica](docs/especificacao-tecnica.md)
- [Proposta de criação do projeto](docs/proposta.md)
- [Roteiro do projeto](docs/roteiro.md)
- [Backlog inicial](docs/backlog/backlog.md)
- [Especificação de software](docs/especificao-de-software/01-visao-produto.md)
- [Árvore de arquivos](docs/tree.md)
- [Guia Kanban](docs/sources/guiaKanban.pdf)
- [Guia Scrum](docs/sources/guiaScrum.pdf)