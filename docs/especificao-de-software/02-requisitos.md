# 02 — Requisitos

**Projeto:** Sistema Web de Gestão Ágil do Projeto Acadêmico  
**Versão:** 1.0  
**Status:** proposta para validação  
**Origem:** [01 — Visão do Produto](01-visao-produto.md)

## 1. Objetivo

Este documento formaliza os requisitos funcionais e não funcionais do MVP. Cada requisito deverá originar casos de uso, decisões arquiteturais e testes de aceitação.

## 2. Atores

| ID | Ator | Descrição |
|---|---|---|
| A01 | Usuário autenticado | Pessoa identificada com acesso ao projeto |
| A02 | Membro da equipe | Participante que consulta e atualiza o trabalho das frentes para as quais possui permissão |
| A03 | Scrum Master | Pessoa formalmente responsável, por período, por transparência, inspeção, adaptação, facilitação, configurações técnicas e delimitação de permissões |
| A04 | Product Owner | Pessoa única responsável por maximizar valor, ordenar o Product Backlog e visualizar todos os planos das frentes |
| A05 | Google | Sistema externo para OAuth, Drive, Gmail e Calendar |
| A06 | Telegram | Sistema externo que recebe notificações automáticas no grupo do projeto |
| A07 | Agendador | Ator temporal que dispara lembretes e sincronizações habilitadas |

Para autorização, A03 e A04 são especializações de A02, que por sua vez especializa A01. A dupla de Gestão Ágil é uma unidade de apoio, mas a responsabilidade formal de Scrum Master é individual. O Scrum Master possui a maior permissão do sistema; o Product Owner diferencia-se pela visualização de todos os planos (frentes); os membros só veem ou alteram frentes para as quais possuem permissão de acesso/edição, delimitada pelo Scrum Master.

A05, A06 e A07 são atores de sistema, não papéis de usuário.

## 3. Requisitos funcionais

| ID | Requisito | Prioridade | Ator/origem |
|---|---|---|
| RF01 | O sistema deve autenticar e identificar participantes autorizados do projeto. | Alta | A01 |
| RF02 | O sistema deve exibir visão geral com Sprint, metas, prazos, bloqueios, WIP e entregas recentes. | Alta | A02 |
| RF03 | O Product Owner deve criar, editar e ordenar itens do Product Backlog. | Alta | A04 |
| RF04 | A equipe deve selecionar itens para uma Sprint e manter o Sprint Backlog. | Alta | A02 |
| RF05 | O sistema deve registrar e consultar a Meta do Produto e a Meta da Sprint. | Alta | A04 |
| RF06 | Usuários autorizados devem atualizar o estado real dos itens no fluxo Kanban. | Alta | A02 |
| RF07 | O sistema deve impedir ou alertar movimentações que violem políticas e limites de WIP. | Alta | A03 |
| RF08 | Usuários autorizados devem registrar, atualizar, resolver e consultar bloqueios. | Alta | A02 |
| RF09 | O sistema deve relacionar itens a frente, Sprint, responsáveis e entregas quando aplicável. | Alta | A02 |
| RF10 | O sistema deve registrar histórico de mudanças em itens, Sprints, fluxo, bloqueios e integrações. | Alta | Sistema |
| RF11 | O Product Owner e o Scrum Master devem consultar entregas por frente, Sprint, período e status. | Média | A03/A04 |
| RF12 | O sistema deve enviar arquivos ao diretório Google Drive configurado. | Alta | A02 |
| RF13 | O sistema deve armazenar vínculo e metadados do arquivo sem duplicar conteúdo binário no banco. | Alta | Sistema |
| RF14 | O Scrum Master deve redigir e despachar mensagens para destinatários do projeto. | Média | A03 |
| RF15 | O sistema deve enviar notificações autorizadas por Gmail e registrar o resultado. | Média | A03 |
| RF16 | O sistema deve exibir sucesso, pendência ou falha de cada operação Google. | Alta | A01 |
| RF17 | O Scrum Master deve configurar lembretes de reuniões, prazos e eventos relevantes. | Média | A03 |
| RF18 | O sistema deve criar ou sincronizar eventos com Google Calendar quando habilitado. | Média | A03/A07 |
| RF19 | O sistema deve manter a agenda interna quando Calendar estiver desabilitado ou indisponível. | Alta | Sistema |
| RF20 | O sistema deve distinguir a reunião de terça-feira da reunião principal de quarta-feira, ambas das 08:00 às 10:00 em dias não feriados. | Alta | Sistema |
| RF21 | O Scrum Master deve configurar o grupo do Telegram e o bot responsável pelas notificações. | Média | A03 |
| RF22 | O sistema deve enviar notificações automáticas ao grupo do Telegram sobre eventos do projeto (itens movidos, bloqueios, Sprints e entregas) e registrar o resultado. | Média | A03/A06/Sistema |
| RF23 | O sistema deve exibir sucesso, pendência ou falha de cada operação do Telegram. | Alta | A01 |
| RF24 | O Scrum Master deve delimitar as permissões de acesso e edição dos membros em cada frente (workspace). | Alta | A03 |

