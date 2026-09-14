# 12 — Plano de Testes

**Projeto:** Sistema Web de Gestão Ágil do Projeto Acadêmico  
**Versão:** 1.0  
**Status:** plano inicial para validação  
**Origem:** [02 — Requisitos](02-requisitos.md), [03 — Casos de Uso](03-casos-de-uso.md) e [11 — DDD e Clean Architecture](11-ddd-clean-architecture.md)

## 1. Objetivo

Definir uma estratégia de testes rastreável para comprovar regras de domínio, casos de uso, persistência, integrações Google e Telegram e fluxos críticos do frontend.

A estratégia seguirá TDD de dentro para fora:

1. teste de domínio;
2. teste de caso de uso com fakes;
3. teste de adapter e persistência;
4. teste de integração externa controlada;
5. teste E2E dos fluxos críticos.

## 2. Pirâmide de testes

```text
                 E2E
              poucos testes
          Integração e contratos
             quantidade moderada
       Aplicação e adapters isolados
              cobertura ampla
          Domínio e value objects
             maior quantidade
```

Testes de unidade devem ser rápidos e independentes. Testes externos reais devem ser poucos, controlados e executados somente com ambiente autorizado.

## 3. Convenções

- Cada teste deve indicar o requisito ou regra que comprova.
- Entidades não devem ser mockadas; repositories e gateways externos podem usar fakes.
- Testes de autorização devem cobrir permissão concedida e negada.
- Testes de falha devem confirmar que o estado local não é corrompido.
- Operações externas devem testar idempotência e retry quando aplicável.
- Dados de teste não devem usar credenciais ou arquivos reais sem autorização.

## 4. Testes de domínio

| ID | Unidade | Cenário |
|---|---|---|
| D01 | `BacklogItem` | aceita transição permitida |
| D02 | `BacklogItem` | rejeita transição proibida |
| D03 | `WorkflowColumn`/`WipLimit` | rejeita entrada quando WIP está cheio |
| D04 | `Blocker` | abre e resolve impedimento corretamente |
| D05 | `Sprint` | exige Meta da Sprint antes de iniciar |
| D06 | `Sprint` | seleciona item sem duplicar na mesma Sprint |
| D07 | `Sprint` | impede duas Sprints ativas no mesmo projeto |
| D08 | `Notification` | impede envio sem destinatário válido |
| D09 | `Notification` | preserva status por destinatário |
| D10 | `CalendarEvent` | permanece válido no modo somente local |
| D11 | `EmailAddress` | rejeita formato inválido |
| D12 | `DateRange` | rejeita período invertido |
| D13 | `TelegramMessage` | impede envio sem chat "PETBSI notificações" configurado pelo Scrum Master/Scrum Master Assistente |
| D14 | `TelegramMessage` | preserva vínculo com o evento ao registrar falha |
| D15 | `ProjectMembership` | membro sem permissão de edição não pode mover item da frente |
| D16 | `TelegramMessage` | gera lembrete de prazo apenas para tarefa com `Deadline` definido |
| D17 | `TelegramMessage` | formata "A tarefa X falta Y dias para o prazo final." e "vence hoje" quando o prazo é o dia corrente |

## 5. Testes de casos de uso

| ID | Caso de uso | Cenários mínimos |
|---|---|---|
| A01 | UC01 Autenticar usuário | identidade válida, vínculo ausente, sessão expirada |
| A02 | UC02 Consultar visão geral | visão completa, estado vazio, falha Google sem impacto local |
| A03 | UC03 Gerenciar Product Backlog | criar, editar, ordenar, dados inválidos, papel incorreto |
| A04 | UC04 Planejar Sprint | selecionar item, definir meta, Sprint encerrada, item duplicado |
| A05 | UC05 Atualizar item no fluxo | movimentação válida, WIP excedido, rollback, sem permissão |
| A06 | UC06 Gerenciar bloqueio | abrir, atualizar, resolver, item inexistente |
| A07 | UC07 Consultar entregas e histórico | filtros, ausência de resultados, autorização |
| A08 | UC08 Enviar arquivo ao Drive | upload concluído, arquivo inválido, pasta ausente, retry |
| A09 | UC09 Enviar notificação Gmail | envio aceito, destinatário inválido, falha externa, idempotência |
| A10 | UC10 Configurar lembrete | data válida, feriado, destinatário inválido |
| A11 | UC11 Sincronizar Calendar | criar, atualizar, desabilitado, falha e retry |
| A12 | UC12 Configurar integração | conectar, escopo recusado, revogar, configuração inválida |
| A13 | UC15 Enviar notificação Telegram | chat "PETBSI notificações" configurado, chat ausente, envio aceito, falha externa, idempotência, lembrete de prazo e tarefa sem prazo |
| A14 | UC16 Gerenciar permissões por frente | conceder acesso, conceder edição, revogar, membro inexistente, papel incorreto (não Scrum Master/Scrum Master Assistente) |

