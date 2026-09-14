"use client";

import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { useAppState } from "@/lib/store";
import { Avatar, Card, EmptyState } from "@/components/ui";
import { Badge } from "@/components/ui";

export default function FrentesPage() {
  const state = useAppState();

  return (
    <div>
      <div className="mb-4">
        <h1>Frentes de trabalho</h1>
        <p className="text-muted mt-1">Cada frente concentra seus planos, responsáveis e entregas.</p>
      </div>

      <div className="overview-grid">
        {state.fronts.map((front) => {
          const items = state.backlogItems.filter((i) => i.frontId === front.id);
          const open = items.filter((i) => i.status !== "done").length;
          const done = items.filter((i) => i.status === "done").length;
          const members = state.memberships
            .filter((m) => m.frontId === front.id)
            .map((m) => state.people.find((p) => p.id === m.personId) ?? null)
            .filter((p): p is NonNullable<typeof p> => !!p);
          const deliveries = state.deliveries.filter((d) => d.frontId === front.id);
          const blockers = items.filter((i) => i.status === "blocked").length;

          return (
            <Link key={front.id} href={`/frentes/${front.id}`} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <span className="badge" style={{ background: `${front.color}14`, color: front.color }}>
                    <span className="dot" style={{ background: front.color }} aria-hidden />
                    {front.name}
                  </span>
                  <ArrowRight size={16} className="text-muted" aria-hidden />
                </div>
                <p className="text-sm text-soft mt-2">{front.description}</p>
                <div className="row-meta mt-3">
                  <Badge tone="info">{open} em aberto</Badge>
                  <Badge tone="ok">{done} concluídos</Badge>
                  {blockers > 0 && <Badge tone="danger">{blockers} bloqueado(s)</Badge>}
                  <Badge tone="muted">{deliveries.length} entrega(s)</Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="avatar-stack">
                    {members.map((m) => (
                      <Avatar key={m.id} person={m} />
                    ))}
                  </span>
                  <span className="text-xs text-muted">{items.length} itens</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {state.fronts.length === 0 && (
        <Card><EmptyState icon={<Layers />} title="Nenhuma frente configurada" /></Card>
      )}
    </div>
  );
}