"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ListOrdered, Pencil, Plus, Search } from "lucide-react";
import { createBacklogItem, reorderBacklogItem, updateBacklogItem, useAppState } from "@/lib/store";
import { Button, Card, EmptyState, Select, TextInput } from "@/components/ui";
import { Assignees, DeadlinePill, FrontTag, PriorityIcon, StatusBadge, TypeBadge } from "@/components/shared";
import { ItemFormModal, type ItemDraft } from "@/components/item-form";
import type { WorkItem, WorkItemStatus } from "@/lib/types";

type SortKey = "title" | "frontId" | "type" | "priority" | "value" | "status" | "deadline" | "assignees" | null;

function QuickAdd({ parentId, defaultFrontId, placeholder }: { parentId: string | null; defaultFrontId: string | null; placeholder: string }) {
  const [title, setTitle] = useState("");
  const state = useAppState();
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (title.trim().length >= 3) {
        createBacklogItem({
          title, type: parentId === null ? "gestao" : "documento", description: "",
          frontId: defaultFrontId || state.fronts[0]?.id || "",
          priority: "media", value: "M", sprintId: null, parentId,
          assigneeIds: [], deadline: null
        });
        setTitle("");
      }
    }} className="flex items-center gap-2">
      <TextInput value={title} onChange={e => setTitle(e.target.value)} placeholder={placeholder} style={{ flex: 1 }} />
      <Button variant="secondary" type="submit" disabled={title.trim().length < 3}>
        Adicionar
      </Button>
    </form>
  );
}

