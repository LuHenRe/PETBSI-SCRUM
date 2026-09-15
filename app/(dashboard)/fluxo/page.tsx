"use client";

import { Ban, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Button, Card, Modal, TextArea } from "@/components/ui";
import { KanbanCard } from "@/components/shared";
import { useWorkflowBoard } from "@/hooks/use-workflow-board";
import { useCanWrite } from "@/hooks/use-can-write";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";

export default function FluxoPage() {
  const {
    items,
    columns,
    stateForCard,
    dragId,
    setDragId,
    wipWarning,
    blockItemId,
    setBlockItemId,
    blockReason,
    setBlockReason,
    handleMove,
    saveBlocker,
    resolveBlockerFromState,
  } = useWorkflowBoard();
  const { canWrite } = useCanWrite();

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
        {columns.map((column) => {
          const colItems = items.filter((i) => (i.status as string) === (column.status as string));
          const over = column.wipLimit != null && colItems.length > column.wipLimit;
          return (
            <section
              key={column.id}
              className="board-col"
              aria-label={column.name}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  void handleMove(dragId, column.status as WorkItemStatus);
                  setDragId(null);
                }
              }}
            >
              <div className="board-col-header">
                <span className="board-col-title">
                  <span className={`dot ${over ? "dot-danger" : "dot-muted"}`} aria-hidden />
                  {column.name}
                  <span className="text-muted" style={{ fontWeight: 500 }}>{colItems.length}</span>
                </span>
                {column.wipLimit != null && (
                  <span className={`wip ${over ? "wip-over" : ""}`}>
                    {colItems.length}/{column.wipLimit}
                  </span>
                )}
              </div>
              <div className="board-col-body">
                {colItems.length === 0 && (
                  <div className="board-empty">Nenhum item</div>
                )}
                {colItems.map((item) => (
                  <div key={item.id} className="flex" style={{ flexDirection: "column", gap: 6 }}>
                    <div draggable={canWrite} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragId(item.id); }}>
                      <KanbanCard item={item} state={stateForCard} />
                    </div>
                    {canWrite && (
                      <div className="flex gap-2">
                        {(column.status as string) === "blocked" && (
                          <Button size="sm" variant="danger" style={{ flex: 1 }} onClick={() => void resolveBlockerFromState(item.id)}>
                            <CheckCircle2 size={13} /> Resolver
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ flex: 1 }}
                          onClick={() => { setBlockItemId(item.id); setBlockReason(""); }}
                        >
                          <AlertTriangle size={13} /> Bloquear
                        </Button>
                        <select
                          className="select"
                          style={{ width: "auto", padding: "3px 6px", fontSize: 12 }}
                          aria-label={`Mover ${item.title}`}
                          value={item.status}
                          onChange={(e) => void handleMove(item.id, e.target.value as WorkItemStatus)}
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.status} disabled={(c.status as string) === (item.status as string)}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
            <Button variant="primary" onClick={() => void saveBlocker()}>Registrar</Button>
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
}
