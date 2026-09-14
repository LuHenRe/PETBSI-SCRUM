"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, RefreshCw } from "lucide-react";
import { resetStore, useAppState, login } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/labels";
import { Avatar, Badge, Button } from "@/components/ui";

export default function LoginPage() {
  const state = useAppState();
  const router = useRouter();

  const handleSelect = (personId: string) => {
    login(personId);
    router.replace("/");
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
          {state.people.map((person) => {
            const membership = state.memberships.find((m) => m.personId === person.id);
            const role = membership?.role ?? "MEMBER";
            return (
              <button key={person.id} className="person-option" onClick={() => handleSelect(person.id)}>
                <Avatar person={person} size="lg" />
                <div className="flex-1">
                  <div style={{ fontWeight: 600 }}>{person.name}</div>
                  <div className="text-xs text-muted">{person.email}</div>
                </div>
                <Badge tone="muted">{ROLE_LABEL[role]}</Badge>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            className="btn btn-ghost btn-sm"
            onClick={resetStore}
            title="Recarregar os dados de demonstração"
          >
            <RefreshCw size={14} />
            Reiniciar demonstração
          </button>
          <Button variant="primary" onClick={() => handleSelect(state.people[0].id)}>
            Entrar como coordenador (Product Owner)
          </Button>
        </div>
      </section>
    </main>
  );
}