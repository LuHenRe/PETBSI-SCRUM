# Backlog do Sistema de Gestão Ágil

## Backlog produtivo

### MVP — Primeira entrega

#### BP-01 — Autenticar participantes autorizados

- Prioridade: Alta
- Tipo: Produto
- Requisito: RF01
- Descrição: O sistema deve permitir que participantes autorizados acessem o projeto conforme seus papéis e permissões de acesso/edição por frente.
- Critério de aceitação:
  - o usuário consegue iniciar e concluir o login;
  - usuários sem vínculo não acessam o projeto;
  - a sessão expirada não permite operações protegidas;
  - o sistema não revela dados do projeto a usuários não autorizados.

#### BP-02 — Exibir visão geral do projeto

- Prioridade: Alta
- Tipo: Produto
- Requisito: RF02
- Descrição: A visão geral deve apresentar Meta do Produto, Sprint atual, prazos, WIP, bloqueios e entregas recentes.
- Critério de aceitação:
  - os dados principais são exibidos em uma única visão;
  - o usuário consegue filtrar ou acessar detalhes por frente;
  - a tela possui estados de carregamento, vazio e erro;
  - a indisponibilidade de uma integração Google não impede os dados locais.

#### BP-03 — Gerenciar Product Backlog

- Prioridade: Alta
- Tipo: Produto
- Requisito: RF03
- Descrição: O Coordenador (Product Owner) deve criar, editar, consultar e ordenar itens do Product Backlog.
- Critério de aceitação:
  - o Coordenador (Product Owner) consegue criar um item com título, descrição, prioridade e frente;
  - itens podem ser editados e reordenados;
  - usuários sem a permissão adequada não alteram o backlog;
  - as alterações ficam registradas no histórico.

#### BP-04 — Planejar Sprint e Sprint Backlog

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF04-RF05
- Descrição: A equipe deve selecionar itens para uma Sprint e registrar a Meta da Sprint sem confundir o Product Backlog com o Sprint Backlog.
- Critério de aceitação:
  - é possível criar ou abrir uma Sprint para planejamento;
  - a equipe seleciona itens existentes no Product Backlog;
  - a Meta da Sprint é obrigatória antes do início;
  - o mesmo item não é duplicado na mesma Sprint;
  - a seleção mantém ordem própria no Sprint Backlog.

#### BP-05 — Visualizar e atualizar fluxo Kanban

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF06-RF07
- Descrição: A equipe deve visualizar o fluxo real de trabalho e movimentar itens entre estados autorizados.
- Critério de aceitação:
  - as colunas são apresentadas em ordem configurada;
  - o usuário autorizado consegue movimentar um item;
  - transições inválidas são rejeitadas com explicação;
  - o limite de WIP é validado no momento da movimentação;
  - a alteração gera histórico.

#### BP-06 — Registrar e resolver bloqueios

- Prioridade: Alta
- Tipo: Produto
- Requisito: RF08
- Descrição: Membros e Scrum Masters devem registrar, acompanhar e resolver bloqueios associados aos itens de trabalho.
- Critério de aceitação:
  - um bloqueio possui descrição, responsável e status;
  - o item apresenta visualmente o bloqueio aberto;
  - usuários autorizados conseguem atualizar ou resolver o bloqueio;
  - abertura e resolução ficam registradas no histórico.

#### BP-07 — Relacionar itens, frentes, entregas e prazos

- Prioridade: Alta
- Tipo: Produto
- Requisito: RF09
- Descrição: O sistema deve relacionar o trabalho às frentes, Sprints, responsáveis, entregas e prazos correspondentes.
- Critério de aceitação:
  - cada item possui uma frente identificável;
  - itens podem ser associados a uma Sprint;
  - entregas podem reunir contribuições de vários itens;
  - prazos aparecem na visão geral e na agenda;
  - coordenadores conseguem consultar os vínculos.