## 4. Requisitos não funcionais

| ID | Categoria | Requisito verificável |
|---|---|---|
| RNF01 | Segurança | Tokens, segredos e credenciais Google e do Telegram não podem chegar ao navegador nem ser armazenados em texto puro. |
| RNF02 | Segurança | Toda escrita deve validar sessão, projeto, papel e autorização no servidor. |
| RNF03 | Privacidade | O sistema deve persistir apenas dados Google e Telegram necessários à finalidade autorizada. |
| RNF04 | Disponibilidade | Falha em Drive, Gmail, Calendar ou Telegram não pode impedir consulta e atualização dos dados locais. |
| RNF05 | Confiabilidade | Upload, envio e sincronização devem possuir status explícito e idempotência quando aplicável. |
| RNF06 | Desempenho | A visão geral deve carregar dados locais principais em até 2 segundos em condições normais de rede. |
| RNF07 | Usabilidade | O frontend deve indicar carregamento, vazio, sucesso, erro recuperável, pendência e acesso negado. |
| RNF08 | Acessibilidade | Telas principais devem ser navegáveis por teclado, ter foco visível, contraste adequado e rótulos acessíveis. |
| RNF09 | Manutenibilidade | Domínio e casos de uso não podem depender de React, Next.js, ORM ou SDK Google. |
| RNF10 | Auditoria | Alterações de permissão, fluxo, upload, envio e sincronização devem gerar evento auditável. |

## 5. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | As quatro frentes pertencem ao mesmo Scrum Team e não formam equipes independentes. |
| RN02 | Product Backlog e Sprint Backlog são artefatos distintos. |
| RN03 | A reunião de quarta-feira é o principal momento operacional de acompanhamento, mas não é um evento Scrum adicional. |
| RN04 | Daily Scrum deve apoiar inspeção do progresso e adaptação do Sprint Backlog nos dias efetivos de trabalho. |
| RN05 | A pessoa formalmente responsável por Scrum Master pode alternar, desde que a responsabilidade atual seja explícita. |
| RN06 | A pasta de destino do Drive é definida no servidor e não pode ser escolhida livremente pelo navegador. |
| RN07 | Calendar é opcional; a agenda interna permanece disponível sem a integração externa. |
| RN08 | Falha de serviço externo (Google ou Telegram) não pode apagar ou corromper dados locais. |
| RN09 | O Telegram é um canal de comunicação e notificação entre os membros; não substitui o Product Backlog, o Sprint Backlog nem o fluxo Kanban. |
| RN10 | O Scrum Master configura e delimita as permissões de acesso/edição dos membros em cada frente. |
| RN11 | O Scrum Master é responsável pela configuração das integrações (Google e Telegram). |
| RN12 | Deve existir no máximo um Product Owner ativo por projeto, e o Scrum Master atual deve ser sempre identificável. |

## 6. Rastreabilidade inicial

| Requisito | Próximo artefato |
|---|---|
| RF01, RNF01-RNF03 | 03 — Casos de Uso e autorização |
| RF02, RF09, RF11 | 03 — Casos de Uso de consulta |
| RF03-RF05 | 03 — Casos de Uso de Product Backlog e Sprint |
| RF06-RF08, RN01-RN05 | 03 — Casos de Uso de fluxo e bloqueios |
| RF10, RNF10 | Diagrama de classes, auditoria e persistência |
| RF12-RF16, RNF04-RNF05 | Casos de Uso e sequência das integrações Google |
| RF21-RF23 | Casos de Uso e sequência da integração Telegram |
| RF24, RN10 | Casos de Uso de permissões por frente |
| RF17-RF20, RN07 | Casos de Uso e estados de agenda |
| RNF06-RNF09 | Arquitetura, frontend e plano de testes |

## 7. Critérios gerais de aceitação

- Usuários autorizados acessam somente o projeto e as ações compatíveis com seu papel.
- Product Backlog, Sprint Backlog e fluxo são exibidos separadamente.
- Movimentações respeitam políticas de WIP ou informam claramente a exceção.
- Bloqueios, entregas e mudanças relevantes ficam disponíveis no histórico.
- Upload Drive, Gmail, Telegram e Calendar apresentam estado confirmado, pendente ou falho.
- O sistema continua consultável e operacional quando uma integração externa está indisponível.
- Membros acessam e alteram apenas frentes para as quais possuem permissão delimitada pelo Scrum Master.
- Reuniões de terça e quarta aparecem corretamente na agenda, com destaque para quarta-feira.

## 8. Referências

- [01 — Visão do Produto](01-visao-produto.md)
- [Requisitos detalhados de apoio](../requisitos/requisitos.md)
- [Especificação técnica](../especificacao-tecnica.md)
- [Arquitetura](../arquitetura/arquitetura.md)
