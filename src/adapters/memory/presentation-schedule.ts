import type { CalendarEvent } from "../../lib/types";

/**
 * presentation-schedule — correções de agenda da camada de apresentação (RF20).
 *
 * A correção vive AQUI (adapters/memory + seedPresentation), NÃO em
 * `src/lib/seed.ts` legado, que permanece intocado com os horários 18:30.
 *
 * - Reunião de terça e reunião principal de quarta, ambas 08:00–10:00.
 * - e1 = terça 2026-09-15; e2 = quarta 2026-09-16 (e2 é a principal).
 * - Feriado é exceção documentada: não há reunião em dia feriado.
 * - Meta do Produto ainda não definida com a equipe (placeholder apresentável).
 * - `agenda/page.tsx` mantém o store legado por ora, mas lê estes horários
 *   corrigidos do adapter quando for religada à fronteira do api-client.
 */

export const MEETING_START_TIME = "08:00";
export const MEETING_END_TIME = "10:00";

export interface CorrectedMeeting extends CalendarEvent {
  isPrincipal: boolean;
}

export const CORRECTED_MEETINGS: readonly CorrectedMeeting[] = [
  {
    id: "e1",
    title: "Reunião de acompanhamento — terça",
    date: "2026-09-15",
    time: MEETING_START_TIME,
    kind: "reuniao-terca",
    syncStatus: "local",
    sourceItemId: null,
    isPrincipal: false,
  },
  {
    id: "e2",
    title: "Reunião principal — quarta",
    date: "2026-09-16",
    time: MEETING_START_TIME,
    kind: "reuniao-quarta",
    syncStatus: "synced",
    sourceItemId: null,
    isPrincipal: true,
  },
];

/** Feriados (exceção): sem reunião nestes dias. */
export const MEETING_HOLIDAYS: readonly { date: string; label: string }[] = [
  { date: "2026-10-12", label: "Nossa Senhora Aparecida" },
  { date: "2026-11-02", label: "Finados" },
  { date: "2026-11-20", label: "Consciência Negra" },
];

/** Meta do Produto: placeholder até definição com a equipe. */
export const PRODUCT_GOAL_PLACEHOLDER = "A definir com equipe";

/** A reunião principal é a de quarta-feira. */
export function isPrincipalMeeting(kind: CalendarEvent["kind"]): boolean {
  return kind === "reuniao-quarta";
}

/**
 * Aplica as correções RF20 (18:30→08:00 nas reuniões) aos eventos de
 * apresentação. Eventos de outro tipo (prazos, eventos avulsos) são
 * preservados.
 */
export function applyScheduleCorrections(
  events: CalendarEvent[]
): CalendarEvent[] {
  const fixedTime = new Map(
    CORRECTED_MEETINGS.map((m) => [m.id, m.time] as const)
  );
  return events.map((e) => {
    const time = fixedTime.get(e.id);
    return time ? { ...e, time } : e;
  });
}
