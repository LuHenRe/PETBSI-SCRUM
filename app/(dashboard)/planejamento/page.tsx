"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppState, updateBacklogItem, frontById } from "@/lib/store";
import { Card, Badge } from "@/components/ui";
import { PriorityIcon, FrontTag, TypeBadge, Assignees } from "@/components/shared";
import { GripVertical } from "lucide-react";
import type { WorkItem } from "@/lib/types";

export default function PlanejamentoPage() {
  const state = useAppState();
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedItemId(id);
  };

  const handleDrop = (e: React.DragEvent, targetSprintId: string | null) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      const item = state.backlogItems.find(i => i.id === id);
      if (item && item.sprintId !== targetSprintId) {
        updateBacklogItem(id, { 
          title: item.title,
          type: item.type,
          description: item.description,
          frontId: item.frontId,
          priority: item.priority,
          value: item.value,
          parentId: item.parentId,
          assigneeIds: item.assigneeIds,
          deadline: item.deadline,
          sprintId: targetSprintId 
        });
      }
    }
    setDraggedItemId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const ItemCard = ({ item }: { item: WorkItem }) => (
    <div 
      draggable
      onDragStart={(e) => handleDragStart(e, item.id)}
      className="card flex items-center gap-3"
      style={{ padding: "12px", marginBottom: "8px", cursor: draggedItemId === item.id ? "grabbing" : "grab", flexDirection: "row", opacity: draggedItemId === item.id ? 0.5 : 1 }}
    >
      <GripVertical size={16} className="text-muted" />
      <div className="flex-1" style={{ minWidth: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <PriorityIcon priority={item.priority} />
          <span style={{ fontWeight: 500, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted wrap">
          <FrontTag front={frontById(state, item.frontId)} />
          <TypeBadge type={item.type} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <Assignees item={item} state={state} />
      </div>
    </div>
  );

  // Painel Esquerdo: Product Backlog
  // Majors e seus Minors desatrelados
  const backlogMinors = state.backlogItems.filter(i => !i.sprintId && i.parentId !== null && i.status !== "done" && i.status !== "cancelled");
  const backlogMajors = state.backlogItems.filter(i => i.parentId === null && !i.sprintId && i.status !== "done" && i.status !== "cancelled");
  const orphanMinors = backlogMinors.filter(i => !state.backlogItems.find(m => m.id === i.parentId));

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1>Sprint Planning</h1>
          <p className="text-muted mt-1">Arraste as tarefas (Minors) do Product Backlog para a Sprint desejada.</p>
        </div>
        <Link href="/sprint" className="btn btn-secondary">
          Voltar para Sprint Dashboard
        </Link>
      </div>

      <div className="flex flex-1 gap-4" style={{ minHeight: 0, overflow: "hidden" }}>
        {/* PAINEL ESQUERDO: PRODUCT BACKLOG */}
        <div className="card flex" style={{ width: "50%", flexDirection: "column", overflow: "hidden", background: "var(--surface-2)" }}>
          <div className="card-header flex items-center gap-2" style={{ paddingBottom: "18px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Product Backlog</h2>
            <Badge tone="muted">{backlogMinors.length} tarefas</Badge>
          </div>
          <div 
            className="flex-1"
            style={{ overflowY: "auto", padding: "16px" }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
          >
            {backlogMinors.length === 0 && (
              <div className="text-muted" style={{ padding: "32px", border: "1px dashed var(--border)", borderRadius: "8px", textAlign: "center" }}>
                Não há tarefas (Product Backlog) pendentes ou desatreladas para adicionar em Sprints.
              </div>
            )}
            
            {backlogMajors.map(major => {
              const minors = backlogMinors.filter(i => i.parentId === major.id);
              if (minors.length === 0) return null; // Só renderiza Épicos que têm tarefas para puxar
              return (
                <div key={major.id} className="mb-6">
                  <h3 className="text-sm text-muted mb-3 flex items-center gap-2" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {major.title} <span style={{ fontWeight: 400, fontSize: "11px" }}>({minors.length})</span>
                  </h3>
                  <div style={{ paddingLeft: "8px", borderLeft: "2px solid var(--border)" }}>
                    {minors.map(minor => <ItemCard key={minor.id} item={minor} />)}
                  </div>
                </div>
              );
            })}

            {orphanMinors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-muted mb-3" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tarefas Avulsas
                </h3>
                <div style={{ paddingLeft: "8px", borderLeft: "2px solid var(--border)" }}>
                  {orphanMinors.map(minor => <ItemCard key={minor.id} item={minor} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAINEL DIREITO: SPRINT BACKLOG */}
        <div className="flex gap-4" style={{ width: "50%", flexDirection: "column", overflowY: "auto", paddingRight: "8px" }}>
          {state.sprints.filter(s => s.status !== "closed").map(sprint => {
            const sprintItems = state.backlogItems.filter(i => i.sprintId === sprint.id);
            const isTarget = draggedItemId !== null;

            return (
              <div 
                key={sprint.id} 
                className="card flex"
                style={{ flexDirection: "column", borderColor: isTarget ? "var(--primary)" : "var(--border)", outline: isTarget ? "2px solid var(--primary-soft)" : "none" }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sprint.id)}
              >
                <div className="card-header flex items-center justify-between" style={{ paddingBottom: "18px", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <h2 className="flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                      {sprint.name}
                      <Badge tone={sprint.status === "active" ? "ok" : "info"}>
                        {sprint.status === "active" ? "Ativa" : "Planejada"}
                      </Badge>
                    </h2>
                    <p className="text-xs text-muted mt-1" style={{ margin: "4px 0 0" }}>{sprint.goal || "Sem meta definida"}</p>
                  </div>
                  <Badge tone="muted">{sprintItems.length} itens</Badge>
                </div>
                
                <div style={{ padding: "16px", minHeight: "150px", background: isTarget ? "var(--primary-soft)" : "transparent" }}>
                  {sprintItems.length === 0 ? (
                    <div className="text-muted text-sm flex items-center justify-center" style={{ height: "100%", padding: "24px", border: "1px dashed var(--border)", borderRadius: "8px", textAlign: "center" }}>
                      Arraste tarefas para esta Sprint
                    </div>
                  ) : (
                    <div>
                      {sprintItems.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {state.sprints.filter(s => s.status !== "closed").length === 0 && (
            <Card>
              <div className="text-muted" style={{ padding: "32px", textAlign: "center" }}>
                Nenhuma Sprint ativa ou planejada. Crie uma nova Sprint para começar o planejamento.
                <div className="mt-4">
                  <Link href="/sprint" className="btn btn-primary">Ir para Sprints</Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
