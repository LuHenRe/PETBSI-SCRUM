"use client";

import { Users } from "lucide-react";
import { useAppState } from "@/lib/store";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/labels";

export default function PessoasPage() {
  const state = useAppState();

  return (
    <div>
      <div className="mb-4">
        <h1>Pessoas e responsabilidades</h1>
        <p className="text-muted mt-1">Participantes, duplas, frentes e papéis. Edição de permissões é restrita ao Scrum Master/Scrum Master Assistente.</p>
      </div>

      <div className="widget-grid">
        <Card title={`Participantes (${state.people.length})`}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Pessoa</th>
                  <th>Dupla</th>
                  <th>Papel atual</th>
                  <th>Frentes</th>
                </tr>
              </thead>
              <tbody>
                {state.people.map((person) => {
                  const pair = state.pairs.find((p) => p.personIds.includes(person.id));
                  const memberships = state.memberships.filter((m) => m.personId === person.id);
                  const current = memberships.find((m) => m.role !== "MEMBER") ?? memberships[0];
                  return (
                    <tr key={person.id}>
                      <td><Avatar person={person} /></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{person.name}</div>
                        <div className="text-xs text-muted">{person.email}</div>
                      </td>
                      <td>{pair?.name ?? "—"}</td>
                      <td>
                        {current && (
                          <Badge tone={current.role === "SCRUM_MASTER" || current.role === "SCRUM_MASTER_ASSISTANT" ? "warn" : current.role === "PRODUCT_OWNER" || current.role === "COORDINATOR" ? "info" : "muted"}>
                            {ROLE_LABEL[current.role]}
                          </Badge>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1 wrap">
                          {memberships.map((m) => {
                            const front = state.fronts.find((f) => f.id === m.frontId);
                            return (
                              <span key={m.id} className="badge" style={{ background: `${front?.color ?? "#94a3b8"}14`, color: front?.color ?? "#334155" }}>
                                {front?.name ?? "—"}
                                {!m.canEdit && <span title="Somente leitura"> (leitura)</span>}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Duplas">
            {state.pairs.length === 0 ? (
              <EmptyState icon={<Users />} title="Nenhuma dupla configurada" />
            ) : (
              <div className="list">
                {state.pairs.map((pair) => (
                  <div key={pair.id} className="card row-item">
                    <div className="flex-1">
                      <div style={{ fontWeight: 600 }}>{pair.name}</div>
                      <div className="text-xs text-muted">
                        {pair.personIds.map((id) => state.people.find((p) => p.id === id)?.name).join(" e ")}
                      </div>
                    </div>
                    <div className="avatar-stack">
                      {pair.personIds.map((id) => (
                        <Avatar key={id} person={state.people.find((p) => p.id === id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Alternância de responsabilidades">
            <p className="text-sm text-soft">
              O Product Owner é exercido por um coordenador por vez e o Scrum Master alterna com o Scrum Master
              Assistente, ambos administradores técnicos.
            </p>
            <div className="row-meta mt-2">
              <Badge tone="info">Product Owner: Ana Ribeiro</Badge>
              <Badge tone="warn">Scrum Master: Carla Menezes</Badge>
              <Badge tone="muted">Scrum Master Assistente: Diego Farias</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}