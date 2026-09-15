"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, Info } from "lucide-react";
import {
  moveBacklogItem, openBlocker, resolveBlocker, sendTelegram, useAppState,
} from "@/lib/store";
import { Button, Card, Modal, TextArea } from "@/components/ui";
import { KanbanCard } from "@/components/shared";
import { STATUS_LABEL } from "@/lib/labels";
import type { WorkItemStatus } from "@/lib/types";

export default function FluxoPage() {
  const state = useAppState();
  const actorId = state.currentUserId ?? "";
  const [dragId, setDragId] = useState<string | null>(null);
  const [wipWarning, setWipWarning] = useState<string | null>(null);
  const [blockItemId, setBlockItemId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const countIn = (status: WorkItemStatus) =>
    state.backlogItems.filter((i) => i.status === status).length;

  const handleMove = (itemId: string, toStatus: WorkItemStatus) => {
    const item = state.backlogItems.find((i) => i.id === itemId);
    if (!item || item.status === toStatus) return;
    const target = state.columns.find((c) => c.status === toStatus);
    if (target?.wipLimit != null) {
      const currentCount = countIn(toStatus);
      const alreadyHere = item.status === toStatus;
      const nextCount = alreadyHere ? currentCount : currentCount + 1;
      if (nextCount > target.wipLimit) {
        setWipWarning(
          `Limite de WIP de "${target.name}" é ${target.wipLimit} e seria ultrapassado (${nextCount}). Mova outro item antes.`
        );
        return;
      }
    }
    setWipWarning(null);
    moveBacklogItem(itemId, toStatus, actorId);
    sendTelegram(
      "EVENT",
      `Item "${item.title}" movido para ${STATUS_LABEL[toStatus]}.`
    );
  };

  const saveBlocker = () => {
    if (blockItemId && blockReason.trim()) {
      openBlocker(blockItemId, blockReason.trim(), actorId);
    }
    setBlockItemId(null);
    setBlockReason("");
  };

  return (
    <div>
      <div className="flex items-center justify-between wrap gap-3 mb-4">
        <div>
          <h1>Fluxo Kanban</h1>
          <p className="text-muted mt-1">Colunas derivadas do fluxo, limites de WIP e bloqueios. Arraste os cartões ou use o seletor.</p>
        </div>
        <span className="badge badge-info">
          <Info size={13} aria-hidden />
          WIP exige movimentação permitida
        </span>
      </div>

      {wipWarning && (
        <div className="alert alert-danger mb-4" role="alert">
          <Ban size={16} style={{ flex: "none" }} aria-hidden />
          <span>{wipWarning}</span>
        </div>
      )}

      <div className="board" role="region" aria-label="Quadro Kanban">
        {state.columns.map((column) => {
          const items = state.backlogItems.filter((i) => i.status === column.status);
          const over = column.wipLimit != null && items.length > column.wipLimit;
          return (
            <section
              key={column.id}
              className="board-col"
              aria-label={column.name}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  handleMove(dragId, column.status);
                  setDragId(null);
                }
              }}
            >
              <div className="board-col-header">
                <span className="board-col-title">
                  <span className={`dot ${over ? "dot-danger" : "dot-muted"}`} aria-hidden />
                  {column.name}
                  <span className="text-muted" style={{ fontWeight: 500 }}>{items.length}</span>
                </span>
                {column.wipLimit != null && (
                  <span className={`wip ${over ? "wip-over" : ""}`}>
                    {items.length}/{column.wipLimit}
                  </span>
                )}
              </div>
              <div className="board-col-body">
                {items.length === 0 && (
                  <div className="board-empty">Nenhum item</div>
                )}
                {items.map((item) => (
                  <div key={item.id} className="flex" style={{ flexDirection: "column", gap: 6 }}>
                    <div draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragId(item.id); }}>
                      <KanbanCard item={item} state={state} />
                    </div>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "6px 8px" }}>
                      <div className="flex items-center gap-2">
                        <select
                          className="select"
                          style={{ flex: 1, minWidth: 0, padding: "4px 8px", fontSize: 12, height: 28 }}
                          aria-label={`Mover ${item.title}`}
                          value={item.status}
                          onChange={(e) => handleMove(item.id, e.target.value as WorkItemStatus)}
                        >
                          {state.columns.map((c) => (
                            <option key={c.id} value={c.status} disabled={c.status === item.status}>
                              Mover: {c.name}
                            </option>
                          ))}
                        </select>
                        {column.status === "blocked" ? (
                          <Button
                            size="sm"
                            variant="danger"
                            style={{ padding: "4px 8px", fontSize: 12, height: 28, flex: "none" }}
                            onClick={() => {
                              const b = state.blockers.find((blk) => blk.itemId === item.id && !blk.resolvedAt);
                              if (b) resolveBlocker(b.id, actorId);
                            }}
                            title="Resolver bloqueio"
                          >
                            <CheckCircle2 size={13} /> Resolver
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            style={{ padding: "4px 8px", fontSize: 12, height: 28, flex: "none" }}
                            onClick={() => { setBlockItemId(item.id); setBlockReason(""); }}
                            title="Registrar bloqueio"
                          >
                            <AlertTriangle size={13} /> Bloquear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Card className="mt-4">
        <div className="text-xs text-muted">
          Na demonstração, a movimentação é validada pelo limite de WIP configurado. Em produção, a política completa
          (permissões de frente, transições permitidas e exceções autorizadas) é aplicada no servidor.
        </div>
      </Card>

      <Modal
        open={blockItemId !== null}
        title="Registrar bloqueio"
        onClose={() => setBlockItemId(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlockItemId(null)}>Cancelar</Button>
            <Button variant="primary" onClick={saveBlocker}>Registrar</Button>
          </>
        }
      >
        <TextArea
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="Descreva o impedimento..."
          autoFocus
        />
      </Modal>
    </div>
  );

  function resolveBlockerFromState(itemId: string, by: string) {
    const blocker = state.blockers.find((b) => b.itemId === itemId && !b.resolvedAt);
    if (blocker) resolveBlocker(blocker.id, by);
  }
}