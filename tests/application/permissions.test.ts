import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { MemoryMembershipRepository } from "@/adapters/memory/memory-membership-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { setFrontPermission } from "@/application/backlog/manage-front-permissions";
import { memberF1, scrumMaster, coordinator, fixedNow } from "./fixtures/factories";

// A14 — UC16 Gerenciar permissões por frente (RF24, RN10)
describe("A14 manage-front-permissions", () => {
  let memberships: MemoryMembershipRepository;
  let audit: MemoryAudit;

  beforeEach(async () => {
    memberships = new MemoryMembershipRepository();
    audit = new MemoryAudit();
    await memberships.seedFromSeed();
  });

  it("concede edição: SM altera canEdit para true", async () => {
    // m7: p6/f3 canEdit=false (visitante em f3)
    const updated = await setFrontPermission("m7", true, scrumMaster(), {
      memberships, audit, now: fixedNow,
    });
    expect(updated.canEdit).toBe(true);
    expect((await memberships.load("m7"))!.canEdit).toBe(true);
    expect(audit.events).toHaveLength(1);
    expect(audit.events[0].action).toBe("FrontPermissionChanged");
  });

  it("revoga edição: SM altera canEdit para false", async () => {
    const updated = await setFrontPermission("m5", false, scrumMaster(), {
      memberships, audit, now: fixedNow,
    });
    expect(updated.canEdit).toBe(false);
    expect((await memberships.load("m5"))!.canEdit).toBe(false);
  });

  it("membro inexistente é rejeitado", async () => {
    await expect(
      setFrontPermission("m_missing", true, scrumMaster(), { memberships, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
    expect(audit.events).toHaveLength(0);
  });

  it("não-SM rejeitado: membro comum não pode alterar", async () => {
    await expect(
      setFrontPermission("m7", true, memberF1(), { memberships, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
    expect((await memberships.load("m7"))!.canEdit).toBe(false);
    expect(audit.events).toHaveLength(0);
  });

  it("não-SM rejeitado: coordenador não pode alterar (só SM/assistente)", async () => {
    await expect(
      setFrontPermission("m7", true, coordinator(), { memberships, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
  });
});
