import type { AuditEvent, AuditPort } from "../../application/ports/repositories";

export class MemoryAudit implements AuditPort {
  private _events: AuditEvent[] = [];

  async record(event: AuditEvent): Promise<void> {
    this._events.push({ ...event });
  }

  async list(aggregateId?: string): Promise<AuditEvent[]> {
    const filtered = aggregateId
      ? this._events.filter((e) => e.aggregate === aggregateId)
      : [...this._events];
    return filtered
      .map((e) => ({ ...e }))
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  }

  get events(): readonly AuditEvent[] {
    return [...this._events];
  }

  clear(): void {
    this._events = [];
  }
}
