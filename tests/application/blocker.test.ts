import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { openBlockerForItem, resolveBlockerForItem } from "@/application/workflow/manage-blocker";
import { resetTestUid, testUid, fixedNow, memberF1, visitanteF1 } from "./fixtures/factories";

// A06 — UC06 Gerenciar bloqueio (RF08)
describe("A06 manage-blocker", () => {
  let backlog: MemoryBacklogRepository;
  let audit: MemoryAudit;

  beforeEach(async () => {
    resetTestUid();
    backlog = new MemoryBacklogRepository();
    audit = new MemoryAudit();
    const item = BacklogItem.create({
      id: "i11",
      title: "Cronograma de minicursos",
      description: "desc",
      frontId: "f1",
      priority: "media",
      deadline: null,
    });
    await backlog.save(item);
  });

  it("abrir: registra bloqueio e marca item", async () => {
    const blocker = await openBlockerForItem("i11", "Aguardando salas", memberF1(), {
      backlog, audit, uid: testUid, now: fixedNow,
    });
    expect(blocker.isOpen()).toBe(true);
    expect(blocker.description).toBe("Aguardando salas");
    const item = (await backlog.load("i11"))!;
    expect(item.hasOpenBlocker()).toBe(true);
    expect(audit.events).toHaveLength(1);
    expect(audit.events[0].action).toBe("BlockerOpened");
  });

  it("resolver: bloqueio aberto pode ser resolvido", async () => {
    const opened = await openBlockerForItem("i11", "Aguardando salas", memberF1(), {
      backlog, audit, uid: testUid, now: fixedNow,
    });
    const resolved = await resolveBlockerForItem("i11", opened.id, memberF1(), {
      backlog, audit, now: fixedNow,
    });
    expect(resolved.isResolved()).toBe(true);
    expect((await backlog.load("i11"))!.hasOpenBlocker()).toBe(false);
    expect(audit.events.map((e) => e.action)).toEqual(["BlockerOpened", "BlockerResolved"]);
  });

  it("item inexistente é rejeitado", async () => {
    await expect(
      openBlockerForItem("missing", "desc válida", memberF1(), { backlog, audit, uid: testUid, now: fixedNow })
    ).rejects.toThrow(DomainError);
    await expect(
      resolveBlockerForItem("missing", "b1", memberF1(), { backlog, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
  });

  it("bloqueio sem descrição é rejeitado", async () => {
    await expect(
      openBlockerForItem("i11", "ab", memberF1(), { backlog, audit, uid: testUid, now: fixedNow })
    ).rejects.toThrow(DomainError);
    await expect(
      openBlockerForItem("i11", "   ", memberF1(), { backlog, audit, uid: testUid, now: fixedNow })
    ).rejects.toThrow(DomainError);
  });

  it("Visitante sem permissão não abre bloqueio", async () => {
    await expect(
      openBlockerForItem("i11", "Tentativa visitante", visitanteF1(), {
        backlog, audit, uid: testUid, now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
  });

  it("resolver bloqueio inexistente é rejeitado", async () => {
    await openBlockerForItem("i11", "Aguardando salas", memberF1(), {
      backlog, audit, uid: testUid, now: fixedNow,
    });
    await expect(
      resolveBlockerForItem("i11", "b_missing", memberF1(), { backlog, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
  });
});
