# Documento de Encerramento da Fase 1 — Exploração de Ideias

## Sistema Web de Gestão Ágil do Projeto Acadêmico

**Status:** conclusão da Fase 1 — exploração e definição conceitual inicial  
**Direção selecionada:** Ramo A — Espaço operacional Scrum + Método Kanban  
**Natureza do documento:** visão de produto e delimitação conceitual. Não constitui especificação técnica, arquitetura detalhada, modelo de banco de dados ou backlog de implementação.

As definições metodológicas deste documento são fundamentadas prioritariamente no Scrum Guide 2020 e no Guia Oficial do Método Kanban fornecidos ao projeto. O Scrum Guide define Scrum como um framework para geração de valor em problemas complexos, estruturado em torno de Scrum Team, Sprints, eventos e artefatos. O Guia Oficial do Método Kanban estabelece que Kanban deve ser aplicado à forma de trabalho existente, com foco em visualizar, gerenciar e melhorar o fluxo.

---

# 1. Visão Geral e Escopo

## 1.1 Tema e Objetivo

O projeto consiste na concepção de uma aplicação web para acompanhamento transversal do trabalho de um projeto acadêmico composto por diferentes frentes de atuação.

O projeto acadêmico possui quatro frentes principais:

- **Frente 1 — Ensino e Nivelamento:** voltada à tutoria por pares, planejamento didático e materiais de apoio.
- **Frente 2 — Pesquisa e Desenvolvimento de IA:** voltada à pesquisa em Processamento de Linguagem Natural, Aprendizado de Máquina e desenvolvimento do protótipo de Tutor Virtual.
- **Frente 3 — Extensão e Letramento Algorítmico:** voltada ao relacionamento com a comunidade externa, produção de materiais e realização de oficinas.
- **Frente 4 — Gestão Ágil:** responsável pelo acompanhamento transversal do trabalho, apoio ao fluxo, acompanhamento das entregas e suporte à coordenação do projeto.

Além da necessidade cotidiana de organização, o projeto possui obrigações institucionais. Há bolsas envolvidas, prazos e entregas definidos ou acompanhados pelos coordenadores e necessidade de produzir informações que auxiliem o acompanhamento e a elaboração posterior de relatórios.

### Problema Central

O problema não é simplesmente gerenciar tarefas. O projeto precisa de uma forma consistente de tornar visível e acompanhar:

- o que precisa ser realizado;
- o que foi assumido para execução;
- o que está em andamento;
- o que está bloqueado;
- o que foi concluído;
- quais frentes estão envolvidas;
- quais prazos e entregas precisam ser observados;
- como o trabalho das diferentes frentes contribui para os objetivos do projeto;
- quais informações serão necessárias posteriormente para acompanhamento e prestação de contas.

### Objetivo do Aplicativo

O sistema deverá funcionar como um espaço operacional compartilhado para planejamento, acompanhamento e inspeção do trabalho, utilizando Scrum como estrutura principal e o Método Kanban como complemento para gestão do fluxo.

Scrum fornece a estrutura de trabalho baseada em responsabilidades, Sprints, eventos, artefatos e metas. O Método Kanban complementa essa forma de trabalho por meio de visualização, limitação de trabalho em progresso, gestão de fluxo, políticas explícitas, ciclos de feedback e melhoria evolutiva.

### Objetivos Específicos

O produto deverá:

- centralizar a visão do trabalho do projeto;
- proporcionar transparência entre membros e coordenadores;
- permitir acompanhamento transversal das quatro frentes;
- apoiar Product Backlog e Sprint Backlog sem confundir seus significados;
- tornar o fluxo de trabalho visível;
- evidenciar trabalho em progresso e bloqueios;
- permitir aplicação de limites de WIP e políticas explícitas quando definidos;
- apoiar inspeção do progresso em direção às metas;
- registrar histórico suficiente para consultas e relatórios posteriores;
- reduzir dependência de acompanhamento informal ou disperso;
- manter representação metodologicamente coerente de Scrum e Kanban.

O sistema não tem como objetivo principal ensinar Scrum e Kanban por meio de conteúdo didático interno. O aprendizado metodológico poderá ocorrer externamente por meio das fontes oficiais, artigos e orientação acadêmica. O software deverá contribuir para a aprendizagem principalmente por meio da aplicação correta dos conceitos.

---

## 1.2 Delimitação Inicial do Domínio

