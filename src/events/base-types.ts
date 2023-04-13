import { EventAuditUser } from "./event-types";

/**
 * Supported events for event notifications
 */
export const notificationEventNames = [
  // User
  "user.login",
] as const;

export type NotificationEventName = typeof notificationEventNames[number];

/**
 * Supported resources for event notifications
 */
export const notificationEventResources = [
  "user",
] as const;
export type NotificationEventResource = typeof notificationEventResources[number];

/**
 * Event Notification payload
 */
export type NotificationEventPayload<
  EventName extends NotificationEventName,
  ResourceType extends NotificationEventResource | unknown,
  DataType
> = {
  event: EventName;
  object: ResourceType;
  data: DataType;
  user: EventAuditUser;
};
