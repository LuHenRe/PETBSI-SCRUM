# Proposta de Criação de Projeto

## Sistema Web de Gestão Ágil do Projeto Acadêmico

**Natureza do documento:** Proposta comercial e de escopo  
**Versão:** 1.0  
**Status:** proposta para validação  
**Data:** 07 de setembro de 2026

---

## 1. Apresentação

Esta proposta apresenta a criação de um sistema web sob medida para apoiar a gestão, o acompanhamento e a transparência de um projeto acadêmico multidisciplinar.

O software será concebido para uma equipe de oito pessoas, organizada em quatro duplas, com diferentes frentes e funções, mas reunida em um único Scrum Team. Uma das duplas atuará como apoio de Gestão Ágil e Scrum Master; a responsabilidade formal de Scrum Master será exercida por uma pessoa por vez, podendo alternar entre a dupla. Os coordenadores acompanharão todos os membros, as entregas e os resultados do projeto.

A solução combinará **Scrum**, como estrutura de organização do trabalho, e **Kanban**, como método complementar para visualização, gestão e melhoria do fluxo. O objetivo é oferecer uma visão operacional comum, reduzir a dispersão de informações e transformar o trabalho cotidiano em evidências úteis para acompanhamento e relatórios.

## 2. Resumo Executivo

O projeto propõe o desenvolvimento de uma aplicação web centralizada para:

- organizar objetivos, Product Backlog e Sprints;
- acompanhar o Sprint Backlog e o fluxo real do trabalho;
- evidenciar trabalho em progresso, bloqueios, prazos e entregas;
- apresentar uma visão compartilhada das quatro frentes do projeto;
- apoiar os Scrum Masters sem criar uma gestão centralizadora de tarefas;
- dar aos coordenadores maior transparência sobre andamento e resultados;
- armazenar histórico suficiente para acompanhamento e prestação de contas;
- integrar arquivos, mensagens e lembretes aos serviços Google utilizados pela equipe.

O produto não será apenas uma lista de tarefas. Ele representará o sistema de trabalho do projeto, relacionando metas, prioridades, Sprints, fluxo, pessoas, entregas e histórico em um único ambiente.

## 3. Contexto e Oportunidade

Projetos acadêmicos multidisciplinares reúnem atividades de ensino, pesquisa, desenvolvimento, extensão, documentação e gestão. Quando essas atividades são acompanhadas por canais dispersos, torna-se mais difícil responder com precisão:

- o que deve ser realizado;
- o que foi assumido pela equipe;
- qual trabalho está em andamento;
- quais itens estão bloqueados;
- quais entregas foram concluídas;
- como cada frente contribui para o objetivo comum;
- quais informações serão necessárias para acompanhamento e relatórios.

Essa fragmentação aumenta o esforço de coordenação e reduz a capacidade de inspeção e adaptação. A proposta enfrenta esse problema com um ambiente operacional compartilhado, orientado por transparência e por dados produzidos durante o próprio trabalho.

## 4. Objetivos do Projeto

### 4.1 Objetivo geral

Desenvolver uma aplicação web para apoiar o planejamento, a execução, a inspeção e a melhoria contínua de um projeto acadêmico multidisciplinar organizado com Scrum e Kanban.

### 4.2 Objetivos específicos

1. Centralizar a visão do projeto, suas metas, prioridades, prazos e entregas.
2. Preservar a distinção entre Product Backlog e Sprint Backlog.
3. Tornar visível o fluxo real do trabalho e o trabalho em progresso.
4. Registrar bloqueios, mudanças de estado e decisões relevantes.
5. Apoiar o acompanhamento das quatro frentes sem dividi-las em Scrum Teams independentes.
6. Facilitar a atuação dos Scrum Masters como agentes de transparência, inspeção e adaptação.
7. Permitir que coordenadores e professores acompanhem o andamento sem depender de informações dispersas.
8. Integrar arquivos ao Google Drive, notificações ao Gmail e lembretes ao Google Calendar, conforme autorização.
9. Criar histórico útil para avaliações, prestação de contas e relatórios posteriores.

