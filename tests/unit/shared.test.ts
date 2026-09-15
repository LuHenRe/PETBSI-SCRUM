import { describe, expect, it } from "vitest";
import {
  ProjectRole,
  isProjectRole,
  assertProjectRole,
  PROJECT_ROLE_VALUES,
  PROJECT_ROLE_LABEL,
  isTechAdmin,
  isCoordinator,
} from "@/domain/shared/project-role";
import {
  WorkItemStatus,
  isWorkItemStatus,
  assertWorkItemStatus,
  WORK_ITEM_STATUS_VALUES,
} from "@/domain/shared/work-item-status";
import {
  BacklogPriority,
  isBacklogPriority,
  assertBacklogPriority,
  BACKLOG_PRIORITY_VALUES,
} from "@/domain/shared/backlog-priority";
import { WipLimit } from "@/domain/shared/wip-limit";
import { DateRange } from "@/domain/shared/date-range";
import { EmailAddress } from "@/domain/shared/email-address";
import { DomainError } from "@/domain/shared/domain-error";

describe("shared VOs", () => {
  describe("ProjectRole", () => {
    it("should have all expected values", () => {
      expect(PROJECT_ROLE_VALUES).toEqual([
        "MEMBER",
        "SCRUM_MASTER",
        "SCRUM_MASTER_ASSISTANT",
        "COORDINATOR",
        "PRODUCT_OWNER",
      ]);
    });

    it("should validate correct roles", () => {
      expect(isProjectRole("MEMBER")).toBe(true);
      expect(isProjectRole("SCRUM_MASTER")).toBe(true);
      expect(isProjectRole("SCRUM_MASTER_ASSISTANT")).toBe(true);
      expect(isProjectRole("COORDINATOR")).toBe(true);
      expect(isProjectRole("PRODUCT_OWNER")).toBe(true);
    });

    it("should reject invalid roles", () => {
      expect(isProjectRole("INVALID")).toBe(false);
      expect(isProjectRole("")).toBe(false);
      expect(isProjectRole(null)).toBe(false);
    });

    it("should assert valid role", () => {
      expect(() => assertProjectRole("MEMBER")).not.toThrow();
    });

    it("should throw DomainError on invalid role", () => {
      expect(() => assertProjectRole("INVALID")).toThrow(DomainError);
      expect(() => assertProjectRole("INVALID")).toThrow("Papel inválido");
    });

    it("should have correct labels", () => {
      expect(PROJECT_ROLE_LABEL.MEMBER).toBe("Membro");
      expect(PROJECT_ROLE_LABEL.SCRUM_MASTER).toBe("Scrum Master");
      expect(PROJECT_ROLE_LABEL.SCRUM_MASTER_ASSISTANT).toBe("Scrum Master Assistente");
      expect(PROJECT_ROLE_LABEL.COORDINATOR).toBe("Coordenador");
      expect(PROJECT_ROLE_LABEL.PRODUCT_OWNER).toBe("Coordenador (Product Owner)");
    });

    it("should identify tech admin roles", () => {
      expect(isTechAdmin("SCRUM_MASTER")).toBe(true);
      expect(isTechAdmin("SCRUM_MASTER_ASSISTANT")).toBe(true);
      expect(isTechAdmin("MEMBER")).toBe(false);
      expect(isTechAdmin("COORDINATOR")).toBe(false);
      expect(isTechAdmin("PRODUCT_OWNER")).toBe(false);
    });

    it("should identify coordinator roles", () => {
      expect(isCoordinator("COORDINATOR")).toBe(true);
      expect(isCoordinator("PRODUCT_OWNER")).toBe(true);
      expect(isCoordinator("MEMBER")).toBe(false);
      expect(isCoordinator("SCRUM_MASTER")).toBe(false);
    });
  });

  describe("WorkItemStatus", () => {
    it("should have all expected values including cancelled", () => {
      expect(WORK_ITEM_STATUS_VALUES).toEqual([
        "backlog",
        "todo",
        "in_progress",
        "blocked",
        "review",
        "done",
        "cancelled",
      ]);
    });

    it("should validate correct statuses", () => {
      expect(isWorkItemStatus("backlog")).toBe(true);
      expect(isWorkItemStatus("todo")).toBe(true);
      expect(isWorkItemStatus("in_progress")).toBe(true);
      expect(isWorkItemStatus("blocked")).toBe(true);
      expect(isWorkItemStatus("review")).toBe(true);
      expect(isWorkItemStatus("done")).toBe(true);
      expect(isWorkItemStatus("cancelled")).toBe(true);
    });

    it("should reject invalid statuses", () => {
      expect(isWorkItemStatus("invalid")).toBe(false);
      expect(isWorkItemStatus("")).toBe(false);
    });

    it("should assert valid status", () => {
      expect(() => assertWorkItemStatus("backlog")).not.toThrow();
    });

    it("should throw DomainError on invalid status", () => {
      expect(() => assertWorkItemStatus("invalid")).toThrow(DomainError);
    });
  });

  describe("BacklogPriority", () => {
    it("should have all expected values", () => {
      expect(BACKLOG_PRIORITY_VALUES).toEqual(["alta", "media", "baixa"]);
    });

    it("should validate correct priorities", () => {
      expect(isBacklogPriority("alta")).toBe(true);
      expect(isBacklogPriority("media")).toBe(true);
      expect(isBacklogPriority("baixa")).toBe(true);
    });

    it("should reject invalid priorities", () => {
      expect(isBacklogPriority("critical")).toBe(false);
      expect(isBacklogPriority("")).toBe(false);
    });

    it("should assert valid priority", () => {
      expect(() => assertBacklogPriority("alta")).not.toThrow();
    });

    it("should throw DomainError on invalid priority", () => {
      expect(() => assertBacklogPriority("invalid")).toThrow(DomainError);
    });
  });

  describe("WipLimit", () => {
    it("should create unlimited when null", () => {
      const limit = WipLimit.of(null);
      expect(limit.isUnlimited()).toBe(true);
      expect(limit.value).toBeNull();
    });

    it("should create limited when number provided", () => {
      const limit = WipLimit.of(4);
      expect(limit.isUnlimited()).toBe(false);
      expect(limit.value).toBe(4);
    });

    it("should allow any count when unlimited", () => {
      const limit = WipLimit.of(null);
      expect(limit.allows(0)).toBe(true);
      expect(limit.allows(1)).toBe(true);
      expect(limit.allows(999)).toBe(true);
    });

    it("should allow count <= limit when limited", () => {
      const limit = WipLimit.of(4);
      expect(limit.allows(0)).toBe(true);
      expect(limit.allows(4)).toBe(true);
      expect(limit.allows(5)).toBe(false);
    });

    it("should treat 0 as a real limit (not unlimited)", () => {
      const limit = WipLimit.of(0);
      expect(limit.isUnlimited()).toBe(false);
      expect(limit.allows(0)).toBe(true);
      expect(limit.allows(1)).toBe(false);
    });

    it("should reject negative values", () => {
      expect(() => WipLimit.of(-1)).toThrow(DomainError);
    });

    it("should reject non-integer values", () => {
      expect(() => WipLimit.of(3.5)).toThrow(DomainError);
    });

    it("should provide static unlimited factory", () => {
      const limit = WipLimit.unlimited();
      expect(limit.isUnlimited()).toBe(true);
      expect(limit.allows(999)).toBe(true);
    });

    it("should compare by value", () => {
      expect(WipLimit.of(4).equals(WipLimit.of(4))).toBe(true);
      expect(WipLimit.of(4).equals(WipLimit.of(3))).toBe(false);
      expect(WipLimit.of(null).equals(WipLimit.of(null))).toBe(true);
      expect(WipLimit.of(null).equals(WipLimit.of(4))).toBe(false);
    });
  });

  describe("DateRange", () => {
    it("should create valid range", () => {
      const range = new DateRange("2026-09-01", "2026-09-30");
      expect(range.startsOn).toBe("2026-09-01");
      expect(range.endsOn).toBe("2026-09-30");
    });

    it("should reject inverted period (start > end)", () => {
      expect(() => new DateRange("2026-09-30", "2026-09-01")).toThrow(DomainError);
      expect(() => new DateRange("2026-09-30", "2026-09-01")).toThrow("invertido");
    });

    it("should accept same start and end", () => {
      expect(() => new DateRange("2026-09-15", "2026-09-15")).not.toThrow();
    });

    it("should check if date is contained", () => {
      const range = new DateRange("2026-09-01", "2026-09-30");
      expect(range.contains("2026-09-01")).toBe(true);
      expect(range.contains("2026-09-15")).toBe(true);
      expect(range.contains("2026-09-30")).toBe(true);
      expect(range.contains("2026-08-31")).toBe(false);
      expect(range.contains("2026-10-01")).toBe(false);
    });

    it("should compare by value", () => {
      const r1 = new DateRange("2026-09-01", "2026-09-30");
      const r2 = new DateRange("2026-09-01", "2026-09-30");
      const r3 = new DateRange("2026-09-01", "2026-10-01");
      expect(r1.equals(r2)).toBe(true);
      expect(r1.equals(r3)).toBe(false);
    });

    it("should reject empty dates", () => {
      expect(() => new DateRange("", "2026-09-30")).toThrow(DomainError);
      expect(() => new DateRange("2026-09-01", "")).toThrow(DomainError);
    });
  });

  describe("EmailAddress", () => {
    it("should create valid email", () => {
      const email = new EmailAddress("ana@example.com");
      expect(email.value).toBe("ana@example.com");
    });

    it("should validate correct formats", () => {
      expect(EmailAddress.isValid("ana@example.com")).toBe(true);
      expect(EmailAddress.isValid("user.name@domain.org")).toBe(true);
      expect(EmailAddress.isValid("user+tag@domain.co.uk")).toBe(true);
    });

    it("should reject invalid formats (D11)", () => {
      expect(EmailAddress.isValid("invalid")).toBe(false);
      expect(EmailAddress.isValid("no-at-sign")).toBe(false);
      expect(EmailAddress.isValid("@domain.com")).toBe(false);
      expect(EmailAddress.isValid("user@")).toBe(false);
      expect(EmailAddress.isValid("user@domain")).toBe(false);
      expect(EmailAddress.isValid("")).toBe(false);
      expect(EmailAddress.isValid("user@.com")).toBe(false);
    });

    it("should throw DomainError on invalid email in constructor", () => {
      expect(() => new EmailAddress("invalid")).toThrow(DomainError);
      expect(() => new EmailAddress("invalid")).toThrow("inválido");
    });

    it("should compare by value", () => {
      const e1 = new EmailAddress("ana@example.com");
      const e2 = new EmailAddress("ana@example.com");
      const e3 = new EmailAddress("other@example.com");
      expect(e1.equals(e2)).toBe(true);
      expect(e1.equals(e3)).toBe(false);
    });
  });
});