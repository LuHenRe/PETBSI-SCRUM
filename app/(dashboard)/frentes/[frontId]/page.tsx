"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Layers } from "lucide-react";
import { frontById, useAppState } from "@/lib/store";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui";
import { DeadlinePill, PriorityBadge, StatusBadge, TypeBadge, Assignees } from "@/components/shared";
import { ROLE_LABEL } from "@/lib/labels";

export default function FrontDetailPage() {
  const params = useParams<{ frontId: string }>();
  const state = useAppState();
  const front = frontById(state, params.frontId);

  if (!front) {
    return (
      <Card>
        <EmptyState icon={<Layers />} title="Frente não encontrada" />
      </Card>
    );
  }

  const items = state.backlogItems.filter((i) => i.frontId === front.id);
  const members = state.memberships
    .filter((m) => m.frontId === front.id)
    .map((m) => ({
      member: state.people.find((p) => p.id === m.personId) ?? null,
      role: m.role,
      canEdit: m.canEdit,
    }))
    .filter((x): x is { member: NonNullable<typeof x.member>; role: typeof x.role; canEdit: boolean } => !!x.member);
  const deliveries = state.deliveries.filter((d) => d.frontId === front.id);

  return (
    <div>
      <div className="mb-4">
        <Link href="/frentes" className="text-sm">← Frentes</Link>
        <h1 style={{ marginTop: 6 }}>{front.name}</h1>
        <p className="text-muted mt-1">{front.description}</p>
      </div>

      <div className="widget-grid">
        <Card
          title={`Itens da frente (${items.length})`}
          action={<Link href="/fluxo" className="text-sm">Quadro →</Link>}
        >
          <div className="list">
            {items.length === 0 && <p className="text-muted text-sm">Nenhum item planejado para esta frente.</p>}
            {items.map((item) => (
              <Link key={item.id} href={`/itens/${item.id}`} className="card row-item" style={{ textDecoration: "none" }}>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{item.title}</div>
                  <div className="row-meta mt-1">
                    <TypeBadge type={item.type} />
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                    <Assignees item={item} state={state} />
                  </div>
                </div>
                <DeadlinePill deadline={item.deadline} />
              </Link>
            ))}
          </div>
        </Card>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Membros e responsabilidades">
            <div className="list">
              {members.map(({ member, role, canEdit }) => (
                <div key={member.id} className="card row-item">
                  <Avatar person={member} />
                  <div className="flex-1">
                    <div className="text-sm" style={{ fontWeight: 600 }}>{member.name}</div>
                    <div className="text-xs text-muted">{ROLE_LABEL[role]}</div>
                  </div>
                  <Badge tone={canEdit ? "ok" : "muted"} dot>{canEdit ? "Pode editar" : "Apenas leitura"}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Entregas da frente">
            <div className="list">
              {deliveries.length === 0 && <p className="text-muted text-sm">Nenhuma entrega planejada.</p>}
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="card row-item">
                  <div className="flex-1">
                    <div className="text-sm" style={{ fontWeight: 600 }}>{delivery.title}</div>
                    <div className="text-xs text-muted">{delivery.sprintName}</div>
                  </div>
                  <Badge tone={delivery.status === "entregue" ? "ok" : delivery.status === "em_andamento" ? "warn" : "muted"}>
                    {delivery.status === "entregue" ? "Entregue" : delivery.status === "em_andamento" ? "Em andamento" : "Planejada"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}