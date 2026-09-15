# 09 — Diagramas de Atividade

**Projeto:** Sistema Web de Gestão Ágil do Projeto Acadêmico  
**Versão:** 1.0  
**Status:** proposta para validação  
**Origem:** [03 — Casos de Uso](03-casos-de-uso.md) e [08 — Diagramas de Sequência](08-diagramas-de-sequencia.md)

## 1. Objetivo

Representar os fluxos de negócio com decisões, alternativas e responsabilidades distribuídas entre usuário, frontend, servidor, banco e serviços externos.

## 2. Atividade — Planejar Sprint

**Raias:** Coordenador (Product Owner), Developers, Sistema.

```mermaid
flowchart TD
    Start((Início)) --> PO1[Coordenador (Product Owner) comunica prioridade e contexto]
    PO1 --> Dev1[Developers inspecionam itens do Product Backlog]
    Dev1 --> Decision1{Item compreendido?}
    Decision1 -- Não --> Refine[Esclarecer e refinar item]
    Refine --> Dev1
    Decision1 -- Sim --> Select[Selecionar item para a Sprint]
    Select --> Goal[Definir Meta da Sprint]
    Goal --> Decision2{Meta e itens coerentes?}
    Decision2 -- Não --> Adjust[Ajustar meta ou seleção]
    Adjust --> Goal
    Decision2 -- Sim --> Save[Salvar Sprint e Sprint Backlog]
    Save --> Audit[Registrar histórico e auditoria]
    Audit --> End((Sprint planejada))
```

## 3. Atividade — Atualizar item no fluxo Kanban

**Raias:** Membro/Scrum Master ou Assistente, Frontend, Servidor, Banco.

```mermaid
flowchart TD
    Start((Início)) --> User[Usuário arrasta ou solicita mudança do item]
    User --> UI[Frontend envia item e coluna de destino]
    UI --> Auth[Servidor valida sessão, projeto e papel]
    Auth --> Decision1{Autorizado?}
    Decision1 -- Não --> Deny[Retornar acesso negado]
    Deny --> End1((Fim))
    Decision1 -- Sim --> Load[Carregar item, coluna e política]
    Load --> Wip[Calcular WIP atual da coluna]
    Wip --> Decision2{Transição e WIP permitidos?}
    Decision2 -- Não --> Reject[Rejeitar movimentação e informar motivo]
    Reject --> UIError[Frontend mantém estado anterior]
    UIError --> End2((Fim))
    Decision2 -- Sim --> Transaction[(Iniciar transação)]
    Transaction --> Update[Atualizar estado atual]
    Update --> History[Inserir WorkItemStateChange]
    History --> Audit[Inserir AuditEvent]
    Audit --> Commit[(Confirmar transação)]
    Commit --> Success[Frontend atualiza o quadro]
    Success --> End3((Fim))
```

## 4. Atividade — Enviar arquivo ao Google Drive

**Raias:** Membro, Frontend, Servidor, Google Drive.

```mermaid
flowchart TD
    Start((Início)) --> Pick[Membro seleciona arquivo]
    Pick --> ValidateUI[Frontend valida extensão e tamanho preliminar]
    ValidateUI --> Decision1{Arquivo aceitável?}
    Decision1 -- Não --> Invalid[Exibir erro de validação]
    Invalid --> End1((Fim))
    Decision1 -- Sim --> Send[Enviar arquivo ao servidor]
    Send --> ValidateServer[Servidor valida sessão, permissão e contexto]
    ValidateServer --> Decision2{Drive conectado?}
    Decision2 -- Não --> Pending[Registrar operação pendente]
    Pending --> End2((Pendente))
    Decision2 -- Sim --> CreatePending[Registrar Attachment pendente]
    CreatePending --> Upload[Enviar para folder_id configurado]
    Upload --> Decision3{Google Drive aceitou?}
    Decision3 -- Não --> Failure[Registrar falha recuperável e auditoria]
    Failure --> End3((Falha))
    Decision3 -- Sim --> Save[Salvar external_file_id e metadados]
    Save --> Audit[Registrar auditoria]
    Audit --> Link[Apresentar link e status concluído]
    Link --> End4((Fim))
```

## 5. Atividade — Enviar notificação por Gmail

**Raias:** Scrum Master/Scrum Master Assistente, Frontend, Servidor, Gmail.

