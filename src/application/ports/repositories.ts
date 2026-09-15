import type { BacklogItem } from "../../domain/backlog/backlog-item";
import type { Sprint } from "../../domain/sprint/sprint";
import type { ProjectMembership } from "../../domain/project/project-membership";

export interface AuditEvent {
  actorId: string;
  action: string;
  aggregate: string;
  at: string;
}

export interface BacklogRepository {
  load(id: string): Promise<BacklogItem | null>;
  save(item: BacklogItem): Promise<void>;
  listByProject(projectId: string): Promise<BacklogItem[]>;
}

export interface SprintRepository {
  load(id: string): Promise<Sprint | null>;
  save(sprint: Sprint): Promise<void>;
  listActive(): Promise<Sprint[]>;
}

export interface MembershipRepository {
  load(id: string): Promise<ProjectMembership | null>;
  save(membership: ProjectMembership): Promise<void>;
  listAll(): Promise<ProjectMembership[]>;
}

export interface AuditPort {
  record(event: AuditEvent): Promise<void>;
  list(aggregateId?: string): Promise<AuditEvent[]>;
}

export type IdGenerator = (prefix: string) => string;

export type Clock = () => string;

export function defaultIdGenerator(): IdGenerator {
  let counter = 0;
  return (prefix: string) => {
    counter += 1;
    const rand = Math.random().toString(36).slice(2, 9);
    return `${prefix}_${counter}_${rand}`;
  };
}

export function defaultClock(): Clock {
  return () => new Date().toISOString();
}