## 5. Solução Proposta

Será criada uma aplicação web com frontend em Next.js, persistência em banco PostgreSQL hospedado no Neon e acesso protegido por servidor.

A experiência será organizada pelas seguintes áreas:

- Visão geral do projeto;
- Produto e objetivos;
- Product Backlog;
- Sprint atual;
- Fluxo Kanban;
- Frentes de trabalho;
- Entregas e histórico;
- Arquivos;
- Notificações;
- Agenda;
- Pessoas e responsabilidades;
- Configurações e integrações.

As integrações externas serão encapsuladas no servidor. O frontend não terá acesso direto ao banco, a tokens OAuth ou a credenciais Google.

### 5.1 Frentes contempladas

| Frente | Finalidade |
|---|---|
| Ensino e Nivelamento | Tutoria por pares, planejamento didático e materiais de apoio |
| Pesquisa e Desenvolvimento de IA | Pesquisa em PLN, Aprendizado de Máquina e protótipo de Tutor Virtual |
| Extensão e Letramento Algorítmico | Relacionamento com a comunidade, materiais e oficinas |
| Gestão Ágil | Acompanhamento transversal, fluxo, entregas e suporte à coordenação |

As frentes serão usadas como perspectivas de organização e acompanhamento do trabalho, mantendo todos os participantes em um único Scrum Team.

## 6. Escopo do MVP

### 6.1 Funcionalidades incluídas

#### Gestão do projeto e papéis

- cadastro e identificação dos participantes autorizados;
- representação de duplas, frentes e responsabilidades;
- distinção entre membros, Scrum Masters, Product Owner, coordenadores e stakeholders;
- controle de acesso baseado no vínculo da pessoa com o projeto e em seu papel.

#### Scrum

- cadastro da Meta do Produto;
- cadastro e ordenação do Product Backlog;
- criação e acompanhamento de Sprints;
- registro da Meta da Sprint;
- seleção e acompanhamento do Sprint Backlog;
- visualização de progresso e entregas;
- apoio aos eventos Scrum, sem transformar o sistema em um substituto das reuniões presenciais.

#### Kanban

- quadro visual baseado no fluxo real da equipe;
- movimentação de itens entre estados;
- visualização de trabalho em progresso;
- configuração de limites de WIP quando definidos;
- políticas explícitas de movimentação;
- registro e acompanhamento de bloqueios;
- histórico de mudanças de estado;
- suporte à observação futura de WIP, lead time e taxa de entrega.

#### Entregas, prazos e histórico

- cadastro de entregas e resultados verificáveis;
- associação entre itens, Sprints, frentes e entregas;
- cadastro de prazos acadêmicos e operacionais;
- consulta por Sprint, frente, período e status;
- registro de mudanças relevantes para acompanhamento e relatórios.

#### Integração com Google Drive

- envio de arquivos para um diretório Google Drive já existente;
- associação do arquivo a um item de trabalho ou entrega;
- armazenamento de metadados e identificador externo, sem duplicar o binário no banco;
- abertura do arquivo por link do Drive;
- indicação de status, sucesso e falha da operação.

#### Integração com Gmail

- composição de mensagens para membros autorizados;
- seleção de destinatários do projeto;
- prévia antes do envio;
- envio de notificações por Gmail conforme autorização;
- registro de status, destinatários, data e auditoria da operação;
- tratamento de erro recuperável e prevenção de duplicidade acidental.

#### Integração com Google Calendar

- agenda interna para reuniões, prazos e eventos;
- configuração das reuniões de terça e quarta-feira;
- destaque da quarta-feira como principal reunião de acompanhamento;
- criação ou sincronização opcional com o Google Calendar;
- preservação do funcionamento da agenda interna caso a integração esteja desativada.

