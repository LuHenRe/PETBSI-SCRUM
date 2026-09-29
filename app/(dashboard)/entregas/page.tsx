"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { createDelivery, frontById, setDeliveryStatus, useAppState } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import { Badge, Button, Card, EmptyState, Select, TextInput } from "@/components/ui";

export default function EntregasPage() {
  const state = useAppState();
  const role = state.memberships.find((m) => m.personId === state.currentUserId)?.role;
  const canManage = role === "PRODUCT_OWNER" || role === "SCRUM_MASTER" || role === "SCRUM_MASTER_ASSISTANT";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frontId, setFrontId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [itemIds, setItemIds] = useState<string[]>([]);
  const countByStatus = {
    entregue: state.deliveries.filter((d) => d.status === "entregue").length,
    em_andamento: state.deliveries.filter((d) => d.status === "em_andamento").length,
    planejada: state.deliveries.filter((d) => d.status === "planejada").length,
  };

  return (
    <div>
      <div className="mb-4">
        <h1>Entregas e histórico</h1>
        <p className="text-muted mt-1">Resultados por Sprint, frente e estado.</p>
      </div>

      <div className="overview-grid mb-4">
        <div className="card stat"><div className="stat-label">Entregues</div><div className="stat-value" style={{ color: "var(--success)" }}>{countByStatus.entregue}</div></div>
        <div className="card stat"><div className="stat-label">Em andamento</div><div className="stat-value" style={{ color: "var(--warning)" }}>{countByStatus.em_andamento}</div></div>
        <div className="card stat"><div className="stat-label">Planejadas</div><div className="stat-value">{countByStatus.planejada}</div></div>
      </div>

      {canManage && <Card title="Registrar entrega" className="mb-4">
        <form className="flex flex-wrap gap-2" onSubmit={(event) => {
          event.preventDefault();
          if (!frontId || itemIds.length === 0) return;
          createDelivery({ title, description, frontId, sprintId: sprintId || null, itemIds });
          setTitle(""); setDescription(""); setItemIds([]);
        }}>
          <TextInput aria-label="Título da entrega" placeholder="Título da entrega" value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
          <TextInput aria-label="Descrição da entrega" placeholder="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Select aria-label="Frente da entrega" value={frontId} onChange={(event) => { setFrontId(event.target.value); setItemIds([]); }} required>
            <option value="">Selecione a frente</option>
            {state.fronts.map((front) => <option key={front.id} value={front.id}>{front.name}</option>)}
          </Select>
          <Select aria-label="Sprint da entrega" value={sprintId} onChange={(event) => setSprintId(event.target.value)}>
            <option value="">Sem Sprint</option>
            {state.sprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name}</option>)}
          </Select>
          <div style={{ width: "100%" }}>
            <strong className="text-sm">Itens relacionados (ao menos um)</strong>
            {state.backlogItems.filter((item) => item.frontId === frontId).map((item) => <label key={item.id} className="flex gap-2 items-center text-sm">
              <input type="checkbox" checked={itemIds.includes(item.id)} onChange={(event) => setItemIds((selected) => event.target.checked
                ? [...selected, item.id] : selected.filter((id) => id !== item.id))} /> {item.title}
            </label>)}
          </div>
          <Button variant="primary" type="submit" disabled={!frontId || itemIds.length === 0}>Criar entrega</Button>
        </form>
      </Card>}

      {state.deliveries.length === 0 ? (
        <Card><EmptyState icon={<Package />} title="Nenhuma entrega" description="As entregas do projeto aparecerão aqui." /></Card>
      ) : (
        <Card>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 850 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Entrega</th>
                  <th style={{ minWidth: 140 }}>Frente</th>
                  <th style={{ minWidth: 100 }}>Sprint</th>
                  <th style={{ minWidth: 220, maxWidth: 300 }}>Itens</th>
                  <th style={{ minWidth: 130 }}>Estado</th>
                  <th style={{ minWidth: 110 }}>Concluída em</th>
                </tr>
              </thead>
              <tbody>
                {state.deliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{delivery.title}</div>
                      <div className="text-xs text-muted">{delivery.description}</div>
                    </td>
                    <td>
                      <Badge tone="muted">{frontById(state, delivery.frontId)?.name}</Badge>
                    </td>
                    <td>{delivery.sprintName}</td>
                    <td>
                      <div className="flex gap-1 wrap" style={{ maxWidth: 300 }}>
                        {delivery.itemIds.map((itemId) => {
                          const item = state.backlogItems.find((i) => i.id === itemId);
                          return (
                            <Link
                              key={itemId}
                              href={`/itens/${itemId}`}
                              className="badge badge-info"
                              style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}
                              title={item?.title ?? itemId}
                            >
                              {item?.title ?? itemId}
                            </Link>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      {canManage && delivery.status !== "entregue" ? <Select aria-label={`Estado da entrega ${delivery.title}`} value={delivery.status}
                        onChange={(event) => setDeliveryStatus(delivery.id, event.target.value as "planejada" | "em_andamento" | "entregue")}>
                        <option value="planejada">Planejada</option><option value="em_andamento">Em andamento</option><option value="entregue">Entregue</option>
                      </Select> : <Badge tone={delivery.status === "entregue" ? "ok" : "muted"} dot>{delivery.status}</Badge>}
                    </td>
                    <td>{delivery.completedOn ? formatDate(delivery.completedOn) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