## 6. Testes de requisitos funcionais

| Requisitos | Teste de aceitação |
|---|---|
| RF01 | usuário autorizado entra e usuário sem vínculo é bloqueado |
| RF02 | visão geral exibe Sprint, metas, prazos, WIP, bloqueios e entregas |
| RF03 | Coordenador (Product Owner) cria, edita e ordena item |
| RF04-RF05 | equipe seleciona item e registra metas sem confundir backlogs |
| RF06-RF08 | usuário move item e gerencia bloqueio com histórico |
| RF09-RF11 | filtros relacionam frente, Sprint, responsável, entrega e histórico |
| RF12-RF13 | arquivo é enviado ao folder configurado e apenas metadados ficam no banco |
| RF14-RF16 | Gmail envia mensagem e mostra status confirmado ou falho |
| RF17-RF20 | lembretes, reuniões e Calendar funcionam com integração opcional |
| RF21-RF23 | Telegram notifica eventos e lembrete de prazo no chat "PETBSI notificações" e mostra status confirmado, pendente ou falho |
| RF24 | Scrum Master/Scrum Master Assistente delimita permissões de acesso/edição por frente e membros respeitam o limite |

## 7. Testes de requisitos não funcionais

| Requisito | Estratégia |
|---|---|
| RNF01-RNF03 | inspeção de respostas, variáveis de ambiente, logs e testes de autorização |
| RNF04 | simular indisponibilidade Drive/Gmail/Calendar/Telegram e verificar operação local |
| RNF05 | repetir upload, envio e sync com mesma chave de idempotência |
| RNF06 | teste de desempenho da visão geral com dados representativos |
| RNF07 | testes de estados loading, vazio, sucesso, erro e acesso negado |
| RNF08 | auditoria manual e automatizada de teclado, foco, rótulos e contraste |
| RNF09 | verificação de dependências proibidas em domain/application |
| RNF10 | confirmar eventos de auditoria em operações sensíveis |

## 8. Contratos de integração

### Drive

- `upload` usa o `folder_id` resolvido no servidor.
- resposta contém identificador externo, nome, URL e status.
- erro não pode gerar vínculo concluído falso.
- retry não deve criar arquivo duplicado quando a chave de operação for reutilizada.

### Gmail

- somente destinatários autorizados são aceitos.
- o status geral e o status individual são persistidos.
- envio confirmado exige resposta positiva do gateway.
- falha não deve ser apresentada como enviada.

### Calendar

- criação e atualização são idempotentes pelo `external_event_id`.
- Calendar desabilitado mantém o evento local.
- falha de sincronização mantém o evento e registra `FAILED`.

### Telegram

- envio usa o chat "PETBSI notificações" configurado pelo Scrum Master/Scrum Master Assistente no servidor.
- lembrete de prazo segue o formato "A tarefa X falta Y dias para o prazo final." e nenhum lembrete é gerado para tarefa sem `Deadline`.
- resposta contém identificador da mensagem e status.
- falha não pode gerar status concluído falso.
- retry não deve duplicar mensagem quando a chave de idempotência for reutilizada.
- chat ausente mantém a mensagem pendente sem afetar os dados locais.

## 9. Testes de frontend