### 6.2 Cadência presencial considerada

| Dia | Horário | Finalidade operacional |
|---|---:|---|
| Terça-feira | 08:00–10:00 | Inspeção do trabalho, alinhamentos e atualização do fluxo |
| Quarta-feira | 08:00–10:00 | Apresentação de atualizações, andamento dos projetos e adaptações |

As reuniões não ocorrerão em feriados. A solução poderá registrar essa exceção e manter a agenda coerente com o calendário acadêmico.

## 7. Integrações e Segurança

As integrações Google utilizarão OAuth 2.0 com consentimento explícito e escopos mínimos necessários.

### 7.1 Princípios de segurança

- tokens e segredos permanecerão no servidor;
- o navegador não acessará diretamente as APIs Google;
- autorizações serão verificadas no servidor em cada operação;
- o destino do Drive será resolvido por configuração autorizada, não por pasta arbitrária enviada pelo cliente;
- os escopos de Drive, Gmail e Calendar serão reduzidos ao necessário;
- operações externas terão status, tratamento de erro e auditoria;
- falhas Google não impedirão o uso dos dados locais do sistema;
- o conteúdo binário dos arquivos não será duplicado no banco;
- a conexão com serviços externos poderá ser revogada.

### 7.2 Premissas para integração

Para ativação das integrações, será necessário definir e disponibilizar:

- conta Google institucional ou responsável pela conexão;
- identificador da pasta existente no Google Drive;
- calendário de destino, se Calendar for ativado;
- política de remetente e destinatários do Gmail;
- aprovação dos escopos OAuth;
- regras de compartilhamento e permissões dos arquivos.

## 8. Abordagem de Desenvolvimento

O desenvolvimento seguirá uma abordagem incremental e orientada a validação com os usuários do projeto.

### Fase 1 — Descoberta e validação

- confirmar composição das duplas e responsabilidades;
- validar a Meta do Produto e a primeira Meta da Sprint;
- mapear o fluxo real de trabalho;
- identificar estados, políticas e limites de WIP;
- confirmar necessidades dos coordenadores, professores e participantes;
- definir regras de feriados, prazos e relatórios.

### Fase 2 — Especificação e desenho

- detalhar requisitos e casos de uso;
- validar navegação e telas do frontend;
- consolidar o modelo de dados;
- definir autenticação, autorização e escopos Google;
- preparar contratos dos gateways de Drive, Gmail e Calendar;
- definir critérios de aceite.

### Fase 3 — Implementação do núcleo

- implementar domínio e regras Scrum/Kanban;
- implementar banco e repositórios;
- implementar autenticação e autorização;
- criar visão geral, backlog, Sprint e fluxo;
- implementar histórico, bloqueios e entregas.

### Fase 4 — Integrações e validação

- implementar upload para Drive;
- implementar envio de notificações por Gmail;
- implementar agenda interna e Calendar opcional;
- validar operações com contas e permissões reais;
- executar testes funcionais, de integração e de segurança.

### Fase 5 — Entrega e evolução

- realizar apresentação da versão inicial;
- corrigir inconsistências encontradas na validação;
- documentar operação e configuração;
- preparar backlog de evolução;
- acompanhar os primeiros ciclos de uso.

Os prazos e a ordem detalhada das entregas deverão ser definidos após a validação das premissas e da disponibilidade da equipe.

## 9. Entregáveis

Ao longo do projeto, serão produzidos os seguintes entregáveis:

1. Aplicação web funcional para o MVP.
2. Frontend responsivo com as áreas definidas neste documento.
3. Banco de dados PostgreSQL no Neon, com schema e migrações versionadas.
4. Autenticação e autorização conforme os papéis do projeto.
5. Integração com o diretório Google Drive configurado.
6. Integração de envio de notificações pelo Gmail.
7. Agenda interna e integração opcional com Google Calendar.
8. Histórico e auditoria de operações relevantes.
9. Testes unitários, de aplicação, integração e fluxos críticos do frontend.
10. Documentação técnica e instruções de configuração.
11. Registro das decisões e pendências para evolução do produto.

