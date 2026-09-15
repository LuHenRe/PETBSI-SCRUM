# Plano Executado — Etapas 0 a 4 (Frontend + Base Clean)

**Status:** executado e verificado — 22 arquivos de teste, 228 testes verdes, `typecheck + check:boundaries + build 16/16` verdes.
**Regra-mãe:** conciliar o demo existente com `docs/` (tree, requisitos, DDD/Clean, plano de testes). Mudança sem essa finalidade foi desconsiderada.
**Infra adiada** por orientação do professor: sem Neon, OAuth real, SDKs Google/Telegram, tokens ou `.env`.

## 1. Ponto de partida
Demo operacional em `app/(dashboard)/` (12 páginas) + `src/lib/{types,store,seed,labels}` + `src/components/{ui,shared,item-form,app-shell}` com persistência em `localStorage` e integrações fake (`setTimeout` + URL Drive fake). Sem `domain/`, `application/`, `tests/`, sem TDD, com regra de WIP e permissão no componente.

## 2. Estrutura adotada (sem `frontend/` físico, sem repo `backend`)
Frontend lógico = `app/ + src/components/ + src/hooks/` (único lugar com React/Next). Lógica = `src/domain/ + src/application/` (zero React). Infra futura = `src/adapters/ + src/server/ + db/`. `app/` mantido na raiz por exigência do Next.js e de `docs/tree.md`.

## 3. Etapas executadas

### ETAPA 0 — Congelamento e fundação
- Inventário das 20 rotas `app/**/*.tsx` + 9 arquivos `src/**`, `typecheck` verde.
- Instalado `vitest ^5` + `test/test:watch`, `vitest.config.ts (@ → src)`, `tests/unit/smoke.test.ts` dummy.
- Esqueleto vazio `domain/9`, `application/9`, `adapters/`, `server/`, `hooks/`, `db/`, `tests/` com `.gitkeep + README` de fronteira.
- Guardrail `scripts/check-boundaries.mjs` + script `check:boundaries`.

### ETAPA 1 — Domínio puro (TDD)
- VOs imutáveis: `ProjectRole, WorkItemStatus, BacklogPriority, WipLimit, DateRange, EmailAddress`.
- Entidades: `BacklogItem.moveTo()`, `WorkflowColumn.canReceive()`, `WipPolicy`, `Blocker`, `Sprint (definirMeta/iniciar/selectItem/close)`, `ProjectMembership.canMoveItem/displayTitle`, `TelegramMessage (EVENT|DEADLINE_REMINDER, formato "A tarefa X falta Y dias..."/"vence hoje")`.
- Testes `tests/unit/` 7 arquivos, 155 testes (D01-D07, D11-D17). `smoke` removido.

### ETAPA 2 — Ports + aplicação com fakes
- Ports: `Backlog/Sprint/MembershipRepository`, `AuditPort`, `IdGenerator/Clock` injetáveis.
- Use-cases: `manage-backlog-item, move-backlog-item, manage-blocker, plan-sprint, get-project-overview, manage-front-permissions` com autorização `canMoveItem() || isTechAdmin()`.
- Adapters memory a partir de `seed.ts` + `sprint-mapper.ts` (conversão `planned/active/closed ↔ rascunho/planejada/em_andamento/encerrada`).
- Testes `tests/application/` 42 testes (A02-A07, A14; RF02-RF11, RF24).

### ETAPA 3 — Religar fronteira
- `src/lib/api-client.ts` como única ponte componente → use-case → memory.
- Migradas: `fluxo, backlog, overview, login, app-shell, item-form, integracoes (stub)`. Regra saiu da página (sem `countIn`, sem `sendTelegram` direto; erro vira `DomainError.message`).
- Hooks: `use-backlog, use-workflow-board, use-project-overview`.
- Testes fronteira `boundary-fluxo/backlog/overview` (erro → mensagem UI). Total 216 testes.
- Restaram 10 páginas no store legado (agenda, arquivos, entregas, frentes, itens, notificações, pessoas, sprint, configurações).

### ETAPA 4 — Hardening + correções
- `BacklogItem.updateFields()` com validação + evento `reason:"edited"` sem mudar `status`; removido todo `as unknown as Record`.
- Auditoria visível: `listAudit()` + timelines em `entregas` e `itens/[itemId]`.
- Permissões: selo `Visitante`, nav filtrada, botões ocultos, `setCanEdit` via use-case.
- Agenda corrigida no adapter (`presentation-schedule.ts`: terça/quarta 08:00, quarta principal, feriados, placeholder de Meta do Produto), sem tocar `seed.ts` legado.
- `api-client` afinado (202 linhas, apresentação em `presentation-store.ts`).
- Total final: 22 arquivos, 228 testes.

## 4. Observações — o que saiu do planejado
1. **Vitest acusa warning ESM** (`vitest.config.ts` sem `"type":"module"`). Inofensivo, mantido.
2. **E1: `SprintStatus` em PT no domínio vs EN no seed.** Previsto como risco; resolvido com `sprint-mapper.ts` na E2, não com renomeação.
3. **E1: `canMoveItem()` não cobre override do SM.** Mantido puro no domínio; override via `isTechAdmin()` no use-case (decisão consciente).
4. **E1: transições simplificadas** (`backlog,todo,in_progress,blocked,review,done`) em vez do statechart completo da doc. Suficiente para as 6 colunas do demo; statechart completo fica para evolução.
5. **E2: `MembershipRepository` extra** não previsto no plano inicial — necessário para UC16/permissões.
6. **E2: sem `update` no domínio** (edição era re-save sem histórico). Dívida registrada e paga na E4 com `updateFields()`.
7. **E3: `api-client` nasceu gigante (736 linhas, duplo estado + cast hack em `saveItem`).** Dívida registrada e paga na E4 (extração + método de domínio).
8. **E3: hook extra `use-can-write.ts`** não previsto — criado por necessidade de esconder botões por permissão.
9. **E3: só 3 páginas migradas.** As 10 restantes ficaram no store de propósito para manter o demo no ar; religamento total é evolução, não requisito da base.
10. **E4: `domain/` foi editado** (`backlog-item.ts` campos viraram mutáveis via método, `work-item-state-change.ts` aceita `from==to` com `edited`). Exceção autorizada e congelada de novo.
11. **`WorkItemStateChange.id` usa `Date.now()+random` no domínio.** Aceito no MVP; ideal seria id injetado em todos os pontos.

## 5. Estado final e pendências
- Base correta e apresentável: 228 testes, fronteiras íntegras, demo idêntico visualmente, regra no domínio.
- Pendente (fora deste ciclo, exige infra): Neon/migrations reais, OAuth/Google/Telegram reais, religar as 10 páginas restantes, `tests/integration|e2e` reais.
