"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";

/**
 * useWorkflowBoard — estado e interações do quadro Kanban.
 * Regras (WIP, transição, permissão) vêm do domínio via api-client;
 * o hook só exibe `wipWarning` retornado como DomainError.message.
 */
export function useWorkflowBoard() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);

  const [dragId, setDragId] = useState<string | null>(null);
  const [wipWarning, setWipWarning] = useState<string | null>(null);
  const [blockItemId, setBlockItemId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const version = apiClient.getVersion();
  const items = useMemo(() => apiClient.listPresentationItems(), [version]);
  const columns = useMemo(() => apiClient.listColumns(), [version]);
  const blockers = useMemo(() => apiClient.listPresentationBlockers(), [version]);
  const stateForCard = useMemo(() => {
    const statics = apiClient.getStatics();
    return {
      ...statics,
      backlogItems: items,
      columns,
      blockers,
      currentUserId: apiClient.getCurrentUserId(),
    };
  }, [items, columns, blockers]);

  const handleMove = async (itemId: string, toStatus: WorkItemStatus) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || (item.status as string) === (toStatus as string)) return;
    try {
      setWipWarning(null);
      await apiClient.moveItem(itemId, toStatus);
    } catch (e) {
      setWipWarning(e instanceof Error ? e.message : "Erro ao mover item");
    }
  };

  const saveBlocker = async () => {
    if (blockItemId && blockReason.trim()) {
      try {
        setWipWarning(null);
        await apiClient.openBlocker(blockItemId, blockReason.trim());
      } catch (e) {
        setWipWarning(e instanceof Error ? e.message : "Erro ao registrar bloqueio");
      }
    }
    setBlockItemId(null);
    setBlockReason("");
  };

  const resolveBlockerFromState = async (itemId: string) => {
    const blocker = blockers.find((b) => b.itemId === itemId && !b.resolvedAt);
    if (!blocker) return;
    try {
      setWipWarning(null);
      await apiClient.resolveBlocker(itemId, blocker.id);
    } catch (e) {
      setWipWarning(e instanceof Error ? e.message : "Erro ao resolver bloqueio");
    }
  };

  return {
    items,
    columns,
    blockers,
    stateForCard,
    dragId,
    setDragId,
    wipWarning,
    setWipWarning,
    blockItemId,
    setBlockItemId,
    blockReason,
    setBlockReason,
    handleMove,
    saveBlocker,
    resolveBlockerFromState,
  };
}
