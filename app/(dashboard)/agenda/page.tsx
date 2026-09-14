"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, CalendarSync, Info } from "lucide-react";
import { createEvent, setSyncStatus, useAppState, itemById } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import { Badge, Button, Card, Field, Select, TextInput } from "@/components/ui";
import { DeadlinePill, FrontTag } from "@/components/shared";
import { frontById } from "@/lib/store";
import type { EventKind } from "@/lib/types";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function nextDay(targetDayIndex: number, from: Date): Date {
  const d = new Date(from);
  for (let i = 0; i < 14; i++) {
    if (d.getDay() === targetDayIndex) return d;
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function buildWeeklyMeetings(today: Date) {
  const tue = nextDay(2, today);
  const wed = nextDay(3, today);
  return [
    { key: "wk-tue", title: "Reunião de acompanhamento — terça", date: tue, kind: "reuniao-terca" as EventKind },
    { key: "wk-wed", title: "Reunião principal — quarta", date: wed, kind: "reuniao-quarta" as EventKind },
  ];
}

export default function AgendaPage() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:30");
  const [kind, setKind] = useState<EventKind>("evento");
  const [linkedItemId, setLinkedItemId] = useState("");

  const meetings = useMemo(() => buildWeeklyMeetings(new Date()), []);

  const upcoming = state.events
    .filter((e) => e.date >= "2026-09-13")
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const deadlines = state.backlogItems
    .filter((i) => i.deadline && i.status !== "done")
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 8);

  const handleCreate = () => {
    if (!title.trim() || !date) return;
    createEvent({
      title: title.trim(),
      date,
      time: time || "18:30",
      kind,
      sourceItemId: linkedItemId || null,
    });
    setTitle("");
    setDate("");
    setLinkedItemId("");
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between wrap gap-3 mb-4">
        <div>
          <h1>Agenda</h1>
          <p className="text-muted mt-1">Reuniões, prazos e eventos. Integração com Google Calendar é opcional.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <CalendarPlus size={15} /> Criar evento
        </Button>
      </div>

      <div className="alert alert-info mb-4">
        <Info size={16} style={{ flex: "none" }} aria-hidden />
        <span>
          Tarefas com prazo geram lembretes automáticos no chat <strong>PETBSI notificações</strong> via Agendador,
          no formato "A tarefa X falta Y dias para o prazo final.".
        </span>
      </div>

      <div className="widget-grid">
        <Card title="Próximos encontros">
          <div className="agenda-list">
            {meetings.map((m) => (
              <div key={m.key} className="card agenda-item">
                <div className="agenda-date">
                  <span className="day">{m.date.getDate()}</span>
                  <span className="month">{WEEKDAYS[m.date.getDay()]}</span>
                </div>
                <div className="flex-1">
                  <div style={{ fontWeight: 600 }}>{m.title}</div>
                  <div className="text-xs text-muted">{m.date.toLocaleDateString("pt-BR")} às 18:30</div>
                </div>
                {m.kind === "reuniao-quarta" && <Badge tone="warn">Principal</Badge>}
              </div>
            ))}
            {upcoming.map((event) => {
              const item = itemById(state, event.sourceItemId ?? "");
              const month = event.date.split("-")[1];
              const day = event.date.split("-")[2];
              const today = new Date();
              const weekday = WEEKDAYS[new Date(`${event.date}T12:00:00`).getDay()];
              return (
                <div key={event.id} className="card agenda-item">
                  <div className="agenda-date" style={{ background: event.kind === "prazo" ? "var(--danger-soft)" : "var(--info-soft)", color: event.kind === "prazo" ? "var(--danger)" : "var(--info)" }}>
                    <span className="day">{day}</span>
                    <span className="month">{weekday}/{month}</span>
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 600 }}>
                      {item && event.kind === "prazo" ? <Link href={`/itens/${item.id}`}>{event.title}</Link> : event.title}
                    </div>
                    <div className="text-xs text-muted">{formatDate(event.date)} às {event.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.kind === "prazo" && <Badge tone="danger" dot>Prazo</Badge>}
                    <Badge tone={event.syncStatus === "synced" ? "ok" : event.syncStatus === "pending" ? "warn" : "muted"}>
                      {event.syncStatus === "synced" ? "Sincronizado" : event.syncStatus === "pending" ? "Pendente" : "Local"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Sincronizar evento"
                      onClick={() => setSyncStatus(event.id, event.syncStatus === "pending" ? "synced" : "pending")}
                    >
                      <CalendarSync size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          {open && (
            <Card title="Novo evento">
              <div className="flex" style={{ flexDirection: "column", gap: 10 }}>
                <Field label="Título">
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reunião de planejamento" autoFocus />
                </Field>
                <Field label="Tipo">
                  <Select value={kind} onChange={(e) => setKind(e.target.value as EventKind)}>
                    <option value="evento">Evento</option>
                    <option value="reuniao-terca">Reunião de terça</option>
                    <option value="reuniao-quarta">Reunião principal (quarta)</option>
                    <option value="prazo">Prazo de item</option>
                  </Select>
                </Field>
                <div className="overview-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <Field label="Data">
                    <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label="Horário">
                    <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </Field>
                </div>
                <Field label="Vincular item (opcional)">
                  <Select value={linkedItemId} onChange={(e) => setLinkedItemId(e.target.value)}>
                    <option value="">Sem vínculo</option>
                    {state.backlogItems.filter((i) => i.status !== "done").map((i) => (
                      <option key={i.id} value={i.id}>{i.title}</option>
                    ))}
                  </Select>
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={handleCreate}>Salvar evento</Button>
                </div>
              </div>
            </Card>
          )}

          <Card title="Prazos de tarefas" action={<Link href="/backlog" className="text-sm">Backlog</Link>}>
            <div className="list">
              {deadlines.length === 0 && <p className="text-muted text-sm">Nenhum prazo em aberto.</p>}
              {deadlines.map((item) => (
                <Link key={item.id} href={`/itens/${item.id}`} className="card row-item" style={{ textDecoration: "none" }}>
                  <FrontTag front={frontById(state, item.frontId)} />
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{item.title}</div>
                    <div className="text-xs text-muted">{formatDate(item.deadline)}</div>
                  </div>
                  <DeadlinePill deadline={item.deadline} />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}