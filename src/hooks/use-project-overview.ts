"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { ProjectOverview } from "@/application/overview/get-project-overview";

/**
 * useProjectOverview — dados via getOverview({ allowedFrontIds }).
 * Filtro por frente respeita permissão; Visitante vê sem links de escrita
 * (a decisão de esconder links vive no shell, aqui só filtramos dados).
 */
export function useProjectOverview() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);
  const version = apiClient.getVersion();

  const [frontFilter, setFrontFilter] = useState<string>("all");
  const [allowed, setAllowed] = useState<string[] | null>(null);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);

  const statics = useMemo(() => apiClient.getStatics(), [version]);
  const presentationItems = useMemo(() => apiClient.listPresentationItems(), [version]);
  const frontsAll = useMemo(() => apiClient.listFronts(), [version]);
  const sprintsLegacy = useMemo(() => apiClient.listSprints(), [version]);

  const stateForShared = useMemo(
    () => ({
      ...statics,
      backlogItems: presentationItems,
      fronts: frontsAll,
      sprints: sprintsLegacy,
      currentUserId: apiClient.getCurrentUserId(),
    }),
    [statics, presentationItems, frontsAll, sprintsLegacy]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const actorId = apiClient.getCurrentUserId() ?? "";
      const allowedIds = actorId
        ? await apiClient.getAllowedFrontIds()
        : frontsAll.map((f) => f.id);
      if (cancelled) return;
      setAllowed(allowedIds);
      const ov = await apiClient.getOverview({ allowedFrontIds: allowedIds });
      if (!cancelled) setOverview(ov);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [version, frontsAll]);

  const fronts = useMemo(() => {
    if (!allowed) return frontsAll;
    return frontsAll.filter((f) => allowed.includes(f.id));
  }, [frontsAll, allowed]);

  const itemsBase = useMemo(() => {
    const base = overview?.items ?? [];
    const fallback =
      overview == null
        ? presentationItems.filter((i) =>
            allowed == null ? true : allowed.includes(i.frontId)
          )
        : [];
    const src = overview ? base : fallback;
    if (frontFilter === "all") return src;
    return src.filter((i) => i.frontId === frontFilter);
  }, [overview, presentationItems, allowed, frontFilter]);

  const counts = useMemo(() => {
    if (overview && frontFilter === "all") {
      const wip = overview.wipByStatus;
      const inProgress = wip["in_progress"] ?? 0;
      const blocked = wip["blocked"] ?? 0;
      const done = wip["done"] ?? 0;
      return {
        total: overview.totalItems,
        inProgress,
        blocked,
        done,
        open: overview.totalItems - done,
      };
    }
    return {
      total: itemsBase.length,
      inProgress: itemsBase.filter((i) => i.status === "in_progress").length,
      blocked: itemsBase.filter((i) => i.status === "blocked").length,
      done: itemsBase.filter((i) => i.status === "done").length,
      open: itemsBase.filter((i) => i.status !== "done").length,
    };
  }, [overview, itemsBase, frontFilter]);

  const activeSprintLegacy = sprintsLegacy.find((s) => s.status === "active") ?? null;
  const activeSprint = overview?.activeSprint ?? (activeSprintLegacy
    ? {
        id: activeSprintLegacy.id,
        name: activeSprintLegacy.name,
        goal: activeSprintLegacy.goal,
        status: "em_andamento" as const,
      }
    : null);

  const activeItems = useMemo(() => {
    if (!activeSprintLegacy) return [];
    const ids = new Set(activeSprintLegacy.itemIds);
    return presentationItems.filter((i) => ids.has(i.id));
  }, [activeSprintLegacy, presentationItems]);

  const sprintProgress = activeItems.length
    ? Math.round((activeItems.filter((i) => i.status === "done").length / activeItems.length) * 100)
    : 0;

  const upcomingDeadlines = useMemo(() => {
    if (overview && frontFilter !== "all") {
      return presentationItems
        .filter(
          (i) =>
            i.deadline &&
            i.status !== "done" &&
            i.frontId === frontFilter &&
            (allowed == null || allowed.includes(i.frontId))
        )
        .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
        .slice(0, 5);
    }
    if (overview && frontFilter === "all") {
      return overview.items
        .filter((i) => i.deadline && i.status !== "done")
        .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
        .slice(0, 5)
        .map((di) => presentationItems.find((p) => p.id === di.id) ?? null)
        .filter((x): x is NonNullable<typeof x> => !!x);
    }
    return presentationItems
      .filter(
        (i) =>
          i.deadline &&
          i.status !== "done" &&
          (frontFilter === "all" || i.frontId === frontFilter) &&
          (allowed == null || allowed.includes(i.frontId))
      )
      .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
      .slice(0, 5);
  }, [overview, presentationItems, frontFilter, allowed]);

  const openBlockers = useMemo(() => {
    const legacyById = new Map(statics.blockers.map((b) => [b.id, b]));
    const fromOverview = overview?.openBlockers ?? null;
    if (fromOverview) {
      return fromOverview
        .filter((b) => frontFilter === "all" || b.frontId === frontFilter)
        .map((b) => {
          const legacy = legacyById.get(b.blockerId);
          return {
            id: b.blockerId,
            itemId: b.itemId,
            description: b.description,
            openedAt: legacy?.openedAt ?? "",
            openedBy: legacy?.openedBy ?? "",
            resolvedAt: null as string | null,
            resolvedBy: null as string | null,
          };
        });
    }
    return statics.blockers
      .filter((b) => !b.resolvedAt)
      .filter((b) => {
        const item = presentationItems.find((i) => i.id === b.itemId);
        if (!item) return false;
        if (allowed != null && !allowed.includes(item.frontId)) return false;
        if (frontFilter !== "all" && item.frontId !== frontFilter) return false;
        return true;
      });
  }, [overview, statics, presentationItems, allowed, frontFilter]);

  const upcomingEvents = useMemo(
    () =>
      statics.events
        .filter((e) => e.date >= "2026-09-13")
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(0, 4),
    [statics]
  );

  const byFront = useMemo(
    () =>
      fronts.map((front) => {
        const items = itemsBase.filter((i) => i.frontId === front.id);
        const b = items.filter((i) => (i as { status: string }).status !== "done").length;
        const d = items.filter((i) => (i as { status: string }).status === "done").length;
        return { front, b, d, total: items.length };
      }),
    [fronts, itemsBase]
  );

  return {
    frontFilter,
    setFrontFilter,
    allowed,
    overview,
    statics,
    presentationItems,
    frontsAll,
    fronts,
    sprintsLegacy,
    stateForShared,
    itemsBase,
    counts,
    activeSprint,
    activeSprintLegacy,
    sprintProgress,
    upcomingDeadlines,
    openBlockers,
    upcomingEvents,
    byFront,
  };
}