## 10. Fora do Escopo

Não fazem parte desta proposta inicial:

- múltiplos projetos ou organizações;
- múltiplos Scrum Teams independentes;
- plataforma genérica para qualquer processo de trabalho;
- editor totalmente configurável de workflows;
- curso completo sobre Scrum e Kanban dentro da aplicação;
- inteligência artificial;
- analytics sofisticado ou previsão automática;
- funcionamento offline-first e sincronização local;
- geolocalização, câmera ou sensores;
- relatórios institucionais totalmente automatizados;
- acesso amplo à caixa de entrada do Gmail;
- armazenamento dos arquivos binários no banco da aplicação;
- integração com serviços externos além dos descritos, sem nova avaliação.

Funcionalidades adicionais poderão ser analisadas como evolução, mediante revisão de escopo, esforço, prazo e investimento.

## 11. Benefícios Esperados

### Para os participantes

- maior clareza sobre prioridades e responsabilidades;
- visão do trabalho das demais frentes;
- identificação antecipada de bloqueios;
- menor dependência de mensagens e planilhas dispersas;
- acesso simples a arquivos, entregas e histórico.

### Para os Scrum Masters

- melhor condição para facilitar eventos e inspeções;
- visualização de gargalos e trabalho em progresso;
- suporte à melhoria do fluxo sem centralizar a execução;
- políticas e responsabilidades mais transparentes.

### Para coordenadores e professores

- acompanhamento transversal do projeto;
- visibilidade sobre prazos, entregas e andamento;
- histórico organizado para avaliações e relatórios;
- comunicação mais consistente com os membros;
- redução do esforço necessário para reconstruir informações do projeto.

### Para o projeto acadêmico

- base comum de transparência;
- maior capacidade de inspeção e adaptação;
- integração entre frentes diferentes;
- melhoria contínua apoiada por dados reais de trabalho;
- preservação do conhecimento produzido durante a execução.

## 12. Critérios de Aceite

O MVP será considerado apto para validação quando:

1. participantes autorizados conseguirem acessar o projeto conforme seus papéis;
2. a equipe conseguir consultar e atualizar Product Backlog, Sprint Backlog e fluxo;
3. a aplicação distinguir claramente trabalho planejado, em progresso, bloqueado e concluído;
4. os limites e políticas de WIP configurados forem respeitados ou sinalizados;
5. bloqueios, entregas e mudanças relevantes forem registrados no histórico;
6. coordenadores conseguirem consultar o andamento das quatro frentes;
7. arquivos forem enviados ao diretório Drive configurado e vinculados ao contexto correto;
8. notificações forem redigidas, revisadas e enviadas pelo Gmail com status registrado;
9. a agenda interna representar as reuniões de terça e quarta, com destaque para quarta-feira;
10. a integração com Calendar puder ser habilitada ou desabilitada sem interromper o sistema;
11. falhas externas exibirem mensagens compreensíveis sem corromper os dados locais;
12. os testes essenciais e a documentação de configuração forem entregues.

## 13. Responsabilidades das Partes

### Responsabilidades da equipe de desenvolvimento

- implementar o escopo aprovado;
- comunicar riscos, bloqueios e dependências;
- manter a documentação técnica atualizada;
- proteger credenciais e dados do projeto;
- realizar testes e validações previstas;
- apresentar incrementos para inspeção;
- registrar decisões técnicas relevantes.

### Responsabilidades do projeto contratante ou responsável acadêmico

- validar requisitos, papéis e prioridades;
- disponibilizar acesso às contas e configurações Google necessárias;
- informar a pasta do Drive e as políticas de compartilhamento;
- indicar responsáveis por Product Owner, Scrum Master e coordenação;
- fornecer feedback nas validações;
- participar da definição do fluxo real, políticas e critérios de aceite;
- manter a disponibilidade dos responsáveis para decisões de domínio.

