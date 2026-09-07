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
| A02 | Membro da equipe | Participante que consulta e atualiza o trabalho permitido |
| A03 | Scrum Master | Pessoa formalmente responsável, por período, por transparência, inspeção, adaptação e facilitação |
| A04 | Coordenador | Superior dos membros, com visão ampliada do andamento e resultados |
| A05 | Product Owner | Pessoa única responsável por maximizar valor e ordenar o Product Backlog |
| A06 | Professor/Stakeholder | Pessoa que acompanha resultados e fornece feedback |
| A07 | Administrador técnico | Pessoa que configura autenticação e integrações |
| A08 | Google | Sistema externo para OAuth, Drive, Gmail e Calendar |
| A09 | Agendador | Ator temporal que dispara lembretes e sincronizações habilitadas |

A03, A04, A05, A06 e A07 são especializações de A01 para fins de autorização. A dupla de Gestão Ágil é uma unidade de apoio, mas a responsabilidade formal de Scrum Master é individual.

## 3. Requisitos funcionais

| ID | Requisito | Prioridade | Ator/origem |
|---|---|---|---|
| RF01 | O sistema deve autenticar e identificar participantes autorizados do projeto. | Alta | A01 |
| RF02 | O sistema deve exibir visão geral com Sprint, metas, prazos, bloqueios, WIP e entregas recentes. | Alta | A02 |
| RF03 | O Product Owner deve criar, editar e ordenar itens do Product Backlog. | Alta | A05 |
| RF04 | A equipe deve selecionar itens para uma Sprint e manter o Sprint Backlog. | Alta | A02 |
| RF05 | O sistema deve registrar e consultar a Meta do Produto e a Meta da Sprint. | Alta | A05 |
| RF06 | Usuários autorizados devem atualizar o estado real dos itens no fluxo Kanban. | Alta | A02 |
| RF07 | O sistema deve impedir ou alertar movimentações que violem políticas e limites de WIP. | Alta | A03 |
| RF08 | Usuários autorizados devem registrar, atualizar, resolver e consultar bloqueios. | Alta | A02 |
| RF09 | O sistema deve relacionar itens a frente, Sprint, responsáveis e entregas quando aplicável. | Alta | A02 |
| RF10 | O sistema deve registrar histórico de mudanças em itens, Sprints, fluxo, bloqueios e integrações. | Alta | Sistema |
| RF11 | Usuários autorizados devem consultar entregas por frente, Sprint, período e status. | Média | A04/A06 |
| RF12 | O sistema deve enviar arquivos ao diretório Google Drive configurado. | Alta | A02 |
| RF13 | O sistema deve armazenar vínculo e metadados do arquivo sem duplicar conteúdo binário no banco. | Alta | Sistema |
| RF14 | Usuários autorizados devem redigir mensagens para destinatários do projeto. | Média | A04 |
| RF15 | O sistema deve enviar notificações autorizadas por Gmail e registrar o resultado. | Média | A04 |
| RF16 | O sistema deve exibir sucesso, pendência ou falha de cada operação Google. | Alta | A01 |
| RF17 | O sistema deve configurar lembretes de reuniões, prazos e eventos relevantes. | Média | A04 |
| RF18 | O sistema deve criar ou sincronizar eventos com Google Calendar quando habilitado. | Média | A04/A09 |
| RF19 | O sistema deve manter a agenda interna quando Calendar estiver desabilitado ou indisponível. | Alta | Sistema |
| RF20 | O sistema deve distinguir a reunião de terça-feira da reunião principal de quarta-feira, ambas das 08:00 às 10:00 em dias não feriados. | Alta | Sistema |

## 4. Requisitos não funcionais

| ID | Categoria | Requisito verificável |
|---|---|---|
| RNF01 | Segurança | Tokens, segredos e credenciais Google não podem chegar ao navegador nem ser armazenados em texto puro. |
| RNF02 | Segurança | Toda escrita deve validar sessão, projeto, papel e autorização no servidor. |
| RNF03 | Privacidade | O sistema deve persistir apenas dados Google necessários à finalidade autorizada. |
| RNF04 | Disponibilidade | Falha em Drive, Gmail ou Calendar não pode impedir consulta e atualização dos dados locais. |
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
| RN08 | Falha de serviço externo não pode apagar ou corromper dados locais. |

## 6. Rastreabilidade inicial

| Requisito | Próximo artefato |
|---|---|
| RF01, RNF01-RNF03 | 03 — Casos de Uso e autorização |
| RF02, RF09, RF11 | 03 — Casos de Uso de consulta |
| RF03-RF05 | 03 — Casos de Uso de Product Backlog e Sprint |
| RF06-RF08, RN01-RN05 | 03 — Casos de Uso de fluxo e bloqueios |
| RF10, RNF10 | Diagrama de classes, auditoria e persistência |
| RF12-RF16, RNF04-RNF05 | Casos de Uso e sequência das integrações Google |
| RF17-RF20, RN07 | Casos de Uso e estados de agenda |
| RNF06-RNF09 | Arquitetura, frontend e plano de testes |

## 7. Critérios gerais de aceitação

- Usuários autorizados acessam somente o projeto e as ações compatíveis com seu papel.
- Product Backlog, Sprint Backlog e fluxo são exibidos separadamente.
- Movimentações respeitam políticas de WIP ou informam claramente a exceção.
- Bloqueios, entregas e mudanças relevantes ficam disponíveis no histórico.
- Upload Drive, Gmail e Calendar apresentam estado confirmado, pendente ou falho.
- O sistema continua consultável e operacional quando uma integração externa está indisponível.
- Reuniões de terça e quarta aparecem corretamente na agenda, com destaque para quarta-feira.

## 8. Referências

- [01 — Visão do Produto](01-visao-produto.md)
- [Requisitos detalhados de apoio](../requisitos/requisitos.md)
- [Especificação técnica](../especificacao-tecnica.md)
- [Arquitetura](../arquitetura/arquitetura.md)
