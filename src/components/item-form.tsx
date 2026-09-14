"use client";

import { useEffect, useState } from "react";
import { Button, Field, Modal, Select, TextArea, TextInput } from "@/components/ui";
import { useAppState } from "@/lib/store";
import type { BacklogItem, BacklogItemType, BacklogPriority } from "@/lib/types";
import { TYPE_LABEL, PRIORITY_LABEL, ROLE_LABEL } from "@/lib/labels";

export interface ItemDraft {
  title: string;
  type: BacklogItemType;
  description: string;
  frontId: string;
  priority: BacklogPriority;
  value: BacklogItem["value"];
  sprintId: string | null;
  assigneeIds: string[];
  deadline: string | null;
}

interface Props {
  open: boolean;
  initial: ItemDraft | null;
  onClose: () => void;
  onSave: (draft: ItemDraft) => void;
}

export function ItemFormModal({ open, initial, onClose, onSave }: Props) {
  const state = useAppState();
  const [draft, setDraft] = useState<ItemDraft>(() => empty(initial));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(empty(initial));
      setError(null);
    }
  }, [open, initial]);

  const set = <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleAssignee = (personId: string) =>
    setDraft((d) => ({
      ...d,
      assigneeIds: d.assigneeIds.includes(personId)
        ? d.assigneeIds.filter((id) => id !== personId)
        : [...d.assigneeIds, personId],
    }));

  const handleSave = () => {
    if (draft.title.trim().length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }
    if (!draft.frontId) {
      setError("Selecione a frente de trabalho.");
      return;
    }
    onSave(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={initial ? "Editar item" : "Novo item do backlog"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>{initial ? "Salvar alterações" : "Criar item"}</Button>
        </>
      }
    >
      {error && <p className="alert alert-danger">{error}</p>}

      <Field label="Título">
        <TextInput value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Protótipo do Tutor Virtual" autoFocus />
      </Field>

      <Field label="Descrição">
        <TextArea value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Objetivo e critérios de pronto do item." />
      </Field>

      <div className="overview-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Frente">
          <Select value={draft.frontId} onChange={(e) => set("frontId", e.target.value)}>
            <option value="">Selecione...</option>
            {state.fronts.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo">
          <Select value={draft.type} onChange={(e) => set("type", e.target.value as BacklogItemType)}>
            {(Object.keys(TYPE_LABEL) as BacklogItemType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Prioridade">
          <Select value={draft.priority} onChange={(e) => set("priority", e.target.value as BacklogPriority)}>
            {(Object.keys(PRIORITY_LABEL) as BacklogPriority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Valor">
          <Select value={draft.value} onChange={(e) => set("value", e.target.value as BacklogItem["value"])}>
            <option value="PQ">Produto do projeto (PQ)</option>
            <option value="M">Melhoria (M)</option>
            <option value="S">Supérfluo (S)</option>
          </Select>
        </Field>
        <Field label="Sprint" hint="Opcional. Itens sem Sprint permanecem no Product Backlog.">
          <Select value={draft.sprintId ?? ""} onChange={(e) => set("sprintId", e.target.value || null)}>
            <option value="">Sem Sprint</option>
            {state.sprints.filter((s) => s.status !== "closed").map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.status === "active" ? "ativa" : "planejada"}</option>
            ))}
          </Select>
        </Field>
        <Field label="Prazo">
          <TextInput type="date" value={draft.deadline ?? ""} onChange={(e) => set("deadline", e.target.value || null)} />
        </Field>
      </div>

      <Field label="Responsáveis">
        <div className="list mt-1">
          {state.people.map((person) => {
            const membership = state.memberships.find((m) => m.personId === person.id);
            const checked = draft.assigneeIds.includes(person.id);
            return (
              <label key={person.id} className="flex items-center gap-2" style={{ fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAssignee(person.id)}
                  aria-label={`Responsável: ${person.name}`}
                />
                <span style={{ flex: 1 }}>{person.name}</span>
                <span className="text-xs text-muted">{membership ? ROLE_LABEL[membership.role] : ""}</span>
              </label>
            );
          })}
        </div>
      </Field>
    </Modal>
  );
}

function empty(initial: ItemDraft | null): ItemDraft {
  return initial ?? {
    title: "",
    type: "documento",
    description: "",
    frontId: "",
    priority: "media",
    value: "M",
    sprintId: null,
    assigneeIds: [],
    deadline: null,
  };
}