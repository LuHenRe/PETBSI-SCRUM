"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, CalendarDays, ExternalLink, FileText, Pencil, Upload } from "lucide-react";
import {
  itemById, openBlocker, resolveBlocker, moveBacklogItem, sendTelegram,
  updateBacklogItem, uploadAttachment, useAppState, frontById,
} from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import { useCanWrite } from "@/hooks/use-can-write";
import type { AuditEvent } from "@/application/ports/repositories";
import type { WorkItemStateChange as DomainStateChange } from "@/domain/workflow/work-item-state-change";
import { formatDate } from "@/lib/seed";
import { STATUS_LABEL } from "@/lib/labels";
import { Avatar, Badge, Button, Card, EmptyState, Modal, Select, TextArea } from "@/components/ui";
import { DeadlinePill, FrontTag, PriorityBadge, StatusBadge, TypeBadge, ValueBadge } from "@/components/shared";
import { ItemFormModal, type ItemDraft } from "@/components/item-form";
import type { WorkItemStatus } from "@/lib/types";

export default function ItemDetailPage() {
  const params = useParams<{ itemId: string }>();
  const itemId = params.itemId;
  const state = useAppState();
  const actorId = state.currentUserId ?? "";
  const item = itemById(state, itemId);
  const { canWrite } = useCanWrite();

  const [editing, setEditing] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const history = useMemo(() => state.stateChanges.filter((h) => h.itemId === itemId), [state.stateChanges, itemId]);
  const blockers = state.blockers.filter((b) => b.itemId === itemId);
  const attachments = state.attachments.filter((a) => a.kind === "item" && a.refId === itemId);

  // RF10: timeline do domínio (stateChanges append-only + auditoria),
  // sem apagar o histórico legado acima. Fonte de verdade: getStateChanges()+audit.
  const [domainChanges, setDomainChanges] = useState<DomainStateChange[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const domainItem = await apiClient.getDeps().backlog.load(itemId);
        if (!cancelled) setDomainChanges(domainItem ? [...domainItem.getStateChanges()] : []);
        const events = await apiClient.listAudit(itemId);
        if (!cancelled) setAuditEvents(events);
      } catch {
        // Mantém a timeline legada em caso de falha do domínio.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId]);
  const auditTimeline = useMemo(() => {
    const moves = domainChanges.map((c) => ({
      key: `s-${c.id}`,
      at: c.at,
      actor: c.actorId,
      action: c.reason === "edited" ? "Edição" : "Movimentação",
      route: `${c.from ?? "—"} → ${c.to}`,
    }));
    const audits = auditEvents.map((e, idx) => ({
      key: `a-${e.action}-${e.at}-${idx}`,
      at: e.at,
      actor: e.actorId,
      action: e.action,
      route: "",
    }));
    return [...moves, ...audits].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  }, [domainChanges, auditEvents]);

  if (!item) {
    return (
      <Card>
        <EmptyState
          icon={<FileText />}
          title="Item não encontrado"
          description="O item solicitado não existe ou foi removido."
          action={<Link href="/backlog" className="btn btn-secondary btn-sm">Voltar ao backlog</Link>}
        />
      </Card>
    );
  }

  const front = frontById(state, item.frontId);
  const sprint = state.sprints.find((s) => s.id === item.sprintId);

  const handleUpload = (file: File | null) => {
    if (!file) return;
    setUploading(true);
    uploadAttachment({ name: file.name, kind: "item", refId: item.id, uploadedBy: actorId }).finally(() => setUploading(false));
  };

  const saveEdit = (draft: ItemDraft) => {
    updateBacklogItem(item.id, draft);
    setEditing(false);
  };

  const registerBlocker = () => {
    if (blockReason.trim()) {
      openBlocker(item.id, blockReason.trim(), actorId);
      sendTelegram("EVENT", `Item "${item.title}" bloqueado.`);
    }
    setBlockOpen(false);
    setBlockReason("");
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 wrap">
        <Link href="/backlog" className="text-sm">← Backlog</Link>
        <span className="text-muted">/</span>
        <span className="text-sm">{item.id}</span>
      </div>

      <div className="flex items-start justify-between wrap gap-3 mb-4">
        <div>
          <h1>{item.title}</h1>
          <div className="row-meta mt-2">
            <StatusBadge status={item.status} />
            <TypeBadge type={item.type} />
            <PriorityBadge priority={item.priority} />
            <ValueBadge value={item.value} />
            <FrontTag front={front} />
          </div>
        </div>
        {canWrite && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Editar
          </Button>
        )}
      </div>

      <div className="detail-grid">
        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Descrição">
            <p className="text-soft">{item.description || "Sem descrição registrada."}</p>
          </Card>

          <Card title="Histórico de fluxo">
            {history.length === 0 ? (
              <p className="text-muted text-sm">Nenhuma movimentação registrada.</p>
            ) : (
              <div className="history">
                {history.map((h) => (
                  <div key={h.id} className="history-item">
                    <strong>{h.toStatus === "blocked" ? STATUS_LABEL.blocked : h.fromStatus ? STATUS_LABEL[h.toStatus] : "Criado"}</strong>{" "}
                    <span className="text-muted">
                      {h.fromStatus ? `(a partir de ${STATUS_LABEL[h.fromStatus]})` : ""} em {formatDate(h.changedAt)} por{" "}
                      {state.people.find((p) => p.id === h.changedBy)?.name ?? "sistema"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Auditoria (domínio)">
            {auditTimeline.length === 0 ? (
              <p className="text-muted text-sm">Nenhum evento de auditoria para este item.</p>
            ) : (
              <div className="history">
                {auditTimeline.map((e) => (
                  <div key={e.key} className="history-item">
                    <strong>{e.action}</strong>{" "}
                    {e.route && <span className="text-muted">({e.route})</span>}{" "}
                    <span className="text-muted">
                      em {formatDate(e.at.slice(0, 10))} por{" "}
                      {state.people.find((p) => p.id === e.actor)?.name ?? e.actor}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Arquivos"
            action={
              <Button size="sm" variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
                <Upload size={14} /> Anexar arquivo
              </Button>
            }
          >
            <input
              ref={fileInput}
              type="file"
              hidden
              aria-hidden
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
            />
            {attachments.length === 0 ? (
              <p className="text-muted text-sm">Nenhum arquivo vinculado.</p>
            ) : (
              <div className="list">
                {attachments.map((a) => (
                  <div key={a.id} className="card row-item">
                    <FileText size={16} style={{ color: "var(--primary)", flex: "none" }} aria-hidden />
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{a.name}</div>
                      <div className="text-xs text-muted">Enviado por {state.people.find((p) => p.id === a.uploadedBy)?.name} em {formatDate(a.uploadedAt)}</div>
                    </div>
                    <Badge tone={a.status === "synced" ? "ok" : a.status === "pending" ? "warn" : "danger"}>
                      {a.status === "synced" ? "No Drive" : a.status === "pending" ? "Enviando..." : "Falhou"}
                    </Badge>
                    <a className="btn btn-ghost btn-sm" href={a.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${a.name} no Drive`}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Detalhes">
            <dl className="kv">
              <dt>Frente</dt>
              <dd>{front?.name ?? "—"}</dd>
              <dt>Sprint</dt>
              <dd>{sprint ? `${sprint.name} (${sprint.status})` : "Product Backlog"}</dd>
              <dt>Prazo</dt>
              <dd className="flex items-center gap-2">
                <CalendarDays size={14} aria-hidden />
                {item.deadline ? formatDate(item.deadline) : "Sem prazo"}
                <DeadlinePill deadline={item.deadline} />
              </dd>
              <dt>Criado em</dt>
              <dd>{formatDate(item.createdAt)}</dd>
            </dl>
          </Card>

          <Card title="Responsáveis">
            {item.assigneeIds.length === 0 ? (
              <p className="text-muted text-sm">Sem responsáveis definidos.</p>
            ) : (
              <div className="list">
                {item.assigneeIds.map((id) => {
                  const person = state.people.find((p) => p.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Avatar person={person} />
                      <div>
                        <div className="text-sm" style={{ fontWeight: 600 }}>{person?.name}</div>
                        <div className="text-xs text-muted">{person?.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Ações">
            {canWrite ? (
              <div className="flex" style={{ flexDirection: "column", gap: 10 }}>
                <FieldMover itemId={item.id} current={item.status} state={state} onMove={(s) => {
                  moveBacklogItem(item.id, s, actorId);
                  sendTelegram("EVENT", `Item "${item.title}" movido para ${STATUS_LABEL[s]}.`);
                }} />
                <Button variant="danger" onClick={() => setBlockOpen(true)}>
                  <AlertTriangle size={15} /> Bloquear item
                </Button>
              </div>
            ) : (
              <p className="text-muted text-sm">Acesso de leitura (Visitante).</p>
            )}
          </Card>
        </div>
      </div>

      <Card title="Bloqueios" className="mt-4">
        {blockers.length === 0 ? (
          <p className="text-muted text-sm">Nenhum impedimento registrado para este item.</p>
        ) : (
          <div className="list">
            {blockers.map((b) => {
              const active = !b.resolvedAt;
              return (
                <div key={b.id} className="card row-item">
                  <Badge tone={active ? "danger" : "ok"} dot>{active ? "Em aberto" : "Resolvido"}</Badge>
                  <div className="flex-1">
                    <div className="text-sm">{b.description}</div>
                    <div className="text-xs text-muted">
                      Aberto em {formatDate(b.openedAt)} por {state.people.find((p) => p.id === b.openedBy)?.name}
                      {b.resolvedAt ? ` · Resolvido em ${formatDate(b.resolvedAt)} por ${state.people.find((p) => p.id === b.resolvedBy)?.name}` : ""}
                    </div>
                  </div>
                  {active && canWrite && (
                    <Button size="sm" variant="secondary" onClick={() => resolveBlocker(b.id, actorId)}>
                      Resolver
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ItemFormModal
        open={editing}
        initial={draft(item)}
        onClose={() => setEditing(false)}
        onSave={saveEdit}
      />

      <Modal
        open={blockOpen}
        title="Registrar bloqueio"
        onClose={() => setBlockOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlockOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={registerBlocker}>Registrar</Button>
          </>
        }
      >
        <TextArea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Descreva o impedimento..." autoFocus />
      </Modal>
    </div>
  );
}

function draft(item: { title: string; type: "documento" | "codigo" | "pesquisa" | "material" | "infra" | "gestao"; description: string; frontId: string; priority: "alta" | "media" | "baixa"; value: "PQ" | "M" | "S"; sprintId: string | null; assigneeIds: string[]; deadline: string | null }): ItemDraft {
  return {
    title: item.title, type: item.type, description: item.description, frontId: item.frontId,
    priority: item.priority, value: item.value, sprintId: item.sprintId, assigneeIds: item.assigneeIds, deadline: item.deadline,
  };
}

function FieldMover({ itemId, current, state, onMove }: {
  itemId: string; current: WorkItemStatus; state: import("@/lib/types").AppState; onMove: (s: WorkItemStatus) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={current} onChange={(e) => onMove(e.target.value as WorkItemStatus)} aria-label="Mover item para">
        {state.columns.map((c) => (
          <option key={c.id} value={c.status} disabled={c.status === current}>{c.name}</option>
        ))}
      </Select>
    </div>
  );
}