import { describe, expect, it } from "vitest";
import { TelegramMessage, TelegramMessageKind } from "@/domain/integration/telegram-message";
import { DomainError } from "@/domain/shared/domain-error";

describe("TelegramMessage", () => {
  const DEFAULT_CHAT = "PETBSI notificações";

  describe("createPending", () => {
    it("should create pending EVENT message", () => {
      const msg = TelegramMessage.createPending({
        id: "t1",
        chatName: DEFAULT_CHAT,
        kind: "EVENT",
        body: "Item movido",
        eventId: "evt1",
      });
      expect(msg.id).toBe("t1");
      expect(msg.chatName).toBe(DEFAULT_CHAT);
      expect(msg.kind).toBe("EVENT");
      expect(msg.body).toBe("Item movido");
      expect(msg.eventId).toBe("evt1");
      expect(msg.status).toBe("pending");
      expect(msg.createdAt).toBeDefined();
    });

    it("should create pending DEADLINE_REMINDER message", () => {
      const msg = TelegramMessage.createPending({
        id: "t2",
        chatName: DEFAULT_CHAT,
        kind: "DEADLINE_REMINDER",
        body: "A tarefa X falta 5 dias",
        eventId: "evt2",
      });
      expect(msg.kind).toBe("DEADLINE_REMINDER");
      expect(msg.status).toBe("pending");
    });

    it("should allow null eventId", () => {
      const msg = TelegramMessage.createPending({
        id: "t3",
        chatName: DEFAULT_CHAT,
        kind: "EVENT",
        body: "Test",
        eventId: null,
      });
      expect(msg.eventId).toBeNull();
    });

    it("should reject empty chatName (D13 - chat não configurado)", () => {
      expect(() => TelegramMessage.createPending({ id: "t1", chatName: "", kind: "EVENT", body: "Test" })).toThrow(DomainError);
      expect(() => TelegramMessage.createPending({ id: "t1", chatName: "   ", kind: "EVENT", body: "Test" })).toThrow(DomainError);
    });

    it("should reject empty body", () => {
      expect(() => TelegramMessage.createPending({ id: "t1", chatName: DEFAULT_CHAT, kind: "EVENT", body: "" })).toThrow(DomainError);
    });

    it("should reject invalid kind", () => {
      expect(() => TelegramMessage.createPending({ id: "t1", chatName: DEFAULT_CHAT, kind: "INVALID" as TelegramMessageKind, body: "Test" })).toThrow(DomainError);
    });
  });

  describe("markSent", () => {
    it("should mark pending message as sent", () => {
      const msg = TelegramMessage.createPending({ id: "t1", chatName: DEFAULT_CHAT, kind: "EVENT", body: "Test" });
      msg.markSent();
      expect(msg.status).toBe("sent");
    });

    it("should reject marking non-pending as sent", () => {
      const msg = TelegramMessage.createPending({ id: "t1", chatName: DEFAULT_CHAT, kind: "EVENT", body: "Test" });
      msg.markSent();
      expect(() => msg.markSent()).toThrow(DomainError);
    });
  });

  describe("markFailed", () => {
    it("should mark pending message as failed (D14 - preserva vínculo)", () => {
      const msg = TelegramMessage.createPending({ id: "t1", chatName: DEFAULT_CHAT, kind: "EVENT", body: "Test", eventId: "evt1" });
      msg.markFailed();
      expect(msg.status).toBe("failed");
      expect(msg.eventId).toBe("evt1"); // D14: preserva vínculo com o evento
    });

    it("should reject marking non-pending as failed", () => {
      const msg = TelegramMessage.createPending({ id: "t1", chatName: DEFAULT_CHAT, kind: "EVENT", body: "Test" });
      msg.markFailed();
      expect(() => msg.markFailed()).toThrow(DomainError);
    });
  });

  describe("formatDeadlineReminder (D17)", () => {
    it("should format 'falta Y dias' for future deadline", () => {
      const result = TelegramMessage.formatDeadlineReminder("Quadro Kanban", 5);
      expect(result).toBe("A tarefa Quadro Kanban falta 5 dias para o prazo final.");
    });

    it("should format 'vence hoje' for today (D17)", () => {
      const result = TelegramMessage.formatDeadlineReminder("Entrega Final", 0);
      expect(result).toBe("A tarefa Entrega Final vence hoje.");
    });

    it("should reject empty title", () => {
      expect(() => TelegramMessage.formatDeadlineReminder("", 5)).toThrow(DomainError);
    });

    it("should reject negative days", () => {
      expect(() => TelegramMessage.formatDeadlineReminder("Test", -1)).toThrow(DomainError);
    });
  });

  describe("createDeadlineReminder (D16)", () => {
    it("should create DEADLINE_REMINDER when deadline provided", () => {
      const msg = TelegramMessage.createDeadlineReminder({
        id: "t1",
        titulo: "Quadro Kanban",
        dias: 5,
        deadline: "2026-09-18",
      });
      expect(msg).not.toBeNull();
      expect(msg!.kind).toBe("DEADLINE_REMINDER");
      expect(msg!.body).toBe("A tarefa Quadro Kanban falta 5 dias para o prazo final.");
      expect(msg!.chatName).toBe(DEFAULT_CHAT);
    });

    it("should return null when deadline is null (D16 - só gera se deadline != null)", () => {
      const msg = TelegramMessage.createDeadlineReminder({
        id: "t1",
        titulo: "Sem prazo",
        dias: 5,
        deadline: null,
      });
      expect(msg).toBeNull();
    });

    it("should return null when deadline is undefined", () => {
      const msg = TelegramMessage.createDeadlineReminder({
        id: "t1",
        titulo: "Sem prazo",
        dias: 5,
        deadline: undefined as any,
      });
      expect(msg).toBeNull();
    });

    it("should use 'vence hoje' when days is 0", () => {
      const msg = TelegramMessage.createDeadlineReminder({
        id: "t1",
        titulo: "Entrega Hoje",
        dias: 0,
        deadline: "2026-09-13",
      });
      expect(msg!.body).toBe("A tarefa Entrega Hoje vence hoje.");
    });
  });
});