### Projeto Acadêmico

Projeto acadêmico representa a iniciativa como um todo, envolvendo coordenadores, membros, frentes, objetivos, prazos e entregas.

O termo pertence ao domínio acadêmico e não corresponde a um artefato específico do Scrum.

### Produto

No Scrum, produto é um veículo para entrega de valor, com limite claro, stakeholders conhecidos e usuários ou clientes bem definidos. Portanto, produto não deve ser utilizado como sinônimo de tarefa.

Para fins desta fase, será considerado como hipótese de trabalho o resultado integrado do projeto acadêmico como o produto sobre o qual o Scrum Team atua.

Esse resultado pode se materializar em diferentes entregas de valor, como:

- atividades pedagógicas;
- produção de materiais;
- pesquisa;
- software e protótipos;
- ações extensionistas;
- relatórios;
- outras entregas acadêmicas.

Essa definição deverá ser refinada posteriormente por meio da formulação da Meta do Produto.

### Entrega

Entrega representa um resultado esperado ou produzido pelo projeto, como:

- oficina realizada;
- material pedagógico concluído;
- relatório produzido;
- funcionalidade desenvolvida;
- protótipo experimental;
- pesquisa realizada;
- apresentação;
- outro resultado verificável.

Uma entrega poderá demandar vários itens de trabalho.

### Item de Trabalho

Item de trabalho é o termo genérico preferencial para representar unidades de trabalho que percorrem o fluxo.

Os itens de trabalho podem variar em tipo e granularidade de acordo com a natureza das diferentes frentes.

### Frente de Trabalho

Frente de trabalho representa uma área temática do projeto acadêmico.

As quatro frentes deverão permanecer visíveis porque existem institucionalmente e são relevantes para o acompanhamento dos coordenadores. Contudo, não deverão ser tratadas automaticamente como Scrum Teams independentes.

No sistema, as frentes poderão funcionar como agrupamentos temáticos, perspectivas de acompanhamento ou formas de organização do trabalho dentro de um único Scrum Team.

### Serviço

O termo serviço não será utilizado como sinônimo de pequena tarefa da Sprint.

No Método Kanban, serviço possui relação com entrega de valor e fluxo de solicitações dos clientes. Como ainda não foi demonstrada necessidade suficiente de torná-lo um conceito central do MVP, sua inclusão fica adiada até que exista uma necessidade concreta.

---

## 1.3 Público-Alvo

O MVP atenderá inicialmente uma única equipe acadêmica.

### Participantes do Scrum Team

O contexto atual possui oito pessoas, organizadas em quatro duplas com diferentes frentes e funções, todas pertencentes ao mesmo Scrum Team.

Uma das duplas está associada à Frente 4 — Gestão Ágil e apoia o acompanhamento transversal do trabalho. A composição detalhada das duplas e a distribuição de funções ainda deverão ser validadas.

### Coordenadores

Os coordenadores:

- estabelecem ou negociam prazos;
- avaliam resultados;
- acompanham entregas;
- possuem obrigações relacionadas a relatórios e prestação de contas;
- representam o produto no sistema; um deles, por vez, exerce o Product Owner.

### Product Owner

O Scrum Guide define Product Owner como uma única pessoa, não um comitê.

Para utilização integral de Scrum, um dos coordenadores exerce essa responsabilidade por vez, representando também as necessidades dos demais coordenadores, com alternância análoga à do Scrum Master.

A definição de quem exercerá a responsabilidade em cada período não pertence a esta fase.

### Scrum Master

As duas pessoas da Dupla Ágil atuarão como apoio operacional aos demais membros. A responsabilidade formal de Scrum Master continuará sendo exercida por uma pessoa por vez, com possibilidade de alternância posterior, desde que exista clareza sobre quem a exerce em determinado período.

A dupla não deverá ser tratada como uma gerência responsável por distribuir tarefas.

---

## 1.4 Organização do Trabalho

### Um Único Scrum Team

Por determinação organizacional do projeto acadêmico, os participantes continuarão formando uma única equipe, apesar da variedade das frentes.

As frentes deverão ser utilizadas para organizar e visualizar o trabalho, e não para criar equipes Scrum independentes.

### Trabalho Multidisciplinar

A variedade das atividades é compatível com a definição ampla de Developers utilizada pelo Scrum Guide.

As atividades do projeto podem incluir:

