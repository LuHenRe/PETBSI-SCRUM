# 01 — Visão do Produto

**Projeto:** Sistema Web de Gestão Ágil do Projeto Acadêmico  
**Versão:** 1.0  
**Status:** visão consolidada para validação

## 1. Resumo

O produto é uma aplicação web para tornar transparente e acompanhar o trabalho de um projeto acadêmico multidisciplinar. A solução reúne metas, Product Backlog, Sprints, fluxo de trabalho, bloqueios, entregas, pessoas e histórico em um ambiente compartilhado.

O projeto utiliza **Scrum como estrutura principal** e o **Método Kanban como complemento para visualizar, gerenciar e melhorar o fluxo**. O objetivo não é criar apenas um gerenciador de tarefas, mas representar o sistema de trabalho real da equipe.

## 2. Contexto

A equipe possui oito pessoas organizadas em quatro duplas, com diferentes frentes e funções, mas integradas em um único Scrum Team. Uma das duplas atua como apoio de Gestão Ágil. A responsabilidade formal de Scrum Master é exercida por uma pessoa por vez e pode alternar entre os integrantes da dupla.

O sistema possui três papéis: **Membro**, **Product Owner** e **Scrum Master**. O Product Owner vê todos os planos das quatro frentes e conduz o Product Backlog. O Scrum Master possui a maior permissão, cuidando da transparência, do fluxo, das configurações técnicas (integrações) e da delimitação de permissões de acesso/edição por frente. Os membros apenas veem ou alteram as frentes para as quais possuem permissão.

## 3. Frentes de trabalho

- **Ensino e Nivelamento:** tutoria por pares, planejamento didático e materiais de apoio.
- **Pesquisa e Desenvolvimento de IA:** Processamento de Linguagem Natural, Aprendizado de Máquina e protótipo de Tutor Virtual.
- **Extensão e Letramento Algorítmico:** relacionamento com a comunidade, materiais e oficinas.
- **Gestão Ágil:** acompanhamento transversal, fluxo, entregas e suporte à coordenação.

As frentes são agrupamentos de trabalho e não representam Scrum Teams independentes.

## 4. Forma de trabalho

### Scrum

A aplicação deverá preservar:

- um único Scrum Team;
- Product Owner, Scrum Master e Developers;
- Product Backlog e Sprint Backlog distintos;
- Sprints, Meta do Produto e Meta da Sprint;
- Sprint Planning, Daily Scrum, Sprint Review e Sprint Retrospective;
- Incremento e Definição de Pronto.

### Kanban

Kanban complementará Scrum por meio de:

- visualização do fluxo real;
- trabalho em progresso e limites de WIP;
- políticas explícitas;
- identificação de bloqueios e gargalos;
- gestão da capacidade;
- ciclos de feedback e melhoria evolucionária.

As colunas do fluxo serão descobertas com a equipe. O sistema não assumirá automaticamente um quadro genérico de “A Fazer”, “Fazendo” e “Feito”.

## 5. Cadência presencial

As reuniões acontecem às terças e quartas-feiras, das 08:00 às 10:00, exceto em feriados.

| Dia | Finalidade |
|---|---|
| Terça-feira | Inspeção do trabalho, alinhamentos e atualização do fluxo |
| Quarta-feira | Principal reunião de acompanhamento, apresentação de atualizações, andamento e adaptações |

A quarta-feira possui maior importância operacional, mas não constitui um novo evento oficial do Scrum. A Daily Scrum continua orientada à inspeção do progresso em direção à Meta da Sprint e à adaptação do Sprint Backlog.

## 6. Usuários e valor

| Público | Valor esperado |
|---|---|
| Membros | Clareza sobre prioridades, responsabilidades, bloqueios e entregas nas frentes em que atuam |
| Product Owner | Visão de todos os planos das frentes, priorização do Product Backlog e metas |
| Scrum Master | Transparência, facilitação, inspeção, melhoria do fluxo, configuração de integrações e gestão de permissões |

## 7. Escopo do MVP

O MVP contempla:

- um projeto acadêmico e um Scrum Team;
- oito pessoas em quatro duplas;
- quatro frentes de trabalho;
- metas, Product Backlog, Sprint Backlog e Sprints;
- fluxo Kanban, WIP, bloqueios e políticas;
- entregas, prazos e histórico;
- participantes, duplas e responsabilidades;
- upload de arquivos para diretório Google Drive existente;
- notificações por Gmail;
- notificações automáticas para o grupo do projeto no Telegram, como canal de comunicação entre os membros;
- agenda interna e integração opcional com Google Calendar.

## 8. Fora do escopo inicial

- múltiplos projetos ou organizações;
- múltiplos Scrum Teams;
- plataforma genérica de workflows;
- curso completo sobre métodos ágeis;
- inteligência artificial e analytics sofisticado;
- funcionamento offline-first;
- geolocalização, câmera e sensores;
- relatórios institucionais totalmente automatizados;
- acesso amplo à caixa de entrada do Gmail.

## 9. Diretrizes de produto

- A transparência deve ser gerada pelo trabalho cotidiano.
- Product Backlog e Sprint Backlog não podem ser confundidos.
- A dupla de Gestão Ágil não deve centralizar a distribuição de tarefas.
- Falhas em integrações Google ou no Telegram não podem impedir o uso dos dados locais.
- O sistema deve tratar Calendar como integração opcional.
- O Telegram é um canal de comunicação e notificação entre os membros, não um novo sistema de gerenciamento.
- O produto deve permanecer simples o suficiente para o projeto que o originou.

## 10. Critérios de sucesso

O produto será considerado conceitualmente adequado se:

1. oferecer uma visão compartilhada das quatro frentes;
2. mostrar o que está planejado, em progresso, bloqueado e concluído;
3. preservar os conceitos fundamentais de Scrum;
4. melhorar a visualização e o fluxo sem substituir Scrum;
5. apoiar o Product Owner, o Scrum Master e os membros nas respectivas responsabilidades;
6. gerar histórico útil para acompanhamento e prestação de contas;
7. reduzir dependência de informações dispersas;
8. respeitar os limites e responsabilidades definidos pela equipe.

## 11. Decisões pendentes

- composição exata das duplas;
- pessoa responsável como Product Owner;
- duração das Sprints;
- fluxo real, políticas e limites de WIP;
- definição exata do Produto e da Meta do Produto;
- provedor de autenticação;
- conta Google, pasta Drive, remetente Gmail e calendário;
- escopos OAuth e políticas de retenção;
- grupo do Telegram, bot e configuração de notificações automáticas.

## 12. Referências

- [Exploração da Fase 1](../fase-1-exploracao-ideias.md)
- [README do projeto](../README.md)
- [Especificação técnica](../especificacao-tecnica.md)
- [Proposta de criação](../proposta.md)
- [Guia Kanban](../sources/guiaKanban.pdf)
- [Guia Scrum](../sources/guiaScrum.pdf)
