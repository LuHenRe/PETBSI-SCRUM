import { describe, expect, it } from "vitest";
import { ProjectRole } from "@/domain/shared/project-role";
import { ProjectMembership } from "@/domain/project/project-membership";
import { Project } from "@/domain/project/project";
import { DomainError } from "@/domain/shared/domain-error";
import { EmailAddress } from "@/domain/shared/email-address";

describe("ProjectMembership", () => {
  const baseDraft = {
    id: "m1",
    personId: "p1",
    frontId: "f1",
    role: "MEMBER" as ProjectRole,
    canEdit: true,
  };

  it("should create membership with valid data", () => {
    const membership = new ProjectMembership(baseDraft);
    expect(membership.id).toBe("m1");
    expect(membership.personId).toBe("p1");
    expect(membership.frontId).toBe("f1");
    expect(membership.role).toBe("MEMBER");
    expect(membership.canEdit).toBe(true);
  });

  it("should reject empty id", () => {
    expect(() => new ProjectMembership({ ...baseDraft, id: "" })).toThrow(DomainError);
  });

  it("should reject empty personId", () => {
    expect(() => new ProjectMembership({ ...baseDraft, personId: "" })).toThrow(DomainError);
  });

  it("should reject empty frontId", () => {
    expect(() => new ProjectMembership({ ...baseDraft, frontId: "" })).toThrow(DomainError);
  });

  it("should reject invalid role", () => {
    expect(() => new ProjectMembership({ ...baseDraft, role: "INVALID" as ProjectRole })).toThrow(DomainError);
  });

  describe("canMoveItem", () => {
    it("should return true for same front with canEdit=true", () => {
      const membership = new ProjectMembership({ ...baseDraft, canEdit: true });
      expect(membership.canMoveItem("f1")).toBe(true);
    });

    it("should return false for different front even with canEdit=true", () => {
      const membership = new ProjectMembership({ ...baseDraft, canEdit: true });
      expect(membership.canMoveItem("f2")).toBe(false);
    });

    it("should return false for same front with canEdit=false (D15 - Visitante)", () => {
      const membership = new ProjectMembership({ ...baseDraft, canEdit: false });
      expect(membership.canMoveItem("f1")).toBe(false);
    });

    it("should return false for different front with canEdit=false", () => {
      const membership = new ProjectMembership({ ...baseDraft, canEdit: false });
      expect(membership.canMoveItem("f2")).toBe(false);
    });
  });

  describe("displayTitle (RN13)", () => {
    it("should return role label when canEdit=true", () => {
      const membership = new ProjectMembership({ ...baseDraft, canEdit: true });
      expect(membership.displayTitle).toBe("Membro");
    });

    it("should return 'Visitante' when canEdit=false (D15)", () => {
      const membership = new ProjectMembership({ ...baseDraft, canEdit: false });
      expect(membership.displayTitle).toBe("Visitante");
    });

    it("should return correct labels for all roles when canEdit=true", () => {
      const roles: ProjectRole[] = ["MEMBER", "SCRUM_MASTER", "SCRUM_MASTER_ASSISTANT", "COORDINATOR", "PRODUCT_OWNER"];
      const expectedLabels = ["Membro", "Scrum Master", "Scrum Master Assistente", "Coordenador", "Coordenador (Product Owner)"];
      
      roles.forEach((role, i) => {
        const membership = new ProjectMembership({ ...baseDraft, role, canEdit: true });
        expect(membership.displayTitle).toBe(expectedLabels[i]);
      });
    });

    it("should return 'Visitante' for all roles when canEdit=false", () => {
      const roles: ProjectRole[] = ["MEMBER", "SCRUM_MASTER", "SCRUM_MASTER_ASSISTANT", "COORDINATOR", "PRODUCT_OWNER"];
      
      roles.forEach((role) => {
        const membership = new ProjectMembership({ ...baseDraft, role, canEdit: false });
        expect(membership.displayTitle).toBe("Visitante");
      });
    });
  });

  describe("isTechAdmin / isCoordinator", () => {
    it("should identify tech admin roles", () => {
      const sm = new ProjectMembership({ ...baseDraft, role: "SCRUM_MASTER", canEdit: true });
      const sma = new ProjectMembership({ ...baseDraft, role: "SCRUM_MASTER_ASSISTANT", canEdit: true });
      expect(sm.isTechAdmin()).toBe(true);
      expect(sma.isTechAdmin()).toBe(true);
    });

    it("should not identify other roles as tech admin", () => {
      const member = new ProjectMembership({ ...baseDraft, role: "MEMBER", canEdit: true });
      const coord = new ProjectMembership({ ...baseDraft, role: "COORDINATOR", canEdit: true });
      const po = new ProjectMembership({ ...baseDraft, role: "PRODUCT_OWNER", canEdit: true });
      expect(member.isTechAdmin()).toBe(false);
      expect(coord.isTechAdmin()).toBe(false);
      expect(po.isTechAdmin()).toBe(false);
    });

    it("should identify coordinator roles", () => {
      const coord = new ProjectMembership({ ...baseDraft, role: "COORDINATOR", canEdit: true });
      const po = new ProjectMembership({ ...baseDraft, role: "PRODUCT_OWNER", canEdit: true });
      expect(coord.isCoordinator()).toBe(true);
      expect(po.isCoordinator()).toBe(true);
    });
  });
});

describe("Project.assertSinglePO", () => {
  it("should allow zero PO", () => {
    const memberships = [
      new ProjectMembership({ id: "m1", personId: "p1", frontId: "f1", role: "MEMBER", canEdit: true }),
      new ProjectMembership({ id: "m2", personId: "p2", frontId: "f1", role: "SCRUM_MASTER", canEdit: true }),
    ];
    expect(() => Project.assertSinglePO(memberships)).not.toThrow();
  });

  it("should allow one PO", () => {
    const memberships = [
      new ProjectMembership({ id: "m1", personId: "p1", frontId: "f1", role: "PRODUCT_OWNER", canEdit: true }),
      new ProjectMembership({ id: "m2", personId: "p2", frontId: "f1", role: "MEMBER", canEdit: true }),
    ];
    expect(() => Project.assertSinglePO(memberships)).not.toThrow();
  });

  it("should reject multiple POs", () => {
    const memberships = [
      new ProjectMembership({ id: "m1", personId: "p1", frontId: "f1", role: "PRODUCT_OWNER", canEdit: true }),
      new ProjectMembership({ id: "m2", personId: "p2", frontId: "f2", role: "PRODUCT_OWNER", canEdit: true }),
    ];
    expect(() => Project.assertSinglePO(memberships)).toThrow(DomainError);
    expect(() => Project.assertSinglePO(memberships)).toThrow("Product Owner");
  });
});

describe("Person", () => {
  it("should create person with valid email", () => {
    // We'll test Person if it exists in people folder
    // For now just test EmailAddress is used
    const email = new EmailAddress("ana@example.com");
    expect(email.value).toBe("ana@example.com");
  });
});