```mermaid
flowchart TD
    Start((Início)) --> Compose[Scrum Master/Scrum Master Assistente seleciona destinatários e redige mensagem]
    Compose --> Preview[Frontend apresenta prévia]
    Preview --> Decision1{Confirmar envio?}
    Decision1 -- Não --> Cancel[Descartar ou salvar rascunho]
    Cancel --> End1((Cancelado))
    Decision1 -- Sim --> Validate[Servidor valida papel, destinatários e política]
    Validate --> Decision2{Dados válidos?}
    Decision2 -- Não --> Error[Exibir erro e permitir correção]
    Error --> Compose
    Decision2 -- Sim --> Pending[Registrar Notification pendente]
    Pending --> Connection{Gmail conectado?}
    Connection -- Não --> Waiting[Manter operação pendente]
    Waiting --> End2((Pendente))
    Connection -- Sim --> Send[Enviar mensagem pelo gateway]
    Send --> Decision3{Gmail aceitou?}
    Decision3 -- Não --> Failed[Registrar falha por destinatário e auditoria]
    Failed --> End3((Falha))
    Decision3 -- Sim --> Sent[Registrar message_id, status enviado e auditoria]
    Sent --> End4((Concluído))
```

## 6. Atividade — Sincronizar evento com Google Calendar

**Raias:** Agendador/Scrum Master ou Assistente, Servidor, Agenda local, Google Calendar.

```mermaid
flowchart TD
    Start((Início)) --> Trigger[Agendador ou Scrum Master/Scrum Master Assistente solicita sincronização]
    Trigger --> Load[Servidor carrega evento local]
    Load --> Decision1{Calendar habilitado?}
    Decision1 -- Não --> Local[Manter evento somente na agenda interna]
    Local --> End1((Concluído localmente))
    Decision1 -- Sim --> Pending[Marcar sincronização pendente]
    Pending --> Sync[Gateway cria ou atualiza evento externo]
    Sync --> Decision2{Operação aceita?}
    Decision2 -- Não --> Fail[Marcar falha e manter evento local]
    Fail --> Retry{Retry permitido?}
    Retry -- Não --> End2((Falha recuperável))
    Retry -- Sim --> Sync
    Decision2 -- Sim --> Save[Salvar external_event_id e última sincronização]
    Save --> Audit[Registrar auditoria]
    Audit --> End3((Sincronizado))
```

## 7. Atividade — Enviar notificação por Telegram

**Raias:** Sistema/Agendador, Servidor, Telegram Bot API.

```mermaid
flowchart TD
    Start((Início)) --> Event[Evento do projeto: item movido, bloqueio, Sprint iniciada/encerrada ou entrega]
    Event --> DecideKind{É lembrete de prazo?}
    DecideKind -- Sim --> Reminder[Gerar "A tarefa X falta Y dias para o prazo final." a partir do Deadline não nulo]
    DecideKind -- Não --> Keep[Manter mensagem do evento]
    Reminder --> Validate[Servidor valida lembrete, evento e permissão de envio]
    Keep --> Validate
    Validate --> Decision1{chat "PETBSI notificações" configurado pelo Scrum Master/Scrum Master Assistente?}
    Decision1 -- Não --> Pending[Manter telegram_message pendente]
    Pending --> End1((Pendente))
    Decision1 -- Sim --> Create[Registrar TelegramMessage pendente]
    Create --> Send[Enviar mensagem ao chat "PETBSI notificações" pelo bot]
    Send --> Decision2{Telegram aceitou?}
    Decision2 -- Não --> Failed[Registrar falha recuperável e auditoria]
    Failed --> End2((Falha recuperável))
    Decision2 -- Sim --> Save[Registrar message_id, status enviado e auditoria]
    Save --> End3((Concluído))
```

## 8. Pontos de decisão relevantes

| Fluxo | Decisões que devem ser regra de domínio ou aplicação |
|---|---|
| Sprint | entendimento do item, coerência entre Meta da Sprint e seleção |
| Fluxo | autorização, permissão de frente, transição permitida, limite de WIP e transação |
| Drive | tipo/tamanho, autorização, conexão e resultado externo |
| Gmail | destinatários, confirmação, conexão, idempotência e resultado |
| Calendar | habilitação, autorização, sincronização, falha e retry |
| Telegram | habilitação/configuração do chat "PETBSI notificações", permissão, lembrete de prazo com formato "A tarefa X falta Y dias...", conexão, idempotência e resultado |

## 9. Referências

- [02 — Requisitos](02-requisitos.md)
- [03 — Casos de Uso](03-casos-de-uso.md)
- [06 — Diagramas de Estados](06-diagrama-de-estados.md)
- [07 — Boundary, Control e Entity](07-boundary-control-entity.md)
- [08 — Diagramas de Sequência](08-diagramas-de-sequencia.md)
