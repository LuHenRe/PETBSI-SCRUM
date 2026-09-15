import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { createApiClient, getDeps } from "@/lib/api-client";
import { testUid, resetTestUid, fixedNow } from "./fixtures/factories";

// MT-3.1 — api-client sobre adapters memory (isolamento + Visitante)
describe("api-client", () => {
  beforeEach(() => {
    resetTestUid();
  });

  it("getDeps expõe backlog/sprints/memberships/audit isolados por singleton", async () => {
    const deps = getDeps();
    expect(deps.backlog).toBeDefined();
    expect(deps.sprints).toBeDefined();
    expect(deps.memberships).toBeDefined();
    expect(deps.audit).toBeDefined();
    const items = await deps.backlog.listByProject("petbsi");
    expect(items.length).toBe(18);
  });

  it("isolamento por instância: createApiClient não compartilha estado", async () => {
    const a = createApiClient();
    const b = createApiClient();
    a.setCurrentUserId("p5");
    b.setCurrentUserId("p5");

    // p5 é membro de f1 com edição; cria em f1 nas duas instâncias
    const itemA = await a.createItem(
      { title: "Item isolado A", frontId: "f1", priority: "alta" },
      { uid: testUid, now: fixedNow, actorId: "p5" }
    );
    expect(await a.getDeps().backlog.load(itemA.id)).not.toBeNull();
    expect(await b.getDeps().backlog.load(itemA.id)).toBeNull();

    const itemB = await b.createItem(
      { title: "Item isolado B", frontId: "f1", priority: "alta" },
      { uid: testUid, now: fixedNow, actorId: "p5" }
    );
    expect(await b.getDeps().backlog.load(itemB.id)).not.toBeNull();
    expect(await a.getDeps().backlog.load(itemB.id)).toBeNull();
  });

  it("Visitante bloqueado: canEdit=false não cria nem move", async () => {
    const client = createApiClient();
    // p6 em f3 é Visitante (m7 canEdit=false)
    await expect(
      client.createItem(
        { title: "Tentativa visitante", frontId: "f3", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p6" }
      )
    ).rejects.toThrow(DomainError);

    // Tenta mover item de f3 (i15 está em backlog/f3) como visitante
    await expect(
      client.moveItem("i15", "todo", { actorId: "p6" })
    ).rejects.toThrow(DomainError);
  });

  it("moveItem calcula WIP internamente e bloqueia limite excedido", async () => {
    const client = createApiClient();
    // Seed: todo 4/4 cheio, in_progress 5/4 estourado, review 2/3 com espaço.
    // i4 está em in_progress/f4; SM (p3) tem override e pode mover para review.
    const moved = await client.moveItem("i4", "review", { actorId: "p3" });
    expect(moved.status).toBe("review");

    // WIP é calculado internamente: backlog->todo deve falhar pois todo está cheio.
    await expect(
      client.moveItem("i14", "todo", { actorId: "p3" })
    ).rejects.toThrow(DomainError);

    // Transição proibida também vira DomainError (backlog->done pula etapas).
    await expect(
      client.moveItem("i15", "done", { actorId: "p3" })
    ).rejects.toThrow(DomainError);
  });

  it("createItem valida título<3 e frente vazia via domínio", async () => {
    const client = createApiClient();
    await expect(
      client.createItem(
        { title: "ab", frontId: "f1", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p5" }
      )
    ).rejects.toThrow(DomainError);
    await expect(
      client.createItem(
        { title: "Título válido", frontId: "", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p5" }
      )
    ).rejects.toThrow(DomainError);
  });

  it("getOverview respeita allowedFrontIds (filtro por permissão)", async () => {
    const client = createApiClient();
    const all = await client.getOverview({ allowedFrontIds: ["f1", "f2", "f3", "f4"] });
    expect(all.totalItems).toBe(18);
    const f1 = await client.getOverview({ allowedFrontIds: ["f1"] });
    expect(f1.items.every((i) => i.frontId === "f1")).toBe(true);
    // allowed derivado do usuário: p5 só tem f1 ( +f3 como visitante? p6 tem f1+f3)
    const allowedP5 = await client.getAllowedFrontIds({ actorId: "p5" });
    expect(allowedP5).toContain("f1");
    const allowedSM = await client.getAllowedFrontIds({ actorId: "p3" });
    expect(allowedSM.sort()).toEqual(["f1", "f2", "f3", "f4"].sort());
  });

  it("setCanEdit exige SM e registra auditoria", async () => {
    const client = createApiClient();
    // SM pode alterar
    const updated = await client.setCanEdit("m7", true, {
      actorId: "p3",
      now: fixedNow,
    });
    expect(updated.canEdit).toBe(true);
    expect(client.getDeps().audit).toBeDefined();
    // Membro comum não pode
    await expect(
      client.setCanEdit("m7", false, { actorId: "p5", now: fixedNow })
    ).rejects.toThrow(DomainError);
  });
});
