"use client";

import { useEffect, useReducer, useState } from "react";
import { Lock, Settings } from "lucide-react";
import { setColumnWip, useAppState } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import type { ProjectMembership } from "@/domain/project/project-membership";
import { Badge, Card, Field, Select } from "@/components/ui";
import { ROLE_LABEL, isCoordinator, isTechAdmin } from "@/lib/labels";

const FERIADOS = [
  { date: "2026-10-12", label: "Nossa Senhora Aparecida" },
  { date: "2026-11-02", label: "Finados" },
  { date: "2026-11-20", label: "Consciência Negra" },
];

export default function ConfiguracoesPage() {
  const state = useAppState();
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => apiClient.subscribe(() => force()), []);
  const version = apiClient.getVersion();
  const [savedWip, setSavedWip] = useState<string | null>(null);
  // RF24/RN10: permissões por frente vêm do domínio (auditoria append-only).
  // WIP continua local (apresentação); edição de permissão exige SM via apiClient.
  const [domainMemberships, setDomainMemberships] = useState<ProjectMembership[]>([]);
  const [permError, setPermError] = useState<string | null>(null);
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

  return (
    <div>
      <div className="mb-4">
        <h1>Configurações</h1>
        <p className="text-muted mt-1">Políticas do fluxo, horários e permissões. Administrado pelo Scrum Master/Scrum Master Assistente.</p>
      </div>

      {savedWip && <div className="alert alert-ok mb-4" role="status">Limite de WIP atualizado: {savedWip}</div>}

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
                            setSavedWip(`${column.name}: ${e.target.value}`);
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

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Horários das reuniões">
            <dl className="kv">
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

          <Card
            title="Permissões por frente"
            action={<Lock size={15} className="text-muted" aria-label="Restrito a administradores" />}
          >
            {permError && (
              <div className="alert alert-danger mb-2" role="alert">
                {permError}
              </div>
            )}
            <div className="list">
              {domainMemberships.map((m) => {
                const person = state.people.find((p) => p.id === m.personId);
                const front = state.fronts.find((f) => f.id === m.frontId);
                const locked = isTechAdmin(m.role) || isCoordinator(m.role);
                return (
                  <div key={m.id} className="card row-item">
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{person?.name}</div>
                      <div className="text-xs text-muted">{front?.name} · {ROLE_LABEL[m.role]}</div>
                    </div>
                    {locked ? (
                      <Badge tone="muted">{m.canEdit ? "Pode editar" : "Leitura"}</Badge>
                    ) : (
                      <Select
                        style={{ width: "auto" }}
                        value={m.canEdit ? "edit" : "read"}
                        aria-label={`Permissão de ${person?.name} em ${front?.name}`}
                        onChange={(e) => {
                          const next = e.target.value === "edit";
                          setPermError(null);
                          apiClient
                            .setCanEdit(m.id, next)
                            .catch((err: unknown) =>
                              setPermError(err instanceof Error ? err.message : "Erro ao atualizar permissão")
                            );
                        }}
                      >
                        <option value="edit">Pode editar</option>
                        <option value="read">Apenas leitura</option>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}