- ensino;
- pesquisa;
- desenvolvimento de software;
- produção de materiais;
- extensão;
- gestão;
- documentação;
- relatórios;
- outras formas de produção de valor.

Essas atividades podem coexistir em um mesmo Scrum Team desde que contribuam para o mesmo produto e para objetivos compartilhados.

---

## 1.5 Cadência de Trabalho

O trabalho presencial e objetivamente organizado ocorre em dois dias da semana.

A Daily Scrum deverá ocorrer em todos os dias efetivos de trabalho da Sprint. No contexto atual, isso corresponde aos dois dias semanais dedicados ao projeto.

A Daily Scrum continua sendo tratada conforme sua definição oficial: um evento para os Developers, com foco na inspeção do progresso em direção à Meta da Sprint e adaptação do Sprint Backlog.

A expressão institucional “Weekly Stand-up” poderá continuar sendo utilizada no contexto acadêmico quando necessário, mas não deverá ser apresentada pelo sistema como nome oficial de um evento Scrum nem como sinônimo de Daily Scrum.

---

## 1.6 Casos de Uso Principais

Nesta fase, os casos de uso representam capacidades conceituais do produto e não requisitos funcionais fechados.

### Participantes

Os participantes poderão:

- visualizar o projeto e seu estado atual;
- consultar objetivos e prazos relevantes;
- consultar o Product Backlog;
- visualizar a Sprint corrente;
- consultar a Meta da Sprint;
- visualizar os itens selecionados para a Sprint;
- registrar e atualizar trabalho;
- visualizar o fluxo do trabalho;
- identificar a frente relacionada a um item;
- registrar bloqueios;
- acompanhar trabalho em progresso;
- consultar trabalho concluído;
- consultar histórico de Sprints e entregas;
- consultar responsabilidades e participantes;
- utilizar informações registradas para acompanhamento do projeto.

### Product Owner

O Product Owner deverá poder:

- estabelecer e comunicar a Meta do Produto;
- criar ou auxiliar na criação de itens do Product Backlog;
- ordenar o Product Backlog;
- garantir sua transparência e compreensão.

### Developers

Os Developers deverão poder:

- selecionar trabalho em Sprint Planning;
- criar e manter o Sprint Backlog;
- adaptar o plano da Sprint;
- atualizar o estado real do trabalho;
- identificar bloqueios;
- inspecionar o progresso em direção à Meta da Sprint;
- organizar-se em torno do trabalho.

### Scrum Master

O Scrum Master utilizará o sistema como apoio à transparência, inspeção, adaptação e facilitação.

O sistema não deverá transformar o Scrum Master em gerente responsável por distribuir tarefas.

### Coordenadores

Os coordenadores deverão poder:

- acompanhar progresso;
- visualizar entregas e resultados;
- observar prazos relevantes;
- definir metas e ordenar o Product Backlog (um coordenador, por vez, exerce o Product Owner);
- consultar histórico útil à elaboração de relatórios;
- fornecer feedback.

---

# 2. Interface e Navegação

A estrutura original fornecida para esta fase fazia referência ao Expo Router. Como este projeto utiliza Next.js, esta seção foi adaptada para descrever a organização conceitual da experiência e da navegação, sem definir implementação de rotas ou componentes.

## 2.1 Princípio da Interface

A interface deverá privilegiar três perguntas centrais:

1. Onde queremos chegar?
2. Em que estado o trabalho realmente está?
3. O que precisa ser inspecionado ou adaptado agora?

Essas perguntas devem orientar a apresentação de metas, trabalho, fluxo, bloqueios e entregas.

---

## 2.2 Áreas Conceituais do Sistema

### Visão Geral do Projeto

Deverá oferecer uma visão resumida do estado corrente, podendo reunir:

- produto e objetivo atual;
- Sprint corrente;
- prazos acadêmicos relevantes;
- frentes;
- trabalho em andamento;
- bloqueios relevantes;
- entregas recentes;
- informações de fluxo.

### Product Backlog

Representará exclusivamente o Product Backlog do Scrum, e não uma lista genérica de pendências.

### Sprint

Deverá oferecer contexto para:

- Meta da Sprint;
- itens selecionados;
- plano de trabalho;
- progresso.

O Sprint Backlog não deverá ser tratado apenas como uma cópia filtrada do Product Backlog.

### Fluxo de Trabalho

Será a principal área de aplicação do Método Kanban e deverá representar:

