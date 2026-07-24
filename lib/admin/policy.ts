export const ADMIN_ROLES = [
  "information_entry",
  "review_publisher",
  "operations_admin",
  "system_owner",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminCapability =
  | "admin:access"
  | "event:read"
  | "event:create"
  | "event:review_publish"
  | "event:operate"
  | "admin:manage";

const ROLE_CAPABILITIES: Record<AdminRole, readonly AdminCapability[]> = {
  information_entry: ["admin:access", "event:read", "event:create"],
  review_publisher: ["admin:access", "event:read", "event:review_publish"],
  operations_admin: ["admin:access", "event:read", "event:create", "event:operate"],
  system_owner: [
    "admin:access",
    "event:read",
    "event:create",
    "event:review_publish",
    "event:operate",
    "admin:manage",
  ],
};

export function hasAdminCapability(
  roles: readonly AdminRole[],
  capability: AdminCapability
): boolean {
  return roles.some((role) => ROLE_CAPABILITIES[role].includes(capability));
}
/** 旧管理员字段只用于只读兼容；新授权以 membership roles 为准。 */
export function legacyRoles(isAdmin: boolean, isSuperAdmin: boolean): AdminRole[] {
  if (isSuperAdmin) return ["system_owner"];
  if (isAdmin) return ["information_entry"];
  return [];
}

export function sanitizeEventCreateInput(input: Record<string, unknown>) {
  const protectedFields = new Set([
    "id",
    "created_by",
    "review_status",
    "reviewed_by",
    "published_at",
    "published_revision_id",
    "is_featured",
    "is_anirox",
    "created_at",
    "updated_at",
  ]);

  return Object.fromEntries(
    Object.entries(input).filter(([key]) => !protectedFields.has(key))
  );
}

export function canTriggerReviewNotification(input: {
  actorId: string;
  eventCreatorId: string | null;
  reviewStatus: string | null;
  roles: readonly AdminRole[];
}): boolean {
  return input.actorId === input.eventCreatorId
    && input.reviewStatus === "pending"
    && hasAdminCapability(input.roles, "admin:access");
}

export function canMarkNotificationRead(actorId: string, notificationOwnerId: string): boolean {
  return actorId === notificationOwnerId;
}
