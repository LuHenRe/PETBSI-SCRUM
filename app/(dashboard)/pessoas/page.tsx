"use client";

import { Users } from "lucide-react";
import { useAppState } from "@/lib/store";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/labels";
import type { AppState, ProjectRole } from "@/lib/types";

function calculateActiveRole(state: AppState, baseRole: ProjectRole): string | null {
  const candidates = state.memberships.filter(m => {
    if (baseRole === "SCRUM_MASTER") return m.role === "SCRUM_MASTER" || m.role === "SCRUM_MASTER_ASSISTANT";
    if (baseRole === "PRODUCT_OWNER") return m.role === "PRODUCT_OWNER" || m.role === "COORDINATOR";
    return m.role === baseRole;
  });
  
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.personId.localeCompare(b.personId));
  
  const diffTime = Math.abs(new Date().getTime() - new Date(state.rotationConfig.startDate).getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const intervalsPassed = Math.floor(diffDays / state.rotationConfig.intervalDays);
  
  const index = intervalsPassed % candidates.length;
  return candidates[index]?.personId ?? null;
}

export default function PessoasPage() {
  const state = useAppState();

  const activePOId = state.rotationConfig.activeProductOwnerId ?? calculateActiveRole(state, "PRODUCT_OWNER");
  const activeSMId = state.rotationConfig.activeScrumMasterId ?? calculateActiveRole(state, "SCRUM_MASTER");
  
  const activePO = state.people.find(p => p.id === activePOId);
  const activeSM = state.people.find(p => p.id === activeSMId);

  return (
    <div>
      <div className="mb-6">
        <h1>Pessoas e responsabilidades</h1>
        <p className="text-muted mt-1">Participantes, duplas, frentes e papéis. Edição de permissões é restrita ao Scrum Master/Scrum Master Assistente.</p>
      </div>

      <div className="widget-grid">
        <Card title={`Participantes (${state.people.length})`}>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th style={{ minWidth: 160 }}>Pessoa</th>
                  <th style={{ minWidth: 80 }}>Dupla</th>
                  <th style={{ minWidth: 140 }}>Cargo</th>
                  <th style={{ minWidth: 200 }}>Frentes</th>
                </tr>
              </thead>
              <tbody>
                {state.people.map((person) => {
                  const pair = state.pairs.find((p) => p.personIds.includes(person.id));
                  const membership = state.memberships.find((m) => m.personId === person.id);
                  if (!membership) return null;
                  
                  const isTechAdmin = membership.role === "SCRUM_MASTER" || membership.role === "SCRUM_MASTER_ASSISTANT";
                  const isCoord = membership.role === "PRODUCT_OWNER" || membership.role === "COORDINATOR";

                  const allFrontsIds = new Set<string>();
                  if (membership.primaryFrontId) allFrontsIds.add(membership.primaryFrontId);
                  membership.frontPermissions.forEach(fp => allFrontsIds.add(fp.frontId));

                  return (
                    <tr key={person.id}>
                      <td><Avatar person={person} /></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{person.name}</div>
                        <div className="text-xs text-muted">{person.email}</div>
                      </td>
                      <td>{pair?.name ?? "—"}</td>
                      <td>
                        <Badge tone={isTechAdmin ? "warn" : isCoord ? "info" : "muted"}>
                          {ROLE_LABEL[membership.role]}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex gap-2 wrap" style={{ alignItems: "center" }}>
                          {Array.from(allFrontsIds).length === 0 && <span className="text-muted text-sm">—</span>}
                          {Array.from(allFrontsIds).map((fId) => {
                            const front = state.fronts.find((f) => f.id === fId);
                            if (!front) return null;
                            const explicit = membership.frontPermissions.find(fp => fp.frontId === fId);
                            const viewsAll = isCoord || isTechAdmin;
                            const editsAll = isTechAdmin || membership.role === "PRODUCT_OWNER";
                            const canEdit = explicit ? explicit.canEdit : (editsAll || (membership.role === "MEMBER" && fId === membership.primaryFrontId));
                            const isPrimary = fId === membership.primaryFrontId;

                            return (
                              <span 
                                key={fId} 
                                className="badge" 
                                style={{ 
                                  background: `${front.color}14`, 
                                  color: front.color,
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "4px 8px",
                                  height: "auto",
                                  border: isPrimary ? `1px solid ${front.color}40` : "none"
                                }}
                              >
                                {front.name}
                                {!canEdit && <span title="Somente leitura" style={{ opacity: 0.7, marginLeft: 4 }}> (leitura)</span>}
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

        <div className="flex" style={{ flexDirection: "column", gap: 24 }}>
          <Card title="Alternância de responsabilidades">
            <p className="text-sm text-soft">
              O Product Owner é exercido por um coordenador por vez e o Scrum Master alterna com o Scrum Master
              Assistente, ambos administradores técnicos.
            </p>
            <div className="flex" style={{ flexDirection: "column", gap: 8, marginTop: 16 }}>
              {activePO && <Badge tone="info" style={{ display: "inline-flex", width: "fit-content" }}>PO Ativo: {activePO.name}</Badge>}
              {activeSM && <Badge tone="warn" style={{ display: "inline-flex", width: "fit-content" }}>SM Ativo: {activeSM.name}</Badge>}
            </div>
          </Card>

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
        </div>
      </div>
    </div>
  );
}