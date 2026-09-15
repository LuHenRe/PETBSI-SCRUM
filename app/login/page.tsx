"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { ProjectMembership } from "@/domain/project/project-membership";
import { ROLE_LABEL } from "@/lib/labels";
import { Avatar, Badge, Button } from "@/components/ui";

export default function LoginPage() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);
  const version = apiClient.getVersion();
  const router = useRouter();

  const people = useMemo(() => apiClient.listPeople(), [version]);
  const [domainMemberships, setDomainMemberships] = useState<ProjectMembership[]>([]);

  // Resolve ProjectMembership via adapter memory, sem store legado.
  useEffect(() => {
    let cancelled = false;
    apiClient
      .getDeps()
      .memberships.listAll()
      .then((all) => {
        if (!cancelled) setDomainMemberships(all);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [version]);

  const handleSelect = (personId: string) => {
    apiClient.setCurrentUserId(personId);
    router.replace("/");
  };

  const handleReset = () => {
    apiClient.reset();
  };

  return (
    <main className="login-page">
      <section className="card login-card">
        <div className="flex items-center gap-3 mb-2">
          <span className="mark" aria-hidden style={{ width: 44, height: 44, borderRadius: 12, background: "#4338ca", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <GraduationCap size={22} />
          </span>
          <div>
            <h1>PETBSI Scrum</h1>
            <p className="text-muted text-sm">Gestão ágil do projeto acadêmico</p>
          </div>
        </div>

        <p className="text-sm text-soft mt-2">
          Demonstração do frontend. Selecione quem está usando o sistema para continuar.
        </p>

        <div className="person-picker mt-3" role="group" aria-label="Selecionar pessoa">
          {people.map((person) => {
            const membership = domainMemberships.find((m) => m.personId === person.id);
            const role = membership?.role ?? "MEMBER";
            const label = membership && !membership.canEdit ? "Visitante" : ROLE_LABEL[role as keyof typeof ROLE_LABEL];
            return (
              <button key={person.id} className="person-option" onClick={() => handleSelect(person.id)}>
                <Avatar person={person} size="lg" />
                <div className="flex-1">
                  <div style={{ fontWeight: 600 }}>{person.name}</div>
                  <div className="text-xs text-muted">{person.email}</div>
                </div>
                <Badge tone="muted">{label}</Badge>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
            title="Recarregar os dados de demonstração"
          >
            <RefreshCw size={14} />
            Reiniciar demonstração
          </button>
          <Button variant="primary" onClick={() => people[0] && handleSelect(people[0].id)}>
            Entrar como coordenador (Product Owner)
          </Button>
        </div>
      </section>
    </main>
  );
}
