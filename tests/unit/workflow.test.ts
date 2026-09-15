import { describe, expect, it } from "vitest";
import { WorkItemStatus } from "@/domain/shared/work-item-status";
import { WipLimit } from "@/domain/shared/wip-limit";
import { WorkflowColumn } from "@/domain/workflow/workflow-column";
import { WipPolicy } from "@/domain/workflow/wip-policy";
import { WorkItemStateChange } from "@/domain/workflow/work-item-state-change";
import { DomainError } from "@/domain/shared/domain-error";

describe("workflow", () => {
  describe("WorkflowColumn", () => {
    it("should create column with valid data", () => {
      const column = new WorkflowColumn({
        id: "c1",
        status: "in_progress",
        name: "Em andamento",
        wipLimit: WipLimit.of(4),
      });
      expect(column.id).toBe("c1");
      expect(column.status).toBe("in_progress");
      expect(column.name).toBe("Em andamento");
      expect(column.wipLimit.value).toBe(4);
    });

    it("should reject invalid status", () => {
      expect(() =>
        new WorkflowColumn({
          id: "c1",
          status: "invalid" as WorkItemStatus,
          name: "Test",
          wipLimit: WipLimit.of(4),
        })
      ).toThrow(DomainError);
    });

    it("should reject empty id", () => {
      expect(() =>
        new WorkflowColumn({
          id: "",
          status: "in_progress",
          name: "Test",
          wipLimit: WipLimit.of(4),
        })
      ).toThrow(DomainError);
    });

    it("should reject empty name", () => {
      expect(() =>
        new WorkflowColumn({
          id: "c1",
          status: "in_progress",
          name: "",
          wipLimit: WipLimit.of(4),
        })
      ).toThrow(DomainError);
    });
  });

  describe("WipPolicy", () => {
    it("should allow entry when WIP is unlimited", () => {
      const limit = WipLimit.unlimited();
      expect(WipPolicy.canEnter(limit, 0)).toBe(true);
      expect(WipPolicy.canEnter(limit, 999)).toBe(true);
    });

    it("should allow entry when current count < limit", () => {
      const limit = WipLimit.of(4);
      expect(WipPolicy.canEnter(limit, 0)).toBe(true);
      expect(WipPolicy.canEnter(limit, 3)).toBe(true);
    });

    it("should reject entry when WIP would be exceeded (D03 - cheio rejeita)", () => {
      const limit = WipLimit.of(4);
      expect(WipPolicy.canEnter(limit, 4)).toBe(false);
      expect(WipPolicy.canEnter(limit, 5)).toBe(false);
    });

    it("should reject negative current count", () => {
      expect(() => WipPolicy.canEnter(WipLimit.of(4), -1)).toThrow(DomainError);
    });
  });

  describe("WorkflowColumn.canReceive", () => {
    it("should delegate to WipPolicy (sem limite aceita)", () => {
      const column = new WorkflowColumn({
        id: "c_backlog",
        status: "backlog",
        name: "Product Backlog",
        wipLimit: WipLimit.unlimited(),
      });
      expect(column.canReceive(0)).toBe(true);
      expect(column.canReceive(999)).toBe(true);
    });

    it("should allow when under limit", () => {
      const column = new WorkflowColumn({
        id: "c_todo",
        status: "todo",
        name: "A fazer",
        wipLimit: WipLimit.of(4),
      });
      expect(column.canReceive(0)).toBe(true);
      expect(column.canReceive(3)).toBe(true);
    });

    it("should reject when at limit (D03 - cheio rejeita)", () => {
      const column = new WorkflowColumn({
        id: "c_blocked",
        status: "blocked",
        name: "Bloqueado",
        wipLimit: WipLimit.of(2),
      });
      expect(column.canReceive(2)).toBe(false);
      expect(column.canReceive(3)).toBe(false);
    });
  });

  describe("WorkItemStateChange", () => {
    it("should create state change record", () => {
      const change = new WorkItemStateChange({
        id: "h1",
        itemId: "i1",
        actorId: "p1",
        from: "backlog",
        to: "todo",
        at: "2026-09-13T10:00:00Z",
        reason: "Iniciando trabalho",
      });
      expect(change.id).toBe("h1");
      expect(change.itemId).toBe("i1");
      expect(change.actorId).toBe("p1");
      expect(change.from).toBe("backlog");
      expect(change.to).toBe("todo");
      expect(change.at).toBe("2026-09-13T10:00:00Z");
      expect(change.reason).toBe("Iniciando trabalho");
    });

    it("should allow null from for initial state", () => {
      const change = new WorkItemStateChange({
        id: "h1",
        itemId: "i1",
        actorId: "p1",
        from: null,
        to: "backlog",
        at: "2026-09-13T10:00:00Z",
        reason: null,
      });
      expect(change.from).toBeNull();
      expect(change.reason).toBeNull();
    });

    it("should reject invalid to status", () => {
      expect(() =>
        new WorkItemStateChange({
          id: "h1",
          itemId: "i1",
          actorId: "p1",
          from: "backlog",
          to: "invalid" as WorkItemStatus,
          at: "2026-09-13T10:00:00Z",
          reason: null,
        })
      ).toThrow(DomainError);
    });

    it("should reject same from and to (no-op transition)", () => {
      expect(() =>
        new WorkItemStateChange({
          id: "h1",
          itemId: "i1",
          actorId: "p1",
          from: "todo",
          to: "todo",
          at: "2026-09-13T10:00:00Z",
          reason: null,
        })
      ).toThrow(DomainError);
    });

    it("should reject empty required fields", () => {
      expect(() =>
        new WorkItemStateChange({
          id: "",
          itemId: "i1",
          actorId: "p1",
          from: "backlog",
          to: "todo",
          at: "2026-09-13T10:00:00Z",
          reason: null,
        })
      ).toThrow(DomainError);
      expect(() =>
        new WorkItemStateChange({
          id: "h1",
          itemId: "",
          actorId: "p1",
          from: "backlog",
          to: "todo",
          at: "2026-09-13T10:00:00Z",
          reason: null,
        })
      ).toThrow(DomainError);
      expect(() =>
        new WorkItemStateChange({
          id: "h1",
          itemId: "i1",
          actorId: "",
          from: "backlog",
          to: "todo",
          at: "2026-09-13T10:00:00Z",
          reason: null,
        })
      ).toThrow(DomainError);
      expect(() =>
        new WorkItemStateChange({
          id: "h1",
          itemId: "i1",
          actorId: "p1",
          from: "backlog",
          to: "todo",
          at: "",
          reason: null,
        })
      ).toThrow(DomainError);
    });

    it("should be immutable (histórico imutável)", () => {
      const change = new WorkItemStateChange({
        id: "h1",
        itemId: "i1",
        actorId: "p1",
        from: "backlog",
        to: "todo",
        at: "2026-09-13T10:00:00Z",
        reason: "Iniciando",
      });
      expect(Object.isFrozen(change)).toBe(true);
    });
  });
});