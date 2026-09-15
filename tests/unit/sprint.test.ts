import { describe, expect, it, beforeEach } from "vitest";
import { Sprint } from "@/domain/sprint/sprint";
import { DateRange } from "@/domain/shared/date-range";
import { DomainError } from "@/domain/shared/domain-error";

function makePeriod(start: string, end: string): DateRange {
  return new DateRange(start, end);
}

describe("Sprint", () => {
  let sprint: Sprint;
  const baseDraft = {
    id: "s1",
    name: "Sprint 1",
    period: makePeriod("2026-09-01", "2026-09-15"),
  };

  beforeEach(() => {
    sprint = Sprint.create(baseDraft);
  });

  describe("create", () => {
    it("should create sprint with rascunho status and no goal", () => {
      expect(sprint.id).toBe("s1");
      expect(sprint.name).toBe("Sprint 1");
      expect(sprint.status).toBe("rascunho");
      expect(sprint.goal).toBeNull();
      expect(sprint.getSelectedItemIds()).toEqual([]);
      expect(sprint.isActive()).toBe(false);
    });

    it("should reject empty name", () => {
      expect(() => Sprint.create({ ...baseDraft, name: "" })).toThrow(DomainError);
    });

    it("should reject invalid period (inverted)", () => {
      expect(() => Sprint.create({ ...baseDraft, period: makePeriod("2026-09-15", "2026-09-01") })).toThrow(DomainError);
    });
  });

  describe("definirMeta", () => {
    it("should set goal and change status to planejada (D05)", () => {
      sprint.definirMeta("Meta da Sprint 1");
      expect(sprint.goal).toBe("Meta da Sprint 1");
      expect(sprint.status).toBe("planejada");
    });

    it("should reject empty goal", () => {
      expect(() => sprint.definirMeta("")).toThrow(DomainError);
      expect(() => sprint.definirMeta("   ")).toThrow(DomainError);
    });

    it("should reject setting goal after sprint started", () => {
      sprint.definirMeta("Meta");
      sprint.iniciar([]);
      expect(() => sprint.definirMeta("Nova meta")).toThrow(DomainError);
    });

    it("should reject setting goal after sprint closed", () => {
      sprint.definirMeta("Meta");
      sprint.iniciar([]);
      sprint.close();
      expect(() => sprint.definirMeta("Nova meta")).toThrow(DomainError);
    });
  });

  describe("iniciar", () => {
    it("should require meta before starting (D05)", () => {
      expect(() => sprint.iniciar([])).toThrow(DomainError);
      expect(() => sprint.iniciar([])).toThrow("Meta da Sprint");
    });

    it("should start sprint when meta defined and no other active", () => {
      sprint.definirMeta("Meta da Sprint");
      sprint.iniciar([]);
      expect(sprint.status).toBe("em_andamento");
      expect(sprint.isActive()).toBe(true);
    });

    it("should reject starting when another sprint is active (D07)", () => {
      const otherSprint = Sprint.create({ id: "s2", name: "Sprint 2", period: makePeriod("2026-09-16", "2026-09-30") });
      otherSprint.definirMeta("Meta 2");
      otherSprint.iniciar([]);

      sprint.definirMeta("Meta 1");
      expect(() => sprint.iniciar([otherSprint])).toThrow(DomainError);
      expect(() => sprint.iniciar([otherSprint])).toThrow("já existe uma Sprint ativa");
    });

    it("should allow starting when other sprint is not active", () => {
      const otherSprint = Sprint.create({ id: "s2", name: "Sprint 2", period: makePeriod("2026-09-16", "2026-09-30") });
      otherSprint.definirMeta("Meta 2");
      // otherSprint not started

      sprint.definirMeta("Meta 1");
      sprint.iniciar([otherSprint]);
      expect(sprint.status).toBe("em_andamento");
    });

    it("should reject starting from invalid status (not planejada)", () => {
      // rascunho without meta
      expect(() => sprint.iniciar([])).toThrow(DomainError);

      // closed sprint
      sprint.definirMeta("Meta");
      sprint.iniciar([]);
      sprint.close();
      expect(() => sprint.iniciar([])).toThrow(DomainError);
    });
  });

  describe("selectItem", () => {
    beforeEach(() => {
      sprint.definirMeta("Meta da Sprint");
    });

    it("should select item without duplicating (D06)", () => {
      sprint.selectItem("i1");
      sprint.selectItem("i2");
      expect(sprint.getSelectedItemIds()).toEqual(["i1", "i2"]);
    });

    it("should reject duplicate item in same sprint (D06)", () => {
      sprint.selectItem("i1");
      expect(() => sprint.selectItem("i1")).toThrow(DomainError);
      expect(() => sprint.selectItem("i1")).toThrow("já está seleccionado");
      expect(sprint.getSelectedItemIds()).toEqual(["i1"]);
    });

    it("should reject empty itemId", () => {
      expect(() => sprint.selectItem("")).toThrow(DomainError);
    });

    it("should allow selecting during em_andamento (adapt Sprint Backlog)", () => {
      sprint.iniciar([]);
      sprint.selectItem("i1");
      expect(sprint.getSelectedItemIds()).toEqual(["i1"]);
    });

    it("should reject selecting after sprint closed", () => {
      sprint.iniciar([]);
      sprint.close();
      expect(() => sprint.selectItem("i1")).toThrow(DomainError);
      expect(() => sprint.selectItem("i1")).toThrow("encerrada não aceita");
    });
  });

  describe("close", () => {
    it("should close active sprint and preserve history (D07)", () => {
      sprint.definirMeta("Meta da Sprint");
      sprint.iniciar([]);
      sprint.selectItem("i1");
      sprint.selectItem("i2");

      sprint.close();

      expect(sprint.status).toBe("encerrada");
      expect(sprint.isActive()).toBe(false);
      expect(sprint.goal).toBe("Meta da Sprint");
      expect(sprint.getSelectedItemIds()).toEqual(["i1", "i2"]);
    });

    it("should reject closing non-active sprint", () => {
      // rascunho
      expect(() => sprint.close()).toThrow(DomainError);

      // planejada
      sprint.definirMeta("Meta");
      expect(() => sprint.close()).toThrow(DomainError);

      // encerrada
      sprint.iniciar([]);
      sprint.close();
      expect(() => sprint.close()).toThrow(DomainError);
    });
  });

  describe("getSelectedItemIds", () => {
    it("should return defensive copy", () => {
      sprint.definirMeta("Meta");
      sprint.selectItem("i1");
      const ids = sprint.getSelectedItemIds() as string[];
      ids.push("i2");
      expect(sprint.getSelectedItemIds()).toEqual(["i1"]);
    });
  });
});