import { beforeEach, describe, expect, it } from "vitest";
import { WorkItemStatus } from "@/domain/shared/work-item-status";
import { BacklogPriority } from "@/domain/shared/backlog-priority";
import { WipLimit } from "@/domain/shared/wip-limit";
import { WorkflowColumn } from "@/domain/workflow/workflow-column";
import { WorkItemStateChange } from "@/domain/workflow/work-item-state-change";
import { Blocker } from "@/domain/blocker/blocker";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { DomainError } from "@/domain/shared/domain-error";

function makeColumn(status: WorkItemStatus, wip: number | null = null): WorkflowColumn {
  return new WorkflowColumn({
    id: `c_${status}`,
    status,
    name: status,
    wipLimit: wip === null ? WipLimit.unlimited() : WipLimit.of(wip),
  });
}

function makeContext(overrides: Partial<{ actorId: string; at: string; reason: string | null }> = {}) {
  return {
    actorId: overrides.actorId ?? "p1",
    at: overrides.at ?? "2026-09-13T10:00:00Z",
    reason: overrides.reason ?? null,
  };
}

describe("BacklogItem", () => {
  let item: BacklogItem;
  const baseDraft = {
    id: "i1",
    title: "Test Item",
    description: "Description",
    frontId: "f1",
    priority: "alta" as BacklogPriority,
    deadline: "2026-09-30",
  };

  beforeEach(() => {
    item = BacklogItem.create(baseDraft);
  });

  describe("create", () => {
    it("should create item with initial status backlog", () => {
      expect(item.id).toBe("i1");
      expect(item.title).toBe("Test Item");
      expect(item.status).toBe("backlog");
      expect(item.getStateChanges()).toHaveLength(0);
      expect(item.getBlockers()).toHaveLength(0);
    });

    it("should reject empty title", () => {
      expect(() => BacklogItem.create({ ...baseDraft, title: "" })).toThrow(DomainError);
    });

    it("should reject invalid priority", () => {
      expect(() => BacklogItem.create({ ...baseDraft, priority: "invalid" as BacklogPriority })).toThrow(DomainError);
    });
  });

  describe("moveTo - allowed transitions (D01)", () => {
    it("should allow backlog -> todo", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      expect(item.status).toBe("todo");
      expect(item.getStateChanges()).toHaveLength(1);
      expect(item.getStateChanges()[0].from).toBe("backlog");
      expect(item.getStateChanges()[0].to).toBe("todo");
    });

    it("should allow todo -> in_progress", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      expect(item.status).toBe("in_progress");
      expect(item.getStateChanges()).toHaveLength(2);
    });

    it("should allow in_progress -> blocked", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      const blocker = Blocker.open({ id: "b1", description: "Waiting for review", reportedBy: "p1", openedAt: "2026-09-13" });
      item.registerBlocker(blocker);
      item.moveTo(makeColumn("blocked", 2), 0, makeContext());
      expect(item.status).toBe("blocked");
    });

    it("should allow blocked -> in_progress after resolve", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      const blocker = Blocker.open({ id: "b1", description: "Waiting for review", reportedBy: "p1", openedAt: "2026-09-13" });
      item.registerBlocker(blocker);
      item.moveTo(makeColumn("blocked", 2), 0, makeContext());
      blocker.resolve("p1", "2026-09-13T12:00:00Z");
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      expect(item.status).toBe("in_progress");
    });

    it("should allow in_progress -> review", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      item.moveTo(makeColumn("review", 3), 0, makeContext());
      expect(item.status).toBe("review");
    });

    it("should allow review -> in_progress", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      item.moveTo(makeColumn("review", 3), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      expect(item.status).toBe("in_progress");
    });

    it("should allow review -> done", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      item.moveTo(makeColumn("review", 3), 0, makeContext());
      item.moveTo(makeColumn("done", null), 0, makeContext());
      expect(item.status).toBe("done");
    });

    it("should allow todo -> backlog (retirarDaSprint)", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("backlog", null), 0, makeContext());
      expect(item.status).toBe("backlog");
    });

    it("should allow backlog -> cancelled with reason", () => {
      item.moveTo(makeColumn("cancelled", null), 0, makeContext({ reason: "Não é mais necessário" }));
      expect(item.status).toBe("cancelled");
      expect(item.getStateChanges()[0].reason).toBe("Não é mais necessário");
    });

    it("should allow todo -> cancelled with reason", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("cancelled", null), 0, makeContext({ reason: "Duplicado" }));
      expect(item.status).toBe("cancelled");
    });
  });

  describe("moveTo - rejected transitions (D02)", () => {
    it("should reject backlog -> in_progress (skip todo)", () => {
      expect(() => item.moveTo(makeColumn("in_progress", 4), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("backlog");
      expect(item.getStateChanges()).toHaveLength(0);
    });

    it("should reject backlog -> review", () => {
      expect(() => item.moveTo(makeColumn("review", 3), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("backlog");
    });

    it("should reject backlog -> done", () => {
      expect(() => item.moveTo(makeColumn("done", null), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("backlog");
    });

    it("should reject todo -> done (skip review)", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      expect(() => item.moveTo(makeColumn("done", null), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("todo");
    });

    it("should reject in_progress -> done (skip review)", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      expect(() => item.moveTo(makeColumn("done", null), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("in_progress");
    });

    it("should reject blocked -> review (must go through in_progress)", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      const blocker = Blocker.open({ id: "b1", description: "Waiting", reportedBy: "p1", openedAt: "2026-09-13" });
      item.registerBlocker(blocker);
      item.moveTo(makeColumn("blocked", 2), 0, makeContext());
      expect(() => item.moveTo(makeColumn("review", 3), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("blocked");
    });

    it("should reject done -> any (terminal)", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      item.moveTo(makeColumn("review", 3), 0, makeContext());
      item.moveTo(makeColumn("done", null), 0, makeContext());
      expect(() => item.moveTo(makeColumn("review", 3), 0, makeContext())).toThrow(DomainError);
      expect(() => item.moveTo(makeColumn("in_progress", 4), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("done");
    });

    it("should reject cancelled -> any (terminal)", () => {
      item.moveTo(makeColumn("cancelled", null), 0, makeContext({ reason: "Cancelado" }));
      expect(() => item.moveTo(makeColumn("backlog", null), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("cancelled");
    });

    it("should reject same status transition (no-op)", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      expect(() => item.moveTo(makeColumn("todo", 4), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("todo");
    });

    it("should reject move to blocked without open blocker", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      expect(() => item.moveTo(makeColumn("blocked", 2), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("in_progress");
    });

    it("should reject leaving blocked while blocker still open", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext());
      const blocker = Blocker.open({ id: "b1", description: "Waiting", reportedBy: "p1", openedAt: "2026-09-13" });
      item.registerBlocker(blocker);
      item.moveTo(makeColumn("blocked", 2), 0, makeContext());
      expect(() => item.moveTo(makeColumn("in_progress", 4), 0, makeContext())).toThrow(DomainError);
      expect(item.status).toBe("blocked");
    });

    it("should reject cancelled without reason", () => {
      expect(() => item.moveTo(makeColumn("cancelled", null), 0, makeContext({ reason: "" }))).toThrow(DomainError);
      expect(() => item.moveTo(makeColumn("cancelled", null), 0, makeContext({ reason: null }))).toThrow(DomainError);
      expect(item.status).toBe("backlog");
    });

    it("should reject when WIP limit exceeded", () => {
      item.moveTo(makeColumn("todo", 1), 0, makeContext()); // first item in column with limit 1
      expect(() => item.moveTo(makeColumn("in_progress", 1), 1, makeContext())).toThrow(DomainError); // at limit
      expect(item.status).toBe("todo");
    });
  });

  describe("registerBlocker", () => {
    it("should register open blocker", () => {
      const blocker = Blocker.open({ id: "b1", description: "Waiting", reportedBy: "p1", openedAt: "2026-09-13" });
      item.registerBlocker(blocker);
      expect(item.getBlockers()).toHaveLength(1);
      expect(item.hasOpenBlocker()).toBe(true);
    });

    it("should reject registering resolved blocker", () => {
      const blocker = Blocker.open({ id: "b1", description: "Waiting", reportedBy: "p1", openedAt: "2026-09-13" });
      blocker.resolve("p1", "2026-09-13T12:00:00Z");
      expect(() => item.registerBlocker(blocker)).toThrow(DomainError);
    });

    it("should reject duplicate blocker id", () => {
      const blocker1 = Blocker.open({ id: "b1", description: "Waiting", reportedBy: "p1", openedAt: "2026-09-13" });
      const blocker2 = Blocker.open({ id: "b1", description: "Another", reportedBy: "p2", openedAt: "2026-09-13" });
      item.registerBlocker(blocker1);
      expect(() => item.registerBlocker(blocker2)).toThrow(DomainError);
    });
  });

  describe("state changes history", () => {
    it("should record each valid transition", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext({ reason: "Start" }));
      item.moveTo(makeColumn("in_progress", 4), 0, makeContext({ reason: "Work" }));
      const changes = item.getStateChanges();
      expect(changes).toHaveLength(2);
      expect(changes[0].from).toBe("backlog");
      expect(changes[0].to).toBe("todo");
      expect(changes[0].reason).toBe("Start");
      expect(changes[1].from).toBe("todo");
      expect(changes[1].to).toBe("in_progress");
      expect(changes[1].reason).toBe("Work");
    });

    it("should return defensive copy of history", () => {
      item.moveTo(makeColumn("todo", 4), 0, makeContext());
      const changes = item.getStateChanges() as WorkItemStateChange[];
      changes.push({} as WorkItemStateChange);
      expect(item.getStateChanges()).toHaveLength(1);
    });

    it("should not record history on rejected transition", () => {
      expect(() => item.moveTo(makeColumn("in_progress", 4), 0, makeContext())).toThrow();
      expect(item.getStateChanges()).toHaveLength(0);
    });
  });
});