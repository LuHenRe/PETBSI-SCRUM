"use client";

import { useState } from "react";
import { setColumnWip, setFrontPermission, useAppState } from "@/lib/store";
import { isTechAdmin } from "@/lib/labels";
import { Badge, Button, Card } from "@/components/ui";

export default function ConfiguracoesPage() {
  const state = useAppState();
  const role = state.memberships.find((m) => m.personId === state.currentUserId)?.role;
  const admin = isTechAdmin(role ?? "MEMBER");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [wipDrafts, setWipDrafts] = useState<Record<string, string>>({});
  const membership = state.memberships.find((m) => m.personId === selectedPerson);
  const person = state.people.find((p) => p.id === selectedPerson);

  return <div>
    <h1>Configurações</h1>
    <p className="text-muted mt-1 mb-4">Política do fluxo e permissões por frente. Mudanças são validadas e registradas no servidor.</p>
    <Card title="Limites de trabalho em progresso (WIP)" className="mb-4">
      <div className="table-wrap"><table className="table"><thead><tr><th>Coluna</th><th>Limite</th><th>Ação</th></tr></thead>
        <tbody>{state.columns.map((column) => {
          const draft = wipDrafts[column.id] ?? (column.wipLimit?.toString() ?? "");
          return <tr key={column.id}><td>{column.name}</td><td>
            <input className="input" style={{ width: 120 }} type="number" min={1} max={999}
              aria-label={`Limite de WIP de ${column.name}`} placeholder="Sem limite"
              disabled={!admin} value={draft}
              onChange={(event) => setWipDrafts((current) => ({ ...current, [column.id]: event.target.value }))} />
          </td><td><Button size="sm" disabled={!admin || (draft !== "" && (!Number.isInteger(Number(draft)) || Number(draft) < 1))}
            onClick={() => {
              setColumnWip(column.id, draft === "" ? null : Number(draft));
              setWipDrafts((current) => { const next = { ...current }; delete next[column.id]; return next; });
            }}>Salvar</Button></td></tr>;
        })}</tbody></table></div>
      <p className="text-sm text-muted">Um limite vazio significa que a coluna não tem limite configurado.</p>
    </Card>
    <Card title="Permissões de acesso e edição por frente" className="mb-4">
      {!admin && <p>Somente o Scrum Master e o Assistente podem alterar permissões.</p>}
      {admin && <>
        <label className="text-sm" htmlFor="person-permission">Participante</label>
        <select id="person-permission" className="select" value={selectedPerson ?? ""} onChange={(event) => setSelectedPerson(event.target.value || null)}>
          <option value="">Selecione uma pessoa</option>
          {state.memberships.map((m) => <option key={m.id} value={m.personId}>
            {state.people.find((p) => p.id === m.personId)?.name ?? m.personId}
          </option>)}
        </select>
        {membership && person && <div className="mt-3">
          <p className="mb-3">{person.name} — <Badge>{membership.role}</Badge></p>
          {state.fronts.map((front) => {
            const explicit = membership.frontPermissions.find((fp) => fp.frontId === front.id);
            const fullView = ["SCRUM_MASTER", "SCRUM_MASTER_ASSISTANT", "PRODUCT_OWNER", "COORDINATOR"].includes(membership.role);
            const fullEdit = ["SCRUM_MASTER", "SCRUM_MASTER_ASSISTANT", "PRODUCT_OWNER"].includes(membership.role);
            const canView = explicit ? explicit.canView : fullView || membership.primaryFrontId === front.id;
            const canEdit = explicit ? explicit.canEdit : fullEdit || (membership.role === "MEMBER" && membership.primaryFrontId === front.id);
            return <div key={front.id} className="card row-item flex gap-3 items-center wrap mb-2">
              <strong className="flex-1">{front.name}</strong>
              <label className="flex gap-1 items-center"><input type="checkbox" checked={canView} disabled={fullView}
                onChange={(event) => setFrontPermission(person.id, front.id, event.target.checked, event.target.checked && canEdit)} /> Ver</label>
              <label className="flex gap-1 items-center"><input type="checkbox" checked={canEdit} disabled={fullEdit || !canView}
                onChange={(event) => setFrontPermission(person.id, front.id, canView, event.target.checked)} /> Editar</label>
            </div>;
          })}
        </div>}
      </>}
    </Card>
    <Card title="Reuniões semanais">
      <p>Terça-feira 08:00–10:00: acompanhamento. Quarta-feira 08:00–10:00: reunião principal. Confirme feriados no calendário do projeto.</p>
      <p className="text-muted mt-2">Alterações de papéis, revezamento e integrações externas ainda exigem procedimento administrativo próprio.</p>
    </Card>
  </div>;
}