| Área | Verificações |
|---|---|
| Navegação | rotas protegidas, retorno após login, acesso negado |
| Visão geral | carregamento, filtros, vazio e erro recuperável |
| Backlog | ordenação, formulário, validação e feedback |
| Fluxo | movimentação, WIP, rollback visual e bloqueio |
| Arquivos | progresso, sucesso, falha, retry e link Drive |
| Notificações | prévia, confirmação, erro e status de envio (Gmail) |
| Telegram | status de envio, pendência, lembrete de prazo e configuração do chat "PETBSI notificações" pelo Scrum Master/Scrum Master Assistente |
| Permissões | menu restrito ao Scrum Master/Scrum Master Assistente e limites por frente aplicados |
| Agenda | terça, quarta, feriado, integração habilitada/desabilitada |
| Responsividade | desktop, tela menor e navegação por teclado |
| Tema | alternância claro/escuro disponível no login e nas telas autenticadas, persistência da preferência e contraste dos componentes em ambos os temas |

## 10. Testes E2E prioritários

1. Usuário autorizado realiza login e consulta visão geral.
2. Coordenador (Product Owner) cria item, ordena backlog e visualiza todos os planos das frentes.
3. Membro move item no quadro respeitando WIP e a permissão da frente.
4. Membro registra bloqueio e o resolve.
5. Membro envia arquivo para Drive de teste.
6. Scrum Master/Scrum Master Assistente envia notificação Gmail e mensagem Telegram de teste, incluindo lembrete de prazo no chat "PETBSI notificações".
7. Scrum Master/Scrum Master Assistente limita a permissão de um membro em uma frente e o membro perde a capacidade de edição.
8. Scrum Master/Scrum Master Assistente cria evento interno e sincroniza Calendar de teste.
9. Serviço Google ou Telegram falha e o sistema mantém os dados locais.

## 11. Dados e ambientes

- **Unitário:** objetos em memória e dados sintéticos.
- **Aplicação:** repositories e gateways fake.
- **Integração:** banco PostgreSQL de teste, contas Google de desenvolvimento e chat/bot Telegram de desenvolvimento ("PETBSI notificações").
- **E2E:** ambiente isolado, contas autorizadas e arquivos não sensíveis.
- **Produção:** nenhum teste destrutivo sem janela e autorização explícitas.

## 12. Critérios de entrada e saída

### Entrada

- requisito possui critério de aceitação;
- caso de uso está descrito;
- dependências e dados de teste estão disponíveis;
- ambiente necessário está configurado.

### Saída

- testes automatizados relevantes passam;
- falhas conhecidas estão registradas;
- cobertura de regras críticas foi revisada;
- nenhuma credencial ou dado sensível foi exposto;
- evidência de aceitação foi vinculada ao requisito.

## 13. Matriz de rastreabilidade

| Requisito | Caso de uso | Teste |
|---|---|---|
| RF01 | UC01 | A01, E2E01 |
| RF02 | UC02 | A02, Frontend visão geral |
| RF03 | UC03 | A03, E2E02 |
| RF04-RF05 | UC04 | A04, E2E02 |
| RF06-RF08 | UC05-UC06 | D01-D04, A05-A06, E2E03-E04 |
| RF09-RF11 | UC02, UC07 | A02, A07, filtros e histórico |
| RF12-RF13 | UC08 | A08, contrato Drive, E2E05 |
| RF14-RF16 | UC09 | A09, contrato Gmail, E2E06 |
| RF17-RF20 | UC10-UC11 | A10-A11, contrato Calendar, E2E08 |
| RF21-RF23 | UC15 | D13-D17, A13, contrato Telegram, E2E09 |
| RF24 | UC16 | D15, A14, E2E07 |
| RNF01-RNF03 | UC01, UC08, UC09, UC12, UC15, UC16 | segurança e autorização |
| RNF04-RNF05 | UC08, UC09, UC11, UC15 | falhas, retry e idempotência |
| RNF06-RNF11 | todos os fluxos | desempenho, tema, acessibilidade, arquitetura e auditoria |

## 14. Referências

- [02 — Requisitos](02-requisitos.md)
- [03 — Casos de Uso](03-casos-de-uso.md)
- [06 — Diagramas de Estados](06-diagrama-de-estados.md)
- [08 — Diagramas de Sequência](08-diagramas-de-sequencia.md)
- [10 — Diagrama de Componentes](10-diagrama-de-componentes.md)
- [11 — DDD e Clean Architecture](11-ddd-clean-architecture.md)
