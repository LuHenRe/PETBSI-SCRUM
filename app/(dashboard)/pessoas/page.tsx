"use client";

import { useState } from "react";
import { Users, Pencil } from "lucide-react";
import { useAppState, dispatch } from "@/lib/store";
import { Avatar, Badge, Card, EmptyState, Modal, Field, TextInput, Button } from "@/components/ui";
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

  const currentUser = state.people.find(p => p.id === state.currentUserId);
  const isAdmin = currentUser?.systemRole === "ADMIN";

  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  const handleOpenEditTags = (personId: string, currentTags: string[]) => {
    setSelectedPersonId(personId);
    setTagsInput(currentTags.join(", "));
    setEditTagsOpen(true);
  };

  const handleSaveTags = () => {
    if (!selectedPersonId) return;
    const newTags = tagsInput.split(",").map(t => t.trim()).filter(Boolean).slice(0, 4);
    dispatch({ action: "setPersonTags", personId: selectedPersonId, tags: newTags });
    setEditTagsOpen(false);
  };

  const activePOId = state.rotationConfig.activeProductOwnerId ?? calculateActiveRole(state, "PRODUCT_OWNER");
  const activeSMId = state.rotationConfig.activeScrumMasterId ?? calculateActiveRole(state, "SCRUM_MASTER");
  
  const activePO = state.people.find(p => p.id === activePOId);
  const activeSM = state.people.find(p => p.id === activeSMId);

  return (
    <div>
      <div className="mb-6">
        <h1>Pessoas e responsabilidades</h1>
        <p className="text-muted mt-1">Participantes, frentes e papéis. Edição de permissões é restrita ao Scrum Master/Scrum Master Assistente.</p>
      </div>

      <div className="widget-grid">
        <Card title={`Participantes (${state.people.length})`}>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th style={{ minWidth: 160 }}>Pessoa</th>
                  <th style={{ minWidth: 140 }}>Cargo</th>
                  <th style={{ minWidth: 200 }}>Frentes</th>
                </tr>
              </thead>
              <tbody>
                {state.people.map((person) => {
                  const membership = state.memberships.find((m) => m.personId === person.id);
                  if (!membership) return null;
                  
                  const isTechAdmin = membership.role === "SCRUM_MASTER" || membership.role === "SCRUM_MASTER_ASSISTANT";
                  const isCoord = membership.role === "PRODUCT_OWNER" || membership.role === "COORDINATOR";

                  const personFronts = state.fronts.filter(f => membership.primaryFrontId === f.id || membership.frontPermissions.some(fp => fp.frontId === f.id));
                  const personProjects = state.projects?.filter(p => personFronts.some(f => f.projectId === p.id)) || [];

                  return (
                    <tr key={person.id}>
                      <td><Avatar person={person} /></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{person.name}</div>
                        <div className="text-xs text-muted">{person.email}</div>
                      </td>
                      <td>
                        <div className="flex gap-1 wrap" style={{ alignItems: "center" }}>
                          {person.systemRole === "ADMIN" && (
                            <Badge tone="warn" style={{ border: "1px solid var(--danger)" }}>
                              Admin Global
                            </Badge>
                          )}
                          <Badge tone={isTechAdmin ? "warn" : isCoord ? "info" : "muted"}>
                            {ROLE_LABEL[membership.role]}
                          </Badge>
                          {person.tags?.slice(0, 4).map(tag => (
                            <Badge key={tag} tone="muted" style={{ fontWeight: "normal" }}>
                              {tag}
                            </Badge>
                          ))}
                          {isAdmin && (
                            <button
                              title="Editar Tags"
                              onClick={() => handleOpenEditTags(person.id, person.tags || [])}
                              style={{ background: "transparent", border: "none", cursor: "pointer", marginLeft: 4, opacity: 0.5 }}
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2 wrap" style={{ alignItems: "center" }}>
                          {personProjects.length === 0 && personFronts.length === 0 && <span className="text-muted text-sm">—</span>}
                          {personProjects.map(p => (
                            <Badge key={`p-${p.id}`} tone="muted">Projeto: {p.name}</Badge>
                          ))}
                          {personFronts.map(f => (
                            <span 
                              key={`f-${f.id}`} 
                              className="badge" 
                              style={{ 
                                background: `${f.color}14`, 
                                color: f.color,
                                border: `1px solid ${f.color}40`
                              }}
                            >
                              Frente: {f.name}
                            </span>
                          ))}
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
        </div>
      </div>

      <Modal open={editTagsOpen} title="Editar Tags de Cargo" onClose={() => setEditTagsOpen(false)} footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTagsOpen(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveTags}>Salvar</Button>
        </div>
      }>
        <div className="flex flex-col gap-4">
          <Field label="Tags (separadas por vírgula)" error={tagsInput.split(",").filter(t => t.trim()).length > 4 ? "Máximo de 4 tags" : undefined}>
            <TextInput 
              placeholder="Ex: Desenvolvedor, Design, QA" 
              value={tagsInput} 
              onChange={e => setTagsInput(e.target.value)} 
            />
          </Field>
          <p className="text-sm text-muted">Apenas as 4 primeiras tags serão exibidas.</p>
        </div>
      </Modal>
    </div>
  );
}