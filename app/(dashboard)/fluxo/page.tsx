"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, Info, MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import {
  moveBacklogItem, openBlocker, resolveBlocker, useAppState,
} from "@/lib/store";
import { Button, Card, Modal, TextArea } from "@/components/ui";
import { KanbanCard } from "@/components/shared";
import type { WorkItemStatus } from "@/lib/types";

export default function FluxoPage() {
  const state = useAppState();
  const actorId = state.currentUserId ?? "";
  const [dragId, setDragId] = useState<string | null>(null);
  const [wipWarning, setWipWarning] = useState<string | null>(null);
  const [selectedFronts, setSelectedFronts] = useState<string[]>([]);
  const [collapsedFronts, setCollapsedFronts] = useState<string[]>([]);
  const [blockItemId, setBlockItemId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [dropdownMenu, setDropdownMenu] = useState<{
    itemId: string;
    status: WorkItemStatus;
    x: number;
    y: number;
    buttonHeight: number;
  } | null>(null);

  // Apenas Minors e tarefas isoladas entram no Kanban.
  // Epics (Majors) não entram no Kanban operacional.
  const operationalItems = state.backlogItems.filter(i => i.parentId !== null || !state.backlogItems.some(child => child.parentId === i.id));

  const countIn = (status: WorkItemStatus) =>
    operationalItems.filter((i) => i.status === status).length;

  const toggleFront = (frontId: string) => {
    setSelectedFronts((prev) =>
      prev.includes(frontId)
        ? prev.filter((id) => id !== frontId)
        : [...prev, frontId]
    );
  };

  const toggleCollapse = (frontId: string) => {
    setCollapsedFronts((prev) =>
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
  };

  const saveBlocker = () => {
    if (blockItemId && blockReason.trim()) {
      openBlocker(blockItemId, blockReason.trim(), actorId);
    }
    setBlockItemId(null);
    setBlockReason("");
  };

  const visibleFronts = state.fronts.filter(f => selectedFronts.length === 0 || selectedFronts.includes(f.id));

  return (
    <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      <div className="flex items-center justify-between wrap gap-3 mb-4" style={{ flexShrink: 0 }}>
        <div>
          <h1>Fluxo Kanban</h1>
          <p className="text-muted mt-1">Colunas derivadas do fluxo organizadas por Raias (Swimlanes) de Frentes.</p>
        </div>
        <span className="badge badge-info">
          <Info size={13} aria-hidden />
          WIP aplica-se globalmente por coluna
        </span>
      </div>

      {wipWarning && (
        <div className="alert alert-danger mb-4 flex-shrink-0" role="alert">
          <Ban size={16} style={{ flex: "none" }} aria-hidden />
          <span>{wipWarning}</span>
        </div>
      )}

      {state.fronts.length > 0 && (
        <div className="flex gap-2 mb-4 wrap flex-shrink-0" style={{ flexWrap: "wrap", alignItems: "center" }}>
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

      {/* SWIMLANES KANBAN */}
      <div className="flex-1 card flex" style={{ flexDirection: "column", overflow: "auto", position: "relative" }}>
        {/* Header Columns */}
        <div className="flex" style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--surface-2)", borderBottom: "1px solid var(--border)", minWidth: "max-content" }}>
          <div style={{ width: "32px", flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)" }}></div>
          {state.columns.map((column) => {
            const allItemsInCol = countIn(column.status);
            const over = column.wipLimit != null && allItemsInCol > column.wipLimit;
            return (
              <div key={column.id} className="flex items-center justify-between" style={{ width: "320px", flexShrink: 0, padding: "12px", borderRight: "1px solid var(--border)", fontWeight: 600 }}>
                <div className="flex items-center gap-2">
                  <span className={`dot ${over ? "dot-danger" : getColumnDotClass(column.status)}`} aria-hidden />
                  {column.name}
                </div>
                {column.wipLimit != null && (
                  <span style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", background: over ? "var(--danger-soft)" : "var(--surface)", color: over ? "var(--danger)" : "var(--muted)", border: "1px solid var(--border)" }}>
                    {allItemsInCol}/{column.wipLimit}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Rows (Swimlanes) */}
        <div className="flex" style={{ flexDirection: "column", minWidth: "max-content", paddingBottom: "200px" }}>
          {visibleFronts.map((front) => {
            const isCollapsed = collapsedFronts.includes(front.id);
            const frontItems = operationalItems.filter(i => i.frontId === front.id);
            
            return (
              <div key={front.id} className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
                {/* Swimlane Header (Vertical text) */}
                <div 
                  className="flex items-center justify-center"
                  onClick={() => toggleCollapse(front.id)}
                  style={{ width: "32px", flexShrink: 0, borderRight: "1px solid var(--border)", borderLeft: `4px solid ${front.color}`, flexDirection: "column", padding: "16px 0", cursor: "pointer", background: "var(--surface)", zIndex: 1 }}
                >
                  <div className="mb-4 text-muted">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </div>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, whiteSpace: "nowrap" }}>
                    {front.name}
                  </div>
                </div>

                {/* Swimlane Columns */}
                {isCollapsed ? (
                  <div className="flex-1 flex items-center text-muted text-sm" style={{ padding: "16px", background: "var(--surface-2)" }}>
                    {frontItems.length} tarefas nesta frente (expandir para ver)
                  </div>
                ) : (
                  <div className="flex flex-1">
                    {state.columns.map((column) => {
                      const itemsInCell = frontItems.filter(i => i.status === column.status);
                      return (
                        <div 
                          key={`${front.id}-${column.id}`} 
                          style={{ width: "320px", flexShrink: 0, padding: "8px", borderRight: "1px solid var(--border)", background: "transparent" }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragId) {
                              handleMove(dragId, column.status);
                              setDragId(null);
                            }
                          }}
                        >
                          <div className="flex" style={{ flexDirection: "column", gap: "8px", minHeight: "100px", height: "100%" }}>
                            {itemsInCell.map((item) => (
                              <div
                                key={item.id}
                                className="card mini-card"
                                style={{ padding: "12px", cursor: dragId === item.id ? "grabbing" : "grab", opacity: dragId === item.id ? 0.5 : 1 }}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = "move";
                                  setDragId(item.id);
                                }}
                                onDragEnd={() => setDragId(null)}
                              >
                                <KanbanCard item={item} state={state} />
                                <div className="flex justify-end mt-2">
                                  <div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      style={{ padding: "4px", height: "auto" }}
                                      onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setDropdownMenu({
                                          itemId: item.id,
                                          status: item.status,
                                          x: rect.right,
                                          y: rect.bottom,
                                          buttonHeight: rect.height
                                        });
                                      }}
                                    >
                                      <MoreHorizontal size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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

      {/* DROPDOWN MENU GLOBAL FIXO */}
      {dropdownMenu && (
        <>
          {/* Overlay invisível para fechar ao clicar fora */}
          <div 
            onClick={() => setDropdownMenu(null)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
          />
          <div 
            style={{ 
              position: "fixed",
              zIndex: 51,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
              borderRadius: "var(--radius-sm)",
              padding: "4px 0",
              minWidth: "160px",
              ...(dropdownMenu.y + 240 > (typeof window !== "undefined" ? window.innerHeight : 1000) 
                ? { bottom: (typeof window !== "undefined" ? window.innerHeight : 1000) - dropdownMenu.y + dropdownMenu.buttonHeight + 4 } 
                : { top: dropdownMenu.y + 4 }),
              ...(dropdownMenu.x - 160 < 0 
                ? { left: dropdownMenu.x + 16 } 
                : { left: dropdownMenu.x - 160 })
            }}
          >
            <div className="dropdown-title">Mover para:</div>
            {state.columns.map((c) => (
              <button
                key={c.id}
                className="dropdown-item"
                disabled={c.status === dropdownMenu.status}
                onClick={() => {
                  handleMove(dropdownMenu.itemId, c.status);
                  setDropdownMenu(null);
                }}
              >
                {c.name}
              </button>
            ))}
            <div className="dropdown-divider" />
            {dropdownMenu.status === "blocked" ? (
              <button
                className="dropdown-item text-ok"
                onClick={() => {
                  const b = state.blockers.find((blk) => blk.itemId === dropdownMenu.itemId && !blk.resolvedAt);
                  if (b) resolveBlocker(b.id, actorId);
                  setDropdownMenu(null);
                }}
              >
                <CheckCircle2 size={13} style={{ marginRight: 6 }} /> Resolver bloqueio
              </button>
            ) : (
              <button
                className="dropdown-item text-danger"
                onClick={() => { 
                  setBlockItemId(dropdownMenu.itemId); 
                  setBlockReason(""); 
                  setDropdownMenu(null);
                }}
              >
                <AlertTriangle size={13} style={{ marginRight: 6 }} /> Registrar bloqueio
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
