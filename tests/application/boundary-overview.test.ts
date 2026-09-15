import { describe, expect, it } from "vitest";
import { createApiClient } from "@/lib/api-client";

// Boundary: visão geral + shell + login — filtro por frente respeita permissão,
// Visitante sem links de escrita (contrato de UI), dados via getOverview.
describe("boundary overview/shell — permissão via domínio", () => {
  it("SM/coordenador enxerga todas as frentes; membro só as suas", async () => {
    const client = createApiClient();
    const allSM = await client.getAllowedFrontIds({ actorId: "p3" });
    expect(allSM.sort()).toEqual(["f1", "f2", "f3", "f4"].sort());

    const p5 = await client.getAllowedFrontIds({ actorId: "p5" });
    expect(p5).toEqual(["f1"]);

    const overviewF1 = await client.getOverview({ allowedFrontIds: p5 });
    expect(overviewF1.items.every((i) => i.frontId === "f1")).toBe(true);
  });

  it("Visitante (canEdit=false) ainda lista frente mas UI deve esconder escrita", async () => {
    const client = createApiClient();
    // p6 tem f1 (edit) + f3 (visitante)
    const allowed = await client.getAllowedFrontIds({ actorId: "p6" });
    expect(allowed).toContain("f1");
    expect(allowed).toContain("f3");

    const deps = client.getDeps();
    const all = await deps.memberships.listAll();
    const visitante = all.find((m) => m.personId === "p6" && m.frontId === "f3")!;
    expect(visitante.canEdit).toBe(false);
    expect(visitante.displayTitle).toBe("Visitante");

    // Contrato de UI: Visitante não recebe links de escrita.
    // A página/shell decide via canEdit; aqui provamos o dado que a UI usa.
    const canWrite = visitante.canEdit;
    expect(canWrite).toBe(false);
  });

  it("login resolve ProjectMembership via adapter (sem store)", async () => {
    const client = createApiClient();
    const deps = client.getDeps();
    const all = await deps.memberships.listAll();
    const m1 = all.find((m) => m.personId === "p1");
    expect(m1).toBeDefined();
    expect(m1!.role).toBe("PRODUCT_OWNER");
  });
});