- estados reais do trabalho;
- itens em progresso;
- itens bloqueados;
- capacidade;
- limites de WIP, quando definidos;
- políticas de movimentação, quando definidas.

As colunas definitivas não serão estabelecidas nesta fase. Elas deverão derivar do fluxo real observado no projeto.

### Frentes

Deverá permitir visualizar o trabalho segundo:

- Ensino e Nivelamento;
- Pesquisa e Desenvolvimento de IA;
- Extensão e Letramento Algorítmico;
- Gestão Ágil.

As frentes funcionarão como perspectiva de organização e acompanhamento.

### Entregas e Histórico

Deverá facilitar consulta posterior sobre:

- o que foi concluído;
- quando foi concluído;
- em qual Sprint ocorreu;
- com qual frente se relaciona;
- a quais objetivos ou entregas está associado.

Essa capacidade é especialmente relevante para prestação de contas e elaboração de relatórios.

### Pessoas e Responsabilidades

Deverá tornar explícitos:

- participantes;
- responsabilidade Scrum atual;
- frente de maior atuação;
- outras informações organizacionais pertinentes.

Deve existir distinção entre pessoa, responsabilidade Scrum e frente de trabalho.

---

## 2.3 Navegação Conceitual

A navegação deverá priorizar relações do domínio, e não a estrutura técnica do framework.

Uma organização conceitual inicial é:

```text
Projeto acadêmico
│
├── Visão geral
├── Produto e objetivos
├── Product Backlog
├── Sprint atual
│   ├── Meta da Sprint
│   ├── Sprint Backlog
│   └── Fluxo atual
├── Frentes
│   ├── Ensino e Nivelamento
│   ├── Pesquisa e Desenvolvimento de IA
│   ├── Extensão e Letramento Algorítmico
│   └── Gestão Ágil
├── Entregas e histórico
└── Pessoas e responsabilidades
```

Essa organização deverá ser validada posteriormente com os usuários.

---

# 3. Disponibilidade e Condições de Acesso

A estrutura original previa uma estratégia offline-first com SQLite. Essa necessidade não foi identificada para este projeto e, portanto, não integra o escopo atual.

## 3.1 Funcionamento Offline

O funcionamento offline completo não faz parte do escopo do MVP.

Não estão previstos nesta fase:

- persistência local obrigatória em SQLite;
- fila de ações offline;
- sincronização bidirecional entre dispositivo e servidor.

Caso a realidade de uso demonstre problemas frequentes de conectividade, essa necessidade poderá ser reavaliada posteriormente.

## 3.2 Continuidade de Uso

Mesmo sem uma estratégia offline-first, o sistema deverá considerar futuramente:

- prevenção de perda acidental de dados;
- indicação clara de salvamento;
- preservação de histórico;
- tratamento de erros temporários;
- consistência das informações entre usuários.

---

# 4. Dados, Persistência e Acesso

A estrutura original fazia referência a Supabase, SQLite, sincronização e RLS. Essas tecnologias não pertencem a este projeto.

As restrições técnicas já estabelecidas são:

- Next.js como framework principal;
- Neon como banco de dados online;
- uma única aplicação;
- acesso protegido a dados pelo lado servidor quando necessário;
- nenhuma credencial ou segredo de banco exposto ao navegador.

Nesta fase não serão definidas tabelas, esquemas de banco, APIs ou mecanismos concretos de autenticação.

## 4.1 Informações Relevantes do Domínio

O sistema provavelmente precisará preservar informações relacionadas a:

- projeto acadêmico;
- produto;
- Meta do Produto;
- Sprint;
- Meta da Sprint;
- Product Backlog;
- itens do Product Backlog;
- Sprint Backlog;
- itens de trabalho;
- entregas;
- estados do fluxo;
- bloqueios;
- frentes;
- participantes;
- responsabilidades Scrum;
- prazos;
- histórico de mudanças relevantes;
- informações necessárias para acompanhamento e relatórios.

Essa lista representa conceitos do domínio e não uma proposta de tabelas de banco.

## 4.2 Autenticação

Como o sistema conterá informações relacionadas ao projeto, seus participantes e acompanhamento acadêmico, é provável que o MVP necessite identificar usuários.

Ainda não estão definidos:

- mecanismo de autenticação;
- provedor;
- recuperação de conta;
- modelo detalhado de autorização.

