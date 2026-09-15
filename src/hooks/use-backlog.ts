"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";
import type { BacklogPriority } from "@/domain/shared/backlog-priority";
import type { ItemDraft } from "@/components/item-form";

/**
 * useBacklog — filtros, ordenação local e create/save via api-client.
 * Erros de domínio (título<3, frente vazia, sem permissão) viram alert.
 */
export function useBacklog() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);
  const version = apiClient.getVersion();

  const [frontFilter, setFrontFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkItemStatus>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const allItems = useMemo(() => apiClient.listPresentationItems(), [version]);
  const fronts = useMemo(() => apiClient.listFronts(), [version]);
  const columns = useMemo(() => apiClient.listColumns(), [version]);
  const sprints = useMemo(() => apiClient.listSprints(), [version]);
  const stateForShared = useMemo(() => {
    const statics = apiClient.getStatics();
    return {
      ...statics,
      backlogItems: allItems,
      fronts,
      columns,
      sprints,
      currentUserId: apiClient.getCurrentUserId(),
    };
  }, [allItems, fronts, columns, sprints]);

  const editingItem = editing ? allItems.find((i) => i.id === editing) ?? null : null;

  const items = useMemo(() => {
    return allItems.filter((item) => {
      if (frontFilter !== "all" && item.frontId !== frontFilter) return false;
      if (statusFilter !== "all" && (item.status as string) !== (statusFilter as string))
        return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allItems, frontFilter, statusFilter, search]);

  const handleSave = async (draft: ItemDraft) => {
    try {
      setSaveError(null);
      const priority: BacklogPriority = draft.priority;
      if (editing) {
        await apiClient.saveItem(editing, {
          title: draft.title,
          description: draft.description,
          frontId: draft.frontId,
          priority,
          deadline: draft.deadline,
          type: draft.type,
          value: draft.value,
          sprintId: draft.sprintId,
          assigneeIds: draft.assigneeIds,
        });
      } else {
        await apiClient.createItem({
          title: draft.title,
          description: draft.description,
          frontId: draft.frontId,
          priority,
          deadline: draft.deadline,
          type: draft.type,
          value: draft.value,
          sprintId: draft.sprintId,
          assigneeIds: draft.assigneeIds,
        });
      }
      setEditing(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar item";
      setSaveError(msg);
      throw e;
    }
  };

  const reorder = (id: string, direction: -1 | 1) => {
    apiClient.reorderItem(id, direction);
  };

  return {
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
    allItems,
    fronts,
    columns,
    sprints,
    stateForShared,
    editingItem,
    items,
    handleSave,
    reorder,
  };
}
