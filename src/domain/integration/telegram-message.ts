import { DomainError } from "../shared/domain-error";

export type TelegramMessageKind = "EVENT" | "DEADLINE_REMINDER";
export type TelegramMessageStatus = "pending" | "sent" | "failed";

export const DEFAULT_CHAT_NAME = "PETBSI notificações";

export class TelegramMessage {
  readonly id: string;
  readonly chatName: string;
  readonly kind: TelegramMessageKind;
  readonly body: string;
  readonly eventId: string | null;
  readonly createdAt: string;
  private _status: TelegramMessageStatus;

  private constructor(draft: {
    id: string;
    chatName: string;
    kind: TelegramMessageKind;
    body: string;
    eventId: string | null;
    createdAt: string;
    status: TelegramMessageStatus;
  }) {
    this.id = draft.id;
    this.chatName = draft.chatName;
    this.kind = draft.kind;
    this.body = draft.body;
    this.eventId = draft.eventId;
    this.createdAt = draft.createdAt;
    this._status = draft.status;
    // Entity - Object.freeze removed intentionally
  }

  static createPending(draft: {
    id: string;
    chatName: string;
    kind: TelegramMessageKind;
    body: string;
    eventId?: string | null;
    createdAt?: string;
  }): TelegramMessage {
    const chatName = draft.chatName.trim();
    if (!chatName) {
      throw new DomainError("Chat não configurado: defina o chat 'PETBSI notificações'");
    }
    const body = draft.body.trim();
    if (!body) {
      throw new DomainError("Corpo da mensagem não pode ser vazio");
    }
    if (draft.kind !== "EVENT" && draft.kind !== "DEADLINE_REMINDER") {
      throw new DomainError(`Tipo de mensagem inválido: ${draft.kind}`);
    }
    return new TelegramMessage({
      id: draft.id,
      chatName,
      kind: draft.kind,
      body,
      eventId: draft.eventId ?? null,
      createdAt: draft.createdAt ?? new Date().toISOString(),
      status: "pending",
    });
  }

  get status(): TelegramMessageStatus {
    return this._status;
  }

  markSent(): void {
    if (this._status !== "pending") {
      throw new DomainError(`Não é possível marcar como enviada: status atual é ${this._status}`);
    }
    this._status = "sent";
  }

  markFailed(): void {
    if (this._status !== "pending") {
      throw new DomainError(`Não é possível marcar como falha: status atual é ${this._status}`);
    }
    this._status = "failed";
  }

  static formatDeadlineReminder(titulo: string, dias: number): string {
    const title = titulo.trim();
    if (!title) {
      throw new DomainError("Título da tarefa inválido");
    }
    if (!Number.isInteger(dias) || dias < 0) {
      throw new DomainError(`Dias restantes inválidos: ${dias}`);
    }
    if (dias === 0) {
      return `A tarefa ${title} vence hoje.`;
    }
    return `A tarefa ${title} falta ${dias} dias para o prazo final.`;
  }

  static createDeadlineReminder(draft: {
    id: string;
    titulo: string;
    dias: number;
    deadline: string | null | undefined;
    createdAt?: string;
  }): TelegramMessage | null {
    if (!draft.deadline || draft.deadline.trim() === "") {
      return null;
    }
    const body = TelegramMessage.formatDeadlineReminder(draft.titulo, draft.dias);
    return TelegramMessage.createPending({
      id: draft.id,
      chatName: DEFAULT_CHAT_NAME,
      kind: "DEADLINE_REMINDER",
      body,
      createdAt: draft.createdAt,
    });
  }
}