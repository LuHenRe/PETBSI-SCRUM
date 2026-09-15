import { ProjectMembership } from "@/domain/project/project-membership";
import type { ProjectRole } from "@/domain/shared/project-role";
import { WorkflowColumn } from "@/domain/workflow/workflow-column";
import { WipLimit } from "@/domain/shared/wip-limit";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";

let uidCounter = 0;

export function resetTestUid(): void {
  uidCounter = 0;
}

export function testUid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}_test_${uidCounter}`;
}

export const fixedNow = (): string => "2026-09-13T10:00:00Z";

export function makeMembership(overrides: Partial<{
  id: string;
  personId: string;
  frontId: string;
  role: ProjectRole;
  canEdit: boolean;
}> = {}): ProjectMembership {
  return new ProjectMembership({
    id: overrides.id ?? `m_${overrides.personId ?? "p1"}_${overrides.frontId ?? "f1"}`,
    personId: overrides.personId ?? "p1",
    frontId: overrides.frontId ?? "f1",
    role: overrides.role ?? "MEMBER",
    canEdit: overrides.canEdit ?? true,
  });
}

export function memberF1(): ProjectMembership {
  return makeMembership({ id: "m_f1", personId: "p5", frontId: "f1", role: "MEMBER", canEdit: true });
}

export function visitanteF1(): ProjectMembership {
  return makeMembership({ id: "m_vis", personId: "p6", frontId: "f1", role: "MEMBER", canEdit: false });
}

export function memberF2(): ProjectMembership {
  return makeMembership({ id: "m_f2", personId: "p7", frontId: "f2", role: "MEMBER", canEdit: true });
}

export function scrumMaster(): ProjectMembership {
  return makeMembership({ id: "m_sm", personId: "p3", frontId: "f4", role: "SCRUM_MASTER", canEdit: true });
}

export function coordinator(): ProjectMembership {
  return makeMembership({ id: "m_po", personId: "p1", frontId: "f4", role: "PRODUCT_OWNER", canEdit: true });
}

export function makeColumn(status: WorkItemStatus, wip: number | null = null): WorkflowColumn {
  return new WorkflowColumn({
    id: `c_${status}`,
    status,
    name: status,
    wipLimit: wip === null ? WipLimit.unlimited() : WipLimit.of(wip),
  });
}
