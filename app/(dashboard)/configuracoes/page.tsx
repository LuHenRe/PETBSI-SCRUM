"use client";

import { useState } from "react";
import { Lock, Settings, Trash2, Shield, Eye, Edit2 } from "lucide-react";
import { setColumnWip, setFrontPermission, changePersonRole, removePerson, updateRotationConfig, useAppState } from "@/lib/store";
import { Badge, Button, Card, Select } from "@/components/ui";
import { ROLE_LABEL, isCoordinator, isTechAdmin } from "@/lib/labels";
import type { ProjectRole } from "@/lib/types";

const FERIADOS = [
  { date: "2026-10-12", label: "Nossa Senhora Aparecida" },
  { date: "2026-11-02", label: "Finados" },
  { date: "2026-11-20", label: "Consciência Negra" },
];

const WEEK_DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export default function ConfiguracoesPage() {
  const state = useAppState();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [managingPermissionsFor, setManagingPermissionsFor] = useState<string | null>(null);

  const currentUser = state.people.find(p => p.id === state.currentUserId);
  const currentUserRole = state.memberships.find(m => m.personId === state.currentUserId)?.role;
  const isAdmin = isTechAdmin(currentUserRole ?? "MEMBER");

  const notify = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1>Configurações</h1>
        <p className="text-muted mt-1">Políticas do fluxo, horários, usuários e permissões. Administrado pelo Scrum Master.</p>
      </div>

      {savedMsg && <div className="alert alert-ok mb-6" role="status">{savedMsg}</div>}

      <div className="widget-grid">
        <Card title="Política do fluxo (limites de WIP)">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Coluna</th>
                  <th style={{ width: 90 }}>Status</th>
                  <th style={{ width: 160 }}>Limite de WIP</th>
                </tr>
              </thead>
              <tbody>
                {state.columns.map((column) => (
                  <tr key={column.id}>
                    <td style={{ fontWeight: 600 }}>{column.name}</td>
                    <td><Badge tone="muted">{column.status}</Badge></td>
                    <td>
                      {column.wipLimit == null ? (
                        <span className="text-muted text-sm">Sem limite</span>
                      ) : (
                        <input
                          type="number"
                          min={1}
                          className="input"
                          style={{ width: 90 }}
                          value={column.wipLimit}
                          aria-label={`Limite de WIP de ${column.name}`}
                          onChange={(e) => {
                            setColumnWip(column.id, Math.max(1, Number(e.target.value) || 1));
                            notify(`WIP atualizado: ${column.name} -> ${e.target.value}`);
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex" style={{ flexDirection: "column", gap: 24 }}>
          <Card title="Revezamento de Papéis (SM e PO)">
            <div className="card-body">
              <p className="text-sm text-muted mb-4">
                O Scrum Master e o Product Owner são rotacionados automaticamente entre os administradores e coordenadores.
              </p>
              
              <div className="flex" style={{ flexDirection: "column", gap: 12 }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Intervalo (dias)</span>
                  <input 
                    type="number" 
                    className="input" 
                    style={{ width: 120 }} 
                    value={state.rotationConfig.intervalDays}
                    onChange={(e) => {
                      updateRotationConfig({ intervalDays: Number(e.target.value) || 7 });
                      notify("Intervalo de revezamento atualizado");
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Dia da troca</span>
                  <Select 
                    style={{ width: 160 }}
                    value={String(state.rotationConfig.startDayOfWeek)}
                    onChange={(e) => {
                      updateRotationConfig({ startDayOfWeek: Number(e.target.value) });
                      notify("Dia de troca atualizado");
                    }}
                  >
                    {WEEK_DAYS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="text-sm font-semibold">PO Ativo (Forçar)</span>
                  <Select 
                    style={{ width: 200 }}
                    value={state.rotationConfig.activeProductOwnerId ?? ""}
                    onChange={(e) => {
                      updateRotationConfig({ activeProductOwnerId: e.target.value || null });
                      notify("Product Owner forçado manualmente");
                    }}
                  >
                    <option value="">(Automático)</option>
                    {state.memberships.filter(m => m.role === "COORDINATOR" || m.role === "PRODUCT_OWNER").map(m => {
                      const p = state.people.find(p => p.id === m.personId);
                      return <option key={m.personId} value={m.personId}>{p?.name}</option>;
                    })}
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">SM Ativo (Forçar)</span>
                  <Select 
                    style={{ width: 200 }}
                    value={state.rotationConfig.activeScrumMasterId ?? ""}
                    onChange={(e) => {
                      updateRotationConfig({ activeScrumMasterId: e.target.value || null });
                      notify("Scrum Master forçado manualmente");
                    }}
                  >
                    <option value="">(Automático)</option>
                    {state.memberships.filter(m => m.role === "SCRUM_MASTER" || m.role === "SCRUM_MASTER_ASSISTANT").map(m => {
                      const p = state.people.find(p => p.id === m.personId);
                      return <option key={m.personId} value={m.personId}>{p?.name}</option>;
                    })}
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Horários das reuniões">
            <dl className="kv card-body">
              <dt>Terça</dt><dd>18:30 — acompanhamento</dd>
              <dt>Quarta</dt><dd>18:30 — reunião principal</dd>
              <dt>Feriados</dt>
              <dd>
                <div className="flex gap-1 wrap">
                  {FERIADOS.map((f) => (
                    <Badge key={f.date} tone="muted">{f.label}</Badge>
                  ))}
                </div>
              </dd>
            </dl>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card title="Gerenciamento de Usuários e Permissões">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Cargo Global</th>
                  <th>Frente Primária</th>
                  <th style={{ width: 100 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {state.memberships.map((m) => {
                  const person = state.people.find((p) => p.id === m.personId);
                  if (!person) return null;
                  const front = state.fronts.find((f) => f.id === m.primaryFrontId);
                  
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>
                        {person.name}
                        {m.personId === state.currentUserId && <span style={{ marginLeft: 8 }}><Badge tone="info">Você</Badge></span>}
                      </td>
                      <td>
                        <Select
                          value={m.role}
                          onChange={(e) => {
                            changePersonRole(m.personId, e.target.value as ProjectRole);
                            notify(`Cargo de ${person.name} alterado para ${ROLE_LABEL[e.target.value as ProjectRole]}`);
                          }}
                          disabled={!isAdmin}
                        >
                          {Object.entries(ROLE_LABEL).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        <span className="text-muted text-sm">{front?.name || "Nenhuma"}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setManagingPermissionsFor(managingPermissionsFor === m.personId ? null : m.personId)}
                            title="Gerenciar Permissões das Frentes"
                          >
                            <Shield size={14} />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            disabled={!isAdmin || m.personId === state.currentUserId}
                            onClick={() => {
                              if (confirm(`Remover ${person.name} do sistema?`)) {
                                removePerson(m.personId);
                                notify(`${person.name} foi removido.`);
                              }
                            }}
                            title="Remover Usuário"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {managingPermissionsFor && (() => {
            const m = state.memberships.find(mb => mb.personId === managingPermissionsFor);
            const p = state.people.find(pp => pp.id === managingPermissionsFor);
            if (!m || !p) return null;
            
            // Regras implícitas
            const viewsAll = m.role === "COORDINATOR" || m.role === "PRODUCT_OWNER" || m.role === "SCRUM_MASTER" || m.role === "SCRUM_MASTER_ASSISTANT";
            const editsAll = m.role === "PRODUCT_OWNER" || m.role === "SCRUM_MASTER" || m.role === "SCRUM_MASTER_ASSISTANT";
            
            return (
              <div className="card-footer" style={{ display: "block", background: "var(--surface-2)" }}>
                <h3 className="mb-4">Permissões de {p.name}</h3>
                <div className="overview-grid">
                  {state.fronts.map(f => {
                    const explicit = m.frontPermissions.find(fp => fp.frontId === f.id);
                    
                    const canView = explicit ? explicit.canView : (viewsAll || f.id === m.primaryFrontId);
                    const canEdit = explicit ? explicit.canEdit : (editsAll || (m.role === "MEMBER" && f.id === m.primaryFrontId));
                    
                    return (
                      <Card key={f.id} className="p-4">
                        <div className="text-sm font-semibold mb-3">{f.name}</div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm flex items-center gap-2"><Eye size={14}/> Visualizar</span>
                          <input 
                            type="checkbox" 
                            checked={canView} 
                            disabled={!isAdmin || viewsAll} 
                            onChange={(e) => setFrontPermission(m.personId, f.id, e.target.checked, canEdit)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2"><Edit2 size={14}/> Editar</span>
                          <input 
                            type="checkbox" 
                            checked={canEdit} 
                            disabled={!isAdmin || editsAll || (!canView && !e.target.checked)} 
                            onChange={(e) => setFrontPermission(m.personId, f.id, canView, e.target.checked)}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}