#### BP-08 — Consultar entregas e histórico

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF10-RF11
- Descrição: Coordenador (Product Owner) e Scrum Master/Scrum Master Assistente devem consultar entregas e histórico por frente, Sprint, período e status.
- Critério de aceitação:
  - é possível filtrar entregas por frente e Sprint;
  - o Coordenador (Product Owner) visualiza todos os planos das frentes;
  - mudanças relevantes ficam consultáveis;
  - o histórico informa ator, data, ação e contexto;
  - nenhum registro histórico é apagado por uma alteração comum.

#### BP-09 — Enviar arquivos para o Google Drive

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF12-RF13
- Descrição: Membros autorizados devem enviar arquivos para o diretório Google Drive configurado e vinculá-los a itens ou entregas.
- Critério de aceitação:
  - o arquivo é enviado somente para a pasta autorizada;
  - o usuário visualiza progresso, sucesso ou falha;
  - o vínculo armazena nome, tipo, tamanho, URL e identificador externo;
  - o conteúdo binário não é duplicado no banco;
  - falha ou retry não cria vínculo concluído incorreto.

#### BP-10 — Enviar notificações por Gmail

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF14-RF16
- Descrição: O Scrum Master/Scrum Master Assistente deve redigir, revisar e enviar notificações aos membros do projeto via Gmail.
- Critério de aceitação:
  - o Scrum Master/Scrum Master Assistente seleciona destinatários permitidos;
  - existe prévia antes da confirmação;
  - o sistema só apresenta sucesso após confirmação do Gmail;
  - falhas ficam registradas como pendentes ou falhas;
  - o envio gera auditoria e evita duplicidade acidental.

#### BP-11 — Manter agenda interna do projeto

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF17, RF19, RF20
- Descrição: O sistema deve apresentar reuniões, prazos e lembretes, destacando a reunião principal de quarta-feira.
- Critério de aceitação:
  - terça e quarta aparecem das 08:00 às 10:00;
  - a quarta-feira é identificada como principal reunião de acompanhamento;
  - feriados podem ser marcados como exceções;
  - a agenda funciona mesmo sem conexão com o Google Calendar.

### Melhorias e expansão

#### BP-12 — Sincronizar eventos com Google Calendar

- Prioridade: Média
- Tipo: Produto
- Requisito: RF18
- Descrição: O sistema deve criar ou atualizar eventos no Google Calendar quando a integração estiver habilitada.
- Critério de aceitação:
  - o evento local pode ser sincronizado com autorização;
  - o identificador externo é armazenado;
  - alterações locais podem gerar atualização controlada;
  - falha externa não remove o evento local;
  - a integração pode ser desativada sem interromper a agenda interna.

#### BP-13 — Painel de acompanhamento por frente

- Prioridade: Média
- Tipo: Produto
- Requisitos: RF02, RF11
- Descrição: Coordenador (Product Owner) e Scrum Master/Scrum Master Assistente devem visualizar o andamento comparado das quatro frentes.
- Critério de aceitação:
  - é possível filtrar por frente;
  - itens em progresso, bloqueados e concluídos ficam distinguíveis;
  - os dados respeitam as permissões do usuário;
  - o painel não cria Scrum Teams separados.

#### BP-14 — Métricas de fluxo

- Prioridade: Baixa
- Tipo: Produto
- Requisitos: RF06-RF10
- Descrição: O sistema poderá apresentar WIP, lead time e taxa de entrega após o fluxo real possuir dados suficientes.
- Critério de aceitação:
  - as métricas usam histórico real de movimentações;
  - o período de análise é informado;
  - dados insuficientes são sinalizados;
  - métricas não são apresentadas como avaliação automática de conformidade Scrum.

#### BP-15 — Notificar eventos e prazos no Telegram

- Prioridade: Alta
- Tipo: Produto
- Requisitos: RF21-RF23
- Descrição: O sistema deve enviar ao chat "PETBSI notificações" no Telegram, por meio de bot, notificações automáticas de eventos do projeto (itens movidos, bloqueios, Sprints e entregas) e lembretes de prazos de tarefas, como "A tarefa X falta Y dias para o prazo final.".
- Critério de aceitação:
  - o envio usa somente o chat "PETBSI notificações" configurado;
  - eventos do projeto geram mensagens automáticas com registro de status;
  - prazos próximos de tarefas geram lembretes no formato "A tarefa X falta Y dias para o prazo final.";
  - tarefa sem prazo definido não gera lembrete de prazo;
  - falha do Telegram mantém a mensagem pendente e os dados locais intactos;