As permissões deverão ser derivadas dos casos de uso e das responsabilidades reais do domínio.

## 4.3 Histórico e Relatórios

Essa capacidade possui relevância especial porque o projeto recebe bolsas e os coordenadores precisam acompanhar atividades e elaborar relatórios.

O sistema deverá ser concebido para que o trabalho cotidiano gere naturalmente evidências históricas consultáveis.

As informações registradas poderão futuramente apoiar:

- acompanhamento de atividades;
- prestação de contas;
- avaliação de andamento;
- preparação de relatórios;
- análise de entregas por período ou frente.

Modelos específicos de relatório não fazem parte desta fase.

---

# 5. Integração com Hardware e Sensores

Nenhuma necessidade de integração com câmera, geolocalização ou outros sensores foi identificada para o MVP.

## 5.1 Câmera

Fora do escopo atual.

Não existe fluxo essencial que exija:

- captura de fotografias;
- leitura de códigos;
- digitalização de documentos;
- envio de imagens.

## 5.2 Geolocalização

Fora do escopo atual.

Embora a Frente de Extensão atue em escolas e centros de convivência, não foi identificada necessidade de capturar ou rastrear a localização dos usuários pelo aplicativo.

## 5.3 Princípio de Escopo

Integrações com hardware não deverão ser adicionadas sem uma necessidade funcional comprovada.

---

# 6. Princípios de Arquitetura e Qualidade

A estrutura original solicitava definição de diretórios e detalhes técnicos. Esses elementos excedem os limites desta fase.

Esta seção registra apenas diretrizes arquiteturais já estabelecidas para orientar etapas futuras.

## 6.1 Direção Arquitetural

A implementação futura deverá seguir princípios de Clean Architecture em conjunto com Domain-Driven Design.

A solução deverá buscar:

- independência das regras de domínio em relação à interface;
- independência do domínio em relação ao banco de dados;
- separação clara de responsabilidades;
- dependências direcionadas para abstrações adequadas;
- possibilidade de testar regras centrais sem depender da interface ou do banco;
- evitar que particularidades do Next.js definam a linguagem do domínio.

A estrutura concreta de pastas, módulos e camadas será definida em fase posterior.

## 6.2 Domain-Driven Design

DDD será utilizado para apoiar a compreensão e representação do domínio acadêmico e metodológico.

Termos que exigem consistência incluem:

- Projeto;
- Produto;
- Meta do Produto;
- Product Backlog;
- Sprint;
- Sprint Backlog;
- Meta da Sprint;
- Entrega;
- Item de Trabalho;
- Frente;
- Responsabilidade;
- Scrum Master e Scrum Master Assistente;
- Coordenador (Product Owner);
- Membro (Developer), com título padrão "Membro" e exibição "Visitante" quando sem permissão de edição;
- Bloqueio;
- WIP.

Entidades, Value Objects, Aggregates, Domain Services e Bounded Contexts somente deverão ser utilizados quando houver justificativa concreta no domínio.

## 6.3 Clean Code

Clean Code deverá orientar etapas futuras de implementação, especialmente em relação a:

- nomes reveladores de intenção;
- consistência terminológica;
- responsabilidades claras;
- redução de duplicação;
- legibilidade;
- código expressivo.

Termos do domínio não deverão ser utilizados de forma ambígua ou contraditória com as definições estabelecidas.

---

# 7. Aplicação Conjunta de Scrum e Kanban

## 7.1 Scrum como Estrutura Principal

O sistema deverá preservar os conceitos fundamentais de Scrum aplicáveis ao projeto:

- Scrum Team;
- Product Owner (exercido por um coordenador por vez);
- Scrum Master e Scrum Master Assistente;
- Developers (membros);
- Sprint;
- Sprint Planning;
- Daily Scrum;
- Sprint Review;
- Sprint Retrospective;
- Product Backlog;
- Sprint Backlog;
- Incremento;
- Meta do Produto;
- Meta da Sprint;
- Definição de Pronto.

Scrum não deverá ser reduzido ao quadro de trabalho.

## 7.2 Kanban como Gestão do Fluxo

Kanban deverá complementar Scrum por meio de:

- visualização;
- limitação do trabalho em progresso;
- sistema puxado;
- gestão do fluxo;
- políticas explícitas;
- ciclos de feedback;
- melhoria colaborativa e evolucionária;
- observação de métricas como WIP, lead time e taxa de entrega.

