import { EventAuditUser } from "../src/events/event-types";
import { AuditInterface } from './audit';



export interface ErrorResponse {
  status: 400;
  error: string;
}

export interface ApiRequestLocals {
  apiKey: string;
  eventAudit: EventAuditUser;
  audit: (data: Partial<AuditInterface>) => Promise<void>;
}

export interface ApiErrorResponse {
  message: string;
}

/**
 * In the private API, there is a convention to add `status: number` to all response types.
 */
export interface PrivateApiErrorResponse {
  status: number;
  message: string;
}
