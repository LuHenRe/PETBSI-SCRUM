"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, Flag, MessageSquareText, Target } from "lucide-react";
import { useAppState, frontById, itemById, personById, sprintById } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import type { WorkItemStatus } from "@/lib/types";
import { Badge, Card, EmptyState, Select } from "@/components/ui";
import { DeadlinePill, FrontTag, StatusBadge, TypeBadge, Assignees } from "@/components/shared";

export default function OverviewPage() {
  const state = useAppState();
  const [frontFilter, setFrontFilter] = useState<string>("all");

  const activeSprint = state.sprints.find((s) => s.status === "active");

  const activeItems = activeSprint ? state.backlogItems.filter((i) => activeSprint.itemIds.includes(i.id)) : [];

  const counts = useMemo(() => {
    const base = state.backlogItems;
    const items = frontFilter === "all" ? base : base.filter((i) => i.frontId === frontFilter);
    return {
      total: items.length,
      inProgress: items.filter((i) => i.status === "in_progress").length,
      blocked: items.filter((i) => i.status === "blocked").length,
      done: items.filter((i) => i.status === "done").length,
      open: items.filter((i) => i.status !== "done").length,
    };
  }, [state.backlogItems, frontFilter]);

  const sprintProgress = activeItems.length
    ? Math.round((activeItems.filter((i) => i.status === "done").length / activeItems.length) * 100)
    : 0;

  const upcomingDeadlines = useMemo(
    () =>
      state.backlogItems
        .filter((i) => i.deadline && i.status !== "done" && (frontFilter === "all" || i.frontId === frontFilter))
        .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
        .slice(0, 5),
    [state.backlogItems, frontFilter]
  );

  const openBlockers = state.blockers.filter((b) => !b.resolvedAt);

  const upcomingEvents = state.events
    .filter((e) => e.date >= "2026-09-13")
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 4);

  const byFront = state.fronts.map((front) => {
    const items = state.backlogItems.filter((i) => i.frontId === front.id);
    const b = items.filter((i) => i.status !== "done").length;
    const d = items.filter((i) => i.status === "done").length;
    return { front, b, d, total: items.length };
  });

  return (
    <div>
      <div className="flex items-center justify-between wrap gap-3 mb-4">
        <div>
          <h1>Visão geral do projeto</h1>
          <p className="text-muted mt-1">Quadro compartilhado das quatro frentes — Sprint, metas, prazos, bloqueios e entregas.</p>
        </div>
        <div style={{ minWidth: 220 }}>
          <Select aria-label="Filtrar por frente" value={frontFilter} onChange={(e) => setFrontFilter(e.target.value)}>
            <option value="all">Todas as frentes</option>
            {state.fronts.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {activeSprint && (
        <Card className="mb-4">
          <div className="flex items-center gap-3 wrap">
            <span className="badge badge-info">
              <Target size={13} aria-hidden />
              Sprint ativa
            </span>
            <div className="flex-1" style={{ minWidth: 220 }}>
              <div className="flex justify-between wrap items-center mb-1">
                <strong>{activeSprint.name}</strong>
                <span className="text-xs text-muted">
                  {formatDate(activeSprint.startDate)} a {formatDate(activeSprint.endDate)}
                </span>
              </div>
              <p className="text-soft text-sm">{activeSprint.goal}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="progress flex-1">
                  <div className="progress-bar" style={{ width: `${sprintProgress}%` }} />
                </div>
                <span className="text-sm" style={{ fontWeight: 700 }}>{sprintProgress}%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="overview-grid mb-4">
        <div className="card stat">
          <div className="stat-label">Itens em aberto</div>
          <div className="stat-value">{counts.open}</div>
          <div className="stat-hint">{counts.total} itens no backlog</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Em andamento</div>
          <div className="stat-value" style={{ color: "var(--info)" }}>{counts.inProgress}</div>
          <div className="stat-hint">WIP do fluxo ativo</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Bloqueados</div>
          <div className="stat-value" style={{ color: counts.blocked ? "var(--danger)" : "var(--text)" }}>{counts.blocked}</div>
          <div className="stat-hint">{openBlockers.length} impedimento(s) em aberto</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Concluídos</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{counts.done}</div>
          <div className="stat-hint">itens finalizados</div>
        </div>
      </div>

      <div className="widget-grid">
        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Avanço por frente">
            {byFront.map(({ front, b, d, total }) => {
              const pct = total ? Math.round((d / total) * 100) : 0;
              return (
                <div key={front.id} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <span className="dot" style={{ background: front.color }} aria-hidden />
                      <strong className="text-sm">{front.name}</strong>
                    </span>
                    <span className="text-xs text-muted">{d} de {total} concluídos</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${pct}%`, background: front.color }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card title="Próximos prazos" action={<Link href="/agenda" className="text-sm">Ver agenda</Link>}>
            {upcomingDeadlines.length === 0 ? (
              <EmptyState icon={<CheckCircle2 />} title="Nenhum prazo próximo" description="Nenhum prazo de tarefa em aberto nas próximas datas." />
            ) : (
              <div className="list">
                {upcomingDeadlines.map((item) => (
                  <Link key={item.id} href={`/itens/${item.id}`} className="card row-item" style={{ textDecoration: "none" }}>
                    <FrontTag front={frontById(state, item.frontId)} />
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{item.title}</div>
                      <div className="row-meta mt-1">
                        <StatusBadge status={item.status} />
                        <Assignees item={item} state={state} />
                      </div>
                    </div>
                    <DeadlinePill deadline={item.deadline} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title="Bloqueios em aberto">
            {openBlockers.length === 0 ? (
              <EmptyState icon={<CheckCircle2 />} title="Sem bloqueios" description="Nenhum impedimento aberto no momento." />
            ) : (
              <div className="list">
                {openBlockers.map((blocker) => {
                  const item = itemById(state, blocker.itemId);
                  return (
                    <Link key={blocker.id} href={`/itens/${blocker.itemId}`} className="card row-item" style={{ textDecoration: "none" }}>
                      <AlertTriangle size={17} style={{ color: "var(--danger)", flex: "none" }} aria-hidden />
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="text-sm" style={{ fontWeight: 600 }}>{item?.title ?? "Item removido"}</div>
                        <div className="text-xs text-muted">{blocker.description}</div>
                      </div>
                      <span className="text-xs text-muted">Aberto em {formatDate(blocker.openedAt)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Reuniões e eventos" action={<Link href="/agenda" className="text-sm">Agenda</Link>}>
            <div className="list">
              {upcomingEvents.length === 0 && (
                <EmptyState icon={<CalendarClock />} title="Sem eventos" description="Nenhum evento programado." />
              )}
              {upcomingEvents.map((event) => (
                <div key={event.id} className="card row-item">
                  <CalendarClock size={16} style={{ color: "var(--primary)", flex: "none" }} aria-hidden />
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{event.title}</div>
                    <div className="text-xs text-muted">{formatDate(event.date)} às {event.time}</div>
                  </div>
                  {event.syncStatus === "synced" ? <Badge tone="ok">Sincronizado</Badge> : <Badge tone="muted">Local</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Canal de notificações" action={<Link href="/notificacoes" className="text-sm">Ver</Link>}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquareText size={15} aria-hidden />
              <strong className="text-sm">PETBSI notificações</strong>
              <Badge tone="ok" dot>Conectado</Badge>
            </div>
            <div className="list">
              {state.telegramMessages.slice(0, 4).map((m) => (
                <div key={m.id} className="card row-item">
                  <div className="flex-1">
                    <div className="text-sm">{m.body}</div>
                    <div className="text-xs text-muted mt-1">{m.kind === "DEADLINE_REMINDER" ? "Lembrete de prazo" : "Evento"} · {formatDate(m.createdAt.slice(0, 10))}</div>
                  </div>
                  <Badge tone={m.status === "sent" ? "ok" : "warn"}>{m.status === "sent" ? "Enviada" : "Pendente"}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Entregas">
            <div className="list">
              {state.deliveries.map((delivery) => (
                <div key={delivery.id} className="card row-item">
                  <Flag size={16} style={{ color: frontById(state, delivery.frontId)?.color ?? "var(--muted)", flex: "none" }} aria-hidden />
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{delivery.title}</div>
                    <div className="text-xs text-muted">{delivery.sprintName} · {delivery.itemIds.length} itens</div>
                  </div>
                  {delivery.status === "entregue" ? <Badge tone="ok">Entregue</Badge> : delivery.status === "em_andamento" ? <Badge tone="warn">Em andamento</Badge> : <Badge tone="muted">Planejada</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}