## Backlog técnico

#### BT-01 — Implementar autenticação e autorização por projeto

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF01, RNF01-RNF03
- Descrição: Criar a camada server-side de sessão, vínculo com projeto e autorização por papel.
- Entregáveis:
  - adapter de autenticação;
  - validação de sessão;
  - resolução de `ProjectMembership`;
  - proteção de rotas e casos de uso;
  - testes de acesso permitido e negado.

#### BT-02 — Modelar banco Neon e migrations

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF09-RF10, RNF10
- Descrição: Implementar schema PostgreSQL, chaves, índices e migrações para o núcleo do domínio.
- Entregáveis:
  - tabelas de projeto, pessoas, frentes e duplas;
  - tabelas de backlog, Sprint, fluxo e bloqueios;
  - tabelas de entregas, prazos e auditoria;
  - constraints e índices principais;
  - seeds somente para dados validados.

#### BT-03 — Implementar domínio e políticas Scrum/Kanban

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF04-RF08, RN01-RN05
- Descrição: Criar entidades, value objects e regras de transição sem dependência de framework.
- Entregáveis:
  - políticas de WIP;
  - estados de item e Sprint;
  - regras de Product Backlog e Sprint Backlog;
  - bloqueios e histórico append-only;
  - testes unitários de domínio.

#### BT-04 — Implementar casos de uso do núcleo

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF02-RF11
- Descrição: Criar os casos de uso para visão geral, backlog, Sprint, fluxo, bloqueios, entregas e histórico.
- Entregáveis:
  - ports de repositories;
  - casos de uso da aplicação;
  - DTOs e presenters;
  - fakes para testes;
  - testes de aplicação.

#### BT-05 — Implementar frontend do núcleo operacional

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF02-RF11, RNF06-RNF09
- Descrição: Construir as telas Next.js para visão geral, backlog, Sprint, fluxo, bloqueios, entregas e pessoas.
- Entregáveis:
  - layouts e navegação protegida;
  - componentes por domínio;
  - estados de loading, vazio, erro e acesso negado;
  - responsividade e acessibilidade;
  - testes dos fluxos críticos.

#### BT-06 — Implementar gateway do Google Drive

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF12-RF13, RNF01, RNF04-RNF05
- Descrição: Encapsular OAuth e upload de arquivos para o `folder_id` configurado.
- Entregáveis:
  - port `FileStorageGateway`;
  - adapter Google Drive;
  - validação de tipo e tamanho;
  - status pendente, concluído e falho;
  - retry e idempotência controlados.

#### BT-07 — Implementar gateway do Gmail

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF14-RF16, RNF01, RNF04-RNF05
- Descrição: Encapsular o envio de mensagens por Gmail sem leitura da caixa de entrada.
- Entregáveis:
  - port `EmailGateway`;
  - composição e validação de destinatários;
  - status geral e individual;
  - chave de idempotência;
  - auditoria sem exposição de segredos.

#### BT-08 — Implementar agenda interna e gateway Calendar

- Prioridade: Média
- Tipo: Técnico
- Requisitos: RF17-RF20, RNF04-RNF05
- Descrição: Criar agenda local e adapter opcional para sincronização com Google Calendar.
- Entregáveis:
  - eventos de terça e quarta;
  - regras de feriados;
  - port `CalendarGateway`;
  - sincronização idempotente;
  - modo local sem integração externa.

#### BT-09 — Implementar auditoria e observabilidade

- Prioridade: Média
- Tipo: Técnico
- Requisitos: RF10, RNF10
- Descrição: Registrar mudanças relevantes, operações externas e falhas de forma sanitizada.
- Entregáveis:
  - tabela e port de auditoria;
  - logs estruturados;
  - correlação de operações;
  - proteção contra tokens e dados sensíveis nos logs.

