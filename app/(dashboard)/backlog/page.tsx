"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ListOrdered, Pencil, Plus, Search } from "lucide-react";
import { Button, Card, EmptyState, Select, TextInput } from "@/components/ui";
import { Assignees, DeadlinePill, FrontBar, PriorityBadge, StatusBadge, TypeBadge, ValueBadge } from "@/components/shared";
import { ItemFormModal, type ItemDraft } from "@/components/item-form";
import { useBacklog } from "@/hooks/use-backlog";
import { useCanWrite } from "@/hooks/use-can-write";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";

export default function BacklogPage() {
  const {
    frontFilter,
    setFrontFilter,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    saveError,
    setSaveError,
    fronts,
    columns,
    sprints,
    stateForShared,
    editingItem,
    items,
    handleSave,
    reorder,
  } = useBacklog();
  const { canWrite } = useCanWrite();

  return (
    <div>
      <div className="flex items-center justify-between wrap gap-3 mb-4">
        <div>
          <h1>Product Backlog</h1>
          <p className="text-muted mt-1">Itens ordenáveis por prioridade, com tipo, valor, frente e estado.</p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={() => { setEditing(null); setSaveError(null); setModalOpen(true); }}>
            <Plus size={16} />
            Novo item
          </Button>
        )}
      </div>

      {saveError && (
        <div className="alert alert-danger mb-4" role="alert">
          {saveError}
        </div>
      )}

      <Card className="mb-4">
        <div className="flex items-center gap-3 wrap">
          <div className="flex-1" style={{ minWidth: 200, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--muted)" }} aria-hidden />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              style={{ paddingLeft: 30 }}
              aria-label="Buscar itens"
            />
          </div>
          <div style={{ width: 220 }}>
            <Select value={frontFilter} onChange={(e) => setFrontFilter(e.target.value)} aria-label="Filtrar por frente">
              <option value="all">Todas as frentes</option>
              {fronts.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </Select>
          </div>
          <div style={{ width: 200 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as WorkItemStatus)} aria-label="Filtrar por estado">
              <option value="all">Todos os estados</option>
              {columns.map((c) => (
                <option key={c.id} value={c.status}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListOrdered />}
            title="Nenhum item encontrado"
            description="Ajuste os filtros ou crie um novo item no Product Backlog."
            action={
              canWrite ? (
                <Button variant="primary" onClick={() => { setEditing(null); setSaveError(null); setModalOpen(true); }}>
                  <Plus size={16} /> Criar item
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 6 }}></th>
                  <th>Item</th>
                  <th>Frente</th>
                  <th>Tipo</th>
                  <th>Prioridade</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Prazo</th>
                  <th>Responsáveis</th>
                  <th style={{ width: 90 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td><FrontBar frontId={item.frontId} state={stateForShared} /></td>
                    <td>
                      <Link href={`/itens/${item.id}`} style={{ fontWeight: 600 }}>{item.title}</Link>
                      {item.sprintId && (
                        <div className="text-xs text-muted">{sprints.find((s) => s.id === item.sprintId)?.name}</div>
                      )}
                    </td>
                    <td>
                      <span className="text-sm">{fronts.find((f) => f.id === item.frontId)?.name}</span>
                    </td>
                    <td><TypeBadge type={item.type} /></td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><ValueBadge value={item.value} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td><DeadlinePill deadline={item.deadline} /></td>
                    <td><Assignees item={item} state={stateForShared} /></td>
                    <td>
                      {canWrite && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Mover para cima"
                            disabled={index === 0}
                            onClick={() => reorder(item.id, -1)}
                          >
                            <ArrowUp size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Mover para baixo"
                            disabled={index === items.length - 1}
                            onClick={() => reorder(item.id, 1)}
                          >
                            <ArrowDown size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Editar item"
                            onClick={() => { setEditing(item.id); setSaveError(null); setModalOpen(true); }}
                          >
                            <Pencil size={14} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ItemFormModal
        open={modalOpen}
        initial={editingItem ? draftFrom(editingItem) : null}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </div>
  );
}

function draftFrom(item: { title: string; type: "documento" | "codigo" | "pesquisa" | "material" | "infra" | "gestao"; description: string; frontId: string; priority: "alta" | "media" | "baixa"; value: "PQ" | "M" | "S"; sprintId: string | null; assigneeIds: string[]; deadline: string | null }): ItemDraft {
  return {
    title: item.title,
    type: item.type,
    description: item.description,
    frontId: item.frontId,
    priority: item.priority,
    value: item.value,
    sprintId: item.sprintId,
    assigneeIds: item.assigneeIds,
    deadline: item.deadline,
  };
}