## 7.3 Quadro Kanban

O quadro não deverá ser tratado como uma simples representação gráfica do Product Backlog.

Ele deverá representar o movimento dos itens através do fluxo real de trabalho.

As etapas do fluxo deverão ser descobertas com as pessoas que executam o trabalho. Não será definido nesta fase um fluxo genérico do tipo “A Fazer”, “Fazendo” e “Feito”.

---

# 8. Decisões Metodológicas da Fase 1

## 8.1 Direção de Produto

Foi selecionado o Ramo A — Espaço operacional Scrum + Kanban.

O foco principal será operação e acompanhamento real do projeto.

A aprendizagem explícita dentro da aplicação não será prioridade do MVP.

## 8.2 Um Único Scrum Team

As diferentes frentes permanecerão reunidas como uma única equipe.

As frentes serão representadas como agrupamentos do trabalho e não como Scrum Teams independentes.

## 8.3 Product Owner

Um dos coordenadores exerce, por vez, a responsabilidade de Product Owner e representa também os demais coordenadores.

O Product Owner não será modelado como comitê.

## 8.4 Scrum Master

Uma pessoa da Dupla Ágil exercerá a responsabilidade formal de Scrum Master em determinado período, enquanto a outra exerce o papel de Scrum Master Assistente, também com permissões de Administrador Técnico.

A responsabilidade alterna entre o Scrum Master e o Scrum Master Assistente, desde que exista clareza sobre quem a exerce em cada momento. A dupla, como unidade organizacional, não substitui a accountability individual prevista no Scrum.

## 8.5 Daily Scrum

A Daily Scrum ocorrerá em cada dia efetivo de trabalho do projeto.

No contexto atual, isso corresponde aos dois dias semanais dedicados ao trabalho.

## 8.6 Weekly Stand-up

A expressão poderá permanecer no contexto acadêmico informal, mas não será tratada como evento oficial do Scrum nem como sinônimo de Daily Scrum.

## 8.7 Produto

Produto não será utilizado como sinônimo de tarefa.

A definição provisória adotada é o resultado integrado de valor produzido pelo projeto acadêmico, sujeito a refinamento posterior.

## 8.8 Serviço

Serviço não será utilizado como sinônimo de tarefa.

O conceito não será incluído como elemento obrigatório do MVP enquanto não houver necessidade clara de representá-lo.

## 8.9 Backlog

O sistema deverá distinguir explicitamente:

- Product Backlog;
- Sprint Backlog.

Uma lista genérica de pendências não deverá receber automaticamente um desses nomes.

---

# 9. Escopo Conceitual do MVP

## 9.1 Dentro do Escopo

- um único projeto acadêmico;
- um único Scrum Team;
- coordenadores (sem stakeholder ou professor externo ao sistema);
- responsabilidade de Product Owner;
- responsabilidade de Scrum Master;
- quatro frentes;
- Produto e Meta do Produto;
- Product Backlog;
- Sprints;
- Meta da Sprint;
- Sprint Backlog;
- itens de trabalho;
- fluxo visual;
- bloqueios;
- acompanhamento do WIP;
- políticas de trabalho quando definidas;
- entregas;
- prazos acadêmicos;
- histórico;
- consulta de informações úteis a acompanhamento e relatórios.

## 9.2 Fora do Escopo Atual

- múltiplas organizações;
- múltiplos projetos independentes;
- múltiplos Scrum Teams;
- plataforma genérica de gerenciamento de qualquer processo;
- editor totalmente configurável de workflows;
- sistema educacional completo sobre métodos ágeis;
- avaliação automática de conformidade Scrum;
- geolocalização;
- câmera;
- funcionamento offline-first;
- sincronização local e remota;
- inteligência artificial;
- integrações externas sem demanda comprovada;
- relatórios institucionais completamente automatizados;
- analytics sofisticado;
- arquitetura concreta;
- banco de dados detalhado;
- APIs;
- estrutura de diretórios;
- bibliotecas adicionais.

---

# 10. Resultados Esperados

## 10.1 Para os Estudantes

Maior clareza sobre:

- objetivos;
- prioridades;
- trabalho atual;
- andamento das demais frentes;
- bloqueios;
- capacidade;
- entregas realizadas.

## 10.2 Para a Dupla Ágil

Melhores condições para:

- acompanhar o trabalho transversalmente;
- perceber gargalos;
- apoiar eventos Scrum;
- ajudar a tornar políticas e fluxo transparentes;
- contribuir para melhoria do sistema de trabalho sem assumir controle centralizado das tarefas.

## 10.3 Para os Professores

Maior transparência sobre:

- andamento geral;
- entregas;
- prazos;
- frentes;
- trabalho concluído;
- histórico do projeto.

Isso poderá reduzir o esforço necessário para reconstruir posteriormente informações destinadas à avaliação ou aos relatórios.

## 10.4 Para o Projeto

A solução deverá substituir uma visão fragmentada do andamento por uma base comum de transparência, criando melhores condições para inspeção, adaptação e melhoria do fluxo.

---

# 11. Pontos que Permanecem para Validação

Ainda deverão ser definidos ou validados nas próximas fases:

- formulação exata do Produto;
- primeira Meta do Produto;
- duração das Sprints;
- fluxo real dos diferentes tipos de trabalho;
- necessidade de um ou mais fluxos de visualização;
- tipos relevantes de itens de trabalho;
- critérios de entrada no sistema Kanban;
- ponto de comprometimento;
- ponto de entrega;
- limites de WIP adequados;
- políticas de fluxo;
- definição de bloqueio;
- forma de representar prazos acadêmicos;
- informações necessárias aos relatórios;
- ações permitidas para cada responsabilidade;
- necessidade e formato de histórico e auditoria.

Esses elementos não deverão ser antecipados sem investigação correspondente.

---

# 12. Critérios de Sucesso da Ideia

A solução será considerada conceitualmente bem-sucedida se conseguir:

1. fornecer uma visão compartilhada do trabalho das quatro frentes;
2. tornar claro o que está planejado, em progresso, bloqueado e concluído;
3. preservar corretamente a diferença entre Product Backlog e Sprint Backlog;
4. permitir que as frentes continuem existindo sem dividir o Scrum Team em equipes independentes;
5. auxiliar coordenadores no acompanhamento de entregas e histórico;
6. apoiar a Dupla Ágil sem transformá-la em gerência centralizadora;
7. permitir que Kanban melhore o fluxo sem substituir Scrum;
8. evitar que práticas informais sejam apresentadas como regras oficiais;
9. permanecer suficientemente simples para atender ao projeto que motivou sua criação;
10. gerar informação útil a partir do trabalho cotidiano, evitando registros burocráticos sem valor operacional.

---

# 13. Conclusão da Fase 1

O produto é definido, ao final desta fase, como:

> Uma aplicação web para tornar transparente e acompanhar o trabalho de um projeto acadêmico multidisciplinar, utilizando Scrum como estrutura de organização empírica e o Método Kanban para visualizar e melhorar o fluxo, permitindo que membros e coordenadores acompanhem objetivos, Sprints, frentes, trabalho, bloqueios, entregas e histórico de maneira compartilhada.

A principal diferença em relação à ideia inicial é que o produto deixa de ser concebido como um simples gerenciador de tarefas.

A unidade de interesse passa a ser o sistema de trabalho do projeto acadêmico, relacionando objetivos, Product Backlog, Sprints, fluxo, entregas, inspeção e adaptação.

O Método Kanban complementa essa estrutura por meio de visualização, limitação de trabalho em progresso, gestão do fluxo, políticas explícitas, ciclos de feedback e melhoria contínua.

Com isso, a Fase 1 — Exploração de Ideias é considerada encerrada, tendo como direção aprovada o Ramo A — Espaço operacional Scrum + Kanban.

Este documento não define arquitetura concreta, tabelas, APIs, estrutura do Next.js, componentes, bibliotecas ou implementação.

## Atualização posterior ao encerramento da Fase 1

Após o encerramento desta fase, o escopo foi ampliado para considerar integrações com Google Drive, Gmail e Google Calendar. Essas integrações não alteram a decisão de produto da fase 1 e serão detalhadas na [especificação técnica](especificacao-tecnica.md) e na [proposta de criação do projeto](proposta.md), com Calendar tratado como recurso opcional.

O backlog de implementação foi criado posteriormente em [docs/backlog/backlog.md](backlog/backlog.md), a partir dos requisitos e das decisões consolidadas nas fases seguintes. Este documento continua sendo a referência histórica da exploração inicial, enquanto o backlog passa a orientar a seleção da primeira Sprint.
