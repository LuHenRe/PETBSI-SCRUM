"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Flag, Pencil, Target } from "lucide-react";
import { closeSprint, updateSprintGoal, useAppState } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import { Badge, Button, Card, EmptyState, TextArea } from "@/components/ui";
import { Assignees, DeadlinePill, FrontTag, StatusBadge, TypeBadge } from "@/components/shared";
import { frontById } from "@/lib/store";

const DONE_CRITERIA = [
  "Item com descrição, frente e responsáveis definidos.",
  "Código/documento concluído e revisado pela dupla.",
  "Prazo registrado quando aplicável.",
  "Histórico de fluxo atualizado no quadro Kanban.",
  "Entrega vinculada quando o item compõe uma entrega.",
];

export default function SprintPage() {
  const state = useAppState();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");

  const active = state.sprints.find((s) => s.status === "active");
  const others = state.sprints.filter((s) => s.status !== "active");

  const activeItems = active ? state.backlogItems.filter((i) => active.itemIds.includes(i.id)) : [];
  const doneCount = activeItems.filter((i) => i.status === "done").length;
  const progress = activeItems.length ? Math.round((doneCount / activeItems.length) * 100) : 0;

  const beginGoalEdit = () => {
    if (!active) return;
    setGoalDraft(active.goal);
    setEditingGoal(true);
  };

  const saveGoal = () => {
    if (active && goalDraft.trim()) updateSprintGoal(active.id, goalDraft.trim());
    setEditingGoal(false);
  };

  if (!active) {
    return (
      <Card>
        <EmptyState
          icon={<Target />}
          title="Nenhuma Sprint ativa"
          description="Não há Sprint em andamento neste momento."
        />
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1>Sprint atual — {active.name}</h1>
        <p className="text-muted mt-1">
          {formatDate(active.startDate)} a {formatDate(active.endDate)}
        </p>
      </div>

      <Card className="mb-6">
        <div className="card-title">
          <h2>Meta da Sprint</h2>
          {!editingGoal && (
            <Button variant="ghost" size="sm" onClick={beginGoalEdit}>
              <Pencil size={14} /> Editar meta
            </Button>
          )}
        </div>
        {editingGoal ? (
          <div className="mt-3">
            <TextArea value={goalDraft} onChange={(e) => setGoalDraft(e.target.value)} aria-label="Meta da Sprint" />
            <div className="flex gap-2 mt-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingGoal(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={saveGoal}>Salvar meta</Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-soft">{active.goal}</p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <div className="progress flex-1">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm" style={{ fontWeight: 700 }}>{doneCount}/{activeItems.length} concluídos ({progress}%)</span>
        </div>
      </Card>

      <div className="widget-grid">
        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card
            title="Sprint Backlog"
            action={<Link href="/fluxo" className="text-sm">Abrir quadro →</Link>}
          >
            <div className="list">
              {activeItems.length === 0 && (
                <EmptyState
                  icon={<ArrowRight />}
                  title="Sprint sem itens"
                  description="Selecione itens do Product Backlog para a Sprint."
                  action={<Link href="/backlog" className="btn btn-primary btn-sm">Ir para o backlog</Link>}
                />
              )}
              {activeItems.map((item) => (
                <Link key={item.id} href={`/itens/${item.id}`} className="card row-item" style={{ textDecoration: "none" }}>
                  <FrontTag front={frontById(state, item.frontId)} truncate />
                  <div className="flex-1" style={{ minWidth: 180 }}>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{item.title}</div>
                    <div className="row-meta mt-1">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                      <Assignees item={item} state={state} />
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <DeadlinePill deadline={item.deadline} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Sprints anteriores e planejadas">
            <div className="list">
              {others.map((sprint) => {
                const items = state.backlogItems.filter((i) => sprint.itemIds.includes(i.id));
                return (
                  <div key={sprint.id} className="card row-item">
                    <Badge tone={sprint.status === "planned" ? "info" : "muted"} dot>
                      {sprint.status === "planned" ? "Planejada" : "Encerrada"}
                    </Badge>
                    <div className="flex-1" style={{ minWidth: 160 }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{sprint.name}</div>
                      <div className="text-xs text-muted">
                        {formatDate(sprint.startDate)} a {formatDate(sprint.endDate)} · {items.length} itens
                      </div>
                    </div>
                    <span className="text-xs text-muted" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sprint.goal}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Definição de Pronto">
            <div className="list">
              {DONE_CRITERIA.map((criterion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 size={15} style={{ color: "var(--success)", flex: "none" }} aria-hidden />
                  <span className="text-sm">{criterion}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Ações da Sprint">
            <div className="flex" style={{ flexDirection: "column", gap: 8 }}>
              <Link href="/fluxo" className="btn btn-primary w-full">
                <Flag size={15} /> Acompanhar fluxo Kanban
              </Link>
              <Link href="/backlog" className="btn btn-secondary w-full">
                Planejar / adaptar itens
              </Link>
              <Button variant="danger" className="w-full" onClick={() => closeSprint(active.id)}>
                Encerrar {active.name}
              </Button>
              <p className="text-xs text-muted">Encerrar a Sprint encerra o acompanhamento ativo na demonstração.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}