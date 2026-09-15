"use client";

import { useEffect, useReducer, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { ProjectMembership } from "@/domain/project/project-membership";

/**
 * useCanWrite — lê os vínculos do domínio e indica se o usuário atual
 * pode escrever (possui ao menos um vínculo com canEdit).
 * Membro sem canEdit é exibido como Visitante (RN13) e tem os botões
 * Novo/Editar/Mover/Bloquear ocultos nas páginas migradas.
 */
export function useCanWrite() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);
  const version = apiClient.getVersion();
  const currentUserId = apiClient.getCurrentUserId();
  const [mine, setMine] = useState<ProjectMembership[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getDeps()
      .memberships.listAll()
      .then((all) => {
        if (!cancelled) {
          setMine(all.filter((m) => m.personId === currentUserId));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [version, currentUserId]);

  const isVisitante = mine.length > 0 && mine.every((m) => !m.canEdit);
  return { isVisitante, canWrite: !isVisitante };
}
