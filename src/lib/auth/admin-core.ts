export type TrustedAdmin = {
  id: string;
  email: string;
  name: string;
};

export type AdminAuthorizationFailure =
  | "unauthenticated"
  | "deleted"
  | "inactive"
  | "stale"
  | "unavailable";

export class AdminAuthorizationError extends Error {
  constructor(public readonly reason: AdminAuthorizationFailure) {
    super("Administrator authorization failed.");
    this.name = "AdminAuthorizationError";
  }
}

export type AdminSessionHint = {
  user?: {
    id?: unknown;
    sessionVersion?: unknown;
  } | null;
} | null;

export type RevalidationAdmin = TrustedAdmin & {
  sessionVersion: number;
  isActive: boolean;
};

export type FindAdminById = (id: string) => Promise<RevalidationAdmin | null>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function revalidateAdminSession(
  session: AdminSessionHint,
  findAdminById: FindAdminById
): Promise<TrustedAdmin> {
  const id = session?.user?.id;
  const sessionVersion = session?.user?.sessionVersion;

  if (
    typeof id !== "string" ||
    !UUID_PATTERN.test(id) ||
    typeof sessionVersion !== "number" ||
    !Number.isSafeInteger(sessionVersion) ||
    sessionVersion < 1
  ) {
    throw new AdminAuthorizationError("unauthenticated");
  }

  let admin: RevalidationAdmin | null;
  try {
    admin = await findAdminById(id);
  } catch {
    throw new AdminAuthorizationError("unavailable");
  }

  if (!admin) throw new AdminAuthorizationError("deleted");
  if (!admin.isActive) throw new AdminAuthorizationError("inactive");
  if (admin.sessionVersion !== sessionVersion) throw new AdminAuthorizationError("stale");

  return { id: admin.id, email: admin.email, name: admin.name };
}

export const GENERIC_API_AUTHORIZATION_FAILURE = {
  status: 401 as const,
  body: { error: "Unauthorized" } as const,
};

export function getApiAuthorizationFailure() {
  return GENERIC_API_AUTHORIZATION_FAILURE;
}
