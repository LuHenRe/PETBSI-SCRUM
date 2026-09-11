# 08 — Diagramas de Sequência

**Projeto:** Sistema Web de Gestão Ágil do Projeto Acadêmico  
**Versão:** 1.0  
**Status:** proposta para validação  
**Origem:** [03 — Casos de Uso](03-casos-de-uso.md) e [07 — Boundary, Control e Entity](07-boundary-control-entity.md)

## 1. Objetivo

Descrever a ordem temporal das mensagens entre atores, boundaries, controls, entities, repositories e gateways. Os diagramas devem orientar os contratos de aplicação e os testes de caso de uso.

## 2. UC01 — Autenticar usuário

```mermaid
sequenceDiagram
    actor Usuario
    participant UI as LoginPage «boundary»
    participant Route as AuthCallbackRoute «boundary»
    participant UC as AuthenticateUserUseCase «control»
    participant Auth as AuthGateway «port»
    participant Person as Person «entity»
    participant Membership as ProjectMembership «entity»
    participant Session as SessionRepository «port»

    Usuario->>UI: solicita login
    UI->>Auth: redireciona para provedor
    Auth-->>Route: retorna identidade autenticada
    Route->>UC: authenticate(identity)
    UC->>Person: resolve(identity)
    UC->>Membership: verificaVinculo(person)
    alt vínculo autorizado
        UC->>Session: create(person, project)
        Session-->>UC: sessão criada
        UC-->>Route: autenticação concluída
        Route-->>UI: redireciona para visão geral
    else vínculo ausente
        UC-->>Route: acesso negado
        Route-->>UI: exibe erro seguro
    end
```

## 3. UC02 — Consultar visão geral

```mermaid
sequenceDiagram
    actor Usuario
    participant UI as ProjectOverviewPage «boundary»
    participant UC as GetProjectOverviewUseCase «control»
    participant Auth as AuthorizationService
    participant Repo as ProjectOverviewRepository «port»
    participant Project as Project «entity»
    participant Sprint as Sprint «entity»
    participant Item as BacklogItem «entity»
    participant Blocker as Blocker «entity»
    participant Delivery as Delivery «entity»

    Usuario->>UI: abre visão geral
    UI->>UC: getOverview(projectId)
    UC->>Auth: authorize(view_project)
    Auth-->>UC: permitido
    UC->>Repo: loadOverview(projectId)
    Repo-->>UC: dados agregados
    UC->>Project: buildOverview()
    UC->>Sprint: calculateProgress()
    UC->>Item: calculateWip()
    UC->>Blocker: listOpen()
    UC->>Delivery: listRecent()
    UC-->>UI: overview local
    UI-->>Usuario: apresenta metas, Sprint, WIP e bloqueios
```

## 4. UC03 — Gerenciar Product Backlog

```mermaid
sequenceDiagram
    actor PO as Product Owner
    participant UI as ProductBacklogPage «boundary»
    participant UC as ManageBacklogUseCase «control»
    participant Auth as AuthorizationService
    participant Item as BacklogItem «entity»
    participant Repo as BacklogRepository «port»
    participant Audit as AuditPort «port»

    PO->>UI: cria ou edita item
    UI->>UC: saveBacklogItem(data)
    UC->>Auth: authorize(manage_backlog)
    Auth-->>UC: permitido
    UC->>Item: validate(data)
    Item-->>UC: item válido
    UC->>Repo: save(item)
    Repo-->>UC: item persistido
    UC->>Audit: record(BacklogItemChanged)
    UC-->>UI: item atualizado
    UI-->>PO: exibe item no Product Backlog
```

## 5. UC05 — Atualizar item no fluxo

```mermaid
sequenceDiagram
    actor Membro
    participant UI as WorkflowBoard «boundary»
    participant UC as MoveBacklogItemUseCase «control»
    participant Auth as AuthorizationService
    participant Item as BacklogItem «entity»
    participant Column as WorkflowColumn «entity»
    participant Wip as WipLimit «value object»
    participant Repo as BacklogRepository «port»
    participant Audit as AuditPort «port»

    Membro->>UI: move cartão para coluna
    UI->>UC: move(itemId, columnId)
    UC->>Auth: authorize(move_item)
    Auth-->>UC: permitido
    UC->>Repo: beginTransaction()
    UC->>Repo: loadItemAndColumn(itemId, columnId)
    Repo-->>UC: item e coluna
    UC->>Column: canReceive(item)
    Column->>Wip: allows(currentCount)
    alt WIP e transição permitidos
        UC->>Item: moveTo(column)
        UC->>Repo: save(item)
        UC->>Repo: appendStateChange()
        UC->>Audit: record(BacklogItemMoved)
        UC->>Repo: commit()
        UC-->>UI: movimentação confirmada
    else política ou WIP impedem
        UC->>Repo: rollback()
        UC-->>UI: erro de movimentação
    end
    UI-->>Membro: atualiza cartão ou exibe motivo
```

## 6. UC08 — Enviar arquivo ao Drive

```mermaid
sequenceDiagram
    actor Membro
    participant UI as AttachmentPanel «boundary»
    participant API as UploadRoute «boundary»
    participant UC as UploadAttachmentUseCase «control»
    participant Auth as AuthorizationService
    participant Repo as AttachmentRepository «port»
    participant Attachment as Attachment «entity»
    participant Storage as FileStorageGateway «port»
    participant Drive as GoogleDriveGateway «adapter»
    participant Google as Google Drive
    participant Audit as AuditPort «port»

    Membro->>UI: seleciona arquivo
    UI->>API: envia metadados e conteúdo
    API->>UC: upload(input)
    UC->>Auth: authorize(upload_attachment)
    Auth-->>UC: permitido
    UC->>Attachment: createPending(input)
    UC->>Repo: savePending(attachment)
    UC->>Storage: upload(file, configuredFolder)
    Storage->>Drive: createFile(folderId, file)
    Drive->>Google: cria arquivo
    Google-->>Drive: externalFileId e URL
    Drive-->>Storage: referência externa
    Storage-->>UC: referência externa
    UC->>Attachment: markCompleted(reference)
    UC->>Repo: save(attachment)
    UC->>Audit: record(AttachmentUploaded)
    UC-->>API: status concluído
    API-->>UI: metadados e link
    UI-->>Membro: exibe arquivo
```

## 7. UC09 — Enviar notificação por Gmail

```mermaid
sequenceDiagram
    actor ScrumMaster as Scrum Master
    participant UI as NotificationComposer «boundary»
    participant API as SendNotificationRoute «boundary»
    participant UC as SendNotificationUseCase «control»
    participant Auth as AuthorizationService
    participant Notification as Notification «entity»
    participant Recipient as NotificationRecipient «entity»
    participant Repo as NotificationRepository «port»
    participant Email as EmailGateway «port»
    participant Gmail as GmailGateway «adapter»
    participant Google as Gmail
    participant Audit as AuditPort «port»

    ScrumMaster->>UI: redige e revisa mensagem
    UI->>API: confirma envio
    API->>UC: send(input)
    UC->>Auth: authorize(send_notification)
    Auth-->>UC: permitido
    UC->>Recipient: validateRecipients(input)
    UC->>Notification: createPending(input)
    UC->>Repo: savePending(notification)
    UC->>Email: send(notification, recipients)
    Email->>Gmail: envia mensagem
    alt Gmail aceita envio
        Gmail-->>Email: messageId
        Email-->>UC: resultado aceito
        UC->>Notification: markSent(messageId)
        UC->>Repo: saveResult()
        UC->>Audit: record(NotificationSent)
        UC-->>API: enviado
    else Gmail recusa ou falha
        Gmail-->>Email: erro
        Email-->>UC: falha recuperável
        UC->>Notification: markFailed(error)
        UC->>Repo: saveResult()
        UC->>Audit: record(NotificationFailed)
        UC-->>API: falha
    end
    API-->>UI: status sanitizado
    UI-->>ScrumMaster: exibe resultado
```

## 8. UC11 — Sincronizar Calendar

```mermaid
sequenceDiagram
    actor Agendador
    participant Route as CalendarSyncRoute «boundary»
    participant UC as SyncCalendarEventUseCase «control»
    participant Auth as AuthorizationService
    participant Event as CalendarEvent «entity»
    participant Repo as CalendarEventRepository «port»
    participant Calendar as CalendarGateway «port»
    participant GoogleCal as Google Calendar
    participant Audit as AuditPort «port»

    Agendador->>Route: solicita sincronização
    Route->>UC: sync(eventId)
    UC->>Auth: authorize(sync_calendar)
    Auth-->>UC: permitido
    UC->>Repo: load(eventId)
    Repo-->>UC: evento local
    alt Calendar desabilitado
        UC->>Event: markDisabled()
        UC->>Repo: save(event)
        UC-->>Route: mantido localmente
    else Calendar habilitado
        UC->>Event: markPending()
        UC->>Repo: save(event)
        UC->>Calendar: createOrUpdate(event)
        Calendar->>GoogleCal: cria ou atualiza evento
        alt operação aceita
            GoogleCal-->>Calendar: externalEventId
            Calendar-->>UC: referência externa
            UC->>Event: markSynced(reference)
            UC->>Repo: save(event)
            UC->>Audit: record(CalendarEventSynchronized)
            UC-->>Route: sincronizado
        else falha externa
            GoogleCal-->>Calendar: erro
            Calendar-->>UC: falha
            UC->>Event: markFailed(error)
            UC->>Repo: save(event)
            UC->>Audit: record(CalendarEventSyncFailed)
            UC-->>Route: falha recuperável
        end
    end
```

## 9. UC15 — Enviar notificação por Telegram

```mermaid
sequenceDiagram
    actor Sistema as Sistema/Agendador
    participant Route as TelegramNotifyRoute «boundary»
    participant UC as SendTelegramMessageUseCase «control»
    participant Auth as AuthorizationService
    participant Message as TelegramMessage «entity»
    participant Repo as TelegramMessageRepository «port»
    participant TelegramGW as TelegramGateway «port»
    participant Bot as TelegramBotGateway «adapter»
    participant Telegram as Telegram Bot API
    participant Audit as AuditPort «port»

    Sistema->>Route: evento de projeto (item movido, bloqueio, Sprint, entrega)
    Route->>UC: send(event)
    UC->>Auth: authorize(send_telegram)
    Auth-->>UC: permitido
    UC->>Message: createPending(event)
    UC->>Repo: savePending(message)
    alt Telegram configurado pelo Scrum Master
        UC->>TelegramGW: send(message)
        TelegramGW->>Bot: sendMessage(chatId, body)
        Bot->>Telegram: envia mensagem ao grupo
        alt Telegram aceita envio
            Telegram-->>Bot: messageId
            Bot-->>TelegramGW: messageId
            TelegramGW-->>UC: resultado aceito
            UC->>Message: markSent(messageId)
            UC->>Repo: saveResult()
            UC->>Audit: record(TelegramMessageSent)
            UC-->>Route: enviado
        else Telegram recusa ou falha
            Telegram-->>Bot: erro
            Bot-->>TelegramGW: falha
            TelegramGW-->>UC: falha recuperável
            UC->>Message: markFailed(error)
            UC->>Repo: saveResult()
            UC->>Audit: record(TelegramMessageFailed)
            UC-->>Route: falha recuperável
        end
    else Telegram não configurado
        UC->>Message: markPending()
        UC->>Repo: save(message)
        UC-->>Route: mantido pendente sem envio
    end
```

## 10. Rastreabilidade para testes

| Diagrama | Teste de aplicação correspondente |
|---|---|
| UC01 | autenticação, vínculo e acesso negado |
| UC02 | agregação da visão geral sem dependência Google |
| UC03 | Product Owner cria e ordena item |
| UC05 | movimentação válida, WIP excedido e rollback |
| UC08 | upload concluído, falha e retry idempotente |
| UC09 | envio aceito, falha e status por destinatário |
| UC11 | sincronização, Calendar desabilitado e falha externa |
| UC15 | Telegram configurado/ausente, envio aceito, falha e retry idempotente |

## 11. Referências

- [02 — Requisitos](02-requisitos.md)
- [03 — Casos de Uso](03-casos-de-uso.md)
- [04 — Modelo de Domínio](04-modelo-de-dominio.md)
- [05 — Modelo de Dados](05-modelo-de-dados.md)
- [07 — Boundary, Control e Entity](07-boundary-control-entity.md)
