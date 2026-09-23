"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, Info, MoreHorizontal } from "lucide-react";
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
  const [selectedFronts, setSelectedFronts] = useState<string[]>([]);
  const [blockItemId, setBlockItemId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const countIn = (status: WorkItemStatus) =>
    state.backlogItems.filter((i) => i.status === status).length;

  const toggleFront = (frontId: string) => {
    setSelectedFronts((prev) =>
      prev.includes(frontId)
        ? prev.filter((id) => id !== frontId)
        : [...prev, frontId]
    );
  };

  const getColumnDotClass = (status: WorkItemStatus) => {
    switch (status) {
      case "backlog": return "dot-muted";
      case "todo": return "dot-info";
      case "in_progress": return "dot-primary";
      case "blocked": return "dot-danger";
      case "review": return "dot-warn";
      case "done": return "dot-ok";
      default: return "dot-muted";
    }
  };

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

      {state.fronts.length > 0 && (
        <div className="flex gap-2 mb-4 wrap" style={{ flexWrap: "wrap", alignItems: "center" }}>
          <span className="text-sm text-muted mr-1" style={{ fontWeight: 600 }}>Filtrar frentes:</span>
          {state.fronts.map((front) => {
            const selected = selectedFronts.includes(front.id);
            return (
              <button
                key={front.id}
                onClick={() => toggleFront(front.id)}
                className="badge"
                style={{
                  background: selected ? front.color : `${front.color}14`,
                  color: selected ? "#fff" : front.color,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  opacity: selectedFronts.length === 0 || selected ? 1 : 0.5,
                }}
              >
                <span className="dot" style={{ background: selected ? "#fff" : front.color }} aria-hidden />
                {front.name}
              </button>
            );
          })}
          {selectedFronts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFronts([])}
              className="text-xs ml-1"
            >
              Limpar
            </Button>
          )}
        </div>
      )}

      <div className="board" role="region" aria-label="Quadro Kanban">
        {state.columns.map((column) => {
          const allItems = state.backlogItems.filter((i) => i.status === column.status);
          const over = column.wipLimit != null && allItems.length > column.wipLimit;
          const items = selectedFronts.length > 0
            ? allItems.filter(i => selectedFronts.includes(i.frontId))
            : allItems;
          
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
                  <span className={`dot ${over ? "dot-danger" : getColumnDotClass(column.status)}`} aria-hidden />
                  {column.name}
                  <span className="text-muted" style={{ fontWeight: 500 }}>{items.length}</span>
                </span>
                {column.wipLimit != null && (
                  <span className={`wip ${over ? "wip-over" : ""}`}>
                    {allItems.length}/{column.wipLimit}
                  </span>
                )}
              </div>
              <div className="board-col-body">
                {items.length === 0 && (
                  <div className="board-empty">Nenhum item</div>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`mini-card board-card-wrapper ${dragId === item.id ? "is-dragging" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(item.id);

                      const target = e.currentTarget as HTMLElement;
                      const rect = target.getBoundingClientRect();
                      const clone = target.cloneNode(true) as HTMLElement;
                      
                      clone.style.position = "absolute";
                      clone.style.top = "-9999px";
                      clone.style.left = "-9999px";
                      clone.style.width = `${rect.width}px`;
                      clone.classList.remove("is-dragging");
                      clone.style.opacity = "1";
                      clone.style.transform = "none";
                      
                      document.body.appendChild(clone);
                      
                      const offsetX = e.clientX - rect.left;
                      const offsetY = e.clientY - rect.top;
                      e.dataTransfer.setDragImage(clone, offsetX, offsetY);

                      setTimeout(() => {
                        if (document.body.contains(clone)) {
                          document.body.removeChild(clone);
                        }
                      }, 0);
                    }}
                    onDragEnd={() => setDragId(null)}
                  >
                    <KanbanCard item={item} state={state} />
                    <div className="board-card-actions">
                      <div className="dropdown">
                        <Button variant="ghost" size="sm" className="btn-icon">
                          <MoreHorizontal size={14} />
                        </Button>
                        <div className="dropdown-menu">
                          <div className="dropdown-title">Mover para:</div>
                          {state.columns.map((c) => (
                            <button
                              key={c.id}
                              className="dropdown-item"
                              disabled={c.status === item.status}
                              onClick={() => handleMove(item.id, c.status)}
                            >
                              {c.name}
                            </button>
                          ))}
                          <div className="dropdown-divider" />
                          {column.status === "blocked" ? (
                            <button
                              className="dropdown-item text-ok"
                              onClick={() => {
                                const b = state.blockers.find((blk) => blk.itemId === item.id && !blk.resolvedAt);
                                if (b) resolveBlocker(b.id, actorId);
                              }}
                            >
                              <CheckCircle2 size={13} style={{ marginRight: 6 }} /> Resolver bloqueio
                            </button>
                          ) : (
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => { setBlockItemId(item.id); setBlockReason(""); }}
                            >
                              <AlertTriangle size={13} style={{ marginRight: 6 }} /> Registrar bloqueio
                            </button>
                          )}
                        </div>
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