
import { NotificationEventPayload } from "./base-types";
import { UserLoginAuditableProperties } from "./event-types";

// region User

export type UserLoginNotificationEvent = NotificationEventPayload<
  "user.login",
  "user",
  {
    current: UserLoginAuditableProperties;
  }
>;

// end region User



/**
 * All supported event types in the database
 */
export type NotificationEvent =
  | UserLoginNotificationEvent

