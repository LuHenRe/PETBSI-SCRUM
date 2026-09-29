import { describe, expect, it } from "vitest";
import { verifiedGoogleIdentity } from "@/server/authorization/google-identity";

describe("autorização de identidade Google", () => {
  it("exige e-mail verificado e identificador estável do Google", () => {
    expect(verifiedGoogleIdentity({ email: "membro@example.org", sub: "123", email_verified: false })).toBeNull();
    expect(verifiedGoogleIdentity({ email: "membro@example.org", email_verified: true })).toBeNull();
    expect(verifiedGoogleIdentity({ email: "membro@example.org", sub: " ", email_verified: true })).toBeNull();
  });

  it("normaliza o e-mail sem transformar o nome em permissão", () => {
    expect(verifiedGoogleIdentity({ email: " Pessoa@Example.Org ", sub: "subject-1", email_verified: true }))
      .toEqual({ email: "pessoa@example.org", subject: "subject-1" });
  });
});