#### BT-10 — Implementar testes e validação de integração

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RNF01-RNF10
- Descrição: Implementar a pirâmide de testes definida no plano de testes.
- Entregáveis:
  - testes de domínio;
  - testes de aplicação;
  - testes PostgreSQL;
  - contratos dos gateways Google;
  - testes E2E do núcleo e integrações controladas.

#### BT-11 — Implementar gateway do Telegram e lembretes de prazo

- Prioridade: Alta
- Tipo: Técnico
- Requisitos: RF21-RF23, RN14, RNF01, RNF04-RNF05
- Descrição: Encapsular o envio de mensagens ao chat "PETBSI notificações" e gerar lembretes de prazo de tarefas a partir das datas registradas de `Deadline`.
- Entregáveis:
  - port `TelegramGateway` e adapter do bot;
  - geração de mensagens de evento e de lembrete de prazo ("A tarefa X falta Y dias para o prazo final.");
  - envio agendado pelo Agendador (A08) com enfileiramento de mensagens;
  - status pendente, concluído e falho com idempotência;
  - testes e auditoria sem exposição de segredos do Telegram.

## Priorização

### P0 — MVP obrigatório

- BP-01 — Autenticar participantes autorizados
- BP-02 — Exibir visão geral
- BP-03 — Gerenciar Product Backlog
- BP-04 — Planejar Sprint e Sprint Backlog
- BP-05 — Visualizar e atualizar fluxo Kanban
- BP-06 — Registrar e resolver bloqueios
- BP-07 — Relacionar itens, frentes, entregas e prazos
- BP-08 — Consultar entregas e histórico
- BP-11 — Manter agenda interna
- BT-01 — Autenticação e autorização
- BT-02 — Banco Neon e migrations
- BT-03 — Domínio Scrum/Kanban
- BT-04 — Casos de uso do núcleo
- BT-05 — Frontend do núcleo
- BT-10 — Testes essenciais

### P1 — Integrações essenciais

- BP-09 — Enviar arquivos para Google Drive
- BP-10 — Enviar notificações por Gmail
- BP-15 — Notificar eventos e prazos no Telegram
- BT-06 — Gateway Google Drive
- BT-07 — Gateway Gmail
- BT-09 — Auditoria e observabilidade
- BT-11 — Gateway do Telegram e lembretes de prazo

### P2 — Evolução opcional

- BP-12 — Sincronizar Google Calendar
- BP-13 — Painel por frente
- BP-14 — Métricas de fluxo
- BT-08 — Agenda e gateway Calendar

## Dependências principais

1. BT-01 deve preceder operações protegidas.
2. BT-02 depende do modelo de dados validado em `05-modelo-de-dados.md`.
3. BT-03 deve ser implementado antes dos casos de uso do fluxo.
4. BT-04 depende do domínio e dos repositories.
5. BT-05 depende dos contratos da aplicação e das regras de autorização.
6. BT-06 e BT-07 dependem de OAuth, contas Google e políticas de escopo.
7. BT-08 depende da validação da agenda interna e do calendário acadêmico.
8. BT-11 depende do modelo de `Deadline` validado, do Agendador e da integração base do Telegram.

## Resumo executivo

O backlog prioriza primeiro o núcleo operacional do projeto: autenticação, visão geral, Product Backlog, Sprints, fluxo Kanban, bloqueios, entregas e histórico. Em seguida entram Drive, Gmail e Telegram, por serem integrações diretamente solicitadas para arquivos, notificações e lembretes de prazo. Calendar, métricas e painéis avançados permanecem como evolução controlada, sem comprometer o funcionamento local do sistema.

## Referências

- [Roteiro do projeto](../roteiro.md)
- [02 — Requisitos](../especificao-de-software/02-requisitos.md)
- [03 — Casos de Uso](../especificao-de-software/03-casos-de-uso.md)
- [05 — Modelo de Dados](../especificao-de-software/05-modelo-de-dados.md)
- [12 — Plano de Testes](../especificao-de-software/12-plano-de-testes.md)