export default function BacklogPage() {
  const state = useAppState();
  const canManageBacklog = state.memberships.find((membership) => membership.personId === state.currentUserId)?.role === "PRODUCT_OWNER";
  const [frontFilter, setFrontFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkItemStatus>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDesc, setSortDesc] = useState(false);

  const editingItem = editing ? state.backlogItems.find((i) => i.id === editing) ?? null : null;

  const filteredItems = useMemo(() => {
    return state.backlogItems.filter((item) => {
      if (frontFilter !== "all" && item.frontId !== frontFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.backlogItems, frontFilter, statusFilter, search]);

  const sortedItems = useMemo(() => {
    const result = [...filteredItems];
    if (sortKey !== null) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortKey === "title") {
          cmp = a.title.localeCompare(b.title);
        } else if (sortKey === "frontId") {
          const fA = state.fronts.find((f) => f.id === a.frontId)?.name || "";
          const fB = state.fronts.find((f) => f.id === b.frontId)?.name || "";
          cmp = fA.localeCompare(fB);
        } else if (sortKey === "type") {
          cmp = a.type.localeCompare(b.type);
        } else if (sortKey === "priority") {
          const pA = { alta: 3, media: 2, baixa: 1 }[a.priority] ?? 0;
          const pB = { alta: 3, media: 2, baixa: 1 }[b.priority] ?? 0;
          cmp = pB - pA;
        } else if (sortKey === "value") {
          const vA = { PQ: 3, M: 2, S: 1 }[a.value] ?? 0;
          const vB = { PQ: 3, M: 2, S: 1 }[b.value] ?? 0;
          cmp = vB - vA;
        } else if (sortKey === "status") {
          const sA = { backlog: 0, todo: 1, in_progress: 2, review: 3, blocked: 4, done: 5 }[a.status] ?? 0;
          const sB = { backlog: 0, todo: 1, in_progress: 2, review: 3, blocked: 4, done: 5 }[b.status] ?? 0;
          cmp = sA - sB;
        } else if (sortKey === "deadline") {
          const dA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const dB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          cmp = dA - dB;
          
          if (cmp === 0) {
            const pA = { alta: 3, media: 2, baixa: 1 }[a.priority] ?? 0;
            const pB = { alta: 3, media: 2, baixa: 1 }[b.priority] ?? 0;
            cmp = pB - pA;
          }
        } else if (sortKey === "assignees") {
          const nA = a.assigneeIds.map(id => state.people.find(p => p.id === id)?.name || "").join(", ");
          const nB = b.assigneeIds.map(id => state.people.find(p => p.id === id)?.name || "").join(", ");
          cmp = nA.localeCompare(nB);
        }
        return sortDesc ? -cmp : cmp;
      });
    }
    return result;
  }, [filteredItems, sortKey, sortDesc, state.fronts, state.people]);

  // Hierarquia
  const majors = sortedItems.filter(i => i.parentId === null);
  const orphanMinors = sortedItems.filter(i => i.parentId !== null && !majors.find(m => m.id === i.parentId));

  const handleSave = (draft: ItemDraft) => {
    if (editing) {
      updateBacklogItem(editing, draft);
    } else {
      createBacklogItem(draft);
    }
    setEditing(null);
  };

  const SortHeader = ({ label, field, width, className = "" }: { label: string; field: SortKey; width: number; className?: string }) => {
    const isSorted = sortKey === field;
    return (
      <th aria-sort={isSorted ? (sortDesc ? "descending" : "ascending") : "none"} style={{ minWidth: width }} className={className}>
        <button type="button" className={`btn btn-ghost ${isSorted ? "text-primary" : ""}`} onClick={() => {
          if (sortKey === field) {
            if (sortDesc) setSortKey(null);
            else setSortDesc(true);
          } else {
            setSortKey(field);
            setSortDesc(false);
          }
        }}>
        <div className="flex items-center gap-1">
          {label}
          {isSorted ? (
            sortDesc ? <ArrowDown size={14} /> : <ArrowUp size={14} />
          ) : (
            <ArrowDown size={14} style={{ opacity: 0.2 }} />
          )}
        </div></button>
      </th>
    );
  };

  const renderItemRow = (item: WorkItem, isMinor: boolean, index: number, total: number) => (
    <tr key={item.id} style={{ background: isMinor ? "var(--bg-card)" : "transparent" }}>
      <td className="sticky-col" style={{ paddingLeft: isMinor ? "32px" : "12px", borderLeft: isMinor ? "2px solid var(--border)" : "none" }}>
        <div className="flex items-center gap-2 mb-1">
          <PriorityIcon priority={item.priority} />
          <Link href={`/itens/${item.id}`} style={{ fontWeight: isMinor ? 500 : 700, fontSize: isMinor ? "0.95em" : "1em" }}>{item.title}</Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted wrap" style={{ marginTop: 4 }}>
          {item.sprintId && (
            <span style={{ fontWeight: 500 }}>{state.sprints.find((s) => s.id === item.sprintId)?.name}</span>
          )}
          <FrontTag front={state.fronts.find((f) => f.id === item.frontId)} />
          <TypeBadge type={item.type} />
        </div>
      </td>
      <td><StatusBadge status={item.status} /></td>
      <td><DeadlinePill deadline={item.deadline} /></td>
      <td><Assignees item={item} state={state} /></td>
      <td>
        <div className="flex gap-2 justify-end">
          {canManageBacklog && sortKey === null && frontFilter === "all" && statusFilter === "all" && !search && <>
            <Button size="sm" variant="ghost" aria-label={`Subir ${item.title}`} disabled={index === 0}
              onClick={() => reorderBacklogItem(item.id, -1)}><ArrowUp size={14} /></Button>
            <Button size="sm" variant="ghost" aria-label={`Descer ${item.title}`} disabled={index === total - 1}
              onClick={() => reorderBacklogItem(item.id, 1)}><ArrowDown size={14} /></Button>
          </>}
          {canManageBacklog &&
          <Button
            size="sm"
            variant="ghost"
            aria-label="Editar item"
            onClick={() => { setEditing(item.id); setModalOpen(true); }}
          >
            <Pencil size={14} />
          </Button>}
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex items-center justify-between wrap gap-3 mb-4">
        <div>
          <h1>Product Backlog</h1>
          <p className="text-muted mt-1">Épicos (Majors) e suas Tarefas (Minors).</p>
        </div>
        {canManageBacklog && <Button variant="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16} />
          Criar item detalhado
        </Button>}
      </div>

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
              {state.fronts.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </Select>
          </div>
          <div style={{ width: 200 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | WorkItemStatus)} aria-label="Filtrar por estado">
              <option value="all">Todos os estados</option>
              {state.columns.map((c) => (
                <option key={c.id} value={c.status}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>
      
      {canManageBacklog && (
        <Card className="mb-4">
          <QuickAdd parentId={null} defaultFrontId={frontFilter !== "all" ? frontFilter : null} placeholder="Digite o título de um novo Épico (Major) e aperte Enter..." />
        </Card>
      )}

      {sortedItems.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListOrdered />}
            title="Nenhum item encontrado"
            description="Não há itens disponíveis para os filtros e permissões atuais."
          />
        </Card>
      ) : (
        <Card>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 960 }}>
              <thead>
                <tr>
                  <SortHeader label="Item" field="title" width={350} className="sticky-col" />
                  <SortHeader label="Estado" field="status" width={110} />
                  <SortHeader label="Prazo" field="deadline" width={100} />
                  <SortHeader label="Responsáveis" field="assignees" width={110} />
                  <th style={{ width: 90, textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {majors.map((major, index) => {
                  const minors = sortedItems.filter(i => i.parentId === major.id);
                  return (
                    <React.Fragment key={major.id}>
                      {renderItemRow(major, false, index, majors.length)}
                      {minors.map((minor, minorIdx) => renderItemRow(minor, true, minorIdx, minors.length))}
                      {canManageBacklog && (
                        <tr>
                          <td colSpan={5} style={{ paddingLeft: "32px", borderLeft: "2px solid var(--border)", background: "var(--bg-card)" }}>
                            <QuickAdd parentId={major.id} defaultFrontId={major.frontId} placeholder={`Nova tarefa para ${major.title}...`} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                
                {orphanMinors.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={5} className="text-muted" style={{ padding: "16px 12px", background: "var(--bg-card)" }}>
                        Tarefas sem Épico ou cujo Épico está fora dos filtros atuais:
                      </td>
                    </tr>
                    {orphanMinors.map((minor, minorIdx) => renderItemRow(minor, true, minorIdx, orphanMinors.length))}
                  </>
                )}
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

function draftFrom(item: { title: string; type: "documento" | "codigo" | "pesquisa" | "material" | "infra" | "gestao"; description: string; frontId: string; priority: "alta" | "media" | "baixa"; value: "PQ" | "M" | "S"; sprintId: string | null; parentId: string | null; assigneeIds: string[]; deadline: string | null }): ItemDraft {
  return {
    title: item.title,
    type: item.type,
    description: item.description,
    frontId: item.frontId,
    priority: item.priority,
    value: item.value,
    sprintId: item.sprintId,
    parentId: item.parentId,
    assigneeIds: item.assigneeIds,
    deadline: item.deadline,
  };
}
