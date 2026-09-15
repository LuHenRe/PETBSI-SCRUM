import { describe, expect, it } from "vitest";
import { Blocker } from "@/domain/blocker/blocker";
import { DomainError } from "@/domain/shared/domain-error";

describe("Blocker", () => {
  const baseDraft = {
    id: "b1",
    description: "Aguardando revisão",
    reportedBy: "p1",
    openedAt: "2026-09-13T10:00:00Z",
  };

  describe("open", () => {
    it("should create open blocker with valid data", () => {
      const blocker = Blocker.open(baseDraft);
      expect(blocker.id).toBe("b1");
      expect(blocker.description).toBe("Aguardando revisão");
      expect(blocker.reportedBy).toBe("p1");
      expect(blocker.openedAt).toBe("2026-09-13T10:00:00Z");
      expect(blocker.isOpen()).toBe(true);
      expect(blocker.isResolved()).toBe(false);
      expect(blocker.resolvedAt).toBeNull();
      expect(blocker.resolvedBy).toBeNull();
    });

    it("should reject description with less than 3 chars", () => {
      expect(() => Blocker.open({ ...baseDraft, description: "ab" })).toThrow(DomainError);
      expect(() => Blocker.open({ ...baseDraft, description: "a" })).toThrow(DomainError);
      expect(() => Blocker.open({ ...baseDraft, description: "" })).toThrow(DomainError);
      expect(() => Blocker.open({ ...baseDraft, description: "   " })).toThrow(DomainError);
    });

    it("should reject empty id", () => {
      expect(() => Blocker.open({ ...baseDraft, id: "" })).toThrow(DomainError);
    });

    it("should reject empty reportedBy", () => {
      expect(() => Blocker.open({ ...baseDraft, reportedBy: "" })).toThrow(DomainError);
    });

    it("should reject empty openedAt", () => {
      expect(() => Blocker.open({ ...baseDraft, openedAt: "" })).toThrow(DomainError);
    });

    it("should trim description", () => {
      const blocker = Blocker.open({ ...baseDraft, description: "  Aguardando revisão  " });
      expect(blocker.description).toBe("Aguardando revisão");
    });
  });

  describe("resolve", () => {
    it("should resolve open blocker", () => {
      const blocker = Blocker.open(baseDraft);
      blocker.resolve("p2", "2026-09-13T12:00:00Z");
      expect(blocker.isOpen()).toBe(false);
      expect(blocker.isResolved()).toBe(true);
      expect(blocker.resolvedAt).toBe("2026-09-13T12:00:00Z");
      expect(blocker.resolvedBy).toBe("p2");
    });

    it("should reject resolving already resolved blocker", () => {
      const blocker = Blocker.open(baseDraft);
      blocker.resolve("p2", "2026-09-13T12:00:00Z");
      expect(() => blocker.resolve("p3", "2026-09-13T13:00:00Z")).toThrow(DomainError);
    });

    it("should reject empty resolvedBy", () => {
      const blocker = Blocker.open(baseDraft);
      expect(() => blocker.resolve("", "2026-09-13T12:00:00Z")).toThrow(DomainError);
    });

    it("should reject empty resolvedAt", () => {
      const blocker = Blocker.open(baseDraft);
      expect(() => blocker.resolve("p2", "")).toThrow(DomainError);
    });
  });
});