"use client";

import { useState } from "react";
import { setColumnWip, setFrontPermission, updatePersonalInfo, useAppState, useGlobalAppState } from "@/lib/store";
import { Badge, Button, Card } from "@/components/ui";

export default function ConfiguracoesPage() {
  const globalState = useGlobalAppState();
  const state = useAppState();
  
  const currentUser = globalState.people.find(p => p.id === globalState.currentUserId);
  const isGlobalAdmin = currentUser?.systemRole === "ADMIN";
  
  const role = state.memberships.find((m) => m.personId === state.currentUserId)?.role;
  const isScrumMaster = role === "SCRUM_MASTER" || role === "SCRUM_MASTER_ASSISTANT";
  
  const canEditWip = isGlobalAdmin || isScrumMaster;
  const canEditPermissions = isGlobalAdmin;

  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [wipDrafts, setWipDrafts] = useState<Record<string, string>>({});
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");

  const membership = state.memberships.find((m) => m.personId === selectedPerson);
  const person = state.people.find((p) => p.id === selectedPerson);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleSavePersonalInfo = () => {
    if (currentUser) {
      updatePersonalInfo(currentUser.id, displayName, phone);
      alert("Dados pessoais atualizados com sucesso!");
    }
  };

  return <div>
    <h1>Configurações</h1>
    <p className="text-muted mt-1 mb-4">Gerencie as suas configurações pessoais, políticas de fluxo e permissões de projeto.</p>
    
    <Card title="Dados pessoais" className="mb-4">
      <div className="flex gap-4 mb-3" style={{ flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="text-sm block mb-1">Nome de exibição</label>
          <input className="input w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Como você prefere ser chamado" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="text-sm block mb-1">Contato (Telefone)</label>
          <input className="input w-full" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(XX) XXXXX-XXXX" />
        </div>
      </div>
      <Button size="sm" variant="primary" disabled={phone.replace(/\D/g, "").length > 0 && phone.replace(/\D/g, "").length !== 11} onClick={handleSavePersonalInfo}>Salvar dados</Button>
    </Card>

    {canEditWip && (
      <Card title="Limites de trabalho em progresso (WIP)" className="mb-4">
        <div className="table-wrap"><table className="table"><thead><tr><th>Coluna</th><th>Limite</th><th>Ação</th></tr></thead>
          <tbody>{state.columns.map((column) => {
            const draft = wipDrafts[column.id] ?? (column.wipLimit?.toString() ?? "");
            return <tr key={column.id}><td>{column.name}</td><td>
              <input className="input" style={{ width: 120 }} type="number" min={1} max={999}
                aria-label={`Limite de WIP de ${column.name}`} placeholder="Sem limite"
                value={draft}
                onChange={(event) => setWipDrafts((current) => ({ ...current, [column.id]: event.target.value }))} />
            </td><td><Button size="sm" disabled={draft !== "" && (!Number.isInteger(Number(draft)) || Number(draft) < 1)}
              onClick={() => {
                setColumnWip(column.id, draft === "" ? null : Number(draft));
                setWipDrafts((current) => { const next = { ...current }; delete next[column.id]; return next; });
              }}>Salvar</Button></td></tr>;
          })}</tbody></table></div>
        <p className="text-sm text-muted">Um limite vazio significa que a coluna não tem limite configurado.</p>
      </Card>
    )}

    {canEditPermissions && (
      <Card title="Permissões de acesso e edição por frente" className="mb-4">
        <label className="text-sm block mb-1" htmlFor="person-permission">Participante</label>
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
            return <div key={front.id} className="card row-item flex gap-3 items-center wrap mb-2" style={{ padding: "12px 16px" }}>
              <strong className="flex-1">{front.name}</strong>
              <label className="flex gap-1 items-center"><input type="checkbox" checked={canView} disabled={fullView}
                onChange={(event) => setFrontPermission(person.id, front.id, event.target.checked, event.target.checked && canEdit)} /> Ver</label>
              <label className="flex gap-1 items-center"><input type="checkbox" checked={canEdit} disabled={fullEdit || !canView}
                onChange={(event) => setFrontPermission(person.id, front.id, canView, event.target.checked)} /> Editar</label>
            </div>;
          })}
        </div>}
      </Card>
    )}

    <Card title="Reuniões semanais">
      <p>Terça-feira 08:00–10:00: acompanhamento. Quarta-feira 08:00–10:00: reunião principal. Confirme feriados no calendário do projeto.</p>
      <p className="text-muted mt-2">Alterações de papéis, revezamento e integrações externas ainda exigem procedimento administrativo próprio.</p>
    </Card>
  </div>;
}
