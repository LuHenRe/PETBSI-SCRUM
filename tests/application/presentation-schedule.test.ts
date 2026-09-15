import { describe, expect, it } from "vitest";
import { createApiClient } from "@/lib/api-client";
import { createSeedState } from "@/lib/seed";
import {
  CORRECTED_MEETINGS,
  MEETING_HOLIDAYS,
  MEETING_START_TIME,
  PRODUCT_GOAL_PLACEHOLDER,
  applyScheduleCorrections,
  isPrincipalMeeting,
} from "@/adapters/memory/presentation-schedule";

// MT-4.4 — Correção semente/agenda (RF20)
// Correção vive em src/adapters/memory + seedPresentation(), NÃO em
// src/lib/seed.ts legado: 18:30→08:00, e1/e2 terça/quarta, e2 principal,
// feriado como exceção, ProductGoal placeholder.
describe("MT-4.4 presentation-schedule", () => {
  it("reuniões corrigidas: e1 terça e e2 quarta às 08:00, e2 principal", () => {
    expect(MEETING_START_TIME).toBe("08:00");
    const e1 = CORRECTED_MEETINGS.find((m) => m.id === "e1")!;
    const e2 = CORRECTED_MEETINGS.find((m) => m.id === "e2")!;
    expect(e1.date).toBe("2026-09-15");
    expect(new Date(`${e1.date}T12:00:00`).getDay()).toBe(2);
    expect(e1.time).toBe("08:00");
    expect(e1.isPrincipal).toBe(false);
    expect(e2.date).toBe("2026-09-16");
    expect(new Date(`${e2.date}T12:00:00`).getDay()).toBe(3);
    expect(e2.time).toBe("08:00");
    expect(e2.isPrincipal).toBe(true);
    expect(isPrincipalMeeting("reuniao-quarta")).toBe(true);
    expect(isPrincipalMeeting("reuniao-terca")).toBe(false);
  });

  it("feriado como exceção documentada + ProductGoal placeholder", () => {
    expect(MEETING_HOLIDAYS.length).toBeGreaterThan(0);
    expect(PRODUCT_GOAL_PLACEHOLDER).toBe("A definir com equipe");
  });

  it("seed legado intocado (18:30) e apresentação corrigida (08:00)", () => {
    const legacy = createSeedState();
    expect(legacy.events.find((e) => e.id === "e1")!.time).toBe("18:30");
    const corrected = applyScheduleCorrections(legacy.events);
    expect(corrected.find((e) => e.id === "e1")!.time).toBe("08:00");
    expect(corrected.find((e) => e.id === "e2")!.time).toBe("08:00");
    // Eventos não-reunião preservados (prazo segue 23:59).
    expect(corrected.find((e) => e.id === "e3")!.time).toBe("23:59");

    const client = createApiClient();
    const statics = client.getStatics();
    expect(statics.events.find((e) => e.id === "e1")!.time).toBe("08:00");
    expect(statics.events.find((e) => e.id === "e2")!.time).toBe("08:00");
  });
});