## 14. Premissas, Riscos e Dependências

| Item | Impacto | Tratamento proposto |
|---|---|---|
| Papéis ainda não definidos formalmente | Alto | Validar responsáveis antes da implementação de permissões |
| Fluxo real ainda não observado em detalhe | Alto | Fazer mapeamento colaborativo antes de fixar colunas e WIP |
| Aprovação dos escopos Google | Alto | Revisar OAuth e permissões antes dos testes reais |
| Pasta Drive sem permissão adequada | Médio/Alto | Validar conta responsável e compartilhamento |
| Limites de envio Gmail | Médio | Usar escopos mínimos, deduplicação e política de envio |
| Falhas ou indisponibilidade Google | Médio | Manter estados locais e operações recuperáveis |
| Mudanças frequentes de prioridade | Médio | Usar Product Backlog ordenado e registro de decisões |
| Ausência em reuniões por feriados | Baixo/Médio | Registrar calendário acadêmico e exceções |

## 15. Investimento e Condições Comerciais

Os valores, condições de pagamento e prazos comerciais deverão ser preenchidos após a validação do escopo técnico, dos responsáveis, do nível de acabamento esperado e da disponibilidade da equipe.

| Item | Condição |
|---|---|
| Investimento de desenvolvimento | A definir após validação do escopo |
| Prazo de execução | A definir após planejamento detalhado |
| Forma de pagamento | A definir entre as partes |
| Custos de infraestrutura | Neon, APIs Google e demais serviços conforme contratação e consumo |
| Custos de manutenção | A definir em proposta complementar ou contrato de suporte |
| Validade desta proposta | A definir na versão comercial aprovada |

Os custos de serviços de terceiros, como infraestrutura de banco, APIs Google, armazenamento, limites de uso e eventual verificação da aplicação, não estão incluídos no investimento de desenvolvimento, salvo disposição contratual expressa.

## 16. Evoluções Futuras

Após a validação do MVP, poderão ser avaliadas:

- múltiplos projetos;
- relatórios institucionais assistidos;
- métricas e painéis avançados de fluxo;
- notificações automáticas baseadas em regras mais amplas;
- integração com outros calendários ou provedores de comunicação;
- funcionamento offline ou experiência PWA;
- recursos adicionais de acessibilidade e internacionalização;
- integrações acadêmicas e administrativas conforme necessidade comprovada.

Essas evoluções não fazem parte do escopo atual e deverão ser priorizadas em novo backlog.

## 17. Conclusão

A criação deste sistema representa uma oportunidade de transformar a gestão do projeto acadêmico em um processo mais transparente, integrado e orientado por evidências. Ao combinar Scrum e Kanban de maneira coerente, a aplicação apoiará tanto a organização das Sprints quanto a melhoria do fluxo cotidiano.

O resultado esperado é um ambiente único no qual estudantes, Scrum Masters, coordenadores e professores possam compreender o estado real do trabalho, agir sobre bloqueios, acompanhar entregas e preservar informações úteis para o futuro.

A proposta recomenda iniciar pela validação das decisões de domínio e pela consolidação do escopo do MVP. Com essas definições aprovadas, o projeto poderá avançar para o detalhamento da arquitetura, implementação incremental e validação contínua com os usuários.

## 18. Referências

- [README do projeto](../README.md)
- [Documento de encerramento da Fase 1](fase-1-exploracao-ideias.md)
- [Especificação técnica](especificacao-tecnica.md)
- [Roteiro do projeto](roteiro.md)
- [Backlog inicial](backlog/backlog.md)
- [Especificação de software](especificao-de-software/01-visao-produto.md)
- [Guia Kanban](sources/guiaKanban.pdf)
- [Guia Scrum](sources/guiaScrum.pdf)
