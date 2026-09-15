"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { frontById, useAppState } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import { Badge, Card, EmptyState } from "@/components/ui";

export default function EntregasPage() {
  const state = useAppState();
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
                  <th style={{ minWidth: 110 }}>Estado</th>
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
                      <Badge tone={delivery.status === "entregue" ? "ok" : delivery.status === "em_andamento" ? "warn" : "muted"} dot>
                        {delivery.status === "entregue" ? "Entregue" : delivery.status === "em_andamento" ? "Em andamento" : "Planejada"}
                      </Badge>
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