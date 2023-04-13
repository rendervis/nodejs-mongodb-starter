export type EntityType =
  | "user"

export type EventType =
  | "user.create"
  | "user.update"
  | "user.delete"
  | "user.invite"


export interface AuditUserLoggedIn {
  id: string;
  email: string;
  name: string;
}

export interface AuditUserApiKey {
  apiKey: string;
}

export interface AuditInterface {
  id: string;
  user: AuditUserLoggedIn | AuditUserApiKey;
  event: EventType;
  entity: {
    object: EntityType;
    id: string;
    name?: string;
  };
  parent?: {
    object: EntityType;
    id: string;
  };
  reason?: string;
  details?: string;
  dateCreated: Date;
}
