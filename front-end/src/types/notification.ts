export type NotificationType =
  | "new_login"
  | "new_comment"
  | "favorite_added"
  | "system_alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO string
  isRead?: boolean;
  link?: string; // Optional link to navigate to
  actor?: {
    // User who triggered the notification
    name: string;
    avatarUrl?: string;
  };
}