"use client";

import { useState } from "react";
import { Eye, Mail, MessageSquareText, Send } from "lucide-react";
import { sendNotification, sendTelegram, useAppState } from "@/lib/store";
import { formatDate } from "@/lib/seed";
import { Button, Card, EmptyState, Field, TextArea, TextInput } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/labels";

export default function NotificacoesPage() {
  const state = useAppState();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const selectAll = () => setSelected(state.people.map((p) => p.id));

  const handleSend = async () => {
    if (!subject.trim() || !body.trim() || selected.length === 0) return;
    setSending(true);
    await sendNotification({ subject: subject.trim(), body: body.trim(), recipientIds: selected });
    setSending(false);
    setSent("E-mail enviado e registrado no histórico.");
    setSubject("");
    setBody("");
    setSelected([]);
    setPreview(false);
    window.setTimeout(() => setSent(null), 4000);
  };

  const recipients = state.people.filter((p) => selected.includes(p.id));

  return (
    <div>
      <div className="mb-4">
        <h1>Notificações</h1>
        <p className="text-muted mt-1">Redija, revise e envie e-mails; acompanhe o histórico e o canal do Telegram.</p>
      </div>

      {sent && <div className="alert alert-ok mb-4" role="status">{sent}</div>}

      <div className="widget-grid">
        <Card
          title="Redigir notificação (Gmail)"
          action={
            <>
              <Button size="sm" variant="ghost" onClick={() => setPreview((p) => !p)}>
                <Eye size={14} /> {preview ? "Editar" : "Prévia"}
              </Button>
            </>
          }
        >
          {!preview ? (
            <>
              <div className="flex" style={{ flexDirection: "column", gap: 12 }}>
                <Field label="Destinatários" hint={`${selected.length} pessoa(s) selecionada(s)`}>
                  <div className="list">
                    <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={selectAll}>
                      Selecionar todos
                    </button>
                    {state.people.map((person) => {
                      const membership = state.memberships.find((m) => m.personId === person.id);
                      return (
                        <label key={person.id} className="flex items-center gap-2" style={{ fontSize: 13 }}>
                          <input type="checkbox" checked={selected.includes(person.id)} onChange={() => toggle(person.id)} />
                          <span style={{ flex: 1 }}>{person.name}</span>
                          <span className="text-xs text-muted">{membership ? ROLE_LABEL[membership.role] : ""}</span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Assunto">
                  <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto do e-mail" />
                </Field>
                <Field label="Mensagem">
                  <TextArea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Corpo da mensagem..." />
                </Field>
                <div className="flex justify-end">
                  <Button variant="primary" loading={sending} disabled={!subject.trim() || !body.trim() || selected.length === 0} onClick={handleSend}>
                    <Send size={15} /> Enviar e-mail
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ borderColor: "var(--border)" }}>
              <div className="card-body" style={{ background: "var(--surface-2)" }}>
                <div className="text-xs text-muted">Para: {recipients.length ? recipients.map((r) => r.name).join(", ") : "Nenhum destinatário selecionado"}</div>
                <h3 className="mt-2">{subject || "(sem assunto)"}</h3>
                <p className="text-sm mt-2" style={{ whiteSpace: "pre-wrap" }}>{body || "(mensagem vazia)"}</p>
              </div>
              <div className="card-footer">
                <Button variant="primary" size="sm" disabled>
                  <Send size={14} /> Enviar
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="flex" style={{ flexDirection: "column", gap: 16 }}>
          <Card title="Canal Telegram">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquareText size={15} aria-hidden />
              <strong>PETBSI notificações</strong>
              <span className="badge badge-ok">Conectado</span>
            </div>
            <div className="list">
              {state.telegramMessages.slice(0, 5).map((m) => (
                <div key={m.id} className="card row-item">
                  <div className="flex-1">
                    <div className="text-sm">{m.body}</div>
                    <div className="text-xs text-muted mt-1">
                      {m.kind === "DEADLINE_REMINDER" ? "Lembrete de prazo" : "Evento"} · {formatDate(m.createdAt.slice(0, 10))}
                    </div>
                  </div>
                  <span className="badge badge-ok">{m.status === "sent" ? "Enviada" : "Pendente"}</span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary btn-sm mt-2"
              onClick={() => sendTelegram("EVENT", "Teste de conexão do bot no chat PETBSI notificações.")}
            >
              Enviar teste de conexão
            </button>
          </Card>

          <Card title="Histórico de envios (Gmail)">
            {state.notifications.length === 0 ? (
              <EmptyState icon={<Mail />} title="Sem enviados" description="Os e-mails enviados aparecerão aqui." />
            ) : (
              <div className="list">
                {state.notifications.map((n) => (
                  <div key={n.id} className="card row-item">
                    <Mail size={16} style={{ color: "var(--primary)", flex: "none" }} aria-hidden />
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{n.subject}</div>
                      <div className="text-xs text-muted">
                        {n.recipients.length} destinatário(s) · {formatDate(n.createdAt)}
                      </div>
                    </div>
                    <span className={`badge ${n.status === "sent" ? "badge-ok" : n.status === "failed" ? "badge-danger" : "badge-warn"}`}>
                      {n.status === "sent" ? "Enviado" : n.status === "failed" ? "Falhou" : "Cancelado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}