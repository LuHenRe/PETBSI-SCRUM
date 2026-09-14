# 03 — Casos de Uso

**Projeto:** Sistema Web de Gestão Ágil do Projeto Acadêmico  
**Versão:** 1.0  
**Status:** proposta para validação  
**Origem:** [02 — Requisitos](02-requisitos.md)

## 1. Objetivo

Detalhar as interações entre os atores e o sistema, transformando os requisitos funcionais em capacidades observáveis. Cada caso de uso deverá orientar o modelo de domínio, os diagramas de sequência, as telas e os testes de aceitação.

## 2. Atores

| ID | Ator | Papel no caso de uso |
|---|---|---|
| A01 | Usuário autenticado | Acessa informações permitidas do projeto |
| A02 | Membro da equipe | Consulta e atualiza trabalho das frentes com permissão; título "Membro" ou "Visitante" conforme a edição |
| A03 | Scrum Master | Administrador Técnico; apoia fluxo, políticas, bloqueios, eventos, integrações e permissões |
| A04 | Scrum Master Assistente | Alterna, por período, com o Scrum Master; também Administrador Técnico |
| A05 | Coordenador (Product Owner) | Define metas, ordena o Product Backlog e visualiza todos os planos das frentes; um coordenador por vez exerce o Product Owner |
| A06 | Google | Executa OAuth, armazenamento, envio e agenda externos |
| A07 | Telegram | Recebe notificações automáticas e lembretes de prazo no chat "PETBSI notificações" |
| A08 | Agendador | Dispara lembretes e sincronizações programadas |

No diagrama, A03, A04 e A05 especializam A02, que por sua vez especializa A01.

## 3. Diagrama geral de casos de uso

```mermaid
flowchart LR
    Usuario((A01 Usuário autenticado))
    Membro((A02 Membro))
    ScrumMaster((A03 Scrum Master))
    ScrumMasterAssistente((A04 Scrum Master Assistente))
    Coordenador((A05 Coordenador (Product Owner)))
    Google((A06 Google))
    Telegram((A07 Telegram))
    Scheduler((A08 Agendador))

    Membro -. generaliza .-> Usuario
    ScrumMaster -. generaliza .-> Membro
    ScrumMasterAssistente -. generaliza .-> Membro
    Coordenador -. generaliza .-> Membro

    UC01[Autenticar usuário]
    UC02[Consultar visão geral]
    UC03[Gerenciar Product Backlog]
    UC04[Planejar Sprint]
    UC05[Atualizar item no fluxo]
    UC06[Gerenciar bloqueio]
    UC07[Consultar entregas e histórico]
    UC08[Enviar arquivo ao Drive]
    UC09[Enviar notificação por Gmail]
    UC10[Configurar lembrete]
    UC11[Sincronizar Calendar]
    UC12[Configurar integração]
    UC13[Validar autorização]
    UC14[Registrar auditoria]
    UC15[Enviar notificação por Telegram]
    UC16[Gerenciar permissões por frente]

    Usuario --> UC01
    Usuario --> UC02
    Coordenador --> UC03
    Coordenador --> UC04
    Membro --> UC04
    Membro --> UC05
    Membro --> UC06
    ScrumMaster --> UC05
    ScrumMasterAssistente --> UC05
    ScrumMaster --> UC06
    ScrumMasterAssistente --> UC06
    Coordenador --> UC07
    ScrumMaster --> UC07
    ScrumMasterAssistente --> UC07
    Membro --> UC08
    ScrumMaster --> UC09
    ScrumMasterAssistente --> UC09
    ScrumMaster --> UC10
    ScrumMasterAssistente --> UC10
    ScrumMaster --> UC11
    ScrumMasterAssistente --> UC11
    Scheduler --> UC11
    ScrumMaster --> UC12
    ScrumMasterAssistente --> UC12
    ScrumMaster --> UC15
    ScrumMasterAssistente --> UC15
    Scheduler --> UC15
    Telegram --> UC15
    ScrumMaster --> UC16
    ScrumMasterAssistente --> UC16
    Google --> UC01

    UC02 -. include .-> UC13
    UC03 -. include .-> UC13
    UC04 -. include .-> UC13
    UC05 -. include .-> UC13
    UC06 -. include .-> UC13
    UC08 -. include .-> UC13
    UC09 -. include .-> UC13
    UC15 -. include .-> UC13
    UC16 -. include .-> UC13
    UC03 -. include .-> UC14
    UC05 -. include .-> UC14
    UC08 -. include .-> UC14
    UC09 -. include .-> UC14
    UC15 -. include .-> UC14
    UC16 -. include .-> UC14
    UC11 -. extend .-> UC10
    UC08 --> Google
    UC09 --> Google
    UC11 --> Google
    UC12 --> Google
    UC15 --> Telegram
```

`include` indica comportamento obrigatório para completar o caso base. `extend` indica comportamento opcional, condicionado à habilitação do Calendar.

## 4. Catálogo de casos de uso

| ID | Caso de uso | Ator principal | Requisitos |
|---|---|---|---|
| UC01 | Autenticar usuário | A01 | RF01, RNF01-RNF03 |
| UC02 | Consultar visão geral | A01/A02 | RF02, RF09, RF23 |
| UC03 | Gerenciar Product Backlog | A05 | RF03, RNF02 |
| UC04 | Planejar Sprint | A02/A05 | RF04-RF05, RNF02 |
| UC05 | Atualizar item no fluxo | A02/A03/A04 | RF06-RF07, RF10, RN01-RN05 |
| UC06 | Gerenciar bloqueio | A02/A03/A04 | RF08, RF10 |
| UC07 | Consultar entregas e histórico | A03/A04/A05 | RF10-RF11 |
| UC08 | Enviar arquivo ao Drive | A02 | RF12-RF13, RF16, RNF01-RNF05 |
| UC09 | Enviar notificação por Gmail | A03/A04 | RF14-RF16, RNF01-RNF05 |
| UC10 | Configurar lembrete | A03/A04 | RF17, RF20 |
| UC11 | Sincronizar Calendar | A03/A04/A08 | RF18-RF20, RN07-RN08 |
| UC12 | Configurar integração | A03/A04 | RF01, RF16, RF21, RF23, RNF01-RNF03 |
| UC13 | Validar autorização | Sistema | RNF02 |
| UC14 | Registrar auditoria | Sistema | RF10, RNF10 |
| UC15 | Enviar notificação por Telegram | A03/A04/A07/A08/Sistema | RF21-RF23, RN09, RN14 |
| UC16 | Gerenciar permissões por frente | A03/A04 | RF24, RN10 |

## 5. Especificação dos casos principais

### UC01 — Autenticar usuário

- **Ator:** A01.
- **Pré-condição:** provedor de autenticação configurado.
- **Fluxo principal:** usuário inicia login; provedor autentica; sistema identifica a pessoa; sistema verifica vínculo com o projeto; sessão é criada.
- **Alternativas:** credenciais inválidas, usuário sem vínculo ou sessão expirada impedem acesso e não revelam dados internos.
- **Pós-condição:** usuário possui sessão válida e contexto de autorização.

### UC02 — Consultar visão geral

- **Ator:** A01, A02, A03, A04 ou A05.
- **Pré-condição:** sessão válida, vínculo autorizado e permissão de acesso à frente.
- **Fluxo principal:** sistema consulta metas, Sprint, prazos, WIP, bloqueios e entregas respeitando as frentes permitidas; frontend apresenta os dados locais.
- **Alternativas:** ausência de dados apresenta estado vazio; indisponibilidade Google ou Telegram não bloqueia a consulta local; frente sem permissão é omitida.
- **Pós-condição:** nenhuma alteração persistente.

### UC03 — Gerenciar Product Backlog

- **Ator:** A05.
- **Pré-condição:** usuário é um coordenador que exerce o Product Owner no período atual.
- **Fluxo principal:** Coordenador (Product Owner) cria ou edita item; informa título, descrição, frente e prioridade; sistema valida; sistema salva e registra auditoria; Coordenador (Product Owner) ordena os itens.
- **Alternativas:** dados inválidos ou permissão insuficiente impedem a operação.
- **Pós-condição:** Product Backlog fica compreensível, ordenado e auditável.

### UC04 — Planejar Sprint

- **Ator:** A02 e A05.
- **Pré-condição:** Sprint aberta para planejamento e Product Backlog disponível.
- **Fluxo principal:** equipe inspeciona itens; seleciona trabalho das frentes permitidas; registra Meta da Sprint; sistema cria/atualiza Sprint Backlog.
- **Alternativas:** item incompatível, Sprint encerrada ou falta de autorização impedem a seleção.
- **Pós-condição:** Sprint possui meta e plano de trabalho registrados.

### UC05 — Atualizar item no fluxo

- **Ator:** A02, A03 ou A04.
- **Pré-condição:** item pertence a uma frente para a qual o usuário possui permissão de edição.
- **Fluxo principal:** usuário solicita movimentação; sistema valida estado permitido, política, permissão da frente e WIP; grava novo estado e histórico; frontend confirma o resultado.
- **Alternativas:** WIP excedido, frente sem permissão de edição ou transição proibida mantém o estado anterior e apresenta o motivo.
- **Pós-condição:** estado atual e histórico são consistentes.

### UC06 — Gerenciar bloqueio

- **Ator:** A02, A03 ou A04.
- **Pré-condição:** item existe e usuário possui acesso.
- **Fluxo principal:** usuário registra descrição, impacto e responsável; sistema marca bloqueio; usuário autorizado atualiza ou resolve; sistema registra histórico.
- **Alternativas:** bloqueio sem descrição ou item inexistente é rejeitado.
- **Pós-condição:** bloqueio aberto ou resolvido fica visível no contexto do item.

### UC07 — Consultar entregas e histórico

- **Ator:** A03, A04 ou A05.
- **Pré-condição:** usuário possui permissão de consulta (Scrum Master/Scrum Master Assistente ou Coordenador/Product Owner).
- **Fluxo principal:** usuário filtra por frente, Sprint, período ou status; o Coordenador (Product Owner) vê todos os planos das frentes; sistema retorna entregas e eventos históricos.
- **Alternativas:** nenhum resultado apresenta estado vazio sem erro; frente sem permissão é omitida para o Scrum Master/Scrum Master Assistente.
- **Pós-condição:** nenhuma alteração persistente.

### UC08 — Enviar arquivo ao Drive

- **Ator:** A02.
- **Pré-condição:** conexão Drive ativa, pasta configurada e arquivo dentro dos limites.
- **Fluxo principal:** usuário seleciona arquivo; servidor valida; gateway envia para a pasta autorizada; sistema salva metadados e vínculo; frontend exibe link e status.
- **Alternativas:** conexão indisponível gera pendência/falha recuperável; arquivo inválido é rejeitado antes do envio.
- **Pós-condição:** arquivo externo fica vinculado a item, Sprint ou entrega sem duplicação binária no banco.

### UC09 — Enviar notificação por Gmail

- **Ator:** A03 ou A04.
- **Pré-condição:** conexão Gmail ativa, destinatários permitidos e usuário Scrum Master ou Scrum Master Assistente.
- **Fluxo principal:** Scrum Master/Scrum Master Assistente seleciona destinatários; redige mensagem; revisa prévia; confirma; servidor envia; sistema registra resultado e auditoria.
- **Alternativas:** envio falha ou conexão está ausente; operação recebe estado pendente/falha sem afirmar sucesso.
- **Pós-condição:** mensagem enviada ou operação registrada como não enviada.

### UC10 — Configurar lembrete

- **Ator:** A03 ou A04.
- **Pré-condição:** usuário possui permissão e evento local é válido.
- **Fluxo principal:** Scrum Master/Scrum Master Assistente define evento, data, horário, destinatários e regra de lembrete (incluindo lembrete de prazo de tarefa quando houver); sistema salva configuração.
- **Alternativas:** feriado, data inválida ou destinatário não autorizado exigem correção.
- **Pós-condição:** lembrete fica disponível na agenda interna; lembretes de prazo de tarefa podem ser disparados automaticamente como notificação no chat "PETBSI notificações".

### UC11 — Sincronizar Calendar

- **Ator:** A03, A04 ou A08.
- **Pré-condição:** Calendar habilitado e calendário de destino autorizado.
- **Fluxo principal:** sistema cria ou atualiza evento; salva identificador externo e estado de sincronização.
- **Alternativas:** integração desabilitada ou indisponível preserva evento interno e registra falha.
- **Pós-condição:** evento local possui sincronização conhecida.

### UC12 — Configurar integração

- **Ator:** A03 ou A04.
- **Pré-condição:** Scrum Master/Scrum Master Assistente autenticado e configuração disponível.
- **Fluxo principal:** Scrum Master/Scrum Master Assistente conecta/revoga provedor (Google ou Telegram), informa pasta Drive, calendário ou chat "PETBSI notificações" do Telegram, valida conexão e salva apenas configuração não secreta no domínio.
- **Alternativas:** escopo recusado ou configuração inválida mantém integração desabilitada.
- **Pós-condição:** integração fica ativa, pendente ou revogada com status explícito.

### UC15 — Enviar notificação por Telegram

- **Ator:** A03, A04, A07, A08 ou Sistema.
- **Pré-condição:** chat "PETBSI notificações" e bot configurados pelo Scrum Master/Scrum Master Assistente e o evento ou lembrete de prazo habilitado.
- **Fluxo principal:** o sistema gera mensagem a partir de evento (item movido, bloqueio aberto, Sprint iniciada/encerrada, entrega registrada) ou de lembrete de prazo ("A tarefa X falta Y dias para o prazo final."); gateway envia ao chat "PETBSI notificações" via bot; sistema registra resultado e auditoria.
- **Alternativas:** conexão ausente gera pendência/falha recuperável; mensagem inválida ou chat inexistente é rejeitado; falha nunca impede dados locais; ajustes de prazo de tarefa podem suprimir ou refazer um lembrete ainda não enviado.
- **Pós-condição:** notificação enviada ou operação registrada como não enviada.

### UC16 — Gerenciar permissões por frente

- **Ator:** A03 ou A04.
- **Pré-condição:** Scrum Master/Scrum Master Assistente autenticado.
- **Fluxo principal:** Scrum Master/Scrum Master Assistente delimita permissões de acesso e edição de cada membro em cada frente; sistema valida e persistente; auditoria registra a alteração.
- **Alternativas:** membro inexistente ou permissão inválida é rejeitado.
- **Pós-condição:** cada membro ve/edita apenas as frentes permitidas.

## 6. Rastreabilidade

| Caso de uso | Requisitos cobertos | Próximo artefato |
|---|---|---|
| UC01 | RF01, RNF01-RNF03 | sequência de autenticação e testes |
| UC02 | RF02, RF09, RF23 | boundary e sequência de consulta |
| UC03 | RF03, RNF02, RNF10 | classes de backlog |
| UC04 | RF04-RF05 | classes de Sprint |
| UC05-UC06 | RF06-RF08, RF10, RN01-RN05 | estados de item e fluxo |
| UC07 | RF10-RF11 | persistência de histórico |
| UC08 | RF12-RF13, RF16 | sequência Drive e gateway |
| UC09 | RF14-RF16 | sequência Gmail e gateway |
| UC10-UC11 | RF17-RF20, RN07-RN08 | estados e atividade de agenda |
| UC12 | RF01, RF16, RF21, RF23, RNF01-RNF03 | arquitetura e segurança |
| UC13-UC14 | RNF02, RNF10 | autorização e auditoria |
| UC15 | RF21-RF23, RNF01-RNF05, RN09 | sequência Telegram e gateway |
| UC16 | RF24, RN10 | permissões